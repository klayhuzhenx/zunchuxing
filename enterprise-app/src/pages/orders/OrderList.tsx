import { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Input, Select, Space, Tabs, Drawer, Descriptions,
  Timeline, Empty, Message, DatePicker, Typography, Modal, Image,
} from '@arco-design/web-react';
import { IconSearch, IconStarFill, IconStar } from '@arco-design/web-react/icon';
import { mockOrders } from '../../data/mock';
import type { Order, OrderStatus, OrderType, PaymentMethod } from '../../types';

const { Title } = Typography;
const { RangePicker } = DatePicker;

// ===== 星评 =====
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

// ===== 常量 =====
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

const statusTabs = [
  { key: 'all', label: '全部' }, { key: 'unpaid', label: '待支付' },
  { key: 'pending_start', label: '待开始' },
  { key: 'ongoing', label: '进行中' }, { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

// ===== 主组件 =====
export default function OrderList() {
  const [orderType, setOrderType] = useState<OrderType>('charter');
  const [activeTab, setActiveTab] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState<string>('');
  const [tripDateRange, setTripDateRange] = useState<[string, string] | null>(null);
  const [orderDateRange, setOrderDateRange] = useState<[string, string] | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const data = mockOrders;

  const filtered = useMemo(() => {
    let result = data.filter(o => o.type === orderType);
    if (activeTab !== 'all') {
      if (activeTab === 'unpaid') result = result.filter(o => o.status === 'unpaid' || o.status === 'pending_extra');
      else if (activeTab === 'pending_start') result = result.filter(o => o.status === 'pending_dispatch' || o.status === 'pending_start');
      else result = result.filter(o => o.status === activeTab);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(o => o.orderNo.toLowerCase().includes(kw));
    }
    if (employeeFilter) {
      result = result.filter(o =>
        o.passengerName.includes(employeeFilter) || o.passengerPhone.includes(employeeFilter)
      );
    }
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
      result = result.filter(o => {
        const d = o.createdAt.split(' ')[0];
        return d >= s && d <= e;
      });
    }
    return result;
  }, [data, orderType, activeTab, keyword, employeeFilter, tripDateRange, orderDateRange]);

  const openDetail = (r: Order) => { setSelectedOrder(r); setDrawerVisible(true); };
  const isCharter = orderType === 'charter';

  const actionColumn = {
    title: '操作', width: 70, fixed: 'right' as const,
    render: (_: unknown, r: Order) => (
      <Button type="text" size="small" onClick={() => openDetail(r)}>详情</Button>
    ),
  };

  const charterColumns = [
    { title: '订单号', dataIndex: 'orderNo', width: 170, render: (v: string, r: Order) => <a onClick={() => openDetail(r)} style={{ color: '#165DFF', cursor: 'pointer' }}>{v}</a> },
    { title: '类型', width: 70, render: () => <Tag color="arcoblue" size="small">包车</Tag> },
    { title: '用车人', width: 100, render: (_: unknown, r: Order) => `${r.passengerName || '—'} ${r.passengerPhone}` },
    { title: '用车时间', width: 200, render: (_: unknown, r: Order) => <div>{r.startTime} ~ {r.endTime?.split(' ')[1]}{r.days && r.days > 1 && <Tag size="small" color="arcoblue" style={{ marginLeft: 4 }}>{r.days}天</Tag>}</div> },
    { title: '上车地点', dataIndex: 'pickupAddress', width: 130, ellipsis: true },
    { title: '下车地点', dataIndex: 'dropoffAddress', width: 130, ellipsis: true },
    { title: '司机', width: 80, render: (_: unknown, r: Order) => r.driverName || '-' },
    { title: '车辆', width: 120, render: (_: unknown, r: Order) => r.plateNo ? `${r.plateNo} ${r.carModel}` : '—' },
    { title: '金额', width: 100, render: (_: unknown, r: Order) => `¥${r.paidAmount.toLocaleString()}` },
    { title: '状态', width: 80, render: (_: unknown, r: Order) => <Tag color={statusMap[r.status].color} size="small">{statusMap[r.status].label}</Tag> },
    { title: '下单时间', dataIndex: 'createdAt', width: 140 },
    actionColumn,
  ];

  const rentalColumns = [
    { title: '订单号', dataIndex: 'orderNo', width: 170, render: (v: string, r: Order) => <a onClick={() => openDetail(r)} style={{ color: '#165DFF', cursor: 'pointer' }}>{v}</a> },
    { title: '类型', width: 70, render: () => <Tag color="purple" size="small">租车</Tag> },
    { title: '用车人', width: 100, render: (_: unknown, r: Order) => `${r.passengerName || '—'} ${r.passengerPhone}` },
    { title: '租期', width: 170, render: (_: unknown, r: Order) => <div>{r.rentalStart} ~ {r.rentalEnd} {r.days && <Tag size="small" color="purple" style={{ marginLeft: 4 }}>共{r.days}天</Tag>}</div> },
    { title: '取车地点', dataIndex: 'pickupAddress', width: 120, ellipsis: true, render: (v: string) => v || '—' },
    { title: '还车地点', dataIndex: 'dropoffAddress', width: 120, ellipsis: true, render: (v: string) => v || '—' },
    { title: '车辆', width: 110, render: (_: unknown, r: Order) => r.plateNo ? `${r.plateNo} ${r.carModel}` : '—' },
    { title: '送车司机', width: 80, render: (_: unknown, r: Order) => r.deliveryDriver || '-' },
    { title: '收车司机', width: 80, render: (_: unknown, r: Order) => r.pickupDriver || '—' },
    { title: '金额', width: 100, render: (_: unknown, r: Order) => `¥${r.paidAmount.toLocaleString()}` },
    { title: '状态', width: 80, render: (_: unknown, r: Order) => <Tag color={statusMap[r.status].color} size="small">{statusMap[r.status].label}</Tag> },
    { title: '下单时间', dataIndex: 'createdAt', width: 140 },
    actionColumn,
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Title heading={5} style={{ margin: 0 }}>订单管理</Title>
      </div>
      <Tabs activeTab={orderType} onChange={v => { setOrderType(v as OrderType); setActiveTab('all'); }} style={{ marginBottom: 0 }} type="card-gutter">
        <Tabs.TabPane key="charter" title="包车订单" />
        <Tabs.TabPane key="rental" title="租车订单" />
      </Tabs>
      <Tabs activeTab={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }}>
        {statusTabs.map(t => <Tabs.TabPane key={t.key} title={t.label} />)}
      </Tabs>
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <Input prefix={<IconSearch />} placeholder="订单号" style={{ width: 220 }} value={keyword} onChange={setKeyword} allowClear />
          <Select placeholder="员工" style={{ width: 160 }} value={employeeFilter || undefined} onChange={v => setEmployeeFilter(v || '')} allowClear showSearch
            options={[...new Set(data.map(o => o.passengerName))].filter(Boolean).map(n => ({ label: n, value: n }))} />
          <RangePicker style={{ width: 260 }} placeholder={['用车时间起', '用车时间止']}
            onChange={(_, ds) => setTripDateRange(ds && ds[0] && ds[1] ? ds as [string, string] : null)} />
          <RangePicker style={{ width: 260 }} placeholder={['下单时间起', '下单时间止']}
            onChange={(_, ds) => setOrderDateRange(ds && ds[0] && ds[1] ? ds as [string, string] : null)} />
        </Space>
      </Card>
      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={isCharter ? charterColumns : rentalColumns} data={filtered} rowKey="id"
          scroll={{ x: isCharter ? 1700 : 1600 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>
      <Drawer width="60%" title={selectedOrder ? `订单详情 - ${selectedOrder.orderNo}` : '订单详情'}
        visible={drawerVisible} onCancel={() => setDrawerVisible(false)} footer={null}>
        {selectedOrder && <OrderDetailPanel order={selectedOrder} />}
      </Drawer>
    </div>
  );
}

// ===== 提示条配置 =====
interface AlertCfg { color: string; bg: string; title: string; body: (o: Order) => string }

const charterAlert: Record<string, AlertCfg> = {
  unpaid: { color: '#FF7D00', bg: '#FFF7E8', title: '等待支付', body: () => '订单已提交，等待员工完成支付' },
  pending_dispatch: { color: '#FF7D00', bg: '#FFF7E8', title: '等待派车', body: () => '运营正在安排车辆与司机，请您耐心等待' },
  pending_start: { color: '#165DFF', bg: '#E8F3FF', title: '行程待开始', body: (o) => `车辆和司机已确认：${o.driverName} · ${o.plateNo}` },
  ongoing: { color: '#00B42A', bg: '#E8FFEA', title: '行程进行中', body: (o) => `${o.driverName} · ${o.plateNo}，当前行程进行中` },
  completed: { color: '#00B42A', bg: '#E8FFEA', title: '行程已完成', body: () => '感谢使用尊出行，欢迎再次出行' },
  cancelled: { color: '#F53F3F', bg: '#FFECE8', title: '订单已取消', body: (o) => o.cancelReason || '已取消' },
  pending_extra: { color: '#F53F3F', bg: '#FFECE8', title: '差额待付', body: (o) => `行程结束产生额外费用 ¥${(o.baseFee + o.overtimeFee + o.overmileageFee - o.paidAmount).toLocaleString()}，等待员工完成补款` },
};

const rentalAlert: Record<string, AlertCfg> = {
  unpaid: { color: '#FF7D00', bg: '#FFF7E8', title: '等待支付', body: () => '订单已提交，等待员工完成支付' },
  pending_dispatch: { color: '#FF7D00', bg: '#FFF7E8', title: '等待派车', body: () => '运营正在安排送车司机与车辆' },
  pending_start: { color: '#165DFF', bg: '#E8F3FF', title: '车辆已送达取车点', body: (o) => o.plateNo ? `车辆已送达取车点：${o.plateNo} · ${o.carModel}` : '运营正在安排送车，车辆送达后请前往取车点确认取车' },
  ongoing: { color: '#00B42A', bg: '#E8FFEA', title: '行程进行中', body: () => '车辆使用中，请在约定时间内还车' },
  completed: { color: '#00B42A', bg: '#E8FFEA', title: '行程已完成', body: () => '感谢使用尊出行' },
  cancelled: { color: '#F53F3F', bg: '#FFECE8', title: '订单已取消', body: (o) => o.cancelReason || '已取消' },
  pending_extra: { color: '#F53F3F', bg: '#FFECE8', title: '差额待付', body: (o) => `行程结束产生额外费用 ¥${(o.baseFee + o.overtimeFee + o.overmileageFee - o.paidAmount).toLocaleString()}，等待员工完成补款` },
};

// ===== 订单动态 =====
function buildCharterTimeline(order: Order): { label: string; dot: string }[] {
  const items: { label: string; dot: string }[] = [];
  if (order.status === 'cancelled') {
    items.push({ label: `订单已取消${order.cancelReason ? ' (' + order.cancelReason + ')' : ''}`, dot: 'red' });
    if (order.paymentTime) items.push({ label: `支付成功 · ${order.paymentTime}`, dot: 'green' });
    items.push({ label: `订单已提交 · ${order.createdAt}`, dot: 'gray' });
    return items;
  }
  if (order.status === 'pending_extra') {
    items.push({ label: `行程结束（有待补款 ¥${(order.baseFee + order.overtimeFee + order.overmileageFee - order.paidAmount).toLocaleString()}）`, dot: 'red' });
  }
  if (order.status === 'completed') {
    items.push({ label: '行程结束', dot: 'green' });
  }
  if (['ongoing', 'completed', 'pending_extra'].includes(order.status)) {
    items.push({ label: '行程开始', dot: 'green' });
  }
  if (order.driverName && order.plateNo && ['pending_start', 'ongoing', 'completed', 'pending_extra'].includes(order.status)) {
    items.push({ label: `已派车 · ${order.carModel} ${order.plateNo} · ${order.driverName}`, dot: 'blue' });
  }
  if (order.paymentTime) items.push({ label: `支付成功 · ${order.paymentTime}`, dot: 'green' });
  items.push({ label: `订单已提交 · ${order.createdAt}`, dot: 'gray' });
  return items;
}

function buildRentalTimeline(order: Order): { label: string; dot: string }[] {
  const items: { label: string; dot: string }[] = [];
  if (order.status === 'cancelled') {
    items.push({ label: `订单已取消${order.cancelReason ? ' (' + order.cancelReason + ')' : ''}`, dot: 'red' });
    if (order.paymentTime) items.push({ label: `支付成功 · ${order.paymentTime}`, dot: 'green' });
    items.push({ label: `订单已提交 · ${order.createdAt}`, dot: 'gray' });
    return items;
  }
  if (order.status === 'pending_extra') {
    items.push({ label: `已还车（有待补款 ¥${(order.baseFee + order.overtimeFee + order.overmileageFee - order.paidAmount).toLocaleString()}）`, dot: 'red' });
  }
  if (order.status === 'completed') items.push({ label: '已还车', dot: 'green' });
  if (['ongoing', 'completed', 'pending_extra'].includes(order.status)) {
    items.push({ label: '已确认取车', dot: 'green' });
  }
  if (order.plateNo && ['pending_start', 'ongoing', 'completed', 'pending_extra'].includes(order.status)) {
    items.push({ label: '车辆已送达取车点', dot: 'blue' });
  }
  if (order.deliveryDriver && ['pending_start', 'ongoing', 'completed', 'pending_extra'].includes(order.status)) {
    items.push({ label: `送车已派发 · ${order.deliveryDriver} · ${order.plateNo} · ${order.carModel}`, dot: 'blue' });
  }
  if (order.paymentTime) items.push({ label: `支付成功 · ${order.paymentTime}`, dot: 'green' });
  items.push({ label: `订单已提交 · ${order.createdAt}`, dot: 'gray' });
  return items;
}

// ===== 费用明细弹出层 =====
function FeeDetailSheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: 600, maxHeight: '80vh', background: '#FFF',
        borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#1A1C1C' }}>{title}</span>
          <div onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: '#F2F2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: 18, color: '#4C4546' }}>✕</span>
          </div>
        </div>
        <div style={{ padding: '0 24px 32px', overflow: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ===== 详情面板 =====
function OrderDetailPanel({ order }: { order: Order }) {
  const isCharter = order.type === 'charter';
  const alertCfg: AlertCfg = isCharter ? (charterAlert[order.status] || charterAlert.unpaid) : (rentalAlert[order.status] || rentalAlert.unpaid);
  const timeline = isCharter ? buildCharterTimeline(order) : buildRentalTimeline(order);
  const dotColors: Record<string, string> = { green: '#00B42A', red: '#F53F3F', blue: '#165DFF', gray: '#86909C' };

  const beforeDispatch = ['unpaid', 'pending_dispatch'].includes(order.status);
  const hasExtra = order.overtimeFee > 0 || order.overmileageFee > 0 || (order.feeExtraDetail?.otherFees && order.feeExtraDetail.otherFees.length > 0);
  const showFullFee = ['completed', 'pending_extra', 'ongoing'].includes(order.status);

  // 费用明细弹窗
  const [feeModal, setFeeModal] = useState<{ visible: boolean; type: 'waiting' | 'overtime' | 'mileage' | 'other' }>({ visible: false, type: 'overtime' });

  const feeRowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' };

  return (
    <div>
      {/* 提示条 */}
      <div style={{
        background: alertCfg.bg, borderLeft: `3px solid ${alertCfg.color}`,
        padding: '12px 16px', borderRadius: '0 6px 6px 0', marginBottom: 16,
      }}>
        <strong style={{ color: alertCfg.color }}>{alertCfg.title}</strong>
        <div style={{ color: '#4E5969', fontSize: 13, marginTop: 4 }}>{alertCfg.body(order)}</div>
      </div>

      {/* 基本信息 */}
      <Card title="基本信息" style={{ marginBottom: 16 }} size="small">
        <Descriptions column={2} size="small" data={[
          { label: '订单号', value: order.orderNo },
          { label: '订单类型', value: <Tag color={isCharter ? 'arcoblue' : 'purple'} size="small">{isCharter ? '包车出行' : '租车出行'}</Tag> },
          { label: '订单状态', value: <Tag color={statusMap[order.status].color} size="small">{statusMap[order.status].label}{order.subStatus ? ` · ${order.subStatus}` : ''}</Tag> },
          { label: '下单时间', value: order.createdAt },
        ]} />
      </Card>

      {/* 乘车人信息 */}
      <Card title="乘车人信息" style={{ marginBottom: 16 }} size="small">
        <Descriptions column={2} size="small" data={[
          { label: '姓名', value: order.passengerName || '—' },
          { label: '手机号', value: order.passengerPhone },
          ...(order.passengerRole ? [{ label: '角色', value: order.passengerRole }] : []),
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


          ] : [
            { label: '租期', value: `${order.rentalStart} ~ ${order.rentalEnd}${order.days ? `（共${order.days}天）` : ''}` },
            { label: '取车地点', value: order.pickupAddr || '—' },
            { label: '还车地点', value: order.returnAddr || '—' },
          ]
        } />
      </Card>

      {/* 车型套餐（包车）/ 车型信息（租车） */}
      <Card title={isCharter ? '车型套餐' : '车型信息'} style={{ marginBottom: 16 }} size="small">
        <Descriptions column={1} size="small" data={[
          { label: '车型', value: isCharter
            ? `${order.carModel || '待定'} · 尊享套餐（日租 / 8小时 / 100km）`
            : `${order.carModel || '待定'}（日租 / 8小时 / 100km）` },
          { label: isCharter ? '套餐价' : '日租价', value: `¥${order.baseFee.toLocaleString()} / 天` },
        ]} />
      </Card>

      {/* 驾驶人信息 — 仅租车 */}
      {!isCharter && (
        <Card title="驾驶人信息" style={{ marginBottom: 16 }} size="small">
          <Descriptions column={2} size="small" data={[
            { label: '姓名', value: order.passengerName || '—' },
            { label: '手机号', value: maskPhone(order.passengerPhone) },
            { label: '驾驶证类型', value: order.driverLicense || 'C1' },
            { label: '操作', value: <Button type="text" size="small" onClick={() => Message.info('驾驶证预览')}>查看驾驶证</Button> },
          ]} />
        </Card>
      )}

      {/* 日程与派车（包车）/ 派车信息（租车） */}
      {isCharter ? (
        <Card title="日程与派车" style={{ marginBottom: 16 }} size="small">
          {order.schedules && order.schedules.length > 0 ? (
            <Table columns={[
              { title: '日期', dataIndex: 'date', width: 70 },
              { title: '时段', dataIndex: 'timeRange', width: 110 },
              { title: '车辆', width: 140, render: (_: unknown, r: any) => r.vehiclePlate ? `${r.vehiclePlate} · ${r.vehicleModel}` : '—' },
              { title: '司机', width: 110, render: (_: unknown, r: any) => r.driverName ? `${r.driverName} ${r.driverPhone}` : '—' },
              { title: '状态', dataIndex: 'status', width: 70, render: (v: string) => {
                const m: Record<string, { l: string; c: string }> = { ongoing: { l: '进行中', c: 'green' }, not_started: { l: '未开始', c: 'gray' }, completed: { l: '已完成', c: 'gray' } };
                const s = m[v] || { l: v, c: 'gray' };
                return <Tag size="small" color={s.c}>{s.l}</Tag>;
              }},
            ]} data={order.schedules} rowKey="date" pagination={false} size="small" />
          ) : <Empty description={<Tag color="red">待派车</Tag>} />}
        </Card>
      ) : (
        <Card title="派车信息" style={{ marginBottom: 16 }} size="small">
          {order.plateNo ? (
            <div>
              <Descriptions column={2} size="small" data={[
                { label: '车辆', value: `${order.plateNo} · ${order.carModel || ''}` },
              ]} />
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ flex: 1, background: '#F7F8FA', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 12, color: '#86909c', marginBottom: 4 }}>送车司机</div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{order.deliveryDriver || '—'} {order.deliveryDriverPhone || ''}</div>
                    <Tag size="small" color={['pending_start','ongoing','completed','pending_extra'].includes(order.status) ? 'green' : 'arcoblue'} style={{ marginTop: 4 }}>
                      {['pending_start','ongoing','completed','pending_extra'].includes(order.status) ? '已送达' : '待送车'}
                    </Tag>
                  </div>
                  <div style={{ flex: 1, background: '#F7F8FA', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 12, color: '#86909c', marginBottom: 4 }}>收车司机</div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{order.pickupDriver || '—'} {order.pickupDriverPhone || ''}</div>
                    <Tag size="small" color={order.status === 'completed' ? 'green' : 'orangered'} style={{ marginTop: 4 }}>
                      {order.status === 'completed' ? '已收车' : '待收车'}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>
          ) : <Empty description={<Tag color="red">待派车</Tag>} />}
        </Card>
      )}

      {/* 费用明细（对齐乘客端） */}
      <Card title="费用明细" style={{ marginBottom: 16 }} size="small">
        {beforeDispatch ? (
          <div>
            <div style={feeRowStyle}>
              <span style={{ fontSize: 14, color: '#86868B' }}>{isCharter ? '套餐价' : '日租价'} ¥{order.baseFee.toLocaleString()} / 天</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>¥{order.paidAmount.toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div>
            <div style={feeRowStyle}>
              <span style={{ fontSize: 14, color: '#86868B' }}>{isCharter ? '套餐价' : '日租价'} ¥{order.baseFee.toLocaleString()} / 天</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#00B42A' }}>已支付 ¥{order.paidAmount.toLocaleString()}</span>
            </div>

            {/* 等待费 */}
            <div style={{ ...feeRowStyle, cursor: order.feeExtraDetail?.waitFee ? 'pointer' : 'default' }}
              onClick={() => { if (order.feeExtraDetail?.waitFee) setFeeModal({ visible: true, type: 'waiting' }); }}>
              <span style={{ fontSize: 14, color: order.feeExtraDetail?.waitFee ? '#F53F3F' : '#86868B' }}>
                等待费（超 15min 后 ¥1/min）
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: order.feeExtraDetail?.waitFee ? '#F53F3F' : '#000' }}>
                  {order.feeExtraDetail?.waitFee ? `¥${order.feeExtraDetail.waitFee.amount.toLocaleString()}` : '¥0'}
                </span>
                {order.feeExtraDetail?.waitFee && <span style={{ fontSize: 16, color: '#86868B' }}>›</span>}
              </span>
            </div>

            {/* 超时费 */}
            {showFullFee && (
              <div style={{ ...feeRowStyle, cursor: order.overtimeFee > 0 ? 'pointer' : 'default' }}
                onClick={() => { if (order.overtimeFee > 0) setFeeModal({ visible: true, type: 'overtime' }); }}>
                <span style={{ fontSize: 14, color: order.overtimeFee > 0 ? '#F53F3F' : '#86868B' }}>
                  超时费 · ¥100/h
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: order.overtimeFee > 0 ? '#F53F3F' : '#000' }}>
                    {order.overtimeFee > 0 ? `¥${order.overtimeFee.toLocaleString()}` : '¥0'}
                  </span>
                  {order.overtimeFee > 0 && <span style={{ fontSize: 16, color: '#86868B' }}>›</span>}
                </span>
              </div>
            )}

            {/* 超里程费 */}
            {showFullFee && (
              <div style={{ ...feeRowStyle, cursor: order.overmileageFee > 0 ? 'pointer' : 'default' }}
                onClick={() => { if (order.overmileageFee > 0) setFeeModal({ visible: true, type: 'mileage' }); }}>
                <span style={{ fontSize: 14, color: order.overmileageFee > 0 ? '#F53F3F' : '#86868B' }}>
                  超公里费 · ¥5/km
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: order.overmileageFee > 0 ? '#F53F3F' : '#000' }}>
                    {order.overmileageFee > 0 ? `¥${order.overmileageFee.toLocaleString()}` : '¥0'}
                  </span>
                  {order.overmileageFee > 0 && <span style={{ fontSize: 16, color: '#86868B' }}>›</span>}
                </span>
              </div>
            )}

            {/* 其他费用 */}
            {showFullFee && order.feeExtraDetail?.otherFees && order.feeExtraDetail.otherFees.length > 0 && (
              <div style={{ ...feeRowStyle, cursor: 'pointer' }}
                onClick={() => setFeeModal({ visible: true, type: 'other' })}>
                <span style={{ fontSize: 14, color: '#F53F3F' }}>
                  其他费用（{order.feeExtraDetail.otherFees.map(f => f.type).join('+')}）
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#F53F3F' }}>
                    ¥{order.feeExtraDetail.otherFees.reduce((s, f) => s + f.amount, 0).toLocaleString()}
                  </span>
                  <span style={{ fontSize: 16, color: '#86868B' }}>›</span>
                </span>
              </div>
            )}

            <div style={{ height: 1, background: '#F2F2F2', margin: '12px 0' }} />

            {/* 实付金额汇总 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>实付金额</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 24, fontWeight: 700 }}>¥{order.paidAmount.toLocaleString()}</span>
                {order.status === 'pending_extra' && (
                  <span style={{ display: 'block', fontSize: 12, color: '#F53F3F', fontWeight: 600, marginTop: 2 }}>
                    待补款 ¥{(order.overtimeFee + order.overmileageFee + (order.feeExtraDetail?.otherFees?.reduce((s, f) => s + f.amount, 0) || 0)).toLocaleString()}
                  </span>
                )}
                {order.status === 'completed' && (
                  <span style={{ display: 'block', fontSize: 11, color: '#00B42A' }}>已支付</span>
                )}
              </div>
            </div>
            {order.refundAmount > 0 && (
              <div style={{ ...feeRowStyle, marginTop: 8 }}>
                <span style={{ fontSize: 14, color: '#00B42A' }}>退款金额</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#00B42A' }}>¥{order.refundAmount.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 订单动态 */}
      <Card title="订单动态" style={{ marginBottom: 16 }} size="small">
        <Timeline>
          {timeline.map((t, i) => (
            <Timeline.Item key={i} dotColor={dotColors[t.dot] || '#86909C'}>
              {t.label}
            </Timeline.Item>
          ))}
        </Timeline>
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

      {/* 取消原因 */}
      {order.status === 'cancelled' && order.cancelReason && (
        <Card title="取消原因" style={{ marginBottom: 16 }} size="small">
          <p style={{ color: '#F53F3F', fontSize: 14 }}>{order.cancelReason}</p>
        </Card>
      )}

      {/* 费用明细弹窗 */}
      {feeModal.visible && (
        <FeeDetailSheet
          title={feeModal.type === 'waiting' ? '等待费明细' : feeModal.type === 'overtime' ? '超时费明细' : feeModal.type === 'mileage' ? '超公里费明细' : '其他费用明细'}
          onClose={() => setFeeModal({ visible: false, type: 'overtime' })}
        >
          {/* 等待费明细 */}
          {feeModal.type === 'waiting' && order.feeExtraDetail?.waitFee && (
            <div>
              <FeeRow label="司机到达时间" value={order.feeExtraDetail.waitFee.driverArriveTime || '—'} />
              <FeeRow label="地址定位" value={order.feeExtraDetail.waitFee.driverArriveAddr || '—'} />
              <FeeRow label="乘客上车时间" value={order.feeExtraDetail.waitFee.passengerPickupTime || '—'} />
              <FeeDivider />
              <FeeRow label="免费等候" value={`${order.feeExtraDetail.waitFee.freeMinutes} 分钟`} />
              <FeeRow label="实际等候" value={`${order.feeExtraDetail.waitFee.waitMinutes} 分钟`} />
              <FeeRow label="超时等候" value={`${order.feeExtraDetail.waitFee.excessMinutes} 分钟`} color="red" />
              <FeeRow label="等待费" value={`¥${order.feeExtraDetail.waitFee.amount.toLocaleString()}`} bold color="red" />
            </div>
          )}

          {/* 超时费明细 */}
          {feeModal.type === 'overtime' && order.feeExtraDetail?.overtimeDetails && (
            <div>
              {order.feeExtraDetail.overtimeDetails.map((d, i) => (
                <div key={i}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1C1C', marginBottom: 8 }}>{d.date}</div>
                  <FeeRow label="行程时间" value={`${d.actualStart} — ${d.actualEnd}`} />
                  <FeeRow label="总时长" value={`${d.totalMinutes} 分钟`} />
                  <FeeRow label="套餐内时长" value={`${d.packageMinutes} 分钟`} />
                  <FeeRow label="超时时长" value={`${d.excessMinutes} 分钟`} color="red" />
                  <FeeRow label="超时费" value={`¥${d.amount.toLocaleString()}`} bold color="red" />
                  {i < (order.feeExtraDetail?.overtimeDetails?.length || 1) - 1 && <FeeDivider />}
                </div>
              ))}
            </div>
          )}

          {/* 超里程费明细 */}
          {feeModal.type === 'mileage' && order.feeExtraDetail?.excessMileageDetails && (
            <div>
              {order.feeExtraDetail.excessMileageDetails.map((d, i) => (
                <div key={i}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1C1C', marginBottom: 8 }}>{d.date}</div>
                  <FeeRow label="开始里程" value={`${d.startMileage} km`} />
                  <FeeRow label="结束里程" value={`${d.endMileage} km`} />
                  <div style={{ display: 'flex', gap: 12, padding: '10px 0' }}>
                    <div style={{ width: 80, height: 60, background: '#F2F2F2', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, fontSize: 11, color: '#86868B' }}>
                      <span>🖼</span><span>开始</span>
                    </div>
                    <div style={{ width: 80, height: 60, background: '#F2F2F2', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, fontSize: 11, color: '#86868B' }}>
                      <span>🖼</span><span>结束</span>
                    </div>
                  </div>
                  <FeeRow label="当日里程" value={`${d.totalKm} km`} />
                  <FeeRow label="套餐内里程" value={`${d.packageKm} km`} />
                  <FeeRow label="超里程" value={`${d.excessKm} km`} color="red" />
                  <FeeRow label="超里程费" value={`¥${d.amount.toLocaleString()}`} bold color="red" />
                  {i < (order.feeExtraDetail?.excessMileageDetails?.length || 1) - 1 && <FeeDivider />}
                </div>
              ))}
            </div>
          )}

          {/* 其他费用明细 */}
          {feeModal.type === 'other' && order.feeExtraDetail?.otherFees && (
            <div>
              {order.feeExtraDetail.otherFees.map((f, i) => (
                <div key={f.id}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1C1C', marginBottom: 8 }}>{f.type}</div>
                  <FeeRow label="金额" value={`¥${f.amount.toLocaleString()}`} color="red" />
                  <FeeRow label="凭证" value={<span style={{ color: '#165DFF', cursor: 'pointer' }} onClick={() => Message.info('预览凭证')}>查看凭证 ›</span>} />
                  <FeeRow label="时间" value={f.voucherTime || '—'} />
                  {i < (order.feeExtraDetail?.otherFees?.length || 1) - 1 && <FeeDivider />}
                </div>
              ))}
            </div>
          )}
        </FeeDetailSheet>
      )}
    </div>
  );
}

function FeeRow({ label, value, bold, color }: { label: string; value: React.ReactNode; bold?: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
      <span style={{ fontSize: 14, color: '#4C4546', fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontSize: 14, color: color || '#1A1C1C', fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  );
}

function FeeDivider() {
  return <div style={{ height: 1, background: '#F2F2F2', margin: '8px 0' }} />;
}

function maskPhone(phone: string): string {
  if (phone.length >= 11) return phone.substring(0, 3) + '****' + phone.substring(7);
  return phone;
}
