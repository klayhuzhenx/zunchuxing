import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Message, Typography } from '@arco-design/web-react';
import { IconPhone } from '@arco-design/web-react/icon';

const { Title, Paragraph } = Typography;

const PHONE_REGEX = /^1[3-9]\d{9}$/;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loginForm] = Form.useForm();
  const navigate = useNavigate();

  const handleLogin = (values: { phone: string; code: string }) => {
    if (!values.code || values.code.length !== 6) {
      Message.error('请输入6位验证码');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (values.phone === '13800000000' && values.code === '888888') {
        Message.success('登录成功');
        navigate('/');
      } else {
        Message.error('验证码错误，请重新输入');
      }
    }, 800);
  };

  const sendCode = () => {
    loginForm.validate(['phone']).then(() => {
      setCountdown(60);
      Message.success('验证码已发送');
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    }).catch(() => Message.warning('请先输入正确的手机号'));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)' }}>
      <div style={{ width: 420, background: '#fff', borderRadius: 16, padding: 48, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ color: '#D4AF37', fontSize: 24, fontWeight: 700 }}>尊</span>
          </div>
          <Title heading={4} style={{ margin: '0 0 4px' }}>尊出行 · 企业后台</Title>
          <Paragraph type="secondary" style={{ margin: 0, fontSize: 13 }}>请输入手机号验证码登录</Paragraph>
        </div>
        <Form form={loginForm} onSubmit={handleLogin} layout="vertical" size="large" initialValues={{ phone: '13800000000' }}>
          <Form.Item field="phone" rules={[
            { required: true, message: '请输入手机号' },
            { match: PHONE_REGEX, message: '请输入正确的手机号' },
          ]}>
            <Input prefix={<IconPhone />} placeholder="管理员手机号" maxLength={11} />
          </Form.Item>
          <Form.Item field="code" rules={[{ required: true, message: '请输入验证码' }]}>
            <Input placeholder="6位验证码" maxLength={6}
              suffix={
                <Button type="text" size="small" disabled={countdown > 0}
                  onClick={sendCode}>
                  {countdown > 0 ? `${countdown}s后重发` : '获取验证码'}
                </Button>}
            />
          </Form.Item>
          <Form.Item style={{ marginTop: 28 }}>
            <Button type="primary" htmlType="submit" long loading={loading}
              style={{ height: 46, borderRadius: 8, background: '#000', borderColor: '#000' }}>登录</Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
