'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

const TYPES = [
  { key: 'qr',     icon: 'bi-qr-code',      label: 'QR Code',        ph: 'https://www.yourwebsite.com' },
  { key: 'barcode',icon: 'bi-upc-scan',      label: 'Barcode',        ph: '1234567890128' },
  { key: 'wifi',   icon: 'bi-wifi',          label: 'Wi-Fi QR Code',  ph: 'WIFI:T:WPA;S:MyNetwork;P:password;;' },
  { key: 'url',    icon: 'bi-link-45deg',    label: 'URL QR Code',    ph: 'https://www.yourwebsite.com' },
  { key: 'text',   icon: 'bi-type',          label: 'Text QR Code',   ph: 'Enter your text message here' },
  { key: 'vcard',  icon: 'bi-person-vcard',  label: 'vCard QR Code',  ph: 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nEND:VCARD' },
  { key: 'email',  icon: 'bi-envelope',      label: 'Email QR Code',  ph: 'mailto:user@example.com' },
  { key: 'phone',  icon: 'bi-telephone',     label: 'Phone QR Code',  ph: 'tel:+1234567890' },
]

const GRADIENTS = [
  { id: 'grad-1', fg: '#1e1b4b', bg: '#ffffff', style: 'linear-gradient(135deg,#7c3aed,#4f46e5)', title: 'Purple-Indigo' },
  { id: 'grad-2', fg: '#ec4899', bg: '#fff0f8', style: 'linear-gradient(135deg,#ec4899,#f97316)', title: 'Pink-Orange' },
  { id: 'grad-3', fg: '#06b6d4', bg: '#f0fbff', style: 'linear-gradient(135deg,#06b6d4,#3b82f6)', title: 'Cyan-Blue' },
]

/** Overlay a logo image in the centre of a QR canvas */
function overlayLogo(canvas, logoSrc) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      // Logo takes up ~22% of QR width, centred, with white rounded background
      const logoSize = canvas.width * 0.22
      const x = (canvas.width  - logoSize) / 2
      const y = (canvas.height - logoSize) / 2
      const pad = 6
      const r   = 10

      // White rounded rect background
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2, r)
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = 'rgba(0,0,0,0.15)'
      ctx.shadowBlur  = 8
      ctx.fill()
      ctx.restore()

      // Draw logo clipped to rounded rect
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(x, y, logoSize, logoSize, r - 2)
      ctx.clip()
      ctx.drawImage(img, x, y, logoSize, logoSize)
      ctx.restore()

      resolve()
    }
    img.onerror = resolve   // fail silently
    img.src = logoSrc
  })
}

export default function LiveGenerator() {
  const [activeType, setActiveType] = useState('qr')
  const [content, setContent]       = useState('https://www.yourwebsite.com')
  const [fg, setFg]                 = useState('#1e1b4b')
  const [bg, setBg]                 = useState('#ffffff')
  const [size, setSize]             = useState('300')
  const [ecl, setEcl]               = useState('M')
  const [addLogo, setAddLogo]       = useState(false)
  const [addFrame, setAddFrame]     = useState(false)
  const [logoSrc, setLogoSrc]       = useState(null)   // base64 data URL
  const [logoDragOver, setLogoDragOver] = useState(false)

  const canvasRef  = useRef(null)
  const fileInputRef = useRef(null)
  const trackTimerRef = useRef(null)

  /* ─── Generate QR + optionally overlay logo ─────────────────── */
  const generate = useCallback(async () => {
    if (!canvasRef.current) return
    try {
      const QRCode = (await import('qrcode')).default
      const sz = Math.min(parseInt(size) || 300, 280)
      canvasRef.current.width  = sz
      canvasRef.current.height = sz

      // Use H error correction when logo is active (more recoverable)
      const level = addLogo && logoSrc ? 'H' : ecl

      await QRCode.toCanvas(canvasRef.current, content || 'https://qrcraft.app', {
        width: sz, margin: 2,
        color: { dark: fg, light: bg },
        errorCorrectionLevel: level,
      })

      if (addLogo && logoSrc) {
        await overlayLogo(canvasRef.current, logoSrc)
      }
      
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
            body: JSON.stringify({ type: activeType })
          })
        } catch (e) {}
      }, 1500)
    } catch (_) {}
  }, [content, fg, bg, size, ecl, addLogo, logoSrc, activeType])

  useEffect(() => { generate() }, [generate])

  /* ─── Logo file handling ─────────────────────────────────────── */
  const readFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => setLogoSrc(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleLogoFileChange = (e) => readFile(e.target.files[0])

  const handleLogoDrop = (e) => {
    e.preventDefault()
    setLogoDragOver(false)
    readFile(e.dataTransfer.files[0])
  }

  const handleLogoToggle = (checked) => {
    setAddLogo(checked)
    if (!checked) setLogoSrc(null)
  }

  const handleRemoveLogo = () => {
    setLogoSrc(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /* ─── Type / gradient / actions ─────────────────────────────── */
  const handleTypeChange = (key) => { setActiveType(key); setContent('') }
  const handleGradient   = (g)   => { setFg(g.fg); setBg(g.bg) }

  const handleDownloadPng = () => {
    if (!canvasRef.current) return
    const a = document.createElement('a')
    a.download = 'qrcraft-code.png'
    a.href = canvasRef.current.toDataURL()
    a.click()
  }

  const handleDownloadSvg = async () => {
    try {
      const QRCode = (await import('qrcode')).default
      const svg = await QRCode.toString(content || 'https://qrcraft.app', {
        type: 'svg', color: { dark: fg, light: bg }, errorCorrectionLevel: ecl,
      })
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.download = 'qrcraft-code.svg'; a.href = url; a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (_) {}
  }

  const handleReset = () => {
    setActiveType('qr'); setContent('https://www.yourwebsite.com')
    setFg('#1e1b4b'); setBg('#ffffff'); setSize('300'); setEcl('M')
    setAddLogo(false); setAddFrame(false); setLogoSrc(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const currentPh = TYPES.find(t => t.key === activeType)?.ph || ''

  return (
    <section id="live-generator" aria-label="Live code generator">
      <div className="container py-5">
        <div className="text-center mb-5">
          <p className="section-label">Live Premium</p>
          <h2 className="section-title">Powerful. Customizable. Real-Time Results.</h2>
        </div>

        <div className="row g-4">
          {/* ── Sidebar ── */}
          <div className="col-lg-3">
            <div className="gen-sidebar">
              {TYPES.map((t) => (
                <button
                  key={t.key}
                  className={`gen-type-btn${activeType === t.key ? ' active' : ''}`}
                  onClick={() => handleTypeChange(t.key)}
                  id={`gen-btn-${t.key}`}
                >
                  <i className={`bi ${t.icon}`}></i> {t.label}
                </button>
              ))}
              <div className="mt-2 px-2 py-1">
                <small className="text-secondary" style={{ fontSize: '.78rem' }}>
                  <i className="bi bi-three-dots-vertical"></i> More Tools Coming Soon
                </small>
              </div>
            </div>
          </div>

          {/* ── Panel ── */}
          <div className="col-lg-5">
            <div className="gen-panel">

              {/* Content */}
              <div className="mb-3">
                <span className="badge rounded-pill mb-2" style={{ background: 'rgba(124,58,237,.2)', color: 'var(--clr-primary-lt)' }}>
                  <i className="bi bi-pencil"></i> Content
                </span>
                <div className="qr-input-row">
                  <i className="bi bi-globe" style={{ color: 'var(--clr-muted)' }}></i>
                  <input
                    type="text"
                    id="live-content-input"
                    placeholder={currentPh}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <i className="bi bi-x-circle" style={{ color: 'var(--clr-muted)', cursor: 'pointer' }}
                    onClick={() => setContent('')} title="Clear"></i>
                </div>
              </div>

              {/* Customize */}
              <div className="mb-3">
                <span className="badge rounded-pill mb-2" style={{ background: 'rgba(124,58,237,.2)', color: 'var(--clr-primary-lt)' }}>
                  <i className="bi bi-palette"></i> Customize
                </span>
                <div className="row g-2 align-items-end mt-1">
                  <div className="col-auto">
                    <label className="gen-label">Foreground</label>
                    <input type="color" id="live-fg" value={fg} onChange={(e) => setFg(e.target.value)}
                      className="color-swatch" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
                  </div>
                  <div className="col-auto">
                    <label className="gen-label">Background</label>
                    <input type="color" id="live-bg" value={bg} onChange={(e) => setBg(e.target.value)}
                      className="color-swatch" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
                  </div>
                  <div className="col">
                    <label className="gen-label">Gradient Presets</label>
                    <div className="d-flex gap-1">
                      {GRADIENTS.map((g) => (
                        <div key={g.id} id={g.id} title={g.title}
                          style={{ width: '24px', height: '24px', borderRadius: '5px', background: g.style, cursor: 'pointer', border: '2px solid rgba(255,255,255,.2)' }}
                          onClick={() => handleGradient(g)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Size & ECL */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="gen-label">Size</label>
                  <select id="live-size" className="gen-input" value={size} onChange={(e) => setSize(e.target.value)}>
                    <option value="200">200 x 200</option>
                    <option value="300">300 x 300</option>
                    <option value="400">400 x 400</option>
                    <option value="500">500 x 500</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="gen-label">Error Correction</label>
                  <select id="live-ecl" className="gen-input" value={ecl} onChange={(e) => setEcl(e.target.value)}
                    disabled={addLogo && !!logoSrc} title={addLogo && logoSrc ? 'Forced to High when logo is active' : ''}>
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                  {addLogo && logoSrc && (
                    <small style={{ fontSize: '.72rem', color: 'var(--clr-primary-lt)' }}>
                      <i className="bi bi-info-circle me-1"></i>Forced to High for logo
                    </small>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="mb-3">
                <span className="badge rounded-pill mb-2" style={{ background: 'rgba(124,58,237,.2)', color: 'var(--clr-primary-lt)' }}>
                  <i className="bi bi-gear"></i> Options
                </span>
                <div className="d-flex gap-3 flex-wrap mt-2">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="opt-logo"
                      checked={addLogo} onChange={(e) => handleLogoToggle(e.target.checked)} />
                    <label className="form-check-label" htmlFor="opt-logo" style={{ fontSize: '.85rem' }}>Add Logo</label>
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="opt-frame"
                      checked={addFrame} onChange={(e) => setAddFrame(e.target.checked)} />
                    <label className="form-check-label" htmlFor="opt-frame" style={{ fontSize: '.85rem' }}>Add Frame</label>
                  </div>
                </div>
              </div>

              {/* ── Logo Upload (shown only when Add Logo is checked) ── */}
              {addLogo && (
                <div className="mb-4">
                  {!logoSrc ? (
                    /* Drop zone */
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setLogoDragOver(true) }}
                      onDragLeave={() => setLogoDragOver(false)}
                      onDrop={handleLogoDrop}
                      style={{
                        border: `2px dashed ${logoDragOver ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
                        borderRadius: '10px',
                        padding: '1.25rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: logoDragOver ? 'rgba(124,58,237,.08)' : 'var(--clr-surface-2)',
                        transition: 'all .2s ease',
                      }}
                    >
                      <i className="bi bi-cloud-upload fs-2" style={{ color: 'var(--clr-primary-lt)' }}></i>
                      <p className="mb-1 mt-1" style={{ fontSize: '.88rem', fontWeight: 600 }}>
                        Upload Logo
                      </p>
                      <p className="mb-0" style={{ fontSize: '.75rem', color: 'var(--clr-muted)' }}>
                        Click to browse or drag &amp; drop<br />PNG, JPG, SVG, WEBP · Max 2 MB
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="logo-file-input"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleLogoFileChange}
                      />
                    </div>
                  ) : (
                    /* Logo preview strip */
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '.75rem',
                      background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)',
                      borderRadius: '10px', padding: '.75rem 1rem',
                    }}>
                      <img
                        src={logoSrc}
                        alt="Uploaded logo"
                        style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '6px', background: '#fff', padding: '2px' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="mb-0" style={{ fontSize: '.85rem', fontWeight: 600 }}>Logo uploaded</p>
                        <p className="mb-0" style={{ fontSize: '.75rem', color: 'var(--clr-muted)' }}>Centred on QR code · Error correction forced to High</p>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm"
                          style={{ background: 'rgba(124,58,237,.15)', color: 'var(--clr-primary-lt)', borderRadius: '6px', border: 'none', fontSize: '.8rem' }}
                          onClick={() => fileInputRef.current?.click()}
                          title="Change logo"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: 'rgba(239,68,68,.12)', color: '#f87171', borderRadius: '6px', border: 'none', fontSize: '.8rem' }}
                          onClick={handleRemoveLogo}
                          title="Remove logo"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="logo-file-input"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleLogoFileChange}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="d-flex gap-2 flex-wrap">
                <button id="live-download-png" className="btn btn-primary-brand flex-grow-1"
                  style={{ borderRadius: '.6rem' }} onClick={handleDownloadPng}>
                  <i className="bi bi-download me-1"></i> Download PNG
                </button>
                <button id="live-download-svg" className="btn btn-outline-brand"
                  style={{ borderRadius: '.6rem' }} onClick={handleDownloadSvg}>
                  Download SVG
                </button>
              </div>
              <button id="live-reset" className="btn btn-sm mt-2 text-secondary"
                style={{ fontSize: '.82rem' }} onClick={handleReset}>
                <i className="bi bi-arrow-counterclockwise me-1"></i> Reset All
              </button>
            </div>
          </div>

          {/* ── Preview ── */}
          <div className="col-lg-4">
            <div className="gen-preview-box">
              <p className="section-label mb-2">Preview</p>
              <canvas ref={canvasRef} id="live-qr-canvas" width={240} height={240}></canvas>
              <small className="text-secondary" style={{ fontSize: '.78rem' }}>
                <i className="bi bi-arrow-repeat me-1"></i> Updates in real-time
              </small>
              {addLogo && logoSrc && (
                <small style={{ fontSize: '.72rem', color: 'var(--clr-primary-lt)' }}>
                  <i className="bi bi-check-circle-fill me-1"></i>Logo overlay active
                </small>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
