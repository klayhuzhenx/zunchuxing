import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Message, Typography, Link, Divider } from '@arco-design/web-react';
import { IconUser, IconLock, IconSafe, IconCheckCircle } from '@arco-design/web-react/icon';

const { Title, Text } = Typography;

export default function Login() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [captchaDone, setCaptchaDone] = useState(false);
  const navigate = useNavigate();

  const handleCaptcha = () => {
    setCaptchaDone(true);
    Message.success('安全验证通过');
  };

  const handleLogin = async () => {
    try {
      if (!captchaDone) {
        Message.warning('请先完成安全验证');
        return;
      }
      await form.validate(['account', 'password']);
      setLoading(true);
      await new Promise(r => setTimeout(r, 800));
      Message.success('登录成功');
      navigate('/', { replace: true });
    } catch {
      Message.error('账号或密码错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    }}>
      <Card style={{ width: 420, padding: '32px 40px' }} bordered={false}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title heading={3} style={{ marginBottom: 4 }}>尊出行 · 运营端</Title>
          <Text type="secondary">运营管理后台</Text>
        </div>

        <Form form={form} layout="vertical" size="large">
          <Form.Item field="account" rules={[
            { required: true, message: '请输入账号' },
            { match: /^[a-zA-Z0-9_]{4,20}$/, message: '4-20位字母/数字/下划线' },
          ]}>
            <Input prefix={<IconUser />} placeholder="请输入账号" />
          </Form.Item>

          <Form.Item field="password" rules={[
            { required: true, message: '请输入密码' },
            { minLength: 6, message: '密码至少6位' },
          ]}>
            <Input.Password prefix={<IconLock />} placeholder="请输入密码" />
          </Form.Item>

          {/* 模拟极验验证 */}
          <div style={{ marginBottom: 24 }}>
            <div
              onClick={captchaDone ? undefined : handleCaptcha}
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

          <Form.Item>
            <Button type="primary" htmlType="button" long loading={loading} onClick={handleLogin}>
              登 录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link onClick={() => navigate('/forgot-password')}>忘记密码</Link>
        </div>

        <Divider style={{ margin: '24px 0' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>安全提示</Text>
        </Divider>
        <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.8 }}>
          仅限尊出行内部运营人员使用，不开放注册。<br />
          连续登录失败 10 次将锁定账号。<br />
          <span style={{ color: '#86909c' }}>原型演示：点击验证区域即可通过</span>
        </Text>
      </Card>
    </div>
  );
}
