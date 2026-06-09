import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Space, Avatar } from '@arco-design/web-react';
import {
  IconDashboard, IconUserGroup, IconFile, IconSafe,
  IconDriveFile, IconDesktop, IconSettings, IconPoweroff,
  IconMenuFold, IconMenuUnfold, IconDown,
} from '@arco-design/web-react/icon';
import { currentUser } from '../data/mock';

const { Sider, Header, Content } = Layout;
const { Item } = Menu;

const menuItems = [
  { key: 'dashboard', label: '工作台', icon: <IconDashboard />, path: '/' },
  { key: 'employees', label: '员工管理', icon: <IconUserGroup />, path: '/employees' },
  { key: 'orders', label: '订单管理', icon: <IconFile />, path: '/orders' },
  { key: 'quota', label: '额度与消费', icon: <IconSafe />, path: '/quota' },
  { key: 'billing', label: '账单管理', icon: <IconDesktop />, path: '/billing' },
  { key: 'invoice', label: '发票管理', icon: <IconDriveFile />, path: '/invoice' },
  { key: 'enterprise-info', label: '企业信息', icon: <IconSettings />, path: '/enterprise-info' },
];

export default function EnterpriseLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = location.pathname === '/' ? 'dashboard' : location.pathname.split('/')[1] || 'dashboard';

  const userDropdown = (
    <Menu onClickMenuItem={(key) => { if (key === 'logout') navigate('/login'); }}>
      <Item key="profile"><IconSettings style={{ marginRight: 6 }} />账号信息</Item>
      <Item key="logout"><span style={{ color: '#F53F3F' }}><IconPoweroff style={{ marginRight: 6 }} />退出登录</span></Item>
    </Menu>
  );

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider collapsed={collapsed} onCollapse={setCollapsed} collapsible trigger={null} breakpoint="xl"
        style={{ background: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e5e6eb' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => navigate('/')}>
          <span style={{ color: '#1d2129', fontSize: collapsed ? 16 : 18, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {collapsed ? '尊' : '尊出行 · 企业端'}
          </span>
        </div>
        <Menu theme="light" selectedKeys={[selectedKey]} onClickMenuItem={(key) => { const m = menuItems.find(x => x.key === key); if (m) navigate(m.path); }}
          style={{ flex: 1, overflow: 'auto', borderRight: 'none' }}>
          {menuItems.map(m => <Item key={m.key}>{m.icon}{m.label}</Item>)}
        </Menu>
        <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Button type="text" icon={collapsed ? <IconMenuUnfold /> : <IconMenuFold />} onClick={() => setCollapsed(!collapsed)} />
        </div>
      </Sider>

      <Layout style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header style={{ background: '#fff', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e6eb', flexShrink: 0 }}>
          <div style={{ fontSize: 14, color: '#86909c' }}>
            <span style={{ color: '#1d2129', fontWeight: 500, marginRight: 8 }}>{currentUser.enterpriseName}</span>
            {new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <Dropdown droplist={userDropdown} trigger="click" position="br">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar size={32} style={{ background: '#D4AF37', color: '#000' }}>{currentUser.name.charAt(0)}</Avatar>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{currentUser.name}</span>
              <IconDown style={{ color: '#86909c', fontSize: 12 }} />
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ padding: 20, background: '#f2f3f5', overflow: 'auto', flex: 1 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
