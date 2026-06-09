import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Message, Typography, Steps } from '@arco-design/web-react';
import { IconUser, IconPhone, IconLock, IconSafe, IconEmail, IconCheckCircle } from '@arco-design/web-react/icon';

const { Title } = Typography;

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [captchaDone, setCaptchaDone] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 3) {
      if (step === 2 && !captchaDone) {
        Message.warning('请先完成安全验证');
        return;
      }
      setStep(step + 1);
      setCaptchaDone(false);
    } else {
      Message.success('密码重置成功，请使用新密码登录');
      navigate('/login');
    }
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
            <div style={{ marginBottom: 24 }}>
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

            <Form.Item style={{ marginBottom: 24 }}>
              <Input
                prefix={<IconEmail />} placeholder="请输入短信验证码（任意6位数字）"
                suffix={<Button type="text" size="small" style={{ color: '#165DFF' }}>获取验证码</Button>}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" long onClick={handleNext}>下一步</Button>
            </Form.Item>
          </div>
        )}

        {step === 3 && (
          <Form layout="vertical" size="large" onSubmit={handleNext}>
            <Form.Item field="newPassword" rules={[
              { required: true, message: '请输入新密码' },
              { minLength: 6, message: '6-20位字母+数字组合' },
            ]}>
              <Input.Password prefix={<IconLock />} placeholder="请输入新密码" />
            </Form.Item>
            <Form.Item field="confirmPassword" rules={[
              { required: true, message: '请确认新密码' },
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
