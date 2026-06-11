import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Grid, Statistic, Table, Tag, Typography, Button, Space, Message } from '@arco-design/web-react';
import { IconRefresh, IconRight } from '@arco-design/web-react/icon';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockDashboard, mockMonthTrend, mockOrders } from '../data/mock';
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const [spinning, setSpinning] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => setTick(k => k + 1), 300000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = useCallback(() => {
    setSpinning(true);
    setTimeout(() => { setSpinning(false); Message.success('数据已刷新'); }, 600);
  }, []);

  const d = mockDashboard;
  const activeOrders = mockOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');

  return (
    <div key={tick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title heading={5} style={{ margin: 0 }}>工作台</Title>
        <Button icon={<IconRefresh spin={spinning} />} onClick={handleRefresh}>刷新数据</Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card bodyStyle={{ padding: '16px 20px' }}>
            <Statistic title="剩余额度" value={d.remainingQuota} prefix="¥" precision={0}
              styleValue={{
                color: d.remainingQuota < 20000 ? '#F53F3F' : '#00B42A',
                animation: d.remainingQuota < 20000 ? 'pulse 1.5s ease-in-out infinite' : undefined,
              }} />
          </Card>
        </Col>
        <Col span={6}><Card bodyStyle={{ padding: '16px 20px' }}><Statistic title="本月消费" value={d.monthConsumption} prefix="¥" precision={0} /></Card></Col>
        <Col span={6}><Card bodyStyle={{ padding: '16px 20px' }}><Statistic title="本月订单" value={d.monthOrders} suffix="笔" /></Card></Col>
        <Col span={6}><Card bodyStyle={{ padding: '16px 20px' }}><Statistic title="在职员工" value={d.activeEmployees} suffix="人" /></Card></Col>
      </Row>

      <Card title="近 30 日用车订单趋势" bodyStyle={{ padding: '12px 20px' }} style={{ marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={mockMonthTrend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#86909c' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#86909c' }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e6eb' }}
              formatter={(value: number) => [`${value} 笔`, '订单数']} />
            <Area type="monotone" dataKey="orders" stroke="#D4AF37" strokeWidth={2.5} fill="url(#orderGrad)"
              dot={{ r: 3, fill: '#D4AF37', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card title="进行中订单" bodyStyle={{ padding: '12px 0' }}
        extra={
          <Button type="text" size="small" onClick={() => navigate('/orders')}>
            查看全部 <IconRight style={{ fontSize: 12 }} />
          </Button>
        }>
        {activeOrders.length > 0 ? (
          <Table columns={orderColumns} data={activeOrders} rowKey="id" pagination={false} size="small" />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#86909c' }}>暂无进行中订单</div>
        )}
      </Card>
    </div>
  );
}
