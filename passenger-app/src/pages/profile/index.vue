<template>
  <view class="page">
    <!-- 头部个人信息 -->
    <view class="profile-header" :style="{ paddingTop: statusBarHeight + 16 + 'px' }">
      <view class="avatar">
        <text class="avatar-text">张</text>
      </view>
      <text class="profile-name">张先生</text>
      <text class="profile-phone">138****0000</text>

      <view v-if="userInfo.isOwner || userInfo.isEnterprise" class="profile-tags">
        <text v-if="userInfo.isOwner" class="tag owner-tag">尊界车主</text>
        <text v-if="userInfo.isEnterprise" class="tag ent-tag">企业员工</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-group">
      <view class="menu-item" @click="goTrips">
        <text class="material-symbols-outlined menu-icon">receipt_long</text>
        <text class="menu-label">行程管理</text>
        <text class="material-symbols-outlined menu-arrow">chevron_right</text>
      </view>

      <view class="menu-item" @click="goInvoice">
        <text class="material-symbols-outlined menu-icon">description</text>
        <text class="menu-label">电子发票</text>
        <text class="material-symbols-outlined menu-arrow">chevron_right</text>
      </view>

      <view v-if="userInfo.isEnterprise" class="menu-item" @click="goEnterprise">
        <text class="material-symbols-outlined menu-icon">business</text>
        <text class="menu-label">企业管理</text>
        <text class="material-symbols-outlined menu-arrow">chevron_right</text>
      </view>

      <view class="menu-item" @click="goMessages">
        <text class="material-symbols-outlined menu-icon">mail</text>
        <text class="menu-label">消息中心</text>
        <view class="menu-right">
          <view v-if="unread > 0" class="badge">
            <text class="badge-text">{{ unread > 99 ? '99+' : unread }}</text>
          </view>
          <text class="material-symbols-outlined menu-arrow">chevron_right</text>
        </view>
      </view>

      <view class="menu-item" @click="goService">
        <text class="material-symbols-outlined menu-icon">support_agent</text>
        <text class="menu-label">联系客服</text>
        <text class="material-symbols-outlined menu-arrow">chevron_right</text>
      </view>
    </view>

    <!-- 协议 -->
    <view class="menu-group">
      <view class="menu-item" @click="openProtocol('service')">
        <text class="material-symbols-outlined menu-icon">article</text>
        <text class="menu-label">服务协议</text>
        <text class="material-symbols-outlined menu-arrow">chevron_right</text>
      </view>
      <view class="menu-item" @click="openProtocol('privacy')">
        <text class="material-symbols-outlined menu-icon">shield</text>
        <text class="menu-label">隐私政策</text>
        <text class="material-symbols-outlined menu-arrow">chevron_right</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <button class="logout-btn" @click="handleLogout">退出登录</button>

    <view class="safe-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const statusBarHeight = ref(0);

const userInfo = ref({
  isOwner: true,
  isEnterprise: true,
});

const unread = ref(3);

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 0;
});

const goTrips = () => uni.switchTab({ url: '/pages/trips/index' });
const goInvoice = () => uni.navigateTo({ url: '/pages/invoice/index' });
const goEnterprise = () => uni.navigateTo({ url: '/pages/enterprise/index' });
const goMessages = () => uni.navigateTo({ url: '/pages/messages/index' });
const goService = () => uni.showToast({ title: '客服电话：400-XXX-XXXX', icon: 'none' });
const openProtocol = (type: string) => uni.showToast({ title: `查看${type === 'service' ? '服务协议' : '隐私政策'}`, icon: 'none' });
const handleLogout = () => {
  uni.showToast({ title: '已退出登录', icon: 'none' });
  setTimeout(() => uni.redirectTo({ url: '/pages/login/index' }), 500);
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F5F5F5;
}

/* ===== 头部 ===== */
.profile-header {
  background: #000000;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #FFFFFF;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 36px;
  background: #D4AF37;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.avatar-text {
  font-size: 28px;
  font-weight: 700;
  color: #000000;
}

.profile-name {
  font-size: 20px;
  font-weight: 600;
}

.profile-phone {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

.profile-tags {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.tag {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.owner-tag {
  background: rgba(212, 175, 55, 0.2);
  color: #D4AF37;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.ent-tag {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

/* ===== 菜单组 ===== */
.menu-group {
  background: #FFFFFF;
  margin: 16px 24px;
  border-radius: 24px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #F2F2F2;
  transition: background 0.15s;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #F5F5F5;
}

.menu-icon {
  font-size: 22px;
  color: #000000;
  margin-right: 12px;
  flex-shrink: 0;
}

.menu-label {
  flex: 1;
  font-size: 16px;
  color: #1D2129;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-arrow {
  font-size: 20px;
  color: #C9CDD4;
}

.badge {
  background: #F53F3F;
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

.badge-text {
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 500;
}

/* ===== 退出登录 ===== */
.logout-btn {
  margin: 24px;
  height: 52px;
  background: #FFFFFF;
  border: 1px solid #E5E6EB;
  border-radius: 24px;
  font-size: 16px;
  color: #F53F3F;
  line-height: 52px;
}

.safe-bottom {
  height: env(safe-area-inset-bottom, 0px);
}
</style>
