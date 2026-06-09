import { useState } from 'react';
import { Card, Table, Tag, Typography, Select, Button, Drawer, Descriptions, Message, Space } from '@arco-design/web-react';
import { IconDownload, IconSend } from '@arco-design/web-react/icon';
import { mockInvoices } from '../../data/mock';
import type { Invoice } from '../../types';

const { Title } = Typography;

const statusMap: Record<string, { label: string; color: string }> = {
  pending_approval: { label: '待审批', color: 'orange' },
  rejected: { label: '已驳回', color: 'red' },
  issued: { label: '已开具', color: 'green' },
  cancelled: { label: '已作废', color: 'gray' },
};

export default function InvoicePage() {
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = mockInvoices.filter(i => {
    if (filterStatus.length && !filterStatus.includes(i.status)) return false;
    return true;
  });

  const detail = mockInvoices.find(i => i.id === detailId);

  const columns = [
    { title: '发票编号', dataIndex: 'invoiceNo', width: 150, render: (v: string) => <a style={{ color: '#165DFF', cursor: 'pointer' }} onClick={() => setDetailId(v)}>{v}</a> },
    { title: '类型', dataIndex: 'type', width: 80 },
    { title: '关联订单', dataIndex: 'relatedOrders', width: 300, ellipsis: true },
    { title: '金额', dataIndex: 'amount', width: 100, render: (v: number) => <span style={{ fontWeight: 500 }}>¥{v.toLocaleString()}</span> },
    { title: '申请人', dataIndex: 'applicant', width: 80 },
    { title: '申请时间', dataIndex: 'appliedAt', width: 130 },
    { title: '开具时间', dataIndex: 'issuedAt', width: 130, render: (v?: string) => v || '—' },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => {
      const s = statusMap[v];
      return <Tag color={s.color} size="small">{s.label}</Tag>;
    }},
    { title: '操作', width: 140, render: (_: unknown, r: Invoice) => (
      <Space size="small">
        <Button type="text" size="small" onClick={() => setDetailId(r.invoiceNo)}>详情</Button>
        {r.status === 'issued' && (
          <>
            <Button type="text" size="small" icon={<IconDownload />} onClick={() => Message.success('下载中...')}>下载</Button>
            <Button type="text" size="small" icon={<IconSend />} onClick={() => Message.success('已重新发送')}>重发</Button>
          </>
        )}
      </Space>
    )},
  ];

  return (
    <div>
      <Title heading={5} style={{ margin: '0 0 16px' }}>发票管理</Title>

      <Card>
        <Space style={{ marginBottom: 16 }} size="medium">
          <Select placeholder="发票状态" mode="multiple" value={filterStatus} onChange={setFilterStatus} style={{ width: 260 }}
            options={[{ label: '待审批', value: 'pending_approval' }, { label: '已驳回', value: 'rejected' }, { label: '已开具', value: 'issued' }, { label: '已作废', value: 'cancelled' }]} />
        </Space>
        {filtered.length > 0 ? (
          <Table columns={columns} data={filtered} rowKey="id" pagination={false} />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#86909c' }}>暂无发票记录</div>
        )}
      </Card>

      <Drawer visible={!!detailId} onCancel={() => setDetailId(null)} footer={null} width="50%" title="发票详情">
        {detail && (
          <>
            <Descriptions column={2} border size="small" style={{ marginBottom: 20 }}>
              <Descriptions.Item label="发票编号">{detail.invoiceNo}</Descriptions.Item>
              <Descriptions.Item label="发票类型">{detail.type}</Descriptions.Item>
              <Descriptions.Item label="开票金额">¥{detail.amount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={statusMap[detail.status].color} size="small">{statusMap[detail.status].label}</Tag></Descriptions.Item>
              <Descriptions.Item label="申请时间">{detail.appliedAt}</Descriptions.Item>
              <Descriptions.Item label="开具时间">{detail.issuedAt || '—'}</Descriptions.Item>
              <Descriptions.Item label="关联订单">{detail.relatedOrders}</Descriptions.Item>
              <Descriptions.Item label="申请人">{detail.applicant}</Descriptions.Item>
              <Descriptions.Item label="企业名称">{detail.companyName}</Descriptions.Item>
              <Descriptions.Item label="税号">{detail.taxId}</Descriptions.Item>
              <Descriptions.Item label="接收邮箱">{detail.email}</Descriptions.Item>
            </Descriptions>
            {detail.status === 'rejected' && detail.rejectReason && (
              <div style={{ background: '#FFECE8', padding: '12px 16px', borderRadius: 4, color: '#F53F3F', fontSize: 13 }}>
                驳回原因：{detail.rejectReason}
              </div>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
