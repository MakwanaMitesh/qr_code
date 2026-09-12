'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ConfirmDialog } from '@/components/BlogEditor'

const API = 'http://localhost:5001'

function wordCount(html = '') {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return text ? text.split(' ').length : 0
}

export default function AdminBlogs() {
  const router = useRouter()
  const [blogs, setBlogs] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => { fetchBlogs() }, [])

  useEffect(() => {
    let list = blogs
    if (statusFilter !== 'all') {
      list = list.filter(b => statusFilter === 'published' ? b.published : !b.published)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(b =>
        b.title?.toLowerCase().includes(q) ||
        b.slug?.toLowerCase().includes(q) ||
        b.excerpt?.toLowerCase().includes(q)
      )
    }
    setFiltered(list)
  }, [blogs, search, statusFilter])

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem('qrcraft_token')
      if (!token) {
        window.location.href = '/login'
        return
      }
      const res = await fetch(`${API}/api/admin/blogs`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('qrcraft_token')
        localStorage.removeItem('qrcraft_user')
        window.location.href = '/login'
        return
      }
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

  const handleDelete = async (id) => {
    const token = localStorage.getItem('qrcraft_token')
    try {
      const res = await fetch(`${API}/api/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('qrcraft_token')
        localStorage.removeItem('qrcraft_user')
        window.location.href = '/login'
        return
      }
      if (res.ok) {
        setBlogs(prev => prev.filter(b => b.id !== id))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setDeleteTarget(null)
    }
  }

  const togglePublish = async (blog) => {
    const token = localStorage.getItem('qrcraft_token')
    try {
      const res = await fetch(`${API}/api/admin/blogs/${blog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...blog, published: !blog.published }),
      })
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('qrcraft_token')
        localStorage.removeItem('qrcraft_user')
        window.location.href = '/login'
        return
      }
      if (res.ok) {
        setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, published: !b.published } : b))
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #e2e8f0', borderTop: '3px solid #2563eb', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <span style={{ color: '#64748b', fontSize: '0.88rem' }}>Loading posts...</span>
      </div>
    )
  }

  return (
    <>
      <style>{`
        /* Filament Table Styles */
        .fl-table-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }

        .fl-blog-row {
          display: grid;
          grid-template-columns: 60px 1fr 120px 100px 140px 140px;
          gap: 12px;
          padding: 14px 20px;
          align-items: center;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.12s ease;
        }
        .fl-blog-row:last-child {
          border-bottom: none;
        }
        .fl-blog-row:hover {
          background: #f8fafc;
        }

        .fl-table-head {
          display: grid;
          grid-template-columns: 60px 1fr 120px 100px 140px 140px;
          gap: 12px;
          padding: 12px 20px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
        }

        .fl-pill {
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .fl-pill:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        .fl-pill.active {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #2563eb;
        }

        .fl-search {
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          color: #0f172a;
          padding: 8px 12px 8px 34px;
          font-size: 0.88rem;
          outline: none;
          width: 260px;
          font-family: inherit;
          box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
          transition: border-color 0.15s;
        }
        .fl-search:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        .fl-action-btn {
          background: none;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 5px 12px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .fl-action-btn.edit {
          color: #2563eb;
          background: #ffffff;
        }
        .fl-action-btn.edit:hover {
          background: #eff6ff;
          border-color: #bfdbfe;
        }
        .fl-action-btn.delete {
          color: #dc2626;
          background: #ffffff;
        }
        .fl-action-btn.delete:hover {
          background: #fef2f2;
          border-color: #fecaca;
        }

        .fl-thumb {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #e2e8f0;
        }
        .fl-thumb-ph {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          color: #94a3b8;
        }
      `}</style>

      {deleteTarget && (
        <ConfirmDialog
          message={`"${deleteTarget.title}" will be permanently deleted.`}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Top Filter & Create Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'published', 'draft'].map(f => (
            <button key={f} className={`fl-pill ${statusFilter === f ? 'active' : ''}`} onClick={() => setStatusFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }}></i>
            <input
              className="fl-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search posts..."
            />
          </div>

          <button
            onClick={() => router.push('/admin/blogs/new')}
            style={{
              background: '#2563eb', color: '#ffffff', border: 'none',
              padding: '9px 18px', borderRadius: 8, fontWeight: 600,
              fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <i className="bi bi-plus-lg"></i> New Post
          </button>
        </div>
      </div>

      {/* Filament Table Card */}
      <div className="fl-table-card">
        {/* Table Header */}
        <div className="fl-table-head">
          <div>Image</div>
          <div>Title & Slug</div>
          <div>Status</div>
          <div>Words</div>
          <div>Created</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
            <i className="bi bi-file-earmark-richtext" style={{ fontSize: '2rem', color: '#94a3b8', display: 'block', marginBottom: 8 }}></i>
            <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
              {search ? 'No posts match your search' : 'No posts found'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Create your first blog post to get started.
            </div>
          </div>
        ) : (
          filtered.map(b => {
            const wc = wordCount(b.content)
            const readTime = Math.max(1, Math.ceil(wc / 200))
            return (
              <div key={b.id} className="fl-blog-row">
                {/* Thumbnail */}
                <div>
                  {b.coverImage ? (
                    <img src={b.coverImage} alt="" className="fl-thumb" />
                  ) : (
                    <div className="fl-thumb-ph">
                      <i className="bi bi-file-earmark-image"></i>
                    </div>
                  )}
                </div>

                {/* Title & Slug */}
                <div style={{ minWidth: 0, paddingRight: 12 }}>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {b.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    /blog/{b.slug}
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  <span
                    onClick={() => togglePublish(b)}
                    style={{
                      padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                      background: b.published ? '#dcfce7' : '#f1f5f9',
                      color: b.published ? '#15803d' : '#64748b',
                      border: `1px solid ${b.published ? '#bbf7d0' : '#e2e8f0'}`,
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                    {b.published ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Words */}
                <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                  <div style={{ fontWeight: 600 }}>{wc.toLocaleString()} w</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{readTime} min read</div>
                </div>

                {/* Created Date */}
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button
                    className="fl-action-btn edit"
                    onClick={() => router.push(`/admin/blogs/${b.id}/edit`)}
                  >
                    <i className="bi bi-pencil-square"></i> Edit
                  </button>
                  <button
                    className="fl-action-btn delete"
                    onClick={() => setDeleteTarget(b)}
                  >
                    <i className="bi bi-trash3"></i> Delete
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
