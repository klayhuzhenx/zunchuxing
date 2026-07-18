import { useState, useMemo } from 'react';
import { Card, Table, Tag, Button, Space, Drawer, Descriptions, Upload, Message, Modal, Input, Select, Timeline, Tabs } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { mockPayments } from '../../data/mock';
import type { Payment, PaymentStatus } from '../../types';

const statusMap: Record<PaymentStatus, { label: string; color: string }> = {
  pending: { label: '待付款', color: 'orangered' },
  verifying: { label: '付款核实', color: 'arcoblue' },
  paid: { label: '已付款', color: 'green' },
  rejected: { label: '已驳回', color: 'red' },
};

export default function PaymentPage() {
  const [data] = useState<Payment[]>(mockPayments);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [voucherModal, setVoucherModal] = useState<Payment | null>(null);
  const [voucherImg, setVoucherImg] = useState('');

  const nowStr = () => new Date().toISOString().replace('T', ' ').slice(0, 16);

  const filtered = useMemo(() => {
    let r = data;
    if (activeTab !== 'all') r = r.filter(p => p.status === activeTab);
    if (statusFilter.length > 0) r = r.filter(p => statusFilter.includes(p.status));
    if (keyword) {
      const kw = keyword.toLowerCase();
      r = r.filter(p => p.paymentNo.toLowerCase().includes(kw) || p.invoiceApplyNo.toLowerCase().includes(kw));
    }
    return r;
  }, [data, activeTab, keyword, statusFilter]);

  const handleUploadVoucher = () => {
    if (!voucherModal || !voucherImg) { Message.warning('请上传支付凭证'); return; }
    Message.success('凭证已上传，待核实');
    setVoucherModal(null); setVoucherImg('');
  };

  const columns = [
    { title: '付款单号', dataIndex: 'paymentNo', width: 180, render: (v: string, r: Payment) => <a onClick={() => { setSelected(r); setDrawerVisible(true); }}>{v}</a> },
    { title: '关联发票', dataIndex: 'invoiceApplyNo', width: 170 },
    { title: '付款金额', width: 120, render: (_: unknown, r: Payment) => `¥${r.amount.toLocaleString()}` },
    { title: '付款状态', width: 110, render: (_: unknown, r: Payment) => <Tag color={statusMap[r.status].color} size="small">{statusMap[r.status].label}</Tag> },
    { title: '创建时间', dataIndex: 'createdAt', width: 150 },
    { title: '操作', width: 120, render: (_: unknown, r: Payment) => (
      <Space size={4}>
        <Button type="text" size="small" onClick={() => { setSelected(r); setDrawerVisible(true); }}>详情</Button>
        {r.status === 'pending' && <Button type="text" size="small" status="warning" onClick={() => { setVoucherModal(r); setVoucherImg(''); }}>上传凭证</Button>}
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ background: '#FFF7E8', border: '1px solid #FFCF7A', borderRadius: 6, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#FF7D00' }}>
        💡 发票开具完成后自动生成付款单
      </div>
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <Input prefix={<IconSearch />} placeholder="付款单号/发票编号" style={{ width: 260 }} value={keyword} onChange={setKeyword} allowClear />
          <Select placeholder="付款状态" style={{ width: 180 }} mode="multiple" value={statusFilter} onChange={setStatusFilter}
            options={Object.entries(statusMap).map(([k, v]) => ({ label: v.label, value: k }))} />
          <div style={{ flex: 1 }} />
        </Space>
      </Card>

      <Tabs activeTab={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }}>
        <Tabs.TabPane key="all" title="全部" />
        <Tabs.TabPane key="pending" title="待付款" />
        <Tabs.TabPane key="verifying" title="付款核实" />
        <Tabs.TabPane key="paid" title="已付款" />
        <Tabs.TabPane key="rejected" title="已驳回" />
      </Tabs>

      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 900 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>

      <Drawer width="60%" title={selected ? `付款详情 - ${selected.paymentNo}` : '付款详情'}
        visible={drawerVisible} onCancel={() => setDrawerVisible(false)} footer={null}>
        {selected && (
          <div>
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small" data={[
                { label: '付款单号', value: selected.paymentNo },
                { label: '关联发票', value: selected.invoiceApplyNo },
                { label: '付款金额', value: `¥${selected.amount.toLocaleString()}` },
                { label: '付款状态', value: <Tag color={statusMap[selected.status].color} size="small">{statusMap[selected.status].label}</Tag> },
                { label: '创建时间', value: selected.createdAt },
              ]} />
            </Card>

            {selected.voucher && (
              <Card title="支付凭证" size="small" style={{ marginBottom: 16 }}>
                <Descriptions column={2} size="small" data={[
                  { label: '凭证上传人', value: selected.voucherUploader || '—' },
                  { label: '凭证上传时间', value: selected.voucherUploadTime || '—' },
                ]} />
                <img src={selected.voucher} alt="支付凭证" style={{ width: '100%', maxWidth: 400, borderRadius: 8, marginTop: 12 }} />
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

            {selected.rejectReason && (
              <Card title="驳回信息" size="small" style={{ marginBottom: 16 }}>
                <Descriptions column={1} size="small" data={[
                  { label: '驳回原因', value: selected.rejectReason },
                ]} />
              </Card>
            )}

            {selected.operationLogs && (
              <Card title="操作日志" size="small">
                <Timeline>
                  {selected.operationLogs.map((l, i) => (
                    <Timeline.Item key={i} label={l.time}>{l.operator} {l.action}{l.remark ? ` — ${l.remark}` : ''}</Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            )}
          </div>
        )}
      </Drawer>

      <Modal title="上传支付凭证" visible={!!voucherModal} onOk={handleUploadVoucher}
        onCancel={() => { setVoucherModal(null); setVoucherImg(''); }} okText="确认上传">
        {voucherModal && (
          <div>
            <Descriptions column={2} size="small" style={{ marginBottom: 16 }} data={[
              { label: '付款单号', value: voucherModal.paymentNo },
              { label: '付款金额', value: `¥${voucherModal.amount.toLocaleString()}` },
            ]} />
            <Upload listType="picture-card" accept="image/*"
              fileList={voucherImg ? [{ uid: '0', url: voucherImg, name: '凭证' }] : []}
              customRequest={(option) => {
                const f = option.file as File;
                if (f.size > 10 * 1024 * 1024) { Message.error('文件不能超过 10MB'); return; }
                const reader = new FileReader();
                reader.onload = () => setVoucherImg(reader.result as string);
                reader.readAsDataURL(f);
              }}
              onRemove={() => { setVoucherImg(''); return true; }}>
              {!voucherImg && <div style={{ color: '#86909c' }}>+ 上传</div>}
            </Upload>
          </div>
        )}
      </Modal>
    </div>
  );
}
