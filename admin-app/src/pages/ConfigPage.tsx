import { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Select, Space, Tabs, Modal, Message, Input, Form, InputNumber, Descriptions,
} from '@arco-design/web-react';
import { IconPlus, IconSearch } from '@arco-design/web-react/icon';
import { vehicleModels, pricingRules, benefitTemplates, quotaAlertConfig } from '../data/mock';
import type { VehicleModel, PricingRule, BenefitTemplate } from '../types';

// ===== 计费规则 Tab =====
function PricingTab() {
  const [rules, setRules] = useState(pricingRules);
  const [bizTab, setBizTab] = useState('charter');
  const [modelFilter, setModelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [addVisible, setAddVisible] = useState(false);
  const [addForm] = Form.useForm();

  const charterRules = useMemo(() => rules.filter(r => r.tier), [rules]);
  const rentalRules = useMemo(() => rules.filter(r => !r.tier), [rules]);
  const currentRules = bizTab === 'charter' ? charterRules : rentalRules;

  const filtered = useMemo(() => {
    let r = currentRules;
    if (modelFilter) r = r.filter(pr => pr.modelName.includes(modelFilter));
    if (statusFilter) r = r.filter(pr => pr.status === statusFilter);
    return r;
  }, [currentRules, modelFilter, statusFilter]);

  const handleAdd = () => {
    addForm.validate().then(v => {
      Message.success('规则保存成功');
      setAddVisible(false);
      addForm.resetFields();
    }).catch(() => {});
  };

  const cancelSummary = (r: PricingRule) =>
    `免费: ${r.cancelFreeMins}min / ${r.cancelFreeHours}h | 中档 ${r.cancelMidLow}-${r.cancelMidHigh}h 扣${r.cancelMidPct}% | 高档 扣${r.cancelHighPct}%`;

  const charterColumns = [
    { title: '车型', dataIndex: 'modelName', width: 150 },
    { title: '套餐档位', dataIndex: 'tier', width: 110, render: (v: string) => <Tag color="arcoblue" size="small">{v}</Tag> },
    { title: '半日租价', width: 100, render: (_: unknown, r: PricingRule) => r.halfDayPrice ? `¥${r.halfDayPrice.toLocaleString()}` : '-' },
    { title: '日租价', width: 100, render: (_: unknown, r: PricingRule) => `¥${r.dayPrice.toLocaleString()}` },
    { title: '取消规则', width: 240, ellipsis: true, render: (_: unknown, r: PricingRule) => <span style={{ fontSize: 12, color: '#86909c' }}>{cancelSummary(r)}</span> },
    { title: '超时费', width: 90, render: (_: unknown, r: PricingRule) => `¥${r.overtimeRate}/h` },
    { title: '超公里费', width: 100, render: (_: unknown, r: PricingRule) => `¥${r.extraMileageRate}/km` },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'gray'} size="small">{v === 'active' ? '启用' : '停用'}</Tag> },
    {
      title: '操作', width: 140, render: (_: unknown, r: PricingRule) => (
        <Space size={4}><Button type="text" size="small" onClick={() => Message.info('编辑功能')}>编辑</Button>
        {r.status === 'active'
          ? <Button type="text" size="small" status="warning" onClick={() => Message.success('规则已停用')}>停用</Button>
          : <Button type="text" size="small" status="success" onClick={() => Message.success('规则已启用')}>启用</Button>}
        </Space>
      ),
    },
  ];

  const rentalColumns = [
    { title: '车型', dataIndex: 'modelName', width: 160 },
    { title: '日租价', width: 120, render: (_: unknown, r: PricingRule) => `¥${r.dayPrice.toLocaleString()}` },
    { title: '取消规则', width: 260, ellipsis: true, render: (_: unknown, r: PricingRule) => <span style={{ fontSize: 12, color: '#86909c' }}>{cancelSummary(r)}</span> },
    { title: '超时费', width: 100, render: (_: unknown, r: PricingRule) => `¥${r.overtimeRate}/h` },
    { title: '超公里费', width: 110, render: (_: unknown, r: PricingRule) => `¥${r.extraMileageRate}/km` },
    { title: '备注', dataIndex: 'remark', width: 160, ellipsis: true, render: (v?: string) => v || '-' },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'gray'} size="small">{v === 'active' ? '启用' : '停用'}</Tag> },
    { title: '操作', width: 140, render: (_: unknown, r: PricingRule) => <Space size={4}><Button type="text" size="small" onClick={() => Message.info('编辑')}>编辑</Button>
      {r.status === 'active'
        ? <Button type="text" size="small" status="warning" onClick={() => Message.success('规则已停用')}>停用</Button>
        : <Button type="text" size="small" status="success" onClick={() => Message.success('规则已启用')}>启用</Button>}
    </Space> },
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
          <Button type="primary" icon={<IconPlus />} onClick={() => setAddVisible(true)}>新增{bizTab === 'charter' ? '车型' : '车型'}计费</Button>
        </Space>
      </Card>
      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={bizTab === 'charter' ? charterColumns : rentalColumns} data={filtered} rowKey="id"
          scroll={{ x: bizTab === 'charter' ? 1200 : 1200 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>

      <Modal title={`新增${bizTab === 'charter' ? '包车' : '租车'}计费规则`} visible={addVisible}
        onOk={handleAdd} onCancel={() => setAddVisible(false)} style={{ width: 640 }}>
        <Form form={addForm} layout="vertical">
          <Form.Item label="车型" field="modelId" rules={[{ required: true, message: '请选择车型' }]}>
            <Select options={vehicleModels.filter(v => v.status === 'active').map(v => ({ label: v.name, value: v.id }))} />
          </Form.Item>
          {bizTab === 'charter' && (
            <>
              <Form.Item label="套餐档位" field="tier" rules={[{ required: true }]}>
                <Select options={['尊享基础', '尊荣高级', '尊御顶级'].map(t => ({ label: t, value: t }))} />
              </Form.Item>
              <Form.Item label="半日租价（元，含4h/50km）" field="halfDayPrice" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </>
          )}
          <Form.Item label={bizTab === 'charter' ? '日租价（元，含8h/100km）' : '日租价（元，含8h/100km）'} field="dayPrice" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          {bizTab === 'charter' && (
            <Form.Item label="服务内容" field="serviceContent" rules={[{ required: true }]}>
              <Input.TextArea maxLength={200} placeholder="该档位包含的服务说明" />
            </Form.Item>
          )}
          <Form.Item label="超时费率（元/小时）" field="overtimeRate" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="超公里费率（元/公里）" field="extraMileageRate" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Card title="取消规则" size="small" style={{ marginTop: 8 }}>
            <Space size={12} wrap>
              <Form.Item label="下单后免费时长(分钟)" field="cancelFreeMins" rules={[{ required: true }]} style={{ width: 180 }}>
                <InputNumber min={1} />
              </Form.Item>
              <Form.Item label="距出发免费时长(小时)" field="cancelFreeHours" rules={[{ required: true }]} style={{ width: 180 }}>
                <InputNumber min={1} />
              </Form.Item>
              <Form.Item label="中档阈值上限(h)" field="cancelMidHigh" rules={[{ required: true }]} style={{ width: 140 }}>
                <InputNumber min={1} />
              </Form.Item>
              <Form.Item label="中档阈值下限(h)" field="cancelMidLow" rules={[{ required: true }]} style={{ width: 140 }}>
                <InputNumber min={1} />
              </Form.Item>
              <Form.Item label="中档扣费(%)" field="cancelMidPct" rules={[{ required: true }]} style={{ width: 120 }}>
                <InputNumber min={1} max={99} />
              </Form.Item>
              <Form.Item label="高档扣费(%)" field="cancelHighPct" rules={[{ required: true }]} style={{ width: 120 }}>
                <InputNumber min={1} max={99} />
              </Form.Item>
            </Space>
          </Card>
          <Form.Item label="备注" field="remark" style={{ marginTop: 12 }}>
            <Input.TextArea maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// ===== 车型管理 Tab =====
function ModelTab() {
  const [models, setModels] = useState(vehicleModels);
  const [keyword, setKeyword] = useState('');
  const [addVisible, setAddVisible] = useState(false);
  const [addForm] = Form.useForm();

  const filtered = useMemo(() => {
    if (!keyword) return models;
    return models.filter(m => m.name.includes(keyword) || m.brand.includes(keyword) || m.category.includes(keyword));
  }, [models, keyword]);

  const handleAdd = () => {
    addForm.validate().then(v => {
      const newModel: VehicleModel = {
        id: 'VM' + String(models.length + 1).padStart(3,'0'),
        name: v.name, brand: v.brand, seats: v.seats, category: v.category,
        vehicleCount: 0, status: 'active',
      };
      setModels([...models, newModel]);
      Message.success('车型保存成功');
      setAddVisible(false);
      addForm.resetFields();
    }).catch(() => {});
  };

  const columns = [
    { title: '车型名称', dataIndex: 'name', width: 180 },
    { title: '品牌', dataIndex: 'brand', width: 80 },
    { title: '座位数', dataIndex: 'seats', width: 80, render: (v: number) => `${v}座` },
    { title: '分类', dataIndex: 'category', width: 100, render: (v: string) => <Tag size="small">{v}</Tag> },
    { title: '在用车辆', dataIndex: 'vehicleCount', width: 90 },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'gray'} size="small">{v === 'active' ? '启用' : '停用'}</Tag> },
    { title: '操作', width: 140, render: (_: unknown, r: VehicleModel) => (
      <Space size={4}>
        <Button type="text" size="small" onClick={() => Message.info('编辑车型')}>编辑</Button>
        {r.status === 'active'
          ? <Button type="text" size="small" status="warning" onClick={() => {
              if (r.vehicleCount > 0) { Message.warning('该车型下存在在用车辆，无法停用'); return; }
              Message.success('车型已停用');
            }}>停用</Button>
          : <Button type="text" size="small" status="success" onClick={() => Message.success('车型已启用')}>启用</Button>}
      </Space>
    )},
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12}>
          <Input prefix={<IconSearch />} placeholder="搜索车型/品牌/分类" style={{ width: 240 }} value={keyword} onChange={setKeyword} allowClear />
          <div style={{ flex: 1 }} />
          <Button type="primary" icon={<IconPlus />} onClick={() => setAddVisible(true)}>新增车型</Button>
        </Space>
      </Card>
      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 800 }} pagination={false} stripe />
      </Card>

      <Modal title="新增车型" visible={addVisible} onOk={handleAdd} onCancel={() => setAddVisible(false)}>
        <Form form={addForm} layout="vertical">
          <Form.Item label="车型名称" field="name" rules={[{ required: true, message: '请输入车型名称' }]}>
            <Input placeholder="如：尊界 S800" maxLength={30} />
          </Form.Item>
          <Form.Item label="品牌" field="brand" rules={[{ required: true, message: '请选择品牌' }]}>
            <Select options={['尊界','奔驰','别克','奥迪'].map(b => ({ label: b, value: b }))} />
          </Form.Item>
          <Form.Item label="座位数" field="seats" rules={[{ required: true }]}>
            <Select options={[4,5,6,7].map(s => ({ label: `${s}座`, value: s }))} />
          </Form.Item>
          <Form.Item label="车型分类" field="category" rules={[{ required: true }]}>
            <Select options={['轿车','SUV','MPV','豪华轿车'].map(c => ({ label: c, value: c }))} />
          </Form.Item>
        </Form>
      </Modal>
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
  const [editMode, setEditMode] = useState(false);
  const [threshold, setThreshold] = useState(quotaAlertConfig.threshold);
  const [editValue, setEditValue] = useState(threshold);

  const handleEdit = () => { setEditValue(threshold); setEditMode(true); };
  const handleSave = () => {
    if (editValue <= 0) { Message.warning('阈值必须大于0'); return; }
    setThreshold(editValue);
    setEditMode(false);
    Message.success('阈值已更新');
  };
  const handleCancel = () => { setEditMode(false); };

  return (
    <Card title="额度告急阈值" style={{ maxWidth: 480 }}>
      <p style={{ color: '#86909c', fontSize: 13, marginBottom: 16 }}>
        当企业剩余额度低于阈值时触发告急。每天上午9点检查，同一企业同一告急周期内不重复提醒。
        额度恢复到阈值以上后再次低于阈值时重新触发。
      </p>
      <Descriptions column={1} size="small" data={[
        { label: '告急阈值', value: editMode
          ? <InputNumber value={editValue} onChange={v => setEditValue(v || 0)} min={1} style={{ width: 200 }} suffix="元" />
          : <span style={{ fontSize: 16, fontWeight: 700 }}>¥{threshold.toLocaleString()}</span> },
      ]} />
      <div style={{ marginTop: 16 }}>
        {editMode ? (
          <Space>
            <Button type="primary" onClick={handleSave}>保存</Button>
            <Button onClick={handleCancel}>取消</Button>
          </Space>
        ) : (
          <Button type="outline" onClick={handleEdit}>编辑</Button>
        )}
      </div>
    </Card>
  );
}

// ===== 运营区域 Tab =====
function AreaTab() {
  const [regions, setRegions] = useState([
    { id: 'R001', name: '南山区核心商圈', city: '深圳', vehicleIds: ['V001','V002'], status: 'active', updatedAt: '2026-06-01' },
    { id: 'R002', name: '浦东陆家嘴', city: '上海', vehicleIds: ['V003'], status: 'active', updatedAt: '2026-05-28' },
    { id: 'R003', name: '福田CBD', city: '深圳', vehicleIds: [], status: 'inactive', updatedAt: '2026-04-15' },
  ]);
  const [keyword, setKeyword] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [addVisible, setAddVisible] = useState(false);
  const [addForm] = Form.useForm();

  const vehicleOptions = useMemo(() => [
    { label: '粤B12345 奔驰V260L', value: 'V001' },
    { label: '粤B67890 别克GL8', value: 'V002' },
    { label: '粤B34567 奥迪A6L', value: 'V003' },
    { label: '粤B56789 奔驰V260L', value: 'V004' },
    { label: '粤B99999 别克GL8', value: 'V005' },
  ], []);

  const filtered = useMemo(() => {
    let r = regions;
    if (keyword) r = r.filter(x => x.name.includes(keyword));
    if (cityFilter) r = r.filter(x => x.city === cityFilter);
    return r;
  }, [regions, keyword, cityFilter]);

  const handleAdd = () => {
    addForm.validate().then(v => {
      const newRegion = {
        id: 'R' + String(regions.length + 1).padStart(3,'0'),
        name: v.name, city: v.city, vehicleIds: v.vehicleIds || [],
        status: 'active' as const, updatedAt: new Date().toISOString().slice(0,10),
      };
      setRegions([...regions, newRegion]);
      Message.success('区域保存成功');
      setAddVisible(false);
      addForm.resetFields();
    }).catch(() => {});
  };

  const columns = [
    { title: '区域名称', dataIndex: 'name', width: 140 },
    { title: '所属城市', dataIndex: 'city', width: 80 },
    { title: '绑定车辆', dataIndex: 'vehicleIds', width: 80, render: (v: string[]) => (v || []).length },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'gray'} size="small">{v === 'active' ? '已启用' : '已停用'}</Tag> },
    { title: '更新时间', dataIndex: 'updatedAt', width: 100 },
    { title: '操作', width: 100, render: () => <Space size={4}><Button type="text" size="small">编辑</Button><Button type="text" size="small" status="warning">停用</Button></Space> },
  ];

  return (
    <div>
      {/* 顶部筛选 */}
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12}>
          <Select placeholder="城市" style={{ width: 120 }} value={cityFilter || undefined} onChange={v => setCityFilter(v || '')} allowClear
            options={['深圳','上海','广州','北京'].map(c => ({ label: c, value: c }))} />
          <Input prefix={<IconSearch />} placeholder="搜索区域名称" style={{ width: 200 }} value={keyword} onChange={setKeyword} allowClear />
          <div style={{ flex: 1 }} />
          <Button type="primary" icon={<IconPlus />} onClick={() => setAddVisible(true)}>新增区域</Button>
        </Space>
      </Card>

      {/* 地图主区域 + 区域列表分栏 */}
      <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 260px)', minHeight: 500, borderRadius: 8, overflow: 'hidden' }}>
        {/* 区域列表左侧栏 */}
        <div style={{
          width: 380, flexShrink: 0,
          background: '#fff', borderRight: '1px solid #e5e6eb',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontSize: 14, fontWeight: 600, color: '#1d2129', flexShrink: 0 }}>运营区域</div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 360 }} pagination={false} stripe size="small" />
          </div>
        </div>
        {/* 地图主区域 */}
        <div style={{ flex: 1, background: '#e8ecf1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#86909c' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>🗺️</p>
            <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>地图预览区</p>
            <p style={{ fontSize: 12 }}>接入高德/百度地图 SDK 后可在此绘制围栏多边形</p>
          </div>
        </div>
      </div>

      {/* 新增区域弹窗 */}
      <Modal title="新增运营区域" visible={addVisible} onOk={handleAdd} onCancel={() => setAddVisible(false)}>
        <Form form={addForm} layout="vertical">
          <Form.Item label="区域名称" field="name" rules={[{ required: true, message: '请输入区域名称' }]}>
            <Input placeholder="如：南山区核心商圈" maxLength={20} />
          </Form.Item>
          <Form.Item label="所属城市" field="city" rules={[{ required: true, message: '请选择城市' }]}>
            <Select options={['深圳','上海','广州','北京'].map(c => ({ label: c, value: c }))} />
          </Form.Item>
          <Form.Item label="关联车辆" field="vehicleIds">
            <Select mode="multiple" placeholder="选择可调度的车辆" options={vehicleOptions} style={{ width: '100%' }} />
          </Form.Item>
          <p style={{ color: '#86909c', fontSize: 12, marginTop: 4 }}>
            完整功能需接入地图 SDK 绘制多边形围栏。当前版本保存区域基本信息。
          </p>
        </Form>
      </Modal>
    </div>
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
