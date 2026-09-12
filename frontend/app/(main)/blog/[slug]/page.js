'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

function getReadingTime(html = '') {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = text ? text.split(' ').length : 0
  return Math.max(1, Math.ceil(words / 200))
}

export default function BlogPost({ params }) {
  const resolvedParams = use(params)
  const [blog, setBlog] = useState(null)
  const [otherBlogs, setOtherBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const rawSlug = resolvedParams?.slug || ''
    const slug = decodeURIComponent(rawSlug)

    // Fetch current blog
    fetch(`${API_URL}/api/blogs/${encodeURIComponent(slug)}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then(data => setBlog(data))
      .catch(() => setBlog(null))
      .finally(() => setLoading(false))

    // Fetch other blogs for bottom section
    fetch(`${API_URL}/api/blogs`)
      .then(res => res.ok ? res.json() : [])
      .then(list => setOtherBlogs(list))
      .catch(() => setOtherBlogs([]))
  }, [resolvedParams?.slug])

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  if (loading) {
    return (
      <div style={{ background: '#ffffff', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #e2e8f0', borderTop: '3px solid #2563eb', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 500 }}>Loading article...</span>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div style={{ background: '#ffffff', minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.6rem' }}>
            <i className="bi bi-file-earmark-x"></i>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>Post Not Found</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
            The requested article doesn't exist or may have been moved.
          </p>
          <Link href="/blog" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#2563eb', color: '#ffffff', textDecoration: 'none',
            padding: '10px 22px', borderRadius: 10, fontWeight: 600, fontSize: '0.9rem',
            boxShadow: '0 2px 8px rgba(37,99,235,0.2)'
          }}>
            <i className="bi bi-arrow-left"></i> Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  const readTime = getReadingTime(blog.content)
  const tagsList = blog.design?.tags ? blog.design.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  const category = blog.design?.category || 'Guide'

  // Filter out current blog post and limit to 3 posts
  const relatedPosts = otherBlogs
    .filter(b => b.slug !== blog.slug && b.id !== blog.id)
    .slice(0, 3)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        
        .blog-article-root {
          background: #ffffff;
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
          color: #0f172a;
          padding-bottom: 6rem;
        }

        .blog-container {
          max-width: 780px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .blog-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #64748b;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 600;
          transition: all 0.15s ease;
          margin-bottom: 24px;
        }
        .blog-back-link:hover {
          color: #2563eb;
          transform: translateX(-3px);
        }

        .blog-category-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          color: #2563eb;
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .blog-title {
          font-size: clamp(2rem, 4.5vw, 3rem);
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
          letter-spacing: -0.03em;
          margin-bottom: 16px;
        }

        .blog-excerpt {
          font-size: 1.2rem;
          line-height: 1.6;
          color: #475569;
          font-weight: 400;
          margin-bottom: 24px;
        }

        .blog-meta-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-top: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 36px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .blog-author-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .blog-author-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #0f172a;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.95rem;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        .blog-share-btns {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .blog-share-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.15s ease;
        }
        .blog-share-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #2563eb;
        }

        .blog-cover-frame {
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          margin-bottom: 40px;
          background: #f8fafc;
          box-shadow: 0 4px 20px -4px rgba(0,0,0,0.06);
        }

        .blog-cover-img {
          width: 100%;
          max-height: 440px;
          object-fit: cover;
          display: block;
        }

        /* Editorial Body Content Styles */
        .blog-body-content {
          font-size: 1.1rem;
          line-height: 1.85;
          color: #334155;
        }
        .blog-body-content p {
          margin-bottom: 1.6em;
        }
        .blog-body-content h1 {
          font-size: 1.8rem;
          font-weight: 800;
          color: #0f172a;
          margin: 2.2em 0 0.6em;
          letter-spacing: -0.02em;
        }
        .blog-body-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin: 2em 0 0.5em;
          letter-spacing: -0.02em;
        }
        .blog-body-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin: 1.6em 0 0.4em;
        }
        .blog-body-content ul, .blog-body-content ol {
          padding-left: 1.6em;
          margin-bottom: 1.6em;
        }
        .blog-body-content li {
          margin-bottom: 0.5em;
        }
        .blog-body-content blockquote {
          border-left: 4px solid #2563eb;
          background: #f8fafc;
          border-radius: 0 12px 12px 0;
          padding: 1.2em 1.6em;
          margin: 2em 0;
          color: #1e293b;
          font-style: italic;
          font-size: 1.05rem;
        }
        .blog-body-content pre {
          background: #0f172a;
          color: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          overflow-x: auto;
          font-family: 'Fira Code', monospace;
          font-size: 0.9rem;
          margin: 2em 0;
          line-height: 1.6;
        }
        .blog-body-content img {
          max-width: 100%;
          border-radius: 12px;
          margin: 1.8em 0;
        }
        .blog-body-content a {
          color: #2563eb;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .blog-footer-box {
          margin-top: 48px;
          padding-top: 32px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        .blog-tag-pill {
          display: inline-flex;
          align-items: center;
          background: #f1f5f9;
          color: #475569;
          border-radius: 16px;
          padding: 4px 12px;
          font-size: 0.78rem;
          font-weight: 600;
          margin-right: 6px;
          margin-bottom: 6px;
        }

        /* Bottom Related Posts Section */
        .related-blogs-section {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 64px 0 80px;
          margin-top: 64px;
        }
        .related-blogs-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .related-blogs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-top: 28px;
        }
        .related-blog-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .related-blog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -4px rgba(0,0,0,0.08);
          border-color: #cbd5e1;
        }
        .related-blog-img {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }
        .related-blog-img-ph {
          width: 100%;
          height: 180px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 2rem;
        }
        .related-blog-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .related-blog-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.35;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .related-blog-excerpt {
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }
        .related-blog-meta {
          font-size: 0.78rem;
          color: #94a3b8;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }
      `}</style>

      <div className="blog-article-root">
        {/* Main Editorial Container */}
        <article className="blog-container" style={{ paddingTop: '40px' }}>

          {/* Navigation Back Link */}
          <Link href="/blog" className="blog-back-link">
            <i className="bi bi-arrow-left"></i> Back to all posts
          </Link>

          {/* Category Badge */}
          <div>
            <span className="blog-category-badge">
              <i className="bi bi-bookmark-fill" style={{ fontSize: '0.7rem' }}></i>
              {category}
            </span>
          </div>

          {/* Article Title */}
          <h1 className="blog-title">{blog.title}</h1>

          {/* Excerpt if present */}
          {blog.excerpt && (
            <p className="blog-excerpt">{blog.excerpt}</p>
          )}

          {/* Meta Bar */}
          <div className="blog-meta-bar">
            <div className="blog-author-info">
              <div className="blog-author-avatar">
                {blog.author?.firstName?.[0] || 'A'}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                  {blog.author?.firstName || 'Admin'} {blog.author?.lastName || 'User'}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  <span>·</span>
                  <span>{readTime} min read</span>
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="blog-share-btns">
              <button
                className="blog-share-btn"
                onClick={handleCopyLink}
                title={copied ? 'Link Copied!' : 'Copy Link'}
                style={{ background: copied ? '#dcfce7' : '#ffffff', color: copied ? '#15803d' : '#64748b', border: copied ? '1px solid #bbf7d0' : '1px solid #e2e8f0' }}
              >
                <i className={`bi ${copied ? 'bi-check-lg' : 'bi-link-45deg'}`}></i>
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="blog-share-btn"
                title="Share on X"
              >
                <i className="bi bi-twitter-x"></i>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="blog-share-btn"
                title="Share on LinkedIn"
              >
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>

          {/* Featured Cover Image */}
          {blog.coverImage && (
            <div className="blog-cover-frame">
              <img src={blog.coverImage} alt={blog.title} className="blog-cover-img" />
            </div>
          )}

          {/* Body Content */}
          <div
            className="blog-body-content"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Footer Tags & Actions */}
          <div className="blog-footer-box">
            <div>
              {tagsList.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 8 }}>
                    TAGS
                  </span>
                  <div>
                    {tagsList.map(tag => (
                      <span key={tag} className="blog-tag-pill">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/blog" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#f1f5f9', color: '#0f172a', textDecoration: 'none',
              padding: '9px 18px', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem',
              transition: 'background 0.15s ease'
            }}>
              <i className="bi bi-arrow-left"></i> All Blog Posts
            </Link>
          </div>

        </article>

        {/* ════════ Bottom Section: More Articles to Read ════════ */}
        {relatedPosts.length > 0 && (
          <section className="related-blogs-section">
            <div className="related-blogs-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                    More Articles to Read
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                    Explore more guides, tips, and insights on QR codes
                  </p>
                </div>
                <Link href="/blog" style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  View All <i className="bi bi-arrow-right"></i>
                </Link>
              </div>

              <div className="related-blogs-grid">
                {relatedPosts.map(post => (
                  <Link href={`/blog/${post.slug}`} key={post.id} className="related-blog-card">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.title} className="related-blog-img" />
                    ) : (
                      <div className="related-blog-img-ph">
                        <i className="bi bi-file-earmark-text"></i>
                      </div>
                    )}
                    <div className="related-blog-body">
                      <h4 className="related-blog-title">{post.title}</h4>
                      {post.excerpt && (
                        <p className="related-blog-excerpt">{post.excerpt}</p>
                      )}
                      <div className="related-blog-meta">
                        <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>·</span>
                        <span>{post.author?.firstName || 'Admin'}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

      </div>
    </>
  )
}
