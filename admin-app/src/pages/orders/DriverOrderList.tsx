import { useState, useMemo } from 'react';
import { Card, Table, Tag, Button, Input, Select, Space, Tabs, Drawer, Descriptions, DatePicker, Timeline, Modal } from '@arco-design/web-react';
import { IconSearch, IconClose } from '@arco-design/web-react/icon';
import { driverOrders, orders } from '../../data/mock';
import type { DriverOrder, DriverOrderStatus, OrderType } from '../../types';

const statusTabs: { key: string; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'not_started', label: '待开始' },
  { key: 'in_progress', label: '进行中' },
  { key: 'pending_settlement', label: '待结算' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

const statusMap: Record<DriverOrderStatus, { label: string; color: string }> = {
  not_started: { label: '待开始', color: 'arcoblue' },
  in_progress: { label: '进行中', color: 'orangered' },
  pending_settlement: { label: '待结算', color: 'red' },
  completed: { label: '已完成', color: 'green' },
  cancelled: { label: '已取消', color: 'gray' },
};

const feeRowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' };

export default function DriverOrderList() {
  const [activeTab, setActiveTab] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<OrderType | ''>('');
  const [driverFilter, setDriverFilter] = useState<string>('');
  const [tripDateRange, setTripDateRange] = useState<[string, string] | null>(null);
  const [selectedDriverOrder, setSelectedDriverOrder] = useState<DriverOrder | null>(null);
  const [driverDrawerVisible, setDriverDrawerVisible] = useState(false);
  const filtered = useMemo(() => {
    let result = driverOrders;
    if (activeTab !== 'all') result = result.filter(o => o.status === activeTab);
    if (typeFilter) result = result.filter(o => o.type === typeFilter);
    if (driverFilter) result = result.filter(o => o.driverName === driverFilter);
    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(o =>
        o.driverOrderNo.toLowerCase().includes(kw) ||
        o.orderNo.toLowerCase().includes(kw) ||
        o.passengerName.toLowerCase().includes(kw) ||
        o.passengerPhone.includes(kw) ||
        o.driverName.toLowerCase().includes(kw) ||
        o.plateNo.toLowerCase().includes(kw)
      );
    }
    if (vehicleFilter) {
      result = result.filter(o => o.plateNo.toLowerCase().includes(vehicleFilter.toLowerCase()));
    }
    if (tripDateRange) {
      const [s, e] = tripDateRange;
      result = result.filter(o => o.tripDate >= s && o.tripDate <= e);
    }
    return result;
  }, [activeTab, keyword, vehicleFilter, typeFilter, driverFilter, tripDateRange]);

  const openDriverDetail = (record: DriverOrder) => {
    setSelectedDriverOrder(record);
    setDriverDrawerVisible(true);
  };

  const columns = [
    { title: '司机工单号', dataIndex: 'driverOrderNo', width: 160 },
    { title: '关联订单号', dataIndex: 'orderNo', width: 160, render: (v: string) => <a>{v}</a> },
    { title: '类型', dataIndex: 'type', width: 70, render: (v: string) => (
      <Tag color={v === 'charter' ? 'arcoblue' : 'purple'} size="small">{v === 'charter' ? '包车' : '租车'}</Tag>
    )},
    { title: '司机', width: 120, render: (_: unknown, r: DriverOrder) => `${r.driverName} ${r.driverPhone}` },
    { title: '车辆', dataIndex: 'plateNo', width: 100 },
    { title: '乘客', width: 120, render: (_: unknown, r: DriverOrder) => `${r.passengerName || '—'} ${r.passengerPhone}` },
    { title: '计划出车时间', width: 180, render: (_: unknown, r: DriverOrder) => r.plannedPickupTime || `${r.tripDate} ${r.plannedTimeRange?.split('-')[0] || ''}` },
    { title: '实际开始', dataIndex: 'actualStartTime', width: 140, render: (v: string) => v || '-' },
    { title: '实际结束', dataIndex: 'actualEndTime', width: 140, render: (v: string) => v || '-' },
    { title: '时长', dataIndex: 'duration', width: 70, render: (v: number) => v ? `${Math.floor(v / 60)}h${v % 60}m` : '-' },
    { title: '里程', dataIndex: 'mileage', width: 70, render: (v: number) => v ? `${v}km` : '-' },
    { title: '费用', dataIndex: 'extraFee', width: 90, render: (v: number, r: DriverOrder) => {
      // 仅"待结算"状态展示司机端上报的其他费用合计
      if (r.status !== 'pending_settlement' && r.status !== 'completed') return '-';
      return v && v > 0 ? <span style={{ color: '#F53F3F' }}>¥{v.toLocaleString()}</span> : '¥0';
    }},
    { title: '状态', dataIndex: 'status', width: 80, render: (v: DriverOrderStatus) => (
      <Tag color={statusMap[v].color} size="small">{statusMap[v].label}</Tag>
    )},
    { title: '操作', width: 80, fixed: 'right' as const, render: (_: unknown, record: DriverOrder) => <Button type="text" size="small" onClick={() => openDriverDetail(record)}>详情</Button> },
  ];

  return (
    <div>
      <Tabs activeTab={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }}>
        {statusTabs.map(tab => <Tabs.TabPane key={tab.key} title={tab.label} />)}
      </Tabs>

      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12}>
          <Input prefix={<IconSearch />} placeholder="工单号/关联订单号/乘客/手机号" style={{ width: 300 }}
            value={keyword} onChange={setKeyword} allowClear />
          <Select placeholder="订单类型" style={{ width: 120 }}
            value={typeFilter || undefined} onChange={v => setTypeFilter((v || '') as OrderType | '')}
            options={[{ label: '包车', value: 'charter' }, { label: '租车', value: 'rental' }]} allowClear />
          <Select placeholder="司机" style={{ width: 140 }} allowClear showSearch
            value={driverFilter || undefined} onChange={v => setDriverFilter(v || '')}
            options={[...new Set(driverOrders.map(d => d.driverName))].map(n => ({ label: n, value: n }))} />
          <Input prefix={<IconSearch />} placeholder="车辆车牌号" style={{ width: 160 }} value={vehicleFilter} onChange={setVehicleFilter} allowClear />
          <DatePicker.RangePicker style={{ width: 260 }} placeholder={['出车时间起', '出车时间止']}
            onChange={(_, ds) => setTripDateRange(ds && ds[0] && ds[1] ? ds as [string, string] : null)} />
        </Space>
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={filtered} rowKey="id"
          scroll={{ x: 1700 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>

      <Drawer width="60%" title={selectedDriverOrder ? `司机工单详情 - ${selectedDriverOrder.driverOrderNo}` : '司机工单详情'}
        visible={driverDrawerVisible} onCancel={() => setDriverDrawerVisible(false)} footer={null}>
        {selectedDriverOrder && (
          <div>
            {/* 基本信息 */}
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small" data={[
                { label: '工单号', value: selectedDriverOrder.driverOrderNo },
                { label: '工单状态', value: <Tag color={statusMap[selectedDriverOrder.status].color} size="small">{statusMap[selectedDriverOrder.status].label}</Tag> },
                { label: '关联订单号', value: <a>{selectedDriverOrder.orderNo}</a> },
                { label: '计划出车时间', value: selectedDriverOrder.plannedPickupTime || `${selectedDriverOrder.tripDate} ${selectedDriverOrder.plannedTimeRange?.split('-')[0] || ''}` },
                { label: '预计上车时间', value: selectedDriverOrder.plannedPickupTime || '-' },
              ]} />
            </Card>

            {/* 车辆与司机 */}
            <Card title="车辆与司机" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small" data={[
                { label: '车牌号', value: selectedDriverOrder.plateNo },
                { label: '司机', value: `${selectedDriverOrder.driverName} ${selectedDriverOrder.driverPhone}` },
              ]} />
            </Card>

            {/* 乘客信息 */}
            <Card title="乘客信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small" data={[
                { label: '乘客', value: `${selectedDriverOrder.passengerName ? `${selectedDriverOrder.passengerName} · ` : ''}${selectedDriverOrder.passengerPhone}` },
                { label: '上车点', value: selectedDriverOrder.pickupAddress || '-' },
                { label: '下车点', value: selectedDriverOrder.dropoffAddress || '-' },
                ...(selectedDriverOrder.actualPickupAddress ? [{ label: '实际上车点', value: selectedDriverOrder.actualPickupAddress }] : []),
                ...(selectedDriverOrder.actualDropoffAddress ? [{ label: '实际下车点', value: selectedDriverOrder.actualDropoffAddress }] : []),
              ]} />
            </Card>

            {/* 里程信息 */}
            <Card title="里程信息" size="small" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 120, height: 90, background: '#F2F2F2', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#86909c' }}>
                  <span style={{ fontSize: 24 }}>📷</span><span>开始里程</span>
                </div>
                <div style={{ width: 120, height: 90, background: '#F2F2F2', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#86909c' }}>
                  <span style={{ fontSize: 24 }}>📷</span><span>结束里程</span>
                </div>
              </div>
              <Descriptions column={1} size="small" data={[
                { label: '当日里程', value: selectedDriverOrder.mileage ? `${selectedDriverOrder.mileage} km` : '-' },
              ]} />
            </Card>

            {/* 费用明细 — 与乘客订单同款样式，无日期+无套餐费 */}
            <Card title="费用明细" size="small" style={{ marginBottom: 16 }}>
              <div style={{ ...feeRowStyle }}>
                <span style={{ fontSize: 14, color: '#4E5969' }}>等待费</span>
                <span style={{ fontSize: 14, color: '#86909c' }}>¥0</span>
              </div>
              <div style={{ ...feeRowStyle }}>
                <span style={{ fontSize: 14, color: (selectedDriverOrder.extraFee || 0) > 0 ? '#F53F3F' : '#4E5969' }}>超时长费</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: (selectedDriverOrder.extraFee || 0) > 0 ? '#F53F3F' : '#000' }}>
                  ¥{((selectedDriverOrder.extraFeeItems || []).filter((f: any) => f.type === 'overtime').reduce((s: number, f: any) => s + f.amount, 0)).toLocaleString()}
                </span>
              </div>
              <div style={{ ...feeRowStyle }}>
                <span style={{ fontSize: 14, color: (selectedDriverOrder.extraFee || 0) > 0 ? '#F53F3F' : '#4E5969' }}>超里程费</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: (selectedDriverOrder.extraFee || 0) > 0 ? '#F53F3F' : '#000' }}>
                  ¥{((selectedDriverOrder.extraFeeItems || []).filter((f: any) => f.type === 'excess_mileage').reduce((s: number, f: any) => s + f.amount, 0)).toLocaleString()}
                </span>
              </div>
              {/* 远调费：来自乘客订单 */}
              {(() => {
                const linked = orders.find(o => o.id === selectedDriverOrder.orderId);
                const rd = linked?.remoteDispatchDetail;
                const fee = rd ? rd.pickupFee + rd.dropoffFee : 0;
                const hasFee = fee > 0;
                return (
                  <div style={{ ...feeRowStyle }}>
                    <span style={{ fontSize: 14, color: hasFee ? '#F53F3F' : '#4E5969' }}>远调费</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: hasFee ? '#F53F3F' : '#000' }}>
                      ¥{fee.toLocaleString()}
                    </span>
                  </div>
                );
              })()}
              {/* 其他费用：按类型拆分，有凭证图则展示缩略图 */}
              {(selectedDriverOrder.extraFeeItems || []).filter((f: any) => f.type === 'other').map((f: any, i: number) => (
                <div key={i} style={{ ...feeRowStyle }}>
                  <span style={{ fontSize: 14, color: '#F53F3F' }}>{f.category || '其他'}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#F53F3F', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {f.voucherImage && (
                      <img src={f.voucherImage} alt={f.category} style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => window.open(f.voucherImage)} />
                    )}
                    ¥{(f.amount || 0).toLocaleString()}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #e5e6eb', margin: '4px 0', paddingTop: 8, ...feeRowStyle }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>上报合计</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: selectedDriverOrder.status === 'pending_settlement' ? '#F53F3F' : '#000' }}>
                  ¥{(selectedDriverOrder.extraFee || 0).toLocaleString()}
                </span>
              </div>
            </Card>

            {/* 工单动态（按规格全量节点，倒序展示） */}
            <Card title="工单动态" size="small">
              <Timeline reverse>
                {(() => {
                  const o = selectedDriverOrder;
                  const shiftMin = (dt: string, mins: number): string => {
                    const d = new Date((dt || '').replace(' ', 'T'));
                    if (isNaN(d.getTime())) return dt || '—';
                    d.setMinutes(d.getMinutes() + mins);
                    const p = (n: number) => String(n).padStart(2, '0');
                    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
                  };
                  type Node = { time: string; text: React.ReactNode; color?: string };
                  const nodes: Node[] = [];
                  nodes.push({ time: o.dispatchTime || '—', color: '#86909C', text: '工单已生成' });
                  const active = ['in_progress', 'pending_settlement', 'completed'].includes(o.status);
                  if (o.actualStartTime || active) {
                    const st = o.actualStartTime || shiftMin(o.dispatchTime, 30);
                    nodes.push({ time: st, color: 'cyan', text: <>{o.driverName} 已出发</> });
                    nodes.push({ time: shiftMin(st, 22), color: 'cyan', text: <>{o.driverName} 已到达上车点 — {o.pickupAddress || '—'}</> });
                    nodes.push({ time: shiftMin(st, 25), color: '#00B42A', text: <>乘客已上车 — {o.plateNo}</> });
                  }
                  if (['pending_settlement', 'completed'].includes(o.status)) {
                    const et = o.actualEndTime || shiftMin(o.actualStartTime || o.dispatchTime, 600);
                    nodes.push({ time: et, color: '#00B42A', text: <>当日行程结束 — 用时 {o.duration || 10}h，里程 {o.mileage || 120}km</> });
                  }
                  if (o.status === 'pending_settlement') {
                    nodes.push({ time: o.actualEndTime || '—', color: '#F53F3F', text: <>上报费用 ¥{(o.extraFee || 0).toLocaleString()}</> });
                  }
                  if (o.status === 'completed') {
                    nodes.push({ time: o.actualEndTime || '—', color: '#00B42A', text: '工单已完成' });
                  }
                  if (o.status === 'cancelled') {
                    nodes.push({ time: o.dispatchTime || '—', color: '#86909C', text: '工单已取消 — 改派/取消' });
                  }
                  return nodes.map((n, i) => (
                    <Timeline.Item key={i} label={n.time} dotColor={n.color}>{n.text}</Timeline.Item>
                  ));
                })()}
              </Timeline>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
}
