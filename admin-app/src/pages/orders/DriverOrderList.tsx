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

// 费用明细弹窗（内联组件）
function DriverFeeSheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal visible simple footer={null} onCancel={onClose} style={{ width: 480, borderRadius: 24 }}
      title={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <span style={{ fontSize: 18, fontWeight: 600 }}>{title}</span>
        <Button type="text" icon={<IconClose />} onClick={onClose} />
      </div>}>
      {children}
    </Modal>
  );
}

export default function DriverOrderList() {
  const [activeTab, setActiveTab] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<OrderType | ''>('');
  const [driverFilter, setDriverFilter] = useState<string>('');
  const [tripDateRange, setTripDateRange] = useState<[string, string] | null>(null);
  const [selectedDriverOrder, setSelectedDriverOrder] = useState<DriverOrder | null>(null);
  const [driverDrawerVisible, setDriverDrawerVisible] = useState(false);
  const [driverFeeModal, setDriverFeeModal] = useState<{ visible: boolean; type: 'remote' }>({ visible: false, type: 'remote' });

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
    { title: '出车日期', dataIndex: 'tripDate', width: 100 },
    { title: '计划时段', dataIndex: 'plannedTimeRange', width: 120 },
    { title: '实际开始', dataIndex: 'actualStartTime', width: 140, render: (v: string) => v || '-' },
    { title: '实际结束', dataIndex: 'actualEndTime', width: 140, render: (v: string) => v || '-' },
    { title: '时长', dataIndex: 'duration', width: 70, render: (v: number) => v ? `${Math.floor(v / 60)}h${v % 60}m` : '-' },
    { title: '里程', dataIndex: 'mileage', width: 70, render: (v: number) => v ? `${v}km` : '-' },
    { title: '额外费用', dataIndex: 'extraFee', width: 90, render: (v: number, r: DriverOrder) => {
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
                { label: '出车日期', value: selectedDriverOrder.tripDate },
                { label: '时段', value: selectedDriverOrder.plannedTimeRange },
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
                { label: '下单人', value: `${selectedDriverOrder.passengerName || '—'} ${selectedDriverOrder.passengerPhone}` },
                { label: '上车点', value: selectedDriverOrder.pickupAddress || '-' },
                { label: '下车点', value: selectedDriverOrder.dropoffAddress || '-' },
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

            {/* 上报费用 — 与乘客订单同款样式，无日期+无套餐费 */}
            <Card title="上报费用" size="small" style={{ marginBottom: 16 }}>
              <div style={{ ...feeRowStyle }}>
                <span style={{ fontSize: 14, color: '#4E5969' }}>等待费 · 免费15min ¥1/min</span>
                <span style={{ fontSize: 14, color: '#86909c' }}>¥0</span>
              </div>
              <div style={{ ...feeRowStyle }}>
                <span style={{ fontSize: 14, color: (selectedDriverOrder.extraFee || 0) > 0 ? '#F53F3F' : '#4E5969' }}>超时长费 · ¥100/h</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: (selectedDriverOrder.extraFee || 0) > 0 ? '#F53F3F' : '#000' }}>
                  ¥{((selectedDriverOrder.extraFeeItems || []).filter((f: any) => f.type === 'overtime').reduce((s: number, f: any) => s + f.amount, 0)).toLocaleString()}
                  {((selectedDriverOrder.extraFeeItems || []).filter((f: any) => f.type === 'overtime').length > 0) ? ' 明细 ›' : ''}
                </span>
              </div>
              <div style={{ ...feeRowStyle }}>
                <span style={{ fontSize: 14, color: (selectedDriverOrder.extraFee || 0) > 0 ? '#F53F3F' : '#4E5969' }}>超里程费 · ¥5/km</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: (selectedDriverOrder.extraFee || 0) > 0 ? '#F53F3F' : '#000' }}>
                  ¥{((selectedDriverOrder.extraFeeItems || []).filter((f: any) => f.type === 'excess_mileage').reduce((s: number, f: any) => s + f.amount, 0)).toLocaleString()}
                  {((selectedDriverOrder.extraFeeItems || []).filter((f: any) => f.type === 'excess_mileage').length > 0) ? ' 明细 ›' : ''}
                </span>
              </div>
              {/* 远调费：来自乘客订单（基于上车/下车点超出运营范围的直线距离） */}
              {(() => {
                const linked = orders.find(o => o.id === selectedDriverOrder.orderId);
                const rd = linked?.remoteDispatchDetail;
                const fee = rd ? rd.pickupFee + rd.dropoffFee : 0;
                const km = rd ? rd.pickupKm + rd.dropoffKm : 0;
                const hasFee = fee > 0;
                return (
                  <div style={{ ...feeRowStyle, cursor: hasFee ? 'pointer' : 'default' }}
                    onClick={() => { if (hasFee) setDriverFeeModal({ visible: true, type: 'remote' }); }}>
                    <span style={{ fontSize: 14, color: hasFee ? '#F53F3F' : '#4E5969' }}>
                      远调费{km > 0 ? ` · ${km.toFixed(1)}km` : ''}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: hasFee ? '#F53F3F' : '#000' }}>
                      {hasFee ? `¥${fee.toLocaleString()} 明细 ›` : '¥0'}
                    </span>
                  </div>
                );
              })()}
              <div style={{ ...feeRowStyle }}>
                <span style={{ fontSize: 14, color: (selectedDriverOrder.extraFeeItems || []).filter((f: any) => f.type === 'other').length > 0 ? '#F53F3F' : '#4E5969' }}>其他费用</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: (selectedDriverOrder.extraFeeItems || []).filter((f: any) => f.type === 'other').length > 0 ? '#F53F3F' : '#000' }}>
                  ¥{((selectedDriverOrder.extraFeeItems || []).filter((f: any) => f.type === 'other').reduce((s: number, f: any) => s + f.amount, 0)).toLocaleString()}
                  {((selectedDriverOrder.extraFeeItems || []).filter((f: any) => f.type === 'other').length > 0) ? ' 明细 ›' : ''}
                </span>
              </div>
              <div style={{ borderTop: '1px solid #e5e6eb', margin: '4px 0', paddingTop: 8, ...feeRowStyle }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>上报合计</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: selectedDriverOrder.status === 'pending_settlement' ? '#F53F3F' : '#000' }}>
                  ¥{(selectedDriverOrder.extraFee || 0).toLocaleString()}
                </span>
              </div>
            </Card>

            {/* 远调费明细弹窗 */}
            {driverFeeModal.visible && (() => {
              const linked = orders.find(o => o.id === selectedDriverOrder.orderId);
              const rd = linked?.remoteDispatchDetail;
              const pickupLabel = linked?.type === 'charter' ? '接远调距离' : '取远调距离';
              const dropoffLabel = linked?.type === 'charter' ? '送远调距离' : '还远调距离';
              const totalFee = (rd?.pickupFee ?? 0) + (rd?.dropoffFee ?? 0);
              return (
                <DriverFeeSheet title="远调费明细" onClose={() => setDriverFeeModal({ visible: false, type: 'remote' })}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                    {linked?.type === 'charter' ? '包车出行' : '租车出行'} · 远调费明细
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
                </DriverFeeSheet>
              );
            })()}

            {/* 工单动态 */}
            <Card title="工单动态" size="small">
              <Timeline>
                <Timeline.Item label={selectedDriverOrder.dispatchTime || '—'}>工单已生成</Timeline.Item>
                {selectedDriverOrder.actualStartTime && <Timeline.Item label={selectedDriverOrder.actualStartTime} dotColor="cyan">司机出发</Timeline.Item>}
                {selectedDriverOrder.actualEndTime && <Timeline.Item label={selectedDriverOrder.actualEndTime} dotColor="green">行程结束</Timeline.Item>}
                {selectedDriverOrder.status === 'pending_settlement' && <Timeline.Item label="—" dotColor="#F53F3F">上报费用</Timeline.Item>}
              </Timeline>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
}
