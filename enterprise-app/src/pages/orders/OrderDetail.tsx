import { useState } from 'react';
import { Drawer, Tag, Descriptions, Timeline, Typography, Table, Empty, Button, Message } from '@arco-design/web-react';
import type { Order } from '../../types';

const { Title } = Typography;

const statusAlert: Record<string, { type: string; title: string; body: (o: Order) => string }> = {
  unpaid: { type: 'warning', title: '待支付', body: () => '订单已确认，请在支付超时前完成支付' },
  pending_dispatch: { type: 'warning', title: '待派车', body: () => '运营正在安排派车，请您耐心等待' },
  pending_start: { type: 'info', title: (o) => o.type === 'charter' ? '待接驾' : '待取车', body: (o) => o.type === 'charter' ? '司机已接单，准备出发中' : '等待司机将车辆送往取车点' },
  pending_enroute: { type: 'info', title: (o) => o.type === 'charter' ? '待接驾' : '待取车', body: (o) => o.type === 'charter' ? `${o.driverName} · ${o.plateNo} · 距离 2.3km · 预计 8 分钟到达` : (o.plateNo ? `${o.driverName} · ${o.plateNo}，司机正在将车辆送往取车点，距离 2.3km · 预计 8 分钟到达` : '司机正在将车辆送往取车点') },
  ongoing: { type: 'success', title: '进行中', body: (o) => o.type === 'charter' ? `${o.driverName} · ${o.plateNo}，祝您出行愉快` : (o.plateNo ? `${o.plateNo}，祝您用车愉快` : '祝您用车愉快') },
  completed: { type: 'success', title: '已完成', body: (o) => o.type === 'charter' ? '感谢您的出行，欢迎再次使用尊出行' : '感谢您的用车，欢迎再次使用尊出行' },
  cancelled: { type: 'error', title: '已取消', body: (o) => o.type === 'charter' ? `${o.cancelReason || '已取消'}${o.paidAmount > 0 ? '，违约金 ¥' + ((o.paidAmount || 0) - (o.refundAmount || 0)).toLocaleString() : ''}` : (o.cancelReason || '已取消') },
  pending_extra: { type: 'error', title: '待结算', body: () => '行程已结束，因超里程/超时产生额外费用，请及时结算' },
};

const alertColors: Record<string, string> = { warning: '#FF7D00', info: '#165DFF', success: '#00B42A', error: '#F53F3F' };
const alertBgs: Record<string, string> = { warning: '#FFF7E8', info: '#E8F3FF', success: '#E8FFEA', error: '#FFECE8' };
const statusLabels: Record<string, string> = { unpaid: '待支付', pending_dispatch: '待派车', pending_start: '待接驾', pending_enroute: '待接驾', ongoing: '进行中', completed: '已完成', cancelled: '已取消', pending_extra: '待结算' };

function getTimeline(order: Order): { label: string; dot: string }[] {
  const items = [
    { label: `订单已提交 · ${order.createdAt}`, dot: 'gray' },
    { label: order.paymentTime ? `支付成功（${order.paymentMethod === 'enterprise_credit' ? '企业额度' : order.paymentMethod === 'wechat' ? '微信' : '支付宝'}）· ¥${order.paidAmount.toLocaleString()}${order.pointsUsed ? ` 使用积分 ${order.pointsUsed.toLocaleString()}` : ''}` : '等待支付', dot: order.paymentTime ? 'green' : 'gray' },
  ];

  if (order.status === 'cancelled') return [...items, { label: `已取消${order.cancelReason ? '（' + order.cancelReason + '）' : ''}`, dot: 'red' }];

  if (order.type === 'charter') {
    if (order.status === 'pending_enroute') {
      items.push({ label: `司机出发前往上车点 · 预计 8 分钟到达`, dot: 'cyan' });
    }
    items.push({ label: order.driverName ? `已派车 · ${order.carModel} ${order.plateNo} · ${order.driverName}` : '待派车', dot: order.driverName ? 'blue' : 'gray' });
    if (['ongoing', 'completed', 'pending_extra'].includes(order.status)) items.push({ label: '行程开始', dot: 'green' });
    if (order.status === 'completed') items.push({ label: '行程结束', dot: 'green' });
    if (order.status === 'pending_extra') items.push({ label: '行程结束（待结算）', dot: 'red' });
  } else {
    items.push({ label: order.deliveryDriver ? `送车已派发 · ${order.deliveryDriver} · ${order.plateNo} · ${order.carModel}` : '待派车', dot: order.deliveryDriver ? 'blue' : 'gray' });
    if (['ongoing', 'completed', 'pending_extra'].includes(order.status)) {
      items.push({ label: '车辆已送达', dot: 'green' }, { label: '已确认取车', dot: 'green' });
    }
    if (order.status === 'completed') items.push({ label: '已还车', dot: 'green' });
    if (order.status === 'pending_extra') items.push({ label: '已还车（待结算）', dot: 'red' });
  }

  return items;
}

// 费用明细弹窗组件
function FeeSheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 600, maxHeight: '80vh', background: '#FFF', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{title}</span>
          <div onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: '#F2F2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</div>
        </div>
        <div style={{ padding: '0 24px 32px', overflow: 'auto' }}>{children}</div>
      </div>
    </div>
  );
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
  const isCharter = order.type === 'charter';
  const pointsUsed = order.pointsUsed || 0;
  const pointsDeduction = Math.floor(pointsUsed / 100);
  // 订单总金额 = 套餐+等待+超时+超里程+远调+其他
  const grossTotal = order.baseFee * (order.days || 1) + order.overtimeFee + order.overmileageFee + ((order.remoteDispatchDetail?.pickupFee ?? 0) + (order.remoteDispatchDetail?.dropoffFee ?? 0)) + Math.round((order.overtimeFee + order.overmileageFee) * 0.1);
  const dTotal = (order.depositVehicle || 0) + (order.depositViolation || 0);
  const vR = order.depositVehicleRefunded && (order.depositVehicle || 0) > 0 ? 1 : 0;
  const viR = order.depositViolationRefunded && (order.depositViolation || 0) > 0 ? 1 : 0;
  const dRefundCount = vR + viR;
  const dTotalCount = (order.depositVehicle ? 1 : 0) + (order.depositViolation ? 1 : 0);
  const depositStatusLabel = !dTotal ? '未收取' : dRefundCount === 0 ? '未退还' : dRefundCount < dTotalCount ? '部分退还' : '已退还';
  const depositStatusColor = !dTotal ? 'gray' : dRefundCount === 0 ? 'orangered' : dRefundCount < dTotalCount ? 'orange' : 'green';
  const beforeDispatch = ['unpaid', 'pending_dispatch'].includes(order.status);
  const showFullFee = ['completed', 'pending_extra', 'ongoing'].includes(order.status);

  const [feeModal, setFeeModal] = useState<{ visible: boolean; type: 'waiting' | 'overtime' | 'mileage' | 'remote' | 'other' | 'refund' }>({ visible: false, type: 'overtime' });

  const feeRowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' };

  return (
    <Drawer visible={true} onCancel={onClose} footer={null} width="60%" title="订单详情">
      {alert && (
        <div style={{ background: alertBgs[alert.type], borderLeft: `3px solid ${alertColors[alert.type]}`, padding: '12px 16px', borderRadius: 4, marginBottom: 20 }}>
          <strong style={{ color: alertColors[alert.type] }}>{alert.title}</strong>
          <div style={{ color: '#4E5969', fontSize: 13, marginTop: 4 }}>{alert.body(order)}</div>
          {order.status === 'cancelled' && (order.paidAmount || 0) > 0 && (
            <div style={{ color: '#F53F3F', fontSize: 13, marginTop: 4, fontWeight: 600 }}>
              违约金 ¥{((order.paidAmount || 0) - (order.refundAmount || 0)).toLocaleString()}
            </div>
          )}
        </div>
      )}

      <Title heading={6}>基本信息</Title>
      <Descriptions column={2} border size="small" style={{ marginBottom: 20 }}>
        <Descriptions.Item label="订单号">{order.orderNo}</Descriptions.Item>
        <Descriptions.Item label="类型"><Tag color={order.type === 'charter' ? 'gold' : 'gray'} size="small">{order.type === 'charter' ? '包车' : '租车'}</Tag></Descriptions.Item>
        <Descriptions.Item label="状态"><Tag color={alert?.type === 'error' ? 'red' : alert?.type === 'success' ? 'green' : 'orange'} size="small">{order.type === 'rental' && (order.status === 'pending_start' || order.status === 'pending_enroute') ? '待取车' : statusLabels[order.status]}{order.subStatus ? ` · ${order.subStatus}` : ''}</Tag></Descriptions.Item>
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
          <Descriptions.Item label="取车地点">{order.pickupAddress || order.pickupAddr || '—'}</Descriptions.Item>
          <Descriptions.Item label="还车地点">{order.dropoffAddress || order.returnAddr || '—'}</Descriptions.Item>
        </Descriptions>
      )}

      {order.type === 'charter' && order.schedules && order.schedules.length > 0 && (
        <>
          <Title heading={6}>日程与派车</Title>
          <Table columns={[
            { title: '日期', dataIndex: 'date', width: 80 },
            { title: '时段', dataIndex: 'timeRange', width: 130 },
            { title: '车辆', width: 160, render: (_: unknown, r: any) => r.vehiclePlate ? `${r.vehiclePlate} · ${r.vehicleModel}` : '—' },
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
      <div style={{ marginBottom: 20 }}>
        {beforeDispatch ? (
          <div style={feeRowStyle}>
            <span style={{ fontSize: 14, color: '#86868B' }}>基础费 ¥{order.baseFee.toLocaleString()}</span>
            <span style={{ fontSize: 16, fontWeight: 700 }}>¥{(order.baseFee * (order.days || 1)).toLocaleString()}</span>
          </div>
        ) : (
          <div>
            <div style={feeRowStyle}>
              <span style={{ fontSize: 14, color: '#86868B' }}>基础费 ¥{order.baseFee.toLocaleString()} × {order.days}天</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#00B42A' }}>已支付 ¥{(order.baseFee * (order.days || 1)).toLocaleString()}</span>
            </div>
            {order.feeExtraDetail?.waitFee && (
              <div style={{ ...feeRowStyle, cursor: 'pointer' }} onClick={() => setFeeModal({ visible: true, type: 'waiting' })}>
                <span style={{ fontSize: 14, color: '#F53F3F' }}>等待费（超 {order.feeExtraDetail.waitFee.freeMinutes}min）</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#F53F3F' }}>¥{order.feeExtraDetail.waitFee.amount.toLocaleString()} ›</span>
              </div>
            )}
            {showFullFee && (
              <div style={{ ...feeRowStyle, cursor: order.overtimeFee > 0 ? 'pointer' : 'default' }} onClick={() => { if (order.overtimeFee > 0) setFeeModal({ visible: true, type: 'overtime' }); }}>
                <span style={{ fontSize: 14, color: order.overtimeFee > 0 ? '#F53F3F' : '#86868B' }}>超时费 · ¥100/h</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: order.overtimeFee > 0 ? '#F53F3F' : '#000' }}>{order.overtimeFee > 0 ? `¥${order.overtimeFee.toLocaleString()} ›` : '¥0'}</span>
              </div>
            )}
            {showFullFee && (
              <div style={{ ...feeRowStyle, cursor: order.overmileageFee > 0 ? 'pointer' : 'default' }} onClick={() => { if (order.overmileageFee > 0) setFeeModal({ visible: true, type: 'mileage' }); }}>
                <span style={{ fontSize: 14, color: order.overmileageFee > 0 ? '#F53F3F' : '#86868B' }}>超公里费 · ¥5/km</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: order.overmileageFee > 0 ? '#F53F3F' : '#000' }}>{order.overmileageFee > 0 ? `¥${order.overmileageFee.toLocaleString()} ›` : '¥0'}</span>
              </div>
            )}
            {showFullFee && (() => {
              const rd = order.remoteDispatchDetail;
              const totalFee = rd ? rd.pickupFee + rd.dropoffFee : 0;
              const totalKm = rd ? rd.pickupKm + rd.dropoffKm : 0;
              const hasFee = totalFee > 0;
              return (
                <div style={{ ...feeRowStyle, cursor: hasFee ? 'pointer' : 'default' }}
                  onClick={() => { if (hasFee) setFeeModal({ visible: true, type: 'remote' }); }}>
                  <span style={{ fontSize: 14, color: hasFee ? '#F53F3F' : '#86868B' }}>
                    远调费{totalKm > 0 ? ` · ${totalKm.toFixed(1)}km` : ''}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: hasFee ? '#F53F3F' : '#000' }}>
                    {hasFee ? `¥${totalFee.toLocaleString()} ›` : '¥0'}
                  </span>
                </div>
              );
            })()}
            {showFullFee && pointsUsed > 0 && (
              <div style={feeRowStyle}>
                <span style={{ fontSize: 14, color: '#00B42A' }}>积分抵扣（使用 {pointsUsed.toLocaleString()} 积分）</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#00B42A' }}>-¥{pointsDeduction.toLocaleString()}</span>
              </div>
            )}
            {showFullFee && order.feeExtraDetail?.otherFees && order.feeExtraDetail.otherFees.length > 0 && (
              <div style={{ ...feeRowStyle, cursor: 'pointer' }} onClick={() => setFeeModal({ visible: true, type: 'other' })}>
                <span style={{ fontSize: 14, color: '#F53F3F' }}>其他费用</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#F53F3F' }}>¥{order.feeExtraDetail.otherFees.reduce((s, f) => s + f.amount, 0).toLocaleString()} ›</span>
              </div>
            )}
            {/* 订单总金额 = 套餐+等待+超时+超里程+远调+其他 */}
            <div style={{ borderTop: '1px solid #e5e6eb', margin: '8px 0', paddingTop: 8, ...feeRowStyle }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>订单总金额</span>
              <span style={{ fontSize: 20, fontWeight: 700 }}>¥{grossTotal.toLocaleString()}</span>
            </div>
            {/* 退款合计（有退款可查看明细） */}
            <div style={{ ...feeRowStyle, cursor: order.refundAmount ? 'pointer' : 'default' }}
              onClick={() => { if (order.refundAmount) setFeeModal({ visible: true, type: 'refund' }); }}>
              <span style={{ fontSize: 14, color: order.refundAmount ? '#F53F3F' : '#86868B' }}>退款合计</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: order.refundAmount ? '#F53F3F' : '#000' }}>
                {order.refundAmount ? `-¥${order.refundAmount.toLocaleString()} 明细 ›` : '¥0'}
              </span>
            </div>
            {/* 订单应付合计 = 订单总金额 − 退款合计 */}
            <div style={{ borderTop: '1px solid #e5e6eb', margin: '8px 0', paddingTop: 8, ...feeRowStyle }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>订单应付合计</span>
              <span style={{ fontSize: 20, fontWeight: 700 }}>¥{Math.max(0, grossTotal - (order.refundAmount || 0)).toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* 押金信息（仅租车 · 单独卡片） */}
      {!isCharter && order.userIdentity !== 'enterprise_employee' && dTotal > 0 && (() => {
        const vRefunded = order.depositVehicleRefunded;
        const viRefunded = order.depositViolationRefunded;
        return (
          <div style={{ background: '#fff', borderRadius: 8, padding: 16, marginBottom: 20, border: '1px solid #e5e6eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>押金信息</span>
              <Tag color={depositStatusColor} size="small">{depositStatusLabel}</Tag>
            </div>
            <Descriptions column={2} border size="small" data={[
              { label: '合计押金', value: `¥${dTotal.toLocaleString()}` },
              { label: '收取时间', value: order.depositVehiclePaidAt || order.depositViolationPaidAt || '—' },
            ]} />
            <Card size="small" title="车辆押金" style={{ marginTop: 12, background: '#FAFBFC' }}
              extra={<Tag color={vRefunded ? 'green' : 'red'} size="small">{vRefunded ? '已退款' : '未退'}</Tag>}>
              <Descriptions column={2} size="small" data={[
                { label: '金额', value: `¥${(order.depositVehicle || 0).toLocaleString()}` },
                ...(vRefunded ? [
                  { label: '扣款', value: (order.depositVehicleDeduct || 0) > 0 ? <span style={{ color: '#F53F3F' }}>-¥{(order.depositVehicleDeduct || 0).toLocaleString()}</span> : '¥0' },
                  { label: '已退', value: <span style={{ color: '#00B42A' }}>¥{((order.depositVehicle || 0) - (order.depositVehicleDeduct || 0)).toLocaleString()}</span> },
                  { label: '退还时间', value: order.depositVehicleRefundedAt || '—' },
                ] : []),
              ]} />
            </Card>
            <Card size="small" title="违章押金" style={{ marginTop: 8, background: '#FAFBFC' }}
              extra={<Tag color={viRefunded ? 'green' : 'red'} size="small">{viRefunded ? '已退款' : '未退'}</Tag>}>
              <Descriptions column={2} size="small" data={[
                { label: '金额', value: `¥${(order.depositViolation || 0).toLocaleString()}` },
                ...(viRefunded ? [
                  { label: '扣款', value: (order.depositViolationDeduct || 0) > 0 ? <span style={{ color: '#F53F3F' }}>-¥{(order.depositViolationDeduct || 0).toLocaleString()}</span> : '¥0' },
                  { label: '已退', value: <span style={{ color: '#00B42A' }}>¥{((order.depositViolation || 0) - (order.depositViolationDeduct || 0)).toLocaleString()}</span> },
                  { label: '退还时间', value: order.depositViolationRefundedAt || '—' },
                ] : []),
              ]} />
            </Card>
          </div>
        );
      })()}

      <Title heading={6}>订单动态</Title>
      <Timeline style={{ marginTop: 8 }}>
          {[...timeline].reverse().map((t, i) => (
            <Timeline.Item key={i} dotColor={dotColors[t.dot] || '#86909C'}>
              {t.label}
            </Timeline.Item>
          ))}
        </Timeline>

      {/* 费用明细弹窗 */}
      {feeModal.visible && (
        <FeeSheet title={feeModal.type === 'waiting' ? '等待费明细' : feeModal.type === 'overtime' ? '超时费明细' : feeModal.type === 'mileage' ? '超公里费明细' : feeModal.type === 'remote' ? '远调费明细' : feeModal.type === 'refund' ? '退款明细' : '其他费用明细'} onClose={() => setFeeModal({ visible: false, type: 'overtime' })}>
          {feeModal.type === 'waiting' && order.feeExtraDetail?.waitFee && (
            <div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>司机到达时间</span><span style={{ fontSize: 14 }}>{order.feeExtraDetail.waitFee.driverArriveTime || '—'}</span></div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>地址定位</span><span style={{ fontSize: 14 }}>{order.feeExtraDetail.waitFee.driverArriveAddr || '—'}</span></div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>乘客上车时间</span><span style={{ fontSize: 14 }}>{order.feeExtraDetail.waitFee.passengerPickupTime || '—'}</span></div>
              <div style={{ height: 1, background: '#F2F2F2', margin: '8px 0' }} />
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>免费等候</span><span style={{ fontSize: 14 }}>{order.feeExtraDetail.waitFee.freeMinutes} 分钟</span></div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>实际等候</span><span style={{ fontSize: 14 }}>{order.feeExtraDetail.waitFee.waitMinutes} 分钟</span></div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#F53F3F' }}>超时等候</span><span style={{ fontSize: 14, color: '#F53F3F' }}>{order.feeExtraDetail.waitFee.excessMinutes} 分钟</span></div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, fontWeight: 700, color: '#F53F3F' }}>等待费</span><span style={{ fontSize: 14, fontWeight: 700, color: '#F53F3F' }}>¥{order.feeExtraDetail.waitFee.amount.toLocaleString()}</span></div>
            </div>
          )}
          {feeModal.type === 'overtime' && order.feeExtraDetail?.overtimeDetails && order.feeExtraDetail.overtimeDetails.map((d, i) => (
            <div key={i}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{d.date}</div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>行程时间</span><span style={{ fontSize: 14 }}>{d.actualStart} — {d.actualEnd}</span></div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>总时长</span><span style={{ fontSize: 14 }}>{d.totalMinutes} 分钟</span></div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>套餐内时长</span><span style={{ fontSize: 14 }}>{d.packageMinutes} 分钟</span></div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#F53F3F' }}>超时时长</span><span style={{ fontSize: 14, color: '#F53F3F' }}>{d.excessMinutes} 分钟</span></div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, fontWeight: 700, color: '#F53F3F' }}>超时费</span><span style={{ fontSize: 14, fontWeight: 700, color: '#F53F3F' }}>¥{d.amount.toLocaleString()}</span></div>
              {i < (order.feeExtraDetail.overtimeDetails?.length || 1) - 1 && <div style={{ height: 1, background: '#F2F2F2', margin: '8px 0' }} />}
            </div>
          ))}
          {feeModal.type === 'mileage' && order.feeExtraDetail?.excessMileageDetails && order.feeExtraDetail.excessMileageDetails.map((d, i) => (
            <div key={i}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{d.date}</div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>开始里程</span><span style={{ fontSize: 14 }}>{d.startMileage} km</span></div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>结束里程</span><span style={{ fontSize: 14 }}>{d.endMileage} km</span></div>
              <div style={{ display: 'flex', gap: 12, padding: '10px 0' }}>
                <div style={{ width: 80, height: 60, background: '#F2F2F2', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, fontSize: 11, color: '#86868B' }}><span>🖼</span><span>开始</span></div>
                <div style={{ width: 80, height: 60, background: '#F2F2F2', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, fontSize: 11, color: '#86868B' }}><span>🖼</span><span>结束</span></div>
              </div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>当日里程</span><span style={{ fontSize: 14 }}>{d.totalKm} km</span></div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>套餐内里程</span><span style={{ fontSize: 14 }}>{d.packageKm} km</span></div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#F53F3F' }}>超里程</span><span style={{ fontSize: 14, color: '#F53F3F' }}>{d.excessKm} km</span></div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, fontWeight: 700, color: '#F53F3F' }}>超里程费</span><span style={{ fontSize: 14, fontWeight: 700, color: '#F53F3F' }}>¥{d.amount.toLocaleString()}</span></div>
              {i < (order.feeExtraDetail.excessMileageDetails?.length || 1) - 1 && <div style={{ height: 1, background: '#F2F2F2', margin: '8px 0' }} />}
            </div>
          ))}
          {feeModal.type === 'remote' && (() => {
            const rd = order.remoteDispatchDetail;
            const pickupLabel = isCharter ? '接远调距离' : '取远调距离';
            const dropoffLabel = isCharter ? '送远调距离' : '还远调距离';
            const totalFee = (rd?.pickupFee ?? 0) + (rd?.dropoffFee ?? 0);
            return (
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                  {isCharter ? '包车出行' : '租车出行'} · 远调费明细
                </div>
                <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>{pickupLabel}</span><span style={{ fontSize: 14 }}>{rd?.pickupKm ?? 0} km → ¥{(rd?.pickupFee ?? 0).toLocaleString()}</span></div>
                <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>{dropoffLabel}</span><span style={{ fontSize: 14 }}>{rd?.dropoffKm ?? 0} km → ¥{(rd?.dropoffFee ?? 0).toLocaleString()}</span></div>
                <div style={{ height: 1, background: '#F2F2F2', margin: '8px 0' }} />
                <div style={feeRowStyle}><span style={{ fontSize: 14, fontWeight: 700, color: totalFee > 0 ? '#F53F3F' : '#000' }}>远调费合计</span><span style={{ fontSize: 14, fontWeight: 700, color: totalFee > 0 ? '#F53F3F' : '#000' }}>¥{totalFee.toLocaleString()}</span></div>
              </div>
            );
          })()}

          {feeModal.type === 'other' && order.feeExtraDetail?.otherFees && order.feeExtraDetail.otherFees.map((f, i) => (
            <div key={f.id}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{f.type}</div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>金额</span><span style={{ fontSize: 14, color: '#F53F3F' }}>¥{f.amount.toLocaleString()}</span></div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>凭证</span><span style={{ fontSize: 14, color: '#165DFF', cursor: 'pointer' }} onClick={() => Message.info('预览凭证')}>查看凭证 ›</span></div>
              <div style={feeRowStyle}><span style={{ fontSize: 14, color: '#4C4546' }}>时间</span><span style={{ fontSize: 14 }}>{f.voucherTime || '—'}</span></div>
              {i < (order.feeExtraDetail.otherFees?.length || 1) - 1 && <div style={{ height: 1, background: '#F2F2F2', margin: '8px 0' }} />}
            </div>
          ))}
          {/* 退款明细：手工退款 + 订单退款 */}
          {feeModal.type === 'refund' && (
            <div>
              <div style={{ fontSize: 13, color: '#86909c', marginBottom: 12 }}>共 {order.refundRecords?.length || 0} 笔退款，合计 -¥{(order.refundAmount || 0).toLocaleString()}</div>
              {(order.refundRecords || []).map((r, i) => (
                <div key={r.id} style={{ marginBottom: i < (order.refundRecords?.length || 1) - 1 ? 16 : 0, padding: 12, background: '#FAFBFC', borderRadius: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Tag color={r.type === 'manual' ? 'orangered' : 'arcoblue'} size="small">{r.type === 'manual' ? '手工退款' : '订单退款'}</Tag>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#F53F3F' }}>-¥{r.amount.toLocaleString()}</span>
                  </div>
                  <div style={feeRowStyle}><span>申请退款时间</span><span>{r.time}</span></div>
                  {r.type === 'manual' ? (
                    <>
                      <div style={feeRowStyle}><span>操作人</span><span>{r.operator || '—'}</span></div>
                      <div style={feeRowStyle}><span>原因</span><span>{r.reason || '—'}</span></div>
                    </>
                  ) : (
                    <div style={feeRowStyle}><span>退款类型</span><span>{order.status === 'cancelled' ? '取消退款' : r.orderRefundType === 'early_end' ? '提前结束' : r.orderRefundType === 'cancel' ? '取消退款' : '—'}</span></div>
                  )}
                </div>
              ))}
              {(!order.refundRecords || order.refundRecords.length === 0) && (
                <div style={{ textAlign: 'center', color: '#86909c', padding: 24 }}>暂无退款记录</div>
              )}
            </div>
          )}
        </FeeSheet>
      )}
    </Drawer>
  );
}
