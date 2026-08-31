export default function Footer() {
  return (
    <footer id="footer" aria-label="Site footer">
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-4">
            <div className="footer-brand">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="navbar-brand-logo">
                  <i className="bi bi-qr-code-scan text-white"></i>
                </div>
                <span className="fw-bold fs-5 gradient-text">QRCraft</span>
              </div>
              <p>The all-in-one platform to generate QR codes, barcodes and more instantly. Fast, free and easy to use.</p>
              <div className="d-flex gap-2 mt-3">
                {[
                  ['fb', 'bi-facebook', 'Facebook'],
                  ['tw', 'bi-twitter-x', 'Twitter'],
                  ['ig', 'bi-instagram', 'Instagram'],
                  ['li', 'bi-linkedin', 'LinkedIn'],
                  ['yt', 'bi-youtube', 'YouTube'],
                ].map(([id, icon, label]) => (
                  <a key={id} href="#" className="social-btn" aria-label={label} id={`social-${id}`}>
                    <i className={`bi ${icon}`}></i>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-lg-2">
            <p className="footer-heading">Tools</p>
            {[
              ['footer-qr', '#live-generator', 'QR Code Generator'],
              ['footer-barcode', '#live-generator', 'Barcode Generator'],
              ['footer-wifi', '#popular-tools', 'Wi-Fi QR Code'],
              ['footer-url', '#popular-tools', 'URL QR Code'],
              ['footer-all', '#popular-tools', 'All Tools'],
            ].map(([id, href, label]) => (
              <a key={id} href={href} className="footer-link" id={id}>{label}</a>
            ))}
          </div>

          <div className="col-sm-6 col-lg-2">
            <p className="footer-heading">Resources</p>
            {[
              ['footer-how', '#how-it-works', 'How It Works'],
              ['footer-faq', '#faq', 'FAQ'],
              ['footer-blog', '#', 'Blog'],
              ['footer-contact', '#', 'Contact Us'],
            ].map(([id, href, label]) => (
              <a key={id} href={href} className="footer-link" id={id}>{label}</a>
            ))}
          </div>

          <div className="col-sm-6 col-lg-2">
            <p className="footer-heading">Legal</p>
            <a href="#" className="footer-link" id="footer-privacy">Privacy Policy</a>
            <a href="#" className="footer-link" id="footer-terms">Terms &amp; Conditions</a>
            <a href="#" className="footer-link" id="footer-disclaimer">Disclaimer</a>
          </div>

          <div className="col-sm-6 col-lg-2">
            <p className="footer-heading">Contact</p>
            <p className="footer-link" style={{ cursor: 'default' }}>support@qrcraft.app</p>
            <p className="footer-link" style={{ cursor: 'default' }}>+1 (123) 456-7890</p>
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 footer-bottom">
          <p className="mb-0">
            &copy; 2025 QRCraft. All rights reserved. Made with{' '}
            <span style={{ color: '#f472b6' }}>&#9829;</span>
          </p>
          <div className="d-flex gap-3">
            <a href="#" className="footer-link mb-0" id="footer-privacy-inline">Privacy Policy</a>
            <a href="#" className="footer-link mb-0" id="footer-terms-inline">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
