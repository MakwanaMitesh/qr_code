'use client'
import { useEffect, useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'

export default function AdminUsers() {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    const token = localStorage.getItem('qrcraft_token')
    try {
      const res = await fetch(`http://localhost:5001/api/admin/users?page=${page}&limit=7&search=${search}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await res.json()
      if (res.ok) {
        setData(result.data)
        setTotalPages(result.meta.totalPages)
        setTotal(result.meta.total || result.data.length)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [page])
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchUsers(); else setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const columns = useMemo(() => [
    {
      header: 'User',
      accessorKey: 'email',
      cell: info => {
        const row = info.row.original
        const name = [row.firstName, row.lastName].filter(Boolean).join(' ') || '—'
        const initials = (row.firstName?.[0] || row.email[0]).toUpperCase()
        const colors = ['#7c3aed', '#0891b2', '#d97706', '#059669', '#dc2626']
        const color = colors[info.row.index % colors.length]
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.95rem', flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>{name}</div>
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
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
            background: isAdmin ? '#f3e8ff' : '#f0fdf4',
            color: isAdmin ? '#7c3aed' : '#16a34a',
            border: `1px solid ${isAdmin ? '#e9d5ff' : '#bbf7d0'}`,
            letterSpacing: '0.5px'
          }}>
            <span>{isAdmin ? '🛡' : '👤'}</span> {info.getValue()}
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
            <div style={{ fontWeight: 600, color: '#374151', fontSize: '0.88rem' }}>
              {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '0.74rem' }}>{d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        )
      }
    },
    {
      header: 'Status',
      id: 'status',
      cell: () => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #bbf7d0' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          Active
        </span>
      )
    },
    {
      id: 'actions',
      header: '',
      cell: () => (
        <button style={{ background: '#f8f9ff', border: '1px solid #e8eaf0', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#6b7280', fontSize: '1rem', transition: 'all 0.2s' }} title="More options">⋯</button>
      )
    }
  ], [])

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <>
      <style>{`
        .users-card { background: #fff; border-radius: 20px; border: 1px solid #eaecf0; box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden; }
        .users-toolbar { padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; gap: 16px; }
        .search-wrap { position: relative; }
        .search-wrap input { padding: 10px 16px 10px 42px; border: 1.5px solid #e8eaf0; border-radius: 12px; font-size: 0.88rem; width: 300px; outline: none; color: #374151; background: #fafbff; transition: border 0.2s; font-family: 'Inter', sans-serif; }
        .search-wrap input:focus { border-color: #7c3aed; background: #fff; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 0.95rem; }
        .add-btn { padding: 10px 20px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; border: none; border-radius: 12px; font-weight: 700; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(124,58,237,0.3); white-space: nowrap; font-family: 'Inter', sans-serif; }
        .add-btn:hover { box-shadow: 0 8px 20px rgba(124,58,237,0.4); transform: translateY(-1px); }
        .users-table { width: 100%; border-collapse: collapse; }
        .users-table th { padding: 12px 24px; background: #fafbff; font-size: 0.72rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #9ca3af; text-align: left; border-bottom: 1px solid #f1f5f9; }
        .users-table td { padding: 16px 24px; border-bottom: 1px solid #f8f9ff; vertical-align: middle; }
        .users-table tr:last-child td { border-bottom: none; }
        .users-table tbody tr { transition: background 0.15s; }
        .users-table tbody tr:hover { background: #fafbff; }
        .pagination-bar { padding: 16px 24px; border-top: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
        .page-info { font-size: 0.82rem; color: #9ca3af; }
        .page-info strong { color: #374151; }
        .page-btns { display: flex; gap: 8px; }
        .page-btn { padding: 8px 18px; border-radius: 10px; border: 1.5px solid #e8eaf0; background: #fff; color: #374151; font-size: 0.83rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
        .page-btn:hover:not(:disabled) { border-color: #7c3aed; color: #7c3aed; background: #f5f0ff; }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .page-btn.active { background: #7c3aed; border-color: #7c3aed; color: #fff; }
        .top-meta { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
        .meta-pill { background: #fff; border: 1.5px solid #e8eaf0; border-radius: 12px; padding: 10px 20px; display: flex; align-items: center; gap: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .meta-pill-label { font-size: 0.75rem; color: #9ca3af; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
        .meta-pill-value { font-size: 1.1rem; font-weight: 800; color: #0f172a; }
      `}</style>

      {/* Top Meta Pills */}
      <div className="top-meta">
        <div className="meta-pill">
          <span style={{ fontSize: '1.2rem' }}>👥</span>
          <div>
            <div className="meta-pill-label">Total Records</div>
            <div className="meta-pill-value">{total}</div>
          </div>
        </div>
        <div className="meta-pill">
          <span style={{ fontSize: '1.2rem' }}>📄</span>
          <div>
            <div className="meta-pill-label">Current Page</div>
            <div className="meta-pill-value">{page} / {totalPages || 1}</div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="users-card">
        <div className="users-toolbar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="add-btn">+ Add User</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="users-table">
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
                  <td colSpan={5} style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
                    <div style={{ display: 'inline-block', width: 32, height: 32, borderRadius: '50%', border: '3px solid #e8eaf0', borderTop: '3px solid #7c3aed', animation: 'spin 0.8s linear infinite' }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <div style={{ marginTop: 12, fontSize: '0.88rem' }}>Loading users...</div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 64, color: '#9ca3af' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>👥</div>
                    <div style={{ fontWeight: 700, color: '#374151', fontSize: '1rem' }}>No users found</div>
                    <div style={{ fontSize: '0.85rem', marginTop: 4 }}>Try adjusting your search terms.</div>
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

        {/* Pagination */}
        <div className="pagination-bar">
          <div className="page-info">
            Showing <strong>page {page}</strong> of <strong>{totalPages || 1}</strong> &nbsp;·&nbsp; <strong>{total}</strong> total users
          </div>
          <div className="page-btns">
            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
              ← Previous
            </button>
            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}>
              Next →
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
