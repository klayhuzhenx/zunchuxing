import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Space, DatePicker, Grid, Message, Button, Select } from '@arco-design/web-react';
import { IconArrowUp, IconArrowDown } from '@arco-design/web-react/icon';
import { LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart } from 'recharts';
import { orders as allOrders, transactions as allTxns, opsCities } from '../data/mock';

const { Row, Col } = Grid;

type TimeRangeKey = 'today' | 'yesterday' | '7d' | '30d' | 'custom';
const RANGE_LABELS: { key: TimeRangeKey; label: string; compareLabel: string }[] = [
  { key: 'today', label: '今日', compareLabel: '较昨日' },
  { key: 'yesterday', label: '昨日', compareLabel: '较前日' },
  { key: '7d', label: '近7日', compareLabel: '较上 7 日' },
  { key: '30d', label: '近30日', compareLabel: '较上 30 日' },
];

const COLORS = ['#165DFF', '#0FC6C2', '#FF7D00', '#F53F3F', '#722ED1'];

function getDateRange(key: TimeRangeKey, custom: [string, string] | null): { start: Date; end: Date } {
  const now = new Date();
  let start: Date, end: Date;
  switch (key) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = now;
      break;
    case 'yesterday':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      end = new Date(start.getTime() + 86400000 - 1);
      break;
    case '7d':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      end = now;
      break;
    case '30d':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
      end = now;
      break;
    case 'custom':
      if (custom) {
        start = new Date(custom[0]);
        end = new Date(custom[1] + ' 23:59:59');
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = now;
      }
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = now;
  }
  return { start, end };
}

function fmtDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// 生成范围内逐日数据点
function fillDayGrid(start: Date, end: Date): { date: string; charter: number; rental: number; revenue: number; avgPrice: number }[] {
  const rows: { date: string; charter: number; rental: number; revenue: number; avgPrice: number }[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    rows.push({ date: fmtDate(cur), charter: 0, rental: 0, revenue: 0, avgPrice: 0 });
    cur.setDate(cur.getDate() + 1);
  }
  return rows;
}

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRangeKey>('today');
  const [customRange, setCustomRange] = useState<[string, string] | null>(null);
  const [areaFilter, setAreaFilter] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setRefreshKey(k => k + 1), 300000);
    return () => clearInterval(timer);
  }, []);

  const handleCustomRangeChange = (_: unknown, dateStrings: string[]) => {
    if (!dateStrings[0] || !dateStrings[1]) { setCustomRange(null); return; }
    const start = new Date(dateStrings[0]).getTime();
    const end = new Date(dateStrings[1]).getTime();
    if (Math.floor((end - start) / 86400000) + 1 > 90) {
      Message.warning('自定义范围跨度不能超过 90 天'); return;
    }
    setCustomRange([dateStrings[0], dateStrings[1]]);
    setTimeRange('custom');
  };

  const compareLabel = useMemo(() => {
    if (timeRange === 'custom') return '较上一周期';
    return RANGE_LABELS.find(r => r.key === timeRange)?.compareLabel || '较上一周期';
  }, [timeRange]);

  // 根据时间范围过滤数据
  const { metrics, trendData, pieData, payPieData, topDrivers10 } = useMemo(() => {
    const { start, end } = getDateRange(timeRange, customRange);

    const inRange = (ds: string) => {
      const d = new Date(ds);
      return d >= start && d <= end;
    };

    let filteredOrders = allOrders.filter(o => inRange(o.createdAt) && o.status !== 'cancelled');
    let filteredTxns = allTxns.filter(t => inRange(t.time));

    // 运营区域过滤
    if (areaFilter.length > 0) {
      const areaNames = areaFilter.map(id => opsCities.find(c => c.id === id)?.name).filter(Boolean);
      filteredOrders = filteredOrders.filter(o => areaNames.some(n => (o.pickupAddress || '').includes(n!)));
      filteredTxns = filteredTxns.filter(t => {
        const o = allOrders.find(x => x.orderNo === t.orderNo);
        return o ? areaNames.some(n => (o.pickupAddress || '').includes(n!)) : false;
      });
    }

    const filteredCompleted = filteredOrders.filter(o => o.status === 'completed' || o.status === 'pending_extra');

    // 指标卡片
    const orderCount = filteredCompleted.length;
    const revenue = filteredTxns.filter(t => t.type !== 'refund').reduce((s, t) => s + t.amount, 0);
    const refundAmt = filteredTxns.filter(t => t.type === 'refund').reduce((s, t) => s + Math.abs(t.amount), 0);
    const avgPrice = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

    const metrics = [
      { label: '订单总量', value: `${orderCount}单`, change: 8.5 },
      { label: '营收总额', value: `¥${revenue.toLocaleString()}`, change: 12.3 },
      { label: '客单价', value: `¥${avgPrice.toLocaleString()}`, change: -3.1 },
    ];

    // 趋势图数据
    const grid = fillDayGrid(start, end);
    filteredOrders.forEach(o => {
      const date = fmtDate(new Date(o.createdAt.slice(0, 10)));
      const row = grid.find(g => g.date === date);
      if (row) {
        if (o.type === 'charter') row.charter++;
        else row.rental++;
      }
    });
    filteredTxns.filter(t => t.type !== 'refund').forEach(t => {
      const date = fmtDate(new Date(t.time.slice(0, 10)));
      const row = grid.find(g => g.date === date);
      if (row) row.revenue += t.amount;
    });
    grid.forEach(g => {
      const totalOrders = g.charter + g.rental;
      g.avgPrice = totalOrders > 0 ? Math.round(g.revenue / totalOrders) : 0;
    });

    // 饼图
    const charterCount = filteredOrders.filter(o => o.type === 'charter').length;
    const rentalCount = filteredOrders.filter(o => o.type === 'rental').length;
    const pieData = [
      { name: '包车', value: charterCount },
      { name: '租车', value: rentalCount },
    ];

    const epCount = filteredTxns.filter(t => t.paymentMethod === 'enterprise_credit').length;
    const aliCount = filteredTxns.filter(t => t.paymentMethod === 'alipay').length;
    const wxCount = filteredTxns.filter(t => t.paymentMethod === 'wechat').length;
    const payPieData = [
      { name: '企业额度支付', value: epCount },
      { name: '支付宝', value: aliCount },
      { name: '微信', value: wxCount },
    ];

    // Top 10 司机
    const driverCounts = new Map<string, number>();
    filteredCompleted.forEach(o => {
      if (o.driverName) driverCounts.set(o.driverName, (driverCounts.get(o.driverName) || 0) + 1);
    });
    const topDrivers10 = [...driverCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    return { metrics, trendData: grid, pieData, payPieData, topDrivers10 };
  }, [timeRange, customRange, areaFilter, refreshKey]);

  const metricLinks: Record<string, string> = {
    '订单总量': '/orders', '营收总额': '/finance/transactions',
    '客单价': '/finance/transactions', '退款金额': '/finance/transactions',
  };

  return (
    <div key={refreshKey}>
      {/* 时间选择 */}
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space>
          {RANGE_LABELS.map(r => (
            <Button
              key={r.key}
              type={timeRange === r.key ? 'primary' : 'outline'}
              size="small"
              onClick={() => { setTimeRange(r.key); setCustomRange(null); }}
            >
              {r.label}
            </Button>
          ))}
          <DatePicker.RangePicker
            style={{ width: 240 }}
            placeholder={['自定义起', '自定义止']}
            value={customRange || undefined}
            onChange={handleCustomRangeChange}
          />
          {timeRange === 'custom' && customRange && (
            <Tag color="arcoblue" size="small">自定义：{customRange[0]} ~ {customRange[1]}</Tag>
          )}
          <div style={{ flex: 1 }} />
          <Select placeholder="运营区域" style={{ width: 200 }} mode="multiple"
            value={areaFilter.length === 0 ? ['__all__'] : areaFilter} allowClear
            onChange={(vals: string[]) => { if (vals.includes('__all__')) { setAreaFilter([]); return; } setAreaFilter(vals); }}
            options={[{ label: '全部', value: '__all__' }, ...opsCities.filter(c => c.status === 'active').map(c => ({ label: c.name, value: c.id }))]} />
        </Space>
      </Card>

      {/* 指标卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {metrics.map((m, i) => (
          <Col span={6} key={i}>
            <Card
              hoverable
              bodyStyle={{ padding: 18 }}
              onClick={() => {
                const link = metricLinks[m.label];
                if (link) navigate(link);
              }}
            >
              <div style={{ fontSize: 13, color: '#86909c', marginBottom: 8 }}>{m.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#1d2129' }}>{m.value}</div>
              {m.change !== undefined ? (
                <div style={{ fontSize: 12, marginTop: 6, color: m.change >= 0 ? '#00B42A' : '#F53F3F', display: 'flex', alignItems: 'center', gap: 2 }}>
                  {m.change >= 0 ? <IconArrowUp /> : <IconArrowDown />}
                  {Math.abs(m.change)}% {compareLabel}
                </div>
              ) : (
                <div style={{ fontSize: 12, marginTop: 6, color: '#86909c' }}>—</div>
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
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
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
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis yAxisId="left" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#165DFF" name="营收(元)" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="avgPrice" stroke="#FF7D00" name="客单价(元)" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 饼图 + Top 10 司机 */}
      <Row gutter={16}>
        <Col span={6}>
          <Card title="订单类型占比" size="small">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={36} outerRadius={60} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
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
                <Pie data={payPieData} cx="50%" cy="50%" innerRadius={36} outerRadius={60} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {payPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Top 10 司机" size="small">
            <Table columns={[
              { title: '排名', width: 60, render: (_: unknown, __: unknown, idx: number) => `#${idx + 1}` },
              { title: '司机', dataIndex: 'name', width: 120 },
              { title: '订单数', dataIndex: 'value', width: 100 },
            ]} data={topDrivers10} rowKey="name" pagination={false} size="small" />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
