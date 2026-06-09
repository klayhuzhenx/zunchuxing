import { useState } from 'react';
import { Card, Table, Tag, Typography, Tabs, Select, Input, Space, DatePicker } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { mockOrders } from '../../data/mock';
import type { Order, OrderStatus, OrderType } from '../../types';
import OrderDetail from './OrderDetail';

const { Title } = Typography;
const TabPane = Tabs.TabPane;

const statusMap: Record<string, { label: string; color: string }> = {
  unpaid: { label: '待支付', color: 'orange' },
  pending_dispatch: { label: '待派车', color: 'blue' },
  pending_start: { label: '待开始', color: 'cyan' },
  ongoing: { label: '行程中', color: 'green' },
  completed: { label: '已完成', color: 'gray' },
  cancelled: { label: '已取消', color: 'red' },
  pending_extra: { label: '待补款', color: 'red' },
};

const statusTabs: { key: string; label: string }[] = [
  { key: 'all', label: '全部' }, { key: 'unpaid', label: '待支付' },
  { key: 'pending_dispatch', label: '待派车' }, { key: 'pending_start', label: '待开始' },
  { key: 'ongoing', label: '行程中' }, { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

export default function OrderList() {
  const [orderType, setOrderType] = useState<OrderType>('charter');
  const [statusTab, setStatusTab] = useState('all');
  const [detailId, setDetailId] = useState<string | null>(null);

  const orders = mockOrders.filter(o => {
    if (o.type !== orderType) return false;
    if (statusTab !== 'all' && o.status !== statusTab) return false;
    return true;
  });

  const charterColumns = [
    { title: '订单号', dataIndex: 'orderNo', width: 170, render: (v: string) => <Button type='text' size='small' style={{ color: '#165DFF', padding: 0 }} onClick={() => setDetailId(v)}>{v}</Button> },
    { title: '类型', dataIndex: 'type', width: 70, render: () => <Tag size="small" color="gold">包车</Tag> },
    { title: '用车人', dataIndex: 'passengerName', width: 80 },
    { title: '用车时间', width: 160, render: (_: unknown, r: Order) => <span style={{ fontSize: 13 }}>{r.startTime?.split(' ')[0]} ~ {r.endTime?.split(' ')[0]} {r.days ? `${r.days}天` : ''}</span> },
    { title: '上车地点', dataIndex: 'pickupAddress', width: 140, ellipsis: true },
    { title: '下车地点', dataIndex: 'dropoffAddress', width: 140, ellipsis: true },
    { title: '司机', dataIndex: 'driverName', width: 80, render: (v?: string) => v || <Tag size="small" color="red">待派车</Tag> },
    { title: '车辆', width: 120, render: (_: unknown, r: Order) => r.plateNo ? `${r.plateNo} · ${r.carModel || ''}` : '—' },
    { title: '金额', width: 90, render: (_: unknown, r: Order) => <span style={{ fontWeight: 500 }}>¥{r.paidAmount.toLocaleString()}</span> },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => {
      const s = statusMap[v] || { label: v, color: 'gray' };
      return <Tag size="small" color={s.color}>{s.label}</Tag>;
    }},
    { title: '下单时间', dataIndex: 'createdAt', width: 140 },
  ];

  const rentalColumns = [
    { title: '订单号', dataIndex: 'orderNo', width: 170, render: (v: string) => <Button type='text' size='small' style={{ color: '#165DFF', padding: 0 }} onClick={() => setDetailId(v)}>{v}</Button> },
    { title: '类型', dataIndex: 'type', width: 70, render: () => <Tag size="small" color="gray">租车</Tag> },
    { title: '用车人', dataIndex: 'passengerName', width: 80 },
    { title: '租期', width: 190, render: (_: unknown, r: Order) => <span style={{ fontSize: 13 }}>{r.rentalStart} ~ {r.rentalEnd} · {r.rentalStart && r.rentalEnd ? Math.ceil((new Date(r.rentalEnd).getTime() - new Date(r.rentalStart).getTime()) / 86400000) : 0}天</span> },
    { title: '取车地点', dataIndex: 'pickupAddr', width: 120, ellipsis: true },
    { title: '还车地点', dataIndex: 'returnAddr', width: 120, ellipsis: true },
    { title: '送车司机', dataIndex: 'deliveryDriver', width: 80, render: (v?: string) => v || <Tag size="small" color="red">待派车</Tag> },
    { title: '车辆', width: 120, render: (_: unknown, r: Order) => r.plateNo ? `${r.plateNo} · ${r.carModel || ''}` : '—' },
    { title: '金额', width: 90, render: (_: unknown, r: Order) => <span style={{ fontWeight: 500 }}>¥{r.paidAmount.toLocaleString()}</span> },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => {
      const s = statusMap[v] || { label: v, color: 'gray' };
      return <Tag size="small" color={s.color}>{s.label}</Tag>;
    }},
    { title: '下单时间', dataIndex: 'createdAt', width: 140 },
  ];

  return (
    <div>
      <Title heading={5} style={{ margin: '0 0 16px' }}>订单管理</Title>
      <Card>
        <Tabs activeTab={orderType} onChange={(v) => { setOrderType(v as OrderType); setStatusTab('all'); }}>
          <TabPane key="charter" title="包车订单" />
          <TabPane key="rental" title="租车订单" />
        </Tabs>

        <Space style={{ marginBottom: 16 }} size="medium" wrap>
          <Select placeholder="员工" allowClear style={{ width: 160 }} options={[
            { label: '张先生', value: '张先生' }, { label: '李女士', value: '李女士' }, { label: '王先生', value: '王先生' },
          ]} />
          <DatePicker.RangePicker style={{ width: 260 }} placeholder={['用车开始', '用车结束']} />
          <Input prefix={<IconSearch />} placeholder="订单号" style={{ width: 200 }} allowClear />
        </Space>

        <Tabs activeTab={statusTab} onChange={setStatusTab} type="rounded" style={{ marginBottom: 16 }}>
          {statusTabs.map(t => <TabPane key={t.key} title={t.label} />)}
        </Tabs>

        {orders.length > 0 ? (
          <Table columns={orderType === 'charter' ? charterColumns : rentalColumns} data={orders} rowKey="id" pagination={false} size="small" scroll={{ x: orderType === 'charter' ? 1300 : 1200 }} />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#86909c' }}>暂无订单记录</div>
        )}
      </Card>

      {detailId && <OrderDetail orderNo={detailId} orders={mockOrders} onClose={() => setDetailId(null)} />}
    </div>
  );
}
