import { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Select, Space, Tabs, Modal, Message, Input, Form, DatePicker,
} from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { operatorAccounts, loginLogs, operationLogs, onlineUsers } from '../data/mock';
import type { OperatorAccount, AccountRole, LoginLog, OperationLog, OnlineUser } from '../types';

const roleMap: Record<AccountRole, { label: string; color: string }> = {
  super_admin: { label: '超级管理员', color: 'gold' },
  ops_admin: { label: '运营管理员', color: 'blue' },
  finance_admin: { label: '财务管理员', color: 'green' },
  cs_admin: { label: '客服管理员', color: 'gray' },
};

const moduleMap = ['企业客户', '订单管理', '车辆管理', '司机管理', '财务管理', '运营配置', '系统管理'];
const typeMap = ['新增', '编辑', '审核', '派车', '改派', '停用', '启用', '调整额度', '结算确认', '配置修改', '重置密码'];

function AccountTab() {
  const [accounts] = useState(operatorAccounts);
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [resetVisible, setResetVisible] = useState(false);
  const [selected, setSelected] = useState<OperatorAccount | null>(null);
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
    { title: '运营区域', dataIndex: 'areas', width: 150, render: (v?: string[]) => v?.join(', ') || '全部区域' },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'red'} size="small">{v === 'active' ? '正常' : '已停用'}</Tag> },
    { title: '创建时间', dataIndex: 'createdAt', width: 140 },
    { title: '最近登录', width: 180, render: (_: unknown, r: OperatorAccount) => r.lastLogin ? `${r.lastLogin} · ${r.lastIp}` : '-' },
    {
      title: '操作', width: 240, fixed: 'right' as const, render: (_: unknown, r: OperatorAccount) => (
        <Space size={4}>
          <Button type="text" size="small" onClick={() => { setSelected(r); setEditVisible(true); }}>编辑</Button>
          <Button type="text" size="small" onClick={() => { setSelected(r); setResetVisible(true); }}>重置密码</Button>
          {r.status === 'active'
            ? <Button type="text" size="small" status="danger" onClick={() => Message.success(`已停用账号 ${r.username}`)}>停用</Button>
            : <Button type="text" size="small" status="success" onClick={() => Message.success(`已启用账号 ${r.username}`)}>启用</Button>}
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
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 1400 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>

      <Modal title="新增账号" visible={addVisible} onOk={() => { setAddVisible(false); Message.success('账号创建成功'); }} onCancel={() => setAddVisible(false)}>
        <Form form={addForm} layout="vertical">
          <Form.Item label="账号" field="username" rules={[{ required: true }]}><Input placeholder="6-20位字母数字" /></Form.Item>
          <Form.Item label="姓名" field="name" rules={[{ required: true }]}><Input placeholder="真实姓名" /></Form.Item>
          <Form.Item label="手机号" field="phone" rules={[{ required: true }]}><Input placeholder="11位手机号" /></Form.Item>
          <Form.Item label="角色" field="role" rules={[{ required: true }]}>
            <Select options={Object.entries(roleMap).map(([k, v]) => ({ label: v.label, value: k }))} />
          </Form.Item>
          <Form.Item label="初始密码" field="password" rules={[{ required: true }]}><Input.Password placeholder="8-20位，含字母和数字" /></Form.Item>
        </Form>
      </Modal>

      <Modal title="编辑账号" visible={editVisible} onOk={() => { setEditVisible(false); Message.success('修改已保存'); }} onCancel={() => setEditVisible(false)}>
        {selected && <p>编辑账号：{selected.username} ({selected.name})</p>}
      </Modal>

      <Modal title="重置密码" visible={resetVisible} onOk={() => { setResetVisible(false); Message.success('密码已重置，新密码已短信通知'); }} onCancel={() => setResetVisible(false)}>
        {selected && <p>确认重置 <strong>{selected.username}</strong> 的登录密码？</p>}
      </Modal>
    </div>
  );
}

function RoleTab() {
  const roles = [
    { role: 'super_admin' as AccountRole, name: '超级管理员', desc: '全部模块可见，可管理系统管理', modules: ['全部模块'] },
    { role: 'ops_admin' as AccountRole, name: '运营管理员', desc: '业务管理（工作台、企业、订单、车辆、司机、运营配置）', modules: ['工作台', '企业客户管理', '订单管理', '车辆管理', '司机管理', '运营配置'] },
    { role: 'finance_admin' as AccountRole, name: '财务管理员', desc: '财务（工作台、财务管理、数据分析）', modules: ['工作台', '财务管理', '数据分析与报表'] },
    { role: 'cs_admin' as AccountRole, name: '客服管理员', desc: '工作台、订单（仅查看）', modules: ['工作台', '订单管理（只读）'] },
  ];

  const columns = [
    { title: '角色', width: 130, render: (_: unknown, r: typeof roles[0]) => <Tag color={roleMap[r.role].color}>{r.name}</Tag> },
    { title: '编码', width: 140, render: (_: unknown, r: typeof roles[0]) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.role}</span> },
    { title: '说明', dataIndex: 'desc', ellipsis: true },
    { title: '权限范围', width: 400, render: (_: unknown, r: typeof roles[0]) => <Space size={4} wrap>{r.modules.map(m => <Tag key={m} size="small">{m}</Tag>)}</Space> },
  ];

  return (
    <Card title="角色定义（系统预置，不可修改）" bodyStyle={{ padding: 0 }}>
      <Table columns={columns} data={roles} rowKey="role" pagination={false} />
    </Card>
  );
}

function LoginLogTab() {
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

function OperationLogTab() {
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

function OnlineUserTab() {
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
          onClick={() => Message.success(`已强制下线 ${r.username}`)}>强制下线</Button>
      ),
    },
  ];

  return (
    <Card bodyStyle={{ padding: 0 }} title="当前在线用户">
      <Table columns={columns} data={users} rowKey="id" scroll={{ x: 1100 }} pagination={false} stripe />
    </Card>
  );
}

export default function SystemPage() {
  const [activeTab, setActiveTab] = useState('accounts');

  return (
    <div>
      <Tabs activeTab={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }} tabPosition="left">
        <Tabs.TabPane key="accounts" title="账号管理" />
        <Tabs.TabPane key="roles" title="角色管理" />
        <Tabs.TabPane key="login-logs" title="登录日志" />
        <Tabs.TabPane key="op-logs" title="操作日志" />
        <Tabs.TabPane key="online" title="在线用户" />
      </Tabs>
      <div style={{ flex: 1 }}>
        {activeTab === 'accounts' && <AccountTab />}
        {activeTab === 'roles' && <RoleTab />}
        {activeTab === 'login-logs' && <LoginLogTab />}
        {activeTab === 'op-logs' && <OperationLogTab />}
        {activeTab === 'online' && <OnlineUserTab />}
      </div>
    </div>
  );
}
