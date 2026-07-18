import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tag, Button, Typography, Space, Message } from '@arco-design/web-react';
import { IconArrowUp, IconArrowDown, IconRefresh, IconLoading } from '@arco-design/web-react/icon';
import { dashboardStats, trendData, currentUser, orders, invoices, payments } from '../data/mock';
import type { Role } from '../types';

const { Text } = Typography;

// 简易双轴折线图
function DualLineChart({ data, height = 200 }: { data: { date: string; orders: number; revenue: number }[]; height?: number }) {
  const maxO = Math.max(...data.map(d => d.orders), 1);
  const maxR = Math.max(...data.map(d => d.revenue), 1);
  const w = 700; const h = height;
  const pl = 56; const pr = 56; const pt = 20; const pb = 32;
  const pw = w - pl - pr; const ph = h - pt - pb;

  const polyline = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const ptsO = data.map((d, i) => ({ x: pl + (i / (data.length - 1)) * pw, y: pt + ph - (d.orders / maxO) * ph }));
  const ptsR = data.map((d, i) => ({ x: pl + (i / (data.length - 1)) * pw, y: pt + ph - (d.revenue / maxR) * ph }));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height }}>
      {[0, 0.5, 1].map(frac => (
        <line key={frac} x1={pl} x2={w - pr} y1={pt + frac * ph} y2={pt + frac * ph} stroke="#f0f0f0" strokeWidth={1} />
      ))}
      {[0, 0.5, 1].map(frac => (
        <text key={`yl${frac}`} x={pl - 8} y={pt + frac * ph + 4} textAnchor="end" fontSize={10} fill="#86909c">
          {Math.round(maxO * (1 - frac))}单
        </text>
      ))}
      {[0, 0.5, 1].map(frac => (
        <text key={`yr${frac}`} x={w - pr + 8} y={pt + frac * ph + 4} textAnchor="start" fontSize={10} fill="#86909c">
          ¥{Math.round(maxR * (1 - frac)).toLocaleString()}
        </text>
      ))}
      <path d={polyline(ptsO)} fill="none" stroke="#165DFF" strokeWidth={2} />
      {ptsO.map((p, i) => <circle key={`co${i}`} cx={p.x} cy={p.y} r={3} fill="#165DFF" />)}
      <path d={polyline(ptsR)} fill="none" stroke="#00B42A" strokeWidth={2} strokeDasharray="5 3" />
      {ptsR.map((p, i) => <circle key={`cr${i}`} cx={p.x} cy={p.y} r={3} fill="#00B42A" />)}
      {data.map((d, i) => (
        <text key={`xd${i}`} x={pl + (i / (data.length - 1)) * pw} y={h - 8} textAnchor="middle" fontSize={10} fill="#86909c">{d.date}</text>
      ))}
      <text x={pl} y={14} fontSize={11} fill="#165DFF">── 订单量</text>
      <text x={pl + 70} y={14} fontSize={11} fill="#00B42A">-- 交易额(元)</text>
    </svg>
  );
}

// 模拟近30天数据
const trend30: { date: string; orders: number; revenue: number }[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - 29 + i);
  return {
    date: `${d.getMonth() + 1}/${d.getDate()}`,
    orders: 25 + Math.floor(Math.random() * 40),
    revenue: Math.round((40000 + Math.random() * 80000) / 100) * 100,
  };
});

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(dashboardStats);
  const [trendDays, setTrendDays] = useState<7 | 30>(7);
  const [chartData, setChartData] = useState(trendData);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setStats(prev => ({
        ...prev,
        todayOrders: prev.todayOrders + Math.floor(Math.random() * 3),
        todayRevenue: prev.todayRevenue + Math.floor(Math.random() * 2000),
      }));
    }, 60000);
    return () => clearInterval(t);
  }, []);

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => {
      setStats({ ...dashboardStats });
      setSpinning(false);
      Message.success('数据已刷新');
    }, 600);
  };

  const handleTrendToggle = (days: 7 | 30) => {
    setTrendDays(days);
    setChartData(days === 7 ? trendData : trend30);
  };

  const role = currentUser.role as Role;
  const roleVisible = (roles: string[]) => roles.includes(role);

  // 核心数据卡片（§2.2）
  const statCards = [
    { title: '今日新增订单', value: stats.todayOrders, suffix: '单', change: stats.todayOrdersChange, link: '/orders', visible: true },
    { title: '今日已完成订单', value: stats.todayCompletedOrders, suffix: '单', change: stats.todayCompletedOrdersChange, link: '/orders', visible: true },
    { title: '今日交易额', value: stats.todayRevenue, prefix: '¥', change: stats.todayRevenueChange, link: '/finance/invoices', visible: true },
    { title: '待派车', value: stats.pendingDispatch, suffix: '单', change: undefined, link: '/orders?tab=pending_start', visible: roleVisible(['super_admin', 'ops_admin']) },
    { title: '待补款', value: stats.pendingExtra, suffix: '单', change: undefined, link: '/orders?tab=pending_extra', visible: roleVisible(['super_admin', 'finance_admin']) },
  ].filter(c => c.visible);

  // 待办 — 待派车订单（最近5条）
  const pendingDispatchOrders = orders
    .filter(o => o.status === 'pending_dispatch')
    .slice(0, 5)
    .map(o => ({
      orderNo: o.orderNo,
      time: o.startTime?.slice(5) || o.rentalStart || '—',
      route: `${o.pickupAddress || '—'} → ${o.dropoffAddress || '—'}`,
      passenger: o.passengerName || o.passengerPhone,
    }));

  // 待办 — 待开票申请（最近5条）
  const pendingInvoices = invoices
    .filter(i => i.status === 'issuing')
    .slice(0, 5)
    .map(i => ({
      no: i.applyNo,
      applicant: i.applicantName,
      amount: i.amount,
    }));

  // 待办 — 待回款任务（最近5条）
  const pendingPayments = payments
    .filter(p => p.status === 'verifying')
    .slice(0, 5)
    .map(p => ({
      no: p.paymentNo,
      enterprise: p.enterpriseName,
      amount: p.amount,
    }));

  const hasPendingDispatch = pendingDispatchOrders.length > 0;
  const hasPendingInvoices = pendingInvoices.length > 0;
  const hasPendingPayments = pendingPayments.length > 0;
  const hasAnyTodo = hasPendingDispatch || hasPendingInvoices || hasPendingPayments;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 顶部欢迎条 */}
      <Card style={{ marginBottom: 16, flexShrink: 0 }} bodyStyle={{ padding: '16px 24px' }}>
        <Space size={12}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: '#165DFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 20, fontWeight: 600, flexShrink: 0,
          }}>
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>欢迎回来，{currentUser.name}</div>
            <Space size={8}>
              <Tag color="arcoblue" size="small">{currentUser.roleLabel}</Tag>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {new Date().toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Space>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Button icon={spinning ? <IconLoading /> : <IconRefresh />} onClick={handleRefresh}>刷新数据</Button>
          </div>
        </Space>
      </Card>

      {/* 核心数据卡片 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexShrink: 0 }}>
        {statCards.map((card, i) => (
          <Card
            key={i}
            hoverable
            bodyStyle={{ padding: '20px' }}
            onClick={() => navigate(card.link)}
            style={{ cursor: 'pointer', flex: 1 }}
          >
            <div style={{ fontSize: 13, color: '#86909c', marginBottom: 8 }}>{card.title}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>
              {card.prefix || ''}{typeof card.value === 'number' ? card.value.toLocaleString() : card.value}{card.suffix || ''}
            </div>
            {typeof card.change === 'number' && (
              <div style={{
                fontSize: 12, marginTop: 6,
                color: card.change >= 0 ? '#00B42A' : '#F53F3F',
                display: 'flex', alignItems: 'center',
              }}>
                {card.change >= 0 ? <IconArrowUp style={{ fontSize: 12 }} /> : <IconArrowDown style={{ fontSize: 12 }} />}
                <span style={{ marginLeft: 2 }}>较昨日 {Math.abs(card.change)}%</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* 待办 + 趋势 */}
      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        {/* 待办事项 */}
        <div style={{ flex: '0 0 38%', display: 'flex', flexDirection: 'column' }}>
          <Card
            title="待办事项"
            bodyStyle={{ padding: '0 20px 20px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {/* 待派车订单 */}
            {hasPendingDispatch && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1d2129', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>🚗 待派车订单（{stats.pendingDispatch}）</span>
                  {pendingDispatchOrders.length >= 5 && <Text type="secondary" style={{ fontSize: 12, cursor: 'pointer' }} onClick={() => navigate('/orders?tab=pending_start')}>查看全部</Text>}
                </div>
                {pendingDispatchOrders.map((o, i) => (
                  <div key={i} onClick={() => navigate('/orders?tab=pending_start')}
                    style={{ cursor: 'pointer', padding: '10px 12px', marginBottom: 8, background: '#FFECE8', border: '1px solid #FBACA3', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: '#86909c' }}>{o.orderNo}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1d2129' }}>{o.passenger} · {o.time}</div>
                    <div style={{ fontSize: 11, color: '#86909c', marginTop: 2 }}>{o.route}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 待开票申请 */}
            {hasPendingInvoices && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1d2129', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>🧾 待开票申请（{pendingInvoices.length}）</span>
                  <Text type="secondary" style={{ fontSize: 12, cursor: 'pointer' }} onClick={() => navigate('/finance/invoices?tab=issuing')}>查看全部</Text>
                </div>
                {pendingInvoices.map((iv, i) => (
                  <div key={i} onClick={() => navigate('/finance/invoices?tab=issuing')}
                    style={{ cursor: 'pointer', padding: '10px 12px', marginBottom: 8, background: '#E8F3FF', border: '1px solid #BEDAFF', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: '#86909c' }}>{iv.no}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1d2129' }}>{iv.applicant}</div>
                    <div style={{ fontSize: 11, color: '#86909c', marginTop: 2 }}>开票金额 ¥{iv.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 待回款任务 */}
            {hasPendingPayments && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1d2129', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>💰 待回款任务（{pendingPayments.length}）</span>
                  <Text type="secondary" style={{ fontSize: 12, cursor: 'pointer' }} onClick={() => navigate('/finance/payments?tab=verifying')}>查看全部</Text>
                </div>
                {pendingPayments.map((p, i) => (
                  <div key={i} onClick={() => navigate('/finance/payments?tab=verifying')}
                    style={{ cursor: 'pointer', padding: '10px 12px', marginBottom: 8, background: '#FFF7E8', border: '1px solid #FFCF7A', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: '#86909c' }}>{p.no}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1d2129' }}>{p.enterprise}</div>
                    <div style={{ fontSize: 11, color: '#86909c', marginTop: 2 }}>回款金额 ¥{p.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}

            {!hasAnyTodo && (
              <div style={{ textAlign: 'center', padding: 40, color: '#86909c', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                今日无待办事项
              </div>
            )}
          </Card>
        </div>

        {/* 数据趋势 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Card
            title="数据趋势"
            extra={
              <Space>
                <Tag color={trendDays === 7 ? 'arcoblue' : undefined} bordered={trendDays !== 7}
                  style={{ cursor: 'pointer' }} onClick={() => handleTrendToggle(7)}>近 7 天</Tag>
                <Tag color={trendDays === 30 ? 'arcoblue' : undefined} bordered={trendDays !== 30}
                  style={{ cursor: 'pointer' }} onClick={() => handleTrendToggle(30)}>近 30 天</Tag>
              </Space>
            }
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <DualLineChart data={chartData} />
          </Card>
        </div>
      </div>
    </div>
  );
}
