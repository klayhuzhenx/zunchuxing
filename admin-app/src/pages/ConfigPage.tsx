import { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Select, Space, Tabs, Modal, Message, Input, Form, InputNumber, Descriptions,
  Upload, Popconfirm, Tooltip, Image,
} from '@arco-design/web-react';
import { IconPlus, IconSearch, IconEdit, IconDelete } from '@arco-design/web-react/icon';
import {
  vehicleModels, pricingRules, quotaAlertConfig,
  benefitTags as benefitTagsData,
  vehicleTags as vehicleTagsData,
  platformTimeoutConfig as platformTimeoutData,
  pointsConfig as pointsConfigData,
  opsCities as opsCitiesData,
  feeTypes as feeTypesData,
} from '../data/mock';
import type {
  VehicleModel, PricingRule, BenefitTag,
  OpsCity, FeeType, PointsConfig,
} from '../types';

// ===== 计费规则 Tab =====
// C8-01：包车按"车型"分组展示，每组合并 3 档
// C8-02：等待免费时长/费率、服务内容、权益标签
// C8-03：状态按车型维度切换
// C8-16：列表展示服务内容、等待费
function PricingTab() {
  const [rules, setRules] = useState(pricingRules);
  const [bizTab, setBizTab] = useState('charter');
  const [modelFilter, setModelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [addCharterVisible, setAddCharterVisible] = useState(false);
  const [addRentalVisible, setAddRentalVisible] = useState(false);
  const [tagMgmtVisible, setTagMgmtVisible] = useState(false);
  const [platformTimeoutVisible, setPlatformTimeoutVisible] = useState(false);

  const charterRules = useMemo(() => rules.filter(r => r.tier), [rules]);
  const rentalRules = useMemo(() => rules.filter(r => !r.tier), [rules]);

  // C8-03：包车按车型分组合并展示状态
  const charterGroups = useMemo(() => {
    const groups: Record<string, PricingRule[]> = {};
    charterRules.forEach(r => {
      if (!groups[r.modelId]) groups[r.modelId] = [];
      groups[r.modelId].push(r);
    });
    return Object.values(groups).flat();
  }, [charterRules]);

  const filteredCharter = useMemo(() => {
    let r = charterGroups;
    if (modelFilter) r = r.filter(pr => pr.modelName.includes(modelFilter));
    if (statusFilter) r = r.filter(pr => pr.status === statusFilter);
    return r;
  }, [charterGroups, modelFilter, statusFilter]);

  const filteredRental = useMemo(() => {
    let r = rentalRules;
    if (modelFilter) r = r.filter(pr => pr.modelName.includes(modelFilter));
    if (statusFilter) r = r.filter(pr => pr.status === statusFilter);
    return r;
  }, [rentalRules, modelFilter, statusFilter]);

  // 套餐名称库
  const [pkgNames, setPkgNames] = useState<string[]>(['尊享基础套餐', '尊荣高级套餐', '尊御顶级套餐']);
  const [pkgNameVisible, setPkgNameVisible] = useState(false);

  // 新取消规则摘要
  const cancelSummary = (r: PricingRule) => {
    const free = r.cancelFreeHours || 4;
    const t1 = r.cancelTier1Pct ?? 25;
    const t2 = r.cancelTier2Pct ?? 50;
    const t3 = r.cancelTier3Pct ?? 75;
    const ov = r.cancelOverduePct ?? 100;
    return `免费≥${free}h | 2h扣${t1}% | 1h扣${t2}% | 0h扣${t3}% | 超时${ov}%`;
  };

  // 远调费摘要：把多档梯度拼成 "0~5km ¥100 | 5~10km ¥200 | ..." 形式
  const remoteDispatchSummary = (r: PricingRule) => {
    const tiers = r.remoteDispatchTiers;
    if (!tiers || tiers.length === 0) return '未配置';
    return tiers
      .map(t => `${t.fromKm}~${t.toKm === -1 ? '∞' : t.toKm}km ¥${t.amount}`)
      .join(' | ');
  };

  // 停用/启用按「车型 + 套餐」维度
  const toggleRule = (id: string, to: 'active' | 'inactive') => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, status: to } : r));
    Message.success(`规则已${to === 'active' ? '启用' : '停用'}`);
  };

  const charterColumns = [
    { title: '车型', dataIndex: 'modelName', width: 150 },
    { title: '套餐档位', dataIndex: 'tier', width: 110, render: (v: string) => <Tag color="arcoblue" size="small">{v}</Tag> },
    { title: '半日租价', width: 100, render: (_: unknown, r: PricingRule) => r.halfDayPrice ? `¥${r.halfDayPrice.toLocaleString()}` : '-' },
    { title: '日租价', width: 100, render: (_: unknown, r: PricingRule) => `¥${r.dayPrice.toLocaleString()}` },
    { title: '取消规则', width: 300, ellipsis: true, render: (_: unknown, r: PricingRule) => (
      <Tooltip content={cancelSummary(r)}><span style={{ fontSize: 12, color: '#86909c' }}>{cancelSummary(r)}</span></Tooltip>
    )},
    { title: '超时费', width: 90, render: (_: unknown, r: PricingRule) => `¥${r.overtimeRate}/h` },
    { title: '超公里费', width: 100, render: (_: unknown, r: PricingRule) => `¥${r.extraMileageRate}/km` },
    { title: '等待费', width: 140, render: (_: unknown, r: PricingRule) => (
      <span style={{ fontSize: 12 }}>免费 {r.waitFreeMins ?? 15}min · ¥{r.waitRate ?? 1}/min</span>
    )},
    { title: '远调费', width: 260, ellipsis: true, render: (_: unknown, r: PricingRule) => (
      <Tooltip content={remoteDispatchSummary(r)}><span style={{ fontSize: 12, color: '#86909c' }}>{remoteDispatchSummary(r)}</span></Tooltip>
    )},
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'gray'} size="small">{v === 'active' ? '启用' : '停用'}</Tag> },
    {
      title: '操作', width: 160, fixed: 'right' as const, render: (_: unknown, r: PricingRule) => (
        <Space size={4}>
          <Button type="text" size="small" onClick={() => Message.info(`编辑 ${r.modelName} · ${r.tier}`)}>编辑</Button>
          {r.status === 'active'
            ? <Popconfirm title={`停用 ${r.modelName} · ${r.tier}？`} onOk={() => toggleRule(r.id, 'inactive')}>
                <Button type="text" size="small" status="warning">停用</Button>
              </Popconfirm>
            : <Button type="text" size="small" status="success" onClick={() => toggleRule(r.id, 'active')}>启用</Button>}
        </Space>
      ),
    },
  ];

  const rentalColumns = [
    { title: '车型', dataIndex: 'modelName', width: 160 },
    { title: '日租价', width: 120, render: (_: unknown, r: PricingRule) => `¥${r.dayPrice.toLocaleString()}` },
    { title: '取消规则', width: 240, ellipsis: true, render: (_: unknown, r: PricingRule) => (
      <Tooltip content={cancelSummary(r)}><span style={{ fontSize: 12, color: '#86909c' }}>{cancelSummary(r)}</span></Tooltip>
    )},
    { title: '超时费', width: 100, render: (_: unknown, r: PricingRule) => `¥${r.overtimeRate}/h` },
    { title: '超公里费', width: 110, render: (_: unknown, r: PricingRule) => `¥${r.extraMileageRate}/km` },
    { title: '等待费', width: 140, render: (_: unknown, r: PricingRule) => (
      <span style={{ fontSize: 12 }}>免费 {r.waitFreeMins ?? 15}min · ¥{r.waitRate ?? 1}/min</span>
    )},
    { title: '远调费', width: 260, ellipsis: true, render: (_: unknown, r: PricingRule) => (
      <Tooltip content={remoteDispatchSummary(r)}><span style={{ fontSize: 12, color: '#86909c' }}>{remoteDispatchSummary(r)}</span></Tooltip>
    )},
    { title: '备注', dataIndex: 'remark', width: 140, ellipsis: true, render: (v?: string) => v || '-' },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'gray'} size="small">{v === 'active' ? '启用' : '停用'}</Tag> },
    { title: '操作', width: 140, render: (_: unknown, r: PricingRule) => (
      <Space size={4}>
        <Button type="text" size="small" onClick={() => Message.info('编辑')}>编辑</Button>
        {r.status === 'active'
          ? <Popconfirm title={`停用 ${r.modelName} 租车计费？`} onOk={() => {
              setRules(prev => prev.map(x => x.id === r.id ? { ...x, status: 'inactive' } : x));
              Message.success('规则已停用');
            }}>
              <Button type="text" size="small" status="warning">停用</Button>
            </Popconfirm>
          : <Button type="text" size="small" status="success" onClick={() => {
              setRules(prev => prev.map(x => x.id === r.id ? { ...x, status: 'active' } : x));
              Message.success('规则已启用');
            }}>启用</Button>}
      </Space>
    )},
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 0 }}>
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
          {bizTab === 'charter' && <Button onClick={() => setPkgNameVisible(true)}>套餐名称管理</Button>}
          <Button onClick={() => setTagMgmtVisible(true)}>管理权益标签</Button>
          <Button onClick={() => setPlatformTimeoutVisible(true)}>平台级超时</Button>
          <Button type="primary" icon={<IconPlus />}
            onClick={() => bizTab === 'charter' ? setAddCharterVisible(true) : setAddRentalVisible(true)}>
            {bizTab === 'charter' ? '新增套餐计费' : '新增车型计费'}
          </Button>
        </Space>
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={bizTab === 'charter' ? charterColumns : rentalColumns}
          data={bizTab === 'charter' ? filteredCharter : filteredRental}
          rowKey="id" scroll={{ x: bizTab === 'charter' ? 1860 : 1560 }}
          pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>

      {/* 新增包车计费——每次一个套餐 */}
      <CharterRuleModal visible={addCharterVisible} onClose={() => setAddCharterVisible(false)}
        existingRules={charterRules}
        pkgNames={pkgNames}
        onSave={(newRule) => {
          setRules(prev => [...prev, newRule]);
          setAddCharterVisible(false);
          Message.success('规则保存成功');
        }} />

      {/* 新增租车计费 */}
      <RentalRuleModal visible={addRentalVisible} onClose={() => setAddRentalVisible(false)}
        existingModelIds={rentalRules.map(r => r.modelId)}
        onSave={(newRule: PricingRule) => {
          setRules(prev => [...prev, newRule]);
          setAddRentalVisible(false);
          Message.success('规则保存成功');
        }} />

      {/* 套餐名称管理 */}
      <PkgNameModal visible={pkgNameVisible} onClose={() => setPkgNameVisible(false)}
        pkgNames={pkgNames} setPkgNames={setPkgNames} rules={rules} />

      {/* C8-04：权益标签库管理 */}
      <BenefitTagModal visible={tagMgmtVisible} onClose={() => setTagMgmtVisible(false)} rules={rules} />

      {/* C8-05：平台级超时规则 */}
      <PlatformTimeoutModal visible={platformTimeoutVisible} onClose={() => setPlatformTimeoutVisible(false)} />

    </div>
  );
}

// ===== C8-01 包车计费弹窗（一次配置 3 档）=====
// ===== 包车计费弹窗（单套餐 + 自定义梯度取消规则）=====
function CharterRuleModal({ visible, onClose, existingRules, pkgNames, onSave }: {
  visible: boolean; onClose: () => void;
  existingRules: PricingRule[];
  pkgNames: string[];
  onSave: (rule: PricingRule) => void;
}) {
  const [form] = Form.useForm();

  // 自定义梯度数组（可增删）
  const [cancelTiers, setCancelTiers] = useState<{ fromHours: number; toHours: number; pct: number }[]>([
    { fromHours: 2, toHours: 4, pct: 25 },
    { fromHours: 1, toHours: 2, pct: 50 },
    { fromHours: 0, toHours: 1, pct: 75 },
  ]);
  const [cancelOverduePct, setCancelOverduePct] = useState<number>(100);

  // 远调费梯度（可增删）：fromKm < 远调里程 ≤ toKm，最后一档 toKm = -1 表示无上限
  const [remoteTiers, setRemoteTiers] = useState<{ fromKm: number; toKm: number; amount: number }[]>([
    { fromKm: 0, toKm: 5, amount: 100 },
    { fromKm: 5, toKm: 10, amount: 200 },
    { fromKm: 10, toKm: 30, amount: 400 },
    { fromKm: 30, toKm: -1, amount: 1000 },
  ]);

  const addRemoteTier = () => setRemoteTiers([...remoteTiers, { fromKm: 0, toKm: 1, amount: 100 }]);
  const removeRemoteTier = (idx: number) => setRemoteTiers(remoteTiers.filter((_, i) => i !== idx));
  const updateRemoteTier = (idx: number, key: 'fromKm' | 'toKm' | 'amount', val: number) =>
    setRemoteTiers(remoteTiers.map((t, i) => i === idx ? { ...t, [key]: val } : t));

  const addTier = () => {
    setCancelTiers([...cancelTiers, { fromHours: 0, toHours: 1, pct: 50 }]);
  };
  const removeTier = (idx: number) => {
    setCancelTiers(cancelTiers.filter((_, i) => i !== idx));
  };
  const updateTier = (idx: number, key: 'fromHours' | 'toHours' | 'pct', val: number) => {
    setCancelTiers(cancelTiers.map((t, i) => i === idx ? { ...t, [key]: val } : t));
  };

  const handleOk = async () => {
    try {
      const v = await form.validate();
      // 套餐重复校验
      const dup = existingRules.find(r => r.modelId === v.modelId && r.tier === v.tier);
      if (dup) { Message.error('该车型下已存在此套餐，请直接编辑'); return; }
      // 梯度校验：每档 from < to，比例 1-100
      for (const t of cancelTiers) {
        if (t.fromHours >= t.toHours) {
          Message.error(`梯度区间错误：起始时间应小于结束时间（${t.fromHours}h ~ ${t.toHours}h）`); return;
        }
        if (t.pct < 1 || t.pct > 100) {
          Message.error('扣费比例需在 1-100 之间'); return;
        }
      }
      // 远调费梯度校验：每档 from < to（toKm = -1 表示无上限，跳过比较），金额 > 0
      for (const t of remoteTiers) {
        if (t.toKm !== -1 && t.fromKm >= t.toKm) {
          Message.error(`远调费梯度区间错误：起始里程应小于结束里程（${t.fromKm}km ~ ${t.toKm}km）`); return;
        }
        if (t.amount < 0) {
          Message.error('远调费金额不能为负数'); return;
        }
      }
      const model = vehicleModels.find(m => m.id === v.modelId);
      if (!model) return;
      onSave({
        id: `PR${Date.now()}`,
        modelId: v.modelId, modelName: model.name,
        tier: v.tier,
        halfDayPrice: v.halfDayPrice, dayPrice: v.dayPrice,
        serviceContent: v.serviceContent,
        cancelFreeMins: 20, cancelFreeHours: v.cancelFreeHours,
        cancelMidHigh: 4, cancelMidLow: 2, cancelMidPct: 25, cancelHighPct: 75,
        cancelTiers: [...cancelTiers],
        cancelOverduePct,
        overtimeRate: v.overtimeRate, extraMileageRate: v.extraMileageRate,
        waitFreeMins: v.waitFreeMins ?? 15, waitRate: v.waitRate ?? 1,
        remoteDispatchTiers: [...remoteTiers],
        benefitTagIds: v.benefitTagIds,
        remark: v.remark, status: 'active',
      });
      form.resetFields();
      // 重置梯度为默认
      setCancelTiers([
        { fromHours: 2, toHours: 4, pct: 25 },
        { fromHours: 1, toHours: 2, pct: 50 },
        { fromHours: 0, toHours: 1, pct: 75 },
      ]);
      setCancelOverduePct(100);
      setRemoteTiers([
        { fromKm: 0, toKm: 5, amount: 100 },
        { fromKm: 5, toKm: 10, amount: 200 },
        { fromKm: 10, toKm: 30, amount: 400 },
        { fromKm: 30, toKm: -1, amount: 1000 },
      ]);
    } catch { /* validation failed */ }
  };

  return (
    <Modal title="新增套餐计费" visible={visible} onOk={handleOk} onCancel={onClose} style={{ width: 720 }} okText="保存">
      <Form form={form} layout="vertical">
        <Card title="车型基础信息" size="small" style={{ marginBottom: 12 }}>
          <Space size={12} style={{ display: 'flex' }}>
            <Form.Item label="车型" field="modelId" rules={[{ required: true, message: '请选择车型' }]} style={{ flex: 1 }}>
              <Select options={vehicleModels.filter(v => v.status === 'active').map(v => ({ label: v.name, value: v.id }))} />
            </Form.Item>
            <Form.Item label="套餐名称" field="tier" rules={[{ required: true, message: '请选择套餐' }]} style={{ flex: 1 }}>
              <Select options={pkgNames.map(n => ({ label: n, value: n }))} />
            </Form.Item>
          </Space>
          <Space size={12} style={{ display: 'flex' }}>
            <Form.Item label="超时长费(元/h)" field="overtimeRate" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="超公里费率(元/km)" field="extraMileageRate" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="等待免费(min)" field="waitFreeMins" initialValue={15} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="等待费(元/min)" field="waitRate" initialValue={1} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item label="备注" field="remark"><Input.TextArea maxLength={200} rows={1} /></Form.Item>
        </Card>

        <Card title="套餐配置" size="small" style={{ marginBottom: 12 }}>
          <Space size={12} style={{ display: 'flex' }}>
            <Form.Item label="半日租价(元/4小时/50km)" field="halfDayPrice" rules={[{ required: true, message: '必填' }]} style={{ flex: 1 }}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="日租价(元/8小时/100km)" field="dayPrice" rules={[{ required: true, message: '必填' }]} style={{ flex: 1 }}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item label="权益标签" field="benefitTagIds" rules={[{ required: true, message: '权益标签为必选项' }]}>
            <Select mode="multiple" placeholder="选择该套餐享有的权益标签"
              options={benefitTagsData.filter(t => t.status === 'active').map(t => ({ label: `${t.icon} ${t.name}`, value: t.id }))} />
          </Form.Item>
        </Card>

        <Card title="取消规则" size="small">
          <Form.Item label="免费阈值（小时）" field="cancelFreeHours" rules={[{ required: true, message: '请填写免费阈值' }]} initialValue={4}>
            <InputNumber min={1} style={{ width: 200 }} placeholder="默认 4" suffix="小时" />
          </Form.Item>
          <div style={{ fontSize: 12, color: '#86909c', marginTop: -8, marginBottom: 16 }}>
            距出发 ≥ 此值时免费取消
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1d2129' }}>梯度扣费规则</span>
              <Button size="mini" type="outline" icon={<IconPlus />} onClick={addTier}>添加梯度</Button>
            </div>

            {cancelTiers.map((tier, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '8px 12px', background: '#FAFBFC', borderRadius: 6 }}>
                <span style={{ fontSize: 13, color: '#4e5969', minWidth: 50 }}>第 {idx + 1} 档</span>
                <span style={{ fontSize: 12, color: '#86909c' }}>距出发 ≥</span>
                <InputNumber size="small" min={0} value={tier.fromHours} onChange={(v) => updateTier(idx, 'fromHours', v as number)} style={{ width: 70 }} />
                <span style={{ fontSize: 12, color: '#86909c' }}>h 且 &lt;</span>
                <InputNumber size="small" min={0} value={tier.toHours} onChange={(v) => updateTier(idx, 'toHours', v as number)} style={{ width: 70 }} />
                <span style={{ fontSize: 12, color: '#86909c' }}>h 扣</span>
                <InputNumber size="small" min={1} max={100} value={tier.pct} onChange={(v) => updateTier(idx, 'pct', v as number)} style={{ width: 70 }} />
                <span style={{ fontSize: 12, color: '#86909c' }}>%</span>
                <div style={{ flex: 1 }} />
                <Button size="mini" type="text" status="danger" icon={<IconDelete />}
                  disabled={cancelTiers.length <= 1}
                  onClick={() => removeTier(idx)} />
              </div>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '8px 12px', background: '#FFECE8', borderRadius: 6 }}>
              <span style={{ fontSize: 13, color: '#F53F3F', fontWeight: 500, minWidth: 50 }}>超时档</span>
              <span style={{ fontSize: 12, color: '#86909c' }}>超过出发时间扣</span>
              <InputNumber size="small" min={1} max={100} value={cancelOverduePct} onChange={(v) => setCancelOverduePct(v as number)} style={{ width: 80 }} />
              <span style={{ fontSize: 12, color: '#86909c' }}>%</span>
            </div>
          </div>
        </Card>

        <Card title="远调费用设置" size="small" style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: '#86909c', marginBottom: 12 }}>
            按上车/下车点到运营范围边缘的直线距离收取，自定义梯度。最后一档可填 -1 表示无上限。
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1d2129' }}>梯度收费规则</span>
            <Button size="mini" type="outline" icon={<IconPlus />} onClick={addRemoteTier}>添加梯度</Button>
          </div>
          {remoteTiers.map((tier, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '8px 12px', background: '#FAFBFC', borderRadius: 6 }}>
              <span style={{ fontSize: 13, color: '#4e5969', minWidth: 50 }}>第 {idx + 1} 档</span>
              <span style={{ fontSize: 12, color: '#86909c' }}>远调里程 &gt;</span>
              <InputNumber size="small" min={0} value={tier.fromKm} onChange={(v) => updateRemoteTier(idx, 'fromKm', v as number)} style={{ width: 80 }} />
              <span style={{ fontSize: 12, color: '#86909c' }}>km 且 ≤</span>
              <InputNumber size="small" min={-1} value={tier.toKm} onChange={(v) => updateRemoteTier(idx, 'toKm', v as number)} style={{ width: 80 }} />
              <span style={{ fontSize: 12, color: '#86909c' }}>km，收取 ¥</span>
              <InputNumber size="small" min={0} value={tier.amount} onChange={(v) => updateRemoteTier(idx, 'amount', v as number)} style={{ width: 90 }} />
              <div style={{ flex: 1 }} />
              <Button size="mini" type="text" status="danger" icon={<IconDelete />}
                disabled={remoteTiers.length <= 1}
                onClick={() => removeRemoteTier(idx)} />
            </div>
          ))}
        </Card>
      </Form>
    </Modal>
  );
}

// ===== 租车计费弹窗 =====
function RentalRuleModal({ visible, onClose, existingModelIds, onSave }: {
  visible: boolean; onClose: () => void; existingModelIds: string[];
  onSave: (rule: PricingRule) => void;
}) {
  const [form] = Form.useForm();
  const [cancelTiers, setCancelTiers] = useState<{ fromHours: number; toHours: number; pct: number }[]>([
    { fromHours: 2, toHours: 4, pct: 25 },
    { fromHours: 1, toHours: 2, pct: 50 },
    { fromHours: 0, toHours: 1, pct: 75 },
  ]);
  const [cancelOverduePct, setCancelOverduePct] = useState<number>(100);
  const addTier = () => setCancelTiers([...cancelTiers, { fromHours: 0, toHours: 1, pct: 50 }]);
  const removeTier = (idx: number) => setCancelTiers(cancelTiers.filter((_, i) => i !== idx));
  const updateTier = (idx: number, key: 'fromHours' | 'toHours' | 'pct', val: number) =>
    setCancelTiers(cancelTiers.map((t, i) => i === idx ? { ...t, [key]: val } : t));

  // 远调费梯度
  const [remoteTiers, setRemoteTiers] = useState<{ fromKm: number; toKm: number; amount: number }[]>([
    { fromKm: 0, toKm: 5, amount: 100 },
    { fromKm: 5, toKm: 10, amount: 200 },
    { fromKm: 10, toKm: 30, amount: 400 },
    { fromKm: 30, toKm: -1, amount: 1000 },
  ]);
  const addRemoteTier = () => setRemoteTiers([...remoteTiers, { fromKm: 0, toKm: 1, amount: 100 }]);
  const removeRemoteTier = (idx: number) => setRemoteTiers(remoteTiers.filter((_, i) => i !== idx));
  const updateRemoteTier = (idx: number, key: 'fromKm' | 'toKm' | 'amount', val: number) =>
    setRemoteTiers(remoteTiers.map((t, i) => i === idx ? { ...t, [key]: val } : t));

  const handleOk = async () => {
    try {
      const v = await form.validate();
      for (const t of cancelTiers) {
        if (t.fromHours >= t.toHours) { Message.error(`梯度区间错误：起始时间应小于结束时间`); return; }
        if (t.pct < 1 || t.pct > 100) { Message.error('扣费比例需在 1-100 之间'); return; }
      }
      for (const t of remoteTiers) {
        if (t.toKm !== -1 && t.fromKm >= t.toKm) {
          Message.error(`远调费梯度区间错误：起始里程应小于结束里程（${t.fromKm}km ~ ${t.toKm}km）`); return;
        }
        if (t.amount < 0) { Message.error('远调费金额不能为负数'); return; }
      }
      const model = vehicleModels.find(m => m.id === v.modelId);
      if (!model) return;
      onSave({
        id: `PR${Date.now()}`,
        modelId: v.modelId, modelName: model.name,
        dayPrice: v.dayPrice,
        cancelFreeMins: 20, cancelFreeHours: v.cancelFreeHours,
        cancelMidHigh: 4, cancelMidLow: 2, cancelMidPct: 25, cancelHighPct: 75,
        cancelTiers: [...cancelTiers],
        cancelOverduePct,
        overtimeRate: v.overtimeRate, extraMileageRate: v.extraMileageRate,
        waitFreeMins: v.waitFreeMins ?? 15, waitRate: v.waitRate ?? 1,
        remoteDispatchTiers: [...remoteTiers],
        remark: v.remark, status: 'active',
      });
      form.resetFields();
      setCancelTiers([{ fromHours: 2, toHours: 4, pct: 25 }, { fromHours: 1, toHours: 2, pct: 50 }, { fromHours: 0, toHours: 1, pct: 75 }]);
      setCancelOverduePct(100);
      setRemoteTiers([
        { fromKm: 0, toKm: 5, amount: 100 },
        { fromKm: 5, toKm: 10, amount: 200 },
        { fromKm: 10, toKm: 30, amount: 400 },
        { fromKm: 30, toKm: -1, amount: 1000 },
      ]);
    } catch { /* */ }
  };

  return (
    <Modal title="新增租车计费规则" visible={visible} onOk={handleOk} onCancel={onClose} style={{ width: 640 }} okText="保存">
      <Form form={form} layout="vertical">
        <Form.Item label="车型" field="modelId" rules={[
          { required: true, message: '请选择车型' },
          { validator: (v, cb) => {
            if (v && existingModelIds.includes(v)) cb('该车型已配置租车计费，请直接编辑');
            else cb();
          }},
        ]}>
          <Select options={vehicleModels.filter(v => v.status === 'active').map(v => ({ label: v.name, value: v.id }))} />
        </Form.Item>
        <Space size={12} style={{ display: 'flex' }}>
          <Form.Item label="日租价(元/8小时/100km)" field="dayPrice" rules={[{ required: true }]} style={{ flex: 1 }}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="超时长费(元/h)" field="overtimeRate" rules={[{ required: true }]} style={{ flex: 1 }}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="超公里费(元/km)" field="extraMileageRate" rules={[{ required: true }]} style={{ flex: 1 }}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Space>
        <Space size={12} style={{ display: 'flex' }}>
          <Form.Item label="等待免费时长(分钟)" field="waitFreeMins" initialValue={15} style={{ flex: 1 }}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="等待费(元/分钟)" field="waitRate" initialValue={1} style={{ flex: 1 }}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Space>
        <Card title="取消规则" size="small">
          <Form.Item label="免费阈值（小时）" field="cancelFreeHours" rules={[{ required: true, message: '请填写免费阈值' }]} initialValue={4}>
            <InputNumber min={1} style={{ width: 200 }} placeholder="默认 4" suffix="小时" />
          </Form.Item>
          <div style={{ fontSize: 12, color: '#86909c', marginTop: -8, marginBottom: 16 }}>
            距出发 ≥ 此值时免费取消
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1d2129' }}>梯度扣费规则</span>
              <Button size="mini" type="outline" icon={<IconPlus />} onClick={addTier}>添加梯度</Button>
            </div>

            {cancelTiers.map((tier, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '8px 12px', background: '#FAFBFC', borderRadius: 6 }}>
                <span style={{ fontSize: 13, color: '#4e5969', minWidth: 50 }}>第 {idx + 1} 档</span>
                <span style={{ fontSize: 12, color: '#86909c' }}>距出发 ≥</span>
                <InputNumber size="small" min={0} value={tier.fromHours} onChange={(v) => updateTier(idx, 'fromHours', v as number)} style={{ width: 70 }} />
                <span style={{ fontSize: 12, color: '#86909c' }}>h 且 &lt;</span>
                <InputNumber size="small" min={0} value={tier.toHours} onChange={(v) => updateTier(idx, 'toHours', v as number)} style={{ width: 70 }} />
                <span style={{ fontSize: 12, color: '#86909c' }}>h 扣</span>
                <InputNumber size="small" min={1} max={100} value={tier.pct} onChange={(v) => updateTier(idx, 'pct', v as number)} style={{ width: 70 }} />
                <span style={{ fontSize: 12, color: '#86909c' }}>%</span>
                <div style={{ flex: 1 }} />
                <Button size="mini" type="text" status="danger" icon={<IconDelete />}
                  disabled={cancelTiers.length <= 1}
                  onClick={() => removeTier(idx)} />
              </div>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '8px 12px', background: '#FFECE8', borderRadius: 6 }}>
              <span style={{ fontSize: 13, color: '#F53F3F', fontWeight: 500, minWidth: 50 }}>超时档</span>
              <span style={{ fontSize: 12, color: '#86909c' }}>超过出发时间扣</span>
              <InputNumber size="small" min={1} max={100} value={cancelOverduePct} onChange={(v) => setCancelOverduePct(v as number)} style={{ width: 80 }} />
              <span style={{ fontSize: 12, color: '#86909c' }}>%</span>
            </div>
          </div>
        </Card>
        <Card title="远调费用设置" size="small" style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: '#86909c', marginBottom: 12 }}>
            按上车/下车点到运营范围边缘的直线距离收取，自定义梯度。最后一档可填 -1 表示无上限。
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1d2129' }}>梯度收费规则</span>
            <Button size="mini" type="outline" icon={<IconPlus />} onClick={addRemoteTier}>添加梯度</Button>
          </div>
          {remoteTiers.map((tier, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '8px 12px', background: '#FAFBFC', borderRadius: 6 }}>
              <span style={{ fontSize: 13, color: '#4e5969', minWidth: 50 }}>第 {idx + 1} 档</span>
              <span style={{ fontSize: 12, color: '#86909c' }}>远调里程 &gt;</span>
              <InputNumber size="small" min={0} value={tier.fromKm} onChange={(v) => updateRemoteTier(idx, 'fromKm', v as number)} style={{ width: 80 }} />
              <span style={{ fontSize: 12, color: '#86909c' }}>km 且 ≤</span>
              <InputNumber size="small" min={-1} value={tier.toKm} onChange={(v) => updateRemoteTier(idx, 'toKm', v as number)} style={{ width: 80 }} />
              <span style={{ fontSize: 12, color: '#86909c' }}>km，收取 ¥</span>
              <InputNumber size="small" min={0} value={tier.amount} onChange={(v) => updateRemoteTier(idx, 'amount', v as number)} style={{ width: 90 }} />
              <div style={{ flex: 1 }} />
              <Button size="mini" type="text" status="danger" icon={<IconDelete />}
                disabled={remoteTiers.length <= 1}
                onClick={() => removeRemoteTier(idx)} />
            </div>
          ))}
        </Card>
        <Form.Item label="备注" field="remark" style={{ marginTop: 12 }}><Input.TextArea maxLength={200} rows={1} /></Form.Item>
      </Form>
    </Modal>
  );
}

// ===== 套餐名称管理 =====
function PkgNameModal({ visible, onClose, pkgNames, setPkgNames, rules }: {
  visible: boolean; onClose: () => void;
  pkgNames: string[]; setPkgNames: React.Dispatch<React.SetStateAction<string[]>>;
  rules: PricingRule[];
}) {
  const [form] = Form.useForm();
  // 被使用的套餐名称
  const usedNames = useMemo(() => [...new Set(rules.filter(r => r.tier).map(r => r.tier!))], [rules]);

  const handleAdd = async () => {
    try {
      const v = await form.validate();
      if (pkgNames.includes(v.name)) { Message.error('该套餐名称已存在'); return; }
      setPkgNames([...pkgNames, v.name]);
      form.resetFields();
      Message.success('套餐名称已添加');
    } catch { /* */ }
  };

  return (
    <Modal title="套餐名称管理" visible={visible} onCancel={onClose} footer={<Button onClick={onClose}>关闭</Button>} style={{ width: 600 }}>
      <Card size="small" title="新增套餐名称" style={{ marginBottom: 12 }}>
        <Form form={form} layout="inline">
          <Form.Item field="name" rules={[{ required: true, message: '请输入' }, { maxLength: 20 }]}>
            <Input placeholder="套餐名称，≤20字" style={{ width: 180 }} />
          </Form.Item>
          <Form.Item field="order" rules={[{ required: true, message: '请输入排序' }]}>
            <InputNumber placeholder="排序" min={1} style={{ width: 80 }} />
          </Form.Item>
          <Form.Item><Button type="primary" onClick={handleAdd}>添加</Button></Form.Item>
        </Form>
      </Card>
      <Table size="small" pagination={false} columns={[
        { title: '套餐名称', dataIndex: 'name', width: 260 },
        { title: '操作', width: 100, render: (_: unknown, r: { name: string }) => usedNames.includes(r.name) ? (
          <Tooltip content="该套餐名称已被计费规则使用，不可删除"><Button type="text" size="small" status="danger" disabled>删除</Button></Tooltip>
        ) : (
          <Button type="text" size="small" status="danger" onClick={() => setPkgNames(pkgNames.filter(n => n !== r.name))}>删除</Button>
        )},
      ]} data={pkgNames.map((n, i) => ({ name: n, order: i + 1 }))} rowKey="name" />
    </Modal>
  );
}

// ===== C8-04：权益标签库管理 =====
function BenefitTagModal({ visible, onClose, rules }: { visible: boolean; onClose: () => void; rules?: PricingRule[] }) {
  const [tags, setTags] = useState<BenefitTag[]>(benefitTagsData);
  const [tagImages, setTagImages] = useState<Record<string, string>>({});
  const [form] = Form.useForm();

  const usedTagIds = useMemo(() => [...new Set((rules || []).filter(r => r.benefitTagIds).flatMap(r => r.benefitTagIds!))], [rules]);

  const handleAdd = async () => {
    try {
      const v = await form.validate();
      if (tags.some(t => t.name === v.name)) { Message.error('标签名称已存在'); return; }
      if (!tagImages['new']) { Message.error('请上传 Icon 图片'); return; }
      setTags([...tags, { id: `BT${Date.now()}`, name: v.name, icon: tagImages['new'], status: 'active', order: v.order ?? tags.length + 1 }]);
      form.resetFields();
      setTagImages(prev => { const n = { ...prev }; delete n['new']; return n; });
      Message.success('标签添加成功');
    } catch { /* */ }
  };

  const handleDelete = (tag: BenefitTag) => {
    if (usedTagIds.includes(tag.id)) { Message.error('该标签已被计费规则使用，不可删除'); return; }
    setTags(tags.filter(t => t.id !== tag.id));
    Message.success('标签已删除');
  };

  return (
    <Modal title="权益标签库" visible={visible} onCancel={onClose} footer={<Button onClick={onClose}>关闭</Button>} style={{ width: 760 }}>
      <Card size="small" title="新增标签" style={{ marginBottom: 12 }}>
        <Form form={form} layout="inline">
          <Form.Item field="name" rules={[{ required: true, message: '请输入标签名' }]}><Input placeholder="标签名称 ≤10字" style={{ width: 160 }} maxLength={10} /></Form.Item>
          <Form.Item label="Icon">
            <Upload listType="picture-card" limit={1} showUploadList accept="image/png,image/svg+xml"
              fileList={tagImages['new'] ? [{ uid: 'new', url: tagImages['new'], name: 'icon' }] : []}
              customRequest={(option) => {
                const f = option.file as File;
                if (f.size > 200 * 1024) { Message.error('图片不能超过 200KB'); return; }
                const reader = new FileReader();
                reader.onload = () => setTagImages(p => ({ ...p, new: reader.result as string }));
                reader.readAsDataURL(f);
              }}
              onRemove={() => { const n = { ...tagImages }; delete n['new']; setTagImages(n); return true; }}>
              <div style={{ color: '#86909c', fontSize: 12 }}>上传</div>
            </Upload>
          </Form.Item>
          <Form.Item field="order"><InputNumber placeholder="顺序" min={1} style={{ width: 80 }} /></Form.Item>
          <Form.Item><Button type="primary" onClick={handleAdd}>添加</Button></Form.Item>
        </Form>
      </Card>
      <Table size="small" pagination={false} columns={[
        { title: '名称', dataIndex: 'name', width: 140 },
        { title: 'Icon', dataIndex: 'icon', width: 70, render: (v: string) => v ? <Image src={v} width={32} height={32} preview style={{ objectFit: 'contain', borderRadius: 4 }} /> : '-' },
        { title: '顺序', dataIndex: 'order', width: 70 },
        { title: '操作', width: 100, render: (_: unknown, r: BenefitTag) => usedTagIds.includes(r.id) ? (
          <Tooltip content="该标签已被计费规则引用，不可删除"><Button type="text" size="small" status="danger" disabled>删除</Button></Tooltip>
        ) : (
          <Button type="text" size="small" status="danger" onClick={() => handleDelete(r)}>删除</Button>
        )},
      ]} data={tags.sort((a, b) => (a.order || 0) - (b.order || 0))} rowKey="id" />
    </Modal>
  );
}

// ===== 车型标签库管理 =====
function VehicleTagModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [tags, setTags] = useState<BenefitTag[]>(vehicleTagsData);
  const [tagImages, setTagImages] = useState<Record<string, string>>({});
  const [form] = Form.useForm();

  const handleAdd = async () => {
    try {
      const v = await form.validate();
      if (tags.some(t => t.name === v.name)) { Message.error('标签名称已存在'); return; }
      if (!tagImages['new']) { Message.error('请上传 Icon 图片'); return; }
      setTags([...tags, { id: `VT${Date.now()}`, name: v.name, icon: tagImages['new'], status: 'active', order: v.order ?? tags.length + 1 }]);
      form.resetFields();
      setTagImages(prev => { const n = { ...prev }; delete n['new']; return n; });
      Message.success('标签添加成功');
    } catch { /* */ }
  };

  const handleDelete = (t: BenefitTag) => {
    setTags(tags.filter(x => x.id !== t.id));
    Message.success('标签已删除');
  };

  return (
    <Modal title="车型标签库" visible={visible} onCancel={onClose} footer={<Button onClick={onClose}>关闭</Button>} style={{ width: 760 }}>
      <Card size="small" title="新增标签" style={{ marginBottom: 12 }}>
        <Form form={form} layout="inline">
          <Form.Item field="name" rules={[{ required: true, message: '请输入' }]}><Input placeholder="标签名称 ≤10字" style={{ width: 160 }} maxLength={10} /></Form.Item>
          <Form.Item label="Icon">
            <Upload listType="picture-card" limit={1} showUploadList accept="image/png,image/svg+xml"
              fileList={tagImages['new'] ? [{ uid: 'new', url: tagImages['new'], name: 'icon' }] : []}
              customRequest={(option) => {
                const f = option.file as File;
                if (f.size > 200 * 1024) { Message.error('图片不能超过 200KB'); return; }
                const reader = new FileReader();
                reader.onload = () => setTagImages(p => ({ ...p, new: reader.result as string }));
                reader.readAsDataURL(f);
              }}
              onRemove={() => { const n = { ...tagImages }; delete n['new']; setTagImages(n); return true; }}>
              <div style={{ color: '#86909c', fontSize: 12 }}>上传</div>
            </Upload>
          </Form.Item>
          <Form.Item field="order"><InputNumber placeholder="顺序" min={1} style={{ width: 80 }} /></Form.Item>
          <Form.Item><Button type="primary" onClick={handleAdd}>添加</Button></Form.Item>
        </Form>
      </Card>
      <Table size="small" pagination={false} columns={[
        { title: '名称', dataIndex: 'name', width: 140 },
        { title: 'Icon', dataIndex: 'icon', width: 70, render: (v: string) => v ? <Image src={v} width={32} height={32} preview style={{ objectFit: 'contain', borderRadius: 4 }} /> : '-' },
        { title: '顺序', dataIndex: 'order', width: 70 },
        { title: '操作', width: 100, render: (_: unknown, r: BenefitTag) => (
          <Button type="text" size="small" status="danger" onClick={() => handleDelete(r)}>删除</Button>
        )},
      ]} data={tags.sort((a, b) => (a.order || 0) - (b.order || 0))} rowKey="id" />
    </Modal>
  );
}

// ===== C8-05：平台级超时规则 =====
function PlatformTimeoutModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [config, setConfig] = useState(platformTimeoutData);
  const [form] = Form.useForm();

  const handleSave = async () => {
    try {
      const v = await form.validate();
      setConfig(v);
      Message.success('平台级超时规则保存成功');
      onClose();
    } catch { /* */ }
  };

  return (
    <Modal title="平台级超时规则" visible={visible} onOk={handleSave} onCancel={onClose} style={{ width: 480 }} okText="保存">
      <Form form={form} layout="vertical" initialValues={config}>
        <Form.Item label="支付超时时长（分钟）" field="paymentTimeoutMinutes" rules={[{ required: true, message: '必填' }]}>
          <InputNumber min={1} style={{ width: '100%' }} placeholder="默认 20 分钟" />
        </Form.Item>
        <div style={{ fontSize: 12, color: '#86909c', marginTop: -12, marginBottom: 12 }}>
          下单后未在此时长内支付即自动取消，不扣费
        </div>
        <Form.Item label="调度超时时长（小时）" field="dispatchTimeoutHours" rules={[{ required: true, message: '必填' }]}>
          <InputNumber min={1} style={{ width: '100%' }} placeholder="默认 2 小时" />
        </Form.Item>
        <div style={{ fontSize: 12, color: '#86909c', marginTop: -12 }}>
          出发前此时长仍未派车则自动取消，全额退款
        </div>
      </Form>
    </Modal>
  );
}

// ===== 车型管理 Tab — C8-07：含说明名字、图片、标签 =====
function ModelTab() {
  const [models, setModels] = useState<VehicleModel[]>(vehicleModels);
  const [keyword, setKeyword] = useState('');
  const [addVisible, setAddVisible] = useState(false);
  const [editingModel, setEditingModel] = useState<VehicleModel | null>(null);
  const [vehicleTagVisible, setVehicleTagVisible] = useState(false);
  const [addForm] = Form.useForm();
  const [addImage, setAddImage] = useState<string>('');

  const filtered = useMemo(() => {
    if (!keyword) return models;
    return models.filter(m => m.name.includes(keyword) || (m.displayName || '').includes(keyword));
  }, [models, keyword]);

  const openAdd = () => { setEditingModel(null); addForm.resetFields(); setAddImage(''); setAddVisible(true); };
  const openEdit = (m: VehicleModel) => {
    setEditingModel(m);
    addForm.setFieldsValue(m);
    setAddImage(m.image || '');
    setAddVisible(true);
  };

  const handleSave = async () => {
    try {
      const v = await addForm.validate();
      if (!editingModel && !addImage) { Message.error('请上传车型图片'); return; }
      if (editingModel) {
        if (models.some(m => m.name === v.name && m.id !== editingModel.id)) { Message.error('该车型名称已存在'); return; }
        setModels(models.map(m => m.id === editingModel.id ? { ...m, ...v, image: addImage || m.image } : m));
        Message.success('车型修改成功');
      } else {
        if (models.some(m => m.name === v.name)) { Message.error('该车型名称已存在'); return; }
        const newModel: VehicleModel = {
          id: 'VM' + String(models.length + 1).padStart(3, '0'),
          name: v.name, displayName: v.displayName,
          brand: v.brand || '尊界', seats: v.seats, category: v.category,
          image: addImage, tagIds: v.tagIds,
          vehicleCount: 0, status: 'active',
        };
        setModels([...models, newModel]);
        Message.success('车型保存成功');
      }
      setAddVisible(false); setEditingModel(null); addForm.resetFields(); setAddImage('');
    } catch { /* */ }
  };

  const columns = [
    { title: '图片', dataIndex: 'image', width: 80, render: (v?: string) => v
      ? <Image src={v} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 4 }} alt="车型" preview />
      : <div style={{ width: 48, height: 48, background: '#f0f0f0', borderRadius: 4 }} /> },
    { title: '车型名称', dataIndex: 'name', width: 160 },
    { title: '副标题', dataIndex: 'displayName', width: 220, ellipsis: true, render: (v?: string) => v || '-' },
    { title: '分类', dataIndex: 'category', width: 100, render: (v: string) => <Tag size="small">{v}</Tag> },
    { title: '标签', dataIndex: 'tagIds', width: 200, render: (v?: string[]) => v && v.length > 0
      ? v.map(id => benefitTagsData.find(t => t.id === id)).filter(Boolean).map(t => <span key={t!.id} style={{ marginRight: 4, fontSize: 16 }} title={t!.name}>{t!.icon}</span>)
      : '-' },
    { title: '在用车辆', dataIndex: 'vehicleCount', width: 90 },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'gray'} size="small">{v === 'active' ? '启用' : '停用'}</Tag> },
    { title: '操作', width: 140, render: (_: unknown, r: VehicleModel) => (
      <Space size={4}>
        <Button type="text" size="small" onClick={() => openEdit(r)}>编辑</Button>
        {r.status === 'active'
          ? <Button type="text" size="small" status="warning" onClick={() => {
              if (r.vehicleCount > 0) { Message.warning('该车型下存在在用车辆，无法停用'); return; }
              setModels(models.map(m => m.id === r.id ? { ...m, status: 'inactive' } : m));
              Message.success('车型已停用');
            }}>停用</Button>
          : <Button type="text" size="small" status="success" onClick={() => {
              setModels(models.map(m => m.id === r.id ? { ...m, status: 'active' } : m));
              Message.success('车型已启用');
            }}>启用</Button>}
      </Space>
    )},
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12}>
          <Input prefix={<IconSearch />} placeholder="搜索车型名称" style={{ width: 240 }} value={keyword} onChange={setKeyword} allowClear />
          <div style={{ flex: 1 }} />
          <Button onClick={() => setVehicleTagVisible(true)}>车型标签库</Button>
          <Button type="primary" icon={<IconPlus />} onClick={openAdd}>新增车型</Button>
        </Space>
      </Card>
      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 1200 }} pagination={false} stripe />
      </Card>

      <Modal title={editingModel ? '编辑车型' : '新增车型'} visible={addVisible} onOk={handleSave}
        onCancel={() => { setAddVisible(false); setEditingModel(null); addForm.resetFields(); setAddImage(''); }}
        style={{ width: 560 }}>
        <Form form={addForm} layout="vertical">
          <Form.Item label="车型名称" field="name" rules={[{ required: true, message: '请输入车型名称' }, { maxLength: 30 }]}>
            <Input placeholder="如：尊界 S800" maxLength={30} />
          </Form.Item>
          <Form.Item label="副标题（乘客端展示）" field="displayName" rules={[{ required: true, message: '请输入' }, { maxLength: 50 }]}>
            <Input placeholder="如：尊界 S800 增程星辉尊享版" maxLength={50} />
          </Form.Item>
          <Form.Item label="车型分类" field="category" rules={[{ required: true }]}>
            <Select options={['轿车', 'SUV', 'MPV', '豪华轿车'].map(c => ({ label: c, value: c }))} />
          </Form.Item>
          <Form.Item label="座位数" field="seats" rules={[{ required: true }]}>
            <Select options={[4, 5, 6, 7].map(s => ({ label: `${s}座`, value: s }))} />
          </Form.Item>
          <Form.Item label={<span>车型图片 <span style={{ color: '#F53F3F' }}>*</span></span>}>
            <Upload
              listType="picture-card"
              limit={1}
              accept="image/jpeg,image/png"
              fileList={addImage ? [{ uid: '0', url: addImage, name: 'image' }] : []}
              customRequest={(option) => {
                const f = option.file as File;
                if (f.size > 5 * 1024 * 1024) { Message.error('图片大小不能超过 5MB'); return; }
                if (!['image/jpeg', 'image/png'].includes(f.type)) { Message.error('请上传 JPG/PNG 格式图片'); return; }
                const reader = new FileReader();
                reader.onload = () => setAddImage(reader.result as string);
                reader.readAsDataURL(f);
              }}
              onRemove={() => { setAddImage(''); return true; }}
            >
              <div style={{ color: '#86909c' }}>+ 上传</div>
            </Upload>
          </Form.Item>
          <Form.Item label="车型标签" field="tagIds">
            <Select mode="multiple" placeholder="选择该车型的特性标签"
              options={benefitTagsData.filter(t => t.status === 'active').map(t => ({ label: `${t.icon} ${t.name}`, value: t.id }))} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 车型标签库 — 独立数据 */}
      <VehicleTagModal visible={vehicleTagVisible} onClose={() => setVehicleTagVisible(false)} />
    </div>
  );
}

// ===== §8.3 积分权益 Tab =====
function PointsTab() {
  const [config, setConfig] = useState<PointsConfig>(pointsConfigData);
  const [form] = Form.useForm();

  const handleSave = async () => {
    try {
      const v = await form.validate();
      const next: PointsConfig = {
        exchangeRate: v.exchangeRate,
        maxDeductionLimit: v.maxDeductionLimit || undefined,
        minPoints: v.minPoints || undefined,
      };
      setConfig(next);
      Message.success('积分配比保存成功');
    } catch { /* */ }
  };

  return (
    <div>
      <Card title="积分兑换配置" size="small" style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical" initialValues={config} style={{ maxWidth: 480 }}>
          <Form.Item label="积分兑换比例" field="exchangeRate" rules={[{ required: true, message: '必填' }]}
            extra={<span style={{ fontSize: 12, color: '#86909c' }}>输入 N，表示 N 积分可抵扣 ¥1。如输入 100 表示 100 积分 = ¥1</span>}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="默认 100" />
          </Form.Item>
          <Form.Item label="单次抵扣上限（元）" field="maxDeductionLimit"
            extra={<span style={{ fontSize: 12, color: '#86909c' }}>留空表示不限制</span>}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="不限制" />
          </Form.Item>
          <Form.Item label="最低抵扣积分" field="minPoints"
            extra={<span style={{ fontSize: 12, color: '#86909c' }}>单次最低使用积分数，留空表示不限制</span>}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="不限制" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleSave}>保存配置</Button>
          </Form.Item>
        </Form>
      </Card>
      <Card size="small">
        <Descriptions column={1} size="small"
          title="当前生效配置"
          data={[
            { label: '积分兑换比例', value: `${config.exchangeRate} 积分 = ¥1` },
            { label: '单次抵扣上限', value: config.maxDeductionLimit ? `¥${config.maxDeductionLimit.toLocaleString()}` : '不限制' },
            { label: '最低抵扣积分', value: config.minPoints ? `${config.minPoints} 积分` : '不限制' },
          ]} />
        <div style={{ fontSize: 12, color: '#86909c', marginTop: 8 }}>
          仅尊界车主用户可使用积分抵扣。积分余额在登录时从鸿蒙APP接口获取。修改即时生效，仅作用于新订单。
        </div>
      </Card>
    </div>
  );
}

// ===== 额度告急 Tab — 保持原实现 =====
function QuotaTab() {
  const [editMode, setEditMode] = useState(false);
  const [threshold, setThreshold] = useState(quotaAlertConfig.threshold);
  const [editValue, setEditValue] = useState(threshold);

  const handleEdit = () => { setEditValue(threshold); setEditMode(true); };
  const handleSave = () => {
    if (editValue <= 0) { Message.warning('阈值必须大于0'); return; }
    setThreshold(editValue); setEditMode(false); Message.success('阈值已更新');
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
          <Space><Button type="primary" onClick={handleSave}>保存</Button><Button onClick={handleCancel}>取消</Button></Space>
        ) : (
          <Button type="outline" onClick={handleEdit}>编辑</Button>
        )}
      </div>
    </Card>
  );
}

// ===== 运营区域 Tab — C8-09/10/12/13 =====
function AreaTab() {
  const [regions, setRegions] = useState([
    { id: 'R001', name: '南山区核心商圈', city: '深圳', vehicleIds: ['V001', 'V002'], status: 'active' as const, updatedAt: '2026-06-01' },
    { id: 'R002', name: '浦东陆家嘴', city: '上海', vehicleIds: ['V003'], status: 'active' as const, updatedAt: '2026-05-28' },
    { id: 'R003', name: '福田CBD', city: '深圳', vehicleIds: [], status: 'inactive' as const, updatedAt: '2026-04-15' },
  ]);
  const [keyword, setKeyword] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [regionStatusFilter, setRegionStatusFilter] = useState<string[]>([]);
  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<typeof regions[0] | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [cities, setCities] = useState<OpsCity[]>(opsCitiesData);

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
    if (regionStatusFilter.length > 0) r = r.filter(x => regionStatusFilter.includes(x.status));
    return r;
  }, [regions, keyword, cityFilter, regionStatusFilter]);

  const handleAdd = async () => {
    try {
      const v = await addForm.validate();
      if (regions.some(r => r.name === v.name && r.city === v.city)) {
        Message.error('该区域名称已存在'); return;
      }
      const newRegion = {
        id: 'R' + String(regions.length + 1).padStart(3, '0'),
        name: v.name, city: v.city, vehicleIds: v.vehicleIds || [],
        status: 'active' as const, updatedAt: new Date().toISOString().slice(0, 10),
      };
      setRegions([...regions, newRegion]);
      Message.success('区域保存成功');
      setAddVisible(false); addForm.resetFields();
    } catch { /* */ }
  };

  const handleToggleRegion = (id: string) => {
    setRegions(regions.map(r => r.id === id ? { ...r, status: r.status === 'active' ? 'inactive' as const : 'active' as const } : r));
    Message.success('状态已切换');
  };

  const handleDeleteRegion = (id: string) => {
    setRegions(regions.filter(r => r.id !== id));
    Message.success('区域已删除');
  };

  const handleEdit = () => {
    editForm.validate().then(v => {
      if (!editTarget) return;
      if (regions.some(r => r.name === v.name && r.city === v.city && r.id !== editTarget.id)) {
        Message.error('该区域名称已存在'); return;
      }
      setRegions(regions.map(r => r.id === editTarget.id ? { ...r, name: v.name, city: v.city, vehicleIds: v.vehicleIds || [], updatedAt: new Date().toISOString().slice(0, 10) } : r));
      setEditVisible(false);
      Message.success('区域已更新');
    }).catch(() => {});
  };

  const columns = [
    { title: '区域名称', dataIndex: 'name', width: 140 },
    { title: '所属城市', dataIndex: 'city', width: 80 },
    { title: '绑定车辆', dataIndex: 'vehicleIds', width: 80, render: (v: string[]) => (v || []).length },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'gray'} size="small">{v === 'active' ? '已启用' : '已停用'}</Tag> },
    { title: '更新时间', dataIndex: 'updatedAt', width: 100 },
    { title: '操作', width: 160, render: (_: unknown, r: typeof regions[0]) => (
      <Space size={4}>
        <Button type="text" size="small" onClick={() => { setEditTarget(r); editForm.setFieldsValue(r); setEditVisible(true); }}>编辑信息</Button>
        {r.status === 'active'
          ? <Popconfirm title="停用后该区域不可下单，确认？" onOk={() => handleToggleRegion(r.id)}>
              <Button type="text" size="small" status="warning">停用</Button>
            </Popconfirm>
          : <Button type="text" size="small" status="success" onClick={() => handleToggleRegion(r.id)}>启用</Button>}
        <Button type="text" size="small" onClick={() => Message.info('编辑区域：在地图上绘制围栏（SDK 接入后替换）')}>编辑区域</Button>
      </Space>
    )},
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <Select placeholder="城市" style={{ width: 120 }} value={cityFilter || undefined} onChange={v => setCityFilter(v || '')} allowClear
            options={cities.filter(c => c.status === 'active').map(c => ({ label: c.name, value: c.name }))} />
          <Select placeholder="状态" style={{ width: 160 }} mode="multiple"
            value={regionStatusFilter} onChange={setRegionStatusFilter}
            options={[{ label: '已启用', value: 'active' }, { label: '已停用', value: 'inactive' }]} />
          <Input prefix={<IconSearch />} placeholder="搜索区域名称" style={{ width: 200 }} value={keyword} onChange={setKeyword} allowClear />
          <div style={{ flex: 1 }} />
          <Button type="primary" icon={<IconPlus />} onClick={() => setAddVisible(true)}>新增区域</Button>
        </Space>
      </Card>

      <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 260px)', minHeight: 500, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ width: 480, flexShrink: 0, background: '#fff', borderRight: '1px solid #e5e6eb', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', fontSize: 14, fontWeight: 600, color: '#1d2129', flexShrink: 0 }}>运营区域</div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 460 }} pagination={false} stripe size="small" />
          </div>
        </div>
        {/* C8-11：地图占位 */}
        <div style={{ flex: 1, background: '#e8ecf1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#86909c' }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>🗺️</p>
            <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>地图预览区</p>
            <p style={{ fontSize: 12 }}>接入高德/百度地图 SDK 后可在此绘制围栏多边形（待真实地图能力后续接入）</p>
          </div>
        </div>
      </div>

      {/* 新增区域弹窗 */}
      <Modal title="新增运营区域" visible={addVisible} onOk={handleAdd} onCancel={() => setAddVisible(false)}>
        <Form form={addForm} layout="vertical">
          <Form.Item label="区域名称" field="name" rules={[{ required: true, message: '请输入区域名称' }, { maxLength: 20 }]}>
            <Input placeholder="如：南山区核心商圈" maxLength={20} />
          </Form.Item>
          <Form.Item label="所属城市" field="city" rules={[{ required: true, message: '请选择城市' }]}>
            <Select options={cities.filter(c => c.status === 'active').map(c => ({ label: c.name, value: c.name }))} />
          </Form.Item>
          <Form.Item label="关联车辆" field="vehicleIds">
            <Select mode="multiple" placeholder="选择可调度的车辆" options={vehicleOptions} style={{ width: '100%' }} />
          </Form.Item>
          <p style={{ color: '#86909c', fontSize: 12, marginTop: 4 }}>
            完整功能需接入地图 SDK 绘制多边形围栏。当前版本保存区域基本信息。
          </p>
        </Form>
      </Modal>

      {/* 编辑区域弹窗 */}
      <Modal title="编辑运营区域" visible={editVisible} onOk={handleEdit} onCancel={() => setEditVisible(false)}>
        <Form form={editForm} layout="vertical">
          <Form.Item label="区域名称" field="name" rules={[{ required: true, message: '请输入区域名称' }, { maxLength: 20 }]}>
            <Input maxLength={20} />
          </Form.Item>
          <Form.Item label="所属城市" field="city" rules={[{ required: true, message: '请选择城市' }]}>
            <Select options={cities.filter(c => c.status === 'active').map(c => ({ label: c.name, value: c.name }))} />
          </Form.Item>
          <Form.Item label="关联车辆" field="vehicleIds">
            <Select mode="multiple" placeholder="选择可调度的车辆" options={vehicleOptions} style={{ width: '100%' }} />
          </Form.Item>
          <p style={{ color: '#86909c', fontSize: 12, marginTop: 4 }}>
            编辑区域时，地图围栏必须在所选城市范围内（SDK 接入后强制执行）。
          </p>
        </Form>
      </Modal>

    </div>
  );
}

function FeeTypeTab() {
  const [feeTypes, setFeeTypes] = useState<FeeType[]>(feeTypesData);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const openAdd = () => { setEditingId(null); form.resetFields(); setModalVisible(true); };
  const openEdit = (f: FeeType) => { setEditingId(f.id); form.setFieldsValue(f); setModalVisible(true); };

  const handleSave = async () => {
    try {
      const v = await form.validate();
      // 名称唯一性校验（编辑时排除自身）
      if (feeTypes.some(f => f.name === v.name && f.id !== editingId)) {
        Message.error('该费用名称已存在');
        return;
      }
      if (editingId) {
        setFeeTypes(feeTypes.map(f => f.id === editingId ? { ...f, ...v } : f));
        Message.success('费用类型保存成功');
      } else {
        setFeeTypes([...feeTypes, { id: `FT${Date.now()}`, name: v.name, remark: v.remark, status: 'active' }]);
        Message.success('费用类型添加成功');
      }
      setModalVisible(false); form.resetFields();
    } catch { /* */ }
  };

  const columns = [
    { title: '费用名称', dataIndex: 'name', width: 200 },
    { title: '备注', dataIndex: 'remark', render: (v?: string) => v || '-' },
    { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => <Tag color={v === 'active' ? 'green' : 'gray'} size="small">{v === 'active' ? '启用' : '停用'}</Tag> },
    { title: '操作', width: 140, render: (_: unknown, r: FeeType) => (
      <Space size={4}>
        <Button type="text" size="small" onClick={() => openEdit(r)}>编辑</Button>
        <Button type="text" size="small" status={r.status === 'active' ? 'warning' : 'success'}
          onClick={() => {
            setFeeTypes(feeTypes.map(f => f.id === r.id ? { ...f, status: f.status === 'active' ? 'inactive' as const : 'active' as const } : f));
            Message.success(`费用类型已${r.status === 'active' ? '停用' : '启用'}`);
          }}>
          {r.status === 'active' ? '停用' : '启用'}
        </Button>
      </Space>
    )},
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#86909c' }}>司机端「上报费用」可选的费用类型字典，平台级公用</span>
          <Button type="primary" icon={<IconPlus />} onClick={openAdd}>新增费用类型</Button>
        </div>
      </Card>
      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={feeTypes} rowKey="id" pagination={false} stripe />
      </Card>

      <Modal title={editingId ? '编辑费用类型' : '新增费用类型'} visible={modalVisible}
        onOk={handleSave} onCancel={() => { setModalVisible(false); form.resetFields(); }}>
        <Form form={form} layout="vertical">
          <Form.Item label="费用名称" field="name" rules={[
            { required: true, message: '请填写费用名称' },
            { maxLength: 20 },
          ]}>
            <Input placeholder="如：高速费" maxLength={20} />
          </Form.Item>
          <Form.Item label="备注" field="remark">
            <Input.TextArea maxLength={100} showWordLimit rows={3} placeholder="向司机说明该费用的使用场景" />
          </Form.Item>
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
        <Tabs.TabPane key="points" title="积分权益" />
        <Tabs.TabPane key="quota" title="额度告急" />
        <Tabs.TabPane key="areas" title="运营区域" />
        <Tabs.TabPane key="feeTypes" title="费用类型" />
      </Tabs>
      {activeTab === 'pricing' && <PricingTab />}
      {activeTab === 'models' && <ModelTab />}
      {activeTab === 'points' && <PointsTab />}
      {activeTab === 'quota' && <QuotaTab />}
      {activeTab === 'areas' && <AreaTab />}
      {activeTab === 'feeTypes' && <FeeTypeTab />}
    </div>
  );
}
