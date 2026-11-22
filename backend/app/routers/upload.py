"""
File upload routes
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
import base64
from pathlib import Path
import io
from app import auth

# Try to import PIL, but make it optional
try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

router = APIRouter()

# NOTE: Serverless platforms (Vercel) have a read-only, ephemeral filesystem, so
# logos are resized and stored inline in the database as base64 data URLs.

# Allowed image types
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    ext = Path(filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS

@router.post("/logo")
async def upload_logo(
    file: UploadFile = File(...),
    current_user = Depends(auth.get_current_user)
):
    """Upload a logo image file"""
    
    # Validate file extension
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    try:
        # Read file content
        contents = await file.read()
        
        # Check file size
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        # Validate and process image (if PIL is available)
        if PIL_AVAILABLE:
            try:
                image = Image.open(io.BytesIO(contents))
                # Convert to RGB if necessary (handles RGBA, P, etc.)
                if image.mode in ('RGBA', 'LA', 'P'):
                    rgb_image = Image.new('RGB', image.size, (255, 255, 255))
                    if image.mode == 'P':
                        image = image.convert('RGBA')
                    rgb_image.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                    image = rgb_image
                elif image.mode != 'RGB':
                    image = image.convert('RGB')
                
                # Resize if too large (max 500px width/height while maintaining aspect ratio)
                max_size = 400
                if image.width > max_size or image.height > max_size:
                    image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                
                # Encode the processed image in memory
                buffer = io.BytesIO()
                image.save(buffer, 'JPEG', quality=80, optimize=True)
                contents = buffer.getvalue()
                mime_type = 'image/jpeg'
                
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid image file: {str(e)}"
                )
        else:
            # If PIL is not available, just save the file as-is
            # Basic validation: check magic bytes
            if contents.startswith(b'\xff\xd8'):
                mime_type = 'image/jpeg'
            elif contents.startswith(b'\x89PNG'):
                mime_type = 'image/png'
            elif contents.startswith(b'GIF'):
                mime_type = 'image/gif'
            elif contents.startswith(b'RIFF') and b'WEBP' in contents[:20]:
                mime_type = 'image/webp'
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="File does not appear to be a valid image."
                )
        
        logo_url = f"data:{mime_type};base64,{base64.b64encode(contents).decode('ascii')}"
        
        return JSONResponse({
            "logo_url": logo_url,
            "filename": file.filename
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )
