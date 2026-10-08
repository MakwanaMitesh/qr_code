'use client'
import { useState } from 'react'

export default function BlogShareBar({ title }) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div className="blog-share-btns">
      <button
        className="blog-share-btn"
        onClick={handleCopyLink}
        title={copied ? 'Link Copied!' : 'Copy Link'}
        style={{ background: copied ? '#dcfce7' : '#ffffff', color: copied ? '#15803d' : '#64748b', border: copied ? '1px solid #bbf7d0' : '1px solid #e2e8f0' }}
      >
        <i className={`bi ${copied ? 'bi-check-lg' : 'bi-link-45deg'}`}></i>
      </button>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(pageUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="blog-share-btn"
        title="Share on X"
      >
        <i className="bi bi-twitter-x"></i>
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="blog-share-btn"
        title="Share on LinkedIn"
      >
        <i className="bi bi-linkedin"></i>
      </a>
    </div>
  )
}
