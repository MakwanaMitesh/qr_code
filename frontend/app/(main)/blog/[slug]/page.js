'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function BlogPost({ params }) {
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // React 19 / Next.js requires unwrapping params if it's a Promise in some versions, but in standard App Router string params are directly accessible.
    const slug = params.slug
    
    fetch(`http://localhost:5001/api/blogs/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then(data => setBlog(data))
      .catch(() => setBlog(null))
      .finally(() => setLoading(false))
  }, [params.slug])

  if (loading) {
    return <div className="container text-center py-5 mt-5"><div className="spinner-border text-primary mt-5" role="status"></div></div>
  }

  if (!blog) {
    return (
      <div className="container text-center py-5 mt-5">
        <h1 className="mt-5 display-4 fw-bold text-dark">404</h1>
        <p className="lead text-secondary">Blog post not found.</p>
        <Link href="/blog" className="btn btn-primary-brand mt-3">Back to Blog</Link>
      </div>
    )
  }

  return (
    <article style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      {blog.coverImage ? (
        <div style={{ width: '100%', height: '40vh', minHeight: '300px', backgroundImage: `url(${blog.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)' }} />
        </div>
      ) : (
        <div style={{ width: '100%', height: '20vh', minHeight: '150px', background: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)' }} />
      )}
      
      <div className="container" style={{ marginTop: blog.coverImage ? '-100px' : '-50px', position: 'relative', zIndex: 10 }}>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">
              <Link href="/blog" className="text-decoration-none text-secondary fw-medium mb-4 d-inline-block">
                <i className="bi bi-arrow-left me-1"></i> Back to all posts
              </Link>
              
              <h1 className="fw-bold mb-3" style={{ color: '#1e1b4b', fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.2 }}>
                {blog.title}
              </h1>
              
              <div className="d-flex align-items-center gap-3 mb-5 pb-4 border-bottom">
                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center fw-bold" style={{ width: 48, height: 48, color: '#7c3aed' }}>
                  {blog.author?.firstName?.[0] || 'A'}
                </div>
                <div>
                  <div className="fw-bold text-dark">{blog.author?.firstName} {blog.author?.lastName}</div>
                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                    {new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>
              
              {/* Note: In a production app, use a markdown parser like 'marked' or 'react-markdown'. Here we just display it in a pre-wrap div or basic formatting */}
              <div className="blog-content" style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-wrap' }}>
                {blog.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
