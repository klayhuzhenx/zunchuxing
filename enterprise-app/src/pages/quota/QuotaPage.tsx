import { useState } from 'react';
import { Card, Grid, Statistic, Table, Tag, Typography, Select, Space } from '@arco-design/web-react';
import { mockEnterprise, mockConsumption, mockQuotaChanges } from '../../data/mock';
import type { ConsumptionRecord, QuotaChangeRecord } from '../../types';

const { Row, Col } = Grid;
const { Title } = Typography;

export default function QuotaPage() {
  const [filterMonth, setFilterMonth] = useState('2026-06');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterType, setFilterType] = useState<string[]>([]);

  const filtered = mockConsumption.filter(r => {
    if (filterEmployee && r.passengerName !== filterEmployee) return false;
    if (filterType.length && !filterType.includes(r.type)) return false;
    return true;
  });

  const totalConsume = filtered.filter(r => r.type === 'consume').reduce((s, r) => s + r.amount, 0);
  const totalRefund = filtered.filter(r => r.type === 'refund').reduce((s, r) => s + r.amount, 0);

  const conColumns = [
    { title: '时间', dataIndex: 'time', width: 140 },
    { title: '类型', dataIndex: 'type', width: 80, render: (v: string) => (
      <Tag color={v === 'consume' ? 'red' : 'green'} size="small">{v === 'consume' ? '消费' : '退款'}</Tag>
    )},
    { title: '金额', dataIndex: 'amount', width: 100, render: (v: number, r: ConsumptionRecord) => (
      <span style={{ color: r.type === 'consume' ? '#F53F3F' : '#00B42A', fontWeight: 500 }}>
        {r.type === 'consume' ? '-' : '+'}¥{v.toLocaleString()}
      </span>
    )},
    { title: '关联订单', dataIndex: 'orderNo', width: 160, render: (v: string) => <a style={{ color: '#165DFF' }}>{v}</a> },
    { title: '用车人', dataIndex: 'passengerName', width: 80 },
    { title: '说明', dataIndex: 'description', width: 200 },
  ];

  const changeColumns = [
    { title: '时间', dataIndex: 'time', width: 140 },
    { title: '类型', dataIndex: 'type', width: 80, render: (v: string) => (
      <Tag color={v === 'increase' ? 'green' : 'red'} size="small">{v === 'increase' ? '调增' : '调减'}</Tag>
    )},
    { title: '金额', dataIndex: 'amount', width: 120, render: (v: number) => {
      const prefix = v > 0 ? '+' : '';
      return <span style={{ fontWeight: 500 }}>{prefix}¥{v.toLocaleString()}</span>;
    }},
    { title: '操作员', dataIndex: 'operator', width: 80 },
    { title: '原因', dataIndex: 'reason', width: 200 },
  ];

  return (
    <div>
      <Title heading={5} style={{ margin: '0 0 16px' }}>额度与消费</Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}><Card><Statistic title="总额度" value={mockEnterprise.totalQuota} prefix="¥" precision={0} /></Card></Col>
        <Col span={8}><Card><Statistic title="已使用" value={mockEnterprise.usedQuota} prefix="¥" precision={0} styleValue={{ color: '#F53F3F' }} /></Card></Col>
        <Col span={8}><Card><Statistic title="剩余额度" value={mockEnterprise.remainingQuota} prefix="¥" precision={0} styleValue={{ color: mockEnterprise.remainingQuota < 20000 ? '#F53F3F' : '#00B42A' }} /></Card></Col>
      </Row>

      <Card title="消费明细" style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 16 }} size="medium">
          <Select placeholder="月份" value={filterMonth} onChange={setFilterMonth} style={{ width: 120 }}
            options={[{ label: '2026-06', value: '2026-06' }, { label: '2026-05', value: '2026-05' }]} />
          <Select placeholder="员工" value={filterEmployee || undefined} onChange={(v) => setFilterEmployee(v || '')} allowClear style={{ width: 140 }}
            options={[{ label: '张先生', value: '张先生' }, { label: '李女士', value: '李女士' }, { label: '王先生', value: '王先生' }]} />
          <Select placeholder="类型" mode="multiple" value={filterType} onChange={setFilterType} style={{ width: 160 }}
            options={[{ label: '消费', value: 'consume' }, { label: '退款', value: 'refund' }]} />
        </Space>
        <Row gutter={16} style={{ marginBottom: 12 }}>
          <Col span={12}><span style={{ color: '#86909c', fontSize: 13 }}>当月消费总额：<strong style={{ color: '#F53F3F' }}>¥{totalConsume.toLocaleString()}</strong></span></Col>
          <Col span={12}><span style={{ color: '#86909c', fontSize: 13 }}>当月退款总额：<strong style={{ color: '#00B42A' }}>¥{totalRefund.toLocaleString()}</strong></span></Col>
        </Row>
        {filtered.length > 0 ? (
          <Table columns={conColumns} data={filtered} rowKey="id" pagination={false} size="small" />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#86909c' }}>暂无消费记录</div>
        )}
      </Card>

      <Card title="额度变动记录">
        {mockQuotaChanges.length > 0 ? (
          <Table columns={changeColumns} data={mockQuotaChanges} rowKey="id" pagination={false} size="small" />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#86909c' }}>暂无额度变动记录</div>
        )}
      </Card>
    </div>
  );
}
