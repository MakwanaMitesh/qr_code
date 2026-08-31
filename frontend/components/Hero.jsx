'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

const HERO_TABS = [
  { type: 'url',   icon: 'bi-link-45deg', label: 'URL',   placeholder: 'https://example.com',         default: 'https://example.com' },
  { type: 'text',  icon: 'bi-type',       label: 'Text',  placeholder: 'Enter your text here...',     default: '' },
  { type: 'email', icon: 'bi-envelope',   label: 'Email', placeholder: 'user@example.com',             default: '' },
  { type: 'phone', icon: 'bi-telephone',  label: 'Phone', placeholder: '+1234567890',                  default: '' },
  { type: 'wifi',  icon: 'bi-wifi',       label: 'Wi-Fi', placeholder: 'WIFI:T:WPA;S:MyNet;P:pass;;', default: '' },
]

const GRADIENTS = [
  { id: 'grad-1', fg: '#1e1b4b', bg: '#ffffff', style: 'linear-gradient(135deg,#7c3aed,#4f46e5)', title: 'Purple-Indigo' },
  { id: 'grad-2', fg: '#ec4899', bg: '#fff0f8', style: 'linear-gradient(135deg,#ec4899,#f97316)', title: 'Pink-Orange' },
  { id: 'grad-3', fg: '#06b6d4', bg: '#f0fbff', style: 'linear-gradient(135deg,#06b6d4,#3b82f6)', title: 'Cyan-Blue' },
]

function overlayLogo(canvas, logoSrc) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      const logoSize = canvas.width * 0.22
      const x = (canvas.width  - logoSize) / 2
      const y = (canvas.height - logoSize) / 2
      const pad = 6
      const r   = 10
      ctx.save(); ctx.beginPath(); ctx.roundRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2, r); ctx.fillStyle = '#ffffff'; ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur  = 8; ctx.fill(); ctx.restore()
      ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, logoSize, logoSize, r - 2); ctx.clip(); ctx.drawImage(img, x, y, logoSize, logoSize); ctx.restore()
      resolve()
    }
    img.onerror = resolve
    img.src = logoSrc
  })
}

export default function Hero() {
  const [activeTab, setActiveTab] = useState('url')
  const [inputVal, setInputVal]   = useState('https://example.com')
  const [fgColor, setFgColor]     = useState('#1e1b4b')
  const [bgColor, setBgColor]     = useState('#ffffff')
  const [size, setSize]           = useState('300')
  const [ecl, setEcl]             = useState('M')
  const [addLogo, setAddLogo]     = useState(false)
  const [addFrame, setAddFrame]   = useState(false)
  const [logoSrc, setLogoSrc]     = useState(null)
  const [logoDragOver, setLogoDragOver] = useState(false)

  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const trackTimerRef = useRef(null)

  const generate = useCallback(async () => {
    if (!canvasRef.current) return
    try {
      const QRCode = (await import('qrcode')).default
      const sz = 180
      canvasRef.current.width  = sz
      canvasRef.current.height = sz
      const level = addLogo && logoSrc ? 'H' : ecl
      await QRCode.toCanvas(canvasRef.current, inputVal || 'https://qrcraft.app', {
        width: sz, margin: 2, color: { dark: fgColor, light: bgColor }, errorCorrectionLevel: level,
      })
      if (addLogo && logoSrc) await overlayLogo(canvasRef.current, logoSrc)
      
      if (trackTimerRef.current) clearTimeout(trackTimerRef.current)
      trackTimerRef.current = setTimeout(async () => {
        try {
          const token = localStorage.getItem('qrcraft_token')
          await fetch('http://localhost:5001/api/tracking/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ type: activeTab })
          })
        } catch (e) {}
      }, 1500)
    } catch (_) {}
  }, [inputVal, fgColor, bgColor, ecl, addLogo, logoSrc, activeTab])

  useEffect(() => { generate() }, [generate])

  const handleTabClick = (tab) => {
    setActiveTab(tab.type)
    setInputVal(tab.default)
  }

  const handleGradient = (g) => { setFgColor(g.fg); setBgColor(g.bg) }
  const handleLogoToggle = (checked) => { setAddLogo(checked); if (!checked) setLogoSrc(null) }
  const handleRemoveLogo = () => { setLogoSrc(null); if (fileInputRef.current) fileInputRef.current.value = '' }

  const readFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader(); reader.onload = (e) => setLogoSrc(e.target.result); reader.readAsDataURL(file)
  }

  const handleDownload = () => {
    if (!canvasRef.current) return
    const a = document.createElement('a'); a.download = 'qrcraft-code.png'; a.href = canvasRef.current.toDataURL(); a.click()
  }

  const handleDownloadSvg = async () => {
    try {
      const QRCode = (await import('qrcode')).default
      const level = addLogo && logoSrc ? 'H' : ecl
      const svg = await QRCode.toString(inputVal || 'https://qrcraft.app', { type: 'svg', color: { dark: fgColor, light: bgColor }, errorCorrectionLevel: level })
      const blob = new Blob([svg], { type: 'image/svg+xml' }); const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.download = 'qrcraft-code.svg'; a.href = url; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (_) {}
  }

  const handleReset = () => {
    setActiveTab('url'); setInputVal('https://example.com'); setFgColor('#1e1b4b'); setBgColor('#ffffff'); setSize('300'); setEcl('M'); setAddLogo(false); setAddFrame(false); setLogoSrc(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const currentPh = HERO_TABS.find(t => t.type === activeTab)?.placeholder || ''

  return (
    <section id="hero" aria-label="Hero section">
      <div className="container py-5" style={{ paddingTop: '7rem' }}>
        <div className="row align-items-center g-5">

          {/* Left: Copy */}
          <div className="col-lg-5">
            <div className="hero-badge">
              <span className="dot"></span>
              100% FREE &middot; No Sign Up Required
            </div>

            <h1 className="hero-title mb-3">
              Generate QR Codes,<br />
              Barcodes &amp; More<br />
              <span className="gradient-text">Instantly</span>
            </h1>

            <p className="text-secondary mb-4" style={{ fontSize: '1.05rem', maxWidth: '480px' }}>
              Create, customize, and download QR codes, barcodes and other URL codes in just a few
              clicks. Perfect for business, marketing, and everyday use.
            </p>

            {/* Stats */}
            <div className="d-flex flex-wrap gap-4 mb-4">
              {[
                { icon: 'bi-lightning-charge-fill', label: 'Fast',      sub: 'Instant generation' },
                { icon: 'bi-code-slash',            label: 'Easy',      sub: 'Simple to use' },
                { icon: 'bi-shield-check',          label: 'Secure',    sub: 'Data never stored' },
                { icon: 'bi-infinity',              label: 'Unlimited', sub: 'No limits' },
              ].map((s) => (
                <div key={s.label} className="hero-stat">
                  <div className="stat-icon"><i className={`bi ${s.icon}`}></i></div>
                  <div>
                    <div className="fw-bold" style={{ color: 'var(--clr-text)', fontSize: '.95rem' }}>{s.label}</div>
                    <div style={{ fontSize: '.78rem' }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex flex-wrap gap-3">
              <a href="#live-generator" className="btn btn-primary-brand" id="hero-cta-generate">
                Generate Your Code <i className="bi bi-arrow-right ms-1"></i>
              </a>
              <a href="#how-it-works" className="btn btn-outline-brand" id="hero-cta-how">
                <i className="bi bi-play-circle me-1"></i> Watch How It Works
              </a>
            </div>
          </div>

          {/* Right: Advanced QR Preview Card */}
          <div className="col-lg-7">
            <div className="qr-preview-card">
              {/* Tabs */}
              <div className="qr-card-header">
                <div className="qr-tabs-mini" id="hero-type-tabs">
                  {HERO_TABS.map((tab) => (
                    <button
                      key={tab.type}
                      className={`qr-tab-btn${activeTab === tab.type ? ' active' : ''}`}
                      onClick={() => handleTabClick(tab)}
                      id={`hero-tab-${tab.type}`}
                    >
                      <i className={`bi ${tab.icon}`}></i> {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                <div className="row g-4">
                  
                  {/* Settings Column */}
                  <div className="col-md-7">
                    
                    {/* Content */}
                    <div className="mb-3">
                      <span className="badge rounded-pill mb-2" style={{ background: 'rgba(124,58,237,.2)', color: 'var(--clr-primary-lt)' }}>
                        <i className="bi bi-pencil"></i> Content
                      </span>
                      <div className="qr-input-row" style={{ background: 'rgba(124,58,237,.05)', border: '1px solid rgba(124,58,237,.2)' }}>
                        <i className="bi bi-globe" style={{ color: 'var(--clr-muted)' }}></i>
                        <input type="text" style={{ background: 'transparent', border: 'none', width: '100%', outline: 'none', color: 'var(--clr-text)' }} placeholder={currentPh} value={inputVal} onChange={(e) => setInputVal(e.target.value)} />
                        <i className="bi bi-x-circle" style={{ color: 'var(--clr-muted)', cursor: 'pointer' }} onClick={() => setInputVal('')} title="Clear"></i>
                      </div>
                    </div>

                    {/* Customize */}
                    <div className="mb-3">
                      <span className="badge rounded-pill mb-2" style={{ background: 'rgba(124,58,237,.2)', color: 'var(--clr-primary-lt)' }}>
                        <i className="bi bi-palette"></i> Customize
                      </span>
                      <div className="d-flex align-items-center gap-4 flex-wrap mt-1">
                        <div>
                          <label className="d-block mb-1 text-uppercase fw-bold text-secondary" style={{ fontSize: '.7rem', letterSpacing: '1px' }}>Foreground</label>
                          <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="color-swatch" style={{ width: '38px', height: '38px' }} />
                        </div>
                        <div>
                          <label className="d-block mb-1 text-uppercase fw-bold text-secondary" style={{ fontSize: '.7rem', letterSpacing: '1px' }}>Background</label>
                          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="color-swatch" style={{ width: '38px', height: '38px' }} />
                        </div>
                        <div>
                          <label className="d-block mb-1 text-uppercase fw-bold text-secondary" style={{ fontSize: '.7rem', letterSpacing: '1px' }}>Gradient Presets</label>
                          <div className="d-flex gap-2">
                            {GRADIENTS.map((g) => <div key={g.id} style={{ width: '28px', height: '28px', borderRadius: '6px', background: g.style, cursor: 'pointer', border: '2px solid rgba(255,255,255,.2)' }} onClick={() => handleGradient(g)} />)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Size & Options */}
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="d-block mb-1 text-uppercase fw-bold text-secondary" style={{ fontSize: '.7rem', letterSpacing: '1px' }}>Size</label>
                        <select className="gen-input py-2" value={size} onChange={(e) => setSize(e.target.value)} style={{ background: 'rgba(124,58,237,.05)', border: '1px solid rgba(124,58,237,.2)' }}>
                          <option value="200">200 x 200</option><option value="300">300 x 300</option><option value="400">400 x 400</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="d-block mb-1 text-uppercase fw-bold text-secondary" style={{ fontSize: '.7rem', letterSpacing: '1px' }}>Error Correction</label>
                        <select className="gen-input py-2" value={ecl} onChange={(e) => setEcl(e.target.value)} disabled={addLogo && !!logoSrc} style={{ background: 'rgba(124,58,237,.05)', border: '1px solid rgba(124,58,237,.2)' }}>
                          <option value="L">Low (7%)</option><option value="M">Medium (15%)</option><option value="Q">Quartile (25%)</option><option value="H">High (30%)</option>
                        </select>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="mb-4">
                      <span className="badge rounded-pill mb-2" style={{ background: 'rgba(124,58,237,.2)', color: 'var(--clr-primary-lt)' }}>
                        <i className="bi bi-gear"></i> Options
                      </span>
                      <div className="d-flex gap-4 mt-1">
                        <div className="form-check form-switch">
                          <input className="form-check-input" type="checkbox" id="hero-opt-logo" checked={addLogo} onChange={(e) => handleLogoToggle(e.target.checked)} />
                          <label className="form-check-label text-dark fw-medium" htmlFor="hero-opt-logo" style={{ fontSize: '.85rem' }}>Add Logo</label>
                        </div>
                        <div className="form-check form-switch">
                          <input className="form-check-input" type="checkbox" id="hero-opt-frame" checked={addFrame} onChange={(e) => setAddFrame(e.target.checked)} />
                          <label className="form-check-label text-dark fw-medium" htmlFor="hero-opt-frame" style={{ fontSize: '.85rem' }}>Add Frame</label>
                        </div>
                      </div>

                      {/* Logo Upload Dropzone */}
                      {addLogo && (
                        <div className="mt-3">
                          {!logoSrc ? (
                            <div onClick={() => fileInputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setLogoDragOver(true) }} onDragLeave={() => setLogoDragOver(false)} onDrop={(e) => { e.preventDefault(); setLogoDragOver(false); readFile(e.dataTransfer.files[0]) }} style={{ border: `2px dashed ${logoDragOver ? 'var(--clr-primary)' : 'var(--clr-border)'}`, borderRadius: '8px', padding: '1rem', textAlign: 'center', cursor: 'pointer', background: logoDragOver ? 'rgba(124,58,237,.08)' : 'var(--clr-surface-2)' }}>
                              <i className="bi bi-cloud-upload fs-4 text-secondary"></i>
                              <p className="mb-0 text-secondary" style={{ fontSize: '.8rem' }}>Upload Logo (Max 2MB)</p>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center justify-content-between p-2 rounded" style={{ background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)' }}>
                              <img src={logoSrc} alt="logo" style={{ width: '32px', height: '32px', objectFit: 'contain', background: '#fff', borderRadius: '4px' }} />
                              <button className="btn btn-sm btn-link text-danger p-0 text-decoration-none" style={{ fontSize: '.8rem' }} onClick={handleRemoveLogo}>Remove</button>
                            </div>
                          )}
                          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => readFile(e.target.files[0])} />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="d-flex align-items-center gap-3">
                      <button className="btn btn-primary-brand flex-grow-1 py-2 rounded-3 fw-medium" onClick={handleDownload}>
                        <i className="bi bi-download me-2"></i> Download PNG
                      </button>
                      <button className="btn btn-link text-dark text-decoration-none fw-medium" onClick={handleDownloadSvg}>
                        Download SVG
                      </button>
                    </div>

                    <div className="mt-3">
                      <button className="btn btn-link text-secondary text-decoration-none p-0" style={{ fontSize: '.85rem' }} onClick={handleReset}>
                        <i className="bi bi-arrow-counterclockwise me-1"></i> Reset All
                      </button>
                    </div>

                  </div>

                  {/* Preview side */}
                  <div className="col-md-5 d-flex flex-column align-items-center justify-content-center">
                    <canvas ref={canvasRef} id="hero-qr-canvas" width={180} height={180} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}></canvas>
                    <span className="badge mt-3" style={{ background: 'rgba(124,58,237,.2)', color: 'var(--clr-primary-lt)', fontSize: '.75rem' }}>
                      Live Preview
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
