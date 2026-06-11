import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { trips } from '../data/mock';
import type { TripStatus } from '../types';

const statusTabs: { key: TripStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'not_started', label: '待开始' },
  { key: 'in_progress', label: '进行中' },
  { key: 'pending_settlement', label: '待结算' },
];

const statusMap: Record<string, { label: string; cls: string }> = {
  not_started: { label: '待开始', cls: 'blue' },
  in_progress: { label: '进行中', cls: 'green' },
  pending_settlement: { label: '待结算', cls: 'orange' },
  completed: { label: '已完成', cls: 'gray' },
  cancelled: { label: '已取消', cls: 'red' },
};

export default function TripList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TripStatus | 'all'>('all');

  const filtered = useMemo(() => {
    if (activeTab === 'all') return trips;
    return trips.filter(t => t.status === activeTab);
  }, [activeTab]);

  return (
    <div className="page-wrapper page" style={{ paddingBottom: 16 }}>
      {/* Header */}
      <div style={{ paddingTop: 48, paddingBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>出车任务</h2>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>查看和执行派车任务</p>
      </div>

      {/* Status tabs */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 16,
        overflowX: 'auto', paddingBottom: 4,
      }}>
        {statusTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: 'none',
              fontSize: 13, fontWeight: activeTab === t.key ? 600 : 400,
              background: activeTab === t.key ? 'var(--gold)' : 'var(--bg-card)',
              color: activeTab === t.key ? '#000' : 'var(--text-secondary)',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Trip list */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 16px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-disabled)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>暂无出车任务</p>
        </div>
      ) : (
        filtered.map(trip => {
          const s = statusMap[trip.status];
          return (
            <div
              key={trip.id}
              onClick={() => navigate(`/trips/${trip.id}`)}
              className="card"
              style={{ marginBottom: 8, cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{trip.driverOrderNo}</span>
                  <p style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>
                    {trip.tripDate} · {trip.plannedTimeRange}
                  </p>
                </div>
                <span className={`status-badge ${s.cls}`}>{s.label}</span>
              </div>

              <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 2 }}>
                  <span style={{ color: 'var(--success)', fontSize: 16, lineHeight: 1, flexShrink: 0 }}>●</span>
                  <span>{trip.pickupAddress}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ color: 'var(--danger)', fontSize: 16, lineHeight: 1, flexShrink: 0 }}>●</span>
                  <span>{trip.dropoffAddress}</span>
                </div>
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-tertiary)' }}>
                  <span>{trip.plateNo}</span>
                  <span>{trip.passengerName}</span>
                  {trip.passengerCount && <span>{trip.passengerCount}人</span>}
                </div>
                {trip.status === 'not_started' && (
                  <span style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 500 }}>待执行 →</span>
                )}
                {trip.status === 'in_progress' && (
                  <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 500 }}>执行中 →</span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
