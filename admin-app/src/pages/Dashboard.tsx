import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tag, Button, Typography, Space, List, Badge, Message } from '@arco-design/web-react';
import { IconArrowUp, IconArrowDown, IconRefresh, IconRight } from '@arco-design/web-react/icon';
import { dashboardStats, trendData, currentUser } from '../data/mock';
import type { Role, TodoItem } from '../types';

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
          {Math.round(maxR * (1 - frac))}万
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
      <text x={pl + 70} y={14} fontSize={11} fill="#00B42A">-- 交易额(万元)</text>
    </svg>
  );
}

// 模拟近30天数据
const trend30: { date: string; orders: number; revenue: number }[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - 29 + i);
  return {
    date: `${d.getMonth() + 1}/${d.getDate()}`,
    orders: 25 + Math.floor(Math.random() * 40),
    revenue: Math.round((4 + Math.random() * 8) * 10) / 10,
  };
});

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(dashboardStats);
  const [trendDays, setTrendDays] = useState<7 | 30>(7);
  const [chartData, setChartData] = useState(trendData);

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
    setStats({ ...dashboardStats });
    Message.success('数据已刷新');
  };

  const handleTrendToggle = (days: 7 | 30) => {
    setTrendDays(days);
    setChartData(days === 7 ? trendData : trend30);
  };

  const role = currentUser.role as Role;
  const roleVisible = (roles: string[]) => roles.includes(role);

  const statCards = [
    { title: '今日订单', value: stats.todayOrders, suffix: '单', change: stats.todayOrdersChange, link: '/orders', visible: true },
    { title: '今日交易额', value: stats.todayRevenue, prefix: '¥', change: stats.todayRevenueChange, link: '/orders', visible: true },
    { title: '待派车', value: stats.pendingDispatch, suffix: '单', link: '/orders?tab=pending_dispatch', visible: roleVisible(['super_admin', 'ops_admin']) },
    { title: '待补款', value: stats.pendingExtra, suffix: '单', link: '/orders?tab=unpaid', visible: roleVisible(['super_admin', 'ops_admin', 'finance_admin']) },
    { title: '在线司机', value: `${stats.onlineDrivers}/${stats.totalDrivers}`, link: '/drivers', visible: roleVisible(['super_admin', 'ops_admin']) },
  ].filter(c => c.visible);

  const todos: TodoItem[] = [
    { id: 'T1', type: 'dispatch', title: '待派车订单', count: stats.pendingDispatch, subtitle: '最近出发：06-08 07:00 王雪梅', priority: 'urgent', link: '/orders?tab=pending_dispatch' },
    { id: 'T2', type: 'dispatch_urgent', title: '调度临近超时（≤2.5h）', count: 1, subtitle: '距出发不足 2.5 小时的未派车订单', priority: 'urgent', link: '/orders?tab=pending_dispatch' },
    { id: 'T3', type: 'doc_audit', title: '待审核证件', count: 0, subtitle: '司机/车辆证件待审核', priority: 'normal', link: '/drivers' },
    { id: 'T4', type: 'enterprise_audit', title: '待审核企业入驻', count: 2, priority: 'important', link: '/enterprise?status=pending' },
    { id: 'T5', type: 'refund', title: '退款待执行', count: 1, subtitle: '已确认取消但退款未完成', priority: 'important', link: '/finance' },
    { id: 'T6', type: 'quota_alert', title: '额度告急企业', count: 2, subtitle: '剩余额度低于 ¥2,000 的企业', priority: 'important', link: '/enterprise?quota=low' },
  ];

  const priorityColor: Record<string, string> = { urgent: 'red', important: 'orangered', normal: 'arcoblue' };
  const hasTodos = todos.some(t => t.count > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* §2.1 顶部欢迎条 */}
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
            <Button icon={<IconRefresh />} onClick={handleRefresh}>刷新数据</Button>
          </div>
        </Space>
      </Card>

      {/* §2.2 核心数据卡片 — 均分满宽 */}
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

      {/* §2.3 + §2.4 — 下方两块等高 */}
      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        {/* 待办事项 */}
        <div style={{ flex: '0 0 36%', display: 'flex', flexDirection: 'column' }}>
          <Card
            title="待办事项"
            bodyStyle={{ padding: '0 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}
            extra={<Text type="secondary" style={{ fontSize: 12 }}>共 {todos.filter(t => t.count > 0).length} 项</Text>}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {!hasTodos ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#86909c', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                今日无待办事项
              </div>
            ) : (
              <List
                dataSource={todos.filter(t => t.count > 0)}
                render={(item) => (
                  <List.Item
                    key={item.id}
                    style={{ cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}
                    onClick={() => navigate(item.link)}
                    actions={[<IconRight key="go" style={{ color: '#c9cdd4' }} />]}
                  >
                    <List.Item.Meta
                      title={
                        <Space size={8}>
                          <Badge status={item.priority === 'urgent' ? 'error' : item.priority === 'important' ? 'warning' : 'default'} />
                          <span>{item.title}</span>
                          <Tag color={priorityColor[item.priority]} size="small">{item.count}</Tag>
                        </Space>
                      }
                      description={item.subtitle && (
                        <Text type="secondary" style={{ fontSize: 12 }}>{item.subtitle}</Text>
                      )}
                    />
                  </List.Item>
                )}
              />
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
