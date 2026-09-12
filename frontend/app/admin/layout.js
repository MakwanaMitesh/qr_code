'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }) {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState(null)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('qrcraft_token')
    const storedUser = JSON.parse(localStorage.getItem('qrcraft_user') || '{}')
    if (!token || storedUser.role !== 'ADMIN') {
      window.location.href = '/login'
      return
    }
    setUser(storedUser)
  }, [])

  if (!mounted) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e2e8f0', borderTop: '3px solid #2563eb', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const handleLogout = () => {
    localStorage.removeItem('qrcraft_token')
    localStorage.removeItem('qrcraft_user')
    window.location.href = '/login'
  }

  const navGroups = [
    {
      title: 'General',
      items: [
        { href: '/admin', icon: 'bi-speedometer2', label: 'Dashboard', exact: true },
      ]
    },
    {
      title: 'Management',
      items: [
        { href: '/admin/users', icon: 'bi-people', label: 'Users', exact: false },
      ]
    },
    {
      title: 'Blog',
      items: [
        { href: '/admin/blogs', icon: 'bi-journal-richtext', label: 'Posts', exact: false },
      ]
    }
  ]

  const isActive = (item) => item.exact ? pathname === item.href : pathname.startsWith(item.href)

  const initials = user ? `${(user.firstName || 'A')[0]}${(user.lastName || '')[0] || ''}`.toUpperCase() : 'DU'
  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Admin'

  const getBreadcrumbs = () => {
    if (pathname === '/admin') return [{ label: 'Admin', href: '/admin' }, { label: 'Dashboard' }]
    if (pathname.includes('/blogs/new')) return [{ label: 'Posts', href: '/admin/blogs' }, { label: 'Create' }]
    if (pathname.includes('/edit')) return [{ label: 'Posts', href: '/admin/blogs' }, { label: 'Edit' }]
    if (pathname.includes('/blogs')) return [{ label: 'Admin', href: '/admin' }, { label: 'Posts' }]
    if (pathname.includes('/users')) return [{ label: 'Admin', href: '/admin' }, { label: 'Users' }]
    return [{ label: 'Admin' }]
  }

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard'
    if (pathname.includes('/blogs/new')) return 'Create Post'
    if (pathname.includes('/edit')) return 'Edit Post'
    if (pathname.includes('/blogs')) return 'Posts'
    if (pathname.includes('/users')) return 'Users'
    return 'Admin'
  }

  const breadcrumbs = getBreadcrumbs()
  const pageTitle = getPageTitle()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        html, body { margin: 0; padding: 0; width: 100%; background-color: #f8fafc; }
        * { box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif !important; color: #0f172a; }

        /* Filament Layout Classes */
        .filament-sidebar {
          width: 250px;
          min-height: 100vh;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 100;
        }

        .filament-main {
          margin-left: 250px;
          min-height: 100vh;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          flex: 1;
          width: calc(100% - 250px);
        }

        .filament-topbar {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 0 32px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .filament-search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 6px 12px;
          color: #64748b;
          font-size: 0.85rem;
          width: 240px;
          cursor: text;
          transition: all 0.15s ease;
        }
        .filament-search-box:hover {
          border-color: #cbd5e1;
          background: #ffffff;
        }

        .filament-content {
          padding: 24px 32px 48px;
          flex: 1;
          width: 100%;
        }

        .filament-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 8px;
          margin: 2px 12px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.15s ease;
          color: #475569;
          font-size: 0.88rem;
          font-weight: 500;
        }
        .filament-nav-item:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .filament-nav-item.active {
          background: #f1f5f9;
          color: #2563eb;
          font-weight: 600;
        }
        .filament-nav-item.active i {
          color: #2563eb;
        }

        .filament-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #0f172a;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
          flex-shrink: 0;
        }

        .filament-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.83rem;
          color: #64748b;
          margin-bottom: 4px;
        }
        .filament-breadcrumb a {
          color: #64748b;
          text-decoration: none;
        }
        .filament-breadcrumb a:hover {
          color: #2563eb;
        }
        .filament-page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin: 0;
        }
      `}</style>

      <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside className="filament-sidebar">
          {/* Brand Logo */}
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="bi bi-hexagon-fill" style={{ fontSize: '1.4rem', color: '#2563eb' }}></i>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', fontFamily: 'Inter, sans-serif' }}>
              Filament
            </span>
          </div>

          {/* Nav Groups */}
          <div style={{ flex: 1, paddingTop: 4 }}>
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} style={{ marginBottom: 16 }}>
                <div style={{
                  padding: '6px 20px 4px', fontSize: '0.72rem', fontWeight: 700,
                  color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  {group.title}
                </div>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`filament-nav-item ${isActive(item) ? 'active' : ''}`}
                  >
                    <i className={`bi ${item.icon}`} style={{ fontSize: '1rem', width: 20, textAlign: 'center', color: '#64748b' }}></i>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* Footer User Info */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div className="filament-avatar">{initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {displayName}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem', padding: 4 }}
            >
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="filament-main">
          {/* Topbar */}
          <header className="filament-topbar">
            <div>
              <div className="filament-breadcrumb">
                {breadcrumbs.map((b, idx) => (
                  <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {idx > 0 && <i className="bi bi-chevron-right" style={{ fontSize: '0.65rem', color: '#cbd5e1' }}></i>}
                    {b.href ? <Link href={b.href}>{b.label}</Link> : <span>{b.label}</span>}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Search Box */}
              <div className="filament-search-box">
                <i className="bi bi-search" style={{ fontSize: '0.8rem' }}></i>
                <span style={{ flex: 1 }}>Search</span>
                <span style={{ fontSize: '0.72rem', background: '#e2e8f0', padding: '2px 5px', borderRadius: 4, fontWeight: 600, color: '#475569' }}>⌘K</span>
              </div>

              {/* Notification Bell */}
              <div style={{ position: 'relative', cursor: 'pointer', color: '#64748b', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
                <i className="bi bi-bell"></i>
                <span style={{ position: 'absolute', top: 0, right: 0, width: 7, height: 7, background: '#2563eb', borderRadius: '50%' }} />
              </div>

              {/* User Avatar */}
              <div className="filament-avatar">{initials}</div>
            </div>
          </header>

          {/* Title Header */}
          <div style={{ padding: '24px 32px 0 32px' }}>
            <h1 className="filament-page-title">{pageTitle}</h1>
          </div>

          <div className="filament-content">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
