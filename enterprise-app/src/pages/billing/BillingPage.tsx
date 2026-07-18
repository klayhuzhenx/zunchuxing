import { useState, useMemo } from 'react';
import { Card, Table, Tag, DatePicker, Space, Typography } from '@arco-design/web-react';
import { mockOrders, mockInvoices, mockPayments } from '../../data/mock';
import type { Order } from '../../types';

const { RangePicker } = DatePicker;
const { Title } = Typography;

export default function BillingPage() {
  const [timeRange, setTimeRange] = useState<[string, string] | null>(null);

  const enterpriseOrders = useMemo(() =>
    mockOrders.filter(o => o.paymentMethod === 'enterprise_credit' && o.status === 'completed'),
  []);

  const invoiceMap = useMemo(() => {
    const m = new Map<string, { no: string; status: string }>();
    mockInvoices.forEach(i => i.relatedOrders.split(', ').forEach(o => m.set(o, { no: i.applyNo, status: i.status })));
    return m;
  }, []);
  const paymentMap = useMemo(() => {
    const m = new Map<string, { no: string; status: string }>();
    mockPayments.forEach(p => m.set(p.invoiceApplyNo, { no: p.paymentNo, status: p.status }));
    return m;
  }, []);

  const filtered = useMemo(() => {
    let r = enterpriseOrders;
    if (timeRange) {
      const [s, e] = timeRange;
      const endDate = (o: Order) => (o.rentalEnd || o.endTime?.split(' ')[0]) || o.createdAt.split(' ')[0];
      r = r.filter(o => { const d = endDate(o); return d >= s && d <= e; });
    }
    return r;
  }, [enterpriseOrders, timeRange]);

  const summary = useMemo(() => {
    let consumption = 0, pendingInvoice = 0, issuedAmount = 0, pendingPayment = 0, paidAmount = 0;
    filtered.forEach(o => {
      consumption += o.paidAmount;
      const inv = invoiceMap.get(o.orderNo);
      if (!inv || inv.status === 'issuing' || inv.status === 'rejected') {
        pendingInvoice += o.paidAmount;
        pendingPayment += o.paidAmount; // 未开票也计入待付款
        return;
      }
      if (inv.status === 'issued') {
        issuedAmount += o.paidAmount;
        const pay = paymentMap.get(inv.no);
        if (pay && pay.status === 'paid') { paidAmount += o.paidAmount; }
        else { pendingPayment += o.paidAmount; }
      }
    });
    return { consumption, pendingInvoice, issuedAmount, pendingPayment, paidAmount };
  }, [filtered, invoiceMap, paymentMap]);

  const getStatus = (o: Order): { label: string; color: string } => {
    const inv = invoiceMap.get(o.orderNo);
    if (!inv || inv.status === 'cancelled') return { label: '待开票', color: 'gray' };
    if (inv.status === 'issuing' || inv.status === 'rejected') return { label: '开票中', color: 'arcoblue' };
    if (inv.status === 'issued') {
      const pay = paymentMap.get(inv.no);
      if (pay && pay.status === 'paid') return { label: '已付款', color: 'green' };
      return { label: '付款中', color: 'orangered' };
    }
    return { label: inv.status, color: 'gray' };
  };

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', width: 170, render: (v: string) => <a>{v}</a> },
    { title: '下单人', width: 100, render: (_: unknown, o: Order) => o.passengerName || '—' },
    { title: '订单类型', width: 90, render: (_: unknown, o: Order) => <Tag color={o.type === 'charter' ? 'arcoblue' : 'purple'} size="small">{o.type === 'charter' ? '包车' : '租车'}</Tag> },
    { title: '完成时间', width: 170, render: (_: unknown, o: Order) => o.rentalEnd || o.endTime || o.createdAt },
    { title: '订单金额', width: 110, render: (_: unknown, o: Order) => `¥${o.paidAmount.toLocaleString()}` },
    { title: '付款状态', width: 100, render: (_: unknown, o: Order) => { const s = getStatus(o); return <Tag color={s.color} size="small">{s.label}</Tag>; }},
    { title: '关联发票', width: 180, render: (_: unknown, o: Order) => invoiceMap.get(o.orderNo)?.no ? <a>{invoiceMap.get(o.orderNo)!.no}</a> : '—' },
    { title: '关联付款', width: 170, render: (_: unknown, o: Order) => {
      const inv = invoiceMap.get(o.orderNo);
      if (!inv) return '—';
      const pay = paymentMap.get(inv.no);
      return pay ? <a>{pay.no}</a> : '—';
    }},
  ];

  return (
    <div>
      <Title heading={5} style={{ margin: '0 0 16px' }}>企业账单</Title>

      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <RangePicker style={{ width: 280 }} placeholder={['完成时间起', '完成时间止']}
            onChange={(_, ds) => setTimeRange(ds && ds[0] && ds[1] ? ds as [string, string] : null)} />
          <div style={{ flex: 1 }} />
        </Space>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 16 }}>
        <Card size="small"><div style={{ color: '#86909c', fontSize: 13 }}>消费总额</div><div style={{ fontSize: 24, fontWeight: 700, color: '#165DFF' }}>¥{summary.consumption.toLocaleString()}</div></Card>
        <Card size="small"><div style={{ color: '#86909c', fontSize: 13 }}>待开票金额</div><div style={{ fontSize: 24, fontWeight: 700, color: '#86909c' }}>¥{summary.pendingInvoice.toLocaleString()}</div></Card>
        <Card size="small"><div style={{ color: '#86909c', fontSize: 13 }}>已开票金额</div><div style={{ fontSize: 24, fontWeight: 700, color: '#165DFF' }}>¥{summary.issuedAmount.toLocaleString()}</div></Card>
        <Card size="small"><div style={{ color: '#86909c', fontSize: 13 }}>待付款金额</div><div style={{ fontSize: 24, fontWeight: 700, color: '#FF7D00' }}>¥{summary.pendingPayment.toLocaleString()}</div></Card>
        <Card size="small"><div style={{ color: '#86909c', fontSize: 13 }}>已付款金额</div><div style={{ fontSize: 24, fontWeight: 700, color: '#00B42A' }}>¥{summary.paidAmount.toLocaleString()}</div></Card>
      </div>

      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 1200 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>
    </div>
  );
}
