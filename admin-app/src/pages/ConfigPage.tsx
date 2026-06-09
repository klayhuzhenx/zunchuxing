import { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Select, Space, Tabs, Modal, Message, Input, Form, InputNumber, Switch,
} from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { vehicleModels, pricingRules, benefitTemplates, quotaAlertConfig } from '../data/mock';
import type { VehicleModel, PricingRule, BenefitTemplate } from '../types';

// ===== 计费规则 Tab =====
function PricingTab() {
  const [rules] = useState(pricingRules);
  const [bizTab, setBizTab] = useState('charter');
  const [modelFilter, setModelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');

  const charterRules = useMemo(() => rules.filter(r => r.tier), [rules]);
  const rentalRules = useMemo(() => rules.filter(r => !r.tier), [rules]);
  const currentRules = bizTab === 'charter' ? charterRules : rentalRules;

  const filtered = useMemo(() => {
    let r = currentRules;
    if (modelFilter) r = r.filter(pr => pr.modelName.includes(modelFilter));
    if (statusFilter) r = r.filter(pr => pr.status === statusFilter);
    return r;
  }, [currentRules, modelFilter, statusFilter]);

  const charterColumns = [
    { title: '车型', dataIndex: 'modelName', width: 150 },
    { title: '套餐档位', dataIndex: 'tier', width: 100, render: (v: string) => <Tag color="arcoblue" size="small">{v}</Tag> },
    { title: '半日租价', width: 100, render: (_: unknown, r: PricingRule) => r.halfDayPrice ? `¥${r.halfDayPrice}` : '-' },
    { title: '日租价', width: 100, render: (_: unknown, r: PricingRule) => `¥${r.dayPrice}` },
    { title: '服务内容', dataIndex: 'serviceContent', width: 200, ellipsis: true },
    { title: '超时费', width: 90, render: (_: unknown, r: PricingRule) => `¥${r.overtimeRate}/h` },
    { title: '超公里费', width: 100, render: (_: unknown, r: PricingRule) => `¥${r.extraMileageRate}/km` },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'gray'} size="small">{v === 'active' ? '启用' : '停用'}</Tag> },
    {
      title: '操作', width: 120, render: () => (
        <Space size={4}><Button type="text" size="small">编辑</Button><Button type="text" size="small" status="warning">停用</Button></Space>
      ),
    },
  ];

  const rentalColumns = [
    { title: '车型', dataIndex: 'modelName', width: 160 },
    { title: '日租价', width: 120, render: (_: unknown, r: PricingRule) => `¥${r.dayPrice}` },
    { title: '超时费', width: 100, render: (_: unknown, r: PricingRule) => `¥${r.overtimeRate}/h` },
    { title: '超公里费', width: 110, render: (_: unknown, r: PricingRule) => `¥${r.extraMileageRate}/km` },
    { title: '备注', dataIndex: 'remark', width: 160, ellipsis: true },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'gray'} size="small">{v === 'active' ? '启用' : '停用'}</Tag> },
    { title: '操作', width: 120, render: () => <Space size={4}><Button type="text" size="small">编辑</Button><Button type="text" size="small" status="warning">停用</Button></Space> },
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '12px 24px', marginBottom: 0 }}>
        <Space size={12} wrap>
          <Tabs activeTab={bizTab} onChange={setBizTab} type="card" style={{ marginBottom: 0 }}>
            <Tabs.TabPane key="charter" title="包车出行" />
            <Tabs.TabPane key="rental" title="租车出行" />
          </Tabs>
          <div style={{ flex: 1 }} />
          <Select placeholder="车型" style={{ width: 180 }} value={modelFilter || undefined} onChange={v => setModelFilter(v || '')} allowClear showSearch
            options={vehicleModels.filter(v => v.status === 'active').map(v => ({ label: v.name, value: v.name }))} />
          <Select placeholder="状态" style={{ width: 120 }} value={statusFilter}
            onChange={setStatusFilter}
            options={[{ label: '启用', value: 'active' }, { label: '停用', value: 'inactive' }]} allowClear />
          <Button type="primary" icon={<IconPlus />} onClick={() => Message.info('新增计费规则（MVP 略）')}>新增{bizTab === 'charter' ? '车型' : '车型'}计费</Button>
        </Space>
      </Card>
      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={bizTab === 'charter' ? charterColumns : rentalColumns} data={filtered} rowKey="id"
          scroll={{ x: bizTab === 'charter' ? 1100 : 900 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>
    </div>
  );
}

// ===== 车型管理 Tab =====
function ModelTab() {
  const [models] = useState(vehicleModels);
  const [catFilter, setCatFilter] = useState('');

  const filtered = useMemo(() => {
    let r = models;
    if (catFilter) r = r.filter(m => m.category === catFilter);
    return r;
  }, [models, catFilter]);

  const columns = [
    { title: '车型名称', dataIndex: 'name', width: 160 },
    { title: '品牌', dataIndex: 'brand', width: 80 },
    { title: '座位数', dataIndex: 'seats', width: 80 },
    { title: '分类', dataIndex: 'category', width: 100, render: (v: string) => <Tag size="small">{v}</Tag> },
    { title: '在用车辆数', dataIndex: 'vehicleCount', width: 100 },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'gray'} size="small">{v === 'active' ? '启用' : '停用'}</Tag> },
    { title: '操作', width: 140, render: () => <Space size={4}><Button type="text" size="small">编辑</Button><Button type="text" size="small" status="warning">停用</Button></Space> },
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12}>
          <Select placeholder="车型分类" style={{ width: 150 }} value={catFilter || undefined} onChange={v => setCatFilter(v || '')} allowClear
            options={['轿车', 'SUV', 'MPV', '豪华轿车'].map(c => ({ label: c, value: c }))} />
          <div style={{ flex: 1 }} />
          <Button type="primary" icon={<IconPlus />} onClick={() => Message.info('新增车型（MVP 略）')}>新增车型</Button>
        </Space>
      </Card>
      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 800 }} pagination={false} stripe />
      </Card>
    </div>
  );
}

// ===== 权益模板 Tab =====
function BenefitTab() {
  const [templates] = useState(benefitTemplates);

  const columns = [
    { title: '模板编号', dataIndex: 'code', width: 130 },
    { title: '模板名称', dataIndex: 'name', width: 180 },
    { title: '权益类型', dataIndex: 'type', width: 100, render: (v: string) => <Tag color="arcoblue" size="small">{v}</Tag> },
    { title: '总次数', dataIndex: 'totalCount', width: 80 },
    { title: '总金额', width: 100, render: (_: unknown, r: BenefitTemplate) => `¥${r.totalAmount.toLocaleString()}` },
    { title: '单次上限', width: 100, render: (_: unknown, r: BenefitTemplate) => r.singleLimit ? `¥${r.singleLimit.toLocaleString()}` : '不限' },
    { title: '有效期', width: 100, render: (_: unknown, r: BenefitTemplate) => `${r.validMonths} 个月` },
    { title: '适用车型', dataIndex: 'applicableModels', width: 200, render: (v: string[]) => v.length ? v.join(', ') : '全部' },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'gray'} size="small">{v === 'active' ? '启用' : '停用'}</Tag> },
    { title: '操作', width: 140, render: () => <Space size={4}><Button type="text" size="small">编辑</Button><Button type="text" size="small" status="warning">停用</Button></Space> },
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<IconPlus />} onClick={() => Message.info('新增权益模板（MVP 略）')}>新增模板</Button>
      </Card>
      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={templates} rowKey="id" scroll={{ x: 1300 }} pagination={false} stripe />
      </Card>
    </div>
  );
}

// ===== 额度告急 Tab =====
function QuotaTab() {
  const [config, setConfig] = useState(quotaAlertConfig);

  return (
    <Card title="额度告急阈值配置" style={{ maxWidth: 600 }}>
      <Form layout="vertical">
        <Form.Item label="告急阈值（元）" help="剩余额度低于该值时触发告急提醒">
          <InputNumber value={config.threshold} onChange={v => setConfig({ ...config, threshold: v || 0 })} min={0} style={{ width: '100%' }} suffix="元" />
        </Form.Item>
        <Form.Item label="提醒频率">
          <Select value={config.frequency} onChange={v => setConfig({ ...config, frequency: v })}
            options={['每小时', '每日 1 次', '每周'].map(f => ({ label: f, value: f }))} style={{ width: '100%' }} />
        </Form.Item>
        <Button type="primary" onClick={() => Message.success('阈值已更新')}>保存配置</Button>
      </Form>
    </Card>
  );
}

function AreaTab() {
  return (
    <Card style={{ textAlign: 'center', padding: 60 }}>
      <p style={{ color: '#86909c', fontSize: 14, marginBottom: 16 }}>运营区域设置（地图绘制多边形围栏）为进阶功能</p>
      <p style={{ color: '#86909c', fontSize: 12 }}>MVP 阶段暂不实现前端地图交互，后端保留接口</p>
    </Card>
  );
}

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState('pricing');

  return (
    <div>
      <Tabs activeTab={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }}>
        <Tabs.TabPane key="pricing" title="计费规则" />
        <Tabs.TabPane key="models" title="车型管理" />
        <Tabs.TabPane key="benefits" title="权益模板" />
        <Tabs.TabPane key="quota" title="额度告急" />
        <Tabs.TabPane key="areas" title="运营区域" />
      </Tabs>
      {activeTab === 'pricing' && <PricingTab />}
      {activeTab === 'models' && <ModelTab />}
      {activeTab === 'benefits' && <BenefitTab />}
      {activeTab === 'quota' && <QuotaTab />}
      {activeTab === 'areas' && <AreaTab />}
    </div>
  );
}
