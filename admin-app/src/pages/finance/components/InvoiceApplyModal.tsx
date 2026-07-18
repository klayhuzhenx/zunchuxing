import { useState, useMemo } from 'react';
import {
  Modal, Steps, Radio, Form, Input, Select, Table, Button, Message, Descriptions, Tag, Space, Grid,
} from '@arco-design/web-react';
import { orders, enterprises, currentUser } from '../../../data/mock';
import { invoices as invoiceData } from '../../../data/mock';
import type { Invoice, InvoiceSubject, InvoiceType, Order } from '../../../types';

const { Step } = Steps;
const { Row, Col } = Grid;

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (invoice: Invoice) => void;
  /** 重新申请时预填数据 */
  prefill?: Partial<Invoice> | null;
}

// personal 用户列表（从已完成个人支付订单里提取）
function getPersonalUsers(): { name: string; phone: string }[] {
  const seen = new Set<string>();
  const users: { name: string; phone: string }[] = [];
  orders.filter(o => o.status === 'completed' && o.paymentMethod !== 'enterprise_credit').forEach(o => {
    const key = `${o.passengerName}|${o.passengerPhone}`;
    if (!seen.has(key)) { seen.add(key); users.push({ name: o.passengerName, phone: o.passengerPhone }); }
  });
  return users;
}

export default function InvoiceApplyModal({ visible, onClose, onSubmit, prefill }: Props) {
  const personalUsers = useMemo(getPersonalUsers, []);

  const [step, setStep] = useState(1);
  const [subject, setSubject] = useState<InvoiceSubject>(prefill?.subject || 'enterprise');
  const [enterpriseId, setEnterpriseId] = useState<string>(prefill?.enterpriseId || '');
  const [selectedUserPhone, setSelectedUserPhone] = useState<string>(prefill?.applicantPhone || '');
  const [selectedUserName, setSelectedUserName] = useState<string>(prefill?.applicantName || '');
  const [selectedOrders, setSelectedOrders] = useState<string[]>(prefill?.orderNos || []);
  const [invoiceType, setInvoiceType] = useState<InvoiceType>(prefill?.invoiceType || 'general');
  const [title, setTitle] = useState(prefill?.title || '');
  const [taxNo, setTaxNo] = useState(prefill?.taxNo || '');
  const [companyAddress, setCompanyAddress] = useState(prefill?.companyAddress || '');
  const [bankName, setBankName] = useState(prefill?.bankName || '');
  const [bankAccount, setBankAccount] = useState(prefill?.bankAccount || '');
  const [companyPhone, setCompanyPhone] = useState(prefill?.companyPhone || '');
  const [remark, setRemark] = useState(prefill?.remark || '');

  // 已被有效发票占用的订单号
  const lockedOrderNos = useMemo(() => {
    const set = new Set<string>();
    invoiceData.filter(i => i.status !== 'cancelled').forEach(i => i.orderNos.forEach(o => set.add(o)));
    return set;
  }, []);

  // 可用订单
  const availableOrders = useMemo(() => {
    let list = orders.filter(o => o.status === 'completed' && !lockedOrderNos.has(o.orderNo));
    if (subject === 'enterprise') {
      const ent = enterprises.find(e => e.id === enterpriseId);
      list = list.filter(o => o.paymentMethod === 'enterprise_credit' && o.enterpriseName === ent?.name);
    } else {
      list = list.filter(o => o.passengerPhone === selectedUserPhone && o.paymentMethod !== 'enterprise_credit');
    }
    return list;
  }, [subject, enterpriseId, selectedUserPhone, lockedOrderNos]);

  const selectedOrderList = useMemo(() =>
    orders.filter(o => selectedOrders.includes(o.orderNo)), [selectedOrders]);

  const totalAmount = useMemo(() =>
    selectedOrderList.reduce((s, o) => s + o.paidAmount, 0), [selectedOrderList]);

  const reset = () => {
    setStep(1); setSubject(prefill?.subject || 'enterprise'); setEnterpriseId(prefill?.enterpriseId || '');
    setSelectedUserPhone(prefill?.applicantPhone || ''); setSelectedUserName(prefill?.applicantName || '');
    setSelectedOrders(prefill?.orderNos || []);
    setInvoiceType(prefill?.invoiceType || 'general'); setTitle(prefill?.title || '');
    setTaxNo(prefill?.taxNo || ''); setCompanyAddress(prefill?.companyAddress || '');
    setBankName(prefill?.bankName || ''); setBankAccount(prefill?.bankAccount || '');
    setCompanyPhone(prefill?.companyPhone || ''); setRemark(prefill?.remark || '');
  };

  const handleNext = () => {
    if (step === 1) {
      if (subject === 'enterprise' && !enterpriseId) { Message.warning('请选择企业'); return; }
      if (subject === 'personal' && !selectedUserPhone) { Message.warning('请选择用户'); return; }
    }
    if (step === 2 && selectedOrders.length === 0) { Message.warning('请至少选择一笔订单'); return; }
    if (step === 3) {
      if (!title.trim()) { Message.warning('请填写发票抬头'); return; }
      if (subject === 'enterprise' && !taxNo) {
        Message.warning('请填写纳税人识别号'); return;
      }
      if (invoiceType === 'special') {
        if (!companyAddress || !bankName || !bankAccount || !companyPhone) {
          Message.warning('专用发票请填写完整开票信息'); return;
        }
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = () => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const ent = enterprises.find(e => e.id === enterpriseId);
    const newInvoice: Invoice = {
      id: `IV${Date.now()}`,
      applyNo: `FP${now.slice(0, 10).replace(/-/g, '')}-${String(invoiceData.length + 1).padStart(4, '0')}`,
      channel: 'ops_backend',
      applicantName: currentUser.name,
      applicantPhone: currentUser.phone,
      enterpriseId: subject === 'enterprise' ? enterpriseId : undefined,
      enterpriseName: subject === 'enterprise' ? ent?.name : undefined,
      subject, invoiceType, title, remark,
      ...(subject === 'enterprise' ? { taxNo } : {}),
      ...(invoiceType === 'special' ? { companyAddress, bankName, bankAccount, companyPhone } : {}),
      orderNos: selectedOrders,
      amount: totalAmount,
      applyTime: now,
      status: 'issuing',
      operationLogs: [{ time: now, action: '提交开票申请', operator: currentUser.name, remark: `关联 ${selectedOrders.length} 笔订单` }],
    };
    onSubmit(newInvoice);
    reset();
  };

  const orderColumns = [
    { title: '', width: 40, render: (_: unknown, o: Order) => (
      <input type="checkbox" checked={selectedOrders.includes(o.orderNo)} onChange={e => {
        if (e.target.checked) setSelectedOrders([...selectedOrders, o.orderNo]);
        else setSelectedOrders(selectedOrders.filter(n => n !== o.orderNo));
      }} />
    )},
    { title: '订单号', dataIndex: 'orderNo', width: 160 },
    { title: '类型', width: 80, render: (_: unknown, o: Order) => <Tag color={o.type === 'charter' ? 'arcoblue' : 'purple'} size="small">{o.type === 'charter' ? '包车' : '租车'}</Tag> },
    { title: '完成时间', width: 110, render: (_: unknown, o: Order) => o.endTime?.split(' ')[0] || o.createdAt.split(' ')[0] },
    { title: '订单金额', width: 110, render: (_: unknown, o: Order) => `¥${o.paidAmount.toLocaleString()}` },
    { title: '支付方式', width: 120, render: (_: unknown, o: Order) => o.paymentMethod === 'enterprise_credit' ? '企业额度支付' : o.paymentMethod === 'alipay' ? '支付宝' : '微信' },
  ];

  return (
    <Modal title="申请开票" visible={visible} style={{ width: 720 }}
      onCancel={() => { reset(); onClose(); }}
      footer={step < 4 ? (
        <Space>
          <Button onClick={() => { reset(); onClose(); }}>取消</Button>
          {step > 1 && <Button onClick={() => setStep(step - 1)}>上一步</Button>}
          <Button type="primary" onClick={handleNext}>下一步</Button>
        </Space>
      ) : (
        <Space>
          <Button onClick={() => setStep(3)}>上一步</Button>
          <Button type="primary" onClick={handleSubmit}>提交申请</Button>
        </Space>
      )}>
      <Steps current={step - 1} style={{ marginBottom: 24 }} type="arrow">
        <Step title="选择主体" />
        <Step title="选择订单" />
        <Step title="发票信息" />
        <Step title="确认提交" />
      </Steps>

      {step === 1 && (
        <Form layout="vertical">
          <Form.Item label="申请属性" required>
            <Radio.Group value={subject} onChange={v => { setSubject(v as InvoiceSubject); setEnterpriseId(''); setSelectedUserPhone(''); }}>
              <Radio value="enterprise">企业</Radio>
              <Radio value="personal">个人</Radio>
            </Radio.Group>
          </Form.Item>
          {subject === 'enterprise' ? (
            <Form.Item label="选择企业" required>
              <Select placeholder="搜索企业名称" showSearch value={enterpriseId || undefined} onChange={setEnterpriseId}
                options={enterprises.map(e => ({ label: e.name, value: e.id }))} />
            </Form.Item>
          ) : (
            <Form.Item label="选择用户" required>
              <Select placeholder="搜索用户姓名/手机号" showSearch value={selectedUserPhone || undefined}
                onChange={(val) => {
                  const u = personalUsers.find(x => x.phone === val);
                  setSelectedUserPhone(val); setSelectedUserName(u?.name || '');
                }}
                filterOption={(inputValue, option) => {
                  const u = personalUsers.find(x => x.phone === option.props.value);
                  return !!(u && (u.name.includes(inputValue) || u.phone.includes(inputValue)));
                }}
                options={personalUsers.map(u => ({ label: `${u.name} ${u.phone}`, value: u.phone }))} />
            </Form.Item>
          )}
        </Form>
      )}

      {step === 2 && (
        <div>
          <div style={{ marginBottom: 8, color: '#86909c', fontSize: 13 }}>
            仅展示已完成且未被锁定的{subject === 'enterprise' ? '企业额度支付' : '个人支付'}订单
          </div>
          <Table columns={orderColumns} data={availableOrders} rowKey="orderNo" pagination={false} size="small" scroll={{ y: 300 }} />
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            已选 {selectedOrders.length} 笔 · 开票金额 <span style={{ fontWeight: 700, color: '#F53F3F' }}>¥{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      )}

      {step === 3 && (
        <Form layout="vertical">
          <Form.Item label="开票类型" required>
            <Radio.Group value={invoiceType} onChange={v => setInvoiceType(v as InvoiceType)}>
              <Radio value="general">普通发票</Radio>
              <Radio value="special">专用发票</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="发票抬头" required>
            <Input value={title} onChange={setTitle} placeholder={subject === 'enterprise' ? '企业全称' : subject === 'personal' && selectedUserName ? selectedUserName : '发票抬头'} />
          </Form.Item>
          {subject === 'enterprise' && (
            <Form.Item label="纳税人识别号" required><Input value={taxNo} onChange={setTaxNo} /></Form.Item>
          )}
          {invoiceType === 'special' && (
            <>
              <Row gutter={16}>
                <Col span={12}><Form.Item label="企业电话" required><Input value={companyPhone} onChange={setCompanyPhone} /></Form.Item></Col>
                <Col span={12}><Form.Item label="开户行" required><Input value={bankName} onChange={setBankName} /></Form.Item></Col>
              </Row>
              <Form.Item label="地址" required><Input value={companyAddress} onChange={setCompanyAddress} /></Form.Item>
              <Form.Item label="银行账户" required><Input value={bankAccount} onChange={setBankAccount} /></Form.Item>
            </>
          )}
          <Form.Item label="备注"><Input.TextArea value={remark} onChange={setRemark} maxLength={200} showWordLimit rows={2} /></Form.Item>
        </Form>
      )}

      {step === 4 && (
        <Descriptions column={1} size="small" data={[
          { label: '申请属性', value: subject === 'enterprise' ? `企业 · ${enterprises.find(e => e.id === enterpriseId)?.name || ''}` : `个人 · ${selectedUserName} ${selectedUserPhone}` },
          { label: '开票类型', value: invoiceType === 'general' ? '普通发票' : '专用发票' },
          { label: '发票抬头', value: title },
          { label: '关联订单', value: `${selectedOrders.length} 笔：${selectedOrders.join('、')}` },
          { label: '开票金额', value: <span style={{ color: '#F53F3F', fontWeight: 700 }}>¥{totalAmount.toLocaleString()}</span> },
        ]} />
      )}
    </Modal>
  );
}
