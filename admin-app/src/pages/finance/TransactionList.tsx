import { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Input, Select, Space, Drawer, Descriptions, DatePicker,
} from '@arco-design/web-react';
import { IconSearch, IconDownload } from '@arco-design/web-react/icon';
import { transactions } from '../../data/mock';
import type { Transaction, TransactionType } from '../../types';

const { RangePicker } = DatePicker;

const typeMap: Record<TransactionType, { label: string; color: string }> = {
  payment: { label: '支付', color: 'green' },
  refund: { label: '退款', color: 'red' },
  extra_payment: { label: '补款', color: 'arcoblue' },
};

const statusMap: Record<string, { label: string; color: string }> = {
  success: { label: '成功', color: 'green' },
  failed: { label: '失败', color: 'red' },
  processing: { label: '处理中', color: 'orange' },
};

const payMethodLabel: Record<string, string> = {
  enterprise_credit: '企业额度支付',
  alipay: '支付宝',
  wechat: '微信',
};

export default function TransactionList() {
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [methodFilter, setMethodFilter] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<[string, string] | null>(null);
  const [minAmount, setMinAmount] = useState<number | undefined>();
  const [maxAmount, setMaxAmount] = useState<number | undefined>();
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const filtered = useMemo(() => {
    let r = transactions;
    if (typeFilter.length > 0) r = r.filter(t => typeFilter.includes(t.type));
    if (methodFilter.length > 0) r = r.filter(t => methodFilter.includes(t.paymentMethod));
    if (timeRange) {
      const [s, e] = timeRange;
      r = r.filter(t => t.time >= s && t.time <= e + ' 23:59:59');
    }
    if (minAmount !== undefined) r = r.filter(t => Math.abs(t.amount) >= minAmount);
    if (maxAmount !== undefined) r = r.filter(t => Math.abs(t.amount) <= maxAmount);
    if (keyword) {
      const kw = keyword.toLowerCase();
      r = r.filter(t =>
        t.txnNo.toLowerCase().includes(kw) || t.orderNo.toLowerCase().includes(kw) ||
        t.party.toLowerCase().includes(kw)
      );
    }
    return r;
  }, [keyword, typeFilter, methodFilter, timeRange, minAmount, maxAmount]);

  const payTotal = filtered.filter(t => t.type !== 'refund').reduce((s, t) => s + t.amount, 0);
  const refundTotal = filtered.filter(t => t.type === 'refund').reduce((s, t) => s + Math.abs(t.amount), 0);
  const netIncome = payTotal - refundTotal;

  const columns = [
    { title: '流水号', dataIndex: 'txnNo', width: 170, render: (v: string, r: Transaction) => <a onClick={() => { setSelected(r); setDrawerVisible(true); }}>{v}</a> },
    { title: '关联订单', dataIndex: 'orderNo', width: 160 },
    { title: '交易类型', width: 90, render: (_: unknown, r: Transaction) => <Tag color={typeMap[r.type].color} size="small">{typeMap[r.type].label}</Tag> },
    { title: '支付方式', width: 120, render: (_: unknown, r: Transaction) => payMethodLabel[r.paymentMethod] || r.paymentMethod },
    { title: '金额', width: 110, render: (_: unknown, r: Transaction) => (
      <span style={{ color: r.amount < 0 ? '#F53F3F' : '#1D2129', fontWeight: 500 }}>
        {r.amount < 0 ? '-' : ''}¥{Math.abs(r.amount).toLocaleString()}
      </span>
    )},
    { title: '交易方', dataIndex: 'party', width: 180, ellipsis: true },
    { title: '交易时间', dataIndex: 'time', width: 170 },
  ];

  return (
    <div>
      {/* 筛选 */}
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <Input prefix={<IconSearch />} placeholder="流水号/订单号/交易方" style={{ width: 240 }} value={keyword} onChange={setKeyword} allowClear />
          <Select placeholder="交易类型" style={{ width: 160 }} mode="multiple" value={typeFilter} onChange={setTypeFilter}
            options={Object.entries(typeMap).map(([k, v]) => ({ label: v.label, value: k }))} />
          <Select placeholder="支付方式" style={{ width: 180 }} mode="multiple" value={methodFilter} onChange={setMethodFilter}
            options={Object.entries(payMethodLabel).map(([k, v]) => ({ label: v, value: k }))} />
          <RangePicker style={{ width: 280 }} placeholder={['交易时间起', '交易时间止']}
            onChange={(_, ds) => setTimeRange(ds && ds[0] && ds[1] ? ds as [string, string] : null)} />
          <Input prefix="¥" placeholder="最小金额" style={{ width: 120 }} type="number" value={minAmount ?? ''} onChange={v => setMinAmount(v ? Number(v) : undefined)} />
          <Input prefix="¥" placeholder="最大金额" style={{ width: 120 }} type="number" value={maxAmount ?? ''} onChange={v => setMaxAmount(v ? Number(v) : undefined)} />
          <div style={{ flex: 1 }} />
          <Button icon={<IconDownload />}>导出</Button>
        </Space>
      </Card>

      {/* 汇总卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
        <Card size="small"><div style={{ color: '#86909c', fontSize: 13 }}>支付总额</div><div style={{ fontSize: 24, fontWeight: 700, color: '#00B42A' }}>¥{payTotal.toLocaleString()}</div></Card>
        <Card size="small"><div style={{ color: '#86909c', fontSize: 13 }}>退款总额</div><div style={{ fontSize: 24, fontWeight: 700, color: '#F53F3F' }}>¥{refundTotal.toLocaleString()}</div></Card>
        <Card size="small"><div style={{ color: '#86909c', fontSize: 13 }}>净收入</div><div style={{ fontSize: 24, fontWeight: 700 }}>¥{netIncome.toLocaleString()}</div></Card>
      </div>

      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 1100 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>

      {/* 详情抽屉 */}
      <Drawer width="40%" title={selected ? `流水详情 - ${selected.txnNo}` : '流水详情'}
        visible={drawerVisible} onCancel={() => setDrawerVisible(false)} footer={null}>
        {selected && (
          <Descriptions column={1} size="small" data={[
            { label: '流水号', value: selected.txnNo },
            { label: '关联订单', value: selected.orderNo },
            { label: '交易类型', value: <Tag color={typeMap[selected.type].color} size="small">{typeMap[selected.type].label}</Tag> },
            { label: '支付方式', value: payMethodLabel[selected.paymentMethod] || selected.paymentMethod },
            { label: '金额', value: <span style={{ color: selected.amount < 0 ? '#F53F3F' : '#1D2129', fontWeight: 600 }}>{selected.amount < 0 ? '-' : ''}¥{Math.abs(selected.amount).toLocaleString()}</span> },
            { label: '交易方', value: selected.party },
            { label: '交易时间', value: selected.time },
            { label: '状态', value: <Tag color={statusMap[selected.status].color} size="small">{statusMap[selected.status].label}</Tag> },
          ]} />
        )}
      </Drawer>
    </div>
  );
}
