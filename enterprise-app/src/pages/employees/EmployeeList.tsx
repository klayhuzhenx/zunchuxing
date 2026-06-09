import { useState } from 'react';
import { Card, Table, Button, Tag, Modal, Form, Input, Select, Message, Space, Typography, Popconfirm, Upload } from '@arco-design/web-react';
import { IconPlus, IconImport, IconEdit } from '@arco-design/web-react/icon';
import { mockEmployees, currentUser } from '../../data/mock';
import type { Employee, EmployeeRole } from '../../types';

const { Title } = Typography;

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

  const filtered = employees.filter(e => {
    if (filterRole && e.role !== filterRole) return false;
    if (filterStatus.length && !filterStatus.includes(e.status)) return false;
    return true;
  });

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
    // Check duplicate phone (exclude current employee)
    const dup = employees.find(e => e.phone === values.phone && e.id !== editingEmp.id);
    if (dup) { Message.error('该手机号已被其他员工使用'); return; }
    setEmployees(employees.map(e => e.id === editingEmp.id ? {
      ...e, name: values.name, phone: values.phone,
      role: values.role, roleLabel: roleOptions.find(r => r.value === values.role)?.label || '员工',
    } : e));
    setEditVisible(false);
    setEditingEmp(null);
    Message.success('员工信息已更新');
  };

  const handleResign = (emp: Employee) => {
    setEmployees(employees.map(e => e.id === emp.id ? { ...e, status: 'resigned' as const } : e));
    Message.success('已标记为离职');
  };

  const handleDelete = (emp: Employee) => {
    setEmployees(employees.filter(e => e.id !== emp.id));
    Message.success('员工已删除');
  };

  const columns = [
    { title: '姓名', dataIndex: 'name', width: 90, render: (v: string) => v || <span style={{ color: '#c9cdd4' }}>—</span> },
    { title: '手机号', dataIndex: 'phone', width: 130 },
    { title: '角色', dataIndex: 'role', width: 100, render: (v: EmployeeRole) => <Tag color={roleTagColors[v]} size="small">{roleOptions.find(r => r.value === v)?.label}</Tag> },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={statusTagColors[v]} size="small">{statusLabels[v]}</Tag> },
    { title: '加入时间', dataIndex: 'joinedAt', width: 100 },
    { title: '操作', width: 180, render: (_: unknown, r: Employee) => (
      <Space size="small">
        <Button type="text" size="small" icon={<IconEdit />} onClick={() => { setEditingEmp(r); setEditVisible(true); }}>编辑</Button>
        {r.status === 'active' && (
          <Popconfirm title={`确认将 ${r.name || r.phone} 标记为离职？`} onOk={() => handleResign(r)}>
            <Button type="text" size="small">标记离职</Button>
          </Popconfirm>
        )}
        <Popconfirm title={`确认删除员工 ${r.name || r.phone}？`} onOk={() => handleDelete(r)}>
          <Button type="text" size="small" status="danger">删除</Button>
        </Popconfirm>
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
        <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
          <Select placeholder="角色" allowClear value={filterRole || undefined} onChange={(v) => setFilterRole(v || '')} options={roleOptions} style={{ width: 140 }} />
          <Select placeholder="状态" mode="multiple" value={filterStatus} onChange={setFilterStatus} options={[{ label: '在职', value: 'active' }, { label: '已离职', value: 'resigned' }]} style={{ width: 200 }} />
        </div>
        <Table columns={columns} data={filtered} rowKey="id" pagination={false} />
      </Card>

      {/* 添加员工弹窗 */}
      <Modal title="添加员工" visible={addVisible} onCancel={() => setAddVisible(false)} style={{ width: 440 }} footer={null}>
        <Form onSubmit={handleAdd} layout="vertical">
          <Form.Item field="name" label="姓名">
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item field="phone" label="手机号" rules={[{ required: true, match: /^1\d{10}$/, message: '请输入正确的手机号' }]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item field="role" label="角色" rules={[{ required: true }]} initialValue="employee">
            <Select options={roleOptions} />
          </Form.Item>
          <Button type="primary" htmlType="submit" long style={{ background: '#000', borderColor: '#000', marginTop: 8 }}>确认添加</Button>
        </Form>
      </Modal>

      {/* 编辑员工弹窗 */}
      <Modal title="编辑员工" visible={editVisible} onCancel={() => { setEditVisible(false); setEditingEmp(null); }} style={{ width: 440 }} footer={null}>
        {editingEmp && (
          <Form onSubmit={handleEdit} layout="vertical" initialValues={{ name: editingEmp.name, phone: editingEmp.phone, role: editingEmp.role }}>
            <Form.Item field="name" label="姓名">
              <Input placeholder="请输入姓名" />
            </Form.Item>
            <Form.Item field="phone" label="手机号" rules={[{ required: true, match: /^1\d{10}$/, message: '请输入正确的手机号' }]}>
              <Input placeholder="请输入手机号" />
            </Form.Item>
            <Form.Item field="role" label="角色" rules={[{ required: true }]}>
              <Select options={roleOptions} />
            </Form.Item>
            <Button type="primary" htmlType="submit" long style={{ background: '#000', borderColor: '#000', marginTop: 8 }}>保存</Button>
          </Form>
        )}
      </Modal>

      {/* 批量导入弹窗 */}
      <Modal title="批量导入员工" visible={importVisible} onCancel={() => setImportVisible(false)} style={{ width: 500 }} footer={null}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button onClick={() => Message.success('模板下载中...')}>下载模板</Button>
          <Upload action="#" autoUpload={false} showUploadList={false}>
            <Button type="outline" long>选择 Excel 文件上传</Button>
          </Upload>
          <Button type="primary" long style={{ background: '#000', borderColor: '#000', marginTop: 16 }}
            onClick={() => { setImportVisible(false); Message.success('导入成功，共 3 人'); }}>开始导入</Button>
        </Space>
      </Modal>
    </div>
  );
}
