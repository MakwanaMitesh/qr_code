'use client'
import { useState } from 'react'
import Link from 'next/link'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

export default function RegisterForm() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id-here'

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Google signup failed')
        setLoading(false)
        return
      }
      localStorage.setItem('qrcraft_token', data.token)
      localStorage.setItem('qrcraft_user', JSON.stringify(data.user))
      window.location.href = data.user.role === 'ADMIN' ? '/admin' : '/'
    } catch (err) {
      setError('Something went wrong.')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      localStorage.setItem('qrcraft_token', data.token)
      localStorage.setItem('qrcraft_user', JSON.stringify(data.user))
      
      if (data.user.role === 'ADMIN') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/'
      }
    } catch (err) {
      setError('Something went wrong. Is backend running?')
      setLoading(false)
    }
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="container py-5" style={{ marginTop: '5rem' }}>
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-5">
            <div className="card shadow border-0 p-5" style={{ borderRadius: '16px', background: 'var(--clr-surface)' }}>
              <h3 className="text-center mb-1 fw-bold" style={{ color: 'var(--clr-text)' }}>Create your account</h3>
              <p className="text-center mb-4" style={{ color: 'var(--clr-muted)', fontSize: '0.9rem' }}>Start generating beautiful QR codes in seconds</p>
              
              {error && <div className="alert alert-danger py-2 border-0" style={{ fontSize: '.9rem', borderRadius: '8px' }}>{error}</div>}
              
              <div className="d-flex justify-content-center mb-4">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Registration failed')}
                  useOneTap
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="rectangular"
                  width="100%"
                />
              </div>

              <div className="d-flex align-items-center mb-4">
                <hr className="flex-grow-1 m-0" style={{ borderColor: 'var(--clr-border)' }} />
                <span className="px-3" style={{ color: 'var(--clr-muted)', fontSize: '0.85rem' }}>OR SIGN UP WITH EMAIL</span>
                <hr className="flex-grow-1 m-0" style={{ borderColor: 'var(--clr-border)' }} />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label fw-medium" style={{ fontSize: '.85rem', color: 'var(--clr-text)' }}>First Name</label>
                    <input type="text" className="form-control py-2" value={firstName} onChange={e => setFirstName(e.target.value)} required style={{ background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', color: 'var(--clr-text)' }} />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label fw-medium" style={{ fontSize: '.85rem', color: 'var(--clr-text)' }}>Last Name</label>
                    <input type="text" className="form-control py-2" value={lastName} onChange={e => setLastName(e.target.value)} required style={{ background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', color: 'var(--clr-text)' }} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium" style={{ fontSize: '.85rem', color: 'var(--clr-text)' }}>Email Address</label>
                  <input type="email" className="form-control py-2" value={email} onChange={e => setEmail(e.target.value)} required style={{ background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', color: 'var(--clr-text)' }} />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-medium" style={{ fontSize: '.85rem', color: 'var(--clr-text)' }}>Password</label>
                  <input type="password" className="form-control py-2" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={{ background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)', color: 'var(--clr-text)' }} />
                </div>
                <button type="submit" className="btn btn-primary-brand w-100 mb-4 py-2 fw-medium rounded-3" disabled={loading} style={{ fontSize: '1.05rem' }}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
              
              <p className="text-center mb-0" style={{ fontSize: '.9rem', color: 'var(--clr-text)' }}>
                Already have an account? <Link href="/login" className="text-decoration-none fw-bold" style={{ color: 'var(--clr-primary)' }}>Sign in here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}
