<template>
  <view class="page">
    <!-- 顶部 sticky header -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-inner">
        <text class="header-title">尊出行</text>
        <view class="header-profile" @click="goProfile">
          <text class="material-symbols-outlined header-profile-icon">person</text>
        </view>
      </view>
    </view>

    <!-- 主内容 -->
    <scroll-view scroll-y class="main">
      <!-- 服务入口卡片 -->
      <view class="cards">
        <!-- 包车出行 -->
        <view class="card" @click="goCharter">
          <image
            class="card-img"
            src="/static/image-5.png"
            mode="aspectFill"
          />
          <view class="card-gradient" />
          <view class="card-content">
            <text class="card-badge">尊享服务</text>
            <text class="card-title">包车出行</text>
            <text class="card-desc">专业司机 · 定制行程</text>
          </view>
          <view class="card-arrow">
            <text class="material-symbols-outlined">arrow_outward</text>
          </view>
        </view>

        <!-- 租车出行 -->
        <view class="card" @click="goRental">
          <image
            class="card-img"
            src="/static/image-4.png"
            mode="aspectFill"
          />
          <view class="card-gradient" />
          <view class="card-content">
            <text class="card-badge">自由驾享</text>
            <text class="card-title">租车出行</text>
            <text class="card-desc">自驾随心 · 一日起程</text>
          </view>
          <view class="card-arrow">
            <text class="material-symbols-outlined">arrow_outward</text>
          </view>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const statusBarHeight = ref(0);

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 0;
});

const goCharter = () => uni.navigateTo({ url: '/pages/charter/index' });
const goRental = () => uni.navigateTo({ url: '/pages/rental/index' });
const goProfile = () => uni.navigateTo({ url: '/pages/profile/index' });
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  background: #F8FAFC;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ===== Header ===== */
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.header-inner {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-title {
  font-size: 24px;
  line-height: 32px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #000000;
}

.header-profile {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #F2F2F2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-profile-icon {
  font-size: 22px;
  color: #1A1C1C;
}

.header-profile:active {
  opacity: 0.7;
}

/* ===== Main ===== */
.main {
  flex: 1;
  height: 0;
}

.bottom-spacer {
  height: 32px;
}

/* ===== 卡片 ===== */
.cards {
  padding: 32px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  position: relative;
  width: 100%;
  aspect-ratio: 5 / 4;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);

  &:active {
    transform: scale(0.97);
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.card-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transition: transform 1s ease;
}

.card:active .card-img {
  transform: scale(1.05);
}

.card-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.6), transparent, transparent);
}

.card-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 32px 32px;
}

.card-badge {
  display: inline-block;
  font-size: 10px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #FFFFFF;
  background: #0052FF;
  padding: 2px 6px;
  border-radius: 9999px;
  margin-bottom: 8px;
  width: fit-content;
}

.card-title {
  display: block;
  font-size: 24px;
  line-height: 32px;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 4px;
}

.card-desc {
  display: block;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  letter-spacing: 0.01em;
  color: rgba(255, 255, 255, 0.8);
}

.card-arrow {
  position: absolute;
  bottom: 24px;
  right: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);

  .material-symbols-outlined {
    font-size: 14px;
    color: #FFFFFF;
  }
}
</style>
