import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout, Menu, Button, Dropdown, Avatar, Space, Tag,
  Modal, Form, Input, Message,
} from '@arco-design/web-react';
import {
  IconDashboard, IconUserGroup, IconFile, IconDriveFile,
  IconTool, IconIdcard, IconSafe,
  IconSettings, IconDesktop, IconCommon,
  IconPoweroff, IconMenuFold, IconMenuUnfold,
  IconDown, IconEdit,
} from '@arco-design/web-react/icon';
import { currentUser } from '../data/mock';

const { Sider, Header, Content } = Layout;
const { SubMenu, Item } = Menu;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // 计算选中 key：系统管理/财务子路由用 'xxx-yyy' 格式
  const pathname = location.pathname;
  const selectedKey = (() => {
    if (pathname === '/') return 'dashboard';
    if (pathname.startsWith('/system/')) {
      const sub = pathname.split('/system/')[1];
      return `system-${sub}`;
    }
    if (pathname.startsWith('/finance/')) {
      const sub = pathname.split('/finance/')[1];
      return `finance-${sub}`;
    }
    return pathname.split('/')[1] || 'dashboard';
  })();

  // 系统管理/财务子菜单默认展开
  const defaultOpenKeys = ['enterprise-group', 'order-group', 'system-group', 'finance-group'];

  const handleMenuClick = (key: string) => {
    const routeMap: Record<string, string> = {
      dashboard: '/', 'enterprise-leads': '/enterprise/leads', 'enterprise-formal': '/enterprise',
      orders: '/orders', 'driver-orders': '/driver-orders',
      vehicles: '/vehicles', drivers: '/drivers',
      'finance-bills': '/finance/bills',
      'finance-invoices': '/finance/invoices',
      'finance-payments': '/finance/payments',
      'finance-transactions': '/finance/transactions',
      config: '/config', analytics: '/analytics',
      'system-accounts': '/system/accounts',
      'system-roles': '/system/roles',
      'system-login-logs': '/system/login-logs',
      'system-op-logs': '/system/op-logs',
      'system-online': '/system/online',
      'system-menus': '/system/menus',
    };
    navigate(routeMap[key] || '/');
  };

  const openFieldEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveFieldEdit = () => {
    Message.success('已更新');
    setEditingField(null);
  };

  const userDropdown = (
    <Menu
      onClickMenuItem={(key) => {
        if (key === 'profile') setProfileVisible(true);
        if (key === 'logout') navigate('/login');
      }}
    >
      <Item key="profile">
        <IconUserGroup style={{ marginRight: 6 }} />个人信息
      </Item>
      <Item key="logout">
        <span style={{ color: '#F53F3F' }}><IconPoweroff style={{ marginRight: 6 }} />退出登录</span>
      </Item>
    </Menu>
  );

  return (
    <Layout style={{ height: '100vh' }}>
      {/* 浅色侧边栏 */}
      <Sider
        collapsed={collapsed}
        onCollapse={setCollapsed}
        collapsible
        trigger={null}
        breakpoint="xl"
        style={{ background: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e5e6eb' }}
      >
        <div style={{
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0', cursor: 'pointer', flexShrink: 0,
        }} onClick={() => navigate('/')}>
          <span style={{ color: '#1d2129', fontSize: collapsed ? 16 : 18, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {collapsed ? '尊' : '尊出行 · 运营端'}
          </span>
        </div>

        <Menu
          theme="light"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={defaultOpenKeys}
          onClickMenuItem={handleMenuClick}
          style={{ flex: 1, overflow: 'auto', borderRight: 'none' }}
        >
          <Item key="dashboard"><IconDashboard />工作台</Item>
          <SubMenu key="enterprise-group" title={<span><IconUserGroup />企业客户管理</span>}>
            <Item key="enterprise-leads">线索客户</Item>
            <Item key="enterprise-formal">正式客户</Item>
          </SubMenu>
          <SubMenu key="order-group" title={<span><IconFile />订单管理</span>}>
            <Item key="orders">乘客订单</Item>
            <Item key="driver-orders">司机工单</Item>
          </SubMenu>
          <Item key="vehicles"><IconTool />车辆管理</Item>
          <Item key="drivers"><IconIdcard />司机管理</Item>
          <SubMenu key="finance-group" title={<span><IconSafe />财务管理</span>}>
            <Item key="finance-bills">企业账单</Item>
            <Item key="finance-transactions">交易流水</Item>
            <Item key="finance-invoices">发票管理</Item>
            <Item key="finance-payments">回款管理</Item>
          </SubMenu>
          <Item key="config"><IconSettings />运营配置</Item>
          <Item key="analytics"><IconDesktop />数据报表</Item>
          <SubMenu key="system-group" title={<span><IconCommon />系统管理</span>}>
            <Item key="system-accounts">账号管理</Item>
            <Item key="system-roles">角色管理</Item>
            <Item key="system-login-logs">登录日志</Item>
            <Item key="system-op-logs">操作日志</Item>
            <Item key="system-online">在线用户</Item>
            <Item key="system-menus">菜单管理</Item>
          </SubMenu>
        </Menu>

        <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Button
            type="text"
            icon={collapsed ? <IconMenuUnfold /> : <IconMenuFold />}
            onClick={() => setCollapsed(!collapsed)}
          />
        </div>
      </Sider>

      <Layout style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header style={{
          background: '#fff', padding: '0 24px', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #e5e6eb', flexShrink: 0,
        }}>
          <div style={{ fontSize: 14, color: '#4e5969' }}>
            {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <Dropdown droplist={userDropdown} trigger="click" position="br">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar size={32} style={{ background: '#165DFF' }}>
                {currentUser.name.charAt(0)}
              </Avatar>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{currentUser.name}</span>
              <IconDown style={{ color: '#86909c', fontSize: 12 }} />
            </Space>
          </Dropdown>
        </Header>

        <Content style={{
          padding: 20, background: '#f2f3f5', overflow: 'auto', flex: 1,
        }}>
          <Outlet />
        </Content>
      </Layout>

      {/* 个人信息弹窗 */}
      <Modal
        title="个人信息"
        visible={profileVisible}
        onCancel={() => { setProfileVisible(false); setEditingField(null); }}
        footer={<Button onClick={() => setProfileVisible(false)}>关闭</Button>}
        style={{ width: 520 }}
      >
        {/* 头像行 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ position: 'relative' }}>
            <Avatar size={72} style={{ background: '#165DFF', fontSize: 32 }}>
              {currentUser.name.charAt(0)}
            </Avatar>
            <Button
              size="mini" shape="circle" icon={<IconEdit />}
              style={{ position: 'absolute', bottom: 0, right: -4 }}
              onClick={() => openFieldEdit('avatar', '')}
            />
          </div>
        </div>

        {/* 姓名 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
          <span style={{ color: '#86909c', width: 60 }}>姓名</span>
          {editingField === 'name' ? (
            <Space>
              <Input size="small" style={{ width: 200 }} value={editValue} onChange={setEditValue} />
              <Button size="small" type="primary" onClick={saveFieldEdit}>保存</Button>
              <Button size="small" onClick={() => setEditingField(null)}>取消</Button>
            </Space>
          ) : (
            <Space>
              <span>{currentUser.name}</span>
              <Button type="text" size="small" icon={<IconEdit />} onClick={() => openFieldEdit('name', currentUser.name)}>修改</Button>
            </Space>
          )}
        </div>

        {/* 手机号 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
          <span style={{ color: '#86909c', width: 60 }}>手机号</span>
          {editingField === 'phone' ? (
            <Space>
              <Input size="small" style={{ width: 200 }} value={editValue} onChange={setEditValue} />
              <Button size="small" type="primary" onClick={saveFieldEdit}>保存</Button>
              <Button size="small" onClick={() => setEditingField(null)}>取消</Button>
            </Space>
          ) : (
            <Space>
              <span>{currentUser.phone}</span>
              <Button type="text" size="small" icon={<IconEdit />} onClick={() => openFieldEdit('phone', currentUser.phone)}>修改</Button>
            </Space>
          )}
        </div>

        {/* 密码 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
          <span style={{ color: '#86909c', width: 60 }}>密码</span>
          {editingField === 'password' ? (
            <Space>
              <Input.Password size="small" style={{ width: 200 }} placeholder="新密码" value={editValue} onChange={setEditValue} />
              <Button size="small" type="primary" onClick={saveFieldEdit}>保存</Button>
              <Button size="small" onClick={() => setEditingField(null)}>取消</Button>
            </Space>
          ) : (
            <Space>
              <span>••••••</span>
              <Button type="text" size="small" icon={<IconEdit />} onClick={() => openFieldEdit('password', '')}>修改</Button>
            </Space>
          )}
        </div>
      </Modal>
    </Layout>
  );
}
