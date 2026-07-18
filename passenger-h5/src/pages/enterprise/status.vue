<template>
  <view class="page">
    <navbar title="提交成功" :show-back="true" />

    <view class="bg-decoration">
      <view class="bg-blob bg-blob-tr" />
      <view class="bg-blob bg-blob-bl" />
    </view>

    <view class="main">
      <!-- 状态图标 -->
      <view class="status-icon-wrap">
        <view class="status-icon">
          <text class="material-symbols-outlined icon-symbol">schedule</text>
        </view>
        <view class="status-ring" />
      </view>

      <!-- 状态文字 -->
      <view class="status-text">
        <text class="status-title">审核中</text>
        <text class="status-desc">您的企业入驻申请已提交成功。我们的专属服务顾问将在 1-3 个工作日内完成审核。</text>
      </view>

      <!-- 时间卡片 -->
      <view class="info-card">
        <view class="info-row">
          <text class="info-label">预计反馈时间</text>
          <text class="info-value">{{ feedbackDate }}</text>
        </view>
        <view class="info-divider" />
        <view class="info-tip">
          <view class="tip-dot" />
          <text class="tip-text">审核通过后，我们将通过短信通知您。如有紧急需求，请联系客服专线。</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Navbar from '@/components/navbar.vue';

const feedbackDate = ref('');

onMounted(() => {
  const d = new Date('2026-06-09T00:00:00');
  d.setDate(d.getDate() + 3);
  feedbackDate.value = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} 前`;
});
</script>

<style lang="scss" scoped>
.page {
  position: relative;
  min-height: 100vh;
  background: #F9F9F9;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.bg-decoration {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
  opacity: 0.4;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
}

.bg-blob-tr {
  top: -10%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: #E2E2E2;
}

.bg-blob-bl {
  bottom: -5%;
  left: -5%;
  width: 250px;
  height: 250px;
  background: #E8E8E8;
  filter: blur(80px);
}

.main {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 24px 48px;
}

/* ===== 状态图标 ===== */
.status-icon-wrap {
  position: relative;
  margin-bottom: 32px;
}

.status-icon {
  width: 128px;
  height: 128px;
  background: #F2F2F2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse-subtle 4s ease-in-out infinite;
}

.icon-symbol {
  font-size: 60px;
  color: #000000;
  font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24;
}

.status-ring {
  position: absolute;
  inset: -16px;
  border: 1px solid rgba(207, 196, 197, 0.3);
  border-radius: 50%;
  transform: scale(1.1);
}

@keyframes pulse-subtle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(0.98); }
}

/* ===== 状态文字 ===== */
.status-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  max-width: 320px;
}

.status-title {
  font-size: 22px;
  line-height: 30px;
  font-weight: 600;
  color: #000000;
}

.status-desc {
  font-size: 15px;
  line-height: 24px;
  color: #4C4546;
  text-align: center;
}

/* ===== 信息卡 ===== */
.info-card {
  width: 100%;
  max-width: 360px;
  padding: 20px;
  background: #FFFFFF;
  border: 1px solid #F2F2F2;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.02);
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-label {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #616363;
}

.info-value {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #000000;
}

.info-divider {
  height: 1px;
  background: #F2F2F2;
  margin: 24px 0;
}

.info-tip {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.tip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0057FF;
  margin-top: 7px;
  flex-shrink: 0;
}

.tip-text {
  flex: 1;
  font-size: 11px;
  line-height: 18px;
  color: #4C4546;
}

</style>
