import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

export const metadata = {
  title: 'Blog',
  description: 'Tips, tutorials, and updates on how to make the most out of dynamic QR codes for your business.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'The QRCraft Blog',
    description: 'Tips, tutorials, and updates on how to make the most out of dynamic QR codes for your business.',
    url: 'https://qrcode.kalpvarti.com/blog',
    type: 'website',
  },
}

async function getBlogs() {
  try {
    const res = await fetch(`${API_URL}/api/blogs`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export default async function BlogList() {
  const blogs = await getBlogs()

  return (
    <div className="container py-5" style={{ marginTop: '7rem', minHeight: '80vh' }}>
      <div className="text-center mb-5">
        <span className="badge rounded-pill mb-3 px-3 py-2" style={{ background: 'rgba(124,58,237,.1)', color: '#7c3aed', fontWeight: 600, letterSpacing: '1px' }}>
          LATEST NEWS
        </span>
        <h1 className="display-4 fw-bold mb-3" style={{ color: '#1e1b4b', letterSpacing: '-1px' }}>The QRCraft Blog</h1>
        <p className="lead text-secondary mx-auto" style={{ maxWidth: '600px' }}>
          Tips, tutorials, and updates on how to make the most out of dynamic QR codes for your business.
        </p>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-5 text-secondary">No blog posts found. Check back later!</div>
      ) : (
        <div className="row g-4">
          {blogs.map(blog => (
            <div key={blog.id} className="col-md-6 col-lg-4">
              <div className="card blog-list-card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                {blog.coverImage ? (
                  <div style={{ height: 200, backgroundImage: `url(${blog.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                ) : (
                  <div style={{ height: 200, background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-file-text text-white opacity-50" style={{ fontSize: '4rem' }}></i>
                  </div>
                )}
                <div className="card-body p-4 d-flex flex-column">
                  <div className="mb-2 text-muted" style={{ fontSize: '0.85rem' }}>
                    {new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <h2 className="card-title fw-bold mb-3" style={{ color: '#1e1b4b', fontSize: '1.25rem' }}>{blog.title}</h2>
                  <p className="card-text text-secondary mb-4" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {blog.excerpt || 'Read more about this topic...'}
                  </p>
                  <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-light d-flex align-items-center justify-content-center fw-bold" style={{ width: 32, height: 32, color: '#7c3aed', fontSize: '0.8rem' }}>
                        {blog.author?.firstName?.[0] || 'A'}
                      </div>
                      <span className="fw-medium text-secondary" style={{ fontSize: '0.85rem' }}>
                        {blog.author?.firstName} {blog.author?.lastName}
                      </span>
                    </div>
                    <Link href={`/blog/${blog.slug}`} className="text-decoration-none fw-bold" style={{ color: '#7c3aed', fontSize: '0.9rem' }}>
                      Read More <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
