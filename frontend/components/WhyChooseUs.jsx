const features = [
  { emoji: '⚡', title: 'Lightning Fast', desc: 'Generate codes in seconds with live real-time preview.' },
  { emoji: '🎁', title: 'Free Forever', desc: '100% free to use with no limits or hidden fees.' },
  { emoji: '🔒', title: 'No Sign-up Required', desc: 'No registration or login needed. Jump right in.' },
  { emoji: '🎨', title: 'High Quality', desc: 'High-resolution PNG and SVG downloads ready to use.' },
  { emoji: '📱', title: 'Mobile Friendly', desc: 'Works perfectly on all devices and screen sizes.' },
]

export default function WhyChooseUs() {
  return (
    <section id="why-us" aria-label="Why choose us">
      <div className="container py-5">
        <div className="text-center mb-5">
          <p className="section-label">Why Choose Us</p>
          <h2 className="section-title">Built for Speed, Privacy &amp; Quality</h2>
        </div>
        <div className="row g-4">
          {features.map((f) => (
            <div key={f.title} className="col-sm-6 col-lg">
              <div className="glass-card why-card h-100">
                <span className="why-icon">{f.emoji}</span>
                <h3 className="fw-bold fs-6 mb-1">{f.title}</h3>
                <p className="text-secondary" style={{ fontSize: '.85rem' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
