'use client'
import { useState, useEffect } from 'react'

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [formData, setFormData] = useState({
    title: '', slug: '', excerpt: '', content: '', published: false, coverImage: ''
  })

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem('qrcraft_token')
      const res = await fetch('http://localhost:5001/api/admin/blogs', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setBlogs(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('qrcraft_token')
    const url = editingId 
      ? `http://localhost:5001/api/admin/blogs/${editingId}` 
      : 'http://localhost:5001/api/admin/blogs'
    const method = editingId ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setShowModal(false)
        fetchBlogs()
      } else {
        const err = await res.json()
        alert('Error: ' + err.error)
      }
    } catch (err) {
      alert('Network error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    const token = localStorage.getItem('qrcraft_token')
    try {
      const res = await fetch(`http://localhost:5001/api/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) fetchBlogs()
    } catch (err) {
      console.error(err)
    }
  }

  const openNew = () => {
    setEditingId(null)
    setFormData({ title: '', slug: '', excerpt: '', content: '', published: false, coverImage: '' })
    setShowModal(true)
  }

  const openEdit = (b) => {
    setEditingId(b.id)
    setFormData({ title: b.title, slug: b.slug, excerpt: b.excerpt || '', content: b.content, published: b.published, coverImage: b.coverImage || '' })
    setShowModal(true)
  }

  const autoSlug = (title) => {
    if (editingId) return // Don't auto-change on edit unless they want to
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    setFormData(prev => ({ ...prev, slug }))
  }

  if (loading) return <div>Loading blogs...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button 
          onClick={openNew}
          style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
        >
          + New Post
        </button>
      </div>

      <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eaecf0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Title</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid #eaecf0' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{b.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/{b.slug}</div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, background: b.published ? '#dcfce7' : '#f1f5f9', color: b.published ? '#166534' : '#64748b' }}>
                    {b.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '0.9rem' }}>
                  {new Date(b.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button onClick={() => openEdit(b)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: 12 }}>Edit</button>
                  <button onClick={() => handleDelete(b.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
            {blogs.length === 0 && <tr><td colSpan="4" style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>No blog posts yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 800, borderRadius: 16, display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: 24, borderBottom: '1px solid #eaecf0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{editingId ? 'Edit Post' : 'Create Post'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <form onSubmit={handleSave} style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.9rem' }}>Title</label>
                <input required type="text" value={formData.title} onChange={e => { setFormData({...formData, title: e.target.value}); autoSlug(e.target.value); }} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.9rem' }}>Slug (URL)</label>
                <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.9rem' }}>Excerpt</label>
                <textarea value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', minHeight: 60 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.9rem' }}>Cover Image URL (optional)</label>
                <input type="text" value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db' }} placeholder="https://..." />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.9rem' }}>Content (Markdown)</label>
                <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', minHeight: 300, fontFamily: 'monospace' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <input type="checkbox" id="published" checked={formData.published} onChange={e => setFormData({...formData, published: e.target.checked})} style={{ width: 18, height: 18 }} />
                <label htmlFor="published" style={{ fontWeight: 600 }}>Publish Post</label>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: 8, background: '#f1f5f9', border: '1px solid #cbd5e1', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: 8, background: '#7c3aed', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>{editingId ? 'Update Post' : 'Save Post'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
