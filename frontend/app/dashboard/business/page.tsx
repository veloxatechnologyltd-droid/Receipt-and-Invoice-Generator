'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api, { resolveAssetUrl } from '@/lib/api'
import { CURRENCIES, DEFAULT_CURRENCY } from '@/lib/currency'
import '../dashboard.css'

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'India',
  'Nigeria',
  'South Africa',
  'Kenya',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Netherlands',
  'Sweden',
  'Switzerland',
  'Ireland',
  'Poland',
  'Portugal',
  'Brazil',
  'Mexico',
  'Argentina',
  'Japan',
  'China',
  'Singapore',
  'United Arab Emirates',
  'Saudi Arabia',
  'New Zealand',
  'Philippines',
  'Indonesia',
  'Vietnam',
  'Thailand',
  'Malaysia',
  'Pakistan',
  'Bangladesh',
  'Sri Lanka',
  'Ghana',
  'Egypt',
  'Morocco',
  'Tanzania',
  'Uganda',
  'Other'
]

export default function BusinessPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [business, setBusiness] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    currency: DEFAULT_CURRENCY,
    phone: '',
    email: '',
    website: '',
    tax_id: '',
    logo_url: ''
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    loadBusiness()
  }, [])

  const loadBusiness = async () => {
    try {
      const res = await api.get('/api/business/')
      setBusiness(res.data)
      if (res.data.logo_url) {
        setLogoPreview(resolveAssetUrl(res.data.logo_url))
      }
    } catch (err) {
      // Business doesn't exist yet
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (PNG, JPG, GIF, or WebP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setUploadingLogo(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await api.post('/api/upload/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const logoUrl = resolveAssetUrl(res.data.logo_url)
      setBusiness({ ...business, logo_url: res.data.logo_url })
      setLogoPreview(logoUrl)
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to upload logo')
    } finally {
      setUploadingLogo(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await api.post('/api/business/', business)
      alert('Business profile saved successfully!')
      router.push('/dashboard')
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save business profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setBusiness({ ...business, [field]: value })
  }

  if (loading) return null

  return (
    <div className="page-header-simple">
      <div className="header-text">
        <h1>Business Profile</h1>
        <p>Set up your professional identity for receipts and invoices.</p>
      </div>

      <div className="form-card-premium">
        <form onSubmit={handleSubmit} className="premium-form">
          <div className="form-section-title">Identity & Branding</div>
          
          <div className="logo-upload-zone">
            <div className="logo-preview-container">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="logo-img" />
              ) : (
                <div className="logo-placeholder">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
              )}
            </div>
            <div className="logo-controls">
              <label className="upload-btn">
                {uploadingLogo ? 'Uploading...' : 'Upload Brand Logo'}
                <input type="file" hidden onChange={handleLogoUpload} accept="image/*" />
              </label>
              {logoPreview && (
                <button type="button" className="remove-logo-link" onClick={() => {
                  setLogoPreview(null)
                  setBusiness({ ...business, logo_url: '' })
                }}>Remove Logo</button>
              )}
              <p className="upload-hint">PNG, JPG or WebP. Max 5MB.</p>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group-premium">
              <label>Business Name *</label>
              <input type="text" value={business.name} onChange={(e) => handleChange('name', e.target.value)} required placeholder="SpaceX" />
            </div>
            <div className="form-group-premium">
              <label>Tax ID / EIN</label>
              <input type="text" value={business.tax_id} onChange={(e) => handleChange('tax_id', e.target.value)} placeholder="Optional" />
            </div>
          </div>

          <div className="form-section-title">Location & Contact</div>
          
          <div className="form-group-premium full-width">
            <label>Street Address *</label>
            <input type="text" value={business.address} onChange={(e) => handleChange('address', e.target.value)} required placeholder="Rocket Road" />
          </div>

          <div className="form-grid-4">
            <div className="form-group-premium">
              <label>City *</label>
              <input type="text" value={business.city} onChange={(e) => handleChange('city', e.target.value)} required placeholder="Hawthorne" />
            </div>
            <div className="form-group-premium">
              <label>State *</label>
              <input type="text" value={business.state} onChange={(e) => handleChange('state', e.target.value)} required placeholder="CA" />
            </div>
            <div className="form-group-premium">
              <label>ZIP Code *</label>
              <input type="text" value={business.zip_code} onChange={(e) => handleChange('zip_code', e.target.value)} required placeholder="90250" />
            </div>
            <div className="form-group-premium">
              <label>Country *</label>
              <input
                type="text"
                value={business.country}
                onChange={(e) => handleChange('country', e.target.value)}
                required
                placeholder="United States"
                list="country-options"
              />
              <datalist id="country-options">
                {COUNTRIES.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group-premium">
              <label>Currency *</label>
              <select
                value={business.currency || DEFAULT_CURRENCY}
                onChange={(e) => handleChange('currency', e.target.value)}
                required
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group-premium">
              <label>Phone Number</label>
              <input type="tel" value={business.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+233 20 123 4567" />
            </div>
            <div className="form-group-premium">
              <label>Business Email</label>
              <input type="email" value={business.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="billing@example.com" />
            </div>
          </div>

          <div className="form-actions-premium">
            <button type="submit" className="save-btn-premium" disabled={saving}>
              {saving ? 'Saving...' : 'Save Professional Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
