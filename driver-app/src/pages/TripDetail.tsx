import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Modal, Message } from '@arco-design/web-react';
import { trips } from '../data/mock';
import type { Trip, TripStatus } from '../types';

const statusMap: Record<TripStatus, { label: string; cls: string }> = {
  not_started: { label: '待开始', cls: 'blue' },
  in_progress: { label: '进行中', cls: 'green' },
  pending_settlement: { label: '待结算', cls: 'orange' },
  completed: { label: '已完成', cls: 'gray' },
  cancelled: { label: '已取消', cls: 'red' },
};

const typeMap: Record<string, string> = {
  charter: '包车出行', rental: '租车出行',
};

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trip = trips.find(t => t.id === id);

  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showDropoffModal, setShowDropoffModal] = useState(false);
  const [startMileage, setStartMileage] = useState('');
  const [endMileage, setEndMileage] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!trip) {
    return (
      <div className="page-wrapper page" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>任务不存在</p>
        <Button type="text" style={{ marginTop: 12, color: 'var(--gold)' }} onClick={() => navigate(-1)}>返回</Button>
      </div>
    );
  }

  const s = statusMap[trip.status];

  const handleStartTrip = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setShowStartModal(false);
      Message.success('出车已开始');
      // In real app, would update trip status
    }, 600);
  };

  const handleEndTrip = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setShowEndModal(false);
      Message.success('行程已结束');
    }, 600);
  };

  const handlePickup = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setShowPickupModal(false);
      Message.success('已确认接到乘客');
    }, 600);
  };

  const handleDropoff = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setShowDropoffModal(false);
      Message.success('已确认乘客下车');
    }, 600);
  };

  return (
    <div className="page-wrapper page" style={{ paddingBottom: 16 }}>
      {/* Header */}
      <div style={{
        paddingTop: 48, paddingBottom: 16,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, width: 36, height: 36, display: 'flex',
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>任务详情</h2>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{trip.driverOrderNo}</p>
        </div>
        <span className={`status-badge ${s.cls}`} style={{ fontSize: 13, padding: '4px 10px' }}>{s.label}</span>
      </div>

      {/* Trip info card */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{typeMap[trip.type]}</span>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>关联订单 {trip.orderNo}</span>
        </div>

        {/* Time */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 600 }}>{trip.tripDate} · {trip.plannedTimeRange}</p>
          {trip.actualStartTime && (
            <p style={{ fontSize: 12, color: 'var(--success)', marginTop: 4 }}>
              实际：{trip.actualStartTime} — {trip.actualEndTime || '进行中'}
            </p>
          )}
        </div>

        {/* Route */}
        <div style={{ position: 'relative', paddingLeft: 20, marginBottom: 16 }}>
          <div style={{
            position: 'absolute', left: 6, top: 6, bottom: 6, width: 2,
            background: 'var(--border)',
          }} />
          <div style={{ marginBottom: 12, position: 'relative' }}>
            <div style={{
              position: 'absolute', left: -16, top: 4, width: 8, height: 8,
              borderRadius: 4, background: 'var(--success)',
            }} />
            <p style={{ fontSize: 14, fontWeight: 500 }}>{trip.pickupAddress}</p>
            {trip.actualPickupTime && (
              <p style={{ fontSize: 11, color: 'var(--success)', marginTop: 2 }}>
                到达 {trip.actualPickupTime}
              </p>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', left: -16, top: 4, width: 8, height: 8,
              borderRadius: 4, background: 'var(--danger)',
            }} />
            <p style={{ fontSize: 14, fontWeight: 500 }}>{trip.dropoffAddress}</p>
            {trip.actualDropoffTime && (
              <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 2 }}>
                到达 {trip.actualDropoffTime}
              </p>
            )}
          </div>
        </div>

        {/* Info grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px',
          paddingTop: 12, borderTop: '1px solid var(--border)',
        }}>
          <InfoItem label="车辆" value={`${trip.plateNo} · ${trip.carModel}`} />
          <InfoItem label="乘客" value={`${trip.passengerName} · ${trip.passengerPhone}`} />
          {trip.passengerCount && <InfoItem label="人数" value={`${trip.passengerCount}人`} />}
          {trip.luggage && <InfoItem label="行李" value={trip.luggage} />}
          {(trip.startMileage !== undefined || trip.mileage !== undefined) && (
            <InfoItem label="里程" value={trip.mileage ? `${trip.mileage}km` : `起步 ${trip.startMileage}km`} />
          )}
          {trip.duration && <InfoItem label="时长" value={formatDuration(trip.duration)} />}
        </div>
      </div>

      {/* Mileage & time tracking card */}
      {(trip.status === 'in_progress' || trip.status === 'pending_settlement') && (
        <div className="card" style={{ marginBottom: 12 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>行程数据</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>开始里程</p>
              <p style={{ fontSize: 20, fontWeight: 700 }}>{trip.startMileage || '—'}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-secondary)' }}>km</span></p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>当前里程</p>
              <p style={{ fontSize: 20, fontWeight: 700 }}>
                {trip.endMileage || (trip.startMileage ? trip.startMileage + 35 : '—')}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-secondary)' }}>km</span>
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>开始时间</p>
              <p style={{ fontSize: 14, fontWeight: 500 }}>{trip.actualStartTime?.split(' ')[1] || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>已行驶</p>
              <p style={{ fontSize: 14, fontWeight: 500 }}>
                {trip.duration ? formatDuration(trip.duration) : '进行中...'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Extra fees */}
      {trip.extraFeeItems && trip.extraFeeItems.length > 0 && (
        <div className="card" style={{ marginBottom: 12 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>额外费用明细</h4>
          {trip.extraFeeItems.map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '8px 0', borderBottom: i < trip.extraFeeItems!.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500 }}>{item.category}</p>
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {item.description || `${item.overtimeDuration || ''} ${item.excessMileage ? `${item.excessMileage}km` : ''}`}
                </p>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--warning)', flexShrink: 0 }}>
                +¥{item.amount}
              </span>
            </div>
          ))}
          {trip.totalExtraFee && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', paddingTop: 10,
              borderTop: '1px solid var(--border)', marginTop: 4,
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>合计</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--warning)' }}>¥{trip.totalExtraFee}</span>
            </div>
          )}
        </div>
      )}

      {/* Review */}
      {trip.review && (
        <div className="card" style={{ marginBottom: 12 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>乘客评价</h4>
          <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
            <StarItem label="驾驶" value={trip.review.driverRating} />
            <StarItem label="车辆" value={trip.review.vehicleRating} />
            <StarItem label="服务" value={trip.review.serviceRating} />
          </div>
          {trip.review.comment && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              "{trip.review.comment}"
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ paddingTop: 8, paddingBottom: 24 }}>
        {trip.status === 'not_started' && (
          <Button
            type="primary" long size="large"
            onClick={() => setShowStartModal(true)}
            style={{ height: 52, fontSize: 16, borderRadius: 12 }}
          >
            开始出车
          </Button>
        )}

        {trip.status === 'in_progress' && !trip.actualPickupTime && (
          <div style={{ display: 'flex', gap: 10 }}>
            <Button
              type="primary" long size="large"
              onClick={() => setShowPickupModal(true)}
              style={{ height: 52, fontSize: 16, borderRadius: 12, flex: 1 }}
            >
              到达上车点
            </Button>
          </div>
        )}

        {trip.status === 'in_progress' && trip.actualPickupTime && !trip.actualDropoffTime && (
          <div style={{ display: 'flex', gap: 10 }}>
            <Button
              type="primary" long size="large"
              onClick={() => setShowDropoffModal(true)}
              style={{ height: 52, fontSize: 16, borderRadius: 12, flex: 1 }}
            >
              乘客已下车
            </Button>
          </div>
        )}

        {trip.status === 'in_progress' && trip.actualDropoffTime && (
          <Button
            type="primary" long size="large"
            onClick={() => setShowEndModal(true)}
            style={{ height: 52, fontSize: 16, borderRadius: 12 }}
          >
            结束行程
          </Button>
        )}

        {trip.status === 'pending_settlement' && (
          <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
            <p style={{ fontSize: 14, color: 'var(--warning)', marginBottom: 8 }}>等待运营确认结算</p>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>额外费用已提交，运营审核后完成结算</p>
          </div>
        )}

        {(trip.status === 'completed' || trip.status === 'cancelled') && (
          <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
              {trip.status === 'completed' ? '此任务已完成' : '此任务已取消'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        title="开始出车"
        visible={showStartModal}
        onCancel={() => setShowStartModal(false)}
        simple
        footer={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button long onClick={() => setShowStartModal(false)} style={{ borderRadius: 10 }}>取消</Button>
            <Button long type="primary" loading={processing} onClick={handleStartTrip} style={{ borderRadius: 10 }}>确认开始</Button>
          </div>
        }
      >
        <div style={{ padding: '8px 0' }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            确认开始执行此出车任务？开始后系统将记录您的行程数据。
          </p>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>起始里程 (km)</label>
            <input
              type="number"
              value={startMileage}
              onChange={e => setStartMileage(e.target.value)}
              placeholder="请输入当前里程数"
              style={{
                width: '100%', height: 44, borderRadius: 10,
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', padding: '0 12px', fontSize: 14,
                outline: 'none',
              }}
            />
          </div>
        </div>
      </Modal>

      <Modal
        title="到达上车点"
        visible={showPickupModal}
        onCancel={() => setShowPickupModal(false)}
        simple
        footer={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button long onClick={() => setShowPickupModal(false)} style={{ borderRadius: 10 }}>取消</Button>
            <Button long type="primary" loading={processing} onClick={handlePickup} style={{ borderRadius: 10 }}>确认到达</Button>
          </div>
        }
      >
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '8px 0' }}>
          确认已到达上车点？到达后将记录到达时间。
        </p>
      </Modal>

      <Modal
        title="乘客已下车"
        visible={showDropoffModal}
        onCancel={() => setShowDropoffModal(false)}
        simple
        footer={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button long onClick={() => setShowDropoffModal(false)} style={{ borderRadius: 10 }}>取消</Button>
            <Button long type="primary" loading={processing} onClick={handleDropoff} style={{ borderRadius: 10 }}>确认下车</Button>
          </div>
        }
      >
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '8px 0' }}>
          确认乘客已下车？下车后将记录下车时间。
        </p>
      </Modal>

      <Modal
        title="结束行程"
        visible={showEndModal}
        onCancel={() => setShowEndModal(false)}
        simple
        footer={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button long onClick={() => setShowEndModal(false)} style={{ borderRadius: 10 }}>取消</Button>
            <Button long type="primary" loading={processing} onClick={handleEndTrip} style={{ borderRadius: 10 }}>确认结束</Button>
          </div>
        }
      >
        <div style={{ padding: '8px 0' }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            确认结束本次行程？结束后将自动生成行程报告。
          </p>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>结束里程 (km)</label>
            <input
              type="number"
              value={endMileage}
              onChange={e => setEndMileage(e.target.value)}
              placeholder="请输入当前里程数"
              style={{
                width: '100%', height: 44, borderRadius: 10,
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', padding: '0 12px', fontSize: 14,
                outline: 'none',
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 13 }}>{value}</p>
    </div>
  );
}

function StarItem({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', gap: 1, justifyContent: 'center', marginBottom: 2 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= value ? '#F7BA1E' : 'rgba(255,255,255,0.1)'} stroke={i <= value ? '#F7BA1E' : 'rgba(255,255,255,0.15)'} strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{label}</span>
    </div>
  );
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}小时${m > 0 ? `${m}分钟` : ''}` : `${m}分钟`;
}
