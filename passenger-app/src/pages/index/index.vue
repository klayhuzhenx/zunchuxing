<template>
  <view class="page">
    <!-- 顶部 sticky header -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-inner">
        <text class="header-title">尊出行</text>
      </view>
    </view>

    <!-- 主内容 -->
    <view class="main">
      <!-- Banner -->
      <view class="section banner-section">
        <view class="banner">
          <!-- 实际图片可替换为 <image src="..." mode="aspectFill" /> -->
          <view class="banner-img" />
          <view class="banner-mask" />
          <view class="banner-content">
            <text class="banner-title">尊出行</text>
            <text class="banner-subtitle">高端出行服务平台</text>
          </view>
          <view class="banner-dots">
            <view class="dot dot-active" />
            <view class="dot" />
          </view>
        </view>
      </view>

      <!-- 服务入口 2x2 grid -->
      <view class="section service-section">
        <view class="service-grid">
          <view class="service-card" @click="goCharter">
            <view class="service-icon-wrap">
              <text class="material-symbols-outlined service-icon">directions_car</text>
            </view>
            <text class="service-title">包车出行</text>
            <text class="service-desc">4h / 8h 套餐</text>
          </view>
          <view class="service-card" @click="goRental">
            <view class="service-icon-wrap">
              <text class="material-symbols-outlined service-icon">vpn_key</text>
            </view>
            <text class="service-title">租车出行</text>
            <text class="service-desc">尊界车主专享</text>
          </view>
        </view>
      </view>

      <!-- 尊享权益 -->
      <view class="section">
        <view class="benefit-card">
          <view class="benefit-bg" />
          <view class="benefit-mask" />
          <view class="benefit-top">
            <view class="benefit-text">
              <text class="benefit-title">尊享权益</text>
              <text class="benefit-subtitle">尊界 S800 专属特权服务</text>
            </view>
            <view class="benefit-cta" @click="goOwnerCert">
              <text class="benefit-cta-text">认证领取</text>
            </view>
          </view>
          <view class="benefit-chips">
            <text class="benefit-chip">免费租车权益</text>
            <text class="benefit-chip">尊享机场接送</text>
            <text class="benefit-chip">专属管家服务</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部 tab bar -->
    <tab-bar current="home" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TabBar from '@/components/tab-bar.vue';

const statusBarHeight = ref(0);

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 0;
});

const onMenu = () => {
  uni.showToast({ title: '菜单', icon: 'none' });
};

const goCharter = () => uni.navigateTo({ url: '/pages/charter/index' });
const goRental = () => uni.navigateTo({ url: '/pages/rental/index' });
const goOwnerCert = () => uni.showToast({ title: '尊界车主认证', icon: 'none' });
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F9F9F9;
  display: flex;
  flex-direction: column;
}

/* ===== Header ===== */
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #F9F9F9;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
}

.header-inner {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -8px;

  .material-symbols-outlined {
    font-size: 24px;
    color: #000000;
  }

  &:active {
    opacity: 0.7;
  }
}

.header-icon-placeholder {
  width: 24px;
  height: 24px;
}

.header-title {
  font-size: 28px;
  line-height: 36px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #000000;
}

/* ===== Main ===== */
.main {
  flex: 1;
  padding-bottom: 24px;
}

.section {
  padding: 0 24px;
  margin-top: 32px;
}

.banner-section {
  margin-top: 8px;
}

/* ===== Banner ===== */
.banner {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.banner-img {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #2c2c2e 0%, #1a1a1c 50%, #0a0a0c 100%);
  /* 真实项目可换成 <image src="https://..."/> */
}

.banner-img::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 30%, rgba(212, 175, 55, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 70%, rgba(0, 87, 255, 0.18) 0%, transparent 50%);
}

.banner-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
}

.banner-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 32px;
}

.banner-title {
  font-size: 32px;
  line-height: 40px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #FFFFFF;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.banner-subtitle {
  margin-top: 6px;
  font-size: 12px;
  line-height: 18px;
  font-weight: 500;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.banner-dots {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.dot {
  width: 6px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.4);
}

.dot-active {
  width: 24px;
  background: #FFFFFF;
}

/* ===== 服务卡片 ===== */
.service-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.service-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  background: #FFFFFF;
  border: 1px solid #F2F2F2;
  border-radius: 32px;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
    opacity: 0.9;
  }
}

.service-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #F2F2F2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.service-icon {
  font-size: 28px;
  color: #1A1C1C;
}

.service-card:active .service-icon-wrap {
  background: #000000;
}

.service-card:active .service-icon {
  color: #FFFFFF;
}

.service-title {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: #000000;
}

.service-desc {
  margin-top: 4px;
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: #86868B;
}

/* ===== 尊享权益 ===== */
.benefit-card {
  position: relative;
  background: #000000;
  border-radius: 32px;
  padding: 24px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.benefit-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.20) 0%, transparent 60%),
    radial-gradient(circle at 20% 80%, rgba(0, 87, 255, 0.15) 0%, transparent 60%),
    linear-gradient(135deg, #1a1a1c 0%, #000000 100%);
}

.benefit-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
}

.benefit-top {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.benefit-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.benefit-title {
  font-size: 22px;
  line-height: 30px;
  font-weight: 700;
  color: #FFFFFF;
}

.benefit-subtitle {
  margin-top: 4px;
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.benefit-cta {
  padding: 8px 20px;
  background: #FFFFFF;
  border-radius: 9999px;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.95);
  }
}

.benefit-cta-text {
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  color: #000000;
}

.benefit-chips {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.benefit-chip {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(212, 175, 55, 0.30);
  border-radius: 9999px;
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: #FFFFFF;
}
</style>
