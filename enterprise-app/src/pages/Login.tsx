import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Message, Typography, Steps, Space } from '@arco-design/web-react';
import { IconLock, IconUser, IconPhone } from '@arco-design/web-react/icon';

const { Title, Paragraph } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [forgotStep, setForgotStep] = useState(0);
  const navigate = useNavigate();

  const handleLogin = (values: { account: string; password: string }) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (values.account === 'admin' && values.password === '123456') {
        Message.success('登录成功');
        navigate('/');
      } else {
        Message.error('账号/密码错误');
      }
    }, 800);
  };

  const handleForgot = (values: { account: string; phone: string; code: string; password: string }) => {
    if (forgotStep === 0) {
      if (!values.account || !values.phone) { Message.error('请填写账号和手机号'); return; }
      setForgotStep(1); return;
    }
    if (forgotStep === 1) {
      if (!values.code) { Message.error('请输入验证码'); return; }
      setForgotStep(2); return;
    }
    if (!values.password) { Message.error('请输入新密码'); return; }
    Message.success('密码重置成功，请重新登录');
    setMode('login'); setForgotStep(0);
  };

  const loginForm = (
    <div style={{ width: 420, background: '#fff', borderRadius: 16, padding: 48, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <span style={{ color: '#D4AF37', fontSize: 24, fontWeight: 700 }}>尊</span>
        </div>
        <Title heading={4} style={{ margin: '0 0 4px' }}>尊出行 · 企业后台</Title>
        <Paragraph type="secondary" style={{ margin: 0, fontSize: 13 }}>请输入管理员账号登录</Paragraph>
      </div>
      <Form onSubmit={handleLogin} layout="vertical" size="large" initialValues={{ account: 'admin', password: '123456' }}>
        <Form.Item field="account" rules={[{ required: true, message: '请输入账号' }]}>
          <Input prefix={<IconUser />} placeholder="管理员账号（手机号）" />
        </Form.Item>
        <Form.Item field="password" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password prefix={<IconLock />} placeholder="管理员密码" />
        </Form.Item>
        <Form.Item style={{ marginTop: 28 }}>
          <Button type="primary" htmlType="submit" long loading={loading}
            style={{ height: 46, borderRadius: 8, background: '#000', borderColor: '#000' }}>登录</Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center' }}>
        <Button type="text" size="small" style={{ color: '#165DFF' }} onClick={() => setMode('forgot')}>忘记密码？</Button>
      </div>
    </div>
  );

  const forgotForm = (
    <div style={{ width: 480, background: '#fff', borderRadius: 16, padding: 48, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
      <Title heading={4} style={{ marginBottom: 24, textAlign: 'center' }}>忘记密码</Title>
      <Steps current={forgotStep} size="small" style={{ marginBottom: 32 }}>
        <Steps.Step title="验证身份" />
        <Steps.Step title="安全验证" />
        <Steps.Step title="设置密码" />
      </Steps>
      <Form onSubmit={handleForgot} layout="vertical" size="large">
        {forgotStep === 0 && (
          <>
            <Form.Item field="account" label="账号" rules={[{ required: true }]}>
              <Input prefix={<IconUser />} placeholder="手机号" />
            </Form.Item>
            <Form.Item field="phone" label="绑定手机号" rules={[{ required: true }]}>
              <Input prefix={<IconPhone />} placeholder="绑定的手机号" />
            </Form.Item>
          </>
        )}
        {forgotStep === 1 && (
          <Form.Item field="code" label="短信验证码" rules={[{ required: true }]}>
            <Input placeholder="6位验证码" suffix={<Button type="text" size="small" onClick={() => Message.success('验证码已发送')}>获取验证码</Button>} />
          </Form.Item>
        )}
        {forgotStep === 2 && (
          <>
            <Form.Item field="password" label="新密码" rules={[{ required: true, minLength: 6 }]}>
              <Input.Password placeholder="6-20位，字母+数字组合" />
            </Form.Item>
            <Form.Item field="confirmPassword" label="确认新密码" rules={[{ required: true }]}>
              <Input.Password placeholder="再次输入新密码" />
            </Form.Item>
          </>
        )}
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" style={{ background: '#000', borderColor: '#000' }}>
              {forgotStep < 2 ? '下一步' : '重置密码'}
            </Button>
            <Button onClick={() => { setMode('login'); setForgotStep(0); }}>返回登录</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)' }}>
      {mode === 'login' ? loginForm : forgotForm}
    </div>
  );
}
