import { useState, useMemo, useRef } from 'react';
import {
  Card, Table, Tag, Button, Input, Select, Space, Drawer, Descriptions,
  Modal, Message, Form, Grid, DatePicker, Timeline, Image, Upload, Popconfirm,
} from '@arco-design/web-react';
import { IconSearch, IconPlus, IconDownload, IconStarFill, IconStar, IconEye, IconRefresh } from '@arco-design/web-react/icon';
import { drivers, vehicles, driverOrders } from '../../data/mock';
import type { Driver, DriverStatus } from '../../types';

const { RangePicker } = DatePicker;

const statusMap: Record<DriverStatus, { label: string; color: string }> = {
  active: { label: '在岗', color: 'green' },
  decommissioned: { label: '已停用', color: 'red' },
};

const licenseTypes = ['C1', 'C2', 'B1', 'B2', 'A1', 'A2'];

// 校验：身份证 18 位（含 X）
const ID_CARD_REGEX = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
const PHONE_REGEX = /^1[3-9]\d{9}$/;

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
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [disableVisible, setDisableVisible] = useState(false);
  const [disableReason, setDisableReason] = useState('');
  const [enableVisible, setEnableVisible] = useState(false);
  const [enableReason, setEnableReason] = useState('');
  // 驾驶证多张上传（base64 列表）
  const [addLicenseImages, setAddLicenseImages] = useState<string[]>([]);
  // 详情页管理车辆
  // 服务记录月份切换
  const [serviceMonth, setServiceMonth] = useState<string>('all');
  // GPS 防抖
  const lastGpsRefreshRef = useRef<number>(0);
  // 驾驶证图片预览
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const filtered = useMemo(() => {
    let result = data;
    if (statusFilter.length > 0) result = result.filter(d => statusFilter.includes(d.status));
    if (dateRange) {
      const [s, e] = dateRange;
      result = result.filter(d => d.createdAt >= s && d.createdAt <= e);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      // C6-11: placeholder 含驾驶证号，filter 同步匹配
      result = result.filter(d =>
        d.name.toLowerCase().includes(kw) ||
        d.phone.includes(kw) ||
        (d.licenseNo || '').toLowerCase().includes(kw)
      );
    }
    return result;
  }, [data, keyword, statusFilter, dateRange]);

  const openDetail = (d: Driver) => { setSelectedDriver(d); setEditMode(false); setDrawerVisible(true); };
  const openEdit = (d: Driver) => { setSelectedDriver(d); setEditMode(true); setDrawerVisible(true); };

  const handleAdd = () => {
    addForm.validate().then(values => {
      // 手机号唯一性校验
      if (data.some(d => d.phone === values.phone)) {
        Message.error('该手机号已被其他司机使用');
        return;
      }
      // 驾驶证图片必填
      if (addLicenseImages.length === 0) {
        Message.error('请上传驾驶证照片');
        return;
      }
      // 驾驶证有效期不得早于当前日期
      const today = new Date().toISOString().slice(0, 10);
      if (values.licenseExpiry && values.licenseExpiry < today) {
        Message.error('驾驶证有效期不能早于当前日期');
        return;
      }
      const newDriver: Driver = {
        id: `DRV${Date.now()}`, code: `DRV2026${String(data.length + 1).padStart(4, '0')}`,
        name: values.name, phone: values.phone,
        idCard: values.idCard, licenseType: values.licenseType,
        licenseExpiry: values.licenseExpiry, gender: values.gender, birthDate: values.birthDate,
        licenseImages: addLicenseImages,
        licenseImage: addLicenseImages[0],
        remark: values.remark, serviceCount: 0, serviceHours: 0, rating: 0, onTimeRate: 0, goodReviewRate: 0,
        status: 'active', createdAt: new Date().toISOString().split('T')[0],
      };
      setData([newDriver, ...data]);
      setAddVisible(false); addForm.resetFields(); setAddLicenseImages([]);
      Message.success('司机添加成功');
    }).catch(() => Message.warning('请完善必填信息'));
  };

  // GPS 手动刷新（30s 防抖）
  const handleGpsRefresh = () => {
    const now = Date.now();
    if (now - lastGpsRefreshRef.current < 30000) {
      const remain = Math.ceil((30000 - (now - lastGpsRefreshRef.current)) / 1000);
      Message.warning(`刷新过于频繁，请 ${remain}s 后重试`);
      return;
    }
    lastGpsRefreshRef.current = now;
    if (selectedDriver) {
      const newTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
      setData(data.map(d => d.id === selectedDriver.id ? { ...d, gpsUpdatedAt: newTime } : d));
      setSelectedDriver({ ...selectedDriver, gpsUpdatedAt: newTime });
      Message.success('GPS 位置已刷新');
    }
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
    // 停用前校验：无待开始/进行中/待结算订单
    const blockingOrders = driverOrders.filter(o => o.driverName === selectedDriver.name
      && ['not_started', 'in_progress', 'pending_settlement'].includes(o.status));
    if (blockingOrders.length > 0) {
      Message.error(`该司机有 ${blockingOrders.length} 笔待开始/进行中/待结算订单，无法停用`);
      return;
    }
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
    { title: '最近上报位置', width: 150, render: (_: unknown, r: Driver) => r.gpsLocation ? <span title={`${r.gpsUpdatedAt || ''}`}>{r.gpsLocation}</span> : '-' },
    { title: '累计服务', dataIndex: 'serviceCount', width: 80, render: (v: number) => `${v}单` },
    { title: '评分', dataIndex: 'rating', width: 90, render: (v: number) => v > 0 ? <span><StarRating rating={Math.round(v)} /> {v.toFixed(1)}</span> : '-' },
    { title: '状态', dataIndex: 'status', width: 70, render: (v: DriverStatus) => <Tag color={statusMap[v].color} size="small">{statusMap[v].label}</Tag> },
    { title: '入驻时间', dataIndex: 'createdAt', width: 110 },
    { title: '操作', width: 220, fixed: 'right' as const, render: (_: unknown, r: Driver) => (
      <Space size={4}>
        <Button type="text" size="small" icon={<IconEye />} onClick={() => openDetail(r)}>详情</Button>
        <Button type="text" size="small" onClick={() => openEdit(r)}>编辑</Button>
        {r.status === 'active'
          ? <Button type="text" size="small" status="danger" onClick={() => { setSelectedDriver(r); setDisableReason(''); setDisableVisible(true); }}>停用</Button>
          : <Button type="text" size="small" status="success" onClick={() => { setSelectedDriver(r); setEnableReason(''); setEnableVisible(true); }}>启用</Button>}
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
      <Drawer width="60%" title={`司机详情 - ${selectedDriver?.name || ''}`}
        visible={drawerVisible} onCancel={() => setDrawerVisible(false)} footer={null}>
        {selectedDriver && (
          <div>
            {/* 基本信息 */}
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small" data={[
                { label: '司机编号', value: selectedDriver.code }, { label: '姓名', value: selectedDriver.name },
                { label: '手机号', value: selectedDriver.phone }, { label: '性别', value: selectedDriver.gender === 'male' ? '男' : '女' },
                { label: '身份证号', value: selectedDriver.idCard },
                { label: '驾驶证类型', value: selectedDriver.licenseType }, { label: '驾驶证有效期', value: selectedDriver.licenseExpiry },
                ...(selectedDriver.birthDate ? [{ label: '出生日期', value: selectedDriver.birthDate }] : []),
                { label: '状态', value: <Tag color={statusMap[selectedDriver.status].color} size="small">{statusMap[selectedDriver.status].label}</Tag> },
              ]} />

              {/* 驾驶证照片 — 可点击放大 */}
              {(selectedDriver.licenseImages && selectedDriver.licenseImages.length > 0) || selectedDriver.licenseImage ? (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 13, color: '#86909c', marginBottom: 8 }}>驾驶证照片</div>
                  <Space size={12} wrap>
                    {(selectedDriver.licenseImages && selectedDriver.licenseImages.length > 0
                      ? selectedDriver.licenseImages
                      : [selectedDriver.licenseImage!]
                    ).map((img, i) => (
                      <Image
                        key={i}
                        src={img}
                        width={160}
                        height={110}
                        style={{ objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
                        alt={`驾驶证 ${i + 1}`}
                        preview
                      />
                    ))}
                  </Space>
                </div>
              ) : null}

            </Card>

            {/* 最近上报位置 */}
            {selectedDriver.gpsLocation && (
              <Card title="最近上报位置" size="small" style={{ marginBottom: 16 }}
                extra={<Button size="mini" icon={<IconRefresh />} onClick={handleGpsRefresh}>刷新</Button>}
              >
                <Descriptions column={2} size="small" data={[
                  { label: '位置', value: selectedDriver.gpsLocation },
                  { label: '上报时间', value: selectedDriver.gpsUpdatedAt || '-' },
                ]} />
                <div style={{ fontSize: 12, color: '#86909c', marginTop: 4 }}>30秒内最多刷新一次</div>
              </Card>
            )}

            {/* 考核数据 — 删准时率/好评率 */}
            <Card title="考核数据" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small" data={[
                { label: '累计服务单数', value: `${selectedDriver.serviceCount}单` },
                { label: '累计服务时长', value: `${selectedDriver.serviceHours}h` },
                { label: '综合评分', value: selectedDriver.rating > 0 ? <span><StarRating rating={Math.round(selectedDriver.rating)} /> {selectedDriver.rating.toFixed(1)}</span> : '-' },
              ]} />
            </Card>

            {/* 服务记录 — 按月切换 */}
            <Card title="服务记录" size="small" style={{ marginBottom: 16 }}
              extra={
                <Select size="small" style={{ width: 140 }} value={serviceMonth} onChange={setServiceMonth}
                  options={(() => {
                    const months = [...new Set(
                      driverOrders
                        .filter(o => o.driverName === selectedDriver.name)
                        .map(o => o.tripDate.slice(0, 7))
                    )].sort((a, b) => b.localeCompare(a));
                    return [{ label: '全部', value: 'all' }, ...months.map(m => ({ label: m, value: m }))];
                  })()}
                />
              }
            >
              {(() => {
                let records = driverOrders
                  .filter(o => o.driverName === selectedDriver.name && (o.status === 'completed' || o.status === 'pending_settlement'))
                  .sort((a, b) => b.tripDate.localeCompare(a.tripDate) || (b.actualStartTime || '').localeCompare(a.actualStartTime || ''));
                if (serviceMonth !== 'all') {
                  records = records.filter(r => r.tripDate.startsWith(serviceMonth));
                }
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
                  ]} data={records} rowKey="id" pagination={{ pageSize: 10 }} size="small" />
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
        )}
      </Drawer>

      {/* Add Modal */}
      <Modal title="新增司机" visible={addVisible}
        onOk={handleAdd}
        onCancel={() => { setAddVisible(false); addForm.resetFields(); setAddLicenseImages([]); }}
        style={{ width: 580 }}>
        <Form form={addForm} layout="vertical">
          <Grid.Row gutter={16}>
            <Grid.Col span={12}><Form.Item label="姓名" field="name" rules={[
              { required: true, message: '请输入姓名' }, { maxLength: 20 },
            ]}><Input maxLength={20} /></Form.Item></Grid.Col>
            <Grid.Col span={12}><Form.Item label="手机号" field="phone" rules={[
              { required: true, message: '请输入手机号' },
              { match: PHONE_REGEX, message: '请输入正确的手机号' },
            ]}><Input maxLength={11} /></Form.Item></Grid.Col>
          </Grid.Row>
          <Grid.Row gutter={16}>
            <Grid.Col span={12}><Form.Item label="身份证号" field="idCard" rules={[
              { required: true, message: '请输入18位身份证号' },
              { match: ID_CARD_REGEX, message: '请输入18位身份证号' },
            ]}><Input maxLength={18} /></Form.Item></Grid.Col>
            <Grid.Col span={12}><Form.Item label="性别" field="gender" rules={[{ required: true, message: '请选择' }]}><Select options={[{ label: '男', value: 'male' }, { label: '女', value: 'female' }]} /></Form.Item></Grid.Col>
          </Grid.Row>
          <Grid.Row gutter={16}>
            <Grid.Col span={12}><Form.Item label="驾驶证类型" field="licenseType" rules={[{ required: true, message: '请选择' }]}><Select options={licenseTypes.map(t => ({ label: t, value: t }))} /></Form.Item></Grid.Col>
            <Grid.Col span={12}><Form.Item label="驾驶证有效期" field="licenseExpiry" rules={[{ required: true, message: '请选择' }]}><DatePicker style={{ width: '100%' }} disabledDate={(d) => d ? d.valueOf() < new Date().setHours(0,0,0,0) : false} /></Form.Item></Grid.Col>
          </Grid.Row>
          <Form.Item label={<span>驾驶证上传 <span style={{ color: '#F53F3F' }}>*</span></span>}>
            <Upload
              listType="picture-card"
              accept="image/*"
              fileList={addLicenseImages.map((url, i) => ({ uid: String(i), url, name: `license-${i}` }))}
              customRequest={(option) => {
                const f = option.file as File;
                if (f.size > 5 * 1024 * 1024) { Message.error('单张照片不能超过 5MB'); return; }
                const reader = new FileReader();
                reader.onload = () => setAddLicenseImages(prev => [...prev, reader.result as string]);
                reader.readAsDataURL(f);
              }}
              onRemove={(file) => { setAddLicenseImages(prev => prev.filter((_, i) => String(i) !== file.uid)); return true; }}
            >
              <div style={{ color: '#86909c' }}>+ 上传</div>
            </Upload>
            <div style={{ fontSize: 12, color: '#86909c', marginTop: 4 }}>正副本各一张，单张 ≤ 5MB（必填）</div>
          </Form.Item>
          <Form.Item label="出生日期" field="birthDate"><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="备注" field="remark"><Input.TextArea maxLength={200} showWordLimit rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Edit Driver Modal */}
      <Modal title="编辑司机" visible={editMode} onOk={handleEditSave} onCancel={() => setEditMode(false)} style={{ width: 580 }}>
        {selectedDriver && (
          <Form form={editForm} initialValues={selectedDriver} layout="vertical">
            <Grid.Row gutter={16}><Grid.Col span={12}><Form.Item label="姓名" field="name" rules={[{ required: true, message: '请输入姓名' }, { maxLength: 20 }]}><Input /></Form.Item></Grid.Col>
            <Grid.Col span={12}><Form.Item label="手机号" field="phone" rules={[{ required: true, message: '请输入手机号' }, { match: PHONE_REGEX, message: '请输入正确的手机号' }]}><Input maxLength={11} /></Form.Item></Grid.Col></Grid.Row>
            <Grid.Row gutter={16}><Grid.Col span={12}><Form.Item label="身份证号" field="idCard" rules={[{ required: true, message: '请输入身份证号' }, { match: ID_CARD_REGEX, message: '请输入18位身份证号' }]}><Input maxLength={18} /></Form.Item></Grid.Col>
            <Grid.Col span={12}><Form.Item label="性别" field="gender"><Select options={[{ label: '男', value: 'male' }, { label: '女', value: 'female' }]} /></Form.Item></Grid.Col></Grid.Row>
            <Grid.Row gutter={16}><Grid.Col span={12}><Form.Item label="驾驶证类型" field="licenseType" rules={[{ required: true }]}><Select options={licenseTypes.map(t => ({ label: t, value: t }))} /></Form.Item></Grid.Col>
            <Grid.Col span={12}><Form.Item label="驾驶证有效期" field="licenseExpiry" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Grid.Col></Grid.Row>
            <Grid.Row gutter={16}><Grid.Col span={12}><Form.Item label="出生日期" field="birthDate"><DatePicker style={{ width: '100%' }} /></Form.Item></Grid.Col>
            <Grid.Col span={12}><Form.Item label="备注" field="remark"><Input.TextArea maxLength={200} showWordLimit rows={1} /></Form.Item></Grid.Col></Grid.Row>
          </Form>
        )}
      </Modal>

      {/* Disable Modal — C6-10 含文本域备注 */}
      <Modal title="停用司机" visible={disableVisible}
        onOk={handleDisable}
        onCancel={() => { setDisableVisible(false); setDisableReason(''); }}
        okButtonProps={{ disabled: !disableReason.trim() }}
      >
        <p>确定停用司机 <strong>{selectedDriver?.name}</strong> 吗？停用后该司机将不可被派车。</p>
        <Select placeholder="快速选择常见原因" style={{ width: '100%', marginTop: 12 }}
          onChange={v => setDisableReason(v)}
          options={[{ label: '离职', value: '离职' }, { label: '暂时停岗', value: '暂时停岗' }, { label: '其他', value: '其他' }]} />
        <Input.TextArea
          placeholder="详细原因（必填，≤200 字）"
          style={{ marginTop: 12 }}
          value={disableReason}
          onChange={setDisableReason}
          maxLength={200}
          showWordLimit
          rows={3}
        />
      </Modal>

      {/* Enable Modal */}
      <Modal title="重新启用" visible={enableVisible} onOk={handleEnable} onCancel={() => { setEnableVisible(false); setEnableReason(''); }}>
        <p>确定重新启用司机 <strong>{selectedDriver?.name}</strong> 吗？</p>
        <Input.TextArea placeholder="启用原因（必填）" style={{ marginTop: 12 }} value={enableReason} onChange={setEnableReason} maxLength={200} />
      </Modal>
    </div>
  );
}
