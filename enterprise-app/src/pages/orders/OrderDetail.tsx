import { Drawer, Tag, Descriptions, Timeline, Typography, Table } from '@arco-design/web-react';
import type { Order } from '../../types';

const { Title } = Typography;

const statusAlert: Record<string, { type: string; title: string; body: (o: Order) => string }> = {
  unpaid: { type: 'warning', title: '等待支付', body: () => '订单已提交，等待员工完成支付' },
  pending_dispatch: { type: 'warning', title: '等待派车', body: () => '运营正在安排车辆与司机，请您耐心等待' },
  pending_start: { type: 'info', title: '行程待开始', body: (o) => `车辆和司机已确认：${o.driverName} · ${o.plateNo}` },
  ongoing: { type: 'success', title: '行程进行中', body: (o) => `${o.driverName} · ${o.plateNo}，当前行程进行中` },
  completed: { type: 'success', title: '行程已完成', body: () => '感谢使用尊出行，欢迎再次出行' },
  cancelled: { type: 'error', title: '订单已取消', body: (o) => o.cancelReason || '已取消' },
  pending_extra: { type: 'error', title: '差额待付', body: () => '行程结束产生额外费用，等待员工完成补款' },
};

const alertColors: Record<string, string> = { warning: '#FF7D00', info: '#165DFF', success: '#00B42A', error: '#F53F3F' };
const alertBgs: Record<string, string> = { warning: '#FFF7E8', info: '#E8F3FF', success: '#E8FFEA', error: '#FFECE8' };
const statusLabels: Record<string, string> = { unpaid: '待支付', pending_dispatch: '待派车', pending_start: '待开始', ongoing: '行程中', completed: '已完成', cancelled: '已取消', pending_extra: '待补款' };

function getTimeline(order: Order): { label: string; dot: string }[] {
  const items = [
    { label: `订单已提交 · ${order.createdAt}`, dot: 'gray' },
    { label: order.paymentTime ? `支付成功 · ${order.paymentTime}` : '等待支付', dot: order.paymentTime ? 'green' : 'gray' },
  ];

  if (order.status === 'cancelled') return [...items, { label: `已取消${order.cancelReason ? '（' + order.cancelReason + '）' : ''}`, dot: 'red' }];

  if (order.type === 'charter') {
    items.push({ label: order.driverName ? `已派车 · ${order.carModel} ${order.plateNo} · ${order.driverName}` : '待派车', dot: order.driverName ? 'blue' : 'gray' });
    if (['ongoing', 'completed', 'pending_extra'].includes(order.status)) items.push({ label: '行程开始', dot: 'green' });
    if (order.status === 'completed') items.push({ label: '行程结束', dot: 'green' });
    if (order.status === 'pending_extra') items.push({ label: '行程结束（有待补款）', dot: 'red' });
  } else {
    items.push({ label: order.deliveryDriver ? `送车已派发 · ${order.deliveryDriver} · ${order.plateNo} · ${order.carModel}` : '待派车', dot: order.deliveryDriver ? 'blue' : 'gray' });
    if (['ongoing', 'completed', 'pending_extra'].includes(order.status)) {
      items.push({ label: '车辆已送达', dot: 'green' }, { label: '已确认取车', dot: 'green' });
    }
    if (order.status === 'completed') items.push({ label: '已还车', dot: 'green' });
    if (order.status === 'pending_extra') items.push({ label: '已还车（有待补款）', dot: 'red' });
  }

  return items;
}

export default function OrderDetail({ open: show, orderNo, orders, onClose }: { open?: boolean; orderNo: string; orders: Order[]; onClose: () => void }) {
  const order = orders.find(o => o.orderNo === orderNo);
  if (!order) {
    console.warn('Order not found:', orderNo, orders.map(o => o.orderNo));
    return null;
  }

  const alert = statusAlert[order.status];
  const timeline = getTimeline(order);
  const dotColors: Record<string, string> = { green: '#00B42A', red: '#F53F3F', blue: '#165DFF', gray: '#86909C' };

  return (
    <Drawer visible={true} onCancel={onClose} footer={null} width="60%" title="订单详情">
      {alert && (
        <div style={{ background: alertBgs[alert.type], borderLeft: `3px solid ${alertColors[alert.type]}`, padding: '12px 16px', borderRadius: 4, marginBottom: 20 }}>
          <strong style={{ color: alertColors[alert.type] }}>{alert.title}</strong>
          <div style={{ color: '#4E5969', fontSize: 13, marginTop: 4 }}>{alert.body(order)}</div>
        </div>
      )}

      <Title heading={6}>基本信息</Title>
      <Descriptions column={2} border size="small" style={{ marginBottom: 20 }}>
        <Descriptions.Item label="订单号">{order.orderNo}</Descriptions.Item>
        <Descriptions.Item label="类型"><Tag color={order.type === 'charter' ? 'gold' : 'gray'} size="small">{order.type === 'charter' ? '包车' : '租车'}</Tag></Descriptions.Item>
        <Descriptions.Item label="状态"><Tag color={alert?.type === 'error' ? 'red' : alert?.type === 'success' ? 'green' : 'orange'} size="small">{statusLabels[order.status]}{order.subStatus ? ` · ${order.subStatus}` : ''}</Tag></Descriptions.Item>
        <Descriptions.Item label="下单时间">{order.createdAt}</Descriptions.Item>
      </Descriptions>

      <Title heading={6}>用车人信息</Title>
      <Descriptions column={2} border size="small" style={{ marginBottom: 20 }}>
        <Descriptions.Item label="姓名">{order.passengerName || '—'}</Descriptions.Item>
        <Descriptions.Item label="手机号">{order.passengerPhone}</Descriptions.Item>
        {order.passengerRole && <Descriptions.Item label="角色">{order.passengerRole}</Descriptions.Item>}
      </Descriptions>

      <Title heading={6}>用车信息</Title>
      {order.type === 'charter' ? (
        <Descriptions column={2} border size="small" style={{ marginBottom: 20 }}>
          <Descriptions.Item label="用车时段">{order.startTime} ~ {order.endTime}</Descriptions.Item>
          <Descriptions.Item label="天数">{order.days}天</Descriptions.Item>
          <Descriptions.Item label="上车地点">{order.pickupAddress}</Descriptions.Item>
          <Descriptions.Item label="下车地点">{order.dropoffAddress}</Descriptions.Item>
          {order.passengerCount && <Descriptions.Item label="人数">{order.passengerCount}人</Descriptions.Item>}
          {order.luggage && <Descriptions.Item label="行李">{order.luggage}</Descriptions.Item>}
        </Descriptions>
      ) : (
        <Descriptions column={2} border size="small" style={{ marginBottom: 20 }}>
          <Descriptions.Item label="租期">{order.rentalStart} ~ {order.rentalEnd}</Descriptions.Item>
          <Descriptions.Item label="取车地点">{order.pickupAddr}</Descriptions.Item>
          <Descriptions.Item label="还车地点">{order.returnAddr}</Descriptions.Item>
        </Descriptions>
      )}

      {order.type === 'charter' && order.schedules && order.schedules.length > 0 && (
        <>
          <Title heading={6}>日程与派车</Title>
          <Table columns={[
            { title: '日期', dataIndex: 'date', width: 80 },
            { title: '时段', dataIndex: 'timeRange', width: 130 },
            { title: '车辆', width: 160, render: (_: unknown, r: any) => r.vehiclePlate ? `${r.vehiclePlate} · ${r.vehicleModel}` : <Tag size="small" color="red">待派车</Tag> },
            { title: '司机', width: 120, render: (_: unknown, r: any) => r.driverName ? `${r.driverName} ${r.driverPhone}` : '—' },
            { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => {
              const m: Record<string, { label: string; color: string }> = { ongoing: { label: '进行中', color: 'green' }, not_started: { label: '未开始', color: 'gray' }, completed: { label: '已完成', color: 'gray' } };
              const s = m[v] || { label: v, color: 'gray' };
              return <Tag size="small" color={s.color}>{s.label}</Tag>;
            }},
          ]} data={order.schedules} rowKey="date" pagination={false} size="small" style={{ marginBottom: 20 }} />
        </>
      )}

      {order.type === 'rental' && (
        <>
          <Title heading={6}>派车信息</Title>
          <Descriptions column={2} border size="small" style={{ marginBottom: 20 }}>
            <Descriptions.Item label="车辆">{order.plateNo ? `${order.plateNo} · ${order.carModel}` : <Tag size="small" color="red">待派车</Tag>}</Descriptions.Item>
            <Descriptions.Item label="送车司机">{order.deliveryDriver ? `${order.deliveryDriver} ${order.deliveryDriverPhone}` : <Tag size="small" color="red">待派车</Tag>}</Descriptions.Item>
            <Descriptions.Item label="收车司机">{order.pickupDriver ? `${order.pickupDriver} ${order.pickupDriverPhone}` : '—'}</Descriptions.Item>
          </Descriptions>
        </>
      )}

      <Title heading={6}>费用明细</Title>
      <Descriptions column={2} border size="small" style={{ marginBottom: 20 }}>
        <Descriptions.Item label="基础费">¥{order.baseFee.toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="超时费"><span style={{ color: '#F53F3F' }}>¥{order.overtimeFee.toLocaleString()}</span></Descriptions.Item>
        <Descriptions.Item label="超里程费"><span style={{ color: '#F53F3F' }}>¥{order.overmileageFee.toLocaleString()}</span></Descriptions.Item>
        <Descriptions.Item label="实付金额"><strong>¥{order.paidAmount.toLocaleString()}</strong></Descriptions.Item>
      </Descriptions>

      <Title heading={6}>订单动态</Title>
      <Timeline items={timeline.map(t => ({
        label: t.label,
        dotColor: dotColors[t.dot] || '#86909C',
      })).reverse()} style={{ marginTop: 8 }} />
    </Drawer>
  );
}
