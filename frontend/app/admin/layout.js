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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f0c29' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(139,92,246,0.3)', borderTop: '3px solid #8b5cf6', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const handleLogout = () => {
    localStorage.removeItem('qrcraft_token')
    localStorage.removeItem('qrcraft_user')
    window.location.href = '/login'
  }

  const navItems = [
    { href: '/admin', icon: '⊞', label: 'Dashboard', exact: true },
    { href: '/admin/users', icon: '👥', label: 'Users', exact: false },
    { href: '/admin/blogs', icon: '📝', label: 'Blogs', exact: false },
  ]

  const isActive = (item) => item.exact ? pathname === item.href : pathname.startsWith(item.href)

  const initials = user ? `${(user.firstName || 'A')[0]}${(user.lastName || '')[0] || ''}`.toUpperCase() : 'A'
  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Admin'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        html, body { margin: 0; padding: 0; width: 100%; }
        * { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif !important; }
        .admin-sidebar { width: 260px; min-height: 100vh; background: linear-gradient(180deg, #1a1035 0%, #0f0c29 100%); border-right: 1px solid rgba(139,92,246,0.15); display: flex; flex-direction: column; position: fixed; left: 0; top: 0; z-index: 100; }
        .admin-main { margin-left: 260px; min-height: 100vh; background: #f0f2ff; display: flex; flex-direction: column; flex: 1; width: calc(100% - 260px); overflow-x: hidden; }
        .admin-topbar { background: #fff; border-bottom: 1px solid #e8eaf0; padding: 0 32px; height: 64px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
        .admin-content { padding: 32px; flex: 1; }
        .nav-link-item { display: flex; align-items: center; gap: 12px; padding: 12px 20px; border-radius: 12px; margin: 3px 16px; cursor: pointer; text-decoration: none; transition: all 0.2s; color: rgba(255,255,255,0.55); font-size: 0.92rem; font-weight: 500; }
        .nav-link-item:hover { background: rgba(139,92,246,0.15); color: rgba(255,255,255,0.9); }
        .nav-link-item.active { background: linear-gradient(135deg, rgba(139,92,246,0.35), rgba(109,40,217,0.3)); color: #c4b5fd; font-weight: 600; box-shadow: 0 4px 15px rgba(139,92,246,0.2); }
        .nav-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 1rem; background: rgba(255,255,255,0.05); }
        .nav-link-item.active .nav-icon { background: rgba(139,92,246,0.3); }
        .avatar-ring { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #4f46e5); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
        .stat-card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #eaecf0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .breadcrumb-label { font-size: 0.8rem; color: #9ca3af; font-weight: 500; letter-spacing: 0.5px; margin-bottom: 2px; text-transform: uppercase; }
        .page-title { font-size: 1.6rem; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin: 0; }
        .logout-btn { width: calc(100% - 32px); margin: 0 16px 20px; padding: 11px; border: 1px solid rgba(239,68,68,0.25); background: rgba(239,68,68,0.08); color: #f87171; border-radius: 12px; cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .logout-btn:hover { background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.5); }
        .topbar-btn { width: 38px; height: 38px; border-radius: 10px; background: #f8f9ff; border: 1px solid #e8eaf0; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6b7280; transition: all 0.2s; }
        .topbar-btn:hover { background: #eef0ff; color: #7c3aed; }
      `}</style>

      <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside className="admin-sidebar">
          {/* Logo */}
          <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 4px 15px rgba(124,58,237,0.4)' }}>⬡</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.5px' }}>QRCraft</div>
                <div style={{ color: 'rgba(139,92,246,0.8)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Admin Console</div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div style={{ padding: '16px 20px', margin: '12px 16px', background: 'rgba(139,92,246,0.1)', borderRadius: 12, border: '1px solid rgba(139,92,246,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="avatar-ring">{initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
                <div style={{ color: '#a78bfa', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.5px' }}>ADMINISTRATOR</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <div style={{ flex: 1, paddingTop: 8 }}>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1.5px', padding: '8px 20px 4px', textTransform: 'uppercase' }}>Menu</div>
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className={`nav-link-item ${isActive(item) ? 'active' : ''}`}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {isActive(item) && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#a78bfa' }} />}
              </Link>
            ))}
          </div>

          {/* Logout */}
          <button className="logout-btn" onClick={handleLogout}>
            <span>⎋</span> Sign Out
          </button>
        </aside>

        {/* Main */}
        <div className="admin-main">
          {/* Topbar */}
          <header className="admin-topbar">
            <div>
              <div className="breadcrumb-label">Admin Panel</div>
              <h1 className="page-title">
                {pathname === '/admin' ? 'Dashboard' : pathname.includes('/users') ? 'User Management' : pathname.includes('/blogs') ? 'Blog Management' : 'Admin'}
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="topbar-btn">🔔</button>
              <button className="topbar-btn">⚙</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px 6px 8px', background: '#f8f9ff', border: '1px solid #e8eaf0', borderRadius: 50 }}>
                <div className="avatar-ring" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>{initials}</div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{displayName}</span>
              </div>
            </div>
          </header>

          <div className="admin-content">{children}</div>
        </div>
      </div>
    </>
  )
}
