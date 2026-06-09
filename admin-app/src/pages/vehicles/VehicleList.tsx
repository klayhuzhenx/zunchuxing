import { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Input, Select, Space, Drawer, Descriptions,
  Modal, Message, Form, InputNumber, DatePicker, Grid, Timeline, Image,
} from '@arco-design/web-react';
import { IconSearch, IconPlus, IconDownload } from '@arco-design/web-react/icon';
import { vehicles, drivers } from '../../data/mock';
import type { Vehicle, VehicleStatus } from '../../types';

const { RangePicker } = DatePicker;

const statusMap: Record<VehicleStatus, { label: string; color: string }> = {
  in_use: { label: '在用', color: 'green' },
  decommissioned: { label: '已停用', color: 'red' },
};

const colorOptions = ['黑色', '白色', '银色', '金色', '深蓝', '灰色', '红色'];
const typeOptions = ['轿车', 'SUV', 'MPV', '豪华轿车'];
const brandOptions = ['奔驰', '别克', '奥迪', '尊界'];
const modelOptions: Record<string, string[]> = {
  奔驰: ['V260L', 'E300L', 'S400L'],
  别克: ['GL8', 'GL8 ES'],
  奥迪: ['A6L', 'A8L', 'Q7'],
  尊界: ['S800', 'S900', 'L100'],
};

function getDriverOptions() {
  return drivers.filter(d => d.status === 'active').map(d => ({ label: `${d.name} ${d.phone}`, value: d.name }));
}

export default function VehicleList() {
  const [data, setData] = useState<Vehicle[]>(vehicles);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [driverFilter, setDriverFilter] = useState('');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [disableVisible, setDisableVisible] = useState(false);
  const [disableReason, setDisableReason] = useState('');
  const [enableVisible, setEnableVisible] = useState(false);
  const [enableReason, setEnableReason] = useState('');
  const [driverMgmtVisible, setDriverMgmtVisible] = useState(false);
  const [pendingAddDrivers, setPendingAddDrivers] = useState<string[]>([]);
  const [pendingRemoveDrivers, setPendingRemoveDrivers] = useState<Set<string>>(new Set());
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const filtered = useMemo(() => {
    let result = data;
    if (statusFilter.length > 0) result = result.filter(v => statusFilter.includes(v.status));
    if (typeFilter.length > 0) result = result.filter(v => typeFilter.includes(v.type));
    if (driverFilter) result = result.filter(v => (v.driverBindings || []).some(b => b.driverName.includes(driverFilter)));
    if (dateRange) {
      const [s, e] = dateRange;
      result = result.filter(v => v.createdAt >= s && v.createdAt <= e);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(v => v.plateNo.toLowerCase().includes(kw) || v.brand.toLowerCase().includes(kw) || v.model.toLowerCase().includes(kw));
    }
    return result;
  }, [data, keyword, statusFilter, typeFilter, driverFilter, dateRange]);

  const openDetail = (v: Vehicle) => { setSelectedVehicle(v); setEditMode(false); setDrawerVisible(true); };
  const openEdit = (v: Vehicle) => { setSelectedVehicle(v); setEditMode(true); setDrawerVisible(true); };

  const handleAdd = () => {
    addForm.validate().then(values => {
      const newVehicle: Vehicle = {
        id: `V${Date.now()}`, code: `CAR2026${String(data.length + 1).padStart(4, '0')}`,
        plateNo: values.plateNo, type: values.type, brand: values.brand,
        model: values.model, seats: values.seats, color: values.color,
        vin: values.vin, engineNo: values.engineNo, regDate: values.regDate,
        initialMileage: values.initialMileage || 0,
        docStatus: 'complete', status: 'in_use', createdAt: new Date().toISOString().split('T')[0],
      };
      setData([newVehicle, ...data]);
      setAddVisible(false); addForm.resetFields();
      Message.success('车辆添加成功');
    }).catch(() => Message.warning('请完善必填信息'));
  };

  const handleEditSave = () => {
    if (!selectedVehicle) return;
    editForm.validate().then(values => {
      setData(data.map(v => v.id === selectedVehicle.id ? { ...v, ...values } : v));
      setEditMode(false); Message.success('修改成功');
    }).catch(() => {});
  };

  const handleDisable = () => {
    if (!selectedVehicle || !disableReason.trim()) { Message.warning('请填写停用原因'); return; }
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const record = { type: 'disable' as const, reason: disableReason, operator: '当前运营', time: now };
    setData(data.map(v => v.id === selectedVehicle.id ? {
      ...v, status: 'decommissioned' as VehicleStatus,
      statusChangeRecords: [...(v.statusChangeRecords || []), record],
      driverBindings: [],
    } : v));
    setDisableVisible(false); setDisableReason(''); Message.success('车辆已停用');
  };

  const handleEnable = () => {
    if (!selectedVehicle || !enableReason.trim()) { Message.warning('请填写启用原因'); return; }
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const record = { type: 'enable' as const, reason: enableReason, operator: '当前运营', time: now };
    setData(data.map(v => v.id === selectedVehicle.id ? {
      ...v, status: 'in_use' as VehicleStatus,
      statusChangeRecords: [...(v.statusChangeRecords || []), record],
    } : v));
    setEnableVisible(false); setEnableReason(''); Message.success('车辆已启用');
  };

  // Driver management
  const openDriverMgmt = (v: Vehicle) => {
    setSelectedVehicle(v);
    setPendingAddDrivers([]);
    setPendingRemoveDrivers(new Set());
    setDriverMgmtVisible(true);
  };

  const handleAddDriver = (name: string) => {
    const current = selectedVehicle?.driverBindings?.map(b => b.driverName) || [];
    if (current.includes(name) && !pendingRemoveDrivers.has(name)) { Message.warning('该司机已绑定'); return; }
    if (pendingAddDrivers.includes(name)) { Message.warning('该司机已在待添加列表中'); return; }
    setPendingAddDrivers([...pendingAddDrivers, name]);
    Message.success(`已添加司机 ${name}`);
  };

  const handleRemoveDriver = (name: string) => {
    if (pendingAddDrivers.includes(name)) {
      setPendingAddDrivers(pendingAddDrivers.filter(n => n !== name));
    } else {
      setPendingRemoveDrivers(new Set(pendingRemoveDrivers).add(name));
    }
    Message.success(`已解绑司机 ${name}`);
  };

  const handleUndoRemove = (name: string) => {
    const next = new Set(pendingRemoveDrivers);
    next.delete(name);
    setPendingRemoveDrivers(next);
  };

  const handleSaveDriverMgmt = () => {
    if (!selectedVehicle) return;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const currentBindings = selectedVehicle.driverBindings || [];
    const removedNames = new Set([...pendingRemoveDrivers]);
    const keptBindings = currentBindings.filter(b => !removedNames.has(b.driverName));
    const newBindings = pendingAddDrivers
      .filter(n => !currentBindings.some(b => b.driverName === n))
      .map(n => {
        const d = drivers.find(x => x.name === n);
        return { driverName: n, driverPhone: d?.phone || '', boundAt: now };
      });
    const allBindings = [...keptBindings, ...newBindings];
    const newRecords = [
      ...pendingAddDrivers.filter(n => !currentBindings.some(b => b.driverName === n)).map(n => ({ driverName: n, driverPhone: drivers.find(d=>d.name===n)?.phone||'', boundAt: now })),
      ...[...pendingRemoveDrivers].map(n => { const existing = currentBindings.find(b=>b.driverName===n); return { driverName: n, driverPhone: existing?.driverPhone||'', boundAt: existing?.boundAt||'', unboundAt: now }; }),
    ];

    setData(data.map(v => v.id === selectedVehicle.id ? { ...v, driverBindings: allBindings } : v));
    setDriverMgmtVisible(false);
    if (newRecords.length > 0) Message.success('司机绑定已更新');
  };

  const columns = [
    { title: '车牌号', dataIndex: 'plateNo', width: 120, render: (v: string, r: Vehicle) => <a onClick={() => openDetail(r)}>{v}</a> },
    { title: '车辆编号', dataIndex: 'code', width: 130 },
    { title: '车型', dataIndex: 'type', width: 80, render: (v: string) => <Tag size="small">{v}</Tag> },
    { title: '品牌型号', width: 130, render: (_: unknown, r: Vehicle) => `${r.brand} ${r.model}` },
    { title: '座位数', dataIndex: 'seats', width: 70, render: (v: number) => `${v}座` },
    { title: '颜色', dataIndex: 'color', width: 70 },
    { title: '绑定司机', width: 110, render: (_: unknown, r: Vehicle) => {
      const bd = r.driverBindings || [];
      if (bd.length === 0) return <span style={{ color: '#86909c' }}>未绑定</span>;
      return <span>{bd.length === 1 ? bd[0].driverName : `${bd.length}位司机`}</span>;
    }},
    { title: '车辆状态', dataIndex: 'status', width: 80, render: (v: VehicleStatus) => <Tag color={statusMap[v].color} size="small">{statusMap[v].label}</Tag> },
    { title: '添加时间', dataIndex: 'createdAt', width: 110 },
    { title: '操作', width: 200, fixed: 'right' as const, render: (_: unknown, r: Vehicle) => (
      <Space size={4}>
        <Button type="text" size="small" onClick={() => openEdit(r)}>编辑</Button>
        {r.status === 'in_use' ? (
          <>
            <Button type="text" size="small" status="warning" onClick={() => openDriverMgmt(r)}>管理司机</Button>
            <Button type="text" size="small" status="danger" onClick={() => { setSelectedVehicle(r); setDisableVisible(true); }}>停用</Button>
          </>
        ) : null}
      </Space>
    )},
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <Input prefix={<IconSearch />} placeholder="车牌号/品牌/型号" style={{ width: 200 }} value={keyword} onChange={setKeyword} allowClear />
          <Select placeholder="车辆状态" style={{ width: 160 }} mode="multiple" value={statusFilter} onChange={setStatusFilter}
            options={[{ label: '在用', value: 'in_use' }, { label: '已停用', value: 'decommissioned' }]} />
          <Select placeholder="车型" style={{ width: 160 }} mode="multiple" value={typeFilter} onChange={setTypeFilter}
            options={typeOptions.map(t => ({ label: t, value: t }))} />
          <Select placeholder="绑定司机" style={{ width: 160 }} value={driverFilter || undefined} onChange={v => setDriverFilter(v || '')} allowClear showSearch
            options={getDriverOptions()} />
          <RangePicker style={{ width: 260 }} placeholder={['添加时间起', '添加时间止']}
            onChange={(_, ds) => setDateRange(ds && ds[0] && ds[1] ? ds as [string, string] : null)} />
          <div style={{ flex: 1 }} />
          <Button icon={<IconDownload />}>导出</Button>
          <Button type="primary" icon={<IconPlus />} onClick={() => setAddVisible(true)}>新增车辆</Button>
        </Space>
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 1500 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>

      {/* Detail Drawer */}
      <Drawer width="60%" title={selectedVehicle ? (editMode ? `编辑车辆 - ${selectedVehicle.plateNo}` : `车辆详情 - ${selectedVehicle.plateNo}`) : '车辆'}
        visible={drawerVisible} onCancel={() => { setDrawerVisible(false); setEditMode(false); }} footer={null}>
        {selectedVehicle && (editMode ? (
          <div>
            <Form form={editForm} initialValues={selectedVehicle} layout="vertical" style={{ maxWidth: 500 }}>
              <Form.Item label="车牌号" field="plateNo" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item label="车型" field="type" rules={[{ required: true }]}><Select options={typeOptions.map(t => ({ label: t, value: t }))} /></Form.Item>
              <Form.Item label="品牌" field="brand" rules={[{ required: true }]}><Select options={brandOptions.map(b => ({ label: b, value: b }))} /></Form.Item>
              <Form.Item label="型号" field="model" rules={[{ required: true }]}><Select options={modelOptions[selectedVehicle.brand]?.map(m => ({ label: m, value: m })) || []} /></Form.Item>
              <Form.Item label="座位数" field="seats" rules={[{ required: true }]}><Select options={[4,5,6,7].map(s => ({ label: `${s}座`, value: s }))} /></Form.Item>
              <Form.Item label="颜色" field="color"><Select options={colorOptions.map(c => ({ label: c, value: c }))} allowCreate /></Form.Item>
              <Form.Item label="车架号(VIN)" field="vin"><Input maxLength={17} /></Form.Item>
              <Form.Item label="发动机号" field="engineNo"><Input maxLength={20} /></Form.Item>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Button type="primary" onClick={handleEditSave}>保存</Button>
                <Button onClick={() => setEditMode(false)}>取消</Button>
              </div>
            </Form>
          </div>
        ) : (
          <div>
            {/* 基本信息 */}
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small" data={[
                { label: '车牌号', value: selectedVehicle.plateNo }, { label: '车辆编号', value: selectedVehicle.code },
                { label: '车型', value: selectedVehicle.type }, { label: '品牌', value: selectedVehicle.brand },
                { label: '型号', value: selectedVehicle.model }, { label: '座位数', value: `${selectedVehicle.seats}座` },
                { label: '颜色', value: selectedVehicle.color },
                { label: '状态', value: <Tag color={statusMap[selectedVehicle.status].color} size="small">{statusMap[selectedVehicle.status].label}</Tag> },
                ...(selectedVehicle.vin ? [{ label: '车架号(VIN)', value: selectedVehicle.vin }] : []),
                ...(selectedVehicle.engineNo ? [{ label: '发动机号', value: selectedVehicle.engineNo }] : []),
                ...(selectedVehicle.regDate ? [{ label: '注册日期', value: selectedVehicle.regDate }] : []),
                ...(selectedVehicle.initialMileage != null ? [{ label: '初始里程', value: `${selectedVehicle.initialMileage}km` }] : []),
                { label: '添加时间', value: selectedVehicle.createdAt },
              ]} />
              <Space style={{ marginTop: 12 }}>
                <Button size="small" type="primary" onClick={() => setEditMode(true)}>编辑</Button>
                {selectedVehicle.status === 'in_use' ? (
                  <>
                    <Button size="small" status="warning" onClick={() => openDriverMgmt(selectedVehicle)}>管理司机</Button>
                    <Button size="small" status="danger" onClick={() => setDisableVisible(true)}>停用</Button>
                  </>
                ) : (
                  <Button size="small" status="success" onClick={() => setEnableVisible(true)}>重新启用</Button>
                )}
              </Space>
            </Card>

            {/* 车辆照片 */}
            {selectedVehicle.photos && selectedVehicle.photos.length > 0 && (
              <Card title="车辆照片" size="small" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selectedVehicle.photos.map((p, i) => (
                    <Image key={i} src={p} width={160} height={120} style={{ objectFit: 'cover', borderRadius: 4 }}
                      alt="车辆照片" />
                  ))}
                </div>
              </Card>
            )}

            {/* 行驶证 */}
            {(selectedVehicle.licenseFront || selectedVehicle.licenseBack) && (
              <Card title="行驶证" size="small" style={{ marginBottom: 16 }}>
                <Space size={16}>
                  {selectedVehicle.licenseFront && (
                    <div><div style={{ fontSize: 12, color: '#86909c', marginBottom: 4 }}>正本</div>
                      <Image src={selectedVehicle.licenseFront} width={200} height={140} style={{ objectFit: 'cover', borderRadius: 4 }} alt="行驶证正本" />
                    </div>
                  )}
                  {selectedVehicle.licenseBack && (
                    <div><div style={{ fontSize: 12, color: '#86909c', marginBottom: 4 }}>副本</div>
                      <Image src={selectedVehicle.licenseBack} width={200} height={140} style={{ objectFit: 'cover', borderRadius: 4 }} alt="行驶证副本" />
                    </div>
                  )}
                </Space>
              </Card>
            )}

            {/* 绑定司机 */}
            <Card title="绑定司机" size="small" style={{ marginBottom: 16 }}>
              {(selectedVehicle.driverBindings || []).length > 0 ? (
                <Table columns={[
                  { title: '司机', dataIndex: 'driverName' }, { title: '手机号', dataIndex: 'driverPhone' }, { title: '绑定时间', dataIndex: 'boundAt' },
                ]} data={selectedVehicle.driverBindings || []} rowKey="driverPhone" pagination={false} size="small" />
              ) : <div style={{ color: '#86909c', textAlign: 'center', padding: 24 }}>未绑定司机</div>}
            </Card>

            {/* 状态变更记录 */}
            {selectedVehicle.statusChangeRecords && selectedVehicle.statusChangeRecords.length > 0 && (
              <Card title="状态变更记录" size="small" style={{ marginBottom: 16 }}>
                <Timeline>
                  {selectedVehicle.statusChangeRecords.map((r, i) => (
                    <Timeline.Item key={i} label={r.time}>
                      {r.type === 'disable' ? <span style={{ color: '#F53F3F' }}>停用</span> : <span style={{ color: '#00B42A' }}>启用</span>} — {r.reason}（{r.operator}）
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            )}

            {/* 操作日志 */}
            <Card title="操作日志" size="small" style={{ marginBottom: 16 }}>
              <Timeline>
                <Timeline.Item label={selectedVehicle.createdAt}>新增车辆（{selectedVehicle.plateNo}）</Timeline.Item>
                {(selectedVehicle.driverBindings || []).map((b, i) => (
                  <Timeline.Item key={`bind-${i}`} label={b.boundAt}>绑定司机 {b.driverName}</Timeline.Item>
                ))}
                {selectedVehicle.statusChangeRecords?.map((r, i) => (
                  <Timeline.Item key={`sc-${i}`} label={r.time}>
                    {r.type === 'disable' ? '停用车辆' : '启用车辆'} — {r.operator}
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </div>
        ))}
      </Drawer>

      {/* Driver Management Modal */}
      <Modal title="管理司机" visible={driverMgmtVisible}
        onOk={handleSaveDriverMgmt}
        onCancel={() => { setDriverMgmtVisible(false); setPendingAddDrivers([]); setPendingRemoveDrivers(new Set()); }}
        style={{ width: 600 }}>
        {selectedVehicle && (
          <div>
            {/* Current bindings */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>已绑定司机</div>
              {(selectedVehicle.driverBindings || []).length === 0 ? (
                <div style={{ color: '#86909c', padding: '8px 0' }}>暂无绑定司机</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {(selectedVehicle.driverBindings || []).map(b => (
                    <div key={b.driverName} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 12px', background: pendingRemoveDrivers.has(b.driverName) ? '#FFF1F0' : '#f7f8fa', borderRadius: 4,
                      textDecoration: pendingRemoveDrivers.has(b.driverName) ? 'line-through' : 'none',
                    }}>
                      <span>{b.driverName} {b.driverPhone} · 绑定于 {b.boundAt}</span>
                      {pendingRemoveDrivers.has(b.driverName) ? (
                        <Button size="mini" onClick={() => handleUndoRemove(b.driverName)}>撤销</Button>
                      ) : (
                        <Button size="mini" status="danger" onClick={() => handleRemoveDriver(b.driverName)}>解绑</Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending adds */}
            {pendingAddDrivers.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#00B42A' }}>待添加</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {pendingAddDrivers.map(n => (
                    <div key={n} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#E8FFEA', borderRadius: 4 }}>
                      <span>{n}</span>
                      <Button size="mini" status="danger" onClick={() => setPendingAddDrivers(pendingAddDrivers.filter(x => x !== n))}>移除</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add driver */}
            <div style={{ marginTop: 16 }}>
              <Select
                placeholder="搜索在岗司机以添加"
                style={{ width: '100%' }}
                showSearch
                options={getDriverOptions()}
                onChange={v => { if (v) handleAddDriver(v); }}
                value={undefined}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal title="新增车辆" visible={addVisible} onOk={handleAdd} onCancel={() => { setAddVisible(false); addForm.resetFields(); }} style={{ width: 580 }}>
        <Form form={addForm} layout="vertical">
          <Grid.Row gutter={16}>
            <Grid.Col span={12}><Form.Item label="车牌号" field="plateNo" rules={[{ required: true, message: '请输入车牌号' }]}><Input placeholder="粤B12345" /></Form.Item></Grid.Col>
            <Grid.Col span={12}><Form.Item label="车型" field="type" rules={[{ required: true, message: '请选择车型' }]}><Select placeholder="选择车型" options={typeOptions.map(t => ({ label: t, value: t }))} /></Form.Item></Grid.Col>
          </Grid.Row>
          <Grid.Row gutter={16}>
            <Grid.Col span={12}><Form.Item label="品牌" field="brand" rules={[{ required: true }]}><Select placeholder="选择品牌" options={brandOptions.map(b => ({ label: b, value: b }))} /></Form.Item></Grid.Col>
            <Grid.Col span={12}><Form.Item label="型号" field="model" rules={[{ required: true }]}><Select placeholder="选择型号" options={modelOptions['奔驰']} /></Form.Item></Grid.Col>
          </Grid.Row>
          <Grid.Row gutter={16}>
            <Grid.Col span={12}><Form.Item label="座位数" field="seats" rules={[{ required: true }]} initialValue={7}><Select options={[4,5,6,7].map(s => ({ label: `${s}座`, value: s }))} /></Form.Item></Grid.Col>
            <Grid.Col span={12}><Form.Item label="颜色" field="color" rules={[{ required: true }]}><Select options={colorOptions.map(c => ({ label: c, value: c }))} allowCreate /></Form.Item></Grid.Col>
          </Grid.Row>
          <Grid.Row gutter={16}>
            <Grid.Col span={12}><Form.Item label="车架号(VIN)" field="vin"><Input placeholder="17位" maxLength={17} /></Form.Item></Grid.Col>
            <Grid.Col span={12}><Form.Item label="发动机号" field="engineNo"><Input maxLength={20} /></Form.Item></Grid.Col>
          </Grid.Row>
          <Grid.Row gutter={16}>
            <Grid.Col span={12}><Form.Item label="注册日期" field="regDate"><DatePicker style={{ width: '100%' }} /></Form.Item></Grid.Col>
            <Grid.Col span={12}><Form.Item label="初始里程(km)" field="initialMileage"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Grid.Col>
          </Grid.Row>
        </Form>
      </Modal>

      {/* Disable Modal */}
      <Modal title="停用车辆" visible={disableVisible} onOk={handleDisable} onCancel={() => { setDisableVisible(false); setDisableReason(''); }}>
        <p>确定停用车辆 <strong>{selectedVehicle?.plateNo}</strong> 吗？停用后该车辆将不可被派车。</p>
        <Select placeholder="停用原因" style={{ width: '100%', marginTop: 12 }} value={disableReason || undefined} onChange={setDisableReason}
          options={[{ label: '车辆报废', value: '车辆报废' }, { label: '车辆转让', value: '车辆转让' }, { label: '暂时停运', value: '暂时停运' }, { label: '其他', value: '其他' }]} allowCreate />
      </Modal>

      {/* Enable Modal */}
      <Modal title="启用车辆" visible={enableVisible} onOk={handleEnable} onCancel={() => { setEnableVisible(false); setEnableReason(''); }}>
        <p>确定重新启用车辆 <strong>{selectedVehicle?.plateNo}</strong> 吗？</p>
        <Input.TextArea placeholder="启用原因（必填）" style={{ marginTop: 12 }} value={enableReason} onChange={setEnableReason} maxLength={200} />
      </Modal>
    </div>
  );
}
