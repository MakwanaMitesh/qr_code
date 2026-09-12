'use client'
import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const registrationData = [
  { month: 'Mar', users: 0 },
  { month: 'Apr', users: 0 },
  { month: 'May', users: 0 },
  { month: 'Jun', users: 0 },
  { month: 'Jul', users: 0 },
  { month: 'Aug', users: 10 },
]

const activityData = [
  { day: 'Mon', logins: 0 }, { day: 'Tue', logins: 0 },
  { day: 'Wed', logins: 0 }, { day: 'Thu', logins: 0 },
  { day: 'Fri', logins: 0 }, { day: 'Sat', logins: 0 },
  { day: 'Sun', logins: 0 },
]

const PIE_COLORS = ['#2563eb', '#64748b', '#f59e0b']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: '0.82rem' }}>
        <div style={{ color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: '#ffffff' }}>{p.name}: <strong>{p.value}</strong></div>
        ))}
      </div>
    )
  }
  return null
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ 
    totalUsers: 0, adminUsers: 0, regularUsers: 0, 
    totalQRCodes: 0, qrCodesToday: 0, qrCodesYesterday: 0 
  })
  const [loading, setLoading] = useState(true)
  
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      const token = localStorage.getItem('qrcraft_token')
      try {
        let url = 'http://localhost:5001/api/admin/stats?'
        if (startDate) url += `startDate=${startDate}&`
        if (endDate) url += `endDate=${endDate}T23:59:59.999Z`

        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (res.ok) setStats(data)
      } catch (err) {}
      finally { setLoading(false) }
    }
    fetchStats()
  }, [startDate, endDate])

  const pieData = [
    { name: 'Admin Users', value: stats.adminUsers },
    { name: 'Regular Users', value: stats.regularUsers },
  ]

  const statCards = [
    {
      label: 'QR Codes Generated', value: stats.totalQRCodes, icon: 'bi-qr-code-scan',
      badge: `${stats.qrCodesToday} today (vs ${stats.qrCodesYesterday} yday)`,
    },
    {
      label: 'Total Users', value: stats.totalUsers, icon: 'bi-people-fill',
      badge: 'Active registered users',
    },
    {
      label: 'Admin Users', value: stats.adminUsers, icon: 'bi-shield-check',
      badge: 'Full access',
    },
    {
      label: 'Regular Users', value: stats.regularUsers, icon: 'bi-person',
      badge: 'Standard plan',
    },
  ]

  return (
    <>
      <style>{`
        /* Filament Widget Cards */
        .fl-stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px 24px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
          position: relative;
        }
        .fl-chart-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }
        .fl-chart-title { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin: 0 0 2px; }
        .fl-chart-sub { font-size: 0.78rem; color: #64748b; margin: 0 0 16px; }

        .fl-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .fl-grid-2 { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px; }

        .fl-filter-bar {
          background: #ffffff;
          padding: 14px 20px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }
        .fl-date-input {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 6px 12px;
          font-family: inherit;
          font-size: 0.85rem;
          color: #0f172a;
          outline: none;
          background: #ffffff;
        }
        .fl-date-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        @media (max-width: 1200px) { .fl-grid-4 { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 900px) { .fl-grid-4 { grid-template-columns: 1fr; } .fl-grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      {/* Date Filter Bar */}
      <div className="fl-filter-bar">
        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="bi bi-calendar3" style={{ color: '#2563eb' }}></i> Filter Stats Date Range
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>From:</span>
            <input 
              type="date" 
              className="fl-date-input" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>To:</span>
            <input 
              type="date" 
              className="fl-date-input" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
            />
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); }}
              style={{ background: '#f8fafc', border: '1px solid #d1d5db', color: '#dc2626', padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filament Stat Widget Cards */}
      <div className="fl-grid-4">
        {statCards.map((card, i) => (
          <div key={i} className="fl-stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>{card.label}</span>
              <i className={`bi ${card.icon}`} style={{ fontSize: '1.1rem', color: '#2563eb' }}></i>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginBottom: 8 }}>
              {loading ? '—' : card.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {card.badge}
            </div>
          </div>
        ))}
      </div>

      {/* Area Chart + Pie Chart */}
      <div className="fl-grid-2">
        <div className="fl-chart-card">
          <div className="fl-chart-title">User Registrations</div>
          <div className="fl-chart-sub">Monthly growth over the last 6 months</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={registrationData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="users" name="Users" stroke="#2563eb" strokeWidth={2} fill="url(#colorUsers)" dot={{ fill: '#2563eb', r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="fl-chart-card">
          <div className="fl-chart-title">User Breakdown</div>
          <div className="fl-chart-sub">Admin vs Regular users</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value">
                {pieData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(val, name) => [val, name]} />
              <Legend iconType="circle" iconSize={8} formatter={(val) => <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{val}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="fl-chart-card">
        <div className="fl-chart-title">Weekly Activity</div>
        <div className="fl-chart-sub">Daily user logins this week</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={activityData} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 6 }} />
            <Bar dataKey="logins" name="Logins" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
