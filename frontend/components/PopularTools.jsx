'use client'
import { useEffect, useRef } from 'react'

const tools = [
  { icon: 'bi-qr-code-scan',  color: 'rgba(124,58,237,.15)', iconColor: '#a78bfa', title: 'QR Code Generator',  desc: 'Generate custom QR codes for any text or URL instantly.',        id: 'tool-qr-link' },
  { icon: 'bi-upc-scan',      color: 'rgba(99,102,241,.15)', iconColor: '#818cf8', title: 'Barcode Generator',  desc: 'Create barcodes for products and inventory management.',        id: 'tool-barcode-link' },
  { icon: 'bi-wifi',          color: 'rgba(6,182,212,.15)',  iconColor: '#22d3ee', title: 'Wi-Fi QR Code',      desc: 'Share Wi-Fi credentials with anyone, just one scan.',           id: 'tool-wifi-link' },
  { icon: 'bi-link-45deg',    color: 'rgba(245,158,11,.15)', iconColor: '#fbbf24', title: 'URL QR Code',        desc: 'Convert any URL into a scannable QR code instantly.',          id: 'tool-url-link' },
  { icon: 'bi-type-bold',     color: 'rgba(239,68,68,.15)',  iconColor: '#f87171', title: 'Text QR Code',       desc: 'Encode text messages directly in a QR code.',                  id: 'tool-text-link' },
  { icon: 'bi-person-vcard',  color: 'rgba(34,197,94,.15)',  iconColor: '#4ade80', title: 'vCard QR Code',      desc: 'Create digital business cards with vCard QR codes.',           id: 'tool-vcard-link' },
  { icon: 'bi-envelope-fill', color: 'rgba(244,114,182,.15)',iconColor: '#f472b6', title: 'Email QR Code',      desc: 'Generate QR codes that open email addresses.',                 id: 'tool-email-link' },
  { icon: 'bi-telephone-fill',color: 'rgba(16,185,129,.15)', iconColor: '#34d399', title: 'Phone QR Code',      desc: 'Create QR codes that dial phone numbers directly.',            id: 'tool-phone-link' },
]

function ToolCard({ tool, delay }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.classList.add('fade-up')
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el) }
    }, { threshold: 0.12 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="col-sm-6 col-lg-3" style={{ transitionDelay: `${delay}s` }}>
      <div className="glass-card tool-card h-100">
        <div className="tool-icon-wrap" style={{ background: tool.color, color: tool.iconColor }}>
          <i className={`bi ${tool.icon}`}></i>
        </div>
        <h3 className="fw-bold fs-6 mb-1">{tool.title}</h3>
        <p className="text-secondary" style={{ fontSize: '.85rem' }}>{tool.desc}</p>
        <a href="#live-generator" className="arrow-link" id={tool.id}>
          Generate <i className="bi bi-arrow-right"></i>
        </a>
      </div>
    </div>
  )
}

export default function PopularTools() {
  return (
    <section id="popular-tools" aria-label="Popular tools" className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <p className="section-label">Popular Tools</p>
          <h2 className="section-title">All-in-One Code Generator Tools</h2>
          <p className="text-secondary mt-2 mx-auto" style={{ maxWidth: '520px' }}>
            Everything you need to generate professional codes for any purpose.
          </p>
        </div>
        <div className="row g-4">
          {tools.map((t, i) => (
            <ToolCard key={t.id} tool={t} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  )
}
