const tools = [
  { icon: 'bi-qr-code',       label: 'QR Code' },
  { icon: 'bi-upc-scan',      label: 'Barcode' },
  { icon: 'bi-wifi',          label: 'Wi-Fi QR' },
  { icon: 'bi-link-45deg',    label: 'URL QR' },
  { icon: 'bi-person-vcard',  label: 'vCard QR' },
  { icon: 'bi-envelope',      label: 'Email QR' },
  { icon: 'bi-telephone',     label: 'Phone QR' },
  { icon: 'bi-geo-alt',       label: 'Location QR' },
  { icon: 'bi-calendar-event',label: 'Event QR' },
  { icon: 'bi-type',          label: 'Text QR' },
]

const doubled = [...tools, ...tools]

export default function ToolsStrip() {
  return (
    <div id="tools-strip" aria-hidden="true">
      <div className="tools-track">
        {doubled.map((t, i) => (
          <a key={i} href="#popular-tools" className="tool-chip">
            <i className={`bi ${t.icon}`}></i> {t.label}
          </a>
        ))}
      </div>
    </div>
  )
}
