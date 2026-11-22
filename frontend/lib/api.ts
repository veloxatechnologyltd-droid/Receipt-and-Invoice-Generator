/**
 * API client for backend communication
 */
import axios from 'axios'

// In production (single Vercel project) the API is served from the same domain
// under /api, so the base URL is empty. For local dev it defaults to the FastAPI
// server; override either with NEXT_PUBLIC_API_URL.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000')

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

/** Resolve a stored asset URL (data URL, absolute URL, or API-relative path). */
export function resolveAssetUrl(url: string): string {
  if (url.startsWith('data:') || url.startsWith('http')) return url
  return `${API_BASE_URL}${url}`
}

export default api
