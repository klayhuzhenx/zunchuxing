import { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Input, Select, Space, Drawer, Descriptions,
  Modal, Message, Form, Grid, DatePicker, Timeline, Image,
} from '@arco-design/web-react';
import { IconSearch, IconPlus, IconDownload, IconStarFill, IconStar } from '@arco-design/web-react/icon';
import { drivers, vehicles, driverOrders } from '../../data/mock';
import type { Driver, DriverStatus } from '../../types';

const { RangePicker } = DatePicker;

const statusMap: Record<DriverStatus, { label: string; color: string }> = {
  active: { label: '在岗', color: 'green' },
  decommissioned: { label: '已停用', color: 'red' },
};

const licenseTypes = ['C1', 'C2', 'B1', 'B2', 'A1', 'A2'];

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: max }, (_, i) => i < rating
        ? <IconStarFill key={i} style={{ color: '#F7BA1E', fontSize: 14 }} />
        : <IconStar key={i} style={{ color: '#e5e6eb', fontSize: 14 }} />
      )}
    </span>
  );
}

export default function DriverList() {
  const [data, setData] = useState<Driver[]>(drivers);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [disableVisible, setDisableVisible] = useState(false);
  const [disableReason, setDisableReason] = useState('');
  const [enableVisible, setEnableVisible] = useState(false);
  const [enableReason, setEnableReason] = useState('');
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const filtered = useMemo(() => {
    let result = data;
    if (statusFilter.length > 0) result = result.filter(d => statusFilter.includes(d.status));
    if (vehicleFilter) result = result.filter(d => (d.boundVehicles || []).some(b => b.plateNo.toLowerCase().includes(vehicleFilter.toLowerCase())));
    if (dateRange) {
      const [s, e] = dateRange;
      result = result.filter(d => d.createdAt >= s && d.createdAt <= e);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(d => d.name.toLowerCase().includes(kw) || d.phone.includes(kw));
    }
    return result;
  }, [data, keyword, statusFilter, vehicleFilter, dateRange]);

  const openDetail = (d: Driver) => { setSelectedDriver(d); setEditMode(false); setDrawerVisible(true); };
  const openEdit = (d: Driver) => { setSelectedDriver(d); setEditMode(true); setDrawerVisible(true); };

  const handleAdd = () => {
    addForm.validate().then(values => {
      const newDriver: Driver = {
        id: `DRV${Date.now()}`, code: `DRV2026${String(data.length + 1).padStart(4, '0')}`,
        name: values.name, phone: values.phone,
        idCard: values.idCard, licenseType: values.licenseType,
        licenseExpiry: values.licenseExpiry, gender: values.gender, birthDate: values.birthDate,
        remark: values.remark, serviceCount: 0, serviceHours: 0, rating: 0, onTimeRate: 0, goodReviewRate: 0,
        status: 'active', createdAt: new Date().toISOString().split('T')[0],
      };
      setData([newDriver, ...data]);
      setAddVisible(false); addForm.resetFields(); Message.success('司机添加成功');
    }).catch(() => Message.warning('请完善必填信息'));
  };

  const handleEditSave = () => {
    if (!selectedDriver) return;
    editForm.validate().then(values => {
      setData(data.map(d => d.id === selectedDriver.id ? { ...d, ...values } : d));
      setEditMode(false); Message.success('修改成功');
    }).catch(() => {});
  };

  const handleDisable = () => {
    if (!selectedDriver || !disableReason.trim()) { Message.warning('请填写停用原因'); return; }
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const record = { type: 'disable' as const, reason: disableReason, operator: '当前运营', time: now };
    setData(data.map(d => d.id === selectedDriver.id ? {
      ...d, status: 'decommissioned' as DriverStatus,
      statusChangeRecords: [...(d.statusChangeRecords || []), record],
    } : d));
    setDisableVisible(false); setDisableReason(''); Message.success('司机已停用');
  };

  const handleEnable = () => {
    if (!selectedDriver || !enableReason.trim()) { Message.warning('请填写启用原因'); return; }
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const record = { type: 'enable' as const, reason: enableReason, operator: '当前运营', time: now };
    setData(data.map(d => d.id === selectedDriver.id ? {
      ...d, status: 'active' as DriverStatus,
      statusChangeRecords: [...(d.statusChangeRecords || []), record],
    } : d));
    setEnableVisible(false); setEnableReason(''); Message.success('司机已启用');
  };

  const columns = [
    { title: '司机编号', dataIndex: 'code', width: 130 },
    { title: '姓名', dataIndex: 'name', width: 90, render: (v: string, r: Driver) => <a onClick={() => openDetail(r)}>{v}</a> },
    { title: '手机号', dataIndex: 'phone', width: 130, render: (v: string) => v.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') },
    { title: '驾驶证类型', dataIndex: 'licenseType', width: 100 },
    { title: '绑定车辆', width: 130, render: (_: unknown, r: Driver) => {
      const bv = r.boundVehicles || [];
      return bv.length > 0 ? <span>{bv.length === 1 ? bv[0].plateNo : `${bv.length}辆车`}</span> : <span style={{ color: '#86909c' }}>未绑定</span>;
    }},
    { title: 'GPS定位', width: 130, render: (_: unknown, r: Driver) => r.gpsLocation ? <span title={`${r.gpsUpdatedAt || ''}`}>{r.gpsLocation}</span> : '-' },
    { title: '累计服务', dataIndex: 'serviceCount', width: 80, render: (v: number) => `${v}单` },
    { title: '评分', dataIndex: 'rating', width: 90, render: (v: number) => v > 0 ? <span><StarRating rating={Math.round(v)} /> {v.toFixed(1)}</span> : '-' },
    { title: '状态', dataIndex: 'status', width: 70, render: (v: DriverStatus) => <Tag color={statusMap[v].color} size="small">{statusMap[v].label}</Tag> },
    { title: '入驻时间', dataIndex: 'createdAt', width: 110 },
    { title: '操作', width: 160, fixed: 'right' as const, render: (_: unknown, r: Driver) => (
      <Space size={4}>
        <Button type="text" size="small" onClick={() => openEdit(r)}>编辑</Button>
        {r.status === 'active' ? <Button type="text" size="small" status="danger" onClick={() => { setSelectedDriver(r); setDisableVisible(true); }}>停用</Button> : null}
      </Space>
    )},
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <Input prefix={<IconSearch />} placeholder="姓名/手机号/驾驶证号" style={{ width: 240 }} value={keyword} onChange={setKeyword} allowClear />
          <Select placeholder="司机状态" style={{ width: 160 }} mode="multiple" value={statusFilter} onChange={setStatusFilter}
            options={[{ label: '在岗', value: 'active' }, { label: '已停用', value: 'decommissioned' }]} />
          <Select placeholder="绑定车辆" style={{ width: 160 }} value={vehicleFilter || undefined} onChange={v => setVehicleFilter(v || '')} allowClear showSearch
            options={vehicles.filter(v => v.status === 'in_use').map(v => ({ label: `${v.plateNo} ${v.model}`, value: v.plateNo }))} />
          <RangePicker style={{ width: 260 }} placeholder={['入驻时间起', '入驻时间止']}
            onChange={(_, ds) => setDateRange(ds && ds[0] && ds[1] ? ds as [string, string] : null)} />
          <div style={{ flex: 1 }} />
          <Button icon={<IconDownload />}>导出</Button>
          <Button type="primary" icon={<IconPlus />} onClick={() => setAddVisible(true)}>新增司机</Button>
        </Space>
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 1600 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>

      {/* Detail/Edit Drawer */}
      <Drawer width="60%" title={selectedDriver ? (editMode ? `编辑司机 - ${selectedDriver.name}` : `司机详情 - ${selectedDriver.name}`) : '司机'}
        visible={drawerVisible} onCancel={() => { setDrawerVisible(false); setEditMode(false); }} footer={null}>
        {selectedDriver && (editMode ? (
          <div>
            <Form form={editForm} initialValues={selectedDriver} layout="vertical" style={{ maxWidth: 500 }}>
              <Grid.Row gutter={16}>
                <Grid.Col span={12}><Form.Item label="姓名" field="name" rules={[{ required: true }]}><Input /></Form.Item></Grid.Col>
                <Grid.Col span={12}><Form.Item label="手机号" field="phone" rules={[{ required: true }]}><Input /></Form.Item></Grid.Col>
              </Grid.Row>
              <Grid.Row gutter={16}>
                <Grid.Col span={12}><Form.Item label="驾驶证类型" field="licenseType" rules={[{ required: true }]}><Select options={licenseTypes.map(t => ({ label: t, value: t }))} /></Form.Item></Grid.Col>
                <Grid.Col span={12}><Form.Item label="驾驶证有效期" field="licenseExpiry" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Grid.Col>
              </Grid.Row>
              <Grid.Row gutter={16}>
                <Grid.Col span={12}><Form.Item label="性别" field="gender"><Select options={[{ label: '男', value: 'male' }, { label: '女', value: 'female' }]} /></Form.Item></Grid.Col>
                <Grid.Col span={12}><Form.Item label="出生日期" field="birthDate"><DatePicker style={{ width: '100%' }} /></Form.Item></Grid.Col>
              </Grid.Row>
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
                { label: '司机编号', value: selectedDriver.code }, { label: '姓名', value: selectedDriver.name },
                { label: '手机号', value: selectedDriver.phone }, { label: '性别', value: selectedDriver.gender === 'male' ? '男' : '女' },
                { label: '身份证号', value: selectedDriver.idCard },
                { label: '驾驶证类型', value: selectedDriver.licenseType }, { label: '驾驶证有效期', value: selectedDriver.licenseExpiry },
                ...(selectedDriver.licenseImage ? [{ label: '驾驶证', value: 
                  <img src={selectedDriver.licenseImage} alt="驾驶证" style={{ width: 200, height: 140, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                }] : []),
                ...(selectedDriver.birthDate ? [{ label: '出生日期', value: selectedDriver.birthDate }] : []),
                { label: '状态', value: <Tag color={statusMap[selectedDriver.status].color} size="small">{statusMap[selectedDriver.status].label}</Tag> },
              ]} />
              <Space style={{ marginTop: 12 }}>
                <Button size="small" type="primary" onClick={() => setEditMode(true)}>编辑</Button>
                {selectedDriver.status === 'active' ? (
                  <Button size="small" status="danger" onClick={() => setDisableVisible(true)}>停用</Button>
                ) : (
                  <Button size="small" status="success" onClick={() => setEnableVisible(true)}>重新启用</Button>
                )}
              </Space>
            </Card>

            {/* GPS定位 */}
            {selectedDriver.gpsLocation && (
              <Card title="GPS定位" size="small" style={{ marginBottom: 16 }}>
                <Descriptions column={2} size="small" data={[
                  { label: '最近位置', value: selectedDriver.gpsLocation },
                  { label: '上报时间', value: selectedDriver.gpsUpdatedAt || '-' },
                ]} />
              </Card>
            )}

            {/* 考核数据 */}
            <Card title="考核数据" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small" data={[
                { label: '累计服务单数', value: `${selectedDriver.serviceCount}单` },
                { label: '累计服务时长', value: `${selectedDriver.serviceHours}h` },
                { label: '综合评分', value: selectedDriver.rating > 0 ? <span><StarRating rating={Math.round(selectedDriver.rating)} /> {selectedDriver.rating.toFixed(1)}</span> : '-' },
                { label: '准时率', value: selectedDriver.onTimeRate > 0 ? `${(selectedDriver.onTimeRate * 100).toFixed(0)}%` : '-' },
                { label: '好评率', value: selectedDriver.goodReviewRate > 0 ? `${(selectedDriver.goodReviewRate * 100).toFixed(0)}%` : '-' },
              ]} />
            </Card>

            {/* 绑定车辆 */}
            <Card title="绑定车辆" size="small" style={{ marginBottom: 16 }}>
              {(selectedDriver.boundVehicles || []).length > 0 ? (
                <Table columns={[
                  { title: '车牌号', dataIndex: 'plateNo' }, { title: '车型', dataIndex: 'carModel' }, { title: '绑定时间', dataIndex: 'boundAt' },
                ]} data={selectedDriver.boundVehicles || []} rowKey="plateNo" pagination={false} size="small" />
              ) : <div style={{ color: '#86909c', textAlign: 'center', padding: 24 }}>未绑定车辆</div>}
            </Card>

            {/* 服务记录 */}
            <Card title="服务记录" size="small" style={{ marginBottom: 16 }}>
              {(() => {
                const records = driverOrders
                  .filter(o => o.driverName === selectedDriver.name && (o.status === 'completed' || o.status === 'pending_settlement'))
                  .sort((a, b) => b.tripDate.localeCompare(a.tripDate) || (b.actualStartTime || '').localeCompare(a.actualStartTime || ''));
                return records.length > 0 ? (
                  <Table columns={[
                    { title: '出车单号', dataIndex: 'driverOrderNo', width: 160 },
                    { title: '日期', dataIndex: 'tripDate', width: 100 },
                    { title: '类型', dataIndex: 'type', width: 70, render: (v: string) => v === 'charter' ? '包车' : '租车' },
                    { title: '实际时长', width: 80, render: (_: unknown, r: typeof records[0]) => r.duration ? `${Math.floor(r.duration / 60)}h${r.duration % 60}m` : '-' },
                    { title: '里程', dataIndex: 'mileage', width: 70, render: (v: number) => v ? `${v}km` : '-' },
                    { title: '状态', dataIndex: 'status', width: 80, render: (v: string) => {
                      const map: Record<string, { label: string; color: string }> = {
                        completed: { label: '已完成', color: 'green' },
                        pending_settlement: { label: '待结算', color: 'orangered' },
                      };
                      const s = map[v];
                      return s ? <Tag color={s.color} size="small">{s.label}</Tag> : v;
                    }},
                  ]} data={records.slice(0, 10)} rowKey="id" pagination={false} size="small" />
                ) : <div style={{ color: '#86909c', textAlign: 'center', padding: 24 }}>暂无服务记录</div>;
              })()}
            </Card>

            {/* 绑定记录 */}
            {selectedDriver.bindingRecords && selectedDriver.bindingRecords.length > 0 && (
              <Card title="绑定记录" size="small" style={{ marginBottom: 16 }}>
                <Timeline>
                  {selectedDriver.bindingRecords.map((r, i) => (
                    <Timeline.Item key={i} label={r.boundAt}>
                      {r.unboundAt
                        ? <span>绑定 {r.plateNo} → 解绑于 {r.unboundAt}（{r.operator}）</span>
                        : <span>绑定 {r.plateNo}（{r.operator}）</span>}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            )}

            {/* 状态变更记录 */}
            {selectedDriver.statusChangeRecords && selectedDriver.statusChangeRecords.length > 0 && (
              <Card title="状态变更记录" size="small" style={{ marginBottom: 16 }}>
                <Timeline>
                  {selectedDriver.statusChangeRecords.map((r, i) => (
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
                <Timeline.Item label={selectedDriver.createdAt}>新增司机（{selectedDriver.name}）</Timeline.Item>
                {selectedDriver.bindingRecords?.map((r, i) => (
                  <Timeline.Item key={`br-${i}`} label={r.boundAt}>绑定车辆 {r.plateNo}</Timeline.Item>
                ))}
                {selectedDriver.statusChangeRecords?.map((r, i) => (
                  <Timeline.Item key={`sr-${i}`} label={r.time}>
                    {r.type === 'disable' ? '停用' : '启用'} — {r.operator}
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </div>
        ))}
      </Drawer>

      {/* Add Modal */}
      <Modal title="新增司机" visible={addVisible} onOk={handleAdd} onCancel={() => { setAddVisible(false); addForm.resetFields(); }} style={{ width: 580 }}>
        <Form form={addForm} layout="vertical">
          <Grid.Row gutter={16}>
            <Grid.Col span={12}><Form.Item label="姓名" field="name" rules={[{ required: true, message: '请输入姓名' }]}><Input maxLength={20} /></Form.Item></Grid.Col>
            <Grid.Col span={12}><Form.Item label="手机号" field="phone" rules={[{ required: true, message: '请输入手机号' }]}><Input maxLength={11} /></Form.Item></Grid.Col>
          </Grid.Row>
          <Grid.Row gutter={16}>
            <Grid.Col span={12}><Form.Item label="身份证号" field="idCard" rules={[{ required: true, message: '请输入18位身份证号' }]}><Input maxLength={18} /></Form.Item></Grid.Col>
            
          </Grid.Row>
          <Grid.Row gutter={16}>
            <Grid.Col span={12}><Form.Item label="驾驶证类型" field="licenseType" rules={[{ required: true, message: '请选择' }]}><Select options={licenseTypes.map(t => ({ label: t, value: t }))} /></Form.Item></Grid.Col>
            <Grid.Col span={12}><Form.Item label="驾驶证有效期" field="licenseExpiry" rules={[{ required: true, message: '请选择' }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Grid.Col>
          </Grid.Row>
          <Grid.Row gutter={16}>
            <Grid.Col span={12}><Form.Item label="性别" field="gender" rules={[{ required: true, message: '请选择' }]}><Select options={[{ label: '男', value: 'male' }, { label: '女', value: 'female' }]} /></Form.Item></Grid.Col>
            <Grid.Col span={12}><Form.Item label="出生日期" field="birthDate"><DatePicker style={{ width: '100%' }} /></Form.Item></Grid.Col>
          </Grid.Row>
          <Form.Item label="驾驶证上传" field="licenseImage"><Input placeholder="驾驶证图片URL（选填）" /></Form.Item>
          <Form.Item label="备注" field="remark"><Input.TextArea maxLength={200} showWordLimit rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Disable Modal */}
      <Modal title="停用司机" visible={disableVisible} onOk={handleDisable} onCancel={() => { setDisableVisible(false); setDisableReason(''); }}>
        <p>确定停用司机 <strong>{selectedDriver?.name}</strong> 吗？停用后该司机将不可被派车。</p>
        <Select placeholder="停用原因" style={{ width: '100%', marginTop: 12 }} value={disableReason || undefined} onChange={setDisableReason}
          options={[{ label: '离职', value: '离职' }, { label: '暂时停岗', value: '暂时停岗' }, { label: '其他', value: '其他' }]} allowCreate />
      </Modal>

      {/* Enable Modal */}
      <Modal title="重新启用" visible={enableVisible} onOk={handleEnable} onCancel={() => { setEnableVisible(false); setEnableReason(''); }}>
        <p>确定重新启用司机 <strong>{selectedDriver?.name}</strong> 吗？</p>
        <Input.TextArea placeholder="启用原因（必填）" style={{ marginTop: 12 }} value={enableReason} onChange={setEnableReason} maxLength={200} />
      </Modal>
    </div>
  );
}
