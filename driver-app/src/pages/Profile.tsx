import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Message } from '@arco-design/web-react';
import { currentDriver } from '../data/mock';

const licenseTypeMap: Record<string, string> = {
  A1: 'A1（大型客车）', A2: 'A2（牵引车）', B1: 'B1（中型客车）', B2: 'B2（大型货车）',
  C1: 'C1（小型汽车）', C2: 'C2（小型自动挡）',
};

export default function Profile() {
  const navigate = useNavigate();
  const [logoutVisible, setLogoutVisible] = useState(false);

  const handleLogout = () => {
    setLogoutVisible(false);
    Message.success('已退出登录');
    setTimeout(() => navigate('/login'), 300);
  };

  return (
    <div className="page-wrapper page" style={{ paddingBottom: 16 }}>
      {/* Header */}
      <div style={{ paddingTop: 48, paddingBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>我的</h2>
      </div>

      {/* Avatar & name */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24,
        padding: '20px 0',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 36,
          background: 'linear-gradient(135deg, #D4AF37 0%, #b8941f 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, fontWeight: 700, color: '#000',
          flexShrink: 0,
        }}>
          {currentDriver.name.charAt(0)}
        </div>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{currentDriver.name}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
            {currentDriver.code} · 在岗
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#F7BA1E" stroke="#F7BA1E" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#F7BA1E' }}>{currentDriver.rating}</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>综合评分</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <StatBlock label="累计服务" value={`${currentDriver.serviceCount}单`} />
          <StatBlock label="服务时长" value={`${currentDriver.serviceHours}h`} />
          <StatBlock label="好评率" value={`${(currentDriver.goodReviewRate * 100).toFixed(0)}%`} />
        </div>
      </div>

      {/* Basic info */}
      <div className="card" style={{ marginBottom: 12 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>基本信息</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ProfileRow label="手机号" value={currentDriver.phone} />
          <ProfileRow label="身份证号" value={maskIdCard(currentDriver.idCard)} />
          <ProfileRow label="驾驶证类型" value={licenseTypeMap[currentDriver.licenseType] || currentDriver.licenseType} />
          <ProfileRow label="驾驶证有效期" value={currentDriver.licenseExpiry} />
          <ProfileRow label="性别" value={currentDriver.gender === 'male' ? '男' : '女'} />
          {currentDriver.birthDate && <ProfileRow label="出生日期" value={currentDriver.birthDate} />}
        </div>
      </div>

      {/* Bound vehicles */}
      <div className="card" style={{ marginBottom: 12 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>绑定车辆</h4>
        {currentDriver.boundVehicles.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>暂无绑定车辆</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {currentDriver.boundVehicles.map((v, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0', borderBottom: i < currentDriver.boundVehicles.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'var(--bg-input)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{v.plateNo}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{v.carModel} · {v.boundAt} 绑定</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>考核数据</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ProgressRow label="准时率" value={currentDriver.onTimeRate} />
          <ProgressRow label="好评率" value={currentDriver.goodReviewRate} />
          <ProgressRow label="综合评分" value={currentDriver.rating / 5} />
        </div>
      </div>

      {/* Logout */}
      <Button
        long size="large"
        onClick={() => setLogoutVisible(true)}
        style={{
          height: 48, fontSize: 15, borderRadius: 12,
          background: 'rgba(245,63,63,0.1)', border: '1px solid rgba(245,63,63,0.2)',
          color: 'var(--danger)', fontWeight: 600,
        }}
      >
        退出登录
      </Button>

      {/* Logout modal */}
      <Modal
        title="退出登录"
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        simple
        footer={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button long onClick={() => setLogoutVisible(false)} style={{ borderRadius: 10 }}>取消</Button>
            <Button long type="primary" onClick={handleLogout} style={{ borderRadius: 10, background: 'var(--danger)', borderColor: 'var(--danger)' }}>确认退出</Button>
          </div>
        }
      >
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', padding: '8px 0' }}>
          确认退出当前账号？
        </p>
      </Modal>

      {/* App version */}
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-disabled)', marginBottom: 32 }}>
        尊出行 · 司机端 V1.0
      </p>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)' }}>{value}</p>
      <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>{label}</p>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function ProgressRow({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 95 ? 'var(--success)' : pct >= 85 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color }}>{pct}%</span>
      </div>
      <div style={{
        height: 4, borderRadius: 2, background: 'var(--bg-input)', overflow: 'hidden',
      }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.5s' }} />
      </div>
    </div>
  );
}

function maskIdCard(id: string): string {
  return id.substring(0, 6) + '****' + id.substring(14);
}
