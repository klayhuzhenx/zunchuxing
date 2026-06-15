import { useState, useMemo } from 'react';
import { Card, Table, Button, Tag, Modal, Form, Input, Select, Message, Space, Typography, Popconfirm, Upload, Tooltip } from '@arco-design/web-react';
import { IconPlus, IconImport, IconEdit, IconSearch } from '@arco-design/web-react/icon';
import { mockEmployees, currentUser } from '../../data/mock';
import type { Employee, EmployeeRole } from '../../types';

const { Title } = Typography;

// E3-03：手机号正则 1[3-9] 开头
const PHONE_REGEX = /^1[3-9]\d{9}$/;

const roleOptions = [
  { label: '员工', value: 'employee' },
  { label: '财务', value: 'finance' },
  { label: '企业管理员', value: 'admin' },
];

const roleTagColors: Record<string, string> = { employee: 'blue', finance: 'purple', admin: 'gold' };
const statusTagColors: Record<string, string> = { active: 'green', resigned: 'gray' };
const statusLabels: Record<string, string> = { active: '在职', resigned: '已离职' };

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [importVisible, setImportVisible] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');

  // E3-01：企业内至少保留一名管理员
  const adminCount = useMemo(() => employees.filter(e => e.role === 'admin' && e.status === 'active').length, [employees]);

  const filtered = useMemo(() => {
    let result = employees;
    if (filterRole) result = result.filter(e => e.role === filterRole);
    if (filterStatus.length) result = result.filter(e => filterStatus.includes(e.status));
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      result = result.filter(e => e.name.toLowerCase().includes(kw) || e.phone.includes(kw));
    }
    return result;
  }, [employees, filterRole, filterStatus, keyword]);

  const handleAdd = (values: { name: string; phone: string; role: EmployeeRole }) => {
    const exists = employees.find(e => e.phone === values.phone);
    if (exists) { Message.error('该用户已在本企业员工列表中'); return; }
    const newEmp: Employee = {
      id: Date.now().toString(), name: values.name || '', phone: values.phone,
      role: values.role, roleLabel: roleOptions.find(r => r.value === values.role)?.label || '员工',
      monthlyConsumption: 0, totalConsumption: 0, status: 'active',
      joinedAt: new Date().toISOString().split('T')[0],
    };
    setEmployees([...employees, newEmp]);
    setAddVisible(false);
    Message.success('员工添加成功');
  };

  const handleEdit = (values: { name: string; phone: string; role: EmployeeRole }) => {
    if (!editingEmp) return;
    // E3-01：若把唯一管理员改为非管理员角色，阻止
    if (editingEmp.role === 'admin' && values.role !== 'admin' && adminCount <= 1) {
      Message.error('企业至少需要一名管理员');
      return;
    }
    const dup = employees.find(e => e.phone === values.phone && e.id !== editingEmp.id);
    if (dup) { Message.error('该手机号已被其他员工使用'); return; }
    setEmployees(employees.map(e => e.id === editingEmp.id ? {
      ...e, name: values.name, phone: values.phone,
      role: values.role, roleLabel: roleOptions.find(r => r.value === values.role)?.label || '员工',
    } : e));
    setEditVisible(false); setEditingEmp(null);
    Message.success('角色已更新');
  };

  // E3-01：编辑角色时若唯一管理员改角色，阻止
  const handleRoleChange = (_: unknown, record: Employee) => {
    if (record.role === 'admin' && adminCount <= 1) {
      Message.warning('企业至少需要一名管理员，无法修改该管理员角色');
      return;
    }
    setEditingEmp(record); setEditVisible(true);
  };

  const handleResign = (emp: Employee) => {
    setEmployees(employees.map(e => e.id === emp.id ? { ...e, status: 'resigned' as const } : e));
    Message.success('已标记为离职');
  };

  const handleDelete = (emp: Employee) => {
    // E3-02：不可删除自己（按 account 匹配 phone）
    if (emp.phone === currentUser.account || emp.phone === currentUser.phone) {
      Message.warning('不可删除自己的员工记录');
      return;
    }
    setEmployees(employees.filter(e => e.id !== emp.id));
    Message.success('员工已删除');
  };

  // E3-02：当前登录的账号
  const isSelf = (emp: Employee) => emp.phone === currentUser.account || emp.phone === currentUser.phone;

  const columns = [
    { title: '姓名', dataIndex: 'name', width: 90, render: (v: string) => v || <span style={{ color: '#c9cdd4' }}>—</span> },
    { title: '手机号', dataIndex: 'phone', width: 130 },
    { title: '角色', dataIndex: 'role', width: 100, render: (v: EmployeeRole) => <Tag color={roleTagColors[v]} size="small">{roleOptions.find(r => r.value === v)?.label}</Tag> },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={statusTagColors[v]} size="small">{statusLabels[v]}</Tag> },
    { title: '加入时间', dataIndex: 'joinedAt', width: 100 },
    { title: '操作', width: 200, render: (_: unknown, r: Employee) => (
      <Space size="small">
        {/* E3-04：已离职员工编辑角色置灰 */}
        <Button type="text" size="small" icon={<IconEdit />}
          disabled={r.status === 'resigned'}
          onClick={() => {
            if (r.role === 'admin' && adminCount <= 1) {
              Message.warning('企业至少需要一名管理员');
              return;
            }
            setEditingEmp(r); setEditVisible(true);
          }}>编辑</Button>
        {/* E3-04：已离职员工标记离职置灰 */}
        {r.status === 'active' && (
          <Popconfirm title={`确认将 ${r.name || r.phone} 标记为离职？`} onOk={() => handleResign(r)}>
            <Button type="text" size="small">标记离职</Button>
          </Popconfirm>
        )}
        {/* E3-02：不能删除自己 */}
        {isSelf(r) ? (
          <Tooltip content="不可删除自己"><Button type="text" size="small" status="danger" disabled>删除</Button></Tooltip>
        ) : (
          <Popconfirm title={`确认删除员工 ${r.name || r.phone}？`} onOk={() => handleDelete(r)}>
            <Button type="text" size="small" status="danger">删除</Button>
          </Popconfirm>
        )}
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title heading={5} style={{ margin: 0 }}>员工管理</Title>
        <Space>
          <Button icon={<IconImport />} onClick={() => setImportVisible(true)}>批量导入</Button>
          <Button type="primary" icon={<IconPlus />} onClick={() => setAddVisible(true)} style={{ background: '#000', borderColor: '#000' }}>添加员工</Button>
        </Space>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Select placeholder="角色" allowClear value={filterRole || undefined} onChange={(v) => setFilterRole(v || '')} options={roleOptions} style={{ width: 140 }} />
          <Select placeholder="状态" mode="multiple" value={filterStatus} onChange={setFilterStatus} options={[{ label: '在职', value: 'active' }, { label: '已离职', value: 'resigned' }]} style={{ width: 200 }} />
          <Input prefix={<IconSearch />} placeholder="搜索姓名/手机号" value={keyword} onChange={setKeyword} allowClear style={{ width: 220 }} />
        </div>
        <Table columns={columns} data={filtered} rowKey="id" pagination={false} />
      </Card>

      {/* 添加员工弹窗 — E3-03 正则 */}
      <Modal title="添加员工" visible={addVisible} onCancel={() => setAddVisible(false)} style={{ width: 440 }} footer={null}>
        <Form onSubmit={handleAdd} layout="vertical">
          <Form.Item field="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}><Input placeholder="请输入姓名" /></Form.Item>
          <Form.Item field="phone" label="手机号" rules={[
            { required: true, message: '请输入手机号' },
            { match: PHONE_REGEX, message: '请输入正确的手机号' },
          ]}>
            <Input placeholder="请输入手机号" maxLength={11} />
          </Form.Item>
          <Form.Item field="role" label="角色" rules={[{ required: true }]} initialValue="employee">
            <Select options={roleOptions} />
          </Form.Item>
          <Button type="primary" htmlType="submit" long style={{ background: '#000', borderColor: '#000', marginTop: 8 }}>确认添加</Button>
        </Form>
      </Modal>

      {/* 编辑员工弹窗 — E3-03 正则 */}
      <Modal title="编辑员工" visible={editVisible} onCancel={() => { setEditVisible(false); setEditingEmp(null); }} style={{ width: 440 }} footer={null}>
        {editingEmp && (
          <Form onSubmit={handleEdit} layout="vertical" initialValues={{ name: editingEmp.name, phone: editingEmp.phone, role: editingEmp.role }}>
            <Form.Item field="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}><Input placeholder="请输入姓名" /></Form.Item>
            <Form.Item field="phone" label="手机号" rules={[
              { required: true, message: '请输入手机号' },
              { match: PHONE_REGEX, message: '请输入正确的手机号' },
            ]}>
              <Input placeholder="请输入手机号" maxLength={11} />
            </Form.Item>
            <Form.Item field="role" label="角色" rules={[{ required: true }]}>
              <Select options={roleOptions} />
            </Form.Item>
            <Button type="primary" htmlType="submit" long style={{ background: '#000', borderColor: '#000', marginTop: 8 }}>保存</Button>
          </Form>
        )}
      </Modal>

      {/* 批量导入弹窗 — E3-05 格式校验 */}
      <Modal title="批量导入员工" visible={importVisible} onCancel={() => setImportVisible(false)} style={{ width: 500 }} footer={null}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button onClick={() => Message.success('模板下载中...')}>下载模板</Button>
          <Upload action="#" autoUpload={false} showUploadList={false}
            accept=".xlsx,.xls"
            beforeUpload={(file) => {
              const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
              if (!isExcel) { Message.error('请上传 .xlsx 格式文件'); return false; }
              // 模拟导入
              setImportVisible(false); Message.success('导入成功，共 3 人');
              return false;
            }}>
            <Button type="outline" long>选择 Excel 文件上传</Button>
          </Upload>
          <div style={{ fontSize: 12, color: '#86909c' }}>仅支持 .xlsx 格式，请按模板填写后上传</div>
        </Space>
      </Modal>
    </div>
  );
}
