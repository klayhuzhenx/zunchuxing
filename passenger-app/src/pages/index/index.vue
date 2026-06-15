<template>
  <view class="page">
    <!-- 顶部 sticky header -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-inner">
        <view>
          <text class="header-title">尊出行</text>
          <text v-if="enterpriseName" class="header-enterprise">{{ enterpriseName }}</text>
        </view>
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

    </view>

    <!-- 底部 tab bar -->
    <tab-bar current="home" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TabBar from '@/components/tab-bar.vue';

const statusBarHeight = ref(0);
const enterpriseName = ref('');

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 0;
  const token = uni.getStorageSync('token');
  if (token) {
    enterpriseName.value = '华为技术有限公司';
  }
});

const onMenu = () => {
  uni.showToast({ title: '菜单', icon: 'none' });
};

const goCharter = () => uni.navigateTo({ url: '/pages/charter/index' });
const goRental = () => uni.navigateTo({ url: '/pages/rental/index' });
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  background: #F9F9F9;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ===== Main ===== */
.main {
  flex: 1;
  height: 0;
  padding-bottom: 24px;
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

.header-enterprise {
  display: block;
  font-size: 12px;
  color: #86868B;
  font-weight: 500;
  margin-top: 2px;
}
</style>
