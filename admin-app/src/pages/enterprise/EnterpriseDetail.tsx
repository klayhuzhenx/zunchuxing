import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Tag, Button, Space, Table, Tabs, Typography, Modal, Form,
  Input, Message, Popconfirm, DatePicker, Empty, Statistic, Grid,
} from '@arco-design/web-react';
import { IconLeft, IconEdit } from '@arco-design/web-react/icon';
import { useState, useMemo } from 'react';
import { enterprises, quotaChanges, consumptionRecords } from '../../data/mock';
import type { Enterprise, EnterpriseStatus } from '../../types';

const { Title, Text } = Typography;
const { Row, Col } = Grid;
const { RangePicker } = DatePicker;

const statusMap: Record<EnterpriseStatus, { label: string; color: string }> = {
  pending: { label: '待审核', color: 'orangered' },
  approved: { label: '已通过', color: 'green' },
  rejected: { label: '已驳回', color: 'gray' },
  disabled: { label: '已禁用', color: 'red' },
};

export default function EnterpriseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const enterprise = enterprises.find(e => e.id === id);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm] = Form.useForm();
  const [showReject, setShowReject] = useState(false);
  const [rejectForm] = Form.useForm();
  const [showDisable, setShowDisable] = useState(false);
  const [disableForm] = Form.useForm();
  // 消费记录日期筛选：默认当月
  const now = new Date();
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(now.getFullYear(), now.getMonth(), 1),
    new Date(now.getFullYear(), now.getMonth() + 1, 0),
  ]);

  if (!enterprise) {
    return (
      <Card>
        <Empty description="企业不存在" />
        <Button type="primary" onClick={() => navigate('/enterprise')} style={{ marginTop: 16 }}>返回列表</Button>
      </Card>
    );
  }

  const relatedChanges = quotaChanges.filter(q => q.enterpriseId === enterprise.id);

  // 消费记录按日期筛选
  const filteredConsumptions = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return consumptionRecords;
    const [start, end] = dateRange;
    return consumptionRecords.filter(r => {
      const d = new Date(r.createdAt.split(' ')[0]);
      return d >= start && d <= end;
    });
  }, [dateRange]);

  const consumptionTotal = filteredConsumptions.reduce((s, r) => s + (r.type === 'consume' ? r.amount : 0), 0);
  const refundTotal = filteredConsumptions.reduce((s, r) => s + (r.type === 'refund' ? r.amount : 0), 0);

  const handleApprove = () => {
    enterprise.status = 'approved';
    Message.success('审核通过');
  };

  const handleReject = async () => {
    try {
      const values = await rejectForm.validate();
      enterprise.status = 'rejected';
      enterprise.rejectReason = values.reason;
      setShowReject(false);
      Message.success('已驳回');
    } catch { /* */ }
  };

  const handleEdit = async () => {
    try {
      await editForm.validate();
      setShowEdit(false);
      Message.success('信息已更新');
    } catch { /* */ }
  };

  const handleDisable = async () => {
    try {
      await disableForm.validate();
      enterprise.status = 'disabled';
      setShowDisable(false);
      Message.success('企业已禁用');
    } catch { /* */ }
  };

  const handleEnable = () => {
    enterprise.status = 'approved';
    Message.success('企业已启用');
  };

  return (
    <div>
      {/* 顶部标题栏 */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Space>
          <Button type="text" icon={<IconLeft />} onClick={() => navigate('/enterprise')}>返回列表</Button>
          <Title heading={4} style={{ margin: 0 }}>{enterprise.name}</Title>
          <Tag color={statusMap[enterprise.status].color}>{statusMap[enterprise.status].label}</Tag>
          <Text type="secondary" style={{ fontSize: 13 }}>{enterprise.code}</Text>
        </Space>
        <Space>
          {enterprise.status === 'pending' && (
            <>
              <Button type="primary" status="success" onClick={handleApprove}>通过</Button>
              <Button status="danger" onClick={() => setShowReject(true)}>驳回</Button>
            </>
          )}
          {enterprise.status === 'approved' && (
            <>
              <Button icon={<IconEdit />} onClick={() => { editForm.setFieldsValue(enterprise); setShowEdit(true); }}>编辑</Button>
              <Button status="danger" onClick={() => setShowDisable(true)}>禁用</Button>
            </>
          )}
          {enterprise.status === 'disabled' && (
            <Button type="primary" status="success" onClick={handleEnable}>启用</Button>
          )}
          {enterprise.status === 'rejected' && (
            <Button onClick={() => { enterprise.status = 'pending'; Message.success('已重新进入审核'); }}>重新审核</Button>
          )}
        </Space>
      </div>

      {/* === 额度概览卡片（Tab 下方突出展示） === */}
      <Card style={{ marginBottom: 16 }} bodyStyle={{ padding: '20px 24px' }}>
        <Text type="secondary" style={{ fontSize: 12, marginBottom: 12, display: 'block' }}>额度概览</Text>
        <Row gutter={24}>
          <Col span={8}>
            <Statistic title="总额度" value={`¥${enterprise.totalQuota.toLocaleString()}`} />
          </Col>
          <Col span={8}>
            <Statistic title="已使用" value={`¥${enterprise.usedAmount.toLocaleString()}`}
              styleValue={{ color: '#F53F3F' }} />
          </Col>
          <Col span={8}>
            <Statistic title="剩余额度" value={`¥${enterprise.remainingQuota.toLocaleString()}`}
              styleValue={{ color: enterprise.remainingQuota < 2000 ? '#F53F3F' : '#00B42A' }} />
          </Col>
        </Row>
      </Card>

      {/* Tab 内容 */}
      <Tabs defaultActiveTab="basic">
        <Tabs.TabPane key="basic" title="基本信息">
          <Card>
            <Descriptions
              column={2}
              data={[
                { label: '企业名称', value: enterprise.name },
                { label: '企业编号', value: enterprise.code },
                { label: '统一社会信用代码', value: enterprise.creditCode || '-' },
                { label: '联系人', value: `${enterprise.contactName} / ${enterprise.contactPhone}` },
                { label: '管理员', value: enterprise.adminName ? `${enterprise.adminName} / ${enterprise.adminPhone}` : '-' },
                { label: '员工数', value: String(enterprise.employeeCount) },
                { label: '创建来源', value: enterprise.source === 'miniapp' ? '小程序申请' : '后台添加' },
                { label: '注册时间', value: enterprise.createdAt },
                { label: '备注', value: enterprise.remark || '-' },
                ...(enterprise.rejectReason ? [{ label: '驳回原因', value: <span style={{ color: '#F53F3F' }}>{enterprise.rejectReason}</span> }] : []),
              ]}
            />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane key="consumption" title="消费记录">
          <Card>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text style={{ fontSize: 14, fontWeight: 500 }}>
                  当前范围消费 <span style={{ color: '#F53F3F' }}>¥{consumptionTotal.toLocaleString()}</span>
                  {refundTotal > 0 && <>，退款 <span style={{ color: '#00B42A' }}>¥{refundTotal.toLocaleString()}</span></>}
                </Text>
              </div>
              <Space>
                <RangePicker
                  value={dateRange}
                  onChange={(v) => { if (v && v[0] && v[1]) setDateRange([v[0].toDate(), v[1].toDate()]); }}
                  style={{ width: 260 }}
                />
                <Button size="small">导出</Button>
              </Space>
            </div>
            <Table
              columns={[
                { title: '时间', dataIndex: 'createdAt', width: 150 },
                {
                  title: '类型', dataIndex: 'type', width: 80,
                  render: (v: string) => <Tag color={v === 'consume' ? 'red' : 'green'} size="small">{v === 'consume' ? '消费' : '退款'}</Tag>,
                },
                { title: '金额', width: 100, render: (_: unknown, r: { amount: number }) => `¥${r.amount.toLocaleString()}` },
                { title: '关联订单', dataIndex: 'orderNo', width: 160, render: (v: string) => <a style={{ cursor: 'pointer' }}>{v}</a> },
                { title: '操作员工', dataIndex: 'employeeName', width: 100 },
                { title: '出行场景', dataIndex: 'scene', width: 100, render: (v: string) => v === 'charter' ? '包车出行' : '租车出行' },
              ]}
              data={filteredConsumptions}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              stripe
            />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane key="quota" title="额度变动记录">
          <Card>
            <Table
              columns={[
                { title: '类型', dataIndex: 'type', width: 80, render: (v: string) => <Tag color={v === 'increase' ? 'green' : 'red'} size="small">{v === 'increase' ? '调增' : '调减'}</Tag> },
                { title: '金额', width: 120, render: (_: unknown, r: { amount: number }) => `¥${r.amount.toLocaleString()}` },
                { title: '原因', dataIndex: 'reason', width: 200 },
                { title: '操作员', dataIndex: 'operator', width: 100 },
                { title: '时间', dataIndex: 'createdAt', width: 160 },
              ]}
              data={relatedChanges}
              rowKey="id"
              pagination={false}
              stripe
            />
          </Card>
        </Tabs.TabPane>
      </Tabs>

      {/* 编辑弹窗 */}
      <Modal title="编辑企业信息" visible={showEdit} onOk={handleEdit}
        onCancel={() => setShowEdit(false)} style={{ width: 520 }}>
        <Form form={editForm} layout="vertical">
          <Form.Item field="name" label="企业名称"><Input /></Form.Item>
          <Form.Item field="contactName" label="联系人姓名"><Input /></Form.Item>
          <Form.Item field="contactPhone" label="联系人手机号"><Input /></Form.Item>
          <Form.Item field="remark" label="备注"><Input.TextArea /></Form.Item>
        </Form>
      </Modal>

      {/* 驳回弹窗 */}
      <Modal title="驳回原因" visible={showReject} onOk={handleReject}
        onCancel={() => setShowReject(false)}>
        <Form form={rejectForm} layout="vertical">
          <Form.Item field="reason" label="驳回原因" rules={[{ required: true, message: '请填写驳回原因' }, { maxLength: 200 }]}>
            <Input.TextArea placeholder="请输入驳回原因" maxLength={200} showWordLimit />
          </Form.Item>
        </Form>
      </Modal>

      {/* 禁用弹窗 */}
      <Modal title="禁用企业" visible={showDisable} onOk={handleDisable}
        onCancel={() => setShowDisable(false)}>
        <Form form={disableForm} layout="vertical">
          <Form.Item field="reason" label="禁用原因" rules={[{ required: true, message: '请填写禁用原因' }, { maxLength: 200 }]}>
            <Input.TextArea placeholder="请输入禁用原因" maxLength={200} showWordLimit />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
