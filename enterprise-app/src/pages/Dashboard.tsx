import { Card, Grid, Statistic, Table, Tag, Typography } from '@arco-design/web-react';
import { mockDashboard, mockWeekTrend, mockOrders } from '../data/mock';
import type { Order } from '../types';

const { Row, Col } = Grid;
const { Title } = Typography;

const statusMap: Record<string, { label: string; color: string }> = {
  unpaid: { label: '待支付', color: 'orange' }, pending_dispatch: { label: '待派车', color: 'blue' },
  pending_start: { label: '待开始', color: 'cyan' }, ongoing: { label: '行程中', color: 'green' },
  completed: { label: '已完成', color: 'gray' }, cancelled: { label: '已取消', color: 'red' },
  pending_extra: { label: '待补款', color: 'red' },
};

const orderColumns = [
  { title: '订单号', dataIndex: 'orderNo', width: 180 },
  { title: '用车人', dataIndex: 'passengerName', width: 90 },
  { title: '类型', dataIndex: 'type', width: 70, render: (v: string) => <Tag size="small" color={v === 'charter' ? 'gold' : 'gray'}>{v === 'charter' ? '包车' : '租车'}</Tag> },
  { title: '日期', width: 110, render: (_: unknown, r: Order) => <span style={{ fontSize: 13 }}>{r.type === 'charter' ? r.startTime?.split(' ')[0] : r.rentalStart} {r.days ? `${r.days}天` : ''}</span> },
  { title: '金额', width: 100, render: (_: unknown, r: Order) => <span style={{ fontWeight: 500 }}>¥{r.paidAmount.toLocaleString()}</span> },
  { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => {
    const s = statusMap[v] || { label: v, color: 'gray' };
    return <Tag size="small" color={s.color}>{s.label}</Tag>;
  }},
];

function SimpleLineChart({ data }: { data: { date: string; orders: number }[] }) {
  const w = 600; const h = 200; const pad = { top: 24, right: 20, bottom: 28, left: 32 };
  const maxVal = Math.max(...data.map(d => d.orders), 1);
  const pw = w - pad.left - pad.right;
  const ph = h - pad.top - pad.bottom;
  const stepX = pw / (data.length - 1);
  const points = data.map((d, i) => `${pad.left + i * stepX},${pad.top + ph - (d.orders / maxVal) * ph}`).join(' ');
  const yTicks = [0, 1, 2, 3, 4, 5];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto' }}>
      {yTicks.map(v => {
        const y = pad.top + ph - (v / maxVal) * ph;
        return (
          <g key={v}>
            <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="#f0f0f0" strokeDasharray="3 3" />
            <text x={pad.left - 6} y={y + 4} textAnchor="end" fill="#86909c" fontSize="11">{v}</text>
          </g>
        );
      })}
      {data.map((d, i) => (
        <text key={d.date} x={pad.left + i * stepX} y={h - 6} textAnchor="middle" fill="#86909c" fontSize="11">{d.date}</text>
      ))}
      <polyline points={points} fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => {
        const cx = pad.left + i * stepX;
        const cy = pad.top + ph - (d.orders / maxVal) * ph;
        return (
          <g key={d.date}>
            <circle cx={cx} cy={cy} r={d.orders === maxVal ? 9 : 5} fill="#fff" stroke={d.orders === maxVal ? '#D4AF37' : '#000'} strokeWidth={2} />
            <text x={cx} y={cy - 12} textAnchor="middle" fill="#1D2129" fontSize="12" fontWeight={600}>{d.orders}</text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${pad.left},${h - pad.bottom} ${points} ${pad.left + pw},${h - pad.bottom}`} fill="url(#areaGrad)" />
    </svg>
  );
}

export default function Dashboard() {
  const d = mockDashboard;
  const recentOrders = mockOrders.slice(0, 10);

  return (
    <div>
      <Title heading={5} style={{ margin: '0 0 16px' }}>工作台</Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="剩余额度" value={d.remainingQuota} prefix="¥" precision={0} styleValue={{ color: d.remainingQuota < 20000 ? '#F53F3F' : '#00B42A' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="本月消费" value={d.monthConsumption} prefix="¥" precision={0} /></Card></Col>
        <Col span={6}><Card><Statistic title="本月订单" value={d.monthOrders} suffix="笔" /></Card></Col>
        <Col span={6}><Card><Statistic title="在职员工" value={d.activeEmployees} suffix="人" /></Card></Col>
      </Row>

      <Card title="近 7 日用车订单趋势" style={{ marginBottom: 16 }}>
        <SimpleLineChart data={mockWeekTrend} />
      </Card>

      <Card title="最近用车" bodyStyle={{ padding: '12px 0' }}>
        {recentOrders.length > 0 ? (
          <Table columns={orderColumns} data={recentOrders} rowKey="id" pagination={false} size="small" />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#86909c' }}>暂无用车记录</div>
        )}
      </Card>
    </div>
  );
}
