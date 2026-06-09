import { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Input, Select, Space, Tabs, Drawer, Descriptions,
  Timeline, Empty, Message, Modal, DatePicker,
} from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { orders, driverOrders } from '../../data/mock';
import type { Order, OrderStatus, OrderType, PaymentMethod } from '../../types';
import DispatchModal from '../../components/DispatchModal';

const { RangePicker } = DatePicker;

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: max }, (_, i) => i < rating
        ? <IconStarFill key={i} style={{ color: '#F7BA1E', fontSize: 16 }} />
        : <IconStar key={i} style={{ color: '#e5e6eb', fontSize: 16 }} />
      )}
    </span>
  );
}


const statusMap: Record<OrderStatus, { label: string; color: string }> = {
  unpaid: { label: '待支付', color: 'orange' },
  pending_dispatch: { label: '待派车', color: 'red' },
  pending_start: { label: '待开始', color: 'arcoblue' },
  ongoing: { label: '行程中', color: 'cyan' },
  pending_extra: { label: '待补款', color: 'orangered' },
  completed: { label: '已完成', color: 'green' },
  cancelled: { label: '已取消', color: 'gray' },
};

const payMethodMap: Record<PaymentMethod, { label: string; color: string }> = {
  enterprise_credit: { label: '企业额度支付', color: 'arcoblue' },
  alipay: { label: '支付宝', color: 'blue' },
  wechat: { label: '微信', color: 'green' },
};

const driverOrderStatusMap: Record<string, { label: string; color: string }> = {
  not_started: { label: '未开始', color: 'arcoblue' },
  in_progress: { label: '进行中', color: 'cyan' },
  pending_settlement: { label: '待结算', color: 'orangered' },
  completed: { label: '已完成', color: 'green' },
  cancelled: { label: '已取消', color: 'gray' },
};

const statusTabs = [
  { key: 'all', label: '全部' }, { key: 'unpaid', label: '待支付' },
  { key: 'pending_dispatch', label: '待派车' }, { key: 'pending_start', label: '待开始' },
  { key: 'ongoing', label: '行程中' }, { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

export default function OrderList() {
  const [orderType, setOrderType] = useState<OrderType>('charter');
  const [activeTab, setActiveTab] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [payFilter, setPayFilter] = useState<string[]>([]);
  const [tripDateRange, setTripDateRange] = useState<[string, string] | null>(null);
  const [orderDateRange, setOrderDateRange] = useState<[string, string] | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [dispatchVisible, setDispatchVisible] = useState(false);
  const [data, setData] = useState<Order[]>(orders);

  const filtered = useMemo(() => {
    let result = data.filter(o => o.type === orderType);
    if (activeTab !== 'all') {
      if (activeTab === 'unpaid') result = result.filter(o => o.status === 'unpaid' || o.status === 'pending_extra');
      else result = result.filter(o => o.status === activeTab);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(o =>
        o.orderNo.toLowerCase().includes(kw) || o.passengerName.toLowerCase().includes(kw) ||
        o.passengerPhone.includes(kw) || o.enterpriseName?.toLowerCase().includes(kw) ||
        o.driverName?.toLowerCase().includes(kw) || o.plateNo?.toLowerCase().includes(kw) ||
        (o.deliveryDriver || '').toLowerCase().includes(kw) || (o.pickupDriver || '').toLowerCase().includes(kw)
      );
    }
    if (payFilter.length > 0) result = result.filter(o => payFilter.includes(o.paymentMethod));
    if (tripDateRange) {
      const [s, e] = tripDateRange;
      result = result.filter(o => {
        const ts = o.type === 'charter' ? (o.startTime || '').split(' ')[0] : o.rentalStart || '';
        const te = o.type === 'charter' ? (o.endTime || '').split(' ')[0] : o.rentalEnd || '';
        return ts <= e && te >= s;
      });
    }
    if (orderDateRange) {
      const [s, e] = orderDateRange;
      result = result.filter(o => { const d = o.createdAt.split(' ')[0]; return d >= s && d <= e; });
    }
    return result;
  }, [data, orderType, activeTab, keyword, payFilter, tripDateRange, orderDateRange]);

  const openDetail = (r: Order) => { setSelectedOrder(r); setDrawerVisible(true); };
  const openDispatch = (r: Order) => { setSelectedOrder(r); setDispatchVisible(true); };

  const handleDispatchComplete = (orderId: string, schedules: { date: string; timeRange: string; vehiclePlate: string; vehicleModel: string; driverName?: string; driverPhone?: string }[]) => {
    const firstS = schedules[0];
    setData(data.map(o => o.id === orderId ? { ...o, status: 'pending_start' as OrderStatus, driverName: firstS.driverName, plateNo: firstS.vehiclePlate, carModel: firstS.vehicleModel, schedules } : o));
    setDispatchVisible(false); Message.success('派车成功');
  };

  const isCharter = orderType === 'charter';

  // === 包车列表字段 ===
  const charterColumns = [
    { title: '订单号', dataIndex: 'orderNo', width: 160, render: (v: string, r: Order) => <a onClick={() => openDetail(r)}>{v}</a> },
    { title: '类型', width: 70, render: () => <Tag color="arcoblue" size="small">包车</Tag> },
    { title: '下单人', width: 130, render: (_: unknown, r: Order) => `${r.passengerName || '—'} ${r.passengerPhone}` },
    { title: '支付方式', width: 110, render: (_: unknown, r: Order) => <Tag color={payMethodMap[r.paymentMethod].color} size="small">{payMethodMap[r.paymentMethod].label}</Tag> },
    { title: '用车时间', width: 200, render: (_: unknown, r: Order) => <div><div>{r.startTime} ~ {r.endTime?.split(' ')[1]}</div>{r.days > 1 && <Tag size="small" color="arcoblue" style={{ marginTop: 2 }}>{r.days}天</Tag>}</div> },
    { title: '上车地点', dataIndex: 'pickupAddress', width: 140, ellipsis: true },
    { title: '下车地点', dataIndex: 'dropoffAddress', width: 140, ellipsis: true },
    { title: '司机', width: 80, render: (_: unknown, r: Order) => r.driverName || <Tag color="red" size="small">待派车</Tag> },
    { title: '车辆', width: 120, render: (_: unknown, r: Order) => r.plateNo ? `${r.plateNo} ${r.carModel}` : '-' },
    { title: '金额', width: 90, render: (_: unknown, r: Order) => `¥${r.paidAmount.toLocaleString()}` },
    { title: '状态', width: 80, render: (_: unknown, r: Order) => <Tag color={statusMap[r.status].color} size="small">{statusMap[r.status].label}</Tag> },
    { title: '下单时间', dataIndex: 'createdAt', width: 140 },
    { title: '操作', width: 140, fixed: 'right' as const, render: (_: unknown, record: Order) => actionCol(record) },
  ];

  // === 租车列表字段（送车司机/收车司机） ===
  const rentalColumns = [
    { title: '订单号', dataIndex: 'orderNo', width: 160, render: (v: string, r: Order) => <a onClick={() => openDetail(r)}>{v}</a> },
    { title: '类型', width: 70, render: () => <Tag color="purple" size="small">租车</Tag> },
    { title: '下单人', width: 130, render: (_: unknown, r: Order) => `${r.passengerName || '—'} ${r.passengerPhone}` },
    { title: '支付方式', width: 110, render: (_: unknown, r: Order) => <Tag color={payMethodMap[r.paymentMethod].color} size="small">{payMethodMap[r.paymentMethod].label}</Tag> },
    { title: '租期', width: 170, render: (_: unknown, r: Order) => <div>{r.rentalStart} ~ {r.rentalEnd} <Tag size="small" color="purple" style={{ marginLeft: 4 }}>共{r.days}天</Tag></div> },
    { title: '取车地点', dataIndex: 'pickupAddress', width: 130, ellipsis: true },
    { title: '还车地点', dataIndex: 'dropoffAddress', width: 130, ellipsis: true },
    { title: '车辆', width: 110, render: (_: unknown, r: Order) => r.plateNo ? `${r.plateNo} ${r.carModel}` : '-' },
    { title: '送车司机', width: 80, render: (_: unknown, r: Order) => r.deliveryDriver || <Tag color="red" size="small">待派车</Tag> },
    { title: '收车司机', width: 80, render: (_: unknown, r: Order) => r.pickupDriver || '-' },
    { title: '金额', width: 90, render: (_: unknown, r: Order) => `¥${r.paidAmount.toLocaleString()}` },
    { title: '状态', width: 80, render: (_: unknown, r: Order) => <Tag color={statusMap[r.status].color} size="small">{statusMap[r.status].label}</Tag> },
    { title: '下单时间', dataIndex: 'createdAt', width: 140 },
    { title: '操作', width: 140, fixed: 'right' as const, render: (_: unknown, record: Order) => actionCol(record) },
  ];

  const actionCol = (record: Order) => (
    <Space size={4}>
      <Button type="text" size="small" onClick={() => openDetail(record)}>详情</Button>
      {record.status === 'pending_dispatch' && <Button type="text" size="small" status="warning" onClick={() => openDispatch(record)}>派车</Button>}
      {(record.status === 'pending_start' || record.status === 'ongoing') && <Button type="text" size="small" onClick={() => openDispatch(record)}>改派</Button>}
    </Space>
  );

  return (
    <div>
      <Tabs activeTab={orderType} onChange={v => { setOrderType(v as OrderType); setActiveTab('all'); }} style={{ marginBottom: 0 }} type="card-gutter">
        <Tabs.TabPane key="charter" title="包车订单" />
        <Tabs.TabPane key="rental" title="租车订单" />
      </Tabs>
      <Tabs activeTab={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }}>
        {statusTabs.map(t => <Tabs.TabPane key={t.key} title={t.label} />)}
      </Tabs>

      {/* 筛选：含车牌号、用车时间、下单时间 */}
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <Input prefix={<IconSearch />} placeholder="订单号/姓名/手机号/企业/车牌/司机" style={{ width: 280 }} value={keyword} onChange={setKeyword} allowClear />
          <Select placeholder="支付方式" style={{ width: 180 }} mode="multiple" value={payFilter} onChange={setPayFilter}
            options={[{ label: '企业额度支付', value: 'enterprise_credit' }, { label: '支付宝', value: 'alipay' }, { label: '微信', value: 'wechat' }]} />
          <RangePicker style={{ width: 260 }} placeholder={['用车时间起', '用车时间止']}
            onChange={(_, ds) => setTripDateRange(ds && ds[0] && ds[1] ? ds as [string, string] : null)} />
          <RangePicker style={{ width: 260 }} placeholder={['下单时间起', '下单时间止']}
            onChange={(_, ds) => setOrderDateRange(ds && ds[0] && ds[1] ? ds as [string, string] : null)} />
          {activeTab === 'unpaid' && <Select placeholder="子状态" style={{ width: 140 }} mode="multiple" options={[{ label: '待支付', value: 'unpaid' }, { label: '待补款', value: 'pending_extra' }]} />}
          <div style={{ flex: 1 }} />
        </Space>
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={isCharter ? charterColumns : rentalColumns} data={filtered} rowKey="id"
          scroll={{ x: isCharter ? 1700 : 1700 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>

      <Drawer width="60%" title={selectedOrder ? `订单详情 - ${selectedOrder.orderNo}` : '订单详情'}
        visible={drawerVisible} onCancel={() => setDrawerVisible(false)} footer={null}>
        {selectedOrder && <OrderDetailPanel order={selectedOrder} />}
      </Drawer>

      <DispatchModal visible={dispatchVisible} order={selectedOrder}
        onClose={() => setDispatchVisible(false)} onComplete={handleDispatchComplete} />
    </div>
  );
}

// ===== 订单详情面板 =====
function OrderDetailPanel({ order }: { order: Order }) {
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  const relatedDriverOrders = driverOrders.filter(d => d.orderId === order.id);
  const isCharter = order.type === 'charter';

  const handleSaveNote = () => {
    if (!noteText.trim()) { Message.warning('请输入备注内容'); return; }
    Message.success('备注已保存'); setShowNote(false); setNoteText('');
  };

  return (
    <div>
      {/* 基本信息（不展示状态，避免重复） */}
      <Card title="基本信息" style={{ marginBottom: 16 }} size="small">
        <Descriptions column={2} size="small" data={[
          { label: '订单号', value: order.orderNo },
          { label: '订单类型', value: <Tag color={isCharter ? 'arcoblue' : 'purple'} size="small">{isCharter ? '包车出行' : '租车出行'}</Tag> },
          ...(order.status === 'pending_extra' ? [{ label: '子状态', value: <Tag color="orangered" size="small">待补款</Tag> }] : []),
          { label: '下单时间', value: order.createdAt },
        ]} />
      </Card>

      {/* 下单人信息 */}
      <Card title="下单人信息" style={{ marginBottom: 16 }} size="small">
        <Descriptions column={2} size="small" data={[
          { label: '姓名', value: order.passengerName || '—' },
          { label: '手机号', value: order.passengerPhone },
          { label: '用户身份', value: order.userIdentity === 'enterprise_employee' ? <Tag color='arcoblue' size='small'>企业员工</Tag> : <Tag color='green' size='small'>个人</Tag> },
          ...(order.userIdentity === 'enterprise_employee' ? [{ label: '下单企业', value: order.enterpriseName || '-' }] : []),
          { label: '支付方式', value: payMethodMap[order.paymentMethod].label },
        ]} />
      </Card>

      {/* 用车信息 */}
      <Card title="用车信息" style={{ marginBottom: 16 }} size="small">
        <Descriptions column={2} size="small" data={
          isCharter ? [
            { label: '用车时段', value: `${order.startTime} ~ ${order.endTime}` },
            { label: '天数', value: `${order.days}天` },
            { label: '上车地点', value: order.pickupAddress },
            { label: '下车地点', value: order.dropoffAddress },
            ...(order.passengerCount ? [{ label: '人数', value: String(order.passengerCount) }] : []),
          ] : [
            { label: '租期', value: `${order.rentalStart} ~ ${order.rentalEnd}（共${order.days}天）` },
            { label: '取车地点', value: order.pickupAddress },
            { label: '还车地点', value: order.dropoffAddress },
          ]
        } />
      </Card>

      {/* 日程（包车） / 派车信息（租车） */}
      <Card title={isCharter ? '日程' : '派车信息'} style={{ marginBottom: 16 }} size="small">
        {isCharter ? (
          order.schedules && order.schedules.length > 0 ? (
            <Table columns={[
              { title: '日期', dataIndex: 'date', width: 100 },
              { title: '时段', dataIndex: 'timeRange', width: 110 },
              { title: '车辆', width: 150, render: (_: unknown, r: { vehiclePlate?: string; vehicleModel?: string }) => r.vehiclePlate ? `${r.vehiclePlate} ${r.vehicleModel}` : '-' },
              { title: '司机', width: 150, render: (_: unknown, r: { driverName?: string; driverPhone?: string }) => r.driverName ? `${r.driverName} ${r.driverPhone}` : '-' },
              { title: '出车单', width: 150, render: (_: unknown, row: { date: string }) => {
                const dr = relatedDriverOrders.find(d => d.tripDate === row.date);
                return dr ? <a>{dr.driverOrderNo}</a> : '-';
              }},
              { title: '状态', width: 80, render: (_: unknown, row: { date: string }) => {
                const dr = relatedDriverOrders.find(d => d.tripDate === row.date);
                if (!dr) return '-';
                const ds = driverOrderStatusMap[dr.status];
                return ds ? <Tag color={ds.color} size="small">{ds.label}</Tag> : dr.status;
              }},
            ]} data={order.schedules} rowKey="date" pagination={false} size="small" />
          ) : <Empty description={<Tag color="red">待派车</Tag>} />
        ) : (
          order.plateNo ? (
            <Descriptions column={2} size="small" data={[
              { label: '车辆', value: `${order.plateNo} ${order.carModel || ''}` },
              { label: '送车司机', value: order.deliveryDriver ? `${order.deliveryDriver} ${order.deliveryDriverPhone || ''}` : '-' },
              { label: '收车司机', value: order.pickupDriver ? `${order.pickupDriver} ${order.pickupDriverPhone || ''}` : '-' },
            ]} />
          ) : <Empty description={<Tag color="red">待派车</Tag>} />
        )}
      </Card>

      {/* 费用明细（无优惠字段） */}
      <Card title="费用明细" style={{ marginBottom: 16 }} size="small">
        <Descriptions column={2} size="small" data={[
          { label: '基础费', value: `¥${order.baseFee.toLocaleString()}` },
          { label: '超时费', value: order.overtimeFee > 0 ? <span style={{ color: '#F53F3F' }}>¥{order.overtimeFee}</span> : '¥0' },
          { label: '超里程费', value: order.overmileageFee > 0 ? <span style={{ color: '#F53F3F' }}>¥{order.overmileageFee}</span> : '¥0' },
          { label: '实付金额', value: <strong>¥{order.paidAmount.toLocaleString()}</strong> },
          ...(order.refundAmount > 0 ? [{ label: '退款金额', value: <span style={{ color: '#00B42A' }}>¥{order.refundAmount.toLocaleString()}</span> }] : []),
        ]} />
      </Card>

      {/* 支付与结算 */}
      <Card title="支付与结算" style={{ marginBottom: 16 }} size="small">
        <Descriptions column={2} size="small" data={[
          { label: '支付方式', value: payMethodMap[order.paymentMethod].label },
          { label: '支付时间', value: order.paymentTime || '-' },
        ]} />
      </Card>

      {/* 时间节点 */}
      <Card title="时间节点" style={{ marginBottom: 16 }} size="small">
        <Timeline>
          <Timeline.Item label={order.createdAt}>下单</Timeline.Item>
          {order.paymentTime && <Timeline.Item label={order.paymentTime}>支付</Timeline.Item>}
          {order.schedules && order.schedules.length > 0 && <Timeline.Item label="--">派车</Timeline.Item>}
          {order.status === 'ongoing' && <Timeline.Item label="--" dotColor="cyan">行程中</Timeline.Item>}
          {order.status === 'completed' && <Timeline.Item label="--" dotColor="green">已完成</Timeline.Item>}
          {order.status === 'cancelled' && <Timeline.Item label="--" dotColor="gray">已取消</Timeline.Item>}
        </Timeline>
      </Card>

      {/* 备注 + 操作 */}
      <Card title="备注" style={{ marginBottom: 16 }} size="small"
        extra={
          <Space>
            <Button size="small" onClick={() => setShowNote(!showNote)}>添加内部备注</Button>
          </Space>
        }>
        <Descriptions column={1} size="small" data={[
          { label: '乘客备注', value: order.passengerNote || <span style={{ color: '#86909c' }}>无</span> },
          { label: '内部备注', value: order.internalNote || <span style={{ color: '#86909c' }}>无</span> },
        ]} />
        {showNote && (
          <div style={{ marginTop: 12 }}>
            <Input.TextArea placeholder="请输入内部备注" value={noteText} onChange={setNoteText} rows={3} maxLength={200} showWordLimit />
            <Space style={{ marginTop: 8 }}><Button size="small" type="primary" onClick={handleSaveNote}>保存</Button><Button size="small" onClick={() => setShowNote(false)}>取消</Button></Space>
          </div>
        )}
      </Card>

      {/* 用户评价 */}
      {order.review && (
        <Card title="用户评价" style={{ marginBottom: 16 }} size="small">
          <Descriptions column={2} size="small" data={[
            { label: '司机评分', value: <StarRating rating={order.review.driverRating} /> },
            { label: '车辆评分', value: <StarRating rating={order.review.vehicleRating} /> },
            { label: '服务评分', value: <StarRating rating={order.review.serviceRating} /> },
            ...(order.review.comment ? [{ label: '评价内容', value: order.review.comment }] : []),
          ]} />
        </Card>
      )}

    </div>
  );
}
