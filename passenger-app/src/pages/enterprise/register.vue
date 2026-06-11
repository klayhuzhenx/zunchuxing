<template>
  <view class="page">
    <navbar title="企业入驻" :show-back="true" />

    <scroll-view scroll-y class="main">
      <!-- Hero -->
      <view class="hero">
        <view class="hero-tag">
          <text class="hero-tag-text">尊出行</text>
        </view>
        <text class="hero-title">尊贵出行 伴您卓越</text>
        <text class="hero-desc">请填写以下信息申请加入专享企业服务</text>
      </view>

      <!-- 表单 -->
      <view class="form">
        <view class="form-group">
          <text class="form-label">企业名称</text>
          <view class="form-field">
            <input
              v-model="form.companyName"
              class="form-input"
              type="text"
              placeholder="请输入企业全称"
              placeholder-class="form-placeholder"
            />
          </view>
        </view>

        <view class="form-group">
          <text class="form-label">统一社会信用代码</text>
          <view class="form-field">
            <input
              v-model="form.creditCode"
              class="form-input"
              type="text"
              maxlength="18"
              placeholder="18位统一社会信用代码"
              placeholder-class="form-placeholder"
            />
          </view>
        </view>

        <view class="form-group">
          <text class="form-label">联系人姓名</text>
          <view class="form-field">
            <input
              v-model="form.contactName"
              class="form-input"
              type="text"
              placeholder="请输入姓名"
              placeholder-class="form-placeholder"
            />
          </view>
        </view>

        <view class="form-group">
          <text class="form-label">联系人手机号</text>
          <view class="form-field">
            <input
              v-model="form.phone"
              class="form-input"
              type="number"
              maxlength="11"
              placeholder="请输入手机号码"
              placeholder-class="form-placeholder"
            />
          </view>
        </view>

        <view class="form-group">
          <text class="form-label">验证码</text>
          <view class="form-row">
            <view class="form-field form-field-flex">
              <input
                v-model="form.code"
                class="form-input"
                type="number"
                maxlength="6"
                placeholder="请输入验证码"
                placeholder-class="form-placeholder"
              />
            </view>
            <view
              class="code-btn"
              :class="{ disabled: countdown > 0 }"
              @click="onSendCode"
            >
              <text class="code-btn-text">
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </text>
            </view>
          </view>
        </view>

        <!-- P2-02：管理员密码 -->
        <view class="form-group">
          <text class="form-label">管理员密码</text>
          <view class="form-field">
            <input
              v-model="form.password"
              class="form-input"
              type="password"
              maxlength="20"
              placeholder="6-20位字母+数字，用于企业端PC登录"
              placeholder-class="form-placeholder"
            />
          </view>
        </view>

        <!-- 协议 — P2-08：3份协议 -->
        <view class="agreement" @click="agreed = !agreed">
          <view class="checkbox" :class="{ checked: agreed }">
            <text v-if="agreed" class="material-symbols-outlined check-icon">check</text>
          </view>
          <text class="agreement-text">
            我已阅读并同意
            <text class="agreement-link">《用户服务协议》</text>
            <text class="agreement-link">《隐私政策》</text>
            <text class="agreement-link">《企业用户注册协议》</text>
          </text>
        </view>

        <!-- 提交 -->
        <view class="submit-btn" @click="onSubmit">
          <text class="submit-btn-text">提交申请</text>
        </view>
      </view>

      <!-- 专属权益 -->
      <view class="benefits">
        <view class="benefits-decoration" />
        <view class="benefits-head">
          <text class="material-symbols-outlined benefits-icon">verified</text>
          <text class="benefits-title">专属权益</text>
        </view>
        <view class="benefits-list">
          <view class="benefits-item">
            <view class="benefits-dot" />
            <text class="benefits-text">企业月度统一结算，告别报销烦恼</text>
          </view>
          <view class="benefits-item">
            <view class="benefits-dot" />
            <text class="benefits-text">高管出行专属VIP通道，优先派单</text>
          </view>
          <view class="benefits-item">
            <view class="benefits-dot" />
            <text class="benefits-text">精选豪华车型，提供极致静谧座舱体验</text>
          </view>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import Navbar from '@/components/navbar.vue';

// P2-04：手机号正则
const PHONE_REG = /^1[3-9]\d{9}$/;
const CHINESE_NAME_REG = /^[一-龥]{2,20}$/;

const form = ref({
  companyName: '',
  creditCode: '',
  contactName: '',
  phone: '',
  code: '',
  password: '',  // P2-02
});

const agreed = ref(false);
const countdown = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const onSendCode = () => {
  if (countdown.value > 0) return;
  if (!PHONE_REG.test(form.value.phone)) {
    uni.showToast({ title: '请输入正确的手机号码', icon: 'none' });
    return;
  }
  countdown.value = 60;
  uni.showToast({ title: '验证码已发送', icon: 'none' });
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0 && timer) { clearInterval(timer); timer = null; }
  }, 1000);
};

const onSubmit = () => {
  // P2-07：企业名称 2-60 字
  if (!form.value.companyName || form.value.companyName.length < 2 || form.value.companyName.length > 60) {
    uni.showToast({ title: '企业名称应为 2-60 字', icon: 'none' });
    return;
  }
  // P2-03 跳过（信用代码仅长度检查不变）
  if (!form.value.creditCode || form.value.creditCode.length !== 18) {
    uni.showToast({ title: '请填写 18 位统一社会信用代码', icon: 'none' });
    return;
  }
  // P2-06：联系人中文姓名 2-20 字
  if (!CHINESE_NAME_REG.test(form.value.contactName)) {
    uni.showToast({ title: '请输入正确的中文姓名', icon: 'none' });
    return;
  }
  // P2-02：管理员密码 6-20 位字母+数字
  if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/.test(form.value.password)) {
    uni.showToast({ title: '密码需 6-20 位，且包含字母和数字', icon: 'none' });
    return;
  }
  if (!PHONE_REG.test(form.value.phone)) {
    uni.showToast({ title: '请输入正确的手机号码', icon: 'none' });
    return;
  }
  if (!/^\d{6}$/.test(form.value.code)) {
    uni.showToast({ title: '请输入6位验证码', icon: 'none' });
    return;
  }
  if (!agreed.value) {
    uni.showToast({ title: '请阅读并同意入驻协议', icon: 'none' });
    return;
  }
  // P2-05：手机号重复申请检查（占位 — 后续接入后端校验）
  uni.showToast({ title: '提交成功，请等待审核', icon: 'success' });
  setTimeout(() => { uni.redirectTo({ url: '/pages/enterprise/status' }); }, 800);
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F9F9F9;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  min-height: 0;
}

.bottom-spacer {
  height: 48px;
}

/* ===== Hero ===== */
.hero {
  padding: 32px 24px 48px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-tag {
  padding: 4px 16px;
  background: #E8E8E8;
  border-radius: 9999px;
  margin-bottom: 16px;
}

.hero-tag-text {
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  color: #000000;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.hero-title {
  font-size: 28px;
  line-height: 36px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 8px;
}

.hero-desc {
  font-size: 15px;
  line-height: 22px;
  color: #86868B;
}

/* ===== 表单 ===== */
.form {
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  margin-left: 16px;
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #5D5F5F;
}

.form-field {
  height: 56px;
  background: #F2F2F2;
  border-radius: 24px;
  padding: 0 24px;
  display: flex;
  align-items: center;
}

.form-input {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 17px;
  line-height: 26px;
  color: #1A1C1C;
  width: 100%;
  height: 100%;
}

.form-placeholder {
  color: #86868B;
  font-size: 17px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-field-flex {
  flex: 1;
}

.code-btn {
  flex-shrink: 0;
  height: 56px;
  padding: 0 20px;
  background: #E2E2E2;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.disabled {
    opacity: 0.5;
  }

  &:active:not(.disabled) {
    opacity: 0.7;
  }
}

.code-btn-text {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #000000;
  white-space: nowrap;
}

/* ===== 协议 ===== */
.agreement {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 8px;
  margin-top: 4px;
}

.checkbox {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #CFC4C5;
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
  color: #86868B;
}

.agreement-link {
  color: #000000;
  font-weight: 700;
}

.submit-btn {
  margin-top: 12px;
  height: 56px;
  background: #000000;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);

  &:active {
    opacity: 0.8;
  }
}

.submit-btn-text {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: #FFFFFF;
}

/* ===== 专属权益 ===== */
.benefits {
  position: relative;
  margin: 48px 24px 0;
  padding: 32px;
  background: #F3F3F3;
  border: 1px solid #F2F2F2;
  border-radius: 32px;
  overflow: hidden;
}

.benefits-decoration {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 160px;
  height: 160px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 50%;
}

.benefits-head {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.benefits-icon {
  font-size: 24px;
  color: #0057FF;
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.benefits-title {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: #000000;
}

.benefits-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.benefits-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.benefits-dot {
  width: 6px;
  height: 6px;
  background: #000000;
  border-radius: 50%;
  flex-shrink: 0;
}

.benefits-text {
  font-size: 15px;
  line-height: 22px;
  color: #86868B;
}

/* ===== 城市选择器 ===== */
.form-input-select {
  flex: 1;
  font-size: 17px;
  line-height: 26px;
  color: #1A1C1C;
  &.placeholder { color: #86868B; }
}
.form-select-arrow {
  font-size: 20px;
  color: #86868B;
}
</style>
