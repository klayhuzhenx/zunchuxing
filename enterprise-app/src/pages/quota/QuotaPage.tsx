import { useState, useMemo } from 'react';
import { Card, Grid, Statistic, Table, Tag, Typography, Select, Space, Tabs, Button, Message } from '@arco-design/web-react';
import { IconExport } from '@arco-design/web-react/icon';
import { mockEnterprise, mockConsumption, mockQuotaChanges } from '../../data/mock';
import type { ConsumptionRecord, QuotaChangeRecord, TripType } from '../../types';

const { Row, Col } = Grid;
const { Title } = Typography;
const TabPane = Tabs.TabPane;

// E5-01：动态当前月份
const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

export default function QuotaPage() {
  const [activeTab, setActiveTab] = useState('consumption');
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterType, setFilterType] = useState<string[]>([]);

  const filtered = useMemo(() => {
    let r = mockConsumption;
    if (filterEmployee) r = r.filter(x => x.passengerName === filterEmployee);
    if (filterType.length) r = r.filter(x => filterType.includes(x.type));
    return r;
  }, [filterEmployee, filterType]);

  const totalConsume = filtered.filter(r => r.type === 'consume').reduce((s, r) => s + r.amount, 0);
  const totalRefund = filtered.filter(r => r.type === 'refund').reduce((s, r) => s + r.amount, 0);

  const conColumns = [
    { title: '时间', dataIndex: 'time', width: 150 },
    { title: '类型', dataIndex: 'type', width: 80, render: (v: string) => (
      <Tag color={v === 'consume' ? 'red' : 'green'} size="small">{v === 'consume' ? '消费' : '退款'}</Tag>
    )},
    { title: '出行类型', dataIndex: 'tripType', width: 90, render: (v: TripType) => (
      <Tag color={v === 'charter' ? 'gold' : 'gray'} size="small">{v === 'charter' ? '包车' : '租车'}</Tag>
    )},
    { title: '金额', dataIndex: 'amount', width: 110, render: (v: number, r: ConsumptionRecord) => (
      <span style={{ color: r.type === 'consume' ? '#F53F3F' : '#00B42A', fontWeight: 500 }}>
        {r.type === 'consume' ? '-' : '+'}¥{v.toLocaleString()}
      </span>
    )},
    { title: '关联订单', dataIndex: 'orderNo', width: 170, render: (v: string) => <a style={{ color: '#165DFF', cursor: 'pointer' }} onClick={() => Message.info(`跳转订单详情：${v}（通过 Drawer 打开）`)}>{v}</a> },
    { title: '用车人', dataIndex: 'passengerName', width: 80 },
    { title: '说明', dataIndex: 'description', width: 200 },
  ];

  const changeColumns = [
    { title: '时间', dataIndex: 'time', width: 150 },
    { title: '类型', dataIndex: 'type', width: 80, render: (v: string) => (
      <Tag color={v === 'increase' ? 'green' : 'red'} size="small">{v === 'increase' ? '调增' : '调减'}</Tag>
    )},
    { title: '金额', dataIndex: 'amount', width: 120, render: (v: number) => {
      const prefix = v > 0 ? '+' : '';
      return <span style={{ fontWeight: 500 }}>{prefix}¥{v.toLocaleString()}</span>;
    }},
    { title: '操作员', dataIndex: 'operator', width: 90 },
    { title: '原因', dataIndex: 'reason', width: 220 },
  ];

  return (
    <div>
      <Title heading={5} style={{ margin: '0 0 16px' }}>额度与消费</Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}><Card><Statistic title="总额度" value={mockEnterprise.totalQuota} prefix="¥" precision={0} /></Card></Col>
        <Col span={8}><Card><Statistic title="已使用" value={mockEnterprise.usedQuota} prefix="¥" precision={0} styleValue={{ color: '#F53F3F' }} /></Card></Col>
        <Col span={8}><Card><Statistic title="剩余额度" value={mockEnterprise.remainingQuota} prefix="¥" precision={0} styleValue={{ color: mockEnterprise.remainingQuota < 20000 ? '#F53F3F' : '#00B42A' }} /></Card></Col>
      </Row>

      <Card>
        <Tabs activeTab={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }}>
          <TabPane key="consumption" title="消费明细" />
          <TabPane key="quota" title="额度变动记录" />
        </Tabs>

        {activeTab === 'consumption' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Space size="medium">
                <Select placeholder="月份" value={filterMonth} onChange={setFilterMonth} style={{ width: 120 }}
                  options={[{ label: '2026-06', value: '2026-06' }, { label: '2026-05', value: '2026-05' }]} />
                <Select placeholder="员工" value={filterEmployee || undefined} onChange={(v) => setFilterEmployee(v || '')} allowClear style={{ width: 140 }}
                  options={[{ label: '张先生', value: '张先生' }, { label: '李女士', value: '李女士' }, { label: '王先生', value: '王先生' }]} />
                <Select placeholder="类型" mode="multiple" value={filterType} onChange={setFilterType} style={{ width: 160 }}
                  options={[{ label: '消费', value: 'consume' }, { label: '退款', value: 'refund' }]} />
              </Space>
              <Button icon={<IconExport />} onClick={() => Message.success('导出成功')}>导出消费明细</Button>
            </div>

            <Row gutter={16} style={{ marginBottom: 12 }}>
              <Col span={8}><span style={{ color: '#86909c', fontSize: 13 }}>消费总额：<strong style={{ color: '#F53F3F' }}>¥{totalConsume.toLocaleString()}</strong></span></Col>
              <Col span={8}><span style={{ color: '#86909c', fontSize: 13 }}>退款总额：<strong style={{ color: '#00B42A' }}>¥{totalRefund.toLocaleString()}</strong></span></Col>
              <Col span={8}><span style={{ color: '#86909c', fontSize: 13 }}>实际消费：<strong style={{ color: '#1A1C1C' }}>¥{(totalConsume - totalRefund).toLocaleString()}</strong></span></Col>
            </Row>

            {filtered.length > 0 ? (
              <Table columns={conColumns} data={filtered} rowKey="id" pagination={false} size="small" />
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#86909c' }}>暂无消费记录</div>
            )}
          </>
        )}

        {activeTab === 'quota' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <Button icon={<IconExport />} onClick={() => Message.success('导出成功')}>导出额度记录</Button>
            </div>
            {mockQuotaChanges.length > 0 ? (
              <Table columns={changeColumns} data={mockQuotaChanges} rowKey="id" pagination={false} size="small" />
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#86909c' }}>暂无额度变动记录</div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
