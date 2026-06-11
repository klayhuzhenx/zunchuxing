import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Space, DatePicker, Grid, Message, Button } from '@arco-design/web-react';
import { IconArrowUp, IconArrowDown } from '@arco-design/web-react/icon';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart } from 'recharts';
import { overviewMetrics, analyticsTrendData, topEnterprises, topDrivers } from '../data/mock';

const { Row, Col } = Grid;

type TimeRangeKey = 'today' | 'yesterday' | '7d' | '30d' | 'custom';
const RANGE_LABELS: { key: TimeRangeKey; label: string; compareLabel: string }[] = [
  { key: 'today', label: '今日', compareLabel: '较昨日' },
  { key: 'yesterday', label: '昨日', compareLabel: '较前日' },
  { key: '7d', label: '近7日', compareLabel: '较上 7 日' },
  { key: '30d', label: '近30日', compareLabel: '较上 30 日' },
];

// ===== 数据概览 =====
function OverviewTab() {
  const navigate = useNavigate();
  // D9-01：用 key 形式的 state，按钮 label 通过 RANGE_LABELS 对照
  const [timeRange, setTimeRange] = useState<TimeRangeKey>('7d');
  const [customRange, setCustomRange] = useState<[string, string] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // 每5分钟自动刷新
  useEffect(() => {
    const timer = setInterval(() => setRefreshKey(k => k + 1), 300000);
    return () => clearInterval(timer);
  }, []);

  // D9-04：对比标签随时间范围联动
  const compareLabel = useMemo(() => {
    if (timeRange === 'custom') return '较上一周期';
    return RANGE_LABELS.find(r => r.key === timeRange)?.compareLabel || '较上一周期';
  }, [timeRange]);

  // D9-02：自定义范围 ≤ 90 天
  const handleCustomRangeChange = (_: unknown, dateStrings: string[]) => {
    if (!dateStrings[0] || !dateStrings[1]) {
      setCustomRange(null);
      return;
    }
    const start = new Date(dateStrings[0]).getTime();
    const end = new Date(dateStrings[1]).getTime();
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    if (days > 90) {
      Message.warning('自定义范围跨度不能超过 90 天');
      setCustomRange(null);
      return;
    }
    setCustomRange([dateStrings[0], dateStrings[1]]);
    setTimeRange('custom');
  };

  const COLORS = ['#165DFF', '#0FC6C2', '#FF7D00', '#F53F3F', '#722ED1'];
  const pieData = [
    { name: '包车', value: 784 }, { name: '租车', value: 472 },
  ];
  const payPieData = [
    { name: '企业额度支付', value: 520 }, { name: '支付宝', value: 420 }, { name: '微信', value: 316 },
  ];

  // D9-03：指标卡片下钻路由映射
  const metricLinks: Record<string, string> = {
    '订单总量': '/orders',
    '营收总额': '/finance',
    '客单价': '/finance',
    '派车及时率': '/orders?tab=pending_dispatch',
    '退款金额': '/finance',
    '活跃企业数': '/enterprise?status=approved',
  };

  // D9-07：Top 10 — 补足数据；Top 活跃企业 mock 仅 5 条，从 driverOrders 推导补齐
  const topEnterprises10 = useMemo(() => {
    const base = [...topEnterprises];
    // 补到 10 条（仅展示用，实际由后端返回）
    const padding = [
      { name: '海尔智家', value: 86, extra: '¥24,800' },
      { name: '小米科技', value: 72, extra: '¥21,300' },
      { name: '京东物流', value: 65, extra: '¥18,900' },
      { name: '中信证券', value: 58, extra: '¥17,200' },
      { name: '招商银行', value: 50, extra: '¥15,500' },
    ];
    return [...base, ...padding].slice(0, 10);
  }, []);

  return (
    <div key={refreshKey}>
      {/* 时间选择 — D9-01 修复按钮高亮逻辑 */}
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
        </Space>
      </Card>

      {/* 指标卡片 — D9-03 加点击下钻 + D9-04 对比文案联动 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {overviewMetrics.map((m, i) => (
          <Col span={4} key={i}>
            <Card
              hoverable
              bodyStyle={{ padding: '16px', cursor: 'pointer' }}
              onClick={() => {
                const link = metricLinks[m.label];
                if (link) navigate(link);
                else Message.info(`点击 ${m.label} 卡片下钻（待对接报表视图）`);
              }}
            >
              <div style={{ fontSize: 13, color: '#86909c', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1d2129' }}>{m.value}</div>
              {m.change !== undefined && (
                <div style={{ fontSize: 12, marginTop: 4, color: m.change > 0 ? '#F53F3F' : '#00B42A', display: 'flex', alignItems: 'center', gap: 2 }}>
                  {m.change > 0 ? <IconArrowUp /> : <IconArrowDown />}
                  {Math.abs(m.change)}% {compareLabel}
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
          {/* D9-05：每日营收 = 柱状图（营收）+ 折线图（客单价） */}
          <Card title="每日营收 + 客单价" size="small">
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={analyticsTrendData}>
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

      {/* 饼图 + Top排行 — D9-06 改环形图 + D9-07 Top 10 */}
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
        <Col span={6}>
          <Card title="Top 10 活跃企业" size="small">
            <Table columns={[
              { title: '排名', width: 50, render: (_: unknown, __: unknown, idx: number) => idx + 1 },
              { title: '企业', dataIndex: 'name' },
              { title: '订单数', dataIndex: 'value', width: 80 },
              { title: '消费总额', dataIndex: 'extra', width: 100 },
            ]} data={topEnterprises10} rowKey="name" pagination={false} size="small" />
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

// D9-08：删除 OrderReportTab / RevenueReportTab dead code（spec §9 仅含 9.1 数据概览）
export default function AnalyticsPage() {
  return <OverviewTab />;
}
