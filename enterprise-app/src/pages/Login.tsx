import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Message, Typography, Steps, Space } from '@arco-design/web-react';
import { IconLock, IconUser, IconPhone } from '@arco-design/web-react/icon';

const { Title, Paragraph } = Typography;

// E1-01/02: 校验正则 — 手机号 11 位 / 密码 6-20 位字母+数字
const PHONE_REGEX = /^1[3-9]\d{9}$/;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'forgot' | 'register'>('login');
  const [forgotStep, setForgotStep] = useState(0);
  const [loginForm] = Form.useForm();
  const navigate = useNavigate();

  const handleLogin = (values: { account: string; password: string }) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (values.account === '13800000000' && values.password === 'admin123') {
        Message.success('登录成功');
        navigate('/');
      } else {
        Message.error('账号/密码错误');
        // E1-06：登录失败清空密码框
        loginForm.setFieldValue('password', '');
      }
    }, 800);
  };

  const handleForgot = (values: { account: string; phone: string; code: string; password: string; confirmPassword: string }) => {
    if (forgotStep === 0) {
      if (!values.account || !values.phone) { Message.error('请填写账号和手机号'); return; }
      // E1-01：手机号格式
      if (!PHONE_REGEX.test(values.account)) { Message.error('请输入正确的手机号'); return; }
      setForgotStep(1); return;
    }
    if (forgotStep === 1) {
      if (!values.code) { Message.error('请输入验证码'); return; }
      setForgotStep(2); return;
    }
    // E1-03 E1-05：密码格式 + 确认密码一致性
    if (!values.password) { Message.error('请输入新密码'); return; }
    if (!PASSWORD_REGEX.test(values.password)) { Message.error('密码为 6-20 位，需包含字母和数字'); return; }
    if (values.password !== values.confirmPassword) { Message.error('两次输入的密码不一致'); return; }
    Message.success('密码重置成功，请重新登录');
    setMode('login'); setForgotStep(0);
  };

  // E1-04：注册
  const [regCountdown, setRegCountdown] = useState(0);
  const handleRegister = (values: { phone: string; code: string; password: string; confirmPassword: string }) => {
    if (!PASSWORD_REGEX.test(values.password)) { Message.error('密码为 6-20 位，需包含字母和数字'); return; }
    if (values.password !== values.confirmPassword) { Message.error('两次密码输入不一致'); return; }
    // 模拟：已注册的手机号提示跳转登录
    if (values.phone === '13800000000') {
      Message.warning('该手机号已注册企业账号，请直接登录');
      setMode('login');
      return;
    }
    Message.success('注册成功');
    navigate('/');
  };

  const loginFormEl = (
    <div style={{ width: 420, background: '#fff', borderRadius: 16, padding: 48, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <span style={{ color: '#D4AF37', fontSize: 24, fontWeight: 700 }}>尊</span>
        </div>
        <Title heading={4} style={{ margin: '0 0 4px' }}>尊出行 · 企业后台</Title>
        <Paragraph type="secondary" style={{ margin: 0, fontSize: 13 }}>请输入管理员账号登录</Paragraph>
      </div>
      <Form form={loginForm} onSubmit={handleLogin} layout="vertical" size="large" initialValues={{ account: '13800000000', password: 'admin123' }}>
        {/* E1-01：账号=手机号 + 11位正则 */}
        <Form.Item field="account" rules={[
          { required: true, message: '请输入账号' },
          { match: PHONE_REGEX, message: '请输入正确的手机号' },
        ]}>
          <Input prefix={<IconUser />} placeholder="管理员账号（手机号）" />
        </Form.Item>
        {/* E1-02：密码 6-20 位字母+数字 */}
        <Form.Item field="password" rules={[
          { required: true, message: '请输入密码' },
          { match: PASSWORD_REGEX, message: '密码需 6-20 位，含字母和数字' },
        ]}>
          <Input.Password prefix={<IconLock />} placeholder="管理员密码" />
        </Form.Item>
        <Form.Item style={{ marginTop: 28 }}>
          <Button type="primary" htmlType="submit" long loading={loading}
            style={{ height: 46, borderRadius: 8, background: '#000', borderColor: '#000' }}>登录</Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 12 }}>
        <Button type="text" size="small" style={{ color: '#165DFF' }} onClick={() => setMode('forgot')}>忘记密码？</Button>
        {/* E1-04 */}
        <Button type="text" size="small" style={{ color: '#165DFF' }} onClick={() => setMode('register')}>注册账号</Button>
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
            <Form.Item field="account" label="账号" rules={[
              { required: true, message: '请输入账号' },
              { match: PHONE_REGEX, message: '请输入正确的手机号' },
            ]}>
              <Input prefix={<IconUser />} placeholder="手机号" />
            </Form.Item>
            <Form.Item field="phone" label="绑定手机号" rules={[{ required: true, message: '请输入已绑定手机号' }]}>
              <Input prefix={<IconPhone />} placeholder="绑定的手机号" />
            </Form.Item>
          </>
        )}
        {forgotStep === 1 && (
          <Form.Item field="code" label="短信验证码" rules={[{ required: true, message: '请输入验证码' }]}>
            <Input placeholder="6位验证码" suffix={<Button type="text" size="small" onClick={() => Message.success('验证码已发送')}>获取验证码</Button>} />
          </Form.Item>
        )}
        {forgotStep === 2 && (
          <>
            <Form.Item field="password" label="新密码" rules={[
              { required: true, message: '请输入新密码' },
              { match: PASSWORD_REGEX, message: '密码为 6-20 位，需包含字母和数字' },
            ]}>
              <Input.Password placeholder="6-20位，字母+数字组合" />
            </Form.Item>
            {/* E1-03 */}
            <Form.Item field="confirmPassword" label="确认新密码" rules={[{ required: true, message: '请确认新密码' }]}>
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

  // E1-04：注册表单
  const registerForm = (
    <div style={{ width: 450, background: '#fff', borderRadius: 16, padding: 48, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <Title heading={4} style={{ margin: '0 0 4px' }}>注册企业账号</Title>
        <Paragraph type="secondary" style={{ margin: 0, fontSize: 13 }}>注册成功即为企业管理员</Paragraph>
      </div>
      <Form onSubmit={handleRegister} layout="vertical" size="large">
        <Form.Item field="phone" label="手机号" rules={[
          { required: true, message: '请输入手机号' },
          { match: PHONE_REGEX, message: '请输入正确的手机号' },
        ]}>
          <Input prefix={<IconPhone />} placeholder="请输入手机号" maxLength={11} />
        </Form.Item>
        <Form.Item field="code" label="短信验证码" rules={[{ required: true, message: '请输入验证码' }]}>
          <Input placeholder="6位数字验证码" maxLength={6}
            suffix={
              <Button type="text" size="small" disabled={regCountdown > 0}
                onClick={() => { setRegCountdown(60); Message.success('验证码已发送'); }}>
                {regCountdown > 0 ? `${regCountdown}s后重发` : '获取验证码'}
              </Button>}
          />
        </Form.Item>
        <Form.Item field="password" label="登录密码" rules={[{ required: true, message: '请设置登录密码' }]}>
          <Input.Password prefix={<IconLock />} placeholder="8-20位，含字母和数字" />
        </Form.Item>
        <Form.Item field="confirmPassword" label="确认密码" rules={[{ required: true, message: '请确认密码' }]}>
          <Input.Password prefix={<IconLock />} placeholder="再次输入密码" />
        </Form.Item>
        <Form.Item style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" long style={{ height: 46, background: '#000', borderColor: '#000' }}>注册</Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center' }}>
        <Button type="text" size="small" onClick={() => setMode('login')}>已有账号？去登录</Button>
      </div>
    </div>
  );

  const bg = 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)';
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg }}>
      {mode === 'login' ? loginFormEl : mode === 'forgot' ? forgotForm : registerForm}
    </div>
  );
}
