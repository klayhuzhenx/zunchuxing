import { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Input, Select, Space, Drawer, Descriptions,
  Timeline, Message, Modal, Upload, Popconfirm, Tabs,
} from '@arco-design/web-react';
import { IconSearch, IconDownload } from '@arco-design/web-react/icon';
import { payments as paymentData } from '../../data/mock';
import type { Payment, PaymentStatus } from '../../types';

const statusMap: Record<PaymentStatus, { label: string; color: string }> = {
  pending: { label: '待回款', color: 'orangered' },
  verifying: { label: '回款核实', color: 'arcoblue' },
  completed: { label: '已回款', color: 'green' },
};

export default function PaymentList() {
  const [data, setData] = useState<Payment[]>(paymentData);
  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(window.location.search).get('tab') || 'all');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [enterpriseFilter, setEnterpriseFilter] = useState<string>('');
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<Payment | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [voucherModal, setVoucherModal] = useState<Payment | null>(null);
  const [voucherImg, setVoucherImg] = useState('');
  const [voucherRemark, setVoucherRemark] = useState('');
  const [verifyModal, setVerifyModal] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const enterpriseOptions = useMemo(() =>
    [...new Set(data.map(p => p.enterpriseName))].map(n => ({ label: n, value: n })), [data]);

  const filtered = useMemo(() => {
    let r = data;
    if (activeTab !== 'all') r = r.filter(p => p.status === activeTab);
    if (statusFilter.length > 0) r = r.filter(p => statusFilter.includes(p.status));
    if (enterpriseFilter) r = r.filter(p => p.enterpriseName === enterpriseFilter);
    if (keyword) {
      const kw = keyword.toLowerCase();
      r = r.filter(p =>
        p.paymentNo.toLowerCase().includes(kw) || p.invoiceApplyNo.toLowerCase().includes(kw) ||
        p.enterpriseName.toLowerCase().includes(kw)
      );
    }
    return r;
  }, [data, activeTab, statusFilter, enterpriseFilter, keyword]);

  const nowStr = () => new Date().toISOString().replace('T', ' ').slice(0, 16);

  const handleUploadVoucher = () => {
    if (!voucherModal) return;
    if (!voucherImg) { Message.warning('请上传支付凭证'); return; }
    const now = nowStr();
    setData(data.map(p => p.id === voucherModal.id ? {
      ...p, status: 'verifying', voucher: voucherImg, voucherName: '支付凭证.jpg',
      voucherUploadTime: now, voucherUploader: '王财务',
      operationLogs: [...p.operationLogs, { time: now, action: '上传支付凭证', operator: '王财务' }],
    } : p));
    Message.success('凭证已上传，待核实');
    setVoucherModal(null); setVoucherImg(''); setVoucherRemark('');
  };

  const handleVerifyPass = (p: Payment) => {
    const now = nowStr();
    setData(data.map(x => x.id === p.id ? {
      ...x, status: 'completed', verifyResult: '通过', verifyOperator: '王财务', verifyTime: now,
      operationLogs: [...x.operationLogs, { time: now, action: '核实通过', operator: '王财务', remark: '回款完成' }],
    } : x));
    Message.success('回款已确认');
  };

  const handleVerifyReject = () => {
    if (!verifyModal) return;
    if (!rejectReason.trim()) { Message.warning('请填写驳回原因'); return; }
    const now = nowStr();
    setData(data.map(x => x.id === verifyModal.id ? {
      ...x, status: 'pending', rejectReason, verifyRemark: rejectReason,
      operationLogs: [...x.operationLogs, { time: now, action: '驳回回款', operator: '王财务', remark: rejectReason }],
    } : x));
    Message.success('已驳回');
    setVerifyModal(null); setRejectReason('');
  };

  const columns = [
    { title: '回款单号', dataIndex: 'paymentNo', width: 170, render: (v: string, r: Payment) => <a onClick={() => { setSelected(r); setDrawerVisible(true); }}>{v}</a> },
    { title: '关联发票', dataIndex: 'invoiceApplyNo', width: 160, render: (v: string) => <a>{v}</a> },
    { title: '企业名称', dataIndex: 'enterpriseName', width: 200, ellipsis: true },
    { title: '回款金额', width: 110, render: (_: unknown, r: Payment) => `¥${r.amount.toLocaleString()}` },
    { title: '回款状态', width: 100, render: (_: unknown, r: Payment) => <Tag color={statusMap[r.status].color} size="small">{statusMap[r.status].label}</Tag> },
    { title: '凭证上传人', width: 110, render: (_: unknown, r: Payment) => r.voucherUploader || '—' },
    { title: '创建时间', dataIndex: 'createdAt', width: 150 },
    { title: '操作', width: 200, fixed: 'right' as const, render: (_: unknown, r: Payment) => (
      <Space size={4}>
        <Button type="text" size="small" onClick={() => { setSelected(r); setDrawerVisible(true); }}>详情</Button>
        {r.status === 'pending' && <Button type="text" size="small" status="warning" onClick={() => { setVoucherModal(r); setVoucherImg(''); setVoucherRemark(''); }}>上传凭证</Button>}
        {r.status === 'verifying' && <>
          <Popconfirm title="确认回款金额无误，核实通过？" onOk={() => handleVerifyPass(r)}>
            <Button type="text" size="small" status="success">核实</Button>
          </Popconfirm>
          <Button type="text" size="small" status="danger" onClick={() => { setVerifyModal(r); setRejectReason(''); }}>驳回</Button>
        </>}
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ background: '#FFF7E8', border: '1px solid #FFCF7A', borderRadius: 6, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#FF7D00' }}>
        💡 发票开具完成后自动生成回款单
      </div>
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <Input prefix={<IconSearch />} placeholder="回款单号/发票编号/企业" style={{ width: 260 }} value={keyword} onChange={setKeyword} allowClear />
          <Select placeholder="回款状态" style={{ width: 160 }} mode="multiple" value={statusFilter} onChange={setStatusFilter}
            options={Object.entries(statusMap).map(([k, v]) => ({ label: v.label, value: k }))} />
          <Select placeholder="企业" style={{ width: 200 }} value={enterpriseFilter || undefined} onChange={v => setEnterpriseFilter(v || '')} allowClear showSearch
            options={enterpriseOptions} />
          <div style={{ flex: 1 }} />
          <Button icon={<IconDownload />}>导出</Button>
        </Space>
      </Card>

      <Tabs activeTab={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }}>
        <Tabs.TabPane key="all" title="全部" />
        <Tabs.TabPane key="pending" title="待回款" />
        <Tabs.TabPane key="verifying" title="回款核实" />
        <Tabs.TabPane key="completed" title="已回款" />
      </Tabs>

      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 1200 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>

      {/* 详情抽屉 */}
      <Drawer width="60%" title={selected ? `回款详情 - ${selected.paymentNo}` : '回款详情'}
        visible={drawerVisible} onCancel={() => setDrawerVisible(false)} footer={null}>
        {selected && (
          <div>
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small" data={[
                { label: '回款单号', value: selected.paymentNo },
                { label: '关联发票', value: <a>{selected.invoiceApplyNo}</a> },
                { label: '企业名称', value: selected.enterpriseName },
                { label: '回款金额', value: `¥${selected.amount.toLocaleString()}` },
                { label: '回款状态', value: <Tag color={statusMap[selected.status].color} size="small">{statusMap[selected.status].label}</Tag> },
                { label: '创建时间', value: selected.createdAt },
              ]} />
            </Card>

            {selected.voucher && (
              <Card title="支付凭证" size="small" style={{ marginBottom: 16 }}>
                <Descriptions column={2} size="small" data={[
                  { label: '凭证上传人', value: selected.voucherUploader || '—' },
                  { label: '凭证上传时间', value: selected.voucherUploadTime || '—' },
                ]} />
                <div style={{ marginTop: 12 }}>
                  {selected.voucher.match(/\.pdf$/i)
                    ? <iframe src={selected.voucher} style={{ width: '100%', height: 400, border: 'none' }} title="凭证" />
                    : <img src={selected.voucher} alt="支付凭证" style={{ width: '100%', maxWidth: 400, borderRadius: 8 }} />}
                </div>
              </Card>
            )}

            {selected.verifyResult && (
              <Card title="核实记录" size="small" style={{ marginBottom: 16 }}>
                <Descriptions column={2} size="small" data={[
                  { label: '核实结果', value: <Tag color={selected.verifyResult === '通过' ? 'green' : 'red'} size="small">{selected.verifyResult}</Tag> },
                  { label: '核实备注', value: selected.verifyRemark || '—' },
                  { label: '核实人', value: selected.verifyOperator || '—' },
                  { label: '核实时间', value: selected.verifyTime || '—' },
                ]} />
              </Card>
            )}

            <Card title="操作日志" size="small">
              <Timeline>
                {selected.operationLogs.map((l, i) => (
                  <Timeline.Item key={i} label={l.time}>
                    {l.operator} {l.action}{l.remark ? ` — ${l.remark}` : ''}
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </div>
        )}
      </Drawer>

      {/* 上传凭证弹窗 */}
      <Modal title="上传支付凭证" visible={!!voucherModal} onOk={handleUploadVoucher}
        onCancel={() => { setVoucherModal(null); setVoucherImg(''); setVoucherRemark(''); }} okText="确认上传">
        {voucherModal && (
          <div>
            <Descriptions column={2} size="small" style={{ marginBottom: 16 }} data={[
              { label: '回款单号', value: voucherModal.paymentNo },
              { label: '回款金额', value: `¥${voucherModal.amount.toLocaleString()}` },
              { label: '企业名称', value: voucherModal.enterpriseName },
            ]} />
            <div style={{ marginBottom: 8, fontSize: 14 }}>支付凭证 <span style={{ color: '#F53F3F' }}>*</span></div>
            <Upload
              listType="picture-card"
              accept="image/jpeg,image/png,application/pdf"
              fileList={voucherImg ? [{ uid: '0', url: voucherImg, name: '凭证' }] : []}
              customRequest={(option) => {
                const f = option.file as File;
                if (f.size > 10 * 1024 * 1024) { Message.error('文件不能超过 10MB'); return; }
                const reader = new FileReader();
                reader.onload = () => setVoucherImg(reader.result as string);
                reader.readAsDataURL(f);
              }}
              onRemove={() => { setVoucherImg(''); return true; }}
            >
              {!voucherImg && <div style={{ color: '#86909c' }}>+ 上传</div>}
            </Upload>
            <div style={{ fontSize: 12, color: '#86909c', marginTop: 4 }}>支持 jpg/png/pdf，≤10MB</div>
            <div style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 8, fontSize: 14 }}>备注</div>
              <Input.TextArea value={voucherRemark} onChange={setVoucherRemark} placeholder="选填，≤200字" maxLength={200} showWordLimit rows={2} />
            </div>
          </div>
        )}
      </Modal>

      {/* 驳回弹窗 */}
      <Modal title="驳回回款" visible={!!verifyModal} onOk={handleVerifyReject}
        onCancel={() => { setVerifyModal(null); setRejectReason(''); }} okText="确认驳回">
        <p>驳回后回款任务将回到「待回款」状态，可重新上传凭证。</p>
        <Input.TextArea value={rejectReason} onChange={setRejectReason} placeholder="驳回原因（必填，≤200字）" maxLength={200} showWordLimit rows={3} />
      </Modal>
    </div>
  );
}
