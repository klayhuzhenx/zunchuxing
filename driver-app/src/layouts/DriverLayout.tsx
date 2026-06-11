import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { key: '/', label: '首页', icon: 'home' },
  { key: '/trips', label: '任务', icon: 'task' },
  { key: '/history', label: '记录', icon: 'history' },
  { key: '/profile', label: '我的', icon: 'person' },
];

const TabIcon: React.FC<{ name: string; active: boolean }> = ({ name, active }) => {
  const color = active ? '#D4AF37' : 'rgba(255,255,255,0.4)';
  const size = 22;
  switch (name) {
    case 'home':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'task':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case 'history':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'person':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    default: return null;
  }
};

export default function DriverLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname === '/trips' ? '/trips'
    : location.pathname.startsWith('/trips/') ? '/trips'
    : location.pathname === '/history' ? '/history'
    : location.pathname === '/profile' ? '/profile'
    : '/';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Outlet />
      </div>

      {/* Bottom Tab Bar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        height: 56, flexShrink: 0,
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'var(--safe-bottom)',
      }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => navigate(t.key)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 0', minWidth: 64,
              color: activeTab === t.key ? 'var(--gold)' : 'var(--text-tertiary)',
              transition: 'color 0.2s',
            }}
          >
            <TabIcon name={t.icon} active={activeTab === t.key} />
            <span style={{ fontSize: 10, fontWeight: activeTab === t.key ? 600 : 400 }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
