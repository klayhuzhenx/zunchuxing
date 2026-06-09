import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card, Table, Tag, Button, Input, Select, Space, Modal,
  Form, Message, Popconfirm, InputNumber,
} from '@arco-design/web-react';
import { IconSearch, IconPlus, IconDownload } from '@arco-design/web-react/icon';
import { enterprises, quotaChanges } from '../../data/mock';
import type { Enterprise, EnterpriseStatus } from '../../types';

const statusMap: Record<EnterpriseStatus, { label: string; color: string }> = {
  pending: { label: '待审核', color: 'orangered' },
  approved: { label: '已通过', color: 'green' },
  rejected: { label: '已驳回', color: 'gray' },
  disabled: { label: '已禁用', color: 'red' },
};

export default function EnterpriseList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<Enterprise[]>(enterprises);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>(
    searchParams.get('status') ? [searchParams.get('status')!] : []
  );
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [quotaOp, setQuotaOp] = useState<string>('');
  const [quotaVal, setQuotaVal] = useState<number | undefined>();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise | null>(null);
  const [addForm] = Form.useForm();
  const [quotaForm] = Form.useForm();

  const filtered = useMemo(() => {
    let result = data;
    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(kw) ||
        e.creditCode.includes(kw) ||
        e.contactPhone.includes(kw)
      );
    }
    if (statusFilter.length > 0) result = result.filter(e => statusFilter.includes(e.status));
    if (sourceFilter.length > 0) result = result.filter(e => sourceFilter.includes(e.source));
    // 剩余额度筛选
    if (quotaOp && quotaVal !== undefined && quotaVal !== null) {
      result = result.filter(e => {
        if (quotaOp === 'lt') return e.remainingQuota < quotaVal;
        if (quotaOp === 'gt') return e.remainingQuota > quotaVal;
        if (quotaOp === 'eq') return e.remainingQuota === quotaVal;
        return true;
      });
    }
    if (searchParams.get('quota') === 'low') {
      result = result.filter(e => e.remainingQuota < 2000 && e.status === 'approved');
    }
    return result;
  }, [data, keyword, statusFilter, sourceFilter, quotaOp, quotaVal, searchParams]);

  const handleAdd = async () => {
    try {
      const values = await addForm.validate();
      const newEnterprise: Enterprise = {
        id: `E${String(data.length + 1).padStart(3, '0')}`,
        code: `ENT2026${String(data.length + 1).padStart(4, '0')}`,
        name: values.name,
        creditCode: values.creditCode || '',
        contactName: values.contactName,
        contactPhone: values.contactPhone,
        employeeCount: 0,
        totalQuota: 0,
        usedAmount: 0,
        remainingQuota: 0,
        status: 'approved',
        source: 'backend',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        adminName: values.contactName,
        adminPhone: values.contactPhone,
        remark: values.remark,
      };
      setData([newEnterprise, ...data]);
      setShowAddModal(false);
      addForm.resetFields();
      Message.success('企业创建成功');
    } catch { /* */ }
  };

  const handleQuota = async () => {
    try {
      const values = await quotaForm.validate();
      if (!selectedEnterprise) return;
      const amount = Number(values.amount);
      const updated = { ...selectedEnterprise };
      if (values.type === 'increase') {
        updated.totalQuota += amount;
        updated.remainingQuota += amount;
      } else {
        if (amount > updated.remainingQuota) {
          Message.error('调减金额不可超过剩余额度');
          return;
        }
        updated.totalQuota -= amount;
        updated.remainingQuota -= amount;
      }
      setData(data.map(e => e.id === updated.id ? updated : e));
      quotaChanges.push({
        id: `Q${String(quotaChanges.length + 1).padStart(3, '0')}`,
        enterpriseId: updated.id,
        type: values.type,
        amount,
        reason: values.reason,
        operator: '张管理',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });
      setShowQuotaModal(false);
      quotaForm.resetFields();
      Message.success('额度调整成功');
    } catch { /* */ }
  };

  const handleDisable = (record: Enterprise) => {
    setData(data.map(e => e.id === record.id ? { ...e, status: 'disabled' as EnterpriseStatus } : e));
    Message.success(`企业「${record.name}」已禁用`);
  };

  const handleEnable = (record: Enterprise) => {
    setData(data.map(e => e.id === record.id ? { ...e, status: 'approved' as EnterpriseStatus } : e));
    Message.success(`企业「${record.name}」已启用`);
  };

  const sourceLabels: Record<string, string> = { miniapp: '小程序申请', backend: '后台添加' };

  const columns = [
    { title: '企业名称', dataIndex: 'name', width: 200, render: (_: string, r: Enterprise) => (
      <a onClick={() => navigate(`/enterprise/${r.id}`)}>{r.name}</a>
    )},
    { title: '企业编号', dataIndex: 'code', width: 130 },
    { title: '联系人', width: 120, render: (_: unknown, r: Enterprise) => `${r.contactName} ${r.contactPhone}` },
    { title: '员工数', dataIndex: 'employeeCount', width: 70 },
    { title: '总额度', width: 100, render: (_: unknown, r: Enterprise) => `¥${r.totalQuota.toLocaleString()}` },
    { title: '已使用', width: 100, render: (_: unknown, r: Enterprise) => `¥${r.usedAmount.toLocaleString()}` },
    {
      title: '剩余额度', width: 100,
      render: (_: unknown, r: Enterprise) => (
        <span style={{ color: r.remainingQuota < 2000 && r.status === 'approved' ? '#F53F3F' : undefined, fontWeight: 500 }}>
          ¥{r.remainingQuota.toLocaleString()}
        </span>
      ),
    },
    { title: '状态', width: 80, render: (_: unknown, r: Enterprise) => (
      <Tag color={statusMap[r.status].color} size="small">{statusMap[r.status].label}</Tag>
    )},
    { title: '来源', width: 90, render: (_: unknown, r: Enterprise) => sourceLabels[r.source] || r.source },
    { title: '注册时间', dataIndex: 'createdAt', width: 140 },
    {
      title: '操作', width: 220, fixed: 'right' as const,
      render: (_: unknown, record: Enterprise) => (
        <Space size={4}>
          <Button type="text" size="small" onClick={() => navigate(`/enterprise/${record.id}`)}>详情</Button>
          {record.status === 'pending' && (
            <Button type="text" size="small" status="success" onClick={() => {
              setData(data.map(e => e.id === record.id ? { ...e, status: 'approved' as EnterpriseStatus } : e));
              Message.success('审核通过');
            }}>通过</Button>
          )}
          {record.status === 'approved' && (
            <>
              <Button type="text" size="small" onClick={() => { setSelectedEnterprise(record); setShowQuotaModal(true); }}>调整额度</Button>
              <Popconfirm title={`确定禁用「${record.name}」吗？`} onOk={() => handleDisable(record)}>
                <Button type="text" size="small" status="danger">禁用</Button>
              </Popconfirm>
            </>
          )}
          {record.status === 'disabled' && (
            <Button type="text" size="small" status="success" onClick={() => handleEnable(record)}>启用</Button>
          )}
          {record.status === 'rejected' && (
            <Button type="text" size="small" onClick={() => {
              setData(data.map(e => e.id === record.id ? { ...e, status: 'pending' as EnterpriseStatus } : e));
              Message.success('已重新进入审核');
            }}>重新审核</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '16px 24px' }} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Space size={12} wrap>
            <Input prefix={<IconSearch />} placeholder="企业名称/信用代码/手机号" style={{ width: 240 }}
              value={keyword} onChange={setKeyword} allowClear />
            <Select placeholder="企业状态" style={{ width: 160 }} mode="multiple"
              value={statusFilter} onChange={setStatusFilter}
              options={Object.entries(statusMap).map(([k, v]) => ({ label: v.label, value: k }))} />
            <Select placeholder="创建来源" style={{ width: 140 }} mode="multiple"
              value={sourceFilter} onChange={setSourceFilter}
              options={[{ label: '小程序申请', value: 'miniapp' }, { label: '后台添加', value: 'backend' }]} />
            {/* 剩余额度筛选 */}
            <Space size={4}>
              <Select placeholder="额度" style={{ width: 80 }}
                value={quotaOp} onChange={setQuotaOp} allowClear
                options={[
                  { label: '小于', value: 'lt' },
                  { label: '大于', value: 'gt' },
                  { label: '等于', value: 'eq' },
                ]} />
              <InputNumber placeholder="金额" style={{ width: 120 }} min={0}
                value={quotaVal} onChange={v => setQuotaVal(v ?? undefined)} />
            </Space>
          </Space>
          <Space>
            <Button icon={<IconDownload />}>批量导出</Button>
            <Button type="primary" icon={<IconPlus />} onClick={() => setShowAddModal(true)}>新增企业</Button>
          </Space>
        </div>
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          data={filtered}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 10, showTotal: true }}
          stripe
        />
      </Card>

      {/* 新增企业弹窗 */}
      <Modal
        title="新增企业"
        visible={showAddModal}
        onOk={handleAdd}
        onCancel={() => { setShowAddModal(false); addForm.resetFields(); }}
        style={{ width: 520 }}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item field="name" label="企业名称" rules={[{ required: true, message: '请输入企业名称' }, { maxLength: 50 }]}>
            <Input placeholder="与营业执照一致" />
          </Form.Item>
          <Form.Item field="creditCode" label="统一社会信用代码"
            rules={[{ match: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/, message: '格式不正确' }]}>
            <Input placeholder="18位统一社会信用代码（选填）" maxLength={18} />
          </Form.Item>
          <Form.Item field="contactName" label="联系人姓名" rules={[{ required: true, message: '请输入联系人' }]}>
            <Input placeholder="联系人姓名" maxLength={20} />
          </Form.Item>
          <Form.Item field="contactPhone" label="联系人手机号" rules={[
            { required: true, message: '请输入手机号' },
            { match: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
          ]}>
            <Input placeholder="11位手机号" maxLength={11} />
          </Form.Item>
          <Form.Item field="adminPassword" label="初始密码" rules={[
            { required: true, message: '请输入初始密码' },
            { minLength: 6, message: '至少6位字母+数字' },
          ]}>
            <Input.Password placeholder="企业管理员登录企业端后台的初始密码" />
          </Form.Item>
          <Form.Item field="remark" label="备注">
            <Input.TextArea placeholder="记录新增原因" maxLength={200} showWordLimit />
          </Form.Item>
        </Form>
      </Modal>

      {/* 调整额度弹窗 */}
      <Modal
        title={`调整额度 - ${selectedEnterprise?.name || ''}`}
        visible={showQuotaModal}
        onOk={handleQuota}
        onCancel={() => { setShowQuotaModal(false); quotaForm.resetFields(); }}
        style={{ width: 480 }}
      >
        <Form form={quotaForm} layout="vertical">
          <Form.Item field="type" label="调整类型" rules={[{ required: true, message: '请选择' }]}>
            <Select options={[
              { label: '调增', value: 'increase' },
              { label: '调减', value: 'decrease' },
            ]} />
          </Form.Item>
          <Form.Item field="amount" label="调整金额（元）" rules={[{ required: true, message: '请输入金额' }]}>
            <Input type="number" placeholder="正整数" />
          </Form.Item>
          <Form.Item field="reason" label="调整原因" rules={[{ required: true, message: '请输入原因' }, { maxLength: 200 }]}>
            <Input.TextArea placeholder="如：线下打款、记账纠错、赠送试用额度" maxLength={200} showWordLimit />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
