import { useState, useMemo } from 'react';
import { Card, Table, Tag, Typography, Button, Drawer, Descriptions, Message, Space, DatePicker, Modal, Form, Input, Select, Tabs, Popconfirm, Timeline } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { mockInvoices, mockOrders } from '../../data/mock';
import type { Invoice } from '../../types';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const statusMap: Record<string, { label: string; color: string }> = {
  issuing: { label: '开票中', color: 'arcoblue' },
  issued: { label: '已开票', color: 'green' },
  rejected: { label: '已驳回', color: 'red' },
  cancelled: { label: '已取消', color: 'gray' },
};
const typeMap: Record<string, string> = { '普通发票': '普通发票', '专用发票': '专用发票' };

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Invoice | null>(null);
  const [cancelForm] = Form.useForm();

  const filtered = useMemo(() => {
    let r = invoices;
    if (activeTab !== 'all') r = r.filter(i => i.status === activeTab);
    if (dateRange) {
      const [s, e] = dateRange;
      r = r.filter(i => { const d = i.appliedAt.split(' ')[0]; return d >= s && d <= e; });
    }
    return r;
  }, [invoices, activeTab, dateRange]);

  const detail = invoices.find(i => i.id === detailId);

  // ===== 申请发票 =====
  const [applyVisible, setApplyVisible] = useState(false);
  const [applyStep, setApplyStep] = useState<'select' | 'fill'>('select');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [invoiceType, setInvoiceType] = useState<'general' | 'special'>('general');
  const [invForm, setInvForm] = useState({ company: '', taxId: '', address: '', phone: '', bank: '', account: '', remark: '' });

  const availableOrders = useMemo(() => {
    const locked = new Set<string>();
    invoices.filter(i => i.status !== 'cancelled').forEach(i => i.relatedOrders.split(', ').forEach(o => locked.add(o)));
    return mockOrders.filter(o => (o.status === 'completed' || o.status === 'pending_extra') && !locked.has(o.orderNo));
  }, []);

  const selTotal = useMemo(() =>
    availableOrders.filter(o => selectedOrderIds.includes(o.id)).reduce((s, o) => s + o.paidAmount, 0),
  [selectedOrderIds, availableOrders]);

  const handleApply = () => {
    setApplyVisible(true);
    setApplyStep('select');
    setSelectedOrderIds([]);
    setInvoiceType('general');
    setInvForm({ company: '', taxId: '', address: '', phone: '', bank: '', account: '', remark: '' });
  };

  const handleSubmit = () => {
    if (!invForm.company.trim()) { Message.warning('请输入企业名称'); return; }
    if (!invForm.taxId.trim()) { Message.warning('请输入税号'); return; }
    if (invoiceType === 'special') {
      if (!invForm.address.trim()) { Message.warning('请输入企业地址'); return; }
      if (!invForm.phone.trim()) { Message.warning('请输入企业电话'); return; }
      if (!invForm.bank.trim()) { Message.warning('请输入开户银行'); return; }
      if (!invForm.account.trim()) { Message.warning('请输入银行账号'); return; }
    }
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newInv: Invoice = {
      id: `inv-new-${Date.now()}`,
      applyNo: `FP${now.slice(0, 10).replace(/-/g, '')}-${String(invoices.length + 1).padStart(4, '0')}`,
      type: invoiceType === 'special' ? '专用发票' : '普通发票',
      relatedOrders: selectedOrderIds.map(id => availableOrders.find(o => o.id === id)!.orderNo).join(', '),
      amount: selTotal,
      applicant: '张先生',
      appliedAt: now,
      status: 'issuing',
      title: invForm.company,
      companyName: invForm.company,
      taxId: invForm.taxId,
      address: invForm.address, bankName: invForm.bank, bankAccount: invForm.account, companyPhone: invForm.phone,
      remark: invForm.remark,
      operationLogs: [{ time: now, action: '提交开票申请', operator: '张先生', remark: `关联 ${selectedOrderIds.length} 笔订单` }],
      ...(invoiceType === 'special' ? { address: invForm.address, bankName: invForm.bank, bankAccount: invForm.account, companyPhone: invForm.phone } : {}),
    };
    setInvoices([newInv, ...invoices]);
    setApplyVisible(false);
    Message.success('开票申请已提交');
  };

  // 取消申请（仅开票中）
  const handleCancelApply = (inv: Invoice) => { setCancelTarget(inv); cancelForm.resetFields(); setCancelVisible(true); };
  const handleCancelSubmit = async () => {
    try {
      const v = await cancelForm.validate();
      if (!cancelTarget) return;
      const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
      setInvoices(invoices.map(i => i.id === cancelTarget.id ? {
        ...i, status: 'cancelled' as const, rejectReason: v.reason,
        operationLogs: [...(i.operationLogs || []), { time: now, action: '取消申请', operator: '张先生', remark: v.reason }],
      } : i));
      setCancelVisible(false); setCancelTarget(null);
      Message.success('已取消，关联订单已释放');
    } catch { /* */ }
  };

  // 重新申请（已驳回）
  const handleReapply = (r: Invoice) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newInv: Invoice = {
      ...r, id: `inv-re-${Date.now()}`, applyNo: `FP${now.slice(0, 10).replace(/-/g, '')}-${String(invoices.length + 1).padStart(4, '0')}`,
      status: 'issuing', appliedAt: now, rejectReason: undefined, rejectedAt: undefined,
      operationLogs: [...(r.operationLogs || []), { time: now, action: '重新提交申请', operator: '张先生' }],
    };
    setInvoices([newInv, ...invoices]);
    Message.success('已重新提交申请');
  };

  const columns = [
    { title: '申请编号', dataIndex: 'applyNo', width: 170, render: (v: string, r: Invoice) => <a onClick={() => setDetailId(r.id)}>{v}</a> },
    { title: '发票抬头', dataIndex: 'title', width: 180, ellipsis: true },
    { title: '类型', width: 90, render: (_: unknown, r: Invoice) => <Tag size="small">{r.type}</Tag> },
    { title: '开票金额', width: 110, render: (_: unknown, r: Invoice) => `¥${r.amount.toLocaleString()}` },
    { title: '申请人', dataIndex: 'applicant', width: 90 },
    { title: '申请时间', dataIndex: 'appliedAt', width: 140 },
    { title: '状态', width: 90, render: (_: unknown, r: Invoice) => <Tag color={statusMap[r.status]?.color} size="small">{statusMap[r.status]?.label}</Tag> },
    { title: '操作', width: 180, render: (_: unknown, r: Invoice) => (
      <Space size={4}>
        <Button type="text" size="small" onClick={() => setDetailId(r.id)}>详情</Button>
        {r.status === 'issuing' && (
          <Popconfirm title="取消后关联订单将释放可重新申请，是否继续？" onOk={() => handleCancelApply(r)}>
            <Button type="text" size="small" status="danger">取消</Button>
          </Popconfirm>
        )}
        {r.status === 'rejected' && <Button type="text" size="small" onClick={() => handleReapply(r)}>重新申请</Button>}
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title heading={5} style={{ margin: 0 }}>发票管理</Title>
        <Button type="primary" icon={<IconPlus />} onClick={handleApply} style={{ background: '#000', borderColor: '#000' }}>申请发票</Button>
      </div>

      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <RangePicker style={{ width: 260 }} placeholder={['申请时间起', '申请时间止']}
            onChange={(_, ds) => setDateRange(ds && ds[0] && ds[1] ? ds as [string, string] : null)} />
          <div style={{ flex: 1 }} />
        </Space>
      </Card>

      <Tabs activeTab={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }}>
        <Tabs.TabPane key="all" title="全部" />
        <Tabs.TabPane key="issuing" title="开票中" />
        <Tabs.TabPane key="issued" title="已开票" />
        <Tabs.TabPane key="rejected" title="已驳回" />
        <Tabs.TabPane key="cancelled" title="已取消" />
      </Tabs>

      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 1100 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>

      {/* 详情抽屉（与运营端一致，去掉申请企业/开票主体/申请渠道） */}
      <Drawer width="60%" title={`发票详情 - ${detail?.applyNo || ''}`}
        visible={!!detailId} onCancel={() => setDetailId(null)} footer={null}>
        {detail && (
          <div>
            {/* 基本信息 */}
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small" data={[
                { label: '申请编号', value: detail.applyNo },
                { label: '申请人', value: detail.applicant },
                { label: '申请时间', value: detail.appliedAt },
                { label: '开票状态', value: <Tag color={statusMap[detail.status]?.color} size="small">{statusMap[detail.status]?.label}</Tag> },
              ]} />
            </Card>

            {/* 开票信息 */}
            <Card title="开票信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small" data={[
                { label: '开票类型', value: detail.type || '—' },
                { label: '发票抬头', value: detail.title },
                { label: '纳税人识别号', value: detail.taxId || '—' },
                { label: '地址', value: detail.address || '—' },
                { label: '开户行', value: detail.bankName || '—' },
                { label: '银行账户', value: detail.bankAccount || '—' },
                { label: '企业电话', value: detail.companyPhone || '—' },
                { label: '接收邮箱', value: detail.email || '—' },
                { label: '备注', value: detail.remark || '—' },
                { label: '开票金额', value: `¥${detail.amount.toLocaleString()}` },
              ]} />
            </Card>

            {/* 关联订单 */}
            <Card title="关联订单" size="small" style={{ marginBottom: 16 }}>
              <Table columns={[
                { title: '订单号', dataIndex: 'orderNo', width: 170 },
                { title: '订单类型', width: 90, render: (_: unknown, o: { type: string }) => <Tag color={o.type === 'charter' ? 'arcoblue' : 'purple'} size="small">{o.type === 'charter' ? '包车' : '租车'}</Tag> },
                { title: '完成时间', width: 110, render: (_: unknown, o: { endTime?: string; rentalEnd?: string; createdAt: string }) => o.rentalEnd || o.endTime?.split(' ')[0] || o.createdAt.split(' ')[0] },
                { title: '订单金额', width: 110, render: (_: unknown, o: { paidAmount: number }) => `¥${o.paidAmount.toLocaleString()}` },
                { title: '支付方式', width: 120, render: (_: unknown, o: { paymentMethod?: string }) => o.paymentMethod === 'enterprise_credit' ? '企业额度支付' : o.paymentMethod === 'alipay' ? '支付宝' : o.paymentMethod === 'wechat' ? '微信' : '—' },
              ]} data={(() => {
                const nos = detail.relatedOrders.split(', ').map(s => s.trim());
                return nos.map(no => mockOrders.find(o => o.orderNo === no) || { id: no, orderNo: no, type: 'charter' as const, createdAt: '', paidAmount: 0 }).map((o, i) => ({ ...o, _key: i }));
              })()} rowKey="_key" pagination={false} size="small" />
            </Card>

            {/* 发票附件（仅已开票） */}
            {detail.status === 'issued' && detail.attachment && (
              <Card title="发票附件" size="small" style={{ marginBottom: 16 }}>
                <Descriptions column={2} size="small" data={[
                  { label: '开具时间', value: detail.issuedAt || '—' },
                ]} />
                <div style={{ marginTop: 12, padding: '12px 16px', background: '#F7F8FA', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{detail.attachment?.match(/\.pdf$/i) ? '📄' : '🖼️'}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{detail.type}发票{detail.attachment?.match(/\.pdf$/i) ? '.pdf' : ''}</span>
                </div>
              </Card>
            )}

            {/* 订单动态 */}
            {detail.operationLogs && (
              <Card title="订单动态" size="small">
                <Timeline reverse>
                  {detail.operationLogs.map((l, i) => (
                    <Timeline.Item key={i} label={l.time} dotColor={l.action.includes('驳回') ? '#F53F3F' : undefined}>
                      <span style={{ color: l.action.includes('驳回') ? '#F53F3F' : undefined }}>{l.operator} {l.action}{l.remark ? ` — ${l.remark}` : ''}</span>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            )}
          </div>
        )}
      </Drawer>

      {/* 申请发票 — 两步弹窗 */}
      <Modal title={applyStep === 'select' ? '申请发票 — 选择订单' : '申请发票 — 填写信息'}
        visible={applyVisible} onCancel={() => setApplyVisible(false)} style={{ width: 560 }}
        footer={applyStep === 'select' ? (
          <><Button onClick={() => setApplyVisible(false)}>取消</Button>
          <Button type="primary" disabled={selectedOrderIds.length === 0} onClick={() => setApplyStep('fill')} style={{ marginLeft: 12, background: '#000', borderColor: '#000' }}>下一步</Button></>
        ) : (
          <><Button onClick={() => setApplyStep('select')}>上一步</Button>
          <Button type="primary" onClick={handleSubmit} style={{ marginLeft: 12, background: '#000', borderColor: '#000' }}>提交申请</Button></>
        )}>
        {applyStep === 'select' ? (
          <div>
            <div style={{ marginBottom: 12, fontSize: 13, color: '#86909c' }}>选择需要开票的已完成订单（未被锁定）</div>
            <div style={{ maxHeight: 360, overflow: 'auto' }}>
              {availableOrders.map(o => (
                <div key={o.id} onClick={() => setSelectedOrderIds(prev => prev.includes(o.id) ? prev.filter(x => x !== o.id) : [...prev, o.id])}
                  style={{ padding: '12px 16px', marginBottom: 8, borderRadius: 8, border: selectedOrderIds.includes(o.id) ? '2px solid #000' : '1px solid #F2F2F2', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{o.orderNo} · <Tag size="small" color={o.type === 'charter' ? 'arcoblue' : 'purple'}>{o.type === 'charter' ? '包车' : '租车'}</Tag></div>
                    <div style={{ fontSize: 12, color: '#86909c', marginTop: 2 }}>{o.passengerName} · {o.type === 'charter' ? o.startTime?.split(' ')[0] : o.rentalStart}</div>
                  </div>
                  <span style={{ fontWeight: 600 }}>¥{o.paidAmount.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #F2F2F2', paddingTop: 12, marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#86909c' }}>已选 {selectedOrderIds.length} 笔</span>
              <strong>¥{selTotal.toLocaleString()}</strong>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>已选 {selectedOrderIds.length} 笔 · 合计 ¥{selTotal.toLocaleString()}</div>
            <Form layout="vertical">
              <Form.Item label="发票类型" required>
                <Select value={invoiceType} onChange={v => setInvoiceType(v as 'general' | 'special')}
                  options={[{ label: '普通发票', value: 'general' }, { label: '专用发票', value: 'special' }]} />
              </Form.Item>
              <Form.Item label="发票抬头" required><Input placeholder="企业全称" value={invForm.company} onChange={v => setInvForm(p => ({ ...p, company: v }))} /></Form.Item>
              <Form.Item label="纳税人识别号" required><Input placeholder="15-18位" maxLength={18} value={invForm.taxId} onChange={v => setInvForm(p => ({ ...p, taxId: v }))} /></Form.Item>
              {invoiceType === 'special' && (
                <>
                  <Form.Item label="企业地址" required><Input value={invForm.address} onChange={v => setInvForm(p => ({ ...p, address: v }))} /></Form.Item>
                  <Form.Item label="企业电话" required><Input value={invForm.phone} onChange={v => setInvForm(p => ({ ...p, phone: v }))} /></Form.Item>
                  <Form.Item label="开户银行" required><Input value={invForm.bank} onChange={v => setInvForm(p => ({ ...p, bank: v }))} /></Form.Item>
                  <Form.Item label="银行账号" required><Input value={invForm.account} onChange={v => setInvForm(p => ({ ...p, account: v }))} /></Form.Item>
                </>
              )}
              <Form.Item label="备注"><Input.TextArea value={invForm.remark} onChange={v => setInvForm(p => ({ ...p, remark: v }))} maxLength={200} showWordLimit rows={2} /></Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* 取消弹窗 */}
      <Modal title="取消开票申请" visible={cancelVisible} onOk={handleCancelSubmit}
        onCancel={() => { setCancelVisible(false); setCancelTarget(null); }} okText="确认取消" okButtonProps={{ status: 'danger' }}>
        <p style={{ marginBottom: 16 }}>确定取消发票 <strong>{cancelTarget?.applyNo}</strong> 吗？取消后关联订单将释放。</p>
        <Form form={cancelForm} layout="vertical">
          <Form.Item label="取消原因" field="reason" rules={[{ required: true, message: '请填写原因' }]}>
            <Input.TextArea placeholder="取消原因" maxLength={200} showWordLimit rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
