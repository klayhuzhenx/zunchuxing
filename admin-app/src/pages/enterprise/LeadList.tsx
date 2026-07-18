import { useState, useMemo } from 'react';
import {
  Card, Table, Tag, Button, Input, Select, Space, Modal,
  Message, Popconfirm, DatePicker, Descriptions, Drawer,
} from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { leads } from '../../data/mock';
import type { Lead, LeadStatus, EnterpriseSource } from '../../types';

const { RangePicker } = DatePicker;

const statusMap: Record<LeadStatus, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'arcoblue' },
  converted: { label: '已转正式客户', color: 'green' },
  invalid: { label: '无效客户', color: 'gray' },
};

const sourceLabels: Record<EnterpriseSource, string> = {
  miniapp: '小程序',
  h5: '鸿蒙应用（H5）',
  backend: '后台添加',
};

export default function LeadList() {
  const [data, setData] = useState<Lead[]>(leads);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[string, string] | []>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [convertVisible, setConvertVisible] = useState(false);
  const [invalidVisible, setInvalidVisible] = useState(false);
  const [invalidReason, setInvalidReason] = useState('');
  const [invalidTarget, setInvalidTarget] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    let result = data;
    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(l =>
        l.name.toLowerCase().includes(kw) ||
        l.contactName.includes(kw) ||
        l.contactPhone.includes(kw)
      );
    }
    if (statusFilter.length > 0) result = result.filter(l => statusFilter.includes(l.status));
    if (sourceFilter.length > 0) result = result.filter(l => sourceFilter.includes(l.source));
    if (dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      const [s, e] = dateRange;
      result = result.filter(l => l.createdAt.split(' ')[0] >= s && l.createdAt.split(' ')[0] <= e);
    }
    return result;
  }, [data, keyword, statusFilter, sourceFilter, dateRange]);

  const openDrawer = (r: Lead) => { setSelectedLead(r); setDrawerVisible(true); };

  const handleConvert = (r: Lead) => {
    setData(data.map(l => l.id === r.id ? {
      ...l, status: 'converted' as LeadStatus,
      convertedEnterpriseId: `E${String(Date.now()).slice(-6)}`,
      convertedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    } : l));
    setConvertVisible(false);
    Message.success('已转为正式客户');
  };

  const handleInvalid = () => {
    if (!invalidTarget || !invalidReason.trim()) {
      Message.warning('请填写无效原因');
      return;
    }
    setData(data.map(l => l.id === invalidTarget.id ? {
      ...l, status: 'invalid' as LeadStatus, invalidReason: invalidReason.trim(),
    } : l));
    setInvalidVisible(false);
    setInvalidReason('');
    setInvalidTarget(null);
    Message.success('已标记为无效');
  };

  const columns = [
    { title: '企业名称', dataIndex: 'name', width: 220, render: (_: string, r: Lead) => <a onClick={() => openDrawer(r)}>{r.name}</a> },
    { title: '联系人', width: 140, render: (_: unknown, r: Lead) => `${r.contactName} ${r.contactPhone}` },
    { title: '统一社会信用代码', dataIndex: 'creditCode', width: 180, render: (v: string) => v || '-' },
    { title: '申请来源', width: 140, render: (_: unknown, r: Lead) => sourceLabels[r.source] },
    { title: '申请时间', dataIndex: 'createdAt', width: 150 },
    {
      title: '线索状态', width: 110, render: (_: unknown, r: Lead) => (
        <Tag color={statusMap[r.status].color} size="small">{statusMap[r.status].label}</Tag>
      ),
    },
    {
      title: '操作', width: 240, fixed: 'right' as const,
      render: (_: unknown, r: Lead) => (
        <Space size={4}>
          <Button type="text" size="small" onClick={() => openDrawer(r)}>详情</Button>
          {r.status === 'pending' && (
            <>
              <Button type="text" size="small" status="success"
                onClick={() => { setSelectedLead(r); setConvertVisible(true); }}>转正式客户</Button>
              <Button type="text" size="small" status="danger"
                onClick={() => { setInvalidTarget(r); setInvalidReason(''); setInvalidVisible(true); }}>标记无效</Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <Input prefix={<IconSearch />} placeholder="企业名称/联系人姓名/手机号" style={{ width: 260 }}
            value={keyword} onChange={setKeyword} allowClear />
          <Select placeholder="线索状态" style={{ width: 200 }} mode="multiple"
            value={statusFilter} onChange={setStatusFilter}
            options={Object.entries(statusMap).map(([k, v]) => ({ label: v.label, value: k }))} />
          <Select placeholder="申请来源" style={{ width: 180 }} mode="multiple"
            value={sourceFilter} onChange={setSourceFilter}
            options={Object.entries(sourceLabels).map(([k, v]) => ({ label: v, value: k }))} />
          <RangePicker style={{ width: 260 }} placeholder={['申请起始', '申请截止']} allowClear
            onChange={(v) => setDateRange(v && v[0] && v[1] ? [v[0], v[1]] : [])} />
        </Space>
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 1300 }}
          pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>

      {/* 详情抽屉 */}
      <Drawer width={480} title="线索详情" visible={drawerVisible} onCancel={() => setDrawerVisible(false)} footer={null}>
        {selectedLead && (
          <Descriptions column={1} size="small" data={[
            { label: '企业名称', value: selectedLead.name },
            { label: '统一社会信用代码', value: selectedLead.creditCode || '-' },
            { label: '联系人', value: selectedLead.contactName },
            { label: '联系电话', value: selectedLead.contactPhone },
            { label: '申请来源', value: sourceLabels[selectedLead.source] },
            { label: '申请时间', value: selectedLead.createdAt },
            { label: '线索状态', value: <Tag color={statusMap[selectedLead.status].color} size="small">{statusMap[selectedLead.status].label}</Tag> },
            ...(selectedLead.invalidReason ? [{ label: '无效原因', value: selectedLead.invalidReason }] : []),
            ...(selectedLead.convertedAt ? [{ label: '转正时间', value: selectedLead.convertedAt }] : []),
          ]} />
        )}
      </Drawer>

      {/* 转正式客户确认 */}
      <Modal title="转正式客户" visible={convertVisible}
        onOk={() => { if (selectedLead) handleConvert(selectedLead); }}
        onCancel={() => setConvertVisible(false)}
        okText="确认转入" style={{ width: 440 }}>
        {selectedLead && (
          <p>确定将 <strong>{selectedLead.name}</strong> 转为正式客户吗？转入后申请人将自动成为企业管理员。</p>
        )}
      </Modal>

      {/* 标记无效 */}
      <Modal title="标记无效" visible={invalidVisible}
        onOk={handleInvalid}
        onCancel={() => { setInvalidVisible(false); setInvalidReason(''); }}
        okText="确认" style={{ width: 440 }}>
        <p style={{ marginBottom: 12 }}>请填写无效原因：</p>
        <Input.TextArea value={invalidReason} onChange={setInvalidReason}
          placeholder="如「电话无法接通」「企业无意向」" maxLength={200} rows={3} />
      </Modal>
    </div>
  );
}
