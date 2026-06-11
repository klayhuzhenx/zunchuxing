import { useState } from 'react';
import { Card, Form, Input, Button, Message, Typography } from '@arco-design/web-react';
import { mockEnterprise } from '../../data/mock';

const { Title } = Typography;

export default function EnterpriseInfoPage() {
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  const startEdit = () => {
    form.setFieldsValue(mockEnterprise);
    setEditing(true);
  };

  const handleSave = (values: typeof mockEnterprise) => {
    setEditing(false);
    Message.success('企业信息已更新');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title heading={5} style={{ margin: 0 }}>企业信息</Title>
        {!editing ? (
          <Button onClick={startEdit} style={{ background: '#000', borderColor: '#000', color: '#fff' }}>编辑</Button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={() => setEditing(false)}>取消</Button>
            <Button type="primary" style={{ background: '#000', borderColor: '#000' }} onClick={() => form.submit()}>保存</Button>
          </div>
        )}
      </div>

      <Card>
        <Form form={form} layout="vertical" style={{ maxWidth: 520 }} onSubmit={handleSave}>
          <Form.Item label="企业名称" field="name" rules={[{ required: true, message: '企业名称不能为空' }]}>
            {editing ? <Input placeholder="企业名称" maxLength={50} /> : <span>{mockEnterprise.name}</span>}
          </Form.Item>
          {/* E8-01：信用代码正确正则（含字母） */}
          <Form.Item label="统一社会信用代码" field="creditCode" rules={[
            { required: true, message: '请输入统一社会信用代码' },
            { match: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/, message: '请输入18位统一社会信用代码' },
          ]}>
            {editing ? <Input placeholder="18位" maxLength={18} /> : <span>{mockEnterprise.creditCode}</span>}
          </Form.Item>
          {/* E8-03：联系人姓名必填 + ≤20字 */}
          <Form.Item label="联系人姓名" field="contactName" rules={[
            { required: true, message: '请输入联系人姓名' },
            { maxLength: 20, message: '联系人姓名不超过20字' },
          ]}>
            {editing ? <Input placeholder="联系人姓名" maxLength={20} /> : <span>{mockEnterprise.contactName}</span>}
          </Form.Item>
          {/* E8-02：手机号 1[3-9] */}
          <Form.Item label="联系人手机号" field="contactPhone" rules={[
            { required: true, message: '请输入手机号' },
            { match: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
          ]}>
            {editing ? <Input placeholder="手机号" maxLength={11} /> : <span>{mockEnterprise.contactPhone}</span>}
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
