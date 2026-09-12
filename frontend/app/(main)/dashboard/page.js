'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

export default function UserDashboard() {
  const [qrCodes, setQrCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('qrcraft_token')
      const storedUser = localStorage.getItem('qrcraft_user')
      if (!token || !storedUser) {
        router.push('/login')
        return
      }
      setUser(JSON.parse(storedUser))

      try {
        const res = await fetch(`${API_URL}/api/user/qrcodes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (res.ok) setQrCodes(data)
      } catch (err) {
        console.error('Failed to fetch QR codes', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [router])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this QR code? It will break any printed versions.')) return
    
    const token = localStorage.getItem('qrcraft_token')
    try {
      const res = await fetch(`${API_URL}/api/user/qrcodes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setQrCodes(qrCodes.filter(qr => qr.id !== id))
      }
    } catch (err) {
      console.error('Error deleting', err)
    }
  }

  if (loading) return <div className="container py-5 mt-5 text-center">Loading dashboard...</div>

  const totalScans = qrCodes.reduce((acc, qr) => acc + qr.scans, 0)

  return (
    <div className="container py-5" style={{ marginTop: '6rem' }}>
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="fw-bold" style={{ color: '#1e1b4b' }}>My Dashboard</h1>
          <p className="text-secondary mb-0">Welcome back, {user?.firstName}!</p>
        </div>
        <a href="/#live-generator" className="btn btn-primary-brand rounded-pill px-4">
          + Create New
        </a>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-6">
          <div className="p-4 rounded-4 text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 10px 30px rgba(124,58,237,0.2)' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-uppercase fw-bold" style={{ fontSize: '0.8rem', letterSpacing: '1px', opacity: 0.8 }}>Saved QR Codes</span>
              <i className="bi bi-qr-code fs-4"></i>
            </div>
            <h2 className="display-4 fw-bold mb-0">{qrCodes.length}</h2>
          </div>
        </div>
        <div className="col-md-6">
          <div className="p-4 rounded-4 text-white" style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', boxShadow: '0 10px 30px rgba(6,182,212,0.2)' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-uppercase fw-bold" style={{ fontSize: '0.8rem', letterSpacing: '1px', opacity: 0.8 }}>Total Scans</span>
              <i className="bi bi-eye fs-4"></i>
            </div>
            <h2 className="display-4 fw-bold mb-0">{totalScans}</h2>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="card-header bg-white border-bottom-0 p-4">
          <h4 className="fw-bold mb-0" style={{ color: '#1e1b4b' }}>My QR Codes</h4>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th className="px-4 py-3 border-0 text-uppercase text-secondary" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Title</th>
                <th className="py-3 border-0 text-uppercase text-secondary" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Trackable URL</th>
                <th className="py-3 border-0 text-uppercase text-secondary" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Destination</th>
                <th className="py-3 border-0 text-uppercase text-secondary" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Scans</th>
                <th className="px-4 py-3 border-0 text-end text-uppercase text-secondary" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {qrCodes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-secondary">
                    You haven't saved any QR codes yet.
                  </td>
                </tr>
              ) : (
                qrCodes.map((qr) => {
                  const shortUrl = `${API_URL}/r/${qr.shortId}`;
                  return (
                    <tr key={qr.id}>
                      <td className="px-4 py-3 fw-medium">{qr.title || 'Untitled'}</td>
                      <td className="py-3">
                        <a href={shortUrl} target="_blank" rel="noreferrer" className="text-decoration-none" style={{ color: '#7c3aed' }}>
                          {shortUrl}
                        </a>
                      </td>
                      <td className="py-3 text-truncate" style={{ maxWidth: '200px' }} title={qr.content}>
                        <span className="badge bg-light text-dark border me-2">{qr.type.toUpperCase()}</span>
                        {qr.content}
                      </td>
                      <td className="py-3 fw-bold">
                        <span className={`badge ${qr.scans > 0 ? 'bg-success' : 'bg-secondary'}`}>
                          {qr.scans}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(qr.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
