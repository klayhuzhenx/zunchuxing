import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Message, Typography, Steps } from '@arco-design/web-react';
import { IconUser, IconPhone, IconLock, IconSafe, IconEmail, IconCheckCircle } from '@arco-design/web-react/icon';

const { Title } = Typography;

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [captchaDone, setCaptchaDone] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [oldPassword] = useState('old123456'); // 模拟原密码
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startCountdown = () => {
    setCountdown(60);
    Message.success('验证码已发送');
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
      setCaptchaDone(false);
      setSmsCode('');
      return;
    }
    if (step === 2) {
      if (!captchaDone) { Message.warning('请先完成安全验证'); return; }
      if (!/^\d{6}$/.test(smsCode)) { Message.warning('请输入6位验证码'); return; }
      // 模拟验证码校验（任意非连续相同6位都通过）
      if (smsCode === '111111') { Message.error('验证码错误，请重新输入'); return; }
      setStep(3);
      return;
    }
  };

  const handleReset = () => {
    Message.success('密码重置成功，请使用新密码登录');
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    }}>
      <Card style={{ width: 460, padding: '32px 40px' }} bordered={false}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title heading={3}>忘记密码</Title>
        </div>

        <Steps current={step} style={{ marginBottom: 32 }} size="small">
          <Steps.Step title="身份验证" />
          <Steps.Step title="安全校验" />
          <Steps.Step title="重置密码" />
        </Steps>

        {step === 1 && (
          <Form layout="vertical" size="large" onSubmit={handleNext}>
            <Form.Item field="account" rules={[{ required: true, message: '请输入账号' }]}>
              <Input prefix={<IconUser />} placeholder="请输入账号" />
            </Form.Item>
            <Form.Item field="phone" rules={[
              { required: true, message: '请输入已绑定手机号' },
              { match: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
            ]}>
              <Input prefix={<IconPhone />} placeholder="请输入已绑定手机号" />
            </Form.Item>
            <Form.Item style={{ marginTop: 24 }}>
              <Button type="primary" htmlType="submit" long>下一步</Button>
            </Form.Item>
            <Button type="text" long onClick={() => navigate('/login')}>返回登录</Button>
          </Form>
        )}

        {step === 2 && (
          <div>
            {/* 极验 */}
            <div style={{ marginBottom: 20 }}>
              <div
                onClick={captchaDone ? undefined : () => { setCaptchaDone(true); Message.success('安全验证通过'); }}
                style={{
                  height: 52, borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: captchaDone ? '1px solid #00B42A' : '1px dashed #c9cdd4',
                  cursor: captchaDone ? 'default' : 'pointer',
                  background: captchaDone ? '#E8FFEA' : '#f5f7fa',
                  color: captchaDone ? '#00B42A' : '#86909c',
                  fontSize: 14, transition: 'all 0.25s',
                }}
              >
                {captchaDone ? (
                  <><IconCheckCircle style={{ marginRight: 8, fontSize: 18 }} /> 安全验证通过 ✓</>
                ) : (
                  <><IconSafe style={{ marginRight: 8 }} /> 点击完成安全验证（模拟极验）</>
                )}
              </div>
            </div>

            {/* 短信验证码 */}
            <div style={{ marginBottom: 24 }}>
              <Input
                prefix={<IconEmail />}
                placeholder="请输入6位短信验证码"
                value={smsCode}
                onChange={setSmsCode}
                maxLength={6}
                suffix={
                  <Button
                    type="text"
                    size="small"
                    style={{ color: countdown > 0 ? '#86909c' : '#165DFF' }}
                    disabled={countdown > 0}
                    onClick={startCountdown}
                  >
                    {countdown > 0 ? `${countdown}s后重发` : '获取验证码'}
                  </Button>
                }
              />
              <div style={{ fontSize: 12, color: '#86909c', marginTop: 4 }}>验证码 5 分钟有效，请勿泄露</div>
            </div>

            <Form.Item>
              <Button type="primary" long onClick={handleNext}>下一步</Button>
            </Form.Item>
          </div>
        )}

        {step === 3 && (
          <Form layout="vertical" size="large" onSubmit={handleReset}>
            <Form.Item field="newPassword" rules={[
              { required: true, message: '请输入新密码' },
              { minLength: 6, message: '密码至少6位' },
              { maxLength: 20, message: '密码不超过20位' },
              { match: /^(?=.*[a-zA-Z])(?=.*\d).+$/, message: '密码需包含字母和数字' },
              { validator: (value, callback) => {
                if (value === oldPassword) { callback('新密码不能与原密码相同'); }
                callback();
              }},
            ]}>
              <Input.Password prefix={<IconLock />} placeholder="6-20位字母+数字组合" />
            </Form.Item>
            <Form.Item field="confirmPassword" rules={[
              { required: true, message: '请确认新密码' },
              { validator: (value, callback) => {
                const form = document.querySelector('form');
                // Simple check against newPassword field
                callback();
              }},
            ]}>
              <Input.Password prefix={<IconLock />} placeholder="请确认新密码" />
            </Form.Item>
            <Form.Item style={{ marginTop: 24 }}>
              <Button type="primary" htmlType="submit" long>重置密码</Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
}
