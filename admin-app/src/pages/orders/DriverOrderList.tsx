import { useState, useMemo } from 'react';
import { Card, Table, Tag, Button, Input, Select, Space, Tabs, Drawer, Descriptions, DatePicker, Timeline } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { driverOrders } from '../../data/mock';
import type { DriverOrder, DriverOrderStatus, OrderType } from '../../types';

const statusTabs: { key: string; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'not_started', label: '未开始' },
  { key: 'in_progress', label: '进行中' },
  { key: 'pending_settlement', label: '待结算' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

const statusMap: Record<DriverOrderStatus, { label: string; color: string }> = {
  not_started: { label: '未开始', color: 'arcoblue' },
  in_progress: { label: '进行中', color: 'cyan' },
  pending_settlement: { label: '待结算', color: 'orangered' },
  completed: { label: '已完成', color: 'green' },
  cancelled: { label: '已取消', color: 'gray' },
};

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
    { title: '司机出车单号', dataIndex: 'driverOrderNo', width: 160 },
    { title: '关联订单号', dataIndex: 'orderNo', width: 160, render: (v: string) => <a>{v}</a> },
    { title: '类型', dataIndex: 'type', width: 70, render: (v: string) => (
      <Tag color={v === 'charter' ? 'arcoblue' : 'purple'} size="small">{v === 'charter' ? '包车' : '租车'}</Tag>
    )},
    { title: '司机', width: 120, render: (_: unknown, r: DriverOrder) => `${r.driverName} ${r.driverPhone}` },
    { title: '车辆', width: 110, render: (_: unknown, r: DriverOrder) => `${r.plateNo} ${r.carModel}` },
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
          <Input prefix={<IconSearch />} placeholder="出车单号/关联订单号/乘客/手机号" style={{ width: 300 }}
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

      <Drawer width="60%" title={selectedDriverOrder ? `出车单详情 - ${selectedDriverOrder.driverOrderNo}` : '出车单详情'}
        visible={driverDrawerVisible} onCancel={() => setDriverDrawerVisible(false)} footer={null}>
        {selectedDriverOrder && (
          <div>
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small" data={[
                { label: '司机出车单号', value: selectedDriverOrder.driverOrderNo },
                { label: '关联订单号', value: selectedDriverOrder.orderNo },
                { label: '类型', value: selectedDriverOrder.type === 'charter' ? '包车' : '租车' },
                { label: '状态', value: <Tag color={statusMap[selectedDriverOrder.status].color} size="small">{statusMap[selectedDriverOrder.status].label}</Tag> },
              ]} />
            </Card>
            <Card title="人员与车辆" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small" data={[
                { label: '司机', value: `${selectedDriverOrder.driverName} ${selectedDriverOrder.driverPhone}` },
                { label: '车辆', value: `${selectedDriverOrder.plateNo} ${selectedDriverOrder.carModel}` },
                { label: '乘客', value: `${selectedDriverOrder.passengerName || '—'} ${selectedDriverOrder.passengerPhone}` },
                ...(selectedDriverOrder.dispatchTime ? [{ label: '派车时间', value: selectedDriverOrder.dispatchTime }] : []),
              ]} />
            </Card>
            <Card title="行程信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small" data={[
                { label: '出车日期', value: selectedDriverOrder.tripDate },
                { label: '计划时段', value: selectedDriverOrder.plannedTimeRange },
                { label: '实际开始', value: selectedDriverOrder.actualStartTime || '-' },
                { label: '实际结束', value: selectedDriverOrder.actualEndTime || '-' },
                { label: '时长', value: selectedDriverOrder.duration ? `${Math.floor(selectedDriverOrder.duration / 60)}h${selectedDriverOrder.duration % 60}m` : '-' },
                { label: '里程', value: selectedDriverOrder.mileage ? `${selectedDriverOrder.mileage}km` : '-' },
                { label: '上车地点', value: selectedDriverOrder.pickupAddress || '-' },
                { label: '下车地点', value: selectedDriverOrder.dropoffAddress || '-' },
              ]} />
            </Card>

            {/* 时间节点（司机出车单维度） */}
            <Card title="时间节点" size="small" style={{ marginBottom: 16 }}>
              <Timeline>
                {selectedDriverOrder.dispatchTime && <Timeline.Item label={selectedDriverOrder.dispatchTime}>司机出车</Timeline.Item>}
                {selectedDriverOrder.actualStartTime && <Timeline.Item label={selectedDriverOrder.actualStartTime} dotColor="cyan">到达上车点</Timeline.Item>}
                {selectedDriverOrder.actualEndTime && <Timeline.Item label={selectedDriverOrder.actualEndTime} dotColor="green">行程结束</Timeline.Item>}
                {!selectedDriverOrder.dispatchTime && !selectedDriverOrder.actualStartTime && (
                  <div style={{ color: '#86909c', padding: '4px 0' }}>暂无时间节点记录</div>
                )}
              </Timeline>
            </Card>

            {/* 费用明细 — 四层结构 */}
            <Card title="费用明细" size="small" style={{ marginBottom: 16 }}>
              {/* 层1：清单明细及总额 */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#86909c', marginBottom: 4, fontWeight: 500 }}>清单明细及总额</div>
                <Descriptions column={2} size="small" data={[
                  { label: '基础费', value: `¥${((selectedDriverOrder.extraFeeItems || []).reduce((s: number, f: any) => s + (f.type === 'overtime' ? f.amount : 0), 0)).toLocaleString()}` },
                  { label: '超时长费', value: <span style={{ color: '#F53F3F' }}>¥{(selectedDriverOrder.extraFeeItems || []).filter((f: any) => f.type === 'overtime').reduce((s: number, f: any) => s + f.amount, 0).toLocaleString()}</span> },
                  { label: '超里程费', value: <span style={{ color: '#F53F3F' }}>¥{(selectedDriverOrder.extraFeeItems || []).filter((f: any) => f.type === 'excess_mileage').reduce((s: number, f: any) => s + f.amount, 0).toLocaleString()}</span> },
                  { label: '等待费', value: '¥0' },
                ]} />
              </div>

              {/* 层2：系统计算 */}
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#86909c', marginBottom: 4, fontWeight: 500 }}>系统计算</div>
                <Descriptions column={2} size="small" data={[
                  { label: '基础费', value: '¥0' },
                  { label: '超时长费', value: <span style={{ color: '#F53F3F' }}>¥{(selectedDriverOrder.extraFeeItems || []).filter((f: any) => f.type === 'overtime').reduce((s: number, f: any) => s + f.amount, 0).toLocaleString()}</span> },
                  { label: '超里程费', value: <span style={{ color: '#F53F3F' }}>¥{(selectedDriverOrder.extraFeeItems || []).filter((f: any) => f.type === 'excess_mileage').reduce((s: number, f: any) => s + f.amount, 0).toLocaleString()}</span> },
                  { label: '等待费', value: '¥0' },
                ]} />
              </div>

              {/* 层3：其他费用（司机上报） */}
              {selectedDriverOrder.extraFeeItems && selectedDriverOrder.extraFeeItems.filter((f: any) => f.type === 'other').length > 0 && (
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: '#86909c', marginBottom: 4, fontWeight: 500 }}>其他费用（司机上报）</div>
                  <Table
                    columns={[
                      { title: '费用类型', dataIndex: 'category', width: 100 },
                      { title: '金额', dataIndex: 'amount', width: 100, render: (v: number) => <span style={{ color: '#F53F3F' }}>¥{v.toLocaleString()}</span> },
                      { title: '凭证', width: 80, render: (_: unknown, r: any) => r.voucherImage ? <a>查看</a> : '-' },
                    ]}
                    data={selectedDriverOrder.extraFeeItems.filter((f: any) => f.type === 'other')}
                    rowKey={(_, i) => String(i)}
                    pagination={false}
                    size="small"
                  />
                </div>
              )}

              {/* 层4：费用汇总 */}
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                <div style={{ fontSize: 12, color: '#86909c', marginBottom: 4, fontWeight: 500 }}>费用汇总</div>
                <Descriptions column={2} size="small" data={[
                  { label: '小计', value: `¥${(selectedDriverOrder.extraFee || 0).toLocaleString()}` },
                  ...(selectedDriverOrder.extraFee && selectedDriverOrder.extraFee > 0 ? [{ label: '退款', value: <span style={{ color: '#00B42A' }}>¥0</span> }] : []),
                  { label: '实付', value: <strong style={{ fontSize: 16 }}>¥{(selectedDriverOrder.extraFee || 0).toLocaleString()}</strong> },
                ]} />
              </div>
            </Card>

          </div>
        )}
      </Drawer>
    </div>
  );
}
