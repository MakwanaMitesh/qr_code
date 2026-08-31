const steps = [
  {
    num: 1,
    icon: 'bi-grid-1x2',
    title: 'Choose Code Type',
    desc: 'Select the type of code you want to generate - QR, barcode, Wi-Fi, URL, vCard and more.',
  },
  {
    num: 2,
    icon: 'bi-pencil-square',
    title: 'Enter Information',
    desc: 'Enter the required details and customize your code with colors, size, and error correction levels.',
  },
  {
    num: 3,
    icon: 'bi-download',
    title: 'Generate & Download',
    desc: 'Generate your code and download it instantly as a high-resolution PNG or SVG.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" aria-label="How it works">
      <div className="container py-5">
        <div className="text-center mb-5">
          <p className="section-label">How It Works</p>
          <h2 className="section-title">Generate Codes in 3 Simple Steps</h2>
        </div>
        <div className="row g-4">
          {steps.map((s) => (
            <div key={s.num} className="col-md-4">
              <div className="glass-card step-card h-100">
                <div className="step-num">{s.num}</div>
                <div className="step-icon"><i className={`bi ${s.icon}`}></i></div>
                <h3 className="fw-bold fs-6 mb-2">{s.title}</h3>
                <p className="text-secondary" style={{ fontSize: '.88rem' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
