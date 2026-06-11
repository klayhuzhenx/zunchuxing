<template>
  <view class="page" :style="{ paddingTop: statusBarHeight + 'px' }">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-blob bg-blob-tr" />
      <view class="bg-blob bg-blob-bl" />
    </view>

    <!-- Header: logo + 标语 -->
    <view class="hero">
      <view class="logo">
        <text class="material-symbols-outlined logo-icon">directions_car</text>
      </view>
      <text class="brand">尊出行</text>
      <text class="brand-slogan">高端出行服务平台</text>
    </view>

    <!-- 表单 -->
    <view class="main">
      <view class="form-head">
        <text class="form-title">验证码登录</text>
        <text class="form-desc">输入手机号，获取验证码即可登录</text>
      </view>

      <view class="form-fields">
        <!-- 手机号 -->
        <view class="field">
          <input
            v-model="phone"
            class="field-input"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
            placeholder-class="field-placeholder"
          />
        </view>

        <!-- 验证码 -->
        <view class="field field-with-action">
          <input
            v-model="code"
            class="field-input"
            type="number"
            maxlength="6"
            placeholder="请输入验证码"
            placeholder-class="field-placeholder"
          />
          <view
            class="field-action"
            :class="{ disabled: countdown > 0 }"
            @click="onSendCode"
          >
            <text class="field-action-text">
              {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
            </text>
          </view>
        </view>
      </view>

      <!-- 协议勾选 -->
      <view class="agreement" @click="agreed = !agreed">
        <view class="checkbox" :class="{ checked: agreed }">
          <text v-if="agreed" class="material-symbols-outlined check-icon">check</text>
        </view>
        <text class="agreement-text">
          我已阅读并同意
          <text class="link" @click.stop="openAgreement('service')">《用户服务协议》</text>
          和
          <text class="link" @click.stop="openAgreement('privacy')">《隐私政策》</text>
        </text>
      </view>

      <!-- 按钮组 -->
      <view class="actions">
        <view class="btn-primary" :class="{ 'btn-disabled': loading }" @click="onLoginAttempt">
          <text class="btn-primary-text">{{ loading ? '验证中…' : '登录 / 注册' }}</text>
        </view>
        <view class="btn-wechat" @click="onWechat">
          <text class="material-symbols-outlined wechat-icon">chat</text>
          <text class="btn-wechat-text">微信快捷登录</text>
        </view>
      </view>
    </view>

    <!-- P1-03/04: 协议确认弹窗 -->
    <bottom-sheet v-model="showProtocolSheet" title="请阅读并同意以下协议" :max-height="'60vh'">
      <view class="protocol-links">
        <view class="protocol-link-item" @click="openAgreement('service')">
          <text class="protocol-link-text">📄 《用户服务协议》</text>
        </view>
        <view class="protocol-link-item" @click="openAgreement('privacy')">
          <text class="protocol-link-text">📄 《隐私政策》</text>
        </view>
      </view>
      <view class="protocol-actions">
        <view class="protocol-btn-cancel" @click="showProtocolSheet = false">
          <text class="protocol-btn-text">不同意</text>
        </view>
        <view class="protocol-btn-confirm" @click="onAgreeAndContinue">
          <text class="protocol-confirm-text">同意并继续</text>
        </view>
      </view>
    </bottom-sheet>

    <!-- Footer: 企业入驻 -->
    <view class="footer">
      <view class="footer-link" @click="goEnterprise">
        <text class="footer-link-text">企业入驻</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import BottomSheet from '@/components/bottom-sheet.vue';

const statusBarHeight = ref(0);
const phone = ref('');
const code = ref('');
const agreed = ref(false);
const countdown = ref(0);
const loading = ref(false);
const showProtocolSheet = ref(false); // P1-03：协议确认弹窗
let timer: ReturnType<typeof setInterval> | null = null;

// 手机号格式校验（P1-01：第一位必为 1，第二位 3-9）
const PHONE_REG = /^1[3-9]\d{9}$/;

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 0;
  // P1-08：检测缓存的登录态
  const token = uni.getStorageSync('token');
  const tokenExpiry = uni.getStorageSync('tokenExpiry');
  if (token && tokenExpiry && Date.now() < Number(tokenExpiry)) {
    uni.reLaunch({ url: '/pages/index/index' });
  }
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

// P1-02：获取验证码前先过极验（占位）
const onSendCode = () => {
  if (countdown.value > 0) return;
  if (!PHONE_REG.test(phone.value)) {
    uni.showToast({ title: '请输入正确的手机号码', icon: 'none' });
    return;
  }
  // 极验行为验证（占位 — 后续接入 GeeTest SDK）
  uni.showModal({
    title: '安全验证',
    content: '请完成滑块验证（接入极验 GeeTest SDK 后替换为真实验证）',
    success: (res: any) => {
      if (!res.confirm) { uni.showToast({ title: '验证未通过，请重试', icon: 'none' }); return; }
      countdown.value = 60;
      uni.showToast({ title: '验证码已发送', icon: 'none' });
      timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0 && timer) { clearInterval(timer); timer = null; }
      }, 1000);
    },
  });
};

// P1-03/04：未勾选协议时弹出底部协议确认弹窗
const onLoginAttempt = () => {
  if (!agreed.value) {
    showProtocolSheet.value = true;
    return;
  }
  doLogin();
};

const doLogin = () => {
  if (!PHONE_REG.test(phone.value)) {
    uni.showToast({ title: '请输入正确的手机号码', icon: 'none' });
    return;
  }
  // P1-05：6位纯数字验证码
  if (!/^\d{6}$/.test(code.value)) {
    uni.showToast({ title: '请输入6位短信验证码', icon: 'none' });
    return;
  }
  loading.value = true;
  // 模拟登录请求
  setTimeout(() => {
    loading.value = false;
    const isNew = phone.value !== '13800000000'; // 模拟：默认手机号为已注册
    uni.showToast({ title: isNew ? '欢迎加入尊出行' : '登录成功', icon: 'success' });
    // P1-08：存储登录态 7 天
    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
    uni.setStorageSync('token', 'mock-token-' + phone.value);
    uni.setStorageSync('tokenExpiry', String(expiry));
    setTimeout(() => { uni.reLaunch({ url: '/pages/index/index' }); }, 800);
  }, 1000);
};

// 协议弹窗：同意并继续
const onAgreeAndContinue = () => {
  agreed.value = true;
  showProtocolSheet.value = false;
  doLogin();
};

// P1-04：点击协议名跳转 H5
const openAgreement = (type: 'service' | 'privacy') => {
  uni.showToast({ title: `即将打开${type === 'service' ? '用户服务协议' : '隐私政策'}（接入H5后替换）`, icon: 'none' });
  // 后续接入：uni.navigateTo({ url: `/pages/webview/index?type=${type}` });
};

const onWechat = () => {
  // 微信快捷登录（占位 — 后续接入 wx.login + 后端换取 openid）
  uni.showModal({
    title: '微信快捷登录',
    content: '将调用 wx.login 获取授权，首次需绑定手机号（接入微信 SDK 后替换）',
    success: (res: any) => {
      if (res.confirm) {
        uni.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => { uni.reLaunch({ url: '/pages/index/index' }); }, 800);
      }
    },
  });
};

const goEnterprise = () => {
  uni.navigateTo({ url: '/pages/enterprise/register' });
};
</script>

<style lang="scss" scoped>
.page {
  position: relative;
  min-height: 100vh;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ===== 背景装饰 ===== */
.bg-decoration {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
}

.bg-blob-tr {
  top: -96px;
  right: -96px;
  width: 384px;
  height: 384px;
  background: #F3F3F3;
  opacity: 0.6;
}

.bg-blob-bl {
  top: 50%;
  left: -192px;
  width: 320px;
  height: 320px;
  background: #EEEEEE;
  opacity: 0.4;
}

/* ===== Hero ===== */
.hero {
  position: relative;
  z-index: 1;
  padding: 80px 24px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.logo {
  width: 80px;
  height: 80px;
  background: #000000;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.logo-icon {
  font-size: 40px;
  color: #FFFFFF;
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.brand {
  font-size: 22px;
  line-height: 30px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: #000000;
}

.brand-slogan {
  margin-top: 8px;
  font-size: 12px;
  line-height: 18px;
  font-weight: 500;
  letter-spacing: 0.2em;
  color: #4C4546;
  text-transform: uppercase;
}

/* ===== Main ===== */
.main {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 0 24px;
}

.form-head {
  margin-bottom: 24px;
}

.form-title {
  font-size: 22px;
  line-height: 30px;
  font-weight: 600;
  color: #000000;
  display: block;
}

.form-desc {
  margin-top: 4px;
  font-size: 13px;
  line-height: 18px;
  color: #4C4546;
  display: block;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  position: relative;
  height: 56px;
  background: #F2F2F2;
  border-radius: 24px;
  padding: 0 24px;
  display: flex;
  align-items: center;
}

.field-with-action {
  padding-right: 8px;
}

.field-input {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 17px;
  line-height: 26px;
  color: #1A1C1C;
  width: 100%;
  height: 100%;
}

.field-placeholder {
  color: #5D5F5F;
  font-size: 17px;
}

.field-action {
  flex-shrink: 0;
  padding: 8px 14px;
  border-radius: 16px;

  &.disabled {
    opacity: 0.4;
  }

  &:active:not(.disabled) {
    opacity: 0.6;
  }
}

.field-action-text {
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
  color: #000000;
}

/* ===== 协议勾选 ===== */
.agreement {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 4px;
  margin-top: 4px;
}

.checkbox {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #CFC4C5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.15s ease;

  &.checked {
    background: #000000;
    border-color: #000000;
  }
}

.check-icon {
  font-size: 14px;
  color: #FFFFFF;
}

.agreement-text {
  flex: 1;
  font-size: 13px;
  line-height: 20px;
  color: #4C4546;
}

.link {
  color: #000000;
  font-weight: 600;
}

/* ===== 按钮 ===== */
.actions {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn-primary {
  height: 56px;
  background: #000000;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.8;
  }
}

.btn-primary-text {
  font-size: 17px;
  line-height: 26px;
  font-weight: 600;
  color: #FFFFFF;
}

.btn-wechat {
  height: 56px;
  background: #FFFFFF;
  border: 1px solid #F2F2F2;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:active {
    opacity: 0.8;
  }
}

.wechat-icon {
  font-size: 22px;
  color: #07C160;
}

.btn-wechat-text {
  font-size: 17px;
  line-height: 26px;
  font-weight: 500;
  color: #07C160;
}

/* ===== Footer ===== */
.footer {
  position: relative;
  z-index: 1;
  padding: 32px 24px 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-link {
  &:active {
    opacity: 0.7;
  }
}

.footer-link-text {
  font-size: 13px;
  line-height: 18px;
  color: #4C4546;
}

/* ===== 按钮禁用态 ===== */
.btn-disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* ===== 协议弹窗 ===== */
.protocol-links {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.protocol-link-item {
  padding: 12px 16px;
  background: #F2F2F2;
  border-radius: 16px;
  &:active { opacity: 0.7; }
}
.protocol-link-text {
  font-size: 16px;
  color: #165DFF;
  font-weight: 500;
}
.protocol-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}
.protocol-btn-cancel {
  flex: 1;
  height: 48px;
  border-radius: 24px;
  border: 1px solid #CFC4C5;
  display: flex;
  align-items: center;
  justify-content: center;
  &:active { opacity: 0.7; }
}
.protocol-btn-text {
  font-size: 15px;
  color: #4C4546;
}
.protocol-btn-confirm {
  flex: 2;
  height: 48px;
  background: #000000;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:active { opacity: 0.8; }
}
.protocol-confirm-text {
  font-size: 15px;
  font-weight: 600;
  color: #FFFFFF;
}
</style>
