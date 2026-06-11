import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Message } from '@arco-design/web-react';

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [logging, setLogging] = useState(false);

  const sendCode = () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) { Message.warning('请输入正确的手机号'); return; }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setCountdown(60);
      Message.success('验证码已发送');
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    }, 800);
  };

  const handleLogin = () => {
    if (!phone) { Message.warning('请输入手机号'); return; }
    if (!code) { Message.warning('请输入验证码'); return; }
    setLogging(true);
    setTimeout(() => {
      setLogging(false);
      Message.success('登录成功');
      navigate('/');
    }, 1000);
  };

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      padding: '0 32px', background: 'var(--bg-primary)',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: 'linear-gradient(135deg, #D4AF37 0%, #b8941f 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          尊出行 · 司机端
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>高端出行服务</p>
      </div>

      {/* Form */}
      <div style={{ width: '100%', maxWidth: 320 }}>
        <div style={{ marginBottom: 16 }}>
          <Input
            prefix={<span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>+86</span>}
            placeholder="请输入手机号"
            maxLength={11}
            value={phone}
            onChange={setPhone}
            style={{ height: 48, fontSize: 15 }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <Input
            placeholder="请输入验证码"
            maxLength={6}
            value={code}
            onChange={setCode}
            style={{ height: 48, fontSize: 15 }}
            suffix={
              <Button
                type="text"
                size="small"
                disabled={countdown > 0 || sending || phone.length < 11}
                loading={sending}
                onClick={sendCode}
                style={{ color: countdown > 0 ? 'var(--text-disabled)' : 'var(--gold)', fontSize: 13, fontWeight: 500 }}
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </Button>
            }
          />
        </div>

        <Button
          type="primary"
          long
          size="large"
          loading={logging}
          onClick={handleLogin}
          style={{ height: 48, fontSize: 16, borderRadius: 12 }}
        >
          登录
        </Button>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
          登录即表示同意<br />
          <span style={{ color: 'var(--gold)' }}>《用户服务协议》</span> 和 <span style={{ color: 'var(--gold)' }}>《隐私政策》</span>
        </p>
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 32, textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'var(--text-disabled)' }}>尊出行 · 和行科技</p>
      </div>
    </div>
  );
}
