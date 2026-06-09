import { useState, useMemo, useEffect } from 'react';
import { Card, Table, Tag, Button, Select, Space, DatePicker, Input, Grid } from '@arco-design/web-react';
import { IconDownload, IconArrowUp, IconArrowDown } from '@arco-design/web-react/icon';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { overviewMetrics, analyticsTrendData, topEnterprises, topDrivers } from '../data/mock';
import type { OverviewMetric } from '../types';

const { Row, Col } = Grid;

// ===== 数据概览 =====
function OverviewTab() {
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshKey, setRefreshKey] = useState(0);

  // 每5分钟自动刷新
  useEffect(() => {
    const timer = setInterval(() => setRefreshKey(k => k + 1), 300000);
    return () => clearInterval(timer);
  }, []);

  const COLORS = ['#165DFF', '#0FC6C2', '#FF7D00', '#F53F3F', '#722ED1'];
  const pieData = [
    { name: '包车', value: 784 }, { name: '租车', value: 472 },
  ];
  const payPieData = [
    { name: '企业额度支付', value: 520 }, { name: '支付宝', value: 420 }, { name: '微信', value: 316 },
  ];

  return (
    <div key={refreshKey}>
      {/* 时间选择 */}
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space>
          {['今日', '昨日', '近7日', '近30日'].map(t => (
            <Button key={t} type={timeRange === t ? 'primary' : 'outline'} size="small" onClick={() => setTimeRange(t)}>{t}</Button>
          ))}
          <DatePicker.RangePicker style={{ width: 240 }} placeholder={['自定义起', '自定义止']} />
        </Space>
      </Card>

      {/* 指标卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {overviewMetrics.map((m, i) => (
          <Col span={4} key={i}>
            <Card bodyStyle={{ padding: '16px' }}>
              <div style={{ fontSize: 13, color: '#86909c', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1d2129' }}>{m.value}</div>
              {m.change !== undefined && (
                <div style={{ fontSize: 12, marginTop: 4, color: m.change > 0 ? '#F53F3F' : '#00B42A', display: 'flex', alignItems: 'center', gap: 2 }}>
                  {m.change > 0 ? <IconArrowUp /> : <IconArrowDown />}
                  {Math.abs(m.change)}% {m.changeLabel}
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* 趋势图 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title="每日订单量" size="small">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={analyticsTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="charter" stroke="#165DFF" name="包车" strokeWidth={2} />
                <Line type="monotone" dataKey="rental" stroke="#0FC6C2" name="租车" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="每日营收" size="small">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={analyticsTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#165DFF" name="营收" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 饼图 + Top排行 */}
      <Row gutter={16}>
        <Col span={6}>
          <Card title="订单类型占比" size="small">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="支付方式占比" size="small">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={payPieData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {payPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Top 活跃企业" size="small">
            <Table columns={[
              { title: '排名', width: 50, render: (_: unknown, __: unknown, idx: number) => idx + 1 },
              { title: '企业', dataIndex: 'name' },
              { title: '订单数', dataIndex: 'value', width: 80 },
              { title: '消费总额', dataIndex: 'extra', width: 100 },
            ]} data={topEnterprises} rowKey="name" pagination={false} size="small" />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Top 10 司机" size="small">
            <Table columns={[
              { title: '排名', width: 50, render: (_: unknown, __: unknown, idx: number) => idx + 1 },
              { title: '司机', dataIndex: 'name' },
              { title: '订单数', dataIndex: 'value', width: 80 },
              { title: '评分', dataIndex: 'extra', width: 80 },
            ]} data={topDrivers} rowKey="name" pagination={false} size="small" />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

// ===== 订单报表 =====
function OrderReportTab() {
  const reportData = [
    { orderNo: 'ZC20260601-0001', type: 'charter', passenger: '赵晓明 · 13800110001', enterprise: '腾讯科技', payMethod: '企业额度支付', driver: '王师傅 · 13811110001', vehicle: '粤B12345 · 奔驰V260L', timeRange: '06-01 08:00-16:00', pickup: '南山区科技园', dropoff: '福田区华强北', baseFee: 2800, extraFee: 0, paid: 2800, refund: 0, completeTime: '2026-06-01 16:30', rating: 5 },
    { orderNo: 'ZC20260601-0002', type: 'charter', passenger: '钱丽华 · 13800110002', enterprise: '', payMethod: '支付宝', driver: '李师傅 · 13811110002', vehicle: '粤B67890 · 别克GL8', timeRange: '06-01 09:00-17:00', pickup: '宝安区西乡', dropoff: '罗湖区东门', baseFee: 4800, extraFee: 300, paid: 5100, refund: 0, completeTime: '2026-06-01 17:45', rating: 4 },
    { orderNo: 'ZC20260605-0003', type: 'rental', passenger: '孙磊 · 13800110003', enterprise: '华为技术', payMethod: '企业额度支付', driver: '周师傅 · 13811110013', vehicle: '粤A22222 · 奔驰E300L', timeRange: '06-05 06:00-22:00', pickup: '天河区网易大厦', dropoff: '白云机场T1', baseFee: 4000, extraFee: 150, paid: 4150, refund: 0, completeTime: '2026-06-05 22:30', rating: 5 },
  ];

  const summary = {
    total: reportData.length, revenue: reportData.reduce((s, d) => s + d.paid, 0),
    refund: reportData.reduce((s, d) => s + d.refund, 0),
    charter: reportData.filter(d => d.type === 'charter').length,
    rental: reportData.filter(d => d.type === 'rental').length,
  };

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', width: 160 },
    { title: '类型', dataIndex: 'type', width: 60, render: (v: string) => <Tag color={v === 'charter' ? '#165DFF' : '#0FC6C2'} size="small">{v === 'charter' ? '包车' : '租车'}</Tag> },
    { title: '下单人', dataIndex: 'passenger', width: 160 },
    { title: '企业', dataIndex: 'enterprise', width: 100 },
    { title: '支付方式', dataIndex: 'payMethod', width: 110, render: (v: string) => <Tag size="small">{v}</Tag> },
    { title: '司机', dataIndex: 'driver', width: 150 },
    { title: '车辆', dataIndex: 'vehicle', width: 160 },
    { title: '用车时间', dataIndex: 'timeRange', width: 140 },
    { title: '基础费', width: 90, render: (_: unknown, r: typeof reportData[0]) => `¥${r.baseFee}` },
    { title: '实付', width: 90, render: (_: unknown, r: typeof reportData[0]) => <strong>¥{r.paid}</strong> },
    { title: '退款', width: 80, render: (_: unknown, r: typeof reportData[0]) => r.refund ? <span style={{ color: '#00B42A' }}>¥{r.refund}</span> : '-' },
    { title: '完成时间', dataIndex: 'completeTime', width: 150 },
    { title: '评分', dataIndex: 'rating', width: 60, render: (v: number) => '★'.repeat(v) },
  ];

  return (
    <div>
      {/* 汇总 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: '总订单数', value: summary.total },
          { label: '总营收', value: `¥${summary.revenue.toLocaleString()}` },
          { label: '总退款', value: `¥${summary.refund.toLocaleString()}` },
          { label: '包车订单', value: summary.charter },
          { label: '租车订单', value: summary.rental },
        ].map((s, i) => (
          <Card key={i} bodyStyle={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 12, color: '#86909c' }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <DatePicker.RangePicker style={{ width: 260 }} placeholder={['完成时间起', '完成时间止']} />
          <Select placeholder="订单类型" style={{ width: 160 }} mode="multiple"
            options={[{ label: '包车', value: 'charter' }, { label: '租车', value: 'rental' }]} />
          <Input placeholder="订单号/乘客/司机" style={{ width: 200 }} />
          <div style={{ flex: 1 }} />
          <Button icon={<IconDownload />}>导出报表</Button>
        </Space>
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={reportData} rowKey="orderNo" scroll={{ x: 1800 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>
    </div>
  );
}

// ===== 收入报表 =====
function RevenueReportTab() {
  const revenueData = [
    { dim: '2026-06', orders: 280, baseFee: 820000, overtime: 28000, mileage: 15000, refund: 12480, net: 850520 },
    { dim: '2026-05', orders: 310, baseFee: 950000, overtime: 32000, mileage: 18000, refund: 15000, net: 985000 },
    { dim: '2026-04', orders: 260, baseFee: 780000, overtime: 25000, mileage: 12000, refund: 9000, net: 808000 },
  ];

  const columns = [
    { title: '月份', dataIndex: 'dim', width: 100 },
    { title: '订单数', dataIndex: 'orders', width: 80 },
    { title: '基础费合计', width: 120, render: (_: unknown, r: typeof revenueData[0]) => `¥${r.baseFee.toLocaleString()}` },
    { title: '超时费合计', width: 120, render: (_: unknown, r: typeof revenueData[0]) => `¥${r.overtime.toLocaleString()}` },
    { title: '超里程费合计', width: 120, render: (_: unknown, r: typeof revenueData[0]) => `¥${r.mileage.toLocaleString()}` },
    { title: '退款合计', width: 110, render: (_: unknown, r: typeof revenueData[0]) => <span style={{ color: '#00B42A' }}>¥{r.refund.toLocaleString()}</span> },
    { title: '净收入', width: 120, render: (_: unknown, r: typeof revenueData[0]) => <strong>¥{r.net.toLocaleString()}</strong> },
    { title: '客单价', width: 100, render: (_: unknown, r: typeof revenueData[0]) => `¥${Math.round(r.net / r.orders).toLocaleString()}` },
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <DatePicker.RangePicker.MonthPicker style={{ width: 260 }} placeholder={['起始月份', '结束月份']} />
          <Select placeholder="企业" style={{ width: 160 }} allowClear showSearch options={['腾讯科技', '华为技术'].map(e => ({ label: e, value: e }))} />
          <Select placeholder="订单类型" style={{ width: 160 }} mode="multiple" options={[{ label: '包车', value: 'charter' }, { label: '租车', value: 'rental' }]} />
          <Select placeholder="汇总维度" style={{ width: 140 }} defaultValue="month"
            options={[{ label: '按月', value: 'month' }, { label: '按企业', value: 'enterprise' }, { label: '按类型', value: 'type' }]} />
          <div style={{ flex: 1 }} />
          <Button icon={<IconDownload />}>导出报表</Button>
        </Space>
      </Card>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card title="月度收入趋势" size="small">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dim" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="net" fill="#165DFF" name="净收入" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="收入构成" size="small">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="dim" type="category" fontSize={12} width={60} />
                <Tooltip />
                <Bar dataKey="baseFee" stackId="a" fill="#165DFF" name="基础费" />
                <Bar dataKey="overtime" stackId="a" fill="#FF7D00" name="超时费" />
                <Bar dataKey="mileage" stackId="a" fill="#F53F3F" name="超里程费" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={revenueData} rowKey="dim" scroll={{ x: 1000 }} pagination={false} stripe />
      </Card>
    </div>
  );
}

export default function AnalyticsPage() {
  return <OverviewTab />;
}
