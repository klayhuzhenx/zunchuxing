import { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Input, Select, Space,
  Modal, Message, Form, Grid, DatePicker, Timeline, Image, Upload, Popconfirm,
} from '@arco-design/web-react';
import { IconSearch, IconPlus, IconDownload } from '@arco-design/web-react/icon';
import { drivers, vehicles, driverOrders, opsCities } from '../../data/mock';
import type { Driver, DriverStatus } from '../../types';

const { RangePicker } = DatePicker;

const statusMap: Record<DriverStatus, { label: string; color: string }> = {
  active: { label: '启用中', color: 'green' },
  decommissioned: { label: '已停用', color: 'red' },
};

const licenseTypes = ['C1', 'C2', 'B1', 'B2', 'A1', 'A2'];

// 校验：身份证 18 位（含 X）
const ID_CARD_REGEX = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
const PHONE_REGEX = /^1[3-9]\d{9}$/;

export default function DriverList() {
  const [data, setData] = useState<Driver[]>(drivers);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [areaFilter, setAreaFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [detailDriver, setDetailDriver] = useState<Driver | null>(null);
  const [addVisible, setAddVisible] = useState(false);
  const [disableVisible, setDisableVisible] = useState(false);
  const [enableVisible, setEnableVisible] = useState(false);
  // 驾驶证多张上传（base64 列表）
  const [addLicenseImages, setAddLicenseImages] = useState<string[]>([]);
  // 详情页管理车辆
  // 服务记录月份切换
  const [serviceMonth, setServiceMonth] = useState<string>('all');
  // 驾驶证图片预览
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const filtered = useMemo(() => {
    let result = data;
    if (statusFilter.length > 0) result = result.filter(d => statusFilter.includes(d.status));
    if (areaFilter.length > 0) result = result.filter(d => (d.areaIds || []).some(a => areaFilter.includes(a)));
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
  }, [data, keyword, statusFilter, areaFilter, dateRange]);

  const openEdit = (d: Driver) => { setEditingDriver(d); setDetailDriver(null); addForm.setFieldsValue(d); setAddVisible(true); };
  const openDetail = (d: Driver) => { setDetailDriver(d); setEditingDriver(null); addForm.setFieldsValue(d); setAddLicenseImages(d.licenseImages || (d.licenseImage ? [d.licenseImage] : [])); setAddVisible(true); };
  const openAdd = () => { setEditingDriver(null); setDetailDriver(null); addForm.resetFields(); setAddLicenseImages([]); setAddVisible(true); };

  const handleSave = () => {
    addForm.validate().then(values => {
      if (editingDriver) {
        setData(data.map(d => d.id === editingDriver.id ? { ...d, ...values } : d));
        setAddVisible(false); setEditingDriver(null); addForm.resetFields(); setAddLicenseImages([]);
        Message.success('修改成功');
      } else {
        if (data.some(d => d.phone === values.phone)) { Message.error('该手机号已被其他司机使用'); return; }
        if (addLicenseImages.length === 0) { Message.error('请上传驾驶证照片'); return; }
        const today = new Date().toISOString().slice(0, 10);
        if (values.licenseExpiry && values.licenseExpiry < today) { Message.error('驾驶证有效期不能早于当前日期'); return; }
        const newDriver: Driver = {
          id: `DRV${Date.now()}`, code: `DRV2026${String(data.length + 1).padStart(4, '0')}`,
          name: values.name, phone: values.phone,
          idCard: values.idCard, licenseType: values.licenseType,
          licenseExpiry: values.licenseExpiry, gender: values.gender, birthDate: values.birthDate,
          licenseImages: addLicenseImages, licenseImage: addLicenseImages[0],
          remark: values.remark, serviceCount: 0, serviceHours: 0, rating: 0, onTimeRate: 0, goodReviewRate: 0,
          status: 'active', createdAt: new Date().toISOString().split('T')[0],
        };
        setData([newDriver, ...data]);
        setAddVisible(false); setEditingDriver(null); addForm.resetFields(); setAddLicenseImages([]);
        Message.success('司机添加成功');
      }
    }).catch(() => Message.warning('请完善必填信息'));
  };

  const handleDisable = () => {
    if (!selectedDriver) return;
    // 停用前校验：无待开始/进行中/待结算订单
    const blockingOrders = driverOrders.filter(o => o.driverName === selectedDriver.name
      && ['not_started', 'in_progress', 'pending_settlement'].includes(o.status));
    if (blockingOrders.length > 0) {
      Message.error(`该司机有 ${blockingOrders.length} 笔待开始/进行中/待结算订单，无法停用`);
      return;
    }
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const record = { type: 'disable' as const, reason: '', operator: '当前运营', time: now };
    setData(data.map(d => d.id === selectedDriver.id ? {
      ...d, status: 'decommissioned' as DriverStatus,
      statusChangeRecords: [...(d.statusChangeRecords || []), record],
    } : d));
    setDisableVisible(false); Message.success('司机已停用');
  };

  const handleEnable = () => {
    if (!selectedDriver) return;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const record = { type: 'enable' as const, reason: '', operator: '当前运营', time: now };
    setData(data.map(d => d.id === selectedDriver.id ? {
      ...d, status: 'active' as DriverStatus,
      statusChangeRecords: [...(d.statusChangeRecords || []), record],
    } : d));
    setEnableVisible(false); Message.success('司机已启用');
  };

  const columns = [
    { title: '司机编号', dataIndex: 'code', width: 130 },
    { title: '姓名', dataIndex: 'name', width: 90, render: (v: string, r: Driver) => <a onClick={() => openEdit(r)}>{v}</a> },
    { title: '手机号', dataIndex: 'phone', width: 130, render: (v: string) => v.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') },
    { title: '驾驶证类型', dataIndex: 'licenseType', width: 100 },
    { title: '运营区域', width: 140, render: (_: unknown, r: Driver) => {
      const ids = r.areaIds || [];
      if (ids.length === 0) return <span style={{ color: '#86909c' }}>未选择</span>;
      const names = ids.map(id => opsCities.find(c => c.id === id)?.name).filter(Boolean);
      return names.length > 2 ? <span>{names.slice(0, 2).join('、')} 等{names.length}个</span> : <span>{names.join('、') || '—'}</span>;
    }},
    { title: '状态', dataIndex: 'status', width: 70, render: (v: DriverStatus) => <Tag color={statusMap[v].color} size="small">{statusMap[v].label}</Tag> },
    { title: '入驻时间', dataIndex: 'createdAt', width: 110 },
    { title: '操作', width: 270, fixed: 'right' as const, render: (_: unknown, r: Driver) => (
      <Space size={4}>
        <Button type="text" size="small" onClick={() => openDetail(r)}>详情</Button>
        <Button type="text" size="small" onClick={() => openEdit(r)}>编辑</Button>
        {r.status === 'active'
          ? <Button type="text" size="small" status="danger" onClick={() => { setSelectedDriver(r); setDisableVisible(true); }}>停用</Button>
          : <Button type="text" size="small" status="success" onClick={() => { setSelectedDriver(r); setEnableVisible(true); }}>启用</Button>}
      </Space>
    )},
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <Input prefix={<IconSearch />} placeholder="姓名/手机号/驾驶证号" style={{ width: 240 }} value={keyword} onChange={setKeyword} allowClear />
          <Select placeholder="司机状态" style={{ width: 160 }} mode="multiple" value={statusFilter} onChange={setStatusFilter}
            options={[{ label: '启用中', value: 'active' }, { label: '已停用', value: 'decommissioned' }]} />
          <Select placeholder="运营区域" style={{ width: 200 }} mode="multiple" value={areaFilter.length === 0 ? ['__all__'] : areaFilter}
            onChange={(vals) => {
              if (vals.includes('__all__')) { setAreaFilter([]); return; }
              setAreaFilter(vals);
            }}
            options={[
              { label: '全部', value: '__all__' },
              ...opsCities.filter(c => c.status === 'active').map(c => ({ label: c.name, value: c.id })),
            ]} />
          <RangePicker style={{ width: 260 }} placeholder={['入驻时间起', '入驻时间止']}
            onChange={(_, ds) => setDateRange(ds && ds[0] && ds[1] ? ds as [string, string] : null)} />
          <div style={{ flex: 1 }} />
          <Button icon={<IconDownload />}>导出</Button>
          <Button type="primary" icon={<IconPlus />} onClick={openAdd}>新增司机</Button>
        </Space>
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 1600 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>

      {/* Add / Edit / Detail Modal */}
      <Modal title={detailDriver ? '司机详情' : editingDriver ? '编辑司机' : '新增司机'} visible={addVisible}
        onOk={detailDriver ? undefined : handleSave}
        onCancel={() => { setAddVisible(false); setEditingDriver(null); setDetailDriver(null); addForm.resetFields(); setAddLicenseImages([]); }}
        okButtonProps={detailDriver ? { style: { display: 'none' } } : undefined}
        cancelText={detailDriver ? '关闭' : '取消'}
        style={{ width: 580 }}>
        <Form form={addForm} layout="vertical">
          <fieldset disabled={!!detailDriver} style={{ border: 'none', padding: 0, margin: 0 }}>
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
          <Form.Item label="运营区域" field="areaIds">
            <Select mode="multiple" placeholder="选择运营区域（可多选）"
              onChange={(vals) => {
                if (vals.includes('__all__')) {
                  addForm.setFieldValue('areaIds', opsCities.filter(c => c.status === 'active').map(c => c.id));
                  return;
                }
              }}
              options={[
                { label: '全部', value: '__all__' },
                ...opsCities.filter(c => c.status === 'active').map(c => ({ label: c.name, value: c.id })),
              ]} />
          </Form.Item>
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
          </fieldset>
          <Form.Item label="备注" field="remark"><Input.TextArea maxLength={200} showWordLimit rows={2} disabled={!!detailDriver} /></Form.Item>
        </Form>
      </Modal>

      {/* Disable Modal — C6-10 含文本域备注 */}
      <Modal title="停用司机" visible={disableVisible}
        onOk={handleDisable}
        onCancel={() => { setDisableVisible(false); }}
      >
        <p>确定停用司机 <strong>{selectedDriver?.name}</strong> 吗？停用后该司机将不可被派车。</p>
      </Modal>

      {/* Enable Modal */}
      <Modal title="重新启用" visible={enableVisible} onOk={handleEnable} onCancel={() => { setEnableVisible(false); }}>
        <p>确定重新启用司机 <strong>{selectedDriver?.name}</strong> 吗？</p>
      </Modal>
    </div>
  );
}
