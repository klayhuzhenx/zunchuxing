<template>
  <view class="root">
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar" @click="back">
        <text class="material-symbols-outlined hicon">arrow_back</text>
        <text class="htitle">企业管理</text>
      </view>
    </view>

    <view class="body">
      <view class="hero">
        <view class="hero-icon">
          <text class="material-symbols-outlined hero-icon-text ms-fill">corporate_fare</text>
        </view>
        <text class="hero-name">上海禧合科技有限公司</text>
      </view>

      <view class="stats">
        <view class="stat">
          <text class="stat-label">员工总数</text>
          <text class="stat-value">20</text>
        </view>
        <view class="stat">
          <text class="stat-label">剩余额度</text>
          <text class="stat-value">¥37,550.00</text>
        </view>
      </view>

      <view class="menu">
        <view class="menu-item" @click="nav('/pages/enterprise/staff')">
          <view class="menu-left">
            <view class="menu-icon"><text class="material-symbols-outlined">groups</text></view>
            <view class="menu-info">
              <text class="menu-title">员工管理</text>
              <text class="menu-desc">添加、修改或移除企业成员</text>
            </view>
          </view>
          <text class="material-symbols-outlined menu-arr">chevron_right</text>
        </view>
        <view class="menu-item menu-last" @click="nav('/pages/enterprise/records')">
          <view class="menu-left">
            <view class="menu-icon"><text class="material-symbols-outlined">receipt_long</text></view>
            <view class="menu-info">
              <text class="menu-title">额度消费记录</text>
              <text class="menu-desc">查看详细的账单与还款明细</text>
            </view>
          </view>
          <text class="material-symbols-outlined menu-arr">chevron_right</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const top = ref(0);
onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0; });
const back = () => uni.navigateBack();
const nav = (u: string) => uni.navigateTo({ url: u });
</script>

<style lang="scss" scoped>
.root { min-height: 100vh; background: #F9F9F9; }
.header { background: #F9F9F9; }
.hbar { height: 56px; padding: 0 24px; display: flex; align-items: center; gap: 16px; }
.hbar:active { opacity: 0.7; }
.hicon { font-size: 24px; color: #000; }
.htitle { font-size: 20px; font-weight: 700; color: #000; }

.body { padding: 32px 24px 40px; }

.hero { display: flex; flex-direction: column; align-items: center; margin-bottom: 48px; }
.hero-icon { width: 80px; height: 80px; background: #000; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
.hero-icon-text { font-size: 40px; color: #FFF; }
.hero-name { font-size: 22px; font-weight: 600; color: #000; }

.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
.stat { background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; padding: 24px; }
.stat-label { font-size: 11px; color: #86868B; display: block; margin-bottom: 4px; }
.stat-value { font-size: 22px; font-weight: 600; color: #000; display: block; }

.menu { background: #FFF; border: 1px solid #F2F2F2; border-radius: 24px; overflow: hidden; }
.menu-item { display: flex; align-items: center; justify-content: space-between; padding: 24px; }
.menu-item:active { opacity: 0.8; transform: scale(0.98); }
.menu-last { border-top: 1px solid #F2F2F2; }
.menu-left { display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0; }
.menu-icon { width: 48px; height: 48px; background: #F2F2F2; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.menu-icon .material-symbols-outlined { font-size: 22px; color: #000; }
.menu-info { flex: 1; min-width: 0; }
.menu-title { font-size: 17px; font-weight: 600; color: #000; display: block; }
.menu-desc { font-size: 11px; color: #86868B; display: block; margin-top: 2px; }
.menu-arr { font-size: 22px; color: #86868B; }
</style>
