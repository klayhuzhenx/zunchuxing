import { useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Card, Table, Tag, Button, Select, Space, Modal, Message, Input, Form, DatePicker, Checkbox,
} from '@arco-design/web-react';
import { IconSearch, IconPlus } from '@arco-design/web-react/icon';
import { operatorAccounts, loginLogs, operationLogs, onlineUsers, currentUser } from '../data/mock';
import type { OperatorAccount, AccountRole, LoginLog, OperationLog, OnlineUser } from '../types';

const roleMap: Record<AccountRole, { label: string; color: string }> = {
  super_admin: { label: '超级管理员', color: 'gold' },
  ops_admin: { label: '运营管理员', color: 'blue' },
  finance_admin: { label: '财务管理员', color: 'green' },
  cs_admin: { label: '客服管理员', color: 'gray' },
};

const areaOptions = [
  { label: '南山区核心商圈', value: '南山区核心商圈' },
  { label: '浦东陆家嘴', value: '浦东陆家嘴' },
  { label: '福田CBD', value: '福田CBD' },
  { label: '天河CBD', value: '天河CBD' },
  { label: '朝阳CBD', value: '朝阳CBD' },
];

const moduleMap = ['企业客户', '订单管理', '车辆管理', '司机管理', '财务管理', '运营配置', '系统管理'];
const typeMap = ['新增', '编辑', '审核', '派车', '改派', '停用', '启用', '调整额度', '结算确认', '配置修改', '重置密码'];

// ===== 账号管理 =====
export function AccountsPage() {
  const [accounts] = useState(operatorAccounts);
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [resetVisible, setResetVisible] = useState(false);
  const [selected, setSelected] = useState<OperatorAccount | null>(null);
  const [toggleVisible, setToggleVisible] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<OperatorAccount | null>(null);
  const [addForm] = Form.useForm();

  const filtered = useMemo(() => {
    let r = accounts;
    if (roleFilter.length) r = r.filter(a => roleFilter.includes(a.role));
    if (statusFilter.length) r = r.filter(a => statusFilter.includes(a.status));
    if (keyword) r = r.filter(a => a.username.includes(keyword) || a.name.includes(keyword) || a.phone.includes(keyword));
    return r;
  }, [accounts, roleFilter, statusFilter, keyword]);

  const columns = [
    { title: '账号', dataIndex: 'username', width: 130 },
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '手机号', dataIndex: 'phone', width: 130 },
    { title: '角色', dataIndex: 'role', width: 110, render: (v: AccountRole) => <Tag color={roleMap[v].color} size="small">{roleMap[v].label}</Tag> },
    { title: '运营区域', dataIndex: 'areas', width: 180, render: (v?: string[]) => v?.join(', ') || '全部区域' },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'red'} size="small">{v === 'active' ? '正常' : '已停用'}</Tag> },
    { title: '创建时间', dataIndex: 'createdAt', width: 140 },
    {
      title: '操作', width: 240, fixed: 'right' as const, render: (_: unknown, r: OperatorAccount) => (
        <Space size={4}>
          <Button type="text" size="small" onClick={() => { setSelected(r); setEditVisible(true); }}>编辑</Button>
          <Button type="text" size="small" onClick={() => { setSelected(r); setResetVisible(true); }}>重置密码</Button>
          {r.status === 'active'
            ? <Button type="text" size="small" status="danger" onClick={() => { setToggleTarget(r); setToggleVisible(true); }}>停用</Button>
            : <Button type="text" size="small" status="success" onClick={() => { setToggleTarget(r); setToggleVisible(true); }}>启用</Button>}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <Select placeholder="角色" style={{ width: 240 }} mode="multiple" value={roleFilter} onChange={setRoleFilter}
            options={Object.entries(roleMap).map(([k, v]) => ({ label: v.label, value: k }))} />
          <Select placeholder="状态" style={{ width: 140 }} mode="multiple" value={statusFilter} onChange={setStatusFilter}
            options={[{ label: '正常', value: 'active' }, { label: '已停用', value: 'disabled' }]} />
          <Input prefix={<IconSearch />} placeholder="账号/姓名/手机号" style={{ width: 220 }} value={keyword} onChange={setKeyword} allowClear />
          <div style={{ flex: 1 }} />
          <Button type="primary" onClick={() => setAddVisible(true)}>新增账号</Button>
        </Space>
      </Card>
      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 1200 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>

      {/* 新增账号 */}
      <Modal title="新增账号" visible={addVisible} onOk={() => { setAddVisible(false); Message.success('账号创建成功'); }} onCancel={() => setAddVisible(false)}>
        <Form form={addForm} layout="vertical">
          <Form.Item label="账号" field="username" rules={[{ required: true }]}><Input placeholder="6-20位字母数字" /></Form.Item>
          <Form.Item label="姓名" field="name" rules={[{ required: true }]}><Input placeholder="真实姓名" /></Form.Item>
          <Form.Item label="手机号" field="phone" rules={[{ required: true }]}><Input placeholder="11位手机号" /></Form.Item>
          <Form.Item label="角色" field="role" rules={[{ required: true }]}>
            <Select options={Object.entries(roleMap).map(([k, v]) => ({ label: v.label, value: k }))} />
          </Form.Item>
          <Form.Item label="关联运营区域" field="areas">
            <Select mode="multiple" placeholder="选择运营区域（可多选，不选默认全部区域）" options={areaOptions} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="初始密码" field="password" rules={[{ required: true }]}><Input.Password placeholder="8-20位，含字母和数字" /></Form.Item>
        </Form>
      </Modal>

      {/* 编辑账号 */}
      <Modal title="编辑账号" visible={editVisible} onOk={() => { setEditVisible(false); Message.success('修改已保存'); }} onCancel={() => setEditVisible(false)}>
        {selected && (
          <Form layout="vertical">
            <Form.Item label="账号"><Input value={selected.username} disabled /></Form.Item>
            <Form.Item label="姓名"><Input defaultValue={selected.name} /></Form.Item>
            <Form.Item label="手机号"><Input defaultValue={selected.phone} /></Form.Item>
            <Form.Item label="角色">
              <Select defaultValue={selected.role} options={Object.entries(roleMap).map(([k, v]) => ({ label: v.label, value: k }))} />
            </Form.Item>
            <Form.Item label="运营区域">
              <Select mode="multiple" defaultValue={selected.areas || []} placeholder="选择运营区域" options={areaOptions} style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* 停用/启用确认弹窗 */}
      <Modal
        title={toggleTarget?.status === 'active' ? `停用账号 — ${toggleTarget?.username || ''}` : `启用账号 — ${toggleTarget?.username || ''}`}
        visible={toggleVisible}
        onOk={() => {
          if (!toggleTarget) return;
          if (toggleTarget.status === 'active') {
            // 超管不可停用自己
            if (toggleTarget.username === currentUser.account) {
              Message.warning('超级管理员不可停用自己的账号');
              setToggleVisible(false); setToggleTarget(null);
              return;
            }
            Message.success('账号已停用');
          } else {
            Message.success('账号已启用');
          }
          setToggleVisible(false); setToggleTarget(null);
        }}
        onCancel={() => { setToggleVisible(false); setToggleTarget(null); }}
        okText="确认"
        okButtonProps={toggleTarget?.status === 'active' ? { status: 'danger' } : { status: 'success' }}
      >
        {toggleTarget?.status === 'active' ? (
          <p>确认停用账号 <strong>{toggleTarget?.username}</strong>（{toggleTarget?.name}）？停用后该账号无法登录，当前登录态立即失效。</p>
        ) : (
          <p>确认启用账号 <strong>{toggleTarget?.username}</strong>（{toggleTarget?.name}）？</p>
        )}
      </Modal>

      {/* 重置密码 */}
      <Modal title="重置密码" visible={resetVisible} onOk={() => { setResetVisible(false); Message.success('密码已重置，新密码已短信通知'); }} onCancel={() => setResetVisible(false)}>
        {selected && <p>确认重置 <strong>{selected.username}</strong> 的登录密码？</p>}
      </Modal>
    </div>
  );
}

// ===== 角色管理 =====
export function RolesPage() {
  const allModules = ['工作台', '企业客户管理', '订单管理', '车辆管理', '司机管理', '财务管理', '运营配置', '数据分析与报表', '系统管理'];
  const [roles, setRoles] = useState([
    { role: 'super_admin' as AccountRole, name: '超级管理员', desc: '全部模块可见，可管理系统管理', modules: [...allModules] },
    { role: 'ops_admin' as AccountRole, name: '运营管理员', desc: '业务管理（工作台、企业、订单、车辆、司机、运营配置）', modules: ['工作台', '企业客户管理', '订单管理', '车辆管理', '司机管理', '运营配置'] },
    { role: 'finance_admin' as AccountRole, name: '财务管理员', desc: '财务（工作台、财务管理、数据分析）', modules: ['工作台', '财务管理', '数据分析与报表'] },
    { role: 'cs_admin' as AccountRole, name: '客服管理员', desc: '工作台、订单（仅查看）', modules: ['工作台', '订单管理（只读）'] },
  ]);
  const [editRole, setEditRole] = useState<AccountRole | null>(null);
  const [editModules, setEditModules] = useState<string[]>([]);

  const openEdit = (roleEntry: typeof roles[0]) => {
    if (roleEntry.role === 'super_admin') {
      Message.info('超级管理员拥有全部权限，不可变更');
      return;
    }
    setEditRole(roleEntry.role);
    setEditModules([...roleEntry.modules]);
  };

  const saveEdit = () => {
    setRoles(prev => prev.map(r => r.role === editRole ? { ...r, modules: editModules } : r));
    setEditRole(null);
    Message.success('角色权限已更新');
  };

  const columns = [
    { title: '角色', width: 130, render: (_: unknown, r: typeof roles[0]) => <Tag color={roleMap[r.role].color}>{r.name}</Tag> },
    { title: '编码', width: 140, render: (_: unknown, r: typeof roles[0]) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.role}</span> },
    { title: '说明', dataIndex: 'desc', ellipsis: true },
    { title: '权限范围', width: 440, render: (_: unknown, r: typeof roles[0]) => <Space size={4} wrap>{r.modules.map(m => <Tag key={m} size="small">{m}</Tag>)}</Space> },
    {
      title: '操作', width: 80, render: (_: unknown, r: typeof roles[0]) => (
        <Button type="text" size="small" onClick={() => openEdit(r)}>
          {r.role === 'super_admin' ? '查看' : '编辑权限'}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card title="角色管理" bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={roles} rowKey="role" pagination={false} />
      </Card>

      <Modal
        title={`编辑角色权限 — ${editRole ? roleMap[editRole].label : ''}`}
        visible={!!editRole}
        onOk={saveEdit}
        onCancel={() => setEditRole(null)}
      >
        <p style={{ color: '#86909c', fontSize: 13, marginBottom: 16 }}>
          勾选该角色可访问的模块。超级管理员拥有全部权限且不可变更。
        </p>
        <Checkbox.Group
          direction="vertical"
          value={editModules}
          onChange={v => setEditModules(v as string[])}
          options={allModules.map(m => ({ label: m, value: m }))}
        />
      </Modal>
    </div>
  );
}

// ===== 登录日志 =====
export function LoginLogsPage() {
  const [logs] = useState(loginLogs);
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    let r = logs;
    if (keyword) r = r.filter(l => l.username.includes(keyword) || l.ip.includes(keyword) || l.name.includes(keyword));
    return r;
  }, [logs, keyword]);

  const columns = [
    { title: '账号', dataIndex: 'username', width: 130 },
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '登录时间', dataIndex: 'time', width: 170 },
    { title: 'IP地址', dataIndex: 'ip', width: 140 },
    { title: '设备信息', dataIndex: 'device', width: 180, ellipsis: true },
    { title: '结果', dataIndex: 'result', width: 80, render: (v: string) => <Tag color={v === 'success' ? 'green' : 'red'} size="small">{v === 'success' ? '成功' : '失败'}</Tag> },
    { title: '失败原因', dataIndex: 'failReason', width: 120, render: (v?: string) => v || '-' },
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12}>
          <DatePicker.RangePicker style={{ width: 260 }} placeholder={['开始时间', '结束时间']} />
          <Input prefix={<IconSearch />} placeholder="账号/IP" style={{ width: 220 }} value={keyword} onChange={setKeyword} allowClear />
        </Space>
      </Card>
      <Card bodyStyle={{ padding: 0 }} title="登录日志（保留180天，只读）">
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 1000 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>
    </div>
  );
}

// ===== 操作日志 =====
export function OperationLogsPage() {
  const [logs] = useState(operationLogs);
  const [modFilter, setModFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    let r = logs;
    if (modFilter.length) r = r.filter(l => modFilter.includes(l.module));
    if (typeFilter.length) r = r.filter(l => typeFilter.includes(l.type));
    if (keyword) r = r.filter(l => l.operator.includes(keyword) || l.target.includes(keyword) || l.detail.includes(keyword));
    return r;
  }, [logs, modFilter, typeFilter, keyword]);

  const columns = [
    { title: '操作时间', dataIndex: 'time', width: 170 },
    { title: '操作人', dataIndex: 'operator', width: 160 },
    { title: '操作模块', dataIndex: 'module', width: 100, render: (v: string) => <Tag size="small">{v}</Tag> },
    { title: '操作类型', dataIndex: 'type', width: 100, render: (v: string) => <Tag color={v.includes('停用') || v.includes('删除') ? 'red' : 'arcoblue'} size="small">{v}</Tag> },
    { title: '操作对象', dataIndex: 'target', width: 180, ellipsis: true },
    { title: '详情', dataIndex: 'detail', width: 250, ellipsis: true },
    { title: 'IP', dataIndex: 'ip', width: 140 },
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <DatePicker.RangePicker style={{ width: 260 }} placeholder={['开始时间', '结束时间']} />
          <Select placeholder="操作模块" style={{ width: 200 }} mode="multiple" value={modFilter} onChange={setModFilter}
            options={moduleMap.map(m => ({ label: m, value: m }))} />
          <Select placeholder="操作类型" style={{ width: 200 }} mode="multiple" value={typeFilter} onChange={setTypeFilter}
            options={typeMap.map(t => ({ label: t, value: t }))} />
          <Input prefix={<IconSearch />} placeholder="操作人/对象" style={{ width: 200 }} value={keyword} onChange={setKeyword} allowClear />
        </Space>
      </Card>
      <Card bodyStyle={{ padding: 0 }} title="操作日志（保留180天，只读）">
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 1300 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>
    </div>
  );
}

// ===== 在线用户 =====
export function OnlineUsersPage() {
  const [users] = useState(onlineUsers);

  const columns = [
    { title: '账号', dataIndex: 'username', width: 130 },
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '角色', dataIndex: 'role', width: 110, render: (v: AccountRole) => <Tag color={roleMap[v].color} size="small">{roleMap[v].label}</Tag> },
    { title: '登录时间', dataIndex: 'loginTime', width: 140 },
    { title: '登录IP', dataIndex: 'ip', width: 140 },
    { title: '设备信息', dataIndex: 'device', width: 160 },
    { title: '在线时长', dataIndex: 'duration', width: 100 },
    {
      title: '操作', width: 110, render: (_: unknown, r: OnlineUser) => (
        <Button type="text" size="small" status="danger"
          onClick={() => {
            Modal.confirm({
              title: `强制下线 — ${r.username}`,
              content: `确认强制下线账号 ${r.username}？该账号当前未保存的工作将丢失。`,
              onOk: () => Message.success(`账号已强制下线`),
            });
          }}>强制下线</Button>
      ),
    },
  ];

  return (
    <Card bodyStyle={{ padding: 0 }} title="当前在线用户">
      <Table columns={columns} data={users} rowKey="id" scroll={{ x: 1100 }} pagination={false} stripe />
    </Card>
  );
}


// ===== 城市管理 =====
export function CityManagementPage() {
  const [cities, setCities] = useState([
    { id: 'C001', name: '深圳', regionCount: 2, status: 'active' as const },
    { id: 'C002', name: '上海', regionCount: 1, status: 'active' as const },
    { id: 'C003', name: '广州', regionCount: 0, status: 'active' as const },
    { id: 'C004', name: '北京', regionCount: 0, status: 'active' as const },
  ]);
  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<typeof cities[0] | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    if (!keyword) return cities;
    return cities.filter(c => c.name.includes(keyword));
  }, [cities, keyword]);

  const handleAdd = () => {
    if (!nameInput.trim()) { Message.warning('请输入城市名称'); return; }
    if (nameInput.length > 20) { Message.warning('城市名称不能超过20字'); return; }
    if (cities.some(c => c.name === nameInput.trim())) { Message.warning('该城市已存在'); return; }
    const newCity = { id: 'C' + String(cities.length + 1).padStart(3, '0'), name: nameInput.trim(), regionCount: 0, status: 'active' as const };
    setCities([...cities, newCity]);
    setAddVisible(false); setNameInput('');
    Message.success('城市保存成功');
  };

  const handleEdit = () => {
    if (!editTarget || !nameInput.trim()) return;
    if (nameInput.length > 20) { Message.warning('城市名称不能超过20字'); return; }
    if (cities.some(c => c.name === nameInput.trim() && c.id !== editTarget.id)) { Message.warning('该城市已存在'); return; }
    setCities(cities.map(c => c.id === editTarget.id ? { ...c, name: nameInput.trim() } : c));
    setEditVisible(false); setEditTarget(null); setNameInput('');
    Message.success('城市已更新');
  };

  const openEdit = (city: typeof cities[0]) => {
    setEditTarget(city);
    setNameInput(city.name);
    setEditVisible(true);
  };

  const toggleStatus = (city: typeof cities[0]) => {
    const newStatus = city.status === 'active' ? 'inactive' : 'active';
    const msg = newStatus === 'inactive' ? '停用后该城市下所有区域将自动停用' : '启用后下属区域需手动逐一启用';
    Modal.confirm({
      title: newStatus === 'inactive' ? `停用城市「${city.name}」` : `启用城市「${city.name}」`,
      content: msg,
      onOk: () => {
        setCities(cities.map(c => c.id === city.id ? { ...c, status: newStatus as 'active' | 'inactive' } : c));
        Message.success(newStatus === 'inactive' ? '城市已停用' : '城市已启用');
      },
    });
  };

  const columns = [
    { title: '城市名称', dataIndex: 'name', width: 150 },
    { title: '区域数', dataIndex: 'regionCount', width: 80 },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'gray'} size="small">{v === 'active' ? '已启用' : '已停用'}</Tag> },
    {
      title: '操作', width: 140, render: (_: unknown, r: typeof cities[0]) => (
        <Space size={4}>
          <Button type="text" size="small" onClick={() => openEdit(r)}>编辑</Button>
          {r.status === 'active'
            ? <Button type="text" size="small" status="warning" onClick={() => toggleStatus(r)}>停用</Button>
            : <Button type="text" size="small" status="success" onClick={() => toggleStatus(r)}>启用</Button>}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12}>
          <Input prefix={<IconSearch />} placeholder="搜索城市名称" style={{ width: 200 }} value={keyword} onChange={setKeyword} allowClear />
          <div style={{ flex: 1 }} />
          <Button type="primary" icon={<IconPlus />} onClick={() => { setNameInput(''); setAddVisible(true); }}>新增城市</Button>
        </Space>
      </Card>
      <Card bodyStyle={{ padding: 0 }} title="城市管理">
        <Table columns={columns} data={filtered} rowKey="id" pagination={false} />
        <div style={{ padding: '12px 16px', color: '#86909c', fontSize: 12 }}>
          提示：新增运营区域前需先配置城市。停用城市后该城市下所有区域自动停用。城市无单独删除功能。
        </div>
      </Card>

      <Modal title="新增城市" visible={addVisible} onOk={handleAdd} onCancel={() => setAddVisible(false)}>
        <Form layout="vertical">
          <Form.Item label="城市名称" rules={[{ required: true, message: '请输入城市名称' }]}>
            <Input placeholder="输入城市名称，≤20字" maxLength={20} value={nameInput} onChange={setNameInput} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="编辑城市" visible={editVisible} onOk={handleEdit} onCancel={() => setEditVisible(false)}>
        <Form layout="vertical">
          <Form.Item label="城市名称" rules={[{ required: true, message: '请输入城市名称' }]}>
            <Input placeholder="输入城市名称，≤20字" maxLength={20} value={nameInput} onChange={setNameInput} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// ===== 路由布局 =====
export default function SystemPage() {
  return <Outlet />;
}
