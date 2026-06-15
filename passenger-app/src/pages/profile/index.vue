<template>
  <view class="page" :style="{ paddingTop: statusBarHeight + 'px' }">
    <!-- header -->
    <view class="header">
      <view class="header-back" @click="onBack">
        <text class="material-symbols-outlined">arrow_back</text>
      </view>
      <text class="header-title">尊出行</text>
      <view class="header-placeholder" />
    </view>

    <scroll-view scroll-y class="main">
      <!-- 用户信息 -->
      <view class="user-section">
        <view class="user-avatar">
          <view class="avatar-fallback" />
        </view>
        <view class="user-info">
          <text class="user-phone">{{ maskedPhone }}</text>
          <!-- P6-04：企业身份标签 -->
          <view class="user-identity-row" @click="showIdentitySheet = true">
            <view v-if="currentIdentity === 'enterprise'" class="identity-tag enterprise-tag">
              <text class="identity-tag-text">企业员工</text>
            </view>
            <text class="user-identity-text">{{ identityDisplayName }}</text>
            <text class="material-symbols-outlined user-identity-arrow">arrow_drop_down</text>
          </view>
        </view>
        <view class="user-arrow" @click="goSettings">
          <text class="material-symbols-outlined">chevron_right</text>
        </view>
      </view>

      <!-- 企业管理（企业身份时显示）— 文字上下排列 -->
      <view v-if="isEnterprise" class="enterprise-card" @click="goEnterprise">
        <view class="enterprise-left">
          <view class="enterprise-icon">
            <text class="material-symbols-outlined enterprise-icon-text ms-fill">corporate_fare</text>
          </view>
          <view class="enterprise-info">
            <text class="enterprise-title">企业管理</text>
            <text class="enterprise-desc">开启商务便捷出行新时代</text>
          </view>
        </view>
        <text class="material-symbols-outlined enterprise-arrow">arrow_forward</text>
      </view>

      <!-- 功能入口 3 列 -->
      <view class="func-grid">
        <view class="func-item" @click="goTrips">
          <text class="material-symbols-outlined func-icon">auto_awesome_motion</text>
          <text class="func-label">我的行程</text>
        </view>
        <view class="func-item" @click="goInvoice">
          <text class="material-symbols-outlined func-icon">receipt_long</text>
          <text class="func-label">电子发票</text>
        </view>
        <view class="func-item" @click="goMessages">
          <text class="material-symbols-outlined func-icon">notifications</text>
          <text class="func-label">消息中心</text>
          <view class="func-badge" />
        </view>
      </view>

      <!-- 设置区 -->
      <view class="settings-card">
        <view class="settings-row" @click="onEnterpriseEntry">
          <view class="settings-left">
            <text class="settings-label">入驻企业</text>
            <text class="settings-sub">企业用车管理 · 额度配置 · 员工管理</text>
          </view>
          <text class="material-symbols-outlined settings-icon">chevron_right</text>
        </view>
        <view class="settings-row" @click="onContact">
          <text class="settings-label">客服中心</text>
          <text class="material-symbols-outlined settings-icon">headset_mic</text>
        </view>
        <view class="settings-row" @click="onAgreement">
          <text class="settings-label">用户服务协议</text>
          <text class="material-symbols-outlined settings-icon">description</text>
        </view>
        <view class="settings-row settings-row-last" @click="onPrivacy">
          <text class="settings-label">隐私政策</text>
          <text class="material-symbols-outlined settings-icon">security</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部导航 -->
    <tab-bar current="profile" />

    <!-- 身份切换弹窗 -->
    <bottom-sheet v-model="showIdentitySheet" title="身份切换" :max-height="'auto'">
      <text class="identity-desc">选择本次使用的身份</text>

      <view class="identity-options">
        <view
          class="identity-option"
          :class="{ active: pendingIdentity === 'enterprise' }"
          @click="pendingIdentity = 'enterprise'"
        >
          <view class="identity-option-left">
            <view class="identity-option-icon enterprise-bg">
              <text class="material-symbols-outlined identity-option-icon-text">corporate_fare</text>
            </view>
            <view class="identity-option-info">
              <text class="identity-option-name">华为技术有限公司</text>
              <text class="identity-option-tag">企业认证账号</text>
            </view>
          </view>
          <text
            class="material-symbols-outlined identity-check"
            :class="pendingIdentity === 'enterprise' ? 'check-visible' : 'check-hidden'"
          >check_circle</text>
        </view>

        <view
          class="identity-option"
          :class="{ active: pendingIdentity === 'personal' }"
          @click="pendingIdentity = 'personal'"
        >
          <view class="identity-option-left">
            <view class="identity-option-icon personal-bg">
              <text class="material-symbols-outlined identity-option-icon-text personal-text">person</text>
            </view>
            <view class="identity-option-info">
              <text class="identity-option-name">个人身份</text>
              <text class="identity-option-tag">个人账号</text>
            </view>
          </view>
          <text
            class="material-symbols-outlined identity-check"
            :class="pendingIdentity === 'personal' ? 'check-visible' : 'check-hidden'"
          >check_circle</text>
        </view>
      </view>

      <view class="identity-actions">
        <view class="identity-cancel" @click="onIdentityCancel">
          <text class="identity-cancel-text">取消</text>
        </view>
        <view class="identity-confirm" @click="onIdentityConfirm">
          <text class="identity-confirm-text">确认</text>
        </view>
      </view>
    </bottom-sheet>

    <!-- 客服弹窗 -->
    <bottom-sheet v-model="showContactSheet" title="联系客服" :max-height="'auto'" :show-handle="false">
      <view class="contact-hero">
        <view class="contact-icon-wrap">
          <text class="material-symbols-outlined contact-hi">headset_mic</text>
        </view>
        <text class="contact-sub">客服热线 7×24 小时</text>
        <text class="contact-phone">400-XXX-XXXX</text>
      </view>
      <view class="contact-actions">
        <view class="ca-cancel" @click="showContactSheet=false"><text class="ca-ct">取消</text></view>
        <view class="ca-call" @click="onCall"><text class="ca-ct call">呼叫</text></view>
      </view>
    </bottom-sheet>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import TabBar from '@/components/tab-bar.vue';
import BottomSheet from '@/components/bottom-sheet.vue';

const statusBarHeight = ref(0);
const isEnterprise = ref(true);
const pendingIdentity = ref<'enterprise' | 'personal'>('enterprise');
const showIdentitySheet = ref(false);

const identityDisplayName = computed(() =>
  isEnterprise.value ? '华为技术有限公司' : '个人身份'
);

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 0;
});

// 手机号中间加密展示
const rawPhone = ref('13800008888');
const maskedPhone = computed(() => rawPhone.value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'));

/* ===== 身份切换 ===== */
const onIdentityCancel = () => {
  pendingIdentity.value = isEnterprise.value ? 'enterprise' : 'personal';
  showIdentitySheet.value = false;
};

const onIdentityConfirm = () => {
  isEnterprise.value = pendingIdentity.value === 'enterprise';
  showIdentitySheet.value = false;
  uni.showToast({
    title: isEnterprise.value ? '已切换至企业身份' : '已切换至个人身份',
    icon: 'none',
  });
};

/* ===== 其他 ===== */
const onBack = () => { uni.navigateBack(); };
const goSettings = () => { uni.navigateTo({ url: '/pages/profile/settings' }); };
const goEnterprise = () => { uni.navigateTo({ url: '/pages/enterprise/index' }); };
const goTrips = () => { uni.navigateTo({ url: '/pages/trips/index' }); };
const goInvoice = () => { uni.navigateTo({ url: '/pages/invoice/index' }); };
const goMessages = () => { uni.navigateTo({ url: '/pages/messages/index' }); };
const showContactSheet = ref(false);
const onEnterpriseEntry = () => { uni.navigateTo({ url: '/pages/enterprise/register' }); };
const onContact = () => { showContactSheet.value = true; };
// P11-01：实际拨打电话
const onCall = () => { showContactSheet.value = false; uni.makePhoneCall({ phoneNumber: '400-000-8888' }); };
// P12-01：WebView 占位
const onAgreement = () => { uni.showToast({ title: '用户服务协议（H5 WebView 接入后替换）', icon: 'none' }); };
const onPrivacy = () => { uni.showToast({ title: '隐私政策（H5 WebView 接入后替换）', icon: 'none' }); };
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  background: #F9F9F9;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* ===== Header ===== */
.header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 24px;
  background: #F9F9F9;
}

.header-back {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -8px;
}

.header-back .material-symbols-outlined {
  font-size: 24px;
  color: #000;
}

.header-back:active { opacity: 0.7; }

.header-title {
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
  color: #000;
}

.header-placeholder { width: 44px; }

/* ===== main ===== */
.main { flex: 1; height: 0; }

/* ===== 用户信息 ===== */
.user-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px 48px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #F2F2F2;
  flex-shrink: 0;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #E8E8E8, #C6C6C7);
}

.user-info { flex: 1; min-width: 0; }

.user-phone {
  font-size: 28px;
  line-height: 36px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #1A1C1C;
  margin-bottom: 4px;
}

.user-identity-row {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
}

.user-identity-row:active { opacity: 0.8; }

.user-identity-text {
  font-size: 15px;
  line-height: 22px;
  color: #86868B;
}

.user-identity-arrow {
  font-size: 18px;
  color: #86868B;
}

.user-arrow {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-arrow:active { opacity: 0.7; }

.user-arrow .material-symbols-outlined {
  font-size: 22px;
  color: #86868B;
}

/* ===== 企业管理 ===== */
.enterprise-card {
  margin: 0 24px 32px;
  padding: 20px;
  background: #F2F2F2;
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.enterprise-card:active { opacity: 0.8; }

.enterprise-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.enterprise-icon {
  width: 40px;
  height: 40px;
  background: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.enterprise-icon-text {
  font-size: 20px;
  color: #FFF;
}

.enterprise-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }

.enterprise-title {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: #000;
}

.enterprise-desc {
  font-size: 11px;
  line-height: 16px;
  color: #86868B;
  margin-top: 2px;
}

.enterprise-arrow {
  font-size: 20px;
  color: #86868B;
  flex-shrink: 0;
}

/* ===== 功能入口 ===== */
.func-grid {
  margin: 0 24px 32px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.func-item {
  background: #FFF;
  border: 1px solid #F2F2F2;
  border-radius: 24px;
  padding: 16px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
}

.func-item:active { opacity: 0.8; }

.func-icon { font-size: 24px; color: #000; }

.func-label {
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  color: #1A1C1C;
}

.func-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 6px;
  height: 6px;
  background: #FF4D4F;
  border-radius: 50%;
}

/* ===== 设置区 ===== */
.settings-card {
  margin: 0 24px 32px;
  background: #FFF;
  border: 1px solid #F2F2F2;
  border-radius: 32px;
  overflow: hidden;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #F2F2F2;
}

.settings-row:active { background: #F2F2F2; }

.settings-row-last { border-bottom: none; }

.settings-left { flex: 1; min-width: 0; }
.settings-label { font-size: 17px; line-height: 26px; color: #1A1C1C; }
.settings-sub { margin-top: 2px; font-size: 12px; line-height: 18px; color: #86868B; display: block; }

.settings-icon { font-size: 22px; color: #86868B; }

/* ===== 身份切换弹窗 ===== */
.identity-desc {
  display: block;
  text-align: center;
  font-size: 15px;
  line-height: 22px;
  color: #86868B;
  margin-bottom: 24px;
}

.identity-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.identity-option {
  background: #F2F2F2;
  border: 2px solid transparent;
  border-radius: 24px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.15s ease;
}

.identity-option.active {
  background: #FFF;
  border-color: #000;
}

.identity-option:active {
  transform: scale(0.98);
}

.identity-option-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.identity-option-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.enterprise-bg { background: #000; }

.identity-option-icon-text {
  font-size: 20px;
  color: #FFF;
}

.personal-bg {
  background: #F2F2F2;
  border: 1px solid #CFC4C5;
}

.personal-text { color: #86868B; }

.identity-option-info {
  flex: 1;
  min-width: 0;
}

.identity-option-name {
  font-size: 17px;
  line-height: 26px;
  font-weight: 700;
  color: #1A1C1C;
}

.identity-option-tag {
  font-size: 11px;
  line-height: 16px;
  color: #86868B;
}

.identity-check {
  font-size: 24px;
  flex-shrink: 0;
}

.check-visible {
  color: #000;
  font-variation-settings: 'FILL' 1;
}

.check-hidden { color: transparent; }

.identity-actions {
  display: flex;
  gap: 12px;
}

.identity-cancel {
  flex: 1;
  height: 56px;
  border: 1px solid #F2F2F2;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.identity-cancel:active { transform: scale(0.95); }

.identity-cancel-text {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #1A1C1C;
}

.identity-confirm {
  flex: 1;
  height: 56px;
  background: #000;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.identity-confirm:active { opacity: 0.85; }

.identity-confirm-text {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #FFF;
}

/* ===== 客服弹窗 ===== */
.contact-hero { display: flex; flex-direction: column; align-items: center; padding: 16px 0 24px; }
.contact-icon-wrap { width: 64px; height: 64px; border-radius: 50%; background: rgba(0,87,255,.1); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.contact-hi { font-size: 32px; color: #0057FF; }
.contact-sub { font-size: 15px; color: #86868B; }
.contact-phone { font-size: 24px; font-weight: 600; color: #0057FF; margin-top: 8px; }
.contact-actions { display: flex; gap: 12px; }
.ca-cancel { flex: 1; height: 56px; border: 1px solid #F2F2F2; border-radius: 9999px; display: flex; align-items: center; justify-content: center; }
.ca-cancel:active { transform: scale(.95); }
.ca-call { flex: 1; height: 56px; background: #0057FF; border-radius: 9999px; display: flex; align-items: center; justify-content: center; }
.ca-call:active { transform: scale(.95); }
.ca-ct { font-size: 13px; font-weight: 500; color: #1A1C1C; }
.ca-ct.call { color: #FFF; }

/* P6-04: 身份标签 */
.identity-tag {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 9999px;
  margin-right: 6px;
}
.enterprise-tag {
  background: #E8F3FF;
  border: 1px solid #165DFF;
}
.identity-tag-text {
  font-size: 11px;
  font-weight: 600;
  color: #165DFF;
}
</style>
