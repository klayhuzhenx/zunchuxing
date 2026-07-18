import { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Select, Space, DatePicker,
} from '@arco-design/web-react';
import { orders as orderData, invoices, payments } from '../../data/mock';
import type { Order } from '../../types';

const { RangePicker } = DatePicker;

export default function BillList() {
  const [timeRange, setTimeRange] = useState<[string, string] | null>(null);
  const [enterpriseFilter, setEnterpriseFilter] = useState<string>('');

  // 仅企业额度支付订单
  const enterpriseOrders = useMemo(() =>
    orderData.filter(o => o.paymentMethod === 'enterprise_credit'),
  []);

  // 企业列表
  const enterpriseOptions = useMemo(() =>
    [...new Set(enterpriseOrders.map(o => o.enterpriseName).filter(Boolean))].map(n => ({ label: n!, value: n! })),
  [enterpriseOrders]);

  // 构建发票/回款映射
  const invoiceMap = useMemo(() => {
    const m = new Map<string, string>(); // orderNo → invoice applyNo
    invoices.forEach(i => i.orderNos.forEach(o => m.set(o, i.applyNo)));
    return m;
  }, []);
  const invoiceStatusMap = useMemo(() => {
    const m = new Map<string, string>(); // orderNo → invoice status
    invoices.forEach(i => i.orderNos.forEach(o => m.set(o, i.status)));
    return m;
  }, []);

  // 构建关联发票编号→关联回款状态
  const paymentMap = useMemo(() => {
    const m = new Map<string, { no: string; status: string }>(); // invoiceApplyNo → payment
    payments.forEach(p => m.set(p.invoiceApplyNo, { no: p.paymentNo, status: p.status }));
    return m;
  }, []);

  const filtered = useMemo(() => {
    let r = enterpriseOrders;
    if (timeRange) {
      const [s, e] = timeRange;
      const endDate = (o: Order) => (o.rentalEnd || o.endTime || o.createdAt).slice(0, 10);
      r = r.filter(o => { const d = endDate(o); return d >= s && d <= e; });
    }
    if (enterpriseFilter) r = r.filter(o => o.enterpriseName === enterpriseFilter);
    return r;
  }, [enterpriseOrders, timeRange, enterpriseFilter]);

  // 卡片计算：待开票=未申请+开票中；已开票=issued；待回款=全部未回款(含未开票)；已回款=完成
  const summary = useMemo(() => {
    let consumption = 0, pendingInvoice = 0, issuedAmount = 0, pendingPayment = 0, paidAmount = 0;
    filtered.forEach(o => {
      consumption += o.paidAmount;
      const invStatus = invoiceStatusMap.get(o.orderNo);
      if (!invStatus || invStatus === 'cancelled' || invStatus === 'issuing' || invStatus === 'rejected') {
        pendingInvoice += o.paidAmount;
        pendingPayment += o.paidAmount; // 未开票也计入待回款
      } else if (invStatus === 'issued') {
        issuedAmount += o.paidAmount;
        const p = paymentMap.get(invoiceMap.get(o.orderNo) || '');
        if (p && p.status === 'completed') {
          paidAmount += o.paidAmount;
        } else {
          pendingPayment += o.paidAmount;
        }
      }
    });
    return { consumption, pendingInvoice, issuedAmount, pendingPayment, paidAmount };
  }, [filtered, invoiceStatusMap, invoiceMap, paymentMap]);

  // 回款状态
  const getBillStatus = (o: Order): { label: string; color: string } => {
    const invStatus = invoiceStatusMap.get(o.orderNo);
    if (!invStatus || invStatus === 'cancelled') return { label: '待开票', color: 'gray' };
    if (invStatus === 'issuing' || invStatus === 'rejected') return { label: '开票中', color: 'arcoblue' };
    // issued
    const invNo = invoiceMap.get(o.orderNo) || '';
    const p = paymentMap.get(invNo);
    if (p && p.status === 'completed') return { label: '已回款', color: 'green' };
    if (p && p.status === 'verifying') return { label: '回款核实中', color: 'arcoblue' };
    return { label: '待回款', color: 'orangered' };
  };

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', width: 170, render: (v: string) => <a>{v}</a> },
    { title: '企业名称', width: 200, render: (_: unknown, o: Order) => o.enterpriseName || '—' },
    { title: '下单人', width: 100, render: (_: unknown, o: Order) => o.passengerName || '—' },
    { title: '订单类型', width: 90, render: (_: unknown, o: Order) => <Tag color={o.type === 'charter' ? 'arcoblue' : 'purple'} size="small">{o.type === 'charter' ? '包车' : '租车'}</Tag> },
    { title: '完成时间', width: 170, render: (_: unknown, o: Order) => o.rentalEnd || o.endTime || o.createdAt },
    { title: '订单金额', width: 110, render: (_: unknown, o: Order) => `¥${o.paidAmount.toLocaleString()}` },
    { title: '状态', width: 100, render: (_: unknown, o: Order) => {
      const s = getBillStatus(o);
      return <Tag color={s.color} size="small">{s.label}</Tag>;
    }},
    { title: '关联发票', width: 180, render: (_: unknown, o: Order) => {
      const invNo = invoiceMap.get(o.orderNo);
      const invStatus = invoiceStatusMap.get(o.orderNo);
      return (invNo && invStatus === 'issued') ? <a>{invNo}</a> : '—';
    }},
    { title: '关联回款', width: 160, render: (_: unknown, o: Order) => {
      const invNo = invoiceMap.get(o.orderNo);
      if (!invNo) return '—';
      const p = paymentMap.get(invNo);
      return p ? <a>{p.no}</a> : '—';
    }},
  ];

  return (
    <div>
      {/* 筛选 */}
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <RangePicker style={{ width: 280 }} placeholder={['完成时间起', '完成时间止']}
            onChange={(_, ds) => setTimeRange(ds && ds[0] && ds[1] ? ds as [string, string] : null)} />
          <Select placeholder="企业" style={{ width: 240 }} value={enterpriseFilter || undefined}
            onChange={v => setEnterpriseFilter(v || '')} allowClear showSearch options={enterpriseOptions} />
          <div style={{ flex: 1 }} />
        </Space>
      </Card>

      {/* 汇总卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 16 }}>
        <Card size="small"><div style={{ color: '#86909c', fontSize: 13 }}>消费总额</div><div style={{ fontSize: 24, fontWeight: 700, color: '#165DFF' }}>¥{summary.consumption.toLocaleString()}</div></Card>
        <Card size="small"><div style={{ color: '#86909c', fontSize: 13 }}>待开票金额</div><div style={{ fontSize: 24, fontWeight: 700, color: '#86909c' }}>¥{summary.pendingInvoice.toLocaleString()}</div></Card>
        <Card size="small"><div style={{ color: '#86909c', fontSize: 13 }}>已开票金额</div><div style={{ fontSize: 24, fontWeight: 700, color: '#165DFF' }}>¥{summary.issuedAmount.toLocaleString()}</div></Card>
        <Card size="small"><div style={{ color: '#86909c', fontSize: 13 }}>待回款金额</div><div style={{ fontSize: 24, fontWeight: 700, color: '#FF7D00' }}>¥{summary.pendingPayment.toLocaleString()}</div></Card>
        <Card size="small"><div style={{ color: '#86909c', fontSize: 13 }}>已回款金额</div><div style={{ fontSize: 24, fontWeight: 700, color: '#00B42A' }}>¥{summary.paidAmount.toLocaleString()}</div></Card>
      </div>

      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 1400 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>
    </div>
  );
}
