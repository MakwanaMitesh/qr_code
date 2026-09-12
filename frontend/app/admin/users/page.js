'use client'
import { useEffect, useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

/* ── Modal Dialog Styles ────────────────────────── */
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

/* ── Filament Numbered Pagination Component ────── */
export function FilamentPagination({ page, totalPages, onPageChange, loading }) {
  if (!totalPages || totalPages <= 1) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <button className="fl-num-btn disabled" disabled>&laquo;</button>
        <button className="fl-num-btn disabled" disabled>&lsaquo;</button>
        <button className="fl-num-btn active">1</button>
        <button className="fl-num-btn disabled" disabled>&rsaquo;</button>
        <button className="fl-num-btn disabled" disabled>&raquo;</button>
      </div>
    )
  }

  const getPages = () => {
    const pages = []
    const delta = 2
    const left = Math.max(1, page - delta)
    const right = Math.min(totalPages, page + delta)

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        pages.push(i)
      }
    }

    const result = []
    let l = null

    for (let p of pages) {
      if (l) {
        if (p - l === 2) {
          result.push(l + 1)
        } else if (p - l > 2) {
          result.push('...')
        }
      }
      result.push(p)
      l = p
    }

    return result
  }

  const pageItems = getPages()

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {/* First Page « */}
      <button
        onClick={() => onPageChange(1)}
        disabled={page === 1 || loading}
        className="fl-num-btn"
        title="First Page"
      >
        &laquo;
      </button>

      {/* Previous Page < */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1 || loading}
        className="fl-num-btn"
        title="Previous Page"
      >
        &lsaquo;
      </button>

      {/* Numbered Page Buttons */}
      {pageItems.map((item, idx) => {
        if (item === '...') {
          return (
            <span key={`dots-${idx}`} style={{ padding: '0 4px', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem' }}>
              ...
            </span>
          )
        }

        const isActive = item === page
        return (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            disabled={loading}
            className={`fl-num-btn ${isActive ? 'active' : ''}`}
          >
            {item}
          </button>
        )
      })}

      {/* Next Page > */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || loading}
        className="fl-num-btn"
        title="Next Page"
      >
        &rsaquo;
      </button>

      {/* Last Page » */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={page >= totalPages || loading}
        className="fl-num-btn"
        title="Last Page"
      >
        &raquo;
      </button>
    </div>
  )
}

/* ── User Form Modal Component ──────────────────── */
function UserModal({ initialData = null, onSave, onClose }) {
  const isEditing = !!initialData
  const [formData, setFormData] = useState({
    email: initialData?.email || '',
    password: '',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    role: initialData?.role || 'USER',
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email) return alert('Email is required')
    if (!isEditing && !formData.password) return alert('Password is required for new users')
    
    setSubmitting(true)
    await onSave(formData, isEditing ? initialData.id : null)
    setSubmitting(false)
  }

  return (
    <div style={dlgOverlay}>
      <div style={{ ...dlgBox, width: 440, maxWidth: '95vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className={`bi ${isEditing ? 'bi-pencil-square' : 'bi-person-plus'}`} style={{ color: '#2563eb' }}></i>
            {isEditing ? 'Edit User' : 'Create New User'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label className="fl-label">Email<span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="email"
              className="fl-input"
              value={formData.email}
              onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
              placeholder="user@example.com"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label className="fl-label">First Name</label>
              <input
                className="fl-input"
                value={formData.firstName}
                onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                placeholder="John"
              />
            </div>
            <div>
              <label className="fl-label">Last Name</label>
              <input
                className="fl-input"
                value={formData.lastName}
                onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                placeholder="Doe"
              />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="fl-label">
              Password {isEditing && <span style={{ color: '#94a3b8', fontWeight: 400 }}>(leave blank to keep unchanged)</span>}
              {!isEditing && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <input
              type="password"
              className="fl-input"
              value={formData.password}
              onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
              placeholder={isEditing ? '••••••••' : 'Enter password'}
              required={!isEditing}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label className="fl-label">Role</label>
              <select
                className="fl-select"
                value={formData.role}
                onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
              >
                <option value="USER">User (Standard)</option>
                <option value="ADMIN">Admin (Full)</option>
              </select>
            </div>
            <div>
              <label className="fl-label">Status</label>
              <select
                className="fl-select"
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={e => setFormData(p => ({ ...p, isActive: e.target.value === 'active' }))}
              >
                <option value="active">Active</option>
                <option value="inactive">Deactivated</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="fl-page-btn" style={{ padding: '8px 16px' }}>Cancel</button>
            <button type="submit" disabled={submitting} className="fl-add-btn" style={{ opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Confirm Delete Modal Component ─────────────── */
function ConfirmDeleteModal({ email, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false)
  const handleConfirm = async () => {
    setDeleting(true)
    await onConfirm()
    setDeleting(false)
  }

  return (
    <div style={dlgOverlay}>
      <div style={{ ...dlgBox, width: 400, maxWidth: '95vw', textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '1.3rem' }}>
          <i className="bi bi-exclamation-triangle-fill"></i>
        </div>
        <h3 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>Delete User</h3>
        <p style={{ color: '#64748b', marginBottom: 24, fontSize: '0.88rem', lineHeight: 1.5 }}>
          Are you sure you want to delete <strong>{email}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onClose} className="fl-page-btn" style={{ padding: '8px 16px' }}>Cancel</button>
          <button onClick={handleConfirm} disabled={deleting} className="fl-add-btn" style={{ background: '#dc2626', opacity: deleting ? 0.7 : 1 }}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   MAIN AdminUsers Component
══════════════════════════════════════════════════ */
export default function AdminUsers() {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(5)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [deleteUser, setDeleteUser] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    const token = localStorage.getItem('qrcraft_token')
    try {
      const res = await fetch(`${API}/api/admin/users?page=${page}&limit=${limit}&search=${search}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('qrcraft_token')
        localStorage.removeItem('qrcraft_user')
        window.location.href = '/login'
        return
      }
      const result = await res.json()
      if (res.ok) {
        setData(result.data)
        setTotalPages(result.meta.totalPages || 1)
        setTotal(result.meta.total || result.data.length)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [page, limit])
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchUsers(); else setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const handleSaveUser = async (formData, userId) => {
    const token = localStorage.getItem('qrcraft_token')
    try {
      const url = userId ? `${API}/api/admin/users/${userId}` : `${API}/api/admin/users`
      const method = userId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      })

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('qrcraft_token')
        localStorage.removeItem('qrcraft_user')
        window.location.href = '/login'
        return
      }

      if (res.ok) {
        setShowModal(false)
        setEditUser(null)
        fetchUsers()
      } else {
        const err = await res.json()
        alert('Error: ' + (err.error || 'Failed to save user'))
      }
    } catch (err) {
      alert('Network error')
    }
  }

  const handleToggleStatus = async (user) => {
    const token = localStorage.getItem('qrcraft_token')
    try {
      const res = await fetch(`${API}/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !user.isActive })
      })

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('qrcraft_token')
        localStorage.removeItem('qrcraft_user')
        window.location.href = '/login'
        return
      }

      if (res.ok) {
        const updated = await res.json()
        setData(prev => prev.map(u => u.id === user.id ? { ...u, isActive: updated.isActive } : u))
      } else {
        const err = await res.json()
        alert('Error: ' + (err.error || 'Failed to update user status'))
      }
    } catch (err) {
      alert('Network error')
    }
  }

  const handleDeleteUser = async (userId) => {
    const token = localStorage.getItem('qrcraft_token')
    try {
      const res = await fetch(`${API}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('qrcraft_token')
        localStorage.removeItem('qrcraft_user')
        window.location.href = '/login'
        return
      }

      if (res.ok) {
        setDeleteUser(null)
        fetchUsers()
      } else {
        const err = await res.json()
        alert('Error: ' + (err.error || 'Failed to delete user'))
      }
    } catch (err) {
      alert('Network error')
    }
  }

  const columns = useMemo(() => [
    {
      header: 'User',
      accessorKey: 'email',
      cell: info => {
        const row = info.row.original
        const name = [row.firstName, row.lastName].filter(Boolean).join(' ') || '—'
        const initials = (row.firstName?.[0] || row.email[0]).toUpperCase()
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem' }}>{name}</div>
              <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{info.getValue()}</div>
            </div>
          </div>
        )
      }
    },
    {
      header: 'Role',
      accessorKey: 'role',
      cell: info => {
        const isAdmin = info.getValue() === 'ADMIN'
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
            background: isAdmin ? '#eff6ff' : '#f8fafc',
            color: isAdmin ? '#2563eb' : '#475569',
            border: `1px solid ${isAdmin ? '#bfdbfe' : '#e2e8f0'}`,
          }}>
            <i className={`bi ${isAdmin ? 'bi-shield-check' : 'bi-person'}`}></i>
            {isAdmin ? 'Admin' : 'User'}
          </span>
        )
      }
    },
    {
      header: 'Joined',
      accessorKey: 'createdAt',
      cell: info => {
        const d = new Date(info.getValue())
        return (
          <div>
            <div style={{ fontWeight: 500, color: '#374151', fontSize: '0.83rem' }}>
              {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        )
      }
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: info => {
        const row = info.row.original
        const active = row.isActive !== false
        return (
          <button
            onClick={() => handleToggleStatus(row)}
            title={active ? 'Click to Deactivate User' : 'Click to Activate User'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 11px', borderRadius: 12,
              background: active ? '#dcfce7' : '#fef2f2',
              color: active ? '#15803d' : '#dc2626',
              border: `1px solid ${active ? '#bbf7d0' : '#fecaca'}`,
              fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
            {active ? 'Active' : 'Deactivated'}
          </button>
        )
      }
    },
    {
      id: 'actions',
      header: '',
      cell: info => {
        const row = info.row.original
        return (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setEditUser(row); setShowModal(true) }}
              style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#2563eb', fontSize: '0.82rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              title="Edit User"
            >
              <i className="bi bi-pencil"></i> Edit
            </button>
            <button
              onClick={() => setDeleteUser(row)}
              style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#dc2626', fontSize: '0.82rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              title="Delete User"
            >
              <i className="bi bi-trash3"></i> Delete
            </button>
          </div>
        )
      }
    }
  ], [])

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

  // Calculate pagination range info
  const from = total > 0 ? (page - 1) * limit + 1 : 0
  const to = Math.min(page * limit, total)

  return (
    <>
      <style>{`
        .fl-users-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; }
        .fl-users-toolbar { padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; gap: 16px; flex-wrap: wrap; }
        .fl-search-wrap { position: relative; }
        .fl-search-wrap input { padding: 8px 12px 8px 34px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.88rem; width: 280px; outline: none; color: #0f172a; background: #ffffff; transition: border-color 0.15s; font-family: inherit; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
        .fl-search-wrap input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
        .fl-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 0.85rem; }
        .fl-add-btn { padding: 9px 18px; background: #2563eb; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.15s; font-family: inherit; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
        .fl-add-btn:hover { background: #1d4ed8; }
        .fl-users-table { width: 100%; border-collapse: collapse; }
        .fl-users-table th { padding: 12px 20px; background: #f8fafc; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #64748b; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .fl-users-table td { padding: 14px 20px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .fl-users-table tr:last-child td { border-bottom: none; }
        .fl-users-table tbody tr { transition: background 0.12s; }
        .fl-users-table tbody tr:hover { background: #f8fafc; }
        
        .fl-pagination-bar { padding: 14px 20px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #ffffff; flex-wrap: wrap; gap: 12px; }
        .fl-page-info { font-size: 0.85rem; color: #64748b; }
        .fl-page-info strong { color: #0f172a; font-weight: 700; }
        .fl-page-controls { display: flex; align-items: center; gap: 12px; }
        .fl-limit-select { padding: 5px 8px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 0.82rem; color: #374151; background: #ffffff; cursor: pointer; outline: none; font-family: inherit; }

        /* Exact Filament Numbered Page Buttons */
        .fl-num-btn {
          min-width: 36px;
          height: 36px;
          padding: 0 10px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          font-family: inherit;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
        }
        .fl-num-btn:hover:not(:disabled):not(.active) {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }
        .fl-num-btn.active {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #2563eb;
          font-weight: 700;
          box-shadow: 0 1px 3px 0 rgba(37, 99, 235, 0.15);
        }
        .fl-num-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          background: #f8fafc;
        }

        .fl-label { display: block; margin-bottom: 6px; font-size: 0.85rem; font-weight: 600; color: #374151; }
        .fl-input, .fl-select { width: 100%; background: #ffffff; border: 1px solid #d1d5db; border-radius: 8px; color: #0f172a; padding: 9px 12px; font-size: 0.9rem; outline: none; font-family: inherit; box-sizing: border-box; }
        .fl-input:focus, .fl-select:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
      `}</style>

      {/* User Create/Edit Modal */}
      {showModal && (
        <UserModal
          initialData={editUser}
          onSave={handleSaveUser}
          onClose={() => { setShowModal(false); setEditUser(null) }}
        />
      )}

      {/* Delete User Modal */}
      {deleteUser && (
        <ConfirmDeleteModal
          email={deleteUser.email}
          onConfirm={() => handleDeleteUser(deleteUser.id)}
          onClose={() => setDeleteUser(null)}
        />
      )}

      {/* Filament Table Card */}
      <div className="fl-users-card">
        <div className="fl-users-toolbar">
          <div className="fl-search-wrap">
            <i className="bi bi-search fl-search-icon"></i>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="fl-add-btn" onClick={() => { setEditUser(null); setShowModal(true) }}>
            <i className="bi bi-plus-lg"></i> Add User
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="fl-users-table">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
                    <div style={{ display: 'inline-block', width: 32, height: 32, borderRadius: '50%', border: '3px solid #e2e8f0', borderTop: '3px solid #2563eb', animation: 'spin 0.8s linear infinite' }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <div style={{ marginTop: 10, fontSize: '0.85rem' }}>Loading users...</div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
                    <i className="bi bi-people" style={{ fontSize: '2rem', color: '#94a3b8', display: 'block', marginBottom: 8 }}></i>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>No users found</div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Filament Table Pagination Bar */}
        <div className="fl-pagination-bar">
          <div className="fl-page-info">
            Showing <strong>{from}</strong> to <strong>{to}</strong> of <strong>{total}</strong> results &nbsp;·&nbsp; Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </div>

          <div className="fl-page-controls">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#64748b' }}>
              <span>Per page:</span>
              <select
                className="fl-limit-select"
                value={limit}
                onChange={e => { setLimit(Number(e.target.value)); setPage(1) }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Exact Numbered Pagination Buttons: « < 1 2 3 4 5 ... 13 > » */}
            <FilamentPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              loading={loading}
            />
          </div>
        </div>

      </div>
    </>
  )
}
