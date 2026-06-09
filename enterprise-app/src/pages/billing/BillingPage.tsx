import { useState } from 'react';
import { Card, Table, Tag, Typography, Select, Button, Drawer, Descriptions, Message, Space } from '@arco-design/web-react';
import { IconExport } from '@arco-design/web-react/icon';
import { mockBills, getBillDetails } from '../../data/mock';
import type { Bill, BillDetailItem, BillRefundItem, SettlementRecord } from '../../types';

const { Title } = Typography;

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待结算', color: 'orange' },
  partial: { label: '部分结算', color: 'blue' },
  settled: { label: '已结算', color: 'green' },
};

export default function BillingPage() {
  const [filterMonth, setFilterMonth] = useState('2026-06');
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = mockBills.filter(b => {
    if (filterMonth && b.month !== filterMonth) return false;
    if (filterStatus.length && !filterStatus.includes(b.status)) return false;
    return true;
  });

  const detail = mockBills.find(b => b.id === detailId);
  const detailData = detail ? getBillDetails(detail.month) : null;

  const columns = [
    { title: '账单编号', dataIndex: 'billNo', width: 160 },
    { title: '账单月份', dataIndex: 'month', width: 100, render: (v: string) => v.replace('-', '年') + '月' },
    { title: '当期消费', dataIndex: 'consumption', width: 110, render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '当期退款', dataIndex: 'refund', width: 110, render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '待结算总额', dataIndex: 'pendingAmount', width: 120, render: (v: number) => <span style={{ fontWeight: 500 }}>¥{v.toLocaleString()}</span> },
    { title: '已结算金额', dataIndex: 'settledAmount', width: 120, render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '结算状态', dataIndex: 'status', width: 90, render: (v: string) => {
      const s = statusMap[v];
      return <Tag color={s.color} size="small">{s.label}</Tag>;
    }},
    { title: '操作', width: 80, render: (_: unknown, r: Bill) => <Button type="text" size="small" onClick={() => setDetailId(r.id)}>查看详情</Button> },
  ];

  const consumeColumns = [
    { title: '日期', dataIndex: 'date' }, { title: '订单号', dataIndex: 'orderNo' },
    { title: '类型', dataIndex: 'type' }, { title: '用车人', dataIndex: 'passenger' },
    { title: '金额', dataIndex: 'amount', render: (v: number) => `¥${v.toLocaleString()}` },
  ];

  const refundColumns = [
    { title: '日期', dataIndex: 'date' }, { title: '退款单号', dataIndex: 'refundNo' },
    { title: '关联订单', dataIndex: 'orderNo' }, { title: '金额', dataIndex: 'amount', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '原因', dataIndex: 'reason' },
  ];

  return (
    <div>
      <Title heading={5} style={{ margin: '0 0 16px' }}>账单管理</Title>

      <Card>
        <Space style={{ marginBottom: 16 }} size="medium">
          <Select placeholder="账单月份" value={filterMonth} onChange={setFilterMonth} style={{ width: 140 }}
            options={[{ label: '2026-06', value: '2026-06' }, { label: '2026-05', value: '2026-05' }]} />
          <Select placeholder="结算状态" mode="multiple" value={filterStatus} onChange={setFilterStatus} style={{ width: 200 }}
            options={[{ label: '待结算', value: 'pending' }, { label: '部分结算', value: 'partial' }, { label: '已结算', value: 'settled' }]} />
        </Space>
        {filtered.length > 0 ? (
          <Table columns={columns} data={filtered} rowKey="id" pagination={false} />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#86909c' }}>暂无账单</div>
        )}
      </Card>

      <Drawer visible={!!detailId} onCancel={() => setDetailId(null)} footer={null} width="60%" title="账单详情">
        {detail && detailData && (
          <>
            <Descriptions column={2} border size="small" style={{ marginBottom: 20 }}>
              <Descriptions.Item label="账单编号">{detail.billNo}</Descriptions.Item>
              <Descriptions.Item label="账单月份">{detail.month.replace('-', '年')}月</Descriptions.Item>
              <Descriptions.Item label="当期消费">¥{detail.consumption.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="当期退款">¥{detail.refund.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="待结算总额"><strong>¥{detail.pendingAmount.toLocaleString()}</strong></Descriptions.Item>
              <Descriptions.Item label="结算状态"><Tag color={statusMap[detail.status].color} size="small">{statusMap[detail.status].label}</Tag></Descriptions.Item>
            </Descriptions>

            <Button icon={<IconExport />} onClick={() => Message.success('导出成功')} style={{ marginBottom: 16 }}>导出明细</Button>

            <Title heading={6}>消费明细</Title>
            <Table columns={consumeColumns} data={detailData.details} rowKey="orderNo" pagination={false} size="small" style={{ marginBottom: 20 }} />

            {detailData.refunds.length > 0 && (
              <>
                <Title heading={6}>退款明细</Title>
                <Table columns={refundColumns} data={detailData.refunds} rowKey="refundNo" pagination={false} size="small" style={{ marginBottom: 20 }} />
              </>
            )}

            {detailData.settlements.length > 0 && (
              <>
                <Title heading={6}>结算记录</Title>
                <Table columns={[
                  { title: '操作人', dataIndex: 'operator' }, { title: '结算时间', dataIndex: 'time' },
                  { title: '结算金额', dataIndex: 'amount', render: (v: number) => `¥${v.toLocaleString()}` },
                ]} data={detailData.settlements} rowKey="time" pagination={false} size="small" />
              </>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
