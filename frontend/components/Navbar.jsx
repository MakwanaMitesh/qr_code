'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [theme, setTheme] = useState('dark')
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('qrcraft-theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-bs-theme', saved)
    
    const savedUser = localStorage.getItem('qrcraft_user')
    if (savedUser) setUser(JSON.parse(savedUser))
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-bs-theme', next)
    localStorage.setItem('qrcraft-theme', next)
  }

  const handleLogout = () => {
    localStorage.removeItem('qrcraft_token')
    localStorage.removeItem('qrcraft_user')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <nav
      id="main-navbar"
      className="navbar navbar-expand-lg fixed-top"
      style={{ padding: scrolled ? '.35rem 0' : '.5rem 0' }}
      aria-label="Main navigation"
    >
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 text-decoration-none" href="/" id="nav-brand">
          <div className="navbar-brand-logo">
            <i className="bi bi-qr-code-scan text-white"></i>
          </div>
          <span className="fw-bold fs-5 gradient-text">QRCraft</span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list fs-4" style={{ color: 'var(--clr-primary-lt)' }}></i>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav mx-auto gap-1">
            <li className="nav-item">
              <a className="nav-link active" href="/#hero" id="nav-home">QR Code Generator</a>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" role="button"
                data-bs-toggle="dropdown" aria-expanded="false" id="nav-tools-dropdown">
                Other Tools
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="/#popular-tools" id="nav-barcode">Barcode Generator</a></li>
                <li><a className="dropdown-item" href="/#popular-tools" id="nav-wifi">Wi-Fi QR Code</a></li>
                <li><a className="dropdown-item" href="/#popular-tools" id="nav-vcard">vCard QR Code</a></li>
                <li><a className="dropdown-item" href="/#popular-tools" id="nav-email">Email QR Code</a></li>
              </ul>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/#how-it-works" id="nav-how">How It Works</a>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/blog" id="nav-blog">Blog</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/#faq" id="nav-faq">FAQ</a>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            <button id="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark/light mode">
              <i className={theme === 'dark' ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill'}></i>
            </button>
            
            {user ? (
              <div className="d-flex align-items-center gap-2">
                <Link href={user.role === 'ADMIN' ? '/admin' : '/dashboard'} className="btn btn-outline-brand btn-sm">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn btn-sm btn-light border">Logout</button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link href="/login" className="text-decoration-none fw-medium" style={{ color: 'var(--clr-text)', fontSize: '0.95rem' }}>
                  Log In
                </Link>
                <Link href="/register" className="btn btn-primary-brand btn-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
