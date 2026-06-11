import { useNavigate } from 'react-router-dom';
import { currentDriver, trips, dashboardData } from '../data/mock';

export default function Home() {
  const navigate = useNavigate();
  const { todayTrips, todayCompleted, pendingTrips, weeklyOrders, weeklyHours, monthlyIncome, rating } = dashboardData;
  const inProgress = pendingTrips.find(t => t.status === 'in_progress');
  const upcoming = pendingTrips.filter(t => t.status === 'not_started').sort((a, b) =>
    a.plannedTimeRange.localeCompare(b.plannedTimeRange)
  );

  const statusMap: Record<string, { label: string; cls: string }> = {
    not_started: { label: '待开始', cls: 'blue' },
    in_progress: { label: '进行中', cls: 'green' },
    pending_settlement: { label: '待结算', cls: 'orange' },
    completed: { label: '已完成', cls: 'gray' },
    cancelled: { label: '已取消', cls: 'red' },
  };

  return (
    <div className="page-wrapper page" style={{ paddingBottom: 16 }}>
      {/* Header */}
      <div style={{ paddingTop: 48, paddingBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 4 }}>
            {new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>
            你好，{currentDriver.name}
          </h2>
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 22,
          background: 'linear-gradient(135deg, #D4AF37 0%, #b8941f 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700, color: '#000',
          cursor: 'pointer',
        }} onClick={() => navigate('/profile')}>
          {currentDriver.name.charAt(0)}
        </div>
      </div>

      {/* Current task - in progress trip */}
      {inProgress && (
        <div
          onClick={() => navigate(`/trips/${inProgress.id}`)}
          className="card"
          style={{
            marginBottom: 16, cursor: 'pointer',
            border: '1px solid var(--gold-border)',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.02) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: 4, background: 'var(--success)',
                boxShadow: '0 0 6px rgba(0,180,42,0.5)',
              }} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>当前任务 · 进行中</span>
            </div>
            <span className="status-badge green">进行中</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{inProgress.plannedTimeRange}</span>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>
            <p style={{ marginBottom: 4 }}>{inProgress.pickupAddress}</p>
            <p style={{ color: 'var(--text-secondary)' }}>
              {inProgress.plateNo} · {inProgress.passengerName}
            </p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16,
      }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>{todayTrips}</p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>今日任务</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{weeklyOrders}</p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>本周单数</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{weeklyHours}h</p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>本周时长</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>{rating}</p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>综合评分</p>
        </div>
      </div>

      {/* Upcoming tasks */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>待执行任务</h3>
          <span
            onClick={() => navigate('/trips')}
            style={{ fontSize: 13, color: 'var(--gold)', cursor: 'pointer' }}
          >
            查看全部
          </span>
        </div>

        {upcoming.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '32px 16px' }}>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>今日暂无待执行任务</p>
          </div>
        ) : (
          upcoming.slice(0, 3).map(trip => {
            const s = statusMap[trip.status];
            return (
              <div
                key={trip.id}
                onClick={() => navigate(`/trips/${trip.id}`)}
                className="card"
                style={{ marginBottom: 8, cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {trip.pickupAddress}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                      {trip.plannedTimeRange} · {trip.plateNo}
                    </p>
                  </div>
                  <span className={`status-badge ${s.cls}`} style={{ flexShrink: 0, marginLeft: 8 }}>{s.label}</span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span>{trip.passengerName}</span>
                  {trip.passengerCount && <span>{trip.passengerCount}人</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* GPS status */}
      <div className="card" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 16,
          background: 'rgba(0,180,42,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 500 }}>GPS 定位运行中</p>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            {currentDriver.gpsLocation} · {currentDriver.gpsUpdatedAt}
          </p>
        </div>
        <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--success)', boxShadow: '0 0 4px rgba(0,180,42,0.5)' }} />
      </div>
    </div>
  );
}
