'use client'
import { useState, useEffect, use } from 'react'
import BlogEditor from '@/components/BlogEditor'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

export default function EditBlogPost({ params }) {
  const { id } = use(params)
  const [initialData, setInitialData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const token = localStorage.getItem('qrcraft_token')
        if (!token) {
          window.location.href = '/login'
          return
        }
        const res = await fetch(`${API}/api/admin/blogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('qrcraft_token')
          localStorage.removeItem('qrcraft_user')
          window.location.href = '/login'
          return
        }
        if (!res.ok) throw new Error('Failed to load post')
        const data = await res.json()
        const meta = data.design || {}
        setInitialData({
          title: data.title || '',
          slug: data.slug || '',
          excerpt: data.excerpt || '',
          content: data.content || '',
          published: data.published || false,
          coverImage: data.coverImage || '',
          metaTitle: meta.metaTitle || data.title || '',
          metaDescription: meta.metaDescription || data.excerpt || '',
          ogImage: meta.ogImage || data.coverImage || '',
          canonicalUrl: meta.canonicalUrl || '',
          tags: meta.tags || '',
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchBlog()
  }, [id])

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 300, flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid #e2e8f0',
          borderTop: '3px solid #2563eb',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <span style={{ color: '#64748b', fontSize: '0.88rem' }}>Loading post...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#dc2626' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠</div>
        <p>{error}</p>
      </div>
    )
  }

  return <BlogEditor initialData={initialData} editingId={id} />
}
