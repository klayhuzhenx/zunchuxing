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

const statusMap: Record<OrderStatus, { label: string; color: string }> = {
  unpaid: { label: '待支付', color: 'orange' },
  pending_dispatch: { label: '待派车', color: 'red' },
  pending_start: { label: '待开始', color: 'arcoblue' },
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

export default function OrderList() {
  const [orderType, setOrderType] = useState<OrderType>('charter');
  const [activeTab, setActiveTab] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [tripDateRange, setTripDateRange] = useState<[string, string] | null>(null);
  const [orderDateRange, setOrderDateRange] = useState<[string, string] | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [dispatchVisible, setDispatchVisible] = useState(false);
  const [data, setData] = useState<Order[]>(orders);

  const filtered = useMemo(() => {
    let result = data.filter(o => o.type === orderType);
    if (activeTab !== 'all') {
      if (activeTab === 'pending_start') {
        result = result.filter(o => o.status === 'pending_dispatch' || o.status === 'pending_start');
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

  const handleDispatchComplete = (orderId: string, schedules: { date: string; timeRange: string; vehiclePlate: string; vehicleModel: string; driverName?: string; driverPhone?: string }[]) => {
    const targetOrder = data.find(o => o.id === orderId);
    const isReassign = targetOrder && (targetOrder.status === 'pending_start' || targetOrder.status === 'ongoing');

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
    { title: '类型', width: 70, render: () => <Tag color="arcoblue" size="small">包车</Tag> },
    { title: '下单人', width: 130, render: (_: unknown, r: Order) => `${r.passengerName || '—'} ${r.passengerPhone}` },
    { title: '用车时间', width: 200, render: (_: unknown, r: Order) => <div><div>{r.startTime} ~ {r.endTime?.split(' ')[1]}</div>{r.days > 1 && <Tag size="small" color="arcoblue" style={{ marginTop: 2 }}>{r.days}天</Tag>}</div> },
    { title: '上车地点', dataIndex: 'pickupAddress', width: 140, ellipsis: true },
    { title: '下车地点', dataIndex: 'dropoffAddress', width: 140, ellipsis: true },
    { title: '司机', width: 80, render: (_: unknown, r: Order) => r.driverName || '-' },
    { title: '车辆', width: 100, render: (_: unknown, r: Order) => r.plateNo || '-' },
    { title: '金额', width: 100, render: (_: unknown, r: Order) => `¥${(r.baseFee + r.overtimeFee + r.overmileageFee - Math.floor((r.pointsUsed || 0) / 100)).toLocaleString()}` },
    { title: '状态', width: 80, render: (_: unknown, r: Order) => <Tag color={statusMap[r.status].color} size="small">{statusMap[r.status].label}</Tag> },
    { title: '下单时间', dataIndex: 'createdAt', width: 140 },
    { title: '操作', width: 140, fixed: 'right' as const, render: (_: unknown, record: Order) => actionCol(record) },
  ];

  // === 租车列表字段 ===
  const rentalColumns = [
    { title: '订单号', dataIndex: 'orderNo', width: 160, render: (v: string, r: Order) => <a onClick={() => openDetail(r)}>{v}</a> },
    { title: '类型', width: 70, render: () => <Tag color="purple" size="small">租车</Tag> },
    { title: '下单人', width: 130, render: (_: unknown, r: Order) => `${r.passengerName || '—'} ${r.passengerPhone}` },
    { title: '租期', width: 170, render: (_: unknown, r: Order) => <div>{r.rentalStart} ~ {r.rentalEnd} <Tag size="small" color="purple" style={{ marginLeft: 4 }}>共{r.days}天</Tag></div> },
    { title: '取车地点', dataIndex: 'pickupAddress', width: 130, ellipsis: true },
    { title: '还车地点', dataIndex: 'dropoffAddress', width: 130, ellipsis: true },
    { title: '车辆', width: 100, render: (_: unknown, r: Order) => r.plateNo || '-' },
    { title: '送车司机', width: 80, render: (_: unknown, r: Order) => r.deliveryDriver || '-' },
    { title: '收车司机', width: 80, render: (_: unknown, r: Order) => r.pickupDriver || '-' },
    { title: '金额', width: 100, render: (_: unknown, r: Order) => `¥${(r.baseFee + r.overtimeFee + r.overmileageFee - Math.floor((r.pointsUsed || 0) / 100)).toLocaleString()}` },
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
        {selectedOrder && <OrderDetailPanel order={selectedOrder} />}
      </Drawer>

      <DispatchModal visible={dispatchVisible} order={selectedOrder}
        onClose={() => setDispatchVisible(false)} onComplete={handleDispatchComplete} />
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
function OrderDetailPanel({ order }: { order: Order }) {
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [feeModal, setFeeModal] = useState<{ visible: boolean; type: 'waiting' | 'overtime' | 'mileage' | 'remote' | 'other' }>({ visible: false, type: 'overtime' });
  const feeRowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' };
  const beforeDispatch = ['unpaid', 'pending_dispatch'].includes(order.status);

  const relatedDriverOrders = driverOrders.filter(d => d.orderId === order.id);
  const isCharter = order.type === 'charter';

  // 积分抵扣（100积分=¥1）
  const pointsUsed = order.pointsUsed || 0;
  const pointsDeduction = Math.floor(pointsUsed / 100);

  const handleSaveNote = () => {
    if (!noteText.trim()) { Message.warning('请输入备注内容'); return; }
    Message.success('备注已保存'); setShowNote(false); setNoteText('');
  };

  return (
    <div>
      {/* 基本信息（含下单人） */}
      <Card title="基本信息" style={{ marginBottom: 16 }} size="small">
        <Descriptions column={2} size="small" data={[
          { label: '订单号', value: order.orderNo },
          { label: '订单类型', value: <Tag color={isCharter ? 'arcoblue' : 'purple'} size="small">{isCharter ? '包车出行' : '租车出行'}</Tag> },
          ...(order.status === 'pending_extra' ? [{ label: '子状态', value: <Tag color="orangered" size="small">待结算</Tag> }] : []),
          { label: '下单人', value: order.passengerName || '—' },
          { label: '手机号', value: order.passengerPhone },
          { label: '用户身份', value: order.userIdentity === 'enterprise_employee' ? <Tag color='arcoblue' size='small'>企业员工</Tag> : <Tag color='green' size='small'>个人</Tag> },
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
          <span style={{ fontSize: 14, fontWeight: 500 }}>¥{order.baseFee.toLocaleString()} / 天{order.days > 1 ? ` × ${order.days} 天` : ''}</span>
        </div>
      </Card>

      {/* 费用明细 — 按规格 §4.4 费用项逐行展示 */}
      <Card title="费用明细" style={{ marginBottom: 16 }} size="small">
        {/* 套餐费 */}
        <div style={feeRowStyle}>
          <span style={{ fontSize: 14, color: '#4E5969' }}>套餐费</span>
          <span style={{ fontSize: 14 }}>¥{order.baseFee.toLocaleString()} × {order.days || 1} 天 = ¥{(order.baseFee * (order.days || 1)).toLocaleString()}</span>
        </div>

        {/* 等待费 */}
        <div style={{ ...feeRowStyle, cursor: order.schedules ? 'pointer' : 'default' }}
          onClick={() => { if (order.schedules) setFeeModal({ visible: true, type: 'waiting' }); }}>
          <span style={{ fontSize: 14, color: '#4E5969' }}>等待费 · 免费15min ¥1/min</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#86909c' }}>¥0</span>
        </div>

        {/* 超时长费 */}
        <div style={{ ...feeRowStyle, cursor: order.overtimeFee > 0 ? 'pointer' : 'default' }}
          onClick={() => { if (order.overtimeFee > 0) setFeeModal({ visible: true, type: 'overtime' }); }}>
          <span style={{ fontSize: 14, color: order.overtimeFee > 0 ? '#F53F3F' : '#4E5969' }}>超时长费 · ¥100/h</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: order.overtimeFee > 0 ? '#F53F3F' : '#000' }}>
            {order.overtimeFee > 0 ? `¥${order.overtimeFee.toLocaleString()} 明细 ›` : '¥0'}
          </span>
        </div>

        {/* 超里程费 */}
        <div style={{ ...feeRowStyle, cursor: order.overmileageFee > 0 ? 'pointer' : 'default' }}
          onClick={() => { if (order.overmileageFee > 0) setFeeModal({ visible: true, type: 'mileage' }); }}>
          <span style={{ fontSize: 14, color: order.overmileageFee > 0 ? '#F53F3F' : '#4E5969' }}>超里程费 · ¥5/km</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: order.overmileageFee > 0 ? '#F53F3F' : '#000' }}>
            {order.overmileageFee > 0 ? `¥${order.overmileageFee.toLocaleString()} 明细 ›` : '¥0'}
          </span>
        </div>

        {/* 远调费：上车/下车点超出运营范围时按梯度收取 */}
        {(() => {
          const rd = order.remoteDispatchDetail;
          const totalFee = rd ? rd.pickupFee + rd.dropoffFee : 0;
          const totalKm = rd ? rd.pickupKm + rd.dropoffKm : 0;
          const hasFee = totalFee > 0;
          const isCharter = order.type === 'charter';
          return (
            <div style={{ ...feeRowStyle, cursor: hasFee ? 'pointer' : 'default' }}
              onClick={() => { if (hasFee) setFeeModal({ visible: true, type: 'remote' }); }}>
              <span style={{ fontSize: 14, color: hasFee ? '#F53F3F' : '#4E5969' }}>
                远调费{totalKm > 0 ? ` · ${totalKm.toFixed(1)}km` : ''}
              </span>
              <span style={{ fontSize: 14, fontWeight: 500, color: hasFee ? '#F53F3F' : '#000' }}>
                {hasFee ? `¥${totalFee.toLocaleString()} 明细 ›` : '¥0'}
              </span>
            </div>
          );
        })()}

        {/* 其他费用 */}
        <div style={{ ...feeRowStyle, cursor: (order.overtimeFee > 0 || order.overmileageFee > 0) ? 'pointer' : 'default' }}
          onClick={() => { if (order.overtimeFee > 0 || order.overmileageFee > 0) setFeeModal({ visible: true, type: 'other' }); }}>
          <span style={{ fontSize: 14, color: order.overtimeFee > 0 || order.overmileageFee > 0 ? '#F53F3F' : '#4E5969' }}>其他费用</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: order.overtimeFee > 0 || order.overmileageFee > 0 ? '#F53F3F' : '#000' }}>
            {order.overtimeFee > 0 || order.overmileageFee > 0 ? `¥${Math.round((order.overtimeFee + order.overmileageFee) * 0.1).toLocaleString()} 明细 ›` : '¥0'}
          </span>
        </div>

        {/* 积分抵扣（有使用积分时展示绿色行） */}
        {pointsUsed > 0 && (
          <div style={feeRowStyle}>
            <span style={{ fontSize: 14, color: '#00B42A' }}>积分抵扣（使用 {pointsUsed.toLocaleString()} 积分）</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#00B42A' }}>-¥{pointsDeduction.toLocaleString()}</span>
          </div>
        )}

        {/* 合计费用 */}
        <div style={{ borderTop: '1px solid #e5e6eb', margin: '4px 0', paddingTop: 8, ...feeRowStyle }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>合计费用</span>
          <span style={{ fontSize: 18, fontWeight: 700 }}>¥{Math.max(0, order.baseFee * (order.days || 1) + order.overtimeFee + order.overmileageFee + ((order.remoteDispatchDetail?.pickupFee ?? 0) + (order.remoteDispatchDetail?.dropoffFee ?? 0)) - pointsDeduction).toLocaleString()}</span>
        </div>

        {/* 待结算费用 — 仅待结算状态展示 */}
        {order.status === 'pending_extra' && (
          <div style={{ ...feeRowStyle, color: '#F53F3F' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#F53F3F' }}>待结算费用</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#F53F3F' }}>¥{Math.max(0, order.overtimeFee + order.overmileageFee + ((order.remoteDispatchDetail?.pickupFee ?? 0) + (order.remoteDispatchDetail?.dropoffFee ?? 0)) - pointsDeduction).toLocaleString()}</span>
          </div>
        )}
      </Card>

      {/* 费用明细弹窗 */}
      {feeModal.visible && (
        <FeeDetailSheet title={feeModal.type === 'overtime' ? '超时长费明细' : feeModal.type === 'mileage' ? '超里程费明细' : feeModal.type === 'waiting' ? '等待费明细' : feeModal.type === 'remote' ? '远调费明细' : '其他费用明细'}
          onClose={() => setFeeModal({ visible: false, type: 'overtime' })}>
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
        </FeeDetailSheet>
      )}

      {/* 订单动态（按状态展示完整时间线） */}
      <Card title="订单动态" style={{ marginBottom: 16 }} size="small">
        <Timeline reverse>
          <Timeline.Item label={order.createdAt}>订单已提交</Timeline.Item>
          {order.paymentTime && <Timeline.Item label={order.paymentTime} dotColor="#00B42A">
            支付成功（{payMethodMap[order.paymentMethod].label}）· ¥{order.paidAmount.toLocaleString()}
            {pointsUsed > 0 && <span style={{ color: '#00B42A', marginLeft: 6 }}>使用积分 {pointsUsed.toLocaleString()}</span>}
          </Timeline.Item>}
          {order.schedules && order.schedules.length > 0 && (
            <Timeline.Item label={order.schedules[0].date} dotColor="#165DFF">
              已派车 — {order.schedules[0].vehicleModel} · {order.schedules[0].vehiclePlate} / 司机 {order.schedules[0].driverName}
            </Timeline.Item>
          )}
          {(order.status === 'ongoing' || order.status === 'completed' || order.status === 'pending_extra') && (
            <Timeline.Item label={order.startTime || '--'} dotColor="cyan">行程开始</Timeline.Item>
          )}
          {order.status === 'completed' && (
            <Timeline.Item label={order.endTime || '--'} dotColor="green">行程结束</Timeline.Item>
          )}
          {order.status === 'pending_extra' && (
            <Timeline.Item label={order.endTime || '--'} dotColor="#F53F3F">
              行程结束 — 待结算 ¥{Math.max(0, order.overtimeFee + order.overmileageFee + ((order.remoteDispatchDetail?.pickupFee ?? 0) + (order.remoteDispatchDetail?.dropoffFee ?? 0)) - pointsDeduction).toLocaleString()}
            </Timeline.Item>
          )}
          {order.status === 'cancelled' && (
            <Timeline.Item label="--" dotColor="gray">订单已取消{order.internalNote ? ` — ${order.internalNote}` : ''}</Timeline.Item>
          )}
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

      {/* 操作日志 */}
      <Card title="操作日志" style={{ marginBottom: 16 }} size="small">
        <Timeline>
          <Timeline.Item label={order.createdAt}>系统 · 创建订单</Timeline.Item>
          {order.paymentTime && <Timeline.Item label={order.paymentTime}>系统 · 支付确认</Timeline.Item>}
          {order.schedules && order.schedules.length > 0 && (
            <Timeline.Item label={order.schedules[0].date}>张管理 · 派车（{order.schedules[0].vehiclePlate} / {order.schedules[0].driverName}）</Timeline.Item>
          )}
          {order.internalNote && <Timeline.Item label="--">运营 · 添加内部备注</Timeline.Item>}
        </Timeline>
      </Card>

    </div>
  );
}
