'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

function getStats(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = text ? text.split(' ').length : 0
  const minutes = Math.max(1, Math.ceil(words / 200))
  return { words, minutes }
}

function slugify(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/* ── Filament Toolbar Button ──────────────────────────── */
function ToolBtn({ title, icon, onClick, active }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick() }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        minWidth: 32, height: 32, border: 'none', borderRadius: 6,
        background: active ? '#eff6ff' : hover ? '#f1f5f9' : 'transparent',
        color: active ? '#2563eb' : hover ? '#1e293b' : '#64748b',
        cursor: 'pointer', fontSize: 14, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        transition: 'all 0.12s ease', padding: '0 5px', fontFamily: 'inherit',
        fontWeight: active ? 700 : 500,
      }}
    >
      {icon}
    </button>
  )
}

function Sep() {
  return <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 4px', flexShrink: 0 }} />
}

/* ── Filament Dialogs ─────────────────────────────────── */
const dlgOverlay = {
  position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999,
  backdropFilter: 'blur(3px)',
}
const dlgBox = {
  background: '#ffffff',
  border: '1px solid #e2e8f0', borderRadius: 12,
  padding: 24, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
}

function ImageDialog({ onInsert, onClose }) {
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const fileRef = useRef()
  const handleFile = e => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setUrl(ev.target.result)
    reader.readAsDataURL(file)
  }
  return (
    <div style={dlgOverlay}>
      <div style={{ ...dlgBox, width: 480, maxWidth: '95vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-image" style={{ color: '#2563eb' }}></i> Insert Image
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="fl-label">Image URL</label>
          <input className="fl-input" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
          <button type="button" onClick={() => fileRef.current.click()} style={{
            width: '100%', padding: '12px', borderRadius: 8,
            border: '2px dashed #cbd5e1', background: '#f8fafc',
            color: '#2563eb', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            <i className="bi bi-cloud-arrow-up" style={{ fontSize: '1.1rem' }}></i> Browse from device
          </button>
        </div>
        {url && (
          <div style={{ marginBottom: 14, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#000' }}>
            <img src={url} alt="preview" style={{ width: '100%', maxHeight: 180, objectFit: 'contain' }} />
          </div>
        )}
        <div style={{ marginBottom: 20 }}>
          <label className="fl-label">Alt text</label>
          <input className="fl-input" value={alt} onChange={e => setAlt(e.target.value)} placeholder="Describe the image..." />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} className="fl-btn-secondary">Cancel</button>
          <button type="button" onClick={() => { onInsert(url, alt); onClose() }} disabled={!url} className="fl-btn-primary" style={{ opacity: url ? 1 : 0.5 }}>Insert Image</button>
        </div>
      </div>
    </div>
  )
}

function LinkDialog({ onInsert, onClose }) {
  const [href, setHref] = useState('')
  const [text, setText] = useState('')
  return (
    <div style={dlgOverlay}>
      <div style={{ ...dlgBox, width: 420, maxWidth: '95vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-link-45deg" style={{ color: '#2563eb' }}></i> Insert Link
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="fl-label">URL</label>
          <input className="fl-input" value={href} onChange={e => setHref(e.target.value)} placeholder="https://example.com" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label className="fl-label">Link text (optional)</label>
          <input className="fl-input" value={text} onChange={e => setText(e.target.value)} placeholder="Click here" />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} className="fl-btn-secondary">Cancel</button>
          <button type="button" onClick={() => { onInsert(href, text); onClose() }} disabled={!href} className="fl-btn-primary" style={{ opacity: href ? 1 : 0.5 }}>Insert Link</button>
        </div>
      </div>
    </div>
  )
}

export function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={dlgOverlay}>
      <div style={{ ...dlgBox, width: 400, maxWidth: '95vw', textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '1.3rem' }}>
          <i className="bi bi-exclamation-triangle-fill"></i>
        </div>
        <h3 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>Are you sure?</h3>
        <p style={{ color: '#64748b', marginBottom: 24, fontSize: '0.88rem', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onCancel} className="fl-btn-secondary">Cancel</button>
          <button onClick={onConfirm} className="fl-btn-primary" style={{ background: '#dc2626' }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   MAIN BlogEditor Component
══════════════════════════════════════════════════════ */
export default function BlogEditor({ initialData = {}, editingId = null }) {
  const router = useRouter()
  const editorRef = useRef(null)
  const savedRange = useRef(null)
  const fileInputRef = useRef()

  const [formData, setFormData] = useState({
    title: '', slug: '', excerpt: '', content: '',
    published: false, coverImage: '',
    metaTitle: '', metaDescription: '', ogImage: '', canonicalUrl: '', tags: '',
    author: 'Admin User', category: 'General', publishDate: new Date().toISOString().split('T')[0],
    ...initialData,
  })

  // Normalize initial slug if present
  useEffect(() => {
    if (initialData.slug) {
      setFormData(prev => ({ ...prev, slug: slugify(initialData.slug) }))
    }
  }, [initialData])

  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [showImgDialog, setShowImgDialog] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [activeFormats, setActiveFormats] = useState({})
  const [seoOpen, setSeoOpen] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    if (editorRef.current && initialData.content) {
      editorRef.current.innerHTML = initialData.content
      syncContent()
    }
  }, [])

  const syncContent = useCallback(() => {
    if (editorRef.current)
      setFormData(prev => ({ ...prev, content: editorRef.current.innerHTML }))
  }, [])

  const checkFormats = useCallback(() => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strike: document.queryCommandState('strikeThrough'),
    })
  }, [])

  const saveRange = () => {
    const sel = window.getSelection()
    if (sel?.rangeCount) savedRange.current = sel.getRangeAt(0).cloneRange()
  }
  const restoreRange = () => {
    if (savedRange.current) {
      const sel = window.getSelection()
      sel.removeAllRanges(); sel.addRange(savedRange.current)
    }
  }

  const exec = (cmd, val = null) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    checkFormats(); syncContent()
  }

  const insertHeading = tag => {
    if (!tag) return
    editorRef.current?.focus()
    document.execCommand('formatBlock', false, tag)
    syncContent()
  }

  const insertImage = (url, alt) => {
    restoreRange(); editorRef.current?.focus()
    document.execCommand('insertHTML', false,
      `<figure style="margin:1.5em 0;text-align:center"><img src="${url}" alt="${alt||''}" style="max-width:100%;border-radius:8px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)"/>${alt?`<figcaption style="color:#64748b;font-size:0.8rem;margin-top:6px">${alt}</figcaption>`:''}</figure><p><br></p>`)
    syncContent()
  }

  const insertLink = (href, text) => {
    restoreRange(); editorRef.current?.focus()
    const sel = window.getSelection()
    const label = sel?.toString() || text || href
    document.execCommand('insertHTML', false, `<a href="${href}" target="_blank" rel="noopener" style="color:#2563eb">${label}</a>`)
    syncContent()
  }

  const insertHR = () => {
    editorRef.current?.focus()
    document.execCommand('insertHTML', false, '<hr style="border:none;border-top:1px solid #e2e8f0;margin:2em 0"><p><br></p>')
    syncContent()
  }

  const insertCode = () => {
    const sel = window.getSelection()
    const t = sel?.toString() || 'code'
    exec('insertHTML', `<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-family:monospace;color:#0f172a;font-size:0.88em">${t}</code>`)
  }

  const insertCodeBlock = () => {
    exec('insertHTML', `<pre style="background:#0f172a;border-radius:8px;padding:16px;overflow-x:auto;font-family:monospace;color:#f8fafc;font-size:0.88rem;margin:1.5em 0"><code>// your code here</code></pre><p><br></p>`)
  }

  const handleTitleChange = val => {
    setFormData(prev => {
      const next = { ...prev, title: val }
      if (!editingId || !prev.slug) next.slug = slugify(val)
      if (!prev.metaTitle || prev.metaTitle === prev.title) next.metaTitle = val
      return next
    })
  }

  const handleSlugChange = val => {
    setFormData(prev => ({ ...prev, slug: slugify(val) }))
  }

  const handleCoverUpload = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setFormData(p => ({ ...p, coverImage: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const handleSave = async (publish = null, createAnother = false) => {
    const token = localStorage.getItem('qrcraft_token')
    if (!token) {
      alert('Session expired. Please log in again.')
      window.location.href = '/login'
      return
    }

    const cleanSlug = slugify(formData.slug || formData.title)

    const payload = {
      ...formData,
      slug: cleanSlug,
      content: editorRef.current?.innerHTML || formData.content,
      published: publish !== null ? publish : formData.published,
    }
    if (!payload.title || !payload.slug) return alert('Title and slug are required.')
    setSaving(true)
    try {
      const url = editingId ? `${API}/api/admin/blogs/${editingId}` : `${API}/api/admin/blogs`
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setSaveStatus('saved'); setTimeout(() => setSaveStatus(null), 3000)
        if (publish !== null) setFormData(p => ({ ...p, published: publish, slug: cleanSlug }))
        if (createAnother) {
          setFormData({
            title: '', slug: '', excerpt: '', content: '',
            published: false, coverImage: '',
            metaTitle: '', metaDescription: '', ogImage: '', canonicalUrl: '', tags: '',
            author: 'Admin User', category: 'General', publishDate: new Date().toISOString().split('T')[0],
          })
          if (editorRef.current) editorRef.current.innerHTML = ''
        } else if (!editingId) {
          const d = await res.json(); router.replace(`/admin/blogs/${d.id}/edit`)
        }
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('qrcraft_token')
        localStorage.removeItem('qrcraft_user')
        alert('Your admin session has expired or is invalid. Please log in again.')
        window.location.href = '/login'
      } else {
        const err = await res.json(); setSaveStatus('error'); alert('Error: ' + (err.error || 'Unknown error'))
      }
    } catch { setSaveStatus('error'); alert('Network error') }
    finally { setSaving(false) }
  }

  const stats = getStats(formData.content)

  return (
    <>
      <style>{`
        /* Filament Light Design System */
        .fl-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
          margin-bottom: 24px;
        }

        .fl-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .fl-card-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .fl-label {
          display: block;
          margin-bottom: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #374151;
        }
        .fl-req {
          color: #ef4444;
          margin-left: 2px;
        }

        .fl-input, .fl-select, .fl-textarea {
          width: 100%;
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          color: #0f172a;
          padding: 9px 12px;
          font-size: 0.9rem;
          outline: none;
          font-family: inherit;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .fl-input:focus, .fl-select:focus, .fl-textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
        .fl-input::placeholder, .fl-textarea::placeholder {
          color: #94a3b8;
        }

        /* Filament Rich Text Editor */
        .fl-editor-wrapper {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          overflow: hidden;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .fl-editor-toolbar {
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 8px 12px;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          flex-wrap: wrap;
        }
        .fl-editable {
          min-height: 220px;
          padding: 16px;
          color: #0f172a;
          font-size: 0.95rem;
          line-height: 1.7;
          outline: none;
        }
        .fl-editable:empty::before {
          content: attr(data-ph);
          color: #94a3b8;
          pointer-events: none;
        }
        .fl-editable h1 { font-size: 1.75rem; font-weight: 800; margin: 1em 0 0.4em; }
        .fl-editable h2 { font-size: 1.35rem; font-weight: 700; margin: 0.9em 0 0.35em; }
        .fl-editable h3 { font-size: 1.1rem; font-weight: 600; margin: 0.8em 0 0.3em; }
        .fl-editable p { margin: 0.6em 0; }
        .fl-editable ul, .fl-editable ol { padding-left: 1.5em; margin: 0.6em 0; }
        .fl-editable blockquote { border-left: 3px solid #2563eb; margin: 1.2em 0; padding: 0.4em 1em; background: #eff6ff; color: #1e40af; border-radius: 0 6px 6px 0; }
        .fl-editable pre { background: #0f172a; color: #f8fafc; padding: 14px; border-radius: 6px; font-family: monospace; }
        .fl-editable img { max-width: 100%; border-radius: 6px; }

        /* Drag and drop dropzone */
        .fl-dropzone {
          border: 2px dashed #cbd5e1;
          border-radius: 8px;
          background: #f8fafc;
          padding: 28px 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .fl-dropzone:hover {
          border-color: #2563eb;
          background: #eff6ff;
        }

        /* Buttons */
        .fl-btn-primary {
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 9px 20px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          transition: background 0.15s ease;
        }
        .fl-btn-primary:hover {
          background: #1d4ed8;
        }
        .fl-btn-secondary {
          background: #ffffff;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 9px 20px;
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          transition: all 0.15s ease;
        }
        .fl-btn-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        /* Tag pill */
        .fl-tag {
          display: inline-flex;
          align-items: center;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          border-radius: 16px;
          padding: 3px 10px;
          font-size: 0.78rem;
          font-weight: 600;
          margin: 2px;
        }

        /* Toggle Switch */
        .fl-switch {
          width: 44px;
          height: 24px;
          border-radius: 12px;
          position: relative;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .fl-switch-handle {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ffffff;
          position: absolute;
          top: 3px;
          transition: left 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        /* Save Toast */
        .fl-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #0f172a;
          color: #ffffff;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 600;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>

      {/* Dialogs */}
      {showImgDialog && <ImageDialog onInsert={insertImage} onClose={() => setShowImgDialog(false)} />}
      {showLinkDialog && <LinkDialog onInsert={insertLink} onClose={() => setShowLinkDialog(false)} />}

      {/* Save Notification Toast */}
      {saveStatus === 'saved' && (
        <div className="fl-toast">
          <i className="bi bi-check-circle-fill" style={{ color: '#22c55e' }}></i> Post saved successfully
        </div>
      )}

      {/* 2-Column Filament Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

        {/* ════════ LEFT COLUMN: Main Form Card ════════ */}
        <div>
          <div className="fl-card">
            {/* Title & Slug */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="fl-label">Title<span className="fl-req">*</span></label>
                <input
                  className="fl-input"
                  value={formData.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="Enter post title..."
                  required
                />
              </div>
              <div>
                <label className="fl-label">Slug</label>
                <input
                  className="fl-input"
                  value={formData.slug}
                  onChange={e => handleSlugChange(e.target.value)}
                  placeholder="post-url-slug"
                />
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                  URL: /blog/{formData.slug || 'slug'}
                </div>
              </div>
            </div>

            {/* Content (Rich Text Editor) */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="fl-label" style={{ margin: 0 }}>Content<span className="fl-req">*</span></label>
                <button
                  type="button"
                  onClick={() => setPreviewMode(p => !p)}
                  style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <i className={`bi ${previewMode ? 'bi-pencil-square' : 'bi-eye'}`}></i>
                  {previewMode ? 'Edit Mode' : 'Preview'}
                </button>
              </div>

              <div className="fl-editor-wrapper">
                {!previewMode && (
                  <div className="fl-editor-toolbar">
                    <ToolBtn title="Bold" icon={<i className="bi bi-type-bold"></i>} active={activeFormats.bold} onClick={() => exec('bold')} />
                    <ToolBtn title="Italic" icon={<i className="bi bi-type-italic"></i>} active={activeFormats.italic} onClick={() => exec('italic')} />
                    <ToolBtn title="Underline" icon={<i className="bi bi-type-underline"></i>} active={activeFormats.underline} onClick={() => exec('underline')} />
                    <ToolBtn title="Strikethrough" icon={<i className="bi bi-type-strikethrough"></i>} active={activeFormats.strike} onClick={() => exec('strikeThrough')} />
                    <Sep />
                    <ToolBtn title="Inline Code" icon={<i className="bi bi-code"></i>} onClick={insertCode} />
                    <ToolBtn title="Code Block" icon={<i className="bi bi-code-square"></i>} onClick={insertCodeBlock} />
                    <ToolBtn title="Link" icon={<i className="bi bi-link-45deg"></i>} onClick={() => { saveRange(); setShowLinkDialog(true) }} />
                    <Sep />
                    <ToolBtn title="Heading 2" icon={<span style={{ fontWeight: 700, fontSize: '0.85rem' }}>H2</span>} onClick={() => insertHeading('h2')} />
                    <ToolBtn title="Heading 3" icon={<span style={{ fontWeight: 700, fontSize: '0.85rem' }}>H3</span>} onClick={() => insertHeading('h3')} />
                    <Sep />
                    <ToolBtn title="Align Left" icon={<i className="bi bi-text-left"></i>} onClick={() => exec('justifyLeft')} />
                    <ToolBtn title="Align Center" icon={<i className="bi bi-text-center"></i>} onClick={() => exec('justifyCenter')} />
                    <ToolBtn title="Align Right" icon={<i className="bi bi-text-right"></i>} onClick={() => exec('justifyRight')} />
                    <Sep />
                    <ToolBtn title="Quote" icon={<i className="bi bi-quote"></i>} onClick={() => insertHeading('blockquote')} />
                    <ToolBtn title="Bullet List" icon={<i className="bi bi-list-ul"></i>} onClick={() => exec('insertUnorderedList')} />
                    <ToolBtn title="Numbered List" icon={<i className="bi bi-list-ol"></i>} onClick={() => exec('insertOrderedList')} />
                    <Sep />
                    <ToolBtn title="Image" icon={<i className="bi bi-image"></i>} onClick={() => { saveRange(); setShowImgDialog(true) }} />
                    <ToolBtn title="Horizontal Rule" icon={<i className="bi bi-hr"></i>} onClick={insertHR} />
                    <Sep />
                    <ToolBtn title="Undo" icon={<i className="bi bi-arrow-counterclockwise"></i>} onClick={() => exec('undo')} />
                    <ToolBtn title="Redo" icon={<i className="bi bi-arrow-clockwise"></i>} onClick={() => exec('redo')} />
                  </div>
                )}

                <div style={{ padding: '4px' }}>
                  {previewMode ? (
                    <div
                      className="fl-editable"
                      dangerouslySetInnerHTML={{ __html: formData.content || '<p style="color:#94a3b8">Nothing to preview...</p>' }}
                    />
                  ) : (
                    <div
                      ref={editorRef}
                      className="fl-editable"
                      contentEditable
                      suppressContentEditableWarning
                      data-ph="Start typing post content..."
                      onInput={syncContent}
                      onKeyUp={checkFormats}
                      onMouseUp={checkFormats}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Author & Post Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="fl-label">Author<span className="fl-req">*</span></label>
                <select
                  className="fl-select"
                  value={formData.author}
                  onChange={e => setFormData(p => ({ ...p, author: e.target.value }))}
                >
                  <option value="Admin User">Admin User</option>
                  <option value="Editorial Team">Editorial Team</option>
                </select>
              </div>
              <div>
                <label className="fl-label">Post category<span className="fl-req">*</span></label>
                <select
                  className="fl-select"
                  value={formData.category}
                  onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                >
                  <option value="General">General</option>
                  <option value="QR Codes">QR Codes</option>
                  <option value="Tutorials">Tutorials</option>
                  <option value="Updates">Updates</option>
                </select>
              </div>
            </div>

            {/* Publishing Date & Tags */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label className="fl-label">Publishing date</label>
                <input
                  type="date"
                  className="fl-input"
                  value={formData.publishDate}
                  onChange={e => setFormData(p => ({ ...p, publishDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="fl-label">Tags</label>
                <input
                  className="fl-input"
                  value={formData.tags}
                  onChange={e => setFormData(p => ({ ...p, tags: e.target.value }))}
                  placeholder="New tag (comma separated)"
                />
                {formData.tags && (
                  <div style={{ marginTop: 8 }}>
                    {formData.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                      <span key={t} className="fl-tag">#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Excerpt Summary */}
            <div style={{ marginBottom: 24 }}>
              <label className="fl-label">Excerpt / Summary</label>
              <textarea
                className="fl-textarea"
                rows={2}
                value={formData.excerpt}
                onChange={e => setFormData(p => ({ ...p, excerpt: e.target.value }))}
                placeholder="A short summary shown in post listings..."
              />
            </div>

            {/* Action Buttons Bar */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={() => handleSave(true, false)}
                disabled={saving}
                className="fl-btn-primary"
              >
                {saving ? 'Creating...' : editingId ? 'Save changes' : 'Create'}
              </button>

              {!editingId && (
                <button
                  type="button"
                  onClick={() => handleSave(true, true)}
                  disabled={saving}
                  className="fl-btn-secondary"
                >
                  Create & create another
                </button>
              )}

              <button
                type="button"
                onClick={() => router.push('/admin/blogs')}
                className="fl-btn-secondary"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>

        {/* ════════ RIGHT COLUMN: Sidebar Cards ════════ */}
        <div>

          {/* Image Card */}
          <div className="fl-card">
            <div className="fl-card-header">
              <h4 className="fl-card-title">Image</h4>
              <i className="bi bi-chevron-up" style={{ fontSize: '0.8rem', color: '#94a3b8' }}></i>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              style={{ display: 'none' }}
            />

            <div
              className="fl-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.coverImage ? (
                <div style={{ position: 'relative' }}>
                  <img
                    src={formData.coverImage}
                    alt="Cover"
                    style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 6 }}
                  />
                  <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#2563eb', fontWeight: 600 }}>
                    Click to change image
                  </div>
                </div>
              ) : (
                <div>
                  <i className="bi bi-cloud-upload" style={{ fontSize: '1.8rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}></i>
                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                    Drag & Drop your files or <span style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}>Browse</span>
                  </div>
                </div>
              )}
            </div>

            {/* URL option */}
            <div style={{ marginTop: 12 }}>
              <label className="fl-label" style={{ fontSize: '0.78rem' }}>Image URL</label>
              <input
                className="fl-input"
                style={{ fontSize: '0.82rem' }}
                value={formData.coverImage}
                onChange={e => setFormData(p => ({ ...p, coverImage: e.target.value }))}
                placeholder="https://image-url.com/..."
              />
            </div>
          </div>

          {/* Post Status Card */}
          <div className="fl-card">
            <div className="fl-card-header">
              <h4 className="fl-card-title">Publish Status</h4>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
                  {formData.published ? 'Published' : 'Draft'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {formData.published ? 'Live on site' : 'Visible only to admins'}
                </div>
              </div>

              <div
                className="fl-switch"
                onClick={() => setFormData(p => ({ ...p, published: !p.published }))}
                style={{ background: formData.published ? '#2563eb' : '#cbd5e1' }}
              >
                <div className="fl-switch-handle" style={{ left: formData.published ? 23 : 3 }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '1rem' }}>{stats.words}</div>
                <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600 }}>WORDS</div>
              </div>
              <div style={{ width: 1, background: '#e2e8f0' }} />
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '1rem' }}>{stats.minutes}</div>
                <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600 }}>MIN READ</div>
              </div>
            </div>
          </div>

          {/* SEO Accordion */}
          <div className="fl-card" style={{ padding: 0, overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setSeoOpen(p => !p)}
              style={{
                width: '100%', padding: '16px 24px', background: '#ffffff',
                border: 'none', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              <span className="fl-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="bi bi-search" style={{ color: '#2563eb', fontSize: '0.85rem' }}></i> SEO Settings
              </span>
              <i className={`bi ${seoOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`} style={{ fontSize: '0.8rem', color: '#94a3b8' }}></i>
            </button>

            {seoOpen && (
              <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ marginBottom: 14, paddingTop: 14 }}>
                  <label className="fl-label">Meta Title</label>
                  <input
                    className="fl-input"
                    value={formData.metaTitle}
                    onChange={e => setFormData(p => ({ ...p, metaTitle: e.target.value }))}
                    placeholder="SEO title (max 60 chars)"
                  />
                  <div style={{ textAlign: 'right', fontSize: '0.7rem', color: formData.metaTitle.length > 60 ? '#ef4444' : '#94a3b8', marginTop: 2 }}>
                    {formData.metaTitle.length}/60
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="fl-label">Meta Description</label>
                  <textarea
                    className="fl-textarea"
                    rows={3}
                    value={formData.metaDescription}
                    onChange={e => setFormData(p => ({ ...p, metaDescription: e.target.value }))}
                    placeholder="SEO description (max 160 chars)"
                  />
                  <div style={{ textAlign: 'right', fontSize: '0.7rem', color: formData.metaDescription.length > 160 ? '#ef4444' : '#94a3b8', marginTop: 2 }}>
                    {formData.metaDescription.length}/160
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="fl-label">OG / Social Image URL</label>
                  <input
                    className="fl-input"
                    value={formData.ogImage}
                    onChange={e => setFormData(p => ({ ...p, ogImage: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="fl-label">Canonical URL</label>
                  <input
                    className="fl-input"
                    value={formData.canonicalUrl}
                    onChange={e => setFormData(p => ({ ...p, canonicalUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                {/* Google Search Preview */}
                {(formData.metaTitle || formData.title) && (
                  <div style={{ marginTop: 16 }}>
                    <label className="fl-label" style={{ fontSize: '0.78rem' }}>Search Result Preview</label>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
                      <div style={{ color: '#1a0dab', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Arial, sans-serif' }}>
                        {(formData.metaTitle || formData.title).slice(0, 60)}
                      </div>
                      <div style={{ color: '#006621', fontSize: '0.72rem', fontFamily: 'Arial, sans-serif', margin: '2px 0' }}>
                        {formData.canonicalUrl || `qrcraft.app › blog › ${formData.slug}`}
                      </div>
                      <div style={{ color: '#4d5156', fontSize: '0.75rem', fontFamily: 'Arial, sans-serif', lineHeight: 1.4 }}>
                        {(formData.metaDescription || formData.excerpt || '').slice(0, 160) || 'No summary description provided.'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </>
  )
}
