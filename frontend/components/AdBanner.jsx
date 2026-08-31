export default function AdBanner({ label = 'Advertisement · Google AdSense Banner' }) {
  return (
    <div className="ad-banner" aria-label="Advertisement">
      <i className="bi bi-megaphone fs-2"></i>
      <span>{label}</span>
    </div>
  )
}
