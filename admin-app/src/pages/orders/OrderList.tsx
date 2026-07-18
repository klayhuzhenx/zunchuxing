import { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Input, Select, Space, Tabs, Drawer, Descriptions,
  Timeline, Empty, Message, Modal, DatePicker, Popconfirm, InputNumber, Form,
} from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { orders, driverOrders } from '../../data/mock';
import type { Order, OrderStatus, OrderType, PaymentMethod } from '../../types';
import DispatchModal from '../../components/DispatchModal';

const { RangePicker } = DatePicker;

const statusMap: Record<OrderStatus, { label: string; color: string }> = {
  unpaid: { label: '待支付', color: 'orange' },
  pending_dispatch: { label: '待派车', color: 'red' },
  pending_start: { label: '待接驾', color: 'arcoblue' },
  pending_enroute: { label: '待接驾', color: 'arcoblue' },
  ongoing: { label: '进行中', color: 'cyan' },
  pending_extra: { label: '待结算', color: 'orangered' },
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
  { key: 'pending_start', label: '待开始' },
  { key: 'ongoing', label: '进行中' }, { key: 'pending_extra', label: '待结算' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

// 订单总金额（详情面板费用明细用）
const orderGrossTotal = (r: Order): number => {
  const packageFee = r.baseFee * (r.days || 1);
  const remote = (r.remoteDispatchDetail?.pickupFee ?? 0) + (r.remoteDispatchDetail?.dropoffFee ?? 0);
  return packageFee + r.overtimeFee + r.overmileageFee + remote;
};
const actualTotal = (r: Order): number => Math.max(0, orderGrossTotal(r) - (r.refundAmount || 0));

// 订单金额（动态：按状态展示不同含义）
const orderAmountInfo = (r: Order): { amount: string; sub?: string; color?: string } => {
  const gross = Math.round(r.baseFee * (r.days || 1) * r.discount);
  const remote = (r.remoteDispatchDetail?.pickupFee ?? 0) + (r.remoteDispatchDetail?.dropoffFee ?? 0);
  const extraTotal = r.baseFee * (r.days || 1) + r.overtimeFee + r.overmileageFee + remote;
  switch (r.status) {
    case 'unpaid':
      return { amount: `¥${gross.toLocaleString()}` };
    case 'pending_dispatch':
    case 'pending_start':
    case 'pending_enroute':
    case 'ongoing':
      return { amount: `¥${r.paidAmount.toLocaleString()}` };
    case 'pending_extra':
      return { amount: `¥${extraTotal.toLocaleString()}` };
    case 'completed':
      return { amount: `¥${(r.paidAmount - (r.refundAmount || 0)).toLocaleString()}` };
    case 'cancelled':
      if (r.paidAmount > 0) {
        const penalty = r.paidAmount - (r.refundAmount || 0);
        return { amount: `¥${r.paidAmount.toLocaleString()}`, sub: `违约金 ¥${penalty.toLocaleString()}`, color: '#F53F3F' };
      }
      return { amount: `¥${gross.toLocaleString()}` };
    default:
      return { amount: '—' };
  }
};

// 押金状态：未收取 / 未退还 / 已退还
const depositTotal = (r: Order) => (r.depositVehicle || 0) + (r.depositViolation || 0);

const depositStatusOf = (r: Order): { label: string; color: string } => {
  const total = depositTotal(r);
  if (!total) return { label: '未收取', color: 'gray' };
  const vRefunded = r.depositVehicleRefunded && (r.depositVehicle || 0) > 0 ? 1 : 0;
  const viRefunded = r.depositViolationRefunded && (r.depositViolation || 0) > 0 ? 1 : 0;
  const refundedCount = (r.depositVehicle ? vRefunded : 0) + (r.depositViolation ? viRefunded : 0);
  const totalCount = (r.depositVehicle ? 1 : 0) + (r.depositViolation ? 1 : 0);
  if (refundedCount === 0) return { label: '未退还', color: 'orangered' };
  if (refundedCount < totalCount) return { label: '部分退还', color: 'orange' };
  return { label: '已退还', color: 'green' };
};

export default function OrderList() {
  const [orderType, setOrderType] = useState<OrderType>('charter');
  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(window.location.search).get('tab') || 'all');
  const [keyword, setKeyword] = useState('');
  const [tripDateRange, setTripDateRange] = useState<[string, string] | null>(null);
  const [orderDateRange, setOrderDateRange] = useState<[string, string] | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [dispatchVisible, setDispatchVisible] = useState(false);
  const [data, setData] = useState<Order[]>(orders);
  // 退押金弹窗（列表 + 详情共用）
  const [depositModal, setDepositModal] = useState<{ visible: boolean; orderId: string; checkVehicle: boolean; checkViolation: boolean; vehicleRefunded: boolean; violationRefunded: boolean; vehicleAmount: number; violationAmount: number; vehicleDeduct: number; violationDeduct: number; vehicleReason: string; violationReason: string }>({ visible: false, orderId: '', checkVehicle: true, checkViolation: false, vehicleRefunded: false, violationRefunded: false, vehicleAmount: 0, violationAmount: 0, vehicleDeduct: 0, violationDeduct: 0, vehicleReason: '', violationReason: '' });
  // 退款弹窗（已完成 · 60 日内）
  const [cancelModal, setCancelModal] = useState<{ visible: boolean; orderId: string; orderType: string; orderStatus: string }>({ visible: false, orderId: '', orderType: '', orderStatus: '' });
  const [cancelReason, setCancelReason] = useState('');
  const [refundModal, setRefundModal] = useState<{ visible: boolean; orderId: string; amount: number; reason: string }>({ visible: false, orderId: '', amount: 0, reason: '' });

  const filtered = useMemo(() => {
    let result = data.filter(o => o.type === orderType);
    if (activeTab !== 'all') {
      if (activeTab === 'pending_start') {
        result = result.filter(o => o.status === 'pending_dispatch' || o.status === 'pending_start' || o.status === 'pending_enroute');
      } else result = result.filter(o => o.status === activeTab);
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
  }, [data, orderType, activeTab, keyword, tripDateRange, orderDateRange]);

  const openDetail = (r: Order) => { setSelectedOrder(r); setDrawerVisible(true); };
  const openDispatch = (r: Order) => { setSelectedOrder(r); setDispatchVisible(true); };

  const handleCancel = () => {
    setData(data.map(o => o.id === cancelModal.orderId ? { ...o, status: 'cancelled' as OrderStatus } : o));
    setCancelModal({ visible: false, orderId: '', orderType: '', orderStatus: '' });
    Message.success('订单已取消');
  };

  // === 押金 / 退款 ===
  // 已完成且个人身份有押金未退 → 可退押金（§4.2.6 / §4.4.3）
  const canRefundDeposit = (o: Order) => o.status === 'completed'
    && o.type === 'rental'
    && o.userIdentity === 'personal'
    && depositTotal(o) > 0
    && (!o.depositVehicleRefunded || !o.depositViolationRefunded);

  // 已完成且完成未超 60 日 → 可退款（§4.2.8）
  const canRefund = (o: Order) => {
    if (o.status !== 'completed') return false;
    const end = (o.type === 'rental' ? o.rentalEnd : (o.endTime || '').split(' ')[0]) || o.createdAt.split(' ')[0];
    const endDate = new Date(end); const now = new Date('2026-06-18');
    const diffDays = (now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 60;
  };

  const openDepositRefund = (o: Order) => {
    const vNotRefunded = !o.depositVehicleRefunded && (o.depositVehicle || 0) > 0;
    const viNotRefunded = !o.depositViolationRefunded && (o.depositViolation || 0) > 0;
    setDepositModal({
      visible: true, orderId: o.id,
      checkVehicle: vNotRefunded, checkViolation: viNotRefunded,
      vehicleRefunded: !vNotRefunded, violationRefunded: !viNotRefunded,
      vehicleAmount: o.depositVehicle || 0,
      violationAmount: o.depositViolation || 0,
      vehicleDeduct: 0, violationDeduct: 0,
      vehicleReason: '', violationReason: '',
    } as any);
  };

  const handleDepositRefund = () => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setData(data.map(o => o.id === depositModal.orderId ? {
      ...o,
      ...(depositModal.checkVehicle ? { depositVehicleRefunded: true, depositVehicleRefundedAt: now, depositVehicleRefundReason: depositModal.vehicleReason, depositVehicleDeduct: depositModal.vehicleDeduct } : {}),
      ...(depositModal.checkViolation ? { depositViolationRefunded: true, depositViolationRefundedAt: now, depositViolationRefundReason: depositModal.violationReason, depositViolationDeduct: depositModal.violationDeduct } : {}),
    } : o));
    if (selectedOrder?.id === depositModal.orderId) {
      setSelectedOrder(o => o ? {
        ...o,
        ...(depositModal.checkVehicle ? { depositVehicleRefunded: true, depositVehicleRefundedAt: now, depositVehicleRefundReason: depositModal.vehicleReason, depositVehicleDeduct: depositModal.vehicleDeduct } : {}),
        ...(depositModal.checkViolation ? { depositViolationRefunded: true, depositViolationRefundedAt: now, depositViolationRefundReason: depositModal.violationReason, depositViolationDeduct: depositModal.violationDeduct } : {}),
      } : o);
    }
    Message.success('押金退还操作成功');
    setDepositModal({ visible: false, orderId: '', checkVehicle: true, checkViolation: false, vehicleRefunded: false, violationRefunded: false, vehicleAmount: 0, violationAmount: 0, vehicleDeduct: 0, violationDeduct: 0, vehicleReason: '', violationReason: '' });
  };

  const handleRefund = () => {
    if (!refundModal.amount || refundModal.amount <= 0) { Message.warning('请输入退款金额'); return; }
    if (!refundModal.reason.trim()) { Message.warning('请填写退款原因'); return; }
    const target = data.find(o => o.id === refundModal.orderId);
    if (target && refundModal.amount > target.paidAmount) { Message.error('退款金额不可超过实付金额'); return; }
    setData(data.map(o => o.id === refundModal.orderId ? { ...o, refundAmount: (o.refundAmount || 0) + refundModal.amount } : o));
    Message.success('退款成功');
    setRefundModal({ visible: false, orderId: '', amount: 0, reason: '' });
  };

  const handleDispatchComplete = (orderId: string, schedules: { date: string; timeRange: string; vehiclePlate: string; vehicleModel: string; driverName?: string; driverPhone?: string }[]) => {
    const targetOrder = data.find(o => o.id === orderId);
    const isReassign = targetOrder && (targetOrder.status === 'pending_start' || targetOrder.status === 'pending_enroute' || targetOrder.status === 'ongoing');

    // 改派：作废原关联司机工单（pending_start/ongoing 之外的不动），按新日程生成新出车单
    if (isReassign) {
      const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
      // 1. 把现有未结束的出车单标为 cancelled
      driverOrders.forEach(d => {
        if (d.orderId === orderId && (d.status === 'not_started' || d.status === 'in_progress')) {
          d.status = 'cancelled';
        }
      });
      // 2. 按新日程生成新出车单（追加到全局 mock 数组）
      schedules.forEach((s, idx) => {
        driverOrders.push({
          id: `D-RE-${orderId}-${idx}-${Date.now()}`,
          driverOrderNo: `DR${s.date.replace(/-/g, '')}-${String(idx + 1).padStart(4, '0')}-RE`,
          orderId, orderNo: targetOrder.orderNo,
          type: targetOrder.type,
          driverName: s.driverName || '', driverPhone: s.driverPhone || '',
          plateNo: s.vehiclePlate, carModel: s.vehicleModel,
          passengerName: targetOrder.passengerName, passengerPhone: targetOrder.passengerPhone,
          tripDate: s.date, plannedTimeRange: s.timeRange,
          status: 'not_started', dispatchTime: now,
          pickupAddress: targetOrder.pickupAddress, dropoffAddress: targetOrder.dropoffAddress,
        });
      });
    }

    const firstS = schedules[0];
    setData(data.map(o => o.id === orderId ? { ...o, status: 'pending_start' as OrderStatus, driverName: firstS.driverName, plateNo: firstS.vehiclePlate, carModel: firstS.vehicleModel, schedules } : o));
    setDispatchVisible(false);
    Message.success(isReassign ? '改派成功，原司机工单已作废' : '派车成功');
  };

  const isCharter = orderType === 'charter';

  // === 包车列表字段 ===
  const charterColumns = [
    { title: '订单号', dataIndex: 'orderNo', width: 160, render: (v: string, r: Order) => <a onClick={() => openDetail(r)}>{v}</a> },
    { title: '订单类型', width: 80, render: () => <Tag color="arcoblue" size="small">包车</Tag> },
    { title: '下单人', width: 130, render: (_: unknown, r: Order) => `${r.passengerName ? `${r.passengerName} · ` : ''}${r.passengerPhone}` },
    { title: '用车时间', width: 200, render: (_: unknown, r: Order) => <div><div>{r.startTime} ~ {r.endTime?.split(' ')[1]}</div>{r.days > 1 && <Tag size="small" color="arcoblue" style={{ marginTop: 2 }}>{r.days}天</Tag>}</div> },
    { title: '上车地点', dataIndex: 'pickupAddress', width: 140, ellipsis: true },
    { title: '下车地点', dataIndex: 'dropoffAddress', width: 140, ellipsis: true },
    { title: '司机', width: 80, render: (_: unknown, r: Order) => r.driverName || '-' },
    { title: '车辆', width: 100, render: (_: unknown, r: Order) => r.plateNo || '-' },
    { title: '订单金额', width: 130, render: (_: unknown, r: Order) => {
      const info = orderAmountInfo(r);
      return <div><div style={{ fontWeight: 700, fontSize: 14, color: info.color }}>{info.amount}</div>{info.sub && <div style={{ fontSize: 11, color: info.color || '#86909C', marginTop: 2 }}>{info.sub}</div>}</div>;
    }},
    { title: '订单状态', width: 80, render: (_: unknown, r: Order) => {
      const label = r.type === 'rental' && (r.status === 'pending_start' || r.status === 'pending_enroute') ? '待取车' : statusMap[r.status].label;
      return <Tag color={statusMap[r.status].color} size="small">{label}</Tag>;
    }},
    { title: '下单时间', dataIndex: 'createdAt', width: 140 },
    { title: '操作', width: 140, fixed: 'right' as const, render: (_: unknown, record: Order) => actionCol(record) },
  ];

  // === 租车列表字段 ===
  const rentalColumns = [
    { title: '订单号', dataIndex: 'orderNo', width: 160, render: (v: string, r: Order) => <a onClick={() => openDetail(r)}>{v}</a> },
    { title: '订单类型', width: 80, render: () => <Tag color="purple" size="small">租车</Tag> },
    { title: '下单人', width: 130, render: (_: unknown, r: Order) => `${r.passengerName ? `${r.passengerName} · ` : ''}${r.passengerPhone}` },
    { title: '租期', width: 170, render: (_: unknown, r: Order) => <div>{r.rentalStart} ~ {r.rentalEnd} <Tag size="small" color="purple" style={{ marginLeft: 4 }}>共{r.days}天</Tag></div> },
    { title: '取车地点', dataIndex: 'pickupAddress', width: 130, ellipsis: true },
    { title: '还车地点', dataIndex: 'dropoffAddress', width: 130, ellipsis: true },
    { title: '车辆', width: 100, render: (_: unknown, r: Order) => r.plateNo || '-' },
    { title: '送车司机', width: 80, render: (_: unknown, r: Order) => r.deliveryDriver || '-' },
    { title: '收车司机', width: 80, render: (_: unknown, r: Order) => r.pickupDriver || '-' },
    { title: '已收押金', width: 100, render: (_: unknown, r: Order) => (r.userIdentity === 'enterprise_employee' || depositTotal(r) === 0) ? '—' : `¥${depositTotal(r).toLocaleString()}` },
    { title: '已退押金', width: 100, render: (_: unknown, r: Order) => {
      if (r.userIdentity === 'enterprise_employee' || depositTotal(r) === 0) return '—';
      const vRefunded = r.depositVehicleRefunded ? (r.depositVehicle || 0) - (r.depositVehicleDeduct || 0) : 0;
      const viRefunded = r.depositViolationRefunded ? (r.depositViolation || 0) - (r.depositViolationDeduct || 0) : 0;
      const refunded = vRefunded + viRefunded;
      if (refunded === 0) return '—';
      const ded = (r.depositVehicleDeduct || 0) + (r.depositViolationDeduct || 0);
      return `¥${refunded.toLocaleString()}${ded > 0 ? `（扣¥${ded}）` : ''}`;
    }},
    { title: '押金状态', width: 100, render: (_: unknown, r: Order) => {
      const s = depositStatusOf(r);
      return <Tag color={s.color} size="small">{s.label}</Tag>;
    }},
    { title: '订单金额', width: 130, render: (_: unknown, r: Order) => {
      const info = orderAmountInfo(r);
      return <div><div style={{ fontWeight: 700, fontSize: 14, color: info.color }}>{info.amount}</div>{info.sub && <div style={{ fontSize: 11, color: info.color || '#86909C', marginTop: 2 }}>{info.sub}</div>}</div>;
    }},
    { title: '订单状态', width: 80, render: (_: unknown, r: Order) => {
      const label = r.type === 'rental' && (r.status === 'pending_start' || r.status === 'pending_enroute') ? '待取车' : statusMap[r.status].label;
      return <Tag color={statusMap[r.status].color} size="small">{label}</Tag>;
    }},
    { title: '下单时间', dataIndex: 'createdAt', width: 140 },
    { title: '操作', width: 140, fixed: 'right' as const, render: (_: unknown, record: Order) => actionCol(record) },
  ];

  const actionCol = (record: Order) => (
    <Space size={4}>
      <Button type="text" size="small" onClick={() => openDetail(record)}>详情</Button>
      {record.status === 'unpaid' && (
        <Button type="text" size="small" status="danger" onClick={() => { setCancelModal({ visible: true, orderId: record.id, orderType: record.type, orderStatus: record.status }); setCancelReason(''); }}>取消</Button>
      )}
      {record.status === 'pending_dispatch' && <>
        <Button type="text" size="small" status="warning" onClick={() => openDispatch(record)}>派车</Button>
        <Button type="text" size="small" status="danger" onClick={() => { setCancelModal({ visible: true, orderId: record.id, orderType: record.type, orderStatus: record.status }); setCancelReason(''); }}>取消</Button>
      </>}
      {(record.status === 'pending_start' || record.status === 'pending_enroute') && <Button type="text" size="small" onClick={() => openDispatch(record)}>改派</Button>}
      {(record.status === 'pending_start' || record.status === 'pending_enroute') && (
        <Button type="text" size="small" status="danger" onClick={() => { setCancelModal({ visible: true, orderId: record.id, orderType: record.type, orderStatus: record.status }); setCancelReason(''); }}>取消</Button>
      )}
      {canRefundDeposit(record) && <Button type="text" size="small" status="warning" onClick={() => openDepositRefund(record)}>退押金</Button>}
      {canRefund(record) && <Button type="text" size="small" status="danger" onClick={() => openRefund(record)}>退款</Button>}
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
          <RangePicker style={{ width: 260 }} placeholder={['用车时间起', '用车时间止']}
            onChange={(_, ds) => setTripDateRange(ds && ds[0] && ds[1] ? ds as [string, string] : null)} />
          <RangePicker style={{ width: 260 }} placeholder={['下单时间起', '下单时间止']}
            onChange={(_, ds) => setOrderDateRange(ds && ds[0] && ds[1] ? ds as [string, string] : null)} />
          <div style={{ flex: 1 }} />
        </Space>
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={isCharter ? charterColumns : rentalColumns} data={filtered} rowKey="id"
          scroll={{ x: isCharter ? 1700 : 1700 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>

      <Drawer width="60%" title={selectedOrder ? `订单详情 - ${selectedOrder.orderNo}` : '订单详情'}
        visible={drawerVisible} onCancel={() => setDrawerVisible(false)} footer={null}>
        {selectedOrder && <OrderDetailPanel order={selectedOrder} onRefundDeposit={() => openDepositRefund(selectedOrder)} />}
      </Drawer>

      <DispatchModal visible={dispatchVisible} order={selectedOrder}
        onClose={() => setDispatchVisible(false)} onComplete={handleDispatchComplete} />

      {/* 退押金弹窗（车辆押金 / 违章押金） */}
      <Modal title="退押金" visible={depositModal.visible} onOk={handleDepositRefund}
        onCancel={() => setDepositModal({ visible: false, orderId: '', checkVehicle: true, checkViolation: false, vehicleRefunded: false, violationRefunded: false, vehicleAmount: 0, violationAmount: 0, vehicleDeduct: 0, violationDeduct: 0, vehicleReason: '', violationReason: '' })}
        okText="确认退还" style={{ width: 560 }}>
        <div style={{ marginBottom: 12, fontSize: 13, color: '#4E5969' }}>勾选退还类型：</div>
        <Space size={12}>
          {depositModal.vehicleAmount > 0 && (!depositModal.vehicleRefunded ? (
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input type="checkbox" checked={depositModal.checkVehicle} onChange={() => setDepositModal({ ...depositModal, checkVehicle: !depositModal.checkVehicle })} />
              车辆押金
            </label>
          ) : <span style={{ color: '#C9CDD4', fontSize: 13 }}>车辆押金（已退还）</span>)}
          {depositModal.violationAmount > 0 && (!depositModal.violationRefunded ? (
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input type="checkbox" checked={depositModal.checkViolation} onChange={() => setDepositModal({ ...depositModal, checkViolation: !depositModal.checkViolation })} />
              违章押金
            </label>
          ) : <span style={{ color: '#C9CDD4', fontSize: 13 }}>违章押金（已退还）</span>)}
        </Space>

        {depositModal.checkVehicle && depositModal.vehicleAmount > 0 && (
          <Card size="small" title="车辆押金" style={{ marginTop: 16 }}>
            <Descriptions column={1} size="small" data={[
              { label: '收取金额', value: `¥${depositModal.vehicleAmount.toLocaleString()}` },
              { label: '扣款金额', value: <InputNumber min={0} max={depositModal.vehicleAmount} value={depositModal.vehicleDeduct} onChange={v => setDepositModal({ ...depositModal, vehicleDeduct: v || 0 })} style={{ width: 200 }} /> },
              { label: '退还金额', value: `¥${Math.max(0, depositModal.vehicleAmount - depositModal.vehicleDeduct).toLocaleString()}` },
            ]} />
            <Form.Item label="备注" style={{ marginTop: 8 }}>
              <Input.TextArea value={depositModal.vehicleReason} onChange={v => setDepositModal({ ...depositModal, vehicleReason: v })} placeholder="选填" maxLength={200} rows={1} />
            </Form.Item>
          </Card>
        )}
        {depositModal.checkViolation && depositModal.violationAmount > 0 && (
          <Card size="small" title="违章押金" style={{ marginTop: 16 }}>
            <Descriptions column={1} size="small" data={[
              { label: '收取金额', value: `¥${depositModal.violationAmount.toLocaleString()}` },
              { label: '扣款金额', value: <InputNumber min={0} max={depositModal.violationAmount} value={depositModal.violationDeduct} onChange={v => setDepositModal({ ...depositModal, violationDeduct: v || 0 })} style={{ width: 200 }} /> },
              { label: '退还金额', value: `¥${Math.max(0, depositModal.violationAmount - depositModal.violationDeduct).toLocaleString()}` },
            ]} />
            <Form.Item label="备注" style={{ marginTop: 8 }}>
              <Input.TextArea value={depositModal.violationReason} onChange={v => setDepositModal({ ...depositModal, violationReason: v })} placeholder="选填" maxLength={200} rows={1} />
            </Form.Item>
          </Card>
        )}

        <div style={{ borderTop: '1px solid #e5e6eb', margin: '16px 0 0', paddingTop: 12 }}>
          <Descriptions column={1} size="small" data={[
            { label: '合计押金', value: `¥${((depositModal.checkVehicle ? depositModal.vehicleAmount : 0) + (depositModal.checkViolation ? depositModal.violationAmount : 0)).toLocaleString()}` },
            { label: '合计扣款', value: `¥${((depositModal.checkVehicle ? depositModal.vehicleDeduct : 0) + (depositModal.checkViolation ? depositModal.violationDeduct : 0)).toLocaleString()}` },
            { label: '合计退款', value: `¥${((depositModal.checkVehicle ? Math.max(0, depositModal.vehicleAmount - depositModal.vehicleDeduct) : 0) + (depositModal.checkViolation ? Math.max(0, depositModal.violationAmount - depositModal.violationDeduct) : 0)).toLocaleString()}` },
          ]} />
        </div>
      </Modal>

      {/* 取消订单弹窗 */}
      <Modal title="取消订单" visible={cancelModal.visible}
        onOk={handleCancel}
        onCancel={() => setCancelModal({ visible: false, orderId: '', orderType: '', orderStatus: '' })}
        okText="确认取消" cancelText="再想想"
        okButtonProps={{ status: 'danger' }}
      >
        <p>确定取消该订单吗？</p>
        <Input.TextArea placeholder="取消原因（选填）" style={{ marginTop: 12 }} value={cancelReason} onChange={setCancelReason} maxLength={200} rows={2} />
        {['pending_start','pending_enroute'].includes(cancelModal.orderStatus) && (
          <p style={{ color: '#F53F3F', fontSize: 13, marginTop: 8 }}>违约金 ¥20.50</p>
        )}
      </Modal>

      {/* 退款弹窗（已完成 · 60 日内，§4.2.8） */}
      <Modal title="退款" visible={refundModal.visible} onOk={handleRefund}
        onCancel={() => setRefundModal({ visible: false, orderId: '', amount: 0, reason: '' })}
        okText="确认退款" style={{ width: 480 }}>
        {(() => {
          const o = data.find(x => x.id === refundModal.orderId);
          if (!o) return null;
          const payLabel = payMethodMap[o.paymentMethod].label;
          return (
            <Descriptions column={1} size="small" style={{ marginBottom: 16 }}
              data={[
                { label: '订单号', value: o.orderNo },
                { label: '下单人', value: o.passengerName || o.passengerPhone },
                { label: '实付金额', value: `¥${o.paidAmount.toLocaleString()}` },
                { label: '支付方式', value: payLabel },
              ]} />
          );
        })()}
        <Form.Item label="退款金额" rules={[{ required: true }]}>
          <InputNumber min={0} max={data.find(x => x.id === refundModal.orderId)?.paidAmount || 0}
            value={refundModal.amount} onChange={v => setRefundModal({ ...refundModal, amount: v || 0 })}
            style={{ width: '100%' }} prefix="¥" />
        </Form.Item>
        <Form.Item label="退款原因" rules={[{ required: true }]}>
          <Input.TextArea value={refundModal.reason} onChange={v => setRefundModal({ ...refundModal, reason: v })}
            placeholder="必填，如「乘客投诉协商退款」「行程争议补偿」" maxLength={200} rows={2} showWordLimit />
        </Form.Item>
      </Modal>
    </div>
  );
}

// ===== 费用明细弹窗（企业端同款样式）=====
function FeeDetailSheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ width: '90%', maxWidth: 560, maxHeight: '75vh', background: '#FFF', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{title}</span>
          <div onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: '#F2F2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</div>
        </div>
        <div style={{ padding: '0 24px 32px', overflow: 'auto', maxHeight: '60vh' }}>{children}</div>
      </div>
    </div>
  );
}

// ===== 订单详情面板 =====
function OrderDetailPanel({ order, onRefundDeposit }: { order: Order; onRefundDeposit?: () => void }) {
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [feeModal, setFeeModal] = useState<{ visible: boolean; type: 'waiting' | 'overtime' | 'mileage' | 'remote' | 'other' | 'refund' | 'main' | 'mainFull' }>({ visible: false, type: 'overtime' });
  const feeRowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' };
  const beforeDispatch = ['unpaid', 'pending_dispatch'].includes(order.status);

  const relatedDriverOrders = driverOrders.filter(d => d.orderId === order.id);
  const isCharter = order.type === 'charter';

  // 积分抵扣（100积分=¥1，仅租车支持，包车一律视为 0）
  const pointsUsed = isCharter ? 0 : (order.pointsUsed || 0);
  const pointsDeduction = Math.floor(pointsUsed / 100);

  const handleSaveNote = () => {
    if (!noteText.trim()) { Message.warning('请输入备注内容'); return; }
    Message.success('备注已保存'); setShowNote(false); setNoteText('');
  };

  return (
    <div>
      {/* 状态提醒条（参照企业端 alert 样式） */}
      {(() => {
        const alerts: Record<string, { color: string; bg: string; title: string; body: string }> = {
          unpaid: { color: '#FF7D00', bg: '#FFF7E8', title: '等待支付', body: '订单已提交，等待乘客完成支付' },
          pending_dispatch: { color: '#FF7D00', bg: '#FFF7E8', title: '等待派车', body: '请尽快安排车辆与司机' },
          pending_start: { color: '#165DFF', bg: '#E8F3FF', title: order.type === 'charter' ? '待接驾' : '待取车', body: order.type === 'charter' ? '司机已接单，准备出发中' : '等待司机将车辆送往取车点' },
          pending_enroute: { color: '#165DFF', bg: '#E8F3FF', title: order.type === 'charter' ? '待接驾' : '待取车', body: order.type === 'charter' ? `司机正在前往上车点 · ${order.driverName} · ${order.plateNo} · 预计 8 分钟到达` : `司机正在将车辆送往取车点 · ${order.driverName} · ${order.plateNo} · 预计 8 分钟到达` },
          ongoing: { color: '#00B42A', bg: '#E8FFEA', title: '进行中', body: order.type === 'charter' ? `${order.driverName} · ${order.plateNo}，当前行程进行中` : `${order.plateNo}，当前行程进行中` },
          completed: { color: '#00B42A', bg: '#E8FFEA', title: '已完成', body: '感谢使用尊出行' },
          cancelled: { color: '#F53F3F', bg: '#FFECE8', title: '已取消', body: order.type === 'charter' ? `${order.internalNote || '已取消'}${order.paidAmount > 0 ? '，违约金 ¥' + ((order.paidAmount || 0) - (order.refundAmount || 0)).toLocaleString() : ''}` : (order.internalNote || '已取消') },
          pending_extra: { color: '#F53F3F', bg: '#FFECE8', title: '待结算', body: `行程结束产生额外费用，等待乘客补款` },
        };
        const a = alerts[order.status];
        if (!a) return null;
        return (
          <div style={{ background: a.bg, borderLeft: `3px solid ${a.color}`, padding: '12px 16px', borderRadius: '0 6px 6px 0', marginBottom: 16 }}>
            <strong style={{ color: a.color, fontSize: 14 }}>{a.title}</strong>
            <div style={{ color: '#4E5969', fontSize: 13, marginTop: 4 }}>{a.body}</div>
            {order.status === 'cancelled' && order.paidAmount > 0 && (
              <div style={{ color: '#F53F3F', fontSize: 13, marginTop: 4, fontWeight: 600 }}>
                违约金 ¥{((order.paidAmount || 0) - (order.refundAmount || 0)).toLocaleString()}
              </div>
            )}
          </div>
        );
      })()}

      {/* 基本信息（含下单人） */}
      <Card title="基本信息" style={{ marginBottom: 16 }} size="small">
        <Descriptions column={2} size="small" data={[
          { label: '订单号', value: order.orderNo },
          { label: '订单类型', value: <Tag color={isCharter ? 'arcoblue' : 'purple'} size="small">{isCharter ? '包车出行' : '租车出行'}</Tag> },
          ...(order.status === 'pending_extra' ? [{ label: '子状态', value: <Tag color="orangered" size="small">待结算</Tag> }] : []),
          { label: '下单人', value: order.passengerName || order.passengerPhone },
          { label: '手机号', value: order.passengerPhone },
          { label: '下单属性', value: order.userIdentity === 'enterprise_employee' ? <Tag color='arcoblue' size='small'>企业</Tag> : <Tag color='green' size='small'>个人</Tag> },
          ...(order.userIdentity === 'enterprise_employee' ? [{ label: '下单企业', value: order.enterpriseName || '-' }] : []),
          { label: '下单时间', value: order.createdAt },
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

      {/* 车型套餐 */}
      <Card title={isCharter ? '车型套餐' : '套餐信息'} style={{ marginBottom: 16 }} size="small">
        <div style={feeRowStyle}>
          <span style={{ fontSize: 14, color: '#4E5969' }}>车型</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            {order.carModel || '—'}{isCharter ? ' · 尊享套餐' : ''}
          </span>
        </div>
        <div style={feeRowStyle}>
          <span style={{ fontSize: 14, color: '#4E5969' }}>{isCharter ? '套餐价' : '日租价'}</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            {(() => {
              const disc = Math.round(order.baseFee * order.discount);
              if (order.discount < 1) return <><span style={{ fontWeight: 700 }}>¥{disc.toLocaleString()}</span><span style={{ fontSize: 13, color: '#86909C', textDecoration: 'line-through', marginLeft: 8 }}>¥{order.baseFee.toLocaleString()}</span></>;
              return <>¥{order.baseFee.toLocaleString()}</>;
            })()} / 天{order.days > 1 ? ` × ${order.days} 天` : ''}</span>
        </div>
      </Card>

      {/* 费用信息 */}
      <Card title="费用信息" style={{ marginBottom: 16 }} size="small">
        {(() => {
          const disc = Math.round(order.baseFee * (order.days || 1) * order.discount);
          const gross = order.baseFee * (order.days || 1);
          const remote = (order.remoteDispatchDetail?.pickupFee ?? 0) + (order.remoteDispatchDetail?.dropoffFee ?? 0);
          const extraTotal = gross + order.overtimeFee + order.overmileageFee + remote;
          const paid = order.paidAmount;
          const refund = order.refundAmount || 0;
          const st = order.status;
          const row = (label: string, amount: string, opts?: { sub?: boolean; click?: 'main' | 'mainFull' | 'refund'; extra?: React.ReactNode }) => (
            <div style={{ ...feeRowStyle, cursor: opts?.click ? 'pointer' : 'default' }}
              onClick={() => { if (opts?.click) setFeeModal({ visible: true, type: opts.click }); }}>
              <span style={{ fontSize: opts?.sub ? 14 : 15, fontWeight: opts?.sub ? 400 : 600, color: opts?.sub ? '#4E5969' : '#1A1C1C' }}>{label}</span>
              <span style={{ fontSize: opts?.sub ? 14 : 22, fontWeight: opts?.sub ? 500 : 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                {amount}{opts?.click && <span style={{ fontSize: 16, color: '#C9CDD4' }}>›</span>}
              </span>
              {opts?.extra}
            </div>
          );
          const fmt = (n: number) => `¥${n.toLocaleString()}`;

          if (st === 'unpaid') return (<>
            {row('订单金额', fmt(disc), { click: 'main' })}
            {order.discount < 1 && (
              <div style={feeRowStyle}>
                <span style={{ fontSize: 13, color: '#FF7D00' }}>（共优惠¥{(gross - disc).toLocaleString()}）</span>
                <span style={{ fontSize: 14, color: '#86909C', textDecoration: 'line-through' }}>¥{gross.toLocaleString()}</span>
              </div>
            )}
            {pointsUsed > 0 && (
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#00B42A' }}>积分抵扣（{pointsUsed.toLocaleString()} 积分）</span><span style={{ fontSize: 14, fontWeight: 500, color: '#00B42A' }}>-¥{pointsDeduction.toLocaleString()}</span></div>
            )}
          </>);

          if (['pending_dispatch','pending_start','pending_enroute','ongoing'].includes(st)) return (
            row('已付订单金额', fmt(paid), { click: 'main' })
          );

          if (st === 'pending_extra') return (<>
            {row('已付订单金额', fmt(paid), { sub: true, click: 'main' })}
            {row('应付订单金额', fmt(extraTotal), { sub: true, click: 'mainFull' })}
            <div style={{ borderTop: '1px solid #e5e6eb', margin: '4px 0', paddingTop: 8, ...feeRowStyle }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>需补款</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: '#F53F3F' }}>¥{(extraTotal - paid).toLocaleString()}</span>
            </div>
            {pointsUsed > 0 && (
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#00B42A' }}>积分抵扣（{pointsUsed.toLocaleString()} 积分）</span><span style={{ fontSize: 14, fontWeight: 500, color: '#00B42A' }}>-¥{pointsDeduction.toLocaleString()}</span></div>
            )}
          </>);

          if (st === 'completed') return (<>
            {row('已付订单金额', fmt(paid), { sub: true, click: 'mainFull' })}
            <div style={{ ...feeRowStyle, cursor: 'pointer' }} onClick={() => setFeeModal({ visible: true, type: 'refund' })}>
              <span style={{ fontSize: 14, color: refund > 0 ? '#F53F3F' : '#4E5969' }}>退款金额</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: refund > 0 ? '#F53F3F' : '#000', display: 'flex', alignItems: 'center', gap: 4 }}>
                {refund > 0 ? `-¥${refund.toLocaleString()}` : '¥0'}<span style={{ fontSize: 16, color: '#C9CDD4' }}>›</span>
              </span>
            </div>
            <div style={{ borderTop: '1px solid #e5e6eb', margin: '4px 0', paddingTop: 8, ...feeRowStyle }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>实付订单金额</span>
              <span style={{ fontSize: 24, fontWeight: 700 }}>{fmt(paid - refund)}</span>
            </div>
            {pointsUsed > 0 && (
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#00B42A' }}>积分抵扣（{pointsUsed.toLocaleString()} 积分）</span><span style={{ fontSize: 14, fontWeight: 500, color: '#00B42A' }}>-¥{pointsDeduction.toLocaleString()}</span></div>
            )}
          </>);

          if (st === 'cancelled' && paid > 0) return (<>
            {row('已付订单金额', fmt(paid), { sub: true, click: 'mainFull' })}
            <div style={{ ...feeRowStyle, cursor: 'pointer' }} onClick={() => setFeeModal({ visible: true, type: 'refund' })}>
              <span style={{ fontSize: 14, color: '#4E5969' }}>退款金额</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#F53F3F', display: 'flex', alignItems: 'center', gap: 4 }}>
                -¥{refund.toLocaleString()}<span style={{ fontSize: 16, color: '#C9CDD4' }}>›</span>
              </span>
            </div>
            <div style={{ borderTop: '1px solid #e5e6eb', margin: '4px 0', paddingTop: 8, ...feeRowStyle }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>实付订单金额</span>
              <span style={{ fontSize: 24, fontWeight: 700 }}>{fmt(paid - refund)}</span>
            </div>
          </>);

          return null;
        })()}
      </Card>

      {/* 押金信息（仅租车 · 个人身份 · 单独卡片） */}
      {!isCharter && order.userIdentity !== 'enterprise_employee' && depositTotal(order) > 0 && (() => {
        const s = depositStatusOf(order);
        const vRefunded = order.depositVehicleRefunded;
        const viRefunded = order.depositViolationRefunded;
        const hasUnrefunded = (!vRefunded && (order.depositVehicle || 0) > 0) || (!viRefunded && (order.depositViolation || 0) > 0);
        return (
          <Card title="押金信息" style={{ marginBottom: 16 }} size="small"
            extra={<Tag color={s.color} size="small">{s.label}</Tag>}>
            <Descriptions column={2} size="small" data={[
              { label: '合计押金', value: `¥${depositTotal(order).toLocaleString()}` },
              { label: '收取时间', value: order.depositVehiclePaidAt || order.depositViolationPaidAt || '—' },
              { label: '合计扣款', value: (order.depositVehicleDeduct || 0) + (order.depositViolationDeduct || 0) > 0 ? <span style={{ color: '#F53F3F' }}>-¥${((order.depositVehicleDeduct || 0) + (order.depositViolationDeduct || 0)).toLocaleString()}</span> : '¥0' },
              { label: '合计退款', value: `¥${(((order.depositVehicle || 0) - (order.depositVehicleDeduct || 0)) + ((order.depositViolation || 0) - (order.depositViolationDeduct || 0))).toLocaleString()}` },
            ]} />
            <Card size="small" title="车辆押金" style={{ marginTop: 12, background: '#FAFBFC' }}
              extra={<Tag color={vRefunded ? 'green' : 'red'} size="small">{vRefunded ? '已退款' : '未退'}</Tag>}>
              <Descriptions column={2} size="small" data={[
                { label: '金额', value: `¥${(order.depositVehicle || 0).toLocaleString()}` },
                ...(vRefunded ? [
                  { label: '扣款', value: (order.depositVehicleDeduct || 0) > 0 ? <span style={{ color: '#F53F3F' }}>-¥{(order.depositVehicleDeduct || 0).toLocaleString()}</span> : '¥0' },
                  { label: '已退', value: <span style={{ color: '#00B42A' }}>¥{((order.depositVehicle || 0) - (order.depositVehicleDeduct || 0)).toLocaleString()}</span> },
                  { label: '退还时间', value: order.depositVehicleRefundedAt || '—' },
                ] : []),
              ]} />
            </Card>
            <Card size="small" title="违章押金" style={{ marginTop: 8, background: '#FAFBFC' }}
              extra={<Tag color={viRefunded ? 'green' : 'red'} size="small">{viRefunded ? '已退款' : '未退'}</Tag>}>
              <Descriptions column={2} size="small" data={[
                { label: '金额', value: `¥${(order.depositViolation || 0).toLocaleString()}` },
                ...(viRefunded ? [
                  { label: '扣款', value: (order.depositViolationDeduct || 0) > 0 ? <span style={{ color: '#F53F3F' }}>-¥{(order.depositViolationDeduct || 0).toLocaleString()}</span> : '¥0' },
                  { label: '已退', value: <span style={{ color: '#00B42A' }}>¥{((order.depositViolation || 0) - (order.depositViolationDeduct || 0)).toLocaleString()}</span> },
                  { label: '退还时间', value: order.depositViolationRefundedAt || '—' },
                ] : []),
              ]} />
            </Card>
            {hasUnrefunded && ['completed'].includes(order.status) && (
              <div style={{ textAlign: 'right', marginTop: 12 }}>
                <Button type="primary" size="small" status="warning" onClick={() => onRefundDeposit?.()}>退押金</Button>
              </div>
            )}
          </Card>
        );
      })()}

      {/* 费用明细弹窗 */}
      {feeModal.visible && (
        <FeeDetailSheet title={feeModal.type === 'main' || feeModal.type === 'mainFull' ? '费用信息' : feeModal.type === 'overtime' ? '超时长费明细' : feeModal.type === 'mileage' ? '超里程费明细' : feeModal.type === 'waiting' ? '等待费明细' : feeModal.type === 'remote' ? '远调费明细' : feeModal.type === 'refund' ? '退款明细' : '其他费用明细'}
          onClose={() => setFeeModal({ visible: false, type: 'overtime' })}>
          {feeModal.type === 'main' && (() => {
            const disc = Math.round(order.baseFee * (order.days || 1) * order.discount);
            const gross = order.baseFee * (order.days || 1);
            const unitDisc = Math.round(order.baseFee * order.discount);
            const coefLabel = `${(order.discount * 10).toFixed(1).replace(/\.0$/, '')}折`;
            const isCharter = order.type === 'charter';
            const dayLabel = isCharter ? '下单天数' : '租车天数';
            const hintLabel = `${isCharter ? '包车' : '租车'}${order.days}天，享${coefLabel}`;
            return (
              <div>
                <div style={feeRowStyle}><span style={{ fontSize: 15, fontWeight: 700, color: '#1A1C1C' }}>套餐总价</span><span style={{ fontSize: 18, fontWeight: 700 }}>¥{disc.toLocaleString()}</span></div>
                {order.discount < 1 && (
                  <div style={feeRowStyle}>
                    <span style={{ fontSize: 12, color: '#FF7D00' }}>共优惠¥{(gross - disc).toLocaleString()}</span>
                    <span style={{ fontSize: 12, color: '#86868B', textDecoration: 'line-through' }}>¥{gross.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ margin: '8px 0', padding: '12px 16px', background: '#F5F5F7', borderRadius: 12 }}>
                  <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>套餐单价</span><span style={{ fontSize: 16, fontWeight: 700 }}>¥{unitDisc.toLocaleString()}</span></div>
                  <div style={feeRowStyle}>
                    <span style={{ fontSize: 12, color: '#86868B' }}>{hintLabel}</span>
                    <span style={{ fontSize: 12, color: '#86868B', textDecoration: 'line-through' }}>¥{order.baseFee.toLocaleString()}</span>
                  </div>
                  <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>{dayLabel}</span><span style={{ fontSize: 14, fontWeight: 500 }}>{order.days}天</span></div>
                </div>
                {(() => {
                  const rd = order.remoteDispatchDetail;
                  const totalFee = rd ? rd.pickupFee + rd.dropoffFee : 0;
                  return totalFee > 0 ? <div style={feeRowStyle}><span style={{ fontSize: 15, fontWeight: 700, color: '#1A1C1C' }}>远调费</span><span style={{ fontSize: 15, fontWeight: 700 }}>¥{totalFee.toLocaleString()}</span></div> : null;
                })()}
              </div>
            );
          })()}
          {feeModal.type === 'mainFull' && (() => {
            const disc = Math.round(order.baseFee * (order.days || 1) * order.discount);
            const gross = order.baseFee * (order.days || 1);
            const unitDisc = Math.round(order.baseFee * order.discount);
            const coefLabel = `${(order.discount * 10).toFixed(1).replace(/\.0$/, '')}折`;
            const isCharter = order.type === 'charter';
            const dayLabel = isCharter ? '下单天数' : '租车天数';
            const hintLabel = `${isCharter ? '包车' : '租车'}${order.days}天，享${coefLabel}`;
            const rd = order.remoteDispatchDetail;
            const remoteFee = (rd?.pickupFee ?? 0) + (rd?.dropoffFee ?? 0);
            return (
              <div>
                <div style={feeRowStyle}><span style={{ fontSize: 15, fontWeight: 700 }}>套餐总价</span><span style={{ fontSize: 18, fontWeight: 700 }}>¥{disc.toLocaleString()}</span></div>
                {order.discount < 1 && (
                  <div style={feeRowStyle}>
                    <span style={{ fontSize: 12, color: '#FF7D00' }}>共优惠¥{(gross - disc).toLocaleString()}</span>
                    <span style={{ fontSize: 12, color: '#86868B', textDecoration: 'line-through' }}>¥{gross.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ margin: '8px 0', padding: '12px 16px', background: '#F5F5F7', borderRadius: 12 }}>
                  <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>套餐单价</span><span style={{ fontSize: 16, fontWeight: 700 }}>¥{unitDisc.toLocaleString()}</span></div>
                  <div style={feeRowStyle}>
                    <span style={{ fontSize: 12, color: '#86868B' }}>{hintLabel}</span>
                    <span style={{ fontSize: 12, color: '#86868B', textDecoration: 'line-through' }}>¥{order.baseFee.toLocaleString()}</span>
                  </div>
                  <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>实际使用天数</span><span style={{ fontSize: 14, fontWeight: 500 }}>{order.days}天</span></div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', margin: '4px 0', paddingTop: 8 }} />
                {remoteFee > 0 && (
                  <div style={{ ...feeRowStyle, cursor: 'pointer' }} onClick={() => setFeeModal({ visible: true, type: 'remote' })}>
                    <span style={{ fontSize: 14, color: '#F53F3F' }}>实际远调费</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#F53F3F', display: 'flex', alignItems: 'center', gap: 4 }}>¥{remoteFee.toLocaleString()} <span style={{ fontSize: 16, color: '#C9CDD4' }}>›</span></span>
                  </div>
                )}
                {order.overtimeFee > 0 && (
                  <div style={{ ...feeRowStyle, cursor: 'pointer' }} onClick={() => setFeeModal({ visible: true, type: 'overtime' })}>
                    <span style={{ fontSize: 14, color: '#F53F3F' }}>超时费</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#F53F3F', display: 'flex', alignItems: 'center', gap: 4 }}>¥{order.overtimeFee.toLocaleString()} <span style={{ fontSize: 16, color: '#C9CDD4' }}>›</span></span>
                  </div>
                )}
                {order.overmileageFee > 0 && (
                  <div style={{ ...feeRowStyle, cursor: 'pointer' }} onClick={() => setFeeModal({ visible: true, type: 'mileage' })}>
                    <span style={{ fontSize: 14, color: '#F53F3F' }}>超里程费</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#F53F3F', display: 'flex', alignItems: 'center', gap: 4 }}>¥{order.overmileageFee.toLocaleString()} <span style={{ fontSize: 16, color: '#C9CDD4' }}>›</span></span>
                  </div>
                )}
                {(order.overtimeFee > 0 || order.overmileageFee > 0) && (
                  <div style={{ ...feeRowStyle, cursor: 'pointer' }} onClick={() => setFeeModal({ visible: true, type: 'other' })}>
                    <span style={{ fontSize: 14, color: '#F53F3F' }}>其他费用</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#F53F3F', display: 'flex', alignItems: 'center', gap: 4 }}>¥{Math.round((order.overtimeFee + order.overmileageFee) * 0.1).toLocaleString()} <span style={{ fontSize: 16, color: '#C9CDD4' }}>›</span></span>
                  </div>
                )}
              </div>
            );
          })()}
          {feeModal.type === 'waiting' && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{order.schedules?.[0]?.date || '—'}</div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>司机到达时间</span><span style={{ fontSize: 14 }}>{order.schedules?.[0]?.timeRange?.split('-')[0] || '—'}</span></div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>司机到达地点</span><span style={{ fontSize: 14 }}>{order.pickupAddress}</span></div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>等待时长</span><span style={{ fontSize: 14 }}>0 分钟（实际 15min − 免费 15min）</span></div>
              <div style={{ borderTop: '1px solid #f0f0f0', margin: '8px 0', paddingTop: 8, ...feeRowStyle }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>等待费</span>
                <span style={{ fontSize: 16, fontWeight: 700 }}>¥0</span>
              </div>
            </div>
          )}
          {feeModal.type === 'overtime' && (
            <div>
              {(order.schedules || []).map((s, i) => {
                const overtimeH = order.overtimeFee > 0 ? Math.ceil(order.overtimeFee / 100) : 0;
                return (
                <div key={i} style={{ marginBottom: i < (order.schedules?.length || 1) - 1 ? 16 : 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{s.date}</div>
                  <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>行程开始时间</span><span style={{ fontSize: 14 }}>{s.timeRange.split('-')[0]}</span></div>
                  <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>行程结束时间</span><span style={{ fontSize: 14 }}>{s.timeRange.split('-')[1]}{order.overtimeFee > 0 ? ' (超时)' : ''}</span></div>
                  <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>实际使用时长</span><span style={{ fontSize: 14 }}>{overtimeH > 0 ? `${10 + overtimeH}小时` : '约10小时'}</span></div>
                  <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>套餐内时长</span><span style={{ fontSize: 14 }}>日租 8小时</span></div>
                  <div style={feeRowStyle}><span style={{ fontSize: 14, color: order.overtimeFee > 0 ? '#F53F3F' : '#4C4546' }}>超时长</span><span style={{ fontSize: 14, color: order.overtimeFee > 0 ? '#F53F3F' : '#000' }}>{overtimeH}小时</span></div>
                  <div style={{ borderTop: '1px solid #f0f0f0', margin: '8px 0', paddingTop: 8, ...feeRowStyle }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: order.overtimeFee > 0 ? '#F53F3F' : '#000' }}>超时长费</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: order.overtimeFee > 0 ? '#F53F3F' : '#000' }}>¥{order.overtimeFee.toLocaleString()}{order.overtimeFee > 0 ? `（${overtimeH}h × ¥100/h）` : ''}</span>
                  </div>
                </div>
                );
              })}
            </div>
          )}
          {feeModal.type === 'mileage' && (
            <div>
              {(order.schedules || order.days > 1 ? (order.schedules || Array.from({ length: order.days || 1 }, (_, i) => ({
                date: `0${6 + i}-${8 + i}`.slice(-5),
                timeRange: '08:00-18:00',
              }))).map((s, i) => {
                const share = (order.schedules?.length || order.days || 1);
                const dayFee = Math.round(order.overmileageFee / share);
                const dayExcess = order.overmileageFee > 0 ? Math.round((order.overmileageFee / 5) / share) : 0;
                return {
                  date: s.date,
                  startMileage: 120 + i * 40,
                  endMileage: 152 + i * 48 + (order.overmileageFee > 0 ? dayExcess * 5 : 0),
                  totalMileage: 32 + i * 16 + (order.overmileageFee > 0 ? dayExcess * 5 : 0),
                  included: 100,
                  excess: dayExcess,
                  amount: dayFee,
                };
              }) : []).map((d, i) => (
                <div key={i} style={{ marginBottom: i < 2 ? 16 : 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{d.date}</div>
                  <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>开始里程</span><span style={{ fontSize: 14 }}>{d.startMileage} km</span></div>
                  <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>结束里程</span><span style={{ fontSize: 14 }}>{d.endMileage} km</span></div>
                  <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>当日里程</span><span style={{ fontSize: 14 }}>{d.totalMileage} km（{d.endMileage} − {d.startMileage}）</span></div>
                  <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>套餐内里程</span><span style={{ fontSize: 14 }}>日租 {d.included}km</span></div>
                  <div style={feeRowStyle}><span style={{ fontSize: 14, color: d.excess > 0 ? '#F53F3F' : '#4C4546' }}>超里程</span><span style={{ fontSize: 14, color: d.excess > 0 ? '#F53F3F' : '#000' }}>{d.excess} km</span></div>
                  <div style={{ ...feeRowStyle, borderTop: '1px solid #f0f0f0', marginTop: 8, paddingTop: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#F53F3F' }}>超里程费</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#F53F3F' }}>¥{d.amount.toLocaleString()}</span>
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
                    <div style={{ width: 80, height: 60, background: '#F2F2F2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#86909c', flexDirection: 'column' }}>
                      <span style={{ fontSize: 18 }}>📷</span><span>开始里程</span>
                    </div>
                    <div style={{ width: 80, height: 60, background: '#F2F2F2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#86909c', flexDirection: 'column' }}>
                      <span style={{ fontSize: 18 }}>📷</span><span>结束里程</span>
                    </div>
                  </div>
                  {i < 2 && <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 12 }} />}
                </div>
              ))}
            </div>
          )}
          {feeModal.type === 'remote' && (() => {
            const rd = order.remoteDispatchDetail;
            const pickupLabel = order.type === 'charter' ? '接远调距离' : '取远调距离';
            const dropoffLabel = order.type === 'charter' ? '送远调距离' : '还远调距离';
            const totalFee = (rd?.pickupFee ?? 0) + (rd?.dropoffFee ?? 0);
            return (
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                  {order.type === 'charter' ? '包车出行' : '租车出行'} · 远调费明细
                </div>
                <div style={feeRowStyle}>
                  <span style={{ fontSize: 14, color: '#4C4546' }}>{pickupLabel}</span>
                  <span style={{ fontSize: 14 }}>{rd?.pickupKm ?? 0} km → ¥{rd?.pickupFee ?? 0}</span>
                </div>
                <div style={feeRowStyle}>
                  <span style={{ fontSize: 14, color: '#4C4546' }}>{dropoffLabel}</span>
                  <span style={{ fontSize: 14 }}>{rd?.dropoffKm ?? 0} km → ¥{rd?.dropoffFee ?? 0}</span>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', margin: '8px 0', paddingTop: 8, ...feeRowStyle }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: totalFee > 0 ? '#F53F3F' : '#000' }}>远调费合计</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: totalFee > 0 ? '#F53F3F' : '#000' }}>¥{totalFee.toLocaleString()}</span>
                </div>
              </div>
            );
          })()}
          {feeModal.type === 'other' && (
            <div>
              {[ { date: '06-10', type: '高速费', amount: 35, voucher: 'voucher_highway.jpg' },
                 { date: '06-11', type: '停车费', amount: 20, voucher: 'voucher_parking.jpg' },
              ].map((r, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{r.date} · {r.type}</div>
                  <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#F53F3F' }}>金额</span><span style={{ fontSize: 14, fontWeight: 500, color: '#F53F3F' }}>¥{r.amount.toLocaleString()}</span></div>
                  <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>凭证</span><span style={{ fontSize: 14, color: '#165DFF', cursor: 'pointer' }} onClick={() => Message.info(`预览凭证：${r.voucher}`)}>查看凭证 ›</span></div>
                  {i < 1 && <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 12 }} />}
                </div>
              ))}
            </div>
          )}
          {/* 退款明细 — 灰底分笔记录 */}
          {feeModal.type === 'refund' && (
            <div>
              {(() => {
                // 静态示例退款记录
                const records = order.refundRecords && order.refundRecords.length > 0 ? order.refundRecords : [
                  { id: 'r1', amount: 2000, time: '06-13 10:30', type: '差额退还' as const, reason: '提前结束行程，差额自动退还' },
                  { id: 'r2', amount: 800, time: '06-14 16:00', type: '平台退款' as const, reason: '运营手动退款：维修补偿' },
                  { id: 'r3', amount: 6264, time: '06-09 18:00', type: '取消退款' as const, reason: '支付超时全额自动退款' },
                ];
                const typeLabel = (t: string) => t === '差额退还' ? '差额退还' : t === '平台退款' ? '平台退款' : t === '取消退款' ? '取消退款' : t === 'manual' ? '手工退款' : '订单退款';
                return records.map((r: any, i: number) => (
                  <div key={r.id || i} style={{ marginBottom: i < records.length - 1 ? 12 : 0, padding: '12px 16px', background: '#F5F5F7', borderRadius: 12 }}>
                    <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>退款金额</span><span style={{ fontSize: 16, fontWeight: 700, color: '#F53F3F' }}>-¥{(r.amount || 0).toLocaleString()}</span></div>
                    <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>申请退款时间</span><span style={{ fontSize: 14 }}>{r.time || '—'}</span></div>
                    <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>退款类型</span><span style={{ fontSize: 14 }}>{order.status === 'cancelled' ? '取消退款' : typeLabel(r.type || '')}</span></div>
                    <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>备注</span><span style={{ fontSize: 14 }}>{r.reason || r.remark || '—'}</span></div>
                  </div>
                ));
              })()}
            </div>
          )}
        </FeeDetailSheet>
      )}

      {/* 订单动态（按规格全量节点，倒序展示） */}
      <Card title="订单动态" style={{ marginBottom: 16 }} size="small">
        <Timeline reverse>
          {(() => {
            // 时间偏移工具：基于 "YYYY-MM-DD HH:mm" 增减分钟
            const shiftMin = (dt: string, mins: number): string => {
              const d = new Date((dt || '').replace(' ', 'T'));
              if (isNaN(d.getTime())) return dt || '—';
              d.setMinutes(d.getMinutes() + mins);
              const p = (n: number) => String(n).padStart(2, '0');
              return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
            };
            const payLabel = payMethodMap[order.paymentMethod]?.label || '';
            const remoteFee = (order.remoteDispatchDetail?.pickupFee ?? 0) + (order.remoteDispatchDetail?.dropoffFee ?? 0);
            const extraTotal = Math.max(0, order.overtimeFee + order.overmileageFee + remoteFee - pointsDeduction);
            const st = order.startTime || (order.rentalStart ? `${order.rentalStart} 08:00` : '');
            const et = order.endTime || (order.rentalEnd ? `${order.rentalEnd} 18:00` : '');
            const arrived = shiftMin(st, -8);
            const depart = shiftMin(st, -30);
            const settled = shiftMin(et, 15);
            // 节点：{ time, text, color }，按时间正序 push，reverse 后最新在上
            type Node = { time: string; text: React.ReactNode; color?: string };
            const nodes: Node[] = [];
            nodes.push({ time: order.createdAt, text: '订单已提交', color: '#86909C' });
            if (order.paymentTime) nodes.push({
              time: order.paymentTime, color: '#00B42A',
              text: <>支付成功 — {payLabel} ¥{order.paidAmount.toLocaleString()}{pointsUsed > 0 && <span style={{ color: '#00B42A', marginLeft: 6 }}>使用积分 {pointsUsed.toLocaleString()}</span>}</>,
            });
            // 派车后节点
            const dispatched = !!((order.schedules && order.schedules.length > 0) || order.plateNo);
            const postPay = ['pending_start', 'pending_enroute', 'ongoing', 'completed', 'pending_extra'].includes(order.status);
            if (dispatched && postPay) {
              const plate = order.plateNo || order.schedules?.[0]?.vehiclePlate || '';
              if (!isCharter) {
                // 租车：派车 → 送车出发 → 确认送达 → 行程开始 → 收车出发 → 确认收车
                nodes.push({ time: order.schedules?.[0]?.date || st, color: '#165DFF', text: <>已派车 — {plate}。送车司机 {order.deliveryDriver || '—'}、收车司机 {order.pickupDriver || '—'}</> });
                if (['ongoing', 'completed', 'pending_extra'].includes(order.status)) {
                  nodes.push({ time: depart, color: 'cyan', text: <>送车司机 {order.deliveryDriver || '—'} 已出发</> });
                  nodes.push({ time: shiftMin(st, -5), color: '#00B42A', text: <>车辆已送达取车点 — {order.pickupAddress}</> });
                  nodes.push({ time: st, color: '#00B42A', text: <>行程开始 — {plate}</> });
                }
                if (['completed', 'pending_extra'].includes(order.status)) {
                  nodes.push({ time: shiftMin(et, -40), color: 'cyan', text: <>收车司机 {order.pickupDriver || '—'} 已出发</> });
                  nodes.push({ time: et, color: '#00B42A', text: <>收车完成 — 里程 {120 + order.overmileageFee / 5}km，用车 {order.days} 天</> });
                }
              } else {
                // 包车：派车 → 司机出发 → 司机到达 → 行程开始 → 当日行程结束
                nodes.push({ time: order.schedules?.[0]?.date || st, color: '#165DFF', text: <>已派车 — {plate}</> });
                if (['pending_enroute', 'ongoing', 'completed', 'pending_extra'].includes(order.status)) {
                  nodes.push({ time: depart, color: 'cyan', text: <>{order.driverName || '司机'} 已出发</> });
                }
                if (['ongoing', 'completed', 'pending_extra'].includes(order.status)) {
                  nodes.push({ time: arrived, color: 'cyan', text: <>{order.driverName || '司机'} 已到达上车点 — {order.pickupAddress}</> });
                  nodes.push({ time: st, color: '#00B42A', text: <>行程开始 — {order.driverName || '—'}·{plate}</> });
                }
                if (['completed', 'pending_extra'].includes(order.status)) {
                  nodes.push({ time: et, color: '#00B42A', text: <>当日行程结束 — 用时 10h，里程 {100 + order.overmileageFee / 5}km</> });
                }
              }
            }
            // 差额待结算
            if (order.status === 'pending_extra') {
              nodes.push({ time: et, color: '#F53F3F', text: <>需补款 ¥{extraTotal.toLocaleString()}</> });
            }
            // 结算完成 + 订单完成
            if (order.status === 'completed') {
              if (extraTotal > 0) nodes.push({ time: settled, color: '#00B42A', text: <>结算完成 — {payLabel} ¥{extraTotal.toLocaleString()}</> });
              nodes.push({ time: settled, color: '#00B42A', text: '订单已完成' });
            }
            // 押金退还（车辆 / 违章分别展示）
            if (!isCharter) {
              if (order.depositVehicleRefunded && order.depositVehicleRefundedAt) {
                const vRefund = (order.depositVehicle || 0) - (order.depositVehicleDeduct || 0);
                nodes.push({ time: order.depositVehicleRefundedAt, color: '#00B42A', text: <>退还车辆押金 ¥{vRefund.toLocaleString()}{(order.depositVehicleDeduct || 0) > 0 ? `（扣 ¥${(order.depositVehicleDeduct || 0).toLocaleString()}）` : ''}</> });
              }
              if (order.depositViolationRefunded && order.depositViolationRefundedAt) {
                const viRefund = (order.depositViolation || 0) - (order.depositViolationDeduct || 0);
                nodes.push({ time: order.depositViolationRefundedAt, color: '#00B42A', text: <>退还违章押金 ¥{viRefund.toLocaleString()}{(order.depositViolationDeduct || 0) > 0 ? `（扣 ¥${(order.depositViolationDeduct || 0).toLocaleString()}）` : ''}</> });
              }
            }
            // 退款记录（手工退款 / 订单退款 / 提前结束）
            (order.refundRecords || []).forEach(r => {
              if (r.type === 'manual') {
                nodes.push({ time: r.time, color: '#F53F3F', text: <>{r.operator || '运营'} 发起退款 — ¥{r.amount.toLocaleString()}，原因：{r.reason || '—'}</> });
              } else if (r.orderRefundType === 'early_end') {
                nodes.push({ time: r.time, color: '#F53F3F', text: <>提前结束行程 — 退款 ¥{r.amount.toLocaleString()}</> });
              } else {
                nodes.push({ time: r.time, color: '#F53F3F', text: <>退款 ¥{r.amount.toLocaleString()} — {r.orderRefundType === 'cancel' ? '取消订单' : '—'}</> });
              }
            });
            // 取消订单
            if (order.status === 'cancelled') {
              nodes.push({ time: order.createdAt, color: '#86909C', text: <>订单已取消 — {order.internalNote || '—'}{order.refundAmount ? `，退款 ¥${order.refundAmount.toLocaleString()}` : ''}</> });
            }
            return nodes.map((n, i) => (
              <Timeline.Item key={i} label={n.time} dotColor={n.color}>{n.text}</Timeline.Item>
            ));
          })()}
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

    </div>
  );
}
