import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { trips } from '../data/mock';

const completedTrips = trips.filter(t => t.status === 'completed' || t.status === 'pending_settlement' || t.status === 'cancelled');

const months = [...new Set(completedTrips.map(t => t.tripDate.substring(0, 7)))].sort().reverse();

export default function TripHistory() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(months[0] || '');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = completedTrips;
    if (selectedMonth) result = result.filter(t => t.tripDate.startsWith(selectedMonth));
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(t =>
        t.driverOrderNo.toLowerCase().includes(s) ||
        t.orderNo.toLowerCase().includes(s) ||
        t.passengerName.toLowerCase().includes(s) ||
        t.pickupAddress.toLowerCase().includes(s)
      );
    }
    return result;
  }, [selectedMonth, search]);

  // Stats
  const monthStats = useMemo(() => {
    const m = filtered;
    const totalOrders = m.length;
    const totalHours = m.reduce((sum, t) => sum + (t.duration || 0), 0);
    const totalMileage = m.reduce((sum, t) => sum + (t.mileage || 0), 0);
    const avgRating = m.filter(t => t.review).reduce((sum, t, _, arr) =>
      sum + ((t.review!.driverRating + t.review!.vehicleRating + t.review!.serviceRating) / 3) / arr.length, 0
    );
    return { totalOrders, totalHours, totalMileage, avgRating };
  }, [filtered]);

  return (
    <div className="page-wrapper page" style={{ paddingBottom: 16 }}>
      {/* Header */}
      <div style={{ paddingTop: 48, paddingBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>服务记录</h2>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>已完成的历史任务</p>
      </div>

      {/* Month picker & search */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          style={{
            flex: 1, height: 40, borderRadius: 10,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: 'var(--text-primary)', padding: '0 12px', fontSize: 14,
            outline: 'none', appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
            paddingRight: 32,
          }}
        >
          {months.map(m => (
            <option key={m} value={m}>{m.replace('-', '年')}月</option>
          ))}
        </select>
        <div style={{
          flex: 1, height: 40, borderRadius: 10,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 12px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            placeholder="搜索"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, marginLeft: 8, background: 'none', border: 'none',
              color: 'var(--text-primary)', fontSize: 14, outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Month stats */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
          <StatBlock label="单数" value={String(monthStats.totalOrders)} />
          <StatBlock label="时长" value={formatDurationShort(monthStats.totalHours)} />
          <StatBlock label="里程" value={`${monthStats.totalMileage}km`} />
          <StatBlock label="均分" value={monthStats.avgRating > 0 ? monthStats.avgRating.toFixed(1) : '—'} />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 16px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-disabled)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>暂无服务记录</p>
        </div>
      ) : (
        filtered.map(trip => (
          <div
            key={trip.id}
            onClick={() => navigate(`/trips/${trip.id}`)}
            className="card"
            style={{ marginBottom: 8, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{trip.tripDate} · {trip.plannedTimeRange}</span>
              <span style={{
                fontSize: 12, padding: '2px 8px', borderRadius: 4,
                background: trip.status === 'completed'
                  ? 'rgba(0,180,42,0.1)' : trip.status === 'pending_settlement'
                  ? 'rgba(255,125,0,0.1)' : 'rgba(255,255,255,0.06)',
                color: trip.status === 'completed'
                  ? 'var(--success)' : trip.status === 'pending_settlement'
                  ? 'var(--warning)' : 'var(--text-tertiary)',
              }}>
                {trip.status === 'completed' ? '已完成' : trip.status === 'pending_settlement' ? '待结算' : '已取消'}
              </span>
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
              <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trip.pickupAddress}</p>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingTop: 8, borderTop: '1px solid var(--border)',
              fontSize: 12, color: 'var(--text-tertiary)',
            }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <span>{trip.plateNo}</span>
                <span>{trip.passengerName}</span>
                {trip.mileage && <span>{trip.mileage}km</span>}
              </div>
              {trip.review && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#F7BA1E" stroke="#F7BA1E" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span style={{ color: '#F7BA1E' }}>
                    {((trip.review.driverRating + trip.review.vehicleRating + trip.review.serviceRating) / 3).toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold)' }}>{value}</p>
      <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{label}</p>
    </div>
  );
}

function formatDurationShort(minutes: number): string {
  const h = Math.floor(minutes / 60);
  return h > 0 ? `${h}h` : `${Math.floor(minutes)}m`;
}
