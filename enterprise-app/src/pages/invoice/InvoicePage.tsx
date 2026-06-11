import { useState, useMemo } from 'react';
import { Card, Table, Tag, Typography, Select, Button, Drawer, Descriptions, Message, Space, DatePicker, Modal, Form, Input } from '@arco-design/web-react';
import { IconDownload, IconPlus, IconSend } from '@arco-design/web-react/icon';
import { mockInvoices, mockOrders } from '../../data/mock';
import type { Invoice } from '../../types';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const statusMap: Record<string, { label: string; color: string }> = {
  processing: { label: '开票中', color: 'blue' },
  issued: { label: '已开票', color: 'green' },
  cancelled: { label: '已取消', color: 'gray' },
};

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Invoice | null>(null);
  const [cancelForm] = Form.useForm();

  const filtered = invoices.filter(i => {
    if (filterStatus.length && !filterStatus.includes(i.status)) return false;
    if (dateRange) {
      const [s, e] = dateRange;
      const d = i.appliedAt.split(' ')[0];
      if (d < s || d > e) return false;
    }
    return true;
  });

  const detail = invoices.find(i => i.id === detailId);

  // ===== 申请发票 =====
  const [applyVisible, setApplyVisible] = useState(false);
  const [applyStep, setApplyStep] = useState<'select' | 'fill'>('select');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  const availableOrders = useMemo(() =>
    mockOrders.filter(o => o.status === 'completed' || o.status === 'pending_extra'),
  []);

  const selTotal = useMemo(() =>
    availableOrders.filter(o => selectedOrderIds.includes(o.id)).reduce((s, o) => s + o.paidAmount, 0),
  [selectedOrderIds, availableOrders]);

  const handleApply = () => {
    setApplyVisible(true);
    setApplyStep('select');
    setSelectedOrderIds([]);
  };

  const handleNext = () => {
    if (selectedOrderIds.length === 0) { Message.warning('请至少选择一个订单'); return; }
    setApplyStep('fill');
  };

  const [invForm, setInvForm] = useState({ company: '', taxId: '', email: '' });

  const handleSubmit = () => {
    if (!invForm.company.trim()) { Message.warning('请输入企业名称'); return; }
    if (!invForm.taxId.trim() || (invForm.taxId.length !== 15 && invForm.taxId.length !== 18)) { Message.warning('请输入正确的税号（15-18位）'); return; }
    if (!invForm.email.trim()) { Message.warning('请输入接收邮箱'); return; }
    setApplyVisible(false);
    setInvForm({ company: '', taxId: '', email: '' });
    Message.success('开票申请已提交，预计 1-2 个工作日内完成');
  };

  // ===== 取消申请 =====
  const handleCancelApply = (inv: Invoice) => {
    setCancelTarget(inv);
    cancelForm.resetFields();
    setCancelVisible(true);
  };

  const handleCancelSubmit = async () => {
    try {
      const v = await cancelForm.validate();
      if (!cancelTarget) return;
      setInvoices(invoices.map(i => i.id === cancelTarget.id
        ? { ...i, status: 'cancelled', cancelSource: '企业自主取消', cancelOperator: '张先生', cancelTime: new Date().toISOString().replace('T', ' ').slice(0, 16), cancelReason: v.reason }
        : i));
      setCancelVisible(false);
      setCancelTarget(null);
      Message.success('开票申请已取消');
    } catch { /* */ }
  };

  const columns = [
    { title: '发票编号', dataIndex: 'invoiceNo', width: 150, render: (v: string, r: Invoice) => <span style={{ color: '#165DFF', cursor: 'pointer' }} onClick={() => setDetailId(r.id)}>{v}</span> },
    { title: '类型', dataIndex: 'type', width: 80 },
    { title: '关联订单', dataIndex: 'relatedOrders', width: 280, ellipsis: true },
    { title: '金额', dataIndex: 'amount', width: 100, render: (v: number) => <span style={{ fontWeight: 500 }}>¥{v.toLocaleString()}</span> },
    { title: '申请人', dataIndex: 'applicant', width: 80 },
    { title: '申请时间', dataIndex: 'appliedAt', width: 130 },
    { title: '开具时间', dataIndex: 'issuedAt', width: 130, render: (v?: string) => v || '—' },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => {
      const s = statusMap[v] || { label: v, color: 'gray' };
      return <Tag color={s.color} size="small">{s.label}</Tag>;
    }},
    { title: '操作', width: 180, render: (_: unknown, r: Invoice) => (
      <Space size="small">
        <Button type="text" size="small" onClick={() => setDetailId(r.id)}>详情</Button>
        {r.status === 'processing' && (
          <Button type="text" size="small" status="danger" onClick={() => handleCancelApply(r)}>取消申请</Button>
        )}
        {r.status === 'issued' && (
          <>
            <Button type="text" size="small" icon={<IconDownload />} onClick={() => Message.success('PDF 已下载')}>下载</Button>
            <Button type="text" size="small" icon={<IconSend />} onClick={() => Message.success('已重新发送')}>重发</Button>
          </>
        )}
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title heading={5} style={{ margin: 0 }}>发票管理</Title>
        <Button type="primary" icon={<IconPlus />} onClick={handleApply} style={{ background: '#000', borderColor: '#000' }}>申请发票</Button>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }} size="medium">
          <Select placeholder="发票状态" mode="multiple" value={filterStatus} onChange={setFilterStatus} style={{ width: 260 }}
            options={[{ label: '开票中', value: 'processing' }, { label: '已开票', value: 'issued' }, { label: '已取消', value: 'cancelled' }]} />
          <RangePicker style={{ width: 260 }} placeholder={['申请时间起', '申请时间止']}
            onChange={(_, ds) => setDateRange(ds && ds[0] && ds[1] ? ds as [string, string] : null)} />
        </Space>
        {filtered.length > 0 ? (
          <Table columns={columns} data={filtered} rowKey="id" pagination={false} />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#86909c' }}>暂无发票记录</div>
        )}
      </Card>

      {/* 发票详情抽屉 */}
      <Drawer visible={!!detailId} onCancel={() => setDetailId(null)} footer={null} width="50%" title="发票详情">
        {detail && (
          <>
            <div style={{
              background: detail.status === 'issued' ? '#E8FFEA' : detail.status === 'cancelled' ? '#FFECE8' : '#E8F3FF',
              padding: '12px 16px', borderRadius: 4, marginBottom: 20,
              borderLeft: `3px solid ${detail.status === 'issued' ? '#00B42A' : detail.status === 'cancelled' ? '#F53F3F' : '#165DFF'}`,
            }}>
              <strong style={{ color: detail.status === 'issued' ? '#00B42A' : detail.status === 'cancelled' ? '#F53F3F' : '#165DFF' }}>{statusMap[detail.status]?.label}</strong>
              {detail.status === 'processing' && <div style={{ color: '#4E5969', fontSize: 13, marginTop: 4 }}>预计 1-2 个工作日内完成开票</div>}
            </div>

            <Card title="发票信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small" data={[
                { label: '发票编号', value: detail.invoiceNo },
                { label: '发票类型', value: detail.type },
                { label: '开票金额', value: <strong>¥{detail.amount.toLocaleString()}</strong> },
                { label: '状态', value: <Tag color={statusMap[detail.status]?.color} size="small">{statusMap[detail.status]?.label}</Tag> },
                { label: '申请时间', value: detail.appliedAt },
                { label: '开具时间', value: detail.issuedAt || '—' },
              ]} />
            </Card>

            <Card title="关联订单" size="small" style={{ marginBottom: 16 }}>
              {detail.relatedOrders.split(',').map((orderNo, i) => {
                const parts = detail.relatedOrders.split(',');
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < parts.length - 1 ? '1px solid #F2F2F2' : 'none' }}>
                    <span style={{ fontSize: 13, color: '#4E5969' }}>{orderNo.trim()}</span>
                  </div>
                );
              })}
            </Card>

            <Card title="发票抬头" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={1} size="small" data={[
                { label: '企业名称', value: detail.companyName },
                { label: '税号', value: detail.taxId },
              ]} />
            </Card>

            <Card title="接收信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={1} size="small" data={[
                { label: '接收邮箱', value: detail.email },
                { label: '申请人', value: detail.applicant },
              ]} />
            </Card>

            {/* 取消原因（已取消时） */}
            {detail.status === 'cancelled' && (
              <Card title="取消原因" size="small" style={{ marginBottom: 16 }}>
                <Descriptions column={1} size="small" data={[
                  { label: '取消来源', value: (detail as any).cancelSource || '财务驳回' },
                  { label: '操作人', value: (detail as any).cancelOperator || '—' },
                  { label: '操作时间', value: (detail as any).cancelTime || '—' },
                  { label: '原因', value: (detail as any).cancelReason || detail.rejectReason || '—' },
                ]} />
              </Card>
            )}
          </>
        )}
      </Drawer>

      {/* 申请发票 — 两步弹窗 */}
      <Modal
        title={applyStep === 'select' ? '申请发票 — 选择订单' : '申请发票 — 填写信息'}
        visible={applyVisible}
        onCancel={() => { setApplyVisible(false); setInvForm({ company: '', taxId: '', email: '' }); }}
        style={{ width: 560 }}
        footer={applyStep === 'select' ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => { setApplyVisible(false); setInvForm({ company: '', taxId: '', email: '' }); }}>取消</Button>
            <Button type="primary" disabled={selectedOrderIds.length === 0} onClick={handleNext} style={{ marginLeft: 12, background: '#000', borderColor: '#000' }}>下一步</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setApplyStep('select')}>上一步</Button>
            <Button type="primary" onClick={handleSubmit} style={{ marginLeft: 12, background: '#000', borderColor: '#000' }}>提交申请</Button>
          </div>
        )}
      >
        {applyStep === 'select' ? (
          <div>
            <div style={{ marginBottom: 12, fontSize: 13, color: '#86909c' }}>选择需要开票的订单（已完成/待补款，支持多选）</div>
            <div style={{ maxHeight: 360, overflow: 'auto' }}>
              {availableOrders.map(o => (
                <div key={o.id} onClick={() => setSelectedOrderIds(prev => prev.includes(o.id) ? prev.filter(x => x !== o.id) : [...prev, o.id])}
                  style={{ padding: '12px 16px', marginBottom: 8, borderRadius: 8, border: selectedOrderIds.includes(o.id) ? '2px solid #000' : '1px solid #F2F2F2', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{o.orderNo} · <Tag size="small" color={o.type === 'charter' ? 'gold' : 'gray'}>{o.type === 'charter' ? '包车' : '租车'}</Tag></div>
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
              <Form.Item label="企业名称" required>
                <Input placeholder="请输入企业全称" value={invForm.company} onChange={v => setInvForm(p => ({ ...p, company: v }))} />
              </Form.Item>
              <Form.Item label="纳税人识别号" required>
                <Input placeholder="15-18 位" maxLength={18} value={invForm.taxId} onChange={v => setInvForm(p => ({ ...p, taxId: v }))} />
              </Form.Item>
              <Form.Item label="接收邮箱" required>
                <Input placeholder="发票将发送至此邮箱" value={invForm.email} onChange={v => setInvForm(p => ({ ...p, email: v }))} />
              </Form.Item>
            </Form>
            <div style={{ fontSize: 12, color: '#86909c', marginTop: 16, padding: '10px 12px', background: '#F7F8FA', borderRadius: 8 }}>
              📌 开票须知：电子发票将在申请提交后 1-2 个工作日内完成。开票中状态可自主取消。当前版本不做红冲（作废重开）。
            </div>
          </div>
        )}
      </Modal>

      {/* 取消申请弹窗 */}
      <Modal
        title="取消开票申请"
        visible={cancelVisible}
        onOk={handleCancelSubmit}
        onCancel={() => { setCancelVisible(false); setCancelTarget(null); }}
        okText="确认取消"
        okButtonProps={{ status: 'danger' }}
      >
        <p style={{ marginBottom: 16, color: '#4E5969' }}>
          确定取消发票 <strong>{cancelTarget?.invoiceNo}</strong> 的开票申请吗？
        </p>
        <Form form={cancelForm} layout="vertical">
          <Form.Item label="取消原因" field="reason" rules={[{ required: true, message: '请填写取消原因' }, { maxLength: 200 }]}>
            <Input.TextArea placeholder="请输入取消原因，最多 200 字" maxLength={200} showWordLimit rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
