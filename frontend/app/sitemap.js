const SITE_URL = 'https://qrcode.kalpvarti.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

export default async function sitemap() {
  const staticRoutes = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/login`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/register`, changeFrequency: 'monthly', priority: 0.3 },
  ].map((route) => ({ ...route, lastModified: new Date() }))

  let blogRoutes = []
  try {
    const res = await fetch(`${API_URL}/api/blogs`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const blogs = await res.json()
      blogRoutes = blogs.map((blog) => ({
        url: `${SITE_URL}/blog/${blog.slug}`,
        lastModified: blog.createdAt ? new Date(blog.createdAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      }))
    }
  } catch {
    // Backend unreachable at build time — ship static routes only
  }

  return [...staticRoutes, ...blogRoutes]
}
