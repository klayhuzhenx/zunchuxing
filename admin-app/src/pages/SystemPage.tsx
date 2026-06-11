import { useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Card, Table, Tag, Button, Select, Space, Modal, Message, Input, Form, DatePicker, Empty,
} from '@arco-design/web-react';
import { IconSearch, IconPlus } from '@arco-design/web-react/icon';
import { operatorAccounts, loginLogs, operationLogs, onlineUsers, currentUser } from '../data/mock';
import type { OperatorAccount, AccountRole, OnlineUser } from '../types';

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

// D10-02：校验正则
const ACCOUNT_REGEX = /^[a-zA-Z0-9]{6,20}$/;
const PHONE_REGEX = /^1[3-9]\d{9}$/;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/;

// D10-06：默认近 30 天
const getDefault30DaysRange = (): [string, string] => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return [fmt(start), fmt(end)];
};

// ===== 账号管理 =====
export function AccountsPage() {
  // D10-10：用 state 维护账号列表，新增/编辑后真实更新
  const [accounts, setAccounts] = useState<OperatorAccount[]>(operatorAccounts);
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
  const [editForm] = Form.useForm();

  const filtered = useMemo(() => {
    let r = accounts;
    if (roleFilter.length) r = r.filter(a => roleFilter.includes(a.role));
    if (statusFilter.length) r = r.filter(a => statusFilter.includes(a.status));
    if (keyword) r = r.filter(a => a.username.includes(keyword) || a.name.includes(keyword) || a.phone.includes(keyword));
    return r;
  }, [accounts, roleFilter, statusFilter, keyword]);

  // D10-02：新增账号校验
  const handleAdd = async () => {
    try {
      const v = await addForm.validate();
      // 唯一性校验
      if (accounts.some(a => a.username === v.username)) {
        Message.error('该账号已被使用');
        return;
      }
      if (accounts.some(a => a.phone === v.phone)) {
        Message.error('该手机号已被其他账号绑定');
        return;
      }
      // D10-10：真实写入列表
      const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
      const newAccount: OperatorAccount = {
        id: `A${Date.now()}`,
        username: v.username, name: v.name, phone: v.phone,
        role: v.role, areas: v.areas,
        status: 'active', createdAt: now,
      };
      setAccounts([newAccount, ...accounts]);
      setAddVisible(false);
      addForm.resetFields();
      Message.success('账号创建成功，初始密码已短信通知该手机号');
    } catch { /* 校验失败 */ }
  };

  const handleEdit = async () => {
    try {
      const v = await editForm.validate();
      if (!selected) return;
      // 手机号不可与其他账号重复
      if (accounts.some(a => a.phone === v.phone && a.id !== selected.id)) {
        Message.error('该手机号已被其他账号绑定');
        return;
      }
      setAccounts(accounts.map(a => a.id === selected.id ? { ...a, ...v } : a));
      setEditVisible(false);
      Message.success('修改已保存');
    } catch { /* */ }
  };

  // D10-08 类似保护：超管不可停用自己
  const handleToggleStatus = () => {
    if (!toggleTarget) return;
    if (toggleTarget.status === 'active') {
      if (toggleTarget.username === currentUser.account) {
        Message.warning('超级管理员不可停用自己的账号');
        setToggleVisible(false); setToggleTarget(null);
        return;
      }
      setAccounts(accounts.map(a => a.id === toggleTarget.id ? { ...a, status: 'disabled' } : a));
      Message.success('账号已停用');
    } else {
      setAccounts(accounts.map(a => a.id === toggleTarget.id ? { ...a, status: 'active' } : a));
      Message.success('账号已启用');
    }
    setToggleVisible(false); setToggleTarget(null);
  };

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
          <Button type="text" size="small" onClick={() => {
            setSelected(r);
            editForm.setFieldsValue({ name: r.name, phone: r.phone, role: r.role, areas: r.areas });
            setEditVisible(true);
          }}>编辑</Button>
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
          <Button type="primary" icon={<IconPlus />} onClick={() => setAddVisible(true)}>新增账号</Button>
        </Space>
      </Card>
      <Card bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns} data={filtered} rowKey="id" scroll={{ x: 1200 }}
          pagination={{ pageSize: 15, showTotal: true }} stripe
          // D10-09：定制空状态文案
          noDataElement={<Empty description="暂无符合条件的账号" />}
        />
      </Card>

      {/* 新增账号 — D10-02/03/04 业务校验 */}
      <Modal title="新增账号" visible={addVisible} onOk={handleAdd}
        onCancel={() => { setAddVisible(false); addForm.resetFields(); }}>
        <Form form={addForm} layout="vertical">
          <Form.Item label="账号" field="username" rules={[
            { required: true, message: '请填写账号' },
            { match: ACCOUNT_REGEX, message: '账号为 6-20 位字母数字组合' },
          ]}>
            <Input placeholder="6-20 位字母数字" maxLength={20} />
          </Form.Item>
          <Form.Item label="姓名" field="name" rules={[
            { required: true, message: '请填写姓名' },
            { maxLength: 20, message: '姓名不能超过 20 字' },
          ]}>
            <Input placeholder="真实姓名" maxLength={20} />
          </Form.Item>
          <Form.Item label="手机号" field="phone" rules={[
            { required: true, message: '请填写手机号' },
            { match: PHONE_REGEX, message: '请输入正确的手机号' },
          ]}>
            <Input placeholder="11 位手机号" maxLength={11} />
          </Form.Item>
          <Form.Item label="角色" field="role" rules={[{ required: true, message: '请选择角色' }]}>
            <Select options={Object.entries(roleMap).map(([k, v]) => ({ label: v.label, value: k }))} />
          </Form.Item>
          <Form.Item label="关联运营区域" field="areas">
            <Select mode="multiple" placeholder="选择运营区域（可多选，不选默认全部区域）" options={areaOptions} style={{ width: '100%' }} />
          </Form.Item>
          {/* D10-03：6-20 位 + D10-02 含字母数字校验 */}
          <Form.Item label="初始密码" field="password" rules={[
            { required: true, message: '请填写初始密码' },
            { match: PASSWORD_REGEX, message: '密码为 6-20 位，需包含字母和数字' },
          ]}>
            <Input.Password placeholder="6-20 位，含字母和数字" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑账号 — D10-02 复用校验 */}
      <Modal title="编辑账号" visible={editVisible} onOk={handleEdit}
        onCancel={() => { setEditVisible(false); editForm.resetFields(); }}>
        {selected && (
          <Form form={editForm} layout="vertical">
            <Form.Item label="账号"><Input value={selected.username} disabled /></Form.Item>
            <Form.Item label="姓名" field="name" rules={[
              { required: true, message: '请填写姓名' },
              { maxLength: 20 },
            ]}><Input maxLength={20} /></Form.Item>
            <Form.Item label="手机号" field="phone" rules={[
              { required: true, message: '请填写手机号' },
              { match: PHONE_REGEX, message: '请输入正确的手机号' },
            ]}><Input maxLength={11} /></Form.Item>
            <Form.Item label="角色" field="role" rules={[{ required: true }]}>
              <Select options={Object.entries(roleMap).map(([k, v]) => ({ label: v.label, value: k }))} />
            </Form.Item>
            <Form.Item label="运营区域" field="areas">
              <Select mode="multiple" placeholder="选择运营区域" options={areaOptions} style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* 停用/启用确认弹窗 */}
      <Modal
        title={toggleTarget?.status === 'active' ? `停用账号 — ${toggleTarget?.username || ''}` : `启用账号 — ${toggleTarget?.username || ''}`}
        visible={toggleVisible}
        onOk={handleToggleStatus}
        onCancel={() => { setToggleVisible(false); setToggleTarget(null); }}
        okText="确认"
        okButtonProps={toggleTarget?.status === 'active' ? { status: 'danger' } : { status: 'success' }}
      >
        {toggleTarget?.status === 'active' ? (
          <p>确认停用账号 <strong>{toggleTarget?.username}</strong>（{toggleTarget?.name}）？停用后该账号无法登录，<strong style={{ color: '#F53F3F' }}>当前登录态立即失效</strong>。</p>
        ) : (
          <p>确认启用账号 <strong>{toggleTarget?.username}</strong>（{toggleTarget?.name}）？</p>
        )}
      </Modal>

      {/* 重置密码 — D10-12 增加登录态失效提示 */}
      <Modal title="重置密码" visible={resetVisible}
        onOk={() => { setResetVisible(false); Message.success('密码已重置，新密码已短信通知'); }}
        onCancel={() => setResetVisible(false)}>
        {selected && (
          <>
            <p>确认重置 <strong>{selected.username}</strong>（{selected.name}）的登录密码？</p>
            <p style={{ color: '#F53F3F', fontSize: 13, marginTop: 8 }}>
              ⚠ 重置后新密码将通过短信发送至 {selected.phone}，<strong>该账号当前登录态立即失效</strong>。
            </p>
          </>
        )}
      </Modal>
    </div>
  );
}

// ===== 角色管理 — D10-01：改为只读展示，删除编辑权限功能 =====
export function RolesPage() {
  // 权限矩阵按需求 §10.2.2 静态展示
  const roleData: { role: AccountRole; name: string; desc: string; modules: string[] }[] = [
    {
      role: 'super_admin', name: '超级管理员',
      desc: '全部模块可见，可管理系统管理',
      modules: ['工作台', '企业客户管理', '订单管理（全部）', '派车/改派', '车辆管理', '司机管理', '财务管理', '运营配置', '数据报表', '系统管理'],
    },
    {
      role: 'ops_admin', name: '运营管理员',
      desc: '业务管理（工作台、企业、订单、车辆、司机、运营配置）',
      modules: ['工作台', '企业客户管理', '订单管理（全部）', '派车/改派', '车辆管理', '司机管理', '运营配置', '数据报表'],
    },
    {
      role: 'finance_admin', name: '财务管理员',
      desc: '财务（工作台、财务管理、数据分析）',
      modules: ['工作台', '订单管理（只读）', '财务管理', '数据报表'],
    },
    {
      role: 'cs_admin', name: '客服管理员',
      desc: '工作台、订单（仅查看）',
      modules: ['工作台（仅待办）', '订单管理（只读）', '数据报表'],
    },
  ];

  const columns = [
    { title: '角色', width: 130, render: (_: unknown, r: typeof roleData[0]) => <Tag color={roleMap[r.role].color}>{r.name}</Tag> },
    { title: '编码', width: 140, render: (_: unknown, r: typeof roleData[0]) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.role}</span> },
    { title: '说明', dataIndex: 'desc', ellipsis: true },
    { title: '权限范围', width: 540, render: (_: unknown, r: typeof roleData[0]) => <Space size={4} wrap>{r.modules.map(m => <Tag key={m} size="small">{m}</Tag>)}</Space> },
  ];

  return (
    <div>
      <Card title="角色管理" bodyStyle={{ padding: 0 }}
        extra={<span style={{ color: '#86909c', fontSize: 12 }}>角色与权限矩阵不支持运营端自定义修改，如需调整由系统开发侧配置</span>}>
        <Table columns={columns} data={roleData} rowKey="role" pagination={false} />
      </Card>
    </div>
  );
}

// ===== 登录日志 — D10-05/06 =====
export function LoginLogsPage() {
  const [logs] = useState(loginLogs);
  const [keyword, setKeyword] = useState('');
  const [accountFilter, setAccountFilter] = useState<string>('');
  const [resultFilter, setResultFilter] = useState<string[]>([]);
  // D10-06：默认近 30 天
  const [dateRange, setDateRange] = useState<[string, string]>(getDefault30DaysRange());

  const accountOptions = useMemo(() => {
    return [...new Set(logs.map(l => l.username))]
      .filter(u => u !== 'unknown')
      .map(u => ({ label: u, value: u }));
  }, [logs]);

  const filtered = useMemo(() => {
    let r = logs;
    if (keyword) r = r.filter(l => l.ip.includes(keyword));
    if (accountFilter) r = r.filter(l => l.username === accountFilter);
    if (resultFilter.length > 0) r = r.filter(l => resultFilter.includes(l.result));
    if (dateRange.length === 2) {
      const [s, e] = dateRange;
      r = r.filter(l => {
        const d = l.time.split(' ')[0];
        return d >= s && d <= e;
      });
    }
    return r;
  }, [logs, keyword, accountFilter, resultFilter, dateRange]);

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
        <Space size={12} wrap>
          <DatePicker.RangePicker style={{ width: 260 }}
            value={dateRange}
            onChange={(_, ds) => setDateRange(ds[0] && ds[1] ? [ds[0], ds[1]] : getDefault30DaysRange())}
            placeholder={['开始时间', '结束时间']} />
          {/* D10-05：账号下拉 */}
          <Select placeholder="账号" style={{ width: 160 }} showSearch allowClear
            value={accountFilter || undefined}
            onChange={v => setAccountFilter(v || '')}
            options={accountOptions} />
          {/* D10-05：登录结果多选 */}
          <Select placeholder="登录结果" style={{ width: 160 }} mode="multiple"
            value={resultFilter} onChange={setResultFilter}
            options={[{ label: '成功', value: 'success' }, { label: '失败', value: 'failed' }]} />
          <Input prefix={<IconSearch />} placeholder="IP 地址" style={{ width: 200 }} value={keyword} onChange={setKeyword} allowClear />
        </Space>
      </Card>
      <Card bodyStyle={{ padding: 0 }} title="登录日志（保留180天，只读）">
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 1000 }}
          pagination={{ pageSize: 15, showTotal: true }} stripe
          noDataElement={<Empty description="暂无符合条件的登录记录" />} />
      </Card>
    </div>
  );
}

// ===== 操作日志 — D10-06/07 =====
export function OperationLogsPage() {
  const [logs] = useState(operationLogs);
  const [modFilter, setModFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [accountFilter, setAccountFilter] = useState<string>('');
  const [keyword, setKeyword] = useState('');
  const [dateRange, setDateRange] = useState<[string, string]>(getDefault30DaysRange());

  // D10-07：操作日志账号下拉
  const accountOptions = useMemo(() => {
    return [...new Set(logs.map(l => l.operator))]
      .map(op => ({ label: op, value: op }));
  }, [logs]);

  const filtered = useMemo(() => {
    let r = logs;
    if (modFilter.length) r = r.filter(l => modFilter.includes(l.module));
    if (typeFilter.length) r = r.filter(l => typeFilter.includes(l.type));
    if (accountFilter) r = r.filter(l => l.operator === accountFilter);
    if (keyword) r = r.filter(l => l.target.includes(keyword) || l.detail.includes(keyword));
    if (dateRange.length === 2) {
      const [s, e] = dateRange;
      r = r.filter(l => {
        const d = l.time.split(' ')[0];
        return d >= s && d <= e;
      });
    }
    return r;
  }, [logs, modFilter, typeFilter, accountFilter, keyword, dateRange]);

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
          <DatePicker.RangePicker style={{ width: 260 }}
            value={dateRange}
            onChange={(_, ds) => setDateRange(ds[0] && ds[1] ? [ds[0], ds[1]] : getDefault30DaysRange())}
            placeholder={['开始时间', '结束时间']} />
          {/* D10-07：账号下拉 */}
          <Select placeholder="账号" style={{ width: 180 }} showSearch allowClear
            value={accountFilter || undefined}
            onChange={v => setAccountFilter(v || '')}
            options={accountOptions} />
          <Select placeholder="操作模块" style={{ width: 200 }} mode="multiple" value={modFilter} onChange={setModFilter}
            options={moduleMap.map(m => ({ label: m, value: m }))} />
          <Select placeholder="操作类型" style={{ width: 200 }} mode="multiple" value={typeFilter} onChange={setTypeFilter}
            options={typeMap.map(t => ({ label: t, value: t }))} />
          <Input prefix={<IconSearch />} placeholder="操作对象" style={{ width: 180 }} value={keyword} onChange={setKeyword} allowClear />
        </Space>
      </Card>
      <Card bodyStyle={{ padding: 0 }} title="操作日志（保留180天，只读）">
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 1300 }}
          pagination={{ pageSize: 15, showTotal: true }} stripe
          noDataElement={<Empty description="暂无符合条件的操作记录" />} />
      </Card>
    </div>
  );
}

// ===== 在线用户 — D10-08：超管不可强制下线自己 =====
export function OnlineUsersPage() {
  const [users, setUsers] = useState<OnlineUser[]>(onlineUsers);

  const handleForceLogout = (r: OnlineUser) => {
    // D10-08：超管不可强制下线自己当前会话
    if (r.username === currentUser.account) {
      Message.warning('不可强制下线自己的当前会话');
      return;
    }
    Modal.confirm({
      title: `强制下线 — ${r.username}`,
      content: `确认强制下线账号 ${r.username}（${r.name}）？该账号当前未保存的工作将丢失。`,
      onOk: () => {
        setUsers(prev => prev.filter(u => u.id !== r.id));
        Message.success('账号已强制下线');
      },
    });
  };

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
          disabled={r.username === currentUser.account}
          onClick={() => handleForceLogout(r)}>
          {r.username === currentUser.account ? '当前会话' : '强制下线'}
        </Button>
      ),
    },
  ];

  return (
    <Card bodyStyle={{ padding: 0 }} title="当前在线用户">
      <Table columns={columns} data={users} rowKey="id" scroll={{ x: 1100 }} pagination={false} stripe
        noDataElement={<Empty description="暂无在线用户" />} />
    </Card>
  );
}

// D10-11：CityManagementPage 已迁移至 §8 运营配置 ConfigPage。此处保留导出占位以兼容路由，但不再渲染
export function CityManagementPage() {
  return (
    <Card>
      <Empty description={<>城市管理已迁移至 <a href="/config?tab=areas">运营配置 → 运营区域</a></>} />
    </Card>
  );
}

// ===== 路由布局 =====
export default function SystemPage() {
  return <Outlet />;
}
