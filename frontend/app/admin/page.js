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

const PIE_COLORS = ['#7c3aed', '#06b6d4', '#f59e0b']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1e1245', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, padding: '10px 16px', color: '#fff', fontSize: '0.85rem' }}>
        <div style={{ color: '#a78bfa', fontWeight: 700, marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: '#e2e8f0' }}>{p.name}: <strong>{p.value}</strong></div>
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
  
  // Date filter state
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      const token = localStorage.getItem('qrcraft_token')
      try {
        let url = 'http://localhost:5001/api/admin/stats?'
        if (startDate) url += `startDate=${startDate}&`
        if (endDate) url += `endDate=${endDate}T23:59:59.999Z` // Include full end day

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
      label: 'QR Codes Generated', value: stats.totalQRCodes, icon: '🚀',
      gradient: 'linear-gradient(135deg, #10b981, #047857)', // Green
      badge: `${stats.qrCodesToday} today (vs ${stats.qrCodesYesterday} yday)`, badgeColor: '#a7f3d0',
    },
    {
      label: 'Total Users', value: stats.totalUsers, icon: '👥',
      gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
      badge: 'Active users', badgeColor: '#a78bfa',
    },
    {
      label: 'Admin Users', value: stats.adminUsers, icon: '🛡',
      gradient: 'linear-gradient(135deg, #0891b2, #0e7490)',
      badge: 'Full access', badgeColor: '#67e8f9',
    },
    {
      label: 'Regular Users', value: stats.regularUsers, icon: '👤',
      gradient: 'linear-gradient(135deg, #d97706, #b45309)',
      badge: 'Standard plan', badgeColor: '#fcd34d',
    },
  ]

  return (
    <>
      <style>{`
        .dash-stat-card { border-radius: 20px; padding: 24px; color: #fff; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15); transition: transform 0.25s, box-shadow 0.25s; }
        .dash-stat-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
        .dash-stat-card::after { content: ''; position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; border-radius: 50%; background: rgba(255,255,255,0.08); }
        .chart-card { background: #fff; border-radius: 20px; padding: 24px; border: 1px solid #eaecf0; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .chart-title { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
        .chart-sub { font-size: 0.78rem; color: #9ca3af; margin: 0 0 20px; }
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
        .grid-2 { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px; }
        .grid-1 { margin-bottom: 24px; }
        
        .date-filter-bar { background: #fff; padding: 16px 24px; border-radius: 16px; border: 1px solid #eaecf0; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .date-input-group { display: flex; align-items: center; gap: 12px; }
        .date-input { border: 1.5px solid #e8eaf0; border-radius: 10px; padding: 8px 14px; font-family: 'Inter', sans-serif; font-size: 0.85rem; color: #374151; outline: none; transition: border 0.2s; background: #fafbff; }
        .date-input:focus { border-color: #7c3aed; background: #fff; }
        
        @media (max-width: 1200px) { .grid-4 { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 900px) { .grid-4 { grid-template-columns: 1fr; } .grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      {/* Date Filter Bar */}
      <div className="date-filter-bar shadow-sm">
        <div style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>
          <i className="bi bi-calendar3 me-2" style={{ color: '#7c3aed' }}></i>
          Filter Dashboard Data
        </div>
        <div className="date-input-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>From:</span>
            <input 
              type="date" 
              className="date-input" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>To:</span>
            <input 
              type="date" 
              className="date-input" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
            />
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); }}
              style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginLeft: 8 }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4">
        {statCards.map((card, i) => (
          <div key={i} className="dash-stat-card" style={{ background: card.gradient }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.8 }}>{card.label}</span>
              <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{card.icon}</div>
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1, marginBottom: 12 }}>
              {loading ? '—' : card.value}
            </div>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '3px 12px', fontSize: '0.75rem', fontWeight: 600, color: card.badgeColor }}>
              {card.badge}
            </div>
          </div>
        ))}
      </div>

      {/* Area Chart + Pie Chart */}
      <div className="grid-2">
        <div className="chart-card">
          <div className="chart-title">User Registrations</div>
          <div className="chart-sub">Monthly growth over the last 6 months</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={registrationData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="users" name="Users" stroke="#7c3aed" strokeWidth={3} fill="url(#colorUsers)" dot={{ fill: '#7c3aed', r: 5 }} activeDot={{ r: 7 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">User Breakdown</div>
          <div className="chart-sub">Admin vs Regular users</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                {pieData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(val, name) => [val, name]} />
              <Legend iconType="circle" iconSize={10} formatter={(val) => <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{val}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="chart-card grid-1">
        <div className="chart-title">Weekly Login Activity</div>
        <div className="chart-sub">Number of logins per day this week</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={activityData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.05)', radius: 8 }} />
            <Bar dataKey="logins" name="Logins" fill="#7c3aed" radius={[6, 6, 0, 0]}>
              {activityData.map((entry, index) => (
                <Cell key={index} fill={index === 6 ? '#4f46e5' : '#7c3aed'} fillOpacity={0.8 + index * 0.02} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
