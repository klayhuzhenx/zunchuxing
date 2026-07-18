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
      <view class="form-desc">手机号验证码登录</view>
      <view class="form-fields">
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

    <!-- 协议确认弹窗 -->
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
const showProtocolSheet = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;

const PHONE_REG = /^1[3-9]\d{9}$/;

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 0;
  const token = uni.getStorageSync('token');
  const tokenExpiry = uni.getStorageSync('tokenExpiry');
  if (token && tokenExpiry && Date.now() < Number(tokenExpiry)) {
    uni.reLaunch({ url: '/pages/index/index' });
  }
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const onSendCode = () => {
  if (countdown.value > 0) return;
  if (!PHONE_REG.test(phone.value)) {
    uni.showToast({ title: '请输入正确的手机号码', icon: 'none' });
    return;
  }
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
  if (!/^\d{6}$/.test(code.value)) {
    uni.showToast({ title: '请输入6位短信验证码', icon: 'none' });
    return;
  }
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    const isNew = phone.value !== '13800000000';
    uni.showToast({ title: isNew ? '欢迎加入尊出行' : '登录成功', icon: 'success' });
    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
    uni.setStorageSync('token', 'mock-token-' + phone.value);
    uni.setStorageSync('tokenExpiry', String(expiry));
    uni.setStorageSync('user-identity', 'personal');
    setTimeout(() => { uni.reLaunch({ url: '/pages/index/index' }); }, 800);
  }, 1000);
};

const onAgreeAndContinue = () => {
  agreed.value = true;
  showProtocolSheet.value = false;
  doLogin();
};

const openAgreement = (type: 'service' | 'privacy') => {
  if (type === 'privacy') {
    uni.navigateTo({ url: '/pages/profile/privacy' });
  } else {
    uni.navigateTo({ url: '/pages/webview/index?src=/user-agreement.html' });
  }
};

const onWechat = () => {
  uni.showModal({
    title: '微信快捷登录',
    content: '将调用 wx.login 获取授权，首次需绑定手机号（接入微信 SDK 后替换）',
    success: (res: any) => {
      if (res.confirm) {
        uni.setStorageSync('user-identity', 'personal');
        uni.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => { uni.reLaunch({ url: '/pages/index/index' }); }, 800);
      }
    },
  });
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
  padding: 80px 24px 36px;
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
}

.logo-icon {
  font-size: 40px;
  color: #FFFFFF;
  font-variation-settings: 'FILL' 1;
}

.brand {
  font-size: 28px;
  font-weight: 700;
  color: #000000;
}

.brand-slogan {
  font-size: 15px;
  color: #86868B;
  margin-top: 4px;
}

/* ===== Main ===== */
.main {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 0 24px;
}

.form-desc {
  font-size: 13px;
  color: #86868B;
  margin-bottom: 16px;
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
