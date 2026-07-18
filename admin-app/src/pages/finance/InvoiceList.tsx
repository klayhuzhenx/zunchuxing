import { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Input, Select, Space, Drawer, Descriptions,
  Timeline, Message, Modal, Upload, Popconfirm, DatePicker, Tabs,
} from '@arco-design/web-react';
import { IconSearch, IconDownload, IconPlus } from '@arco-design/web-react/icon';
import { invoices as invoiceData, payments as paymentData, orders as orderData, enterprises } from '../../data/mock';
import type { Invoice, InvoiceStatus, Order } from '../../types';
import InvoiceApplyModal from './components/InvoiceApplyModal';

const { RangePicker } = DatePicker;

const statusMap: Record<string, { label: string; color: string }> = {
  issuing: { label: '开票中', color: 'arcoblue' },
  issued: { label: '已开票', color: 'green' },
  rejected: { label: '已驳回', color: 'red' },
  cancelled: { label: '已取消', color: 'gray' },
};

const channelMap: Record<string, string> = {
  ops_backend: '运营后台', enterprise_backend: '企业后台',
  miniapp: '乘客小程序', harmony: '鸿蒙 APP',
};

const subjectMap: Record<string, string> = { personal: '个人', enterprise: '企业' };
const typeMap: Record<string, string> = { general: '普通发票', special: '专用发票' };
const payLabel: Record<string, string> = {
  enterprise_credit: '企业额度支付', alipay: '支付宝', wechat: '微信',
};

export default function InvoiceList() {
  const [data, setData] = useState<Invoice[]>(invoiceData);
  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(window.location.search).get('tab') || 'all');
  const [channelFilter, setChannelFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [timeRange, setTimeRange] = useState<[string, string] | null>(null);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [applyVisible, setApplyVisible] = useState(false);
  const [reapplyInvoice, setReapplyInvoice] = useState<Invoice | null>(null);
  const [rejectVisible, setRejectVisible] = useState(false);
  const [rejectInvoice, setRejectInvoice] = useState<Invoice | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [attachModal, setAttachModal] = useState<Invoice | null>(null);
  const [attachImg, setAttachImg] = useState('');

  const nowStr = () => new Date().toISOString().replace('T', ' ').slice(0, 16);

  const filtered = useMemo(() => {
    let r = data;
    if (activeTab !== 'all') r = r.filter(i => i.status === activeTab);
    if (channelFilter.length > 0) r = r.filter(i => channelFilter.includes(i.channel));
    if (typeFilter.length > 0) r = r.filter(i => typeFilter.includes(i.invoiceType));
    if (subjectFilter.length > 0) r = r.filter(i => subjectFilter.includes(i.subject));
    if (timeRange) {
      const [s, e] = timeRange;
      r = r.filter(i => i.applyTime >= s && i.applyTime <= e + ' 23:59:59');
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      r = r.filter(i =>
        i.applyNo.toLowerCase().includes(kw) || i.applicantName.toLowerCase().includes(kw) ||
        i.applicantPhone.includes(kw) || (i.enterpriseName || '').toLowerCase().includes(kw)
      );
    }
    return r;
  }, [data, activeTab, channelFilter, typeFilter, subjectFilter, keyword, timeRange]);

  // 获取发票关联的订单
  const relatedOrders = useMemo((): Order[] => {
    if (!selected) return [];
    return orderData.filter(o => selected.orderNos.includes(o.orderNo));
  }, [selected]);

  // 上传发票 → 已开票 + 自动生成回款
  const handleUploadAttachment = () => {
    if (!attachModal || !attachImg) { Message.warning('请上传发票附件'); return; }
    const now = nowStr();
    setData(data.map(i => i.id === attachModal.id ? {
      ...i, status: 'issued' as InvoiceStatus,
      attachment: attachImg, attachmentName: '发票附件.jpg',
      uploadTime: now, operator: '王财务',
      operationLogs: [...i.operationLogs, { time: now, action: '上传发票附件', operator: '王财务' }, { time: now, action: '开票完成', operator: '系统' }],
    } : i));

    // 自动生成回款：检查关联订单是否有企业额度支付
    const entOrders = orderData.filter(o => attachModal.orderNos.includes(o.orderNo) && o.paymentMethod === 'enterprise_credit' && o.enterpriseName);
    if (entOrders.length > 0) {
      const enterpriseName = entOrders[0].enterpriseName!;
      const entAmount = entOrders.reduce((s, o) => s + o.paidAmount, 0);
      const ent = enterprises.find(e => e.name === enterpriseName);
      paymentData.push({
        id: `PM-AUTO-${Date.now()}`,
        paymentNo: `HK${now.slice(0, 10).replace(/-/g, '')}-${String(paymentData.length + 1).padStart(4, '0')}`,
        invoiceId: attachModal.id, invoiceApplyNo: attachModal.applyNo,
        enterpriseId: ent?.id || '', enterpriseName,
        amount: entAmount, status: 'pending' as 'pending',
        createdAt: now,
        operationLogs: [{ time: now, action: '回款任务已生成', operator: '系统', remark: `发票 ${attachModal.applyNo} 开票完成自动生成` }],
      });
      Message.success('开票成功，已自动生成回款任务单');
    } else {
      Message.success('开票已完成');
    }
    setAttachModal(null); setAttachImg('');
  };

  // 驳回
  const handleReject = () => {
    if (!rejectInvoice || !rejectReason.trim()) { Message.warning('请填写驳回原因'); return; }
    const now = nowStr();
    setData(data.map(i => i.id === rejectInvoice.id ? {
      ...i, status: 'rejected' as InvoiceStatus,
      rejectReason, rejectTime: now, rejectOperator: '王财务',
      operationLogs: [...i.operationLogs, { time: now, action: '驳回开票', operator: '王财务', remark: rejectReason }],
    } : i));
    Message.success('已驳回，申请人将收到通知');
    setRejectVisible(false); setRejectInvoice(null); setRejectReason('');
  };

  // 取消
  const handleCancel = (r: Invoice) => {
    const now = nowStr();
    setData(data.map(i => i.id === r.id ? {
      ...i, status: 'cancelled' as InvoiceStatus,
      operationLogs: [...i.operationLogs, { time: now, action: '取消申请', operator: '王财务', remark: '关联订单已释放' }],
    } : i));
    Message.success('已取消，关联订单已释放');
  };

  // 取消已开票（检查回款是否已完成）
  const handleCancelIssued = (r: Invoice) => {
    const linkedPayment = paymentData.find(p => p.invoiceId === r.id);
    if (linkedPayment && linkedPayment.status === 'completed') {
      Message.error('该笔单据已回款完成，不可取消');
      return;
    }
    const now = nowStr();
    setData(data.map(i => i.id === r.id ? {
      ...i, status: 'cancelled' as InvoiceStatus,
      operationLogs: [...i.operationLogs, { time: now, action: '取消申请', operator: '王财务', remark: '关联订单已释放' }],
    } : i));
    // 联动标记对应回款单为已取消
    if (linkedPayment) {
      const idx = paymentData.findIndex(p => p.id === linkedPayment.id);
      if (idx >= 0) paymentData.splice(idx, 1);
    }
    Message.success('已取消' + (linkedPayment ? '，对应回款单已删除' : '，关联订单已释放'));
  };

  // 重新申请：打开申请弹窗，带入原信息
  const handleReapply = (r: Invoice) => {
    setReapplyInvoice(r);
    setApplyVisible(true);
  };

  const columns = [
    { title: '申请编号', dataIndex: 'applyNo', width: 180, render: (v: string, r: Invoice) => <a onClick={() => { setSelected(r); setDrawerVisible(true); }}>{v}</a> },
    { title: '申请渠道', width: 110, render: (_: unknown, r: Invoice) => <Tag size="small">{channelMap[r.channel] || r.channel}</Tag> },
    { title: '申请人', width: 100, render: (_: unknown, r: Invoice) => r.applicantName },
    { title: '申请属性', width: 80, render: (_: unknown, r: Invoice) => <Tag color={r.subject === 'enterprise' ? 'arcoblue' : 'green'} size="small">{subjectMap[r.subject]}</Tag> },
    { title: '开票类型', width: 100, render: (_: unknown, r: Invoice) => <Tag size="small">{typeMap[r.invoiceType] || r.invoiceType}</Tag> },
    { title: '发票抬头', dataIndex: 'title', width: 200, ellipsis: true },
    { title: '开票金额', width: 110, render: (_: unknown, r: Invoice) => `¥${r.amount.toLocaleString()}` },
    { title: '开票状态', width: 90, render: (_: unknown, r: Invoice) => <Tag color={(statusMap[r.status] || {}).color} size="small">{(statusMap[r.status] || {}).label || r.status}</Tag> },
    { title: '申请时间', dataIndex: 'applyTime', width: 140 },
    { title: '操作', width: 220, fixed: 'right' as const, render: (_: unknown, r: Invoice) => (
      <Space size={4}>
        <Button type="text" size="small" onClick={() => { setSelected(r); setDrawerVisible(true); }}>详情</Button>
        {r.status === 'issuing' && (
          <>
            <Button type="text" size="small" status="warning" onClick={() => { setAttachModal(r); setAttachImg(''); }}>上传发票</Button>
            <Button type="text" size="small" status="danger" onClick={() => { setRejectInvoice(r); setRejectVisible(true); setRejectReason(''); }}>驳回</Button>
            <Popconfirm title="取消后关联订单将释放可重新申请，是否继续？" onOk={() => handleCancel(r)}>
              <Button type="text" size="small">取消</Button>
            </Popconfirm>
          </>
        )}
        {r.status === 'rejected' && (
          <>
            <Button type="text" size="small" onClick={() => handleReapply(r)}>重新申请</Button>
            <Popconfirm title="取消后关联订单将释放可重新申请，是否继续？" onOk={() => handleCancel(r)}>
              <Button type="text" size="small">取消</Button>
            </Popconfirm>
          </>
        )}
      </Space>
    )},
  ];

  return (
    <div>
      {/* 筛选 */}
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <Input prefix={<IconSearch />} placeholder="申请编号/申请人/手机号/企业" style={{ width: 280 }} value={keyword} onChange={setKeyword} allowClear />
          <Select placeholder="开票类型" style={{ width: 140 }} mode="multiple" value={typeFilter} onChange={setTypeFilter}
            options={Object.entries(typeMap).map(([k, v]) => ({ label: v, value: k }))} />
          <Select placeholder="申请属性" style={{ width: 140 }} mode="multiple" value={subjectFilter} onChange={setSubjectFilter}
            options={Object.entries(subjectMap).map(([k, v]) => ({ label: v, value: k }))} />
          <Select placeholder="申请渠道" style={{ width: 160 }} mode="multiple" value={channelFilter} onChange={setChannelFilter}
            options={Object.entries(channelMap).map(([k, v]) => ({ label: v, value: k }))} />
          <RangePicker style={{ width: 280 }} placeholder={['申请时间起', '申请时间止']}
            onChange={(_, ds) => setTimeRange(ds && ds[0] && ds[1] ? ds as [string, string] : null)} />
          <div style={{ flex: 1 }} />
          <Button icon={<IconDownload />}>导出</Button>
          <Button type="primary" icon={<IconPlus />} onClick={() => setApplyVisible(true)}>申请开票</Button>
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
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 1500 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>

      {/* 详情抽屉 */}
      <Drawer width="60%" title={selected ? `发票详情 - ${selected.applyNo}` : '发票详情'}
        visible={drawerVisible} onCancel={() => setDrawerVisible(false)} footer={null}>
        {selected && (
          <div>
            {/* 基本信息 */}
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small" data={[
                { label: '申请编号', value: selected.applyNo },
                { label: '申请渠道', value: channelMap[selected.channel] || selected.channel },
                { label: '申请人', value: selected.applicantName },
                { label: '申请企业', value: selected.enterpriseName || '—' },
                { label: '申请属性', value: <Tag size="small">{subjectMap[selected.subject]}</Tag> },
                { label: '申请时间', value: selected.applyTime },
                { label: '开票状态', value: <Tag color={(statusMap[selected.status] || {}).color} size="small">{(statusMap[selected.status] || {}).label}</Tag> },
              ]} />
            </Card>

            {/* 开票信息 */}
            <Card title="开票信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small" data={[
                { label: '开票类型', value: typeMap[selected.invoiceType] || selected.invoiceType },
                { label: '发票抬头', value: selected.title },
                { label: '纳税人识别号', value: selected.taxNo || '—' },
                { label: '地址', value: selected.companyAddress || '—' },
                { label: '开户行', value: selected.bankName || '—' },
                { label: '银行账户', value: selected.bankAccount || '—' },
                { label: '企业电话', value: selected.companyPhone || '—' },
                { label: '开票金额', value: `¥${selected.amount.toLocaleString()}` },
                { label: '备注', value: selected.remark || '—' },
              ]} />
            </Card>

            {/* 关联订单 */}
            <Card title="关联订单" size="small" style={{ marginBottom: 16 }}>
              <Table columns={[
                { title: '订单号', dataIndex: 'orderNo', width: 170 },
                { title: '订单类型', width: 90, render: (_: unknown, o: Order) => <Tag color={o.type === 'charter' ? 'arcoblue' : 'purple'} size="small">{o.type === 'charter' ? '包车' : '租车'}</Tag> },
                { title: '完成时间', width: 110, render: (_: unknown, o: Order) => o.endTime?.split(' ')[0] || o.createdAt.split(' ')[0] },
                { title: '订单金额', width: 110, render: (_: unknown, o: Order) => `¥${o.paidAmount.toLocaleString()}` },
              ]} data={relatedOrders} rowKey="id" pagination={false} size="small" />
            </Card>

            {/* 发票附件（仅已开票） */}
            {selected.status === 'issued' && selected.attachment && (
              <Card title="发票附件" size="small" style={{ marginBottom: 16 }}>
                <Descriptions column={2} size="small" data={[
                  { label: '上传时间', value: selected.uploadTime || '—' },
                  { label: '操作人', value: selected.operator || '—' },
                ]} />
                <div style={{ marginTop: 12, padding: '12px 16px', background: '#F7F8FA', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{selected.attachmentName?.match(/\.pdf$/i) ? '📄' : '🖼️'}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{selected.attachmentName || '发票附件'}</span>
                </div>
              </Card>
            )}

            {/* 订单动态 */}
            <Card title="订单动态" size="small">
              <Timeline reverse>
                {selected.operationLogs.map((l, i) => (
                  <Timeline.Item key={i} label={l.time} dotColor={l.action.includes('驳回') ? '#F53F3F' : undefined}>
                    <span style={{ color: l.action.includes('驳回') ? '#F53F3F' : undefined }}>{l.operator} {l.action}{l.remark ? ` — ${l.remark}` : ''}</span>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </div>
        )}
      </Drawer>

      {/* 申请开票弹窗 */}
      <InvoiceApplyModal visible={applyVisible} onClose={() => { setApplyVisible(false); setReapplyInvoice(null); }}
        prefill={reapplyInvoice}
        onSubmit={(invoice: Invoice) => { setData([invoice, ...data]); setApplyVisible(false); setReapplyInvoice(null); Message.success('开票申请已提交'); }} />

      {/* 驳回弹窗 */}
      <Modal title="驳回开票" visible={rejectVisible} onOk={handleReject}
        onCancel={() => { setRejectVisible(false); setRejectInvoice(null); setRejectReason(''); }} okText="确认驳回">
        {rejectInvoice && <p>驳回申请 <strong>{rejectInvoice.applyNo}</strong>（{rejectInvoice.title}），驳回后将通知申请人。</p>}
        <Input.TextArea value={rejectReason} onChange={setRejectReason} placeholder="驳回原因（必填，≤200字）" maxLength={200} showWordLimit rows={3} />
      </Modal>

      {/* 上传发票弹窗 */}
      <Modal title="上传发票附件" visible={!!attachModal} onOk={handleUploadAttachment}
        onCancel={() => { setAttachModal(null); setAttachImg(''); }} okText="确认上传">
        {attachModal && (
          <div>
            <Descriptions column={2} size="small" style={{ marginBottom: 16 }} data={[
              { label: '申请编号', value: attachModal.applyNo },
              { label: '发票抬头', value: attachModal.title },
              { label: '开票金额', value: `¥${attachModal.amount.toLocaleString()}` },
            ]} />
            <div style={{ marginBottom: 8, fontSize: 14 }}>发票附件 <span style={{ color: '#F53F3F' }}>*</span></div>
            <Upload
              listType="picture-card"
              accept="image/jpeg,image/png,application/pdf"
              fileList={attachImg ? [{ uid: '0', url: attachImg, name: '附件' }] : []}
              customRequest={(option) => {
                const f = option.file as File;
                if (f.size > 10 * 1024 * 1024) { Message.error('文件不能超过 10MB'); return; }
                const reader = new FileReader();
                reader.onload = () => setAttachImg(reader.result as string);
                reader.readAsDataURL(f);
              }}
              onRemove={() => { setAttachImg(''); return true; }}
            >
              {!attachImg && <div style={{ color: '#86909c' }}>+ 上传</div>}
            </Upload>
            <div style={{ fontSize: 12, color: '#86909c', marginTop: 4 }}>支持 jpg/png/pdf，≤10MB</div>
          </div>
        )}
      </Modal>
    </div>
  );
}
