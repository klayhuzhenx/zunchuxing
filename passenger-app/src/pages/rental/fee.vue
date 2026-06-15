<template>
  <view class="page">
    <navbar title="费用明细" :show-back="true" />

    <scroll-view scroll-y class="main">
      <!-- 总额 banner -->
      <view class="total-card">
        <view class="total-bg" :style="{ background: car.imageGradient }" />
        <view class="total-mask" />
        <view class="total-info">
          <text class="total-label">自驾租车 · 总额</text>
          <view class="total-row">
            <text class="total-symbol">¥</text>
            <text class="total-value">{{ totalText }}</text>
          </view>
        </view>
      </view>

      <!-- 计费清单 -->
      <view class="card">
        <text class="card-title">计费清单</text>
        <view class="bill-list">
          <view class="bill-row primary">
            <view class="bill-info">
              <text class="bill-label">日租费 (单价 × 天数)</text>
              <text class="bill-meta">¥{{ car.dayPrice.toLocaleString() }} × {{ days }} 天</text>
            </view>
            <text class="bill-amount-primary">¥{{ baseTotal }}</text>
          </view>
          <view class="bill-divider" />
          <view class="bill-row">
            <view class="bill-info">
              <text class="bill-sub-label">超时长费</text>
              <text class="bill-meta">¥50 / 小时</text>
            </view>
            <text class="bill-amount">¥0.00</text>
          </view>
          <view class="bill-row">
            <view class="bill-info">
              <text class="bill-sub-label">超里程费</text>
              <text class="bill-meta">¥10 / 公里</text>
            </view>
            <text class="bill-amount">¥0.00</text>
          </view>
          <view class="bill-row">
            <view class="bill-info">
              <text class="bill-sub-label">等待费</text>
              <text class="bill-meta">免费 15 分钟，超出 ¥1/分钟</text>
            </view>
            <text class="bill-amount">¥0</text>
          </view>
          <view class="bill-row">
            <view class="bill-info">
              <text class="bill-sub-label">远调费</text>
              <text class="bill-meta">取/还远调超出运营范围按梯度收费：0~5km ¥100 | 5~10km ¥200 | 10~30km ¥400 | >30km ¥1000</text>
            </view>
            <text class="bill-amount">¥0</text>
          </view>
        </view>
        <view class="rule-link" @click="onShowRule">
          <text class="rule-link-text">查看计价规则</text>
          <text class="material-symbols-outlined rule-link-icon">chevron_right</text>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import Navbar from '@/components/navbar.vue';

const carData = [
  { id: 0, fullName: '增程星辉尊享版', dayPrice: 1500, kmPerDay: 200, imageGradient: 'linear-gradient(135deg, #2c2c2e 0%, #1a1a1c 50%, #0a0a0c 100%)' },
  { id: 1, fullName: '增程星辉行政版', dayPrice: 1800, kmPerDay: 200, imageGradient: 'linear-gradient(135deg, #3a3a3c 0%, #1f1f21 50%, #0d0d0f 100%)' },
  { id: 2, fullName: '增程星耀行政版', dayPrice: 2200, kmPerDay: 200, imageGradient: 'linear-gradient(135deg, #4a4a4c 0%, #252527 50%, #101012 100%)' },
];

const carIdx = ref(0);
const days = ref(1);

onLoad((opts: Record<string, string> | undefined) => {
  if (!opts) return;
  if (opts.carIdx !== undefined) carIdx.value = parseInt(opts.carIdx, 10) || 0;
  if (opts.days) days.value = parseInt(opts.days, 10) || 1;
});

const car = computed(() => carData[carIdx.value] || carData[0]);
const remoteDispatchFee = ref(0);
const baseTotal = computed(() => (car.value.dayPrice * days.value).toLocaleString());
const totalText = computed(() => (car.value.dayPrice * days.value + remoteDispatchFee.value).toLocaleString());

const onShowRule = () => uni.showToast({ title: '查看计价规则', icon: 'none' });
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #F9F9F9; display: flex; flex-direction: column; }
.main { flex: 1; min-height: 0; }
.bottom-spacer { height: 48px; }

.total-card { position: relative; margin: 16px 24px 0; height: 176px; border-radius: 32px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
.total-bg { position: absolute; inset: 0; }
.total-mask { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%); }
.total-info { position: absolute; bottom: 24px; left: 24px; display: flex; flex-direction: column; gap: 4px; }
.total-label { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.8); }
.total-row { display: flex; align-items: baseline; gap: 4px; }
.total-symbol { font-size: 22px; font-weight: 700; color: #FFF; }
.total-value { font-size: 36px; line-height: 44px; font-weight: 700; color: #FFF; letter-spacing: -0.02em; }

.card { margin: 24px 24px 0; background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
.card-title { display: block; padding: 0 8px 16px; font-size: 20px; font-weight: 600; color: #000; }
.bill-list { display: flex; flex-direction: column; gap: 12px; }
.bill-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; }
.bill-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.bill-label { font-size: 17px; color: #000; font-weight: 500; }
.bill-sub-label { font-size: 15px; color: #5D5F5F; }
.bill-meta { font-size: 11px; color: #86868B; }
.bill-amount { font-size: 15px; color: #000; flex-shrink: 0; }
.bill-amount.pending { color: #FF7D00; }
.bill-amount-primary { font-size: 16px; font-weight: 700; color: #000; flex-shrink: 0; }
.bill-divider { height: 1px; background: #F2F2F2; margin: 0 8px; }
.rule-link { margin-top: 24px; display: flex; align-items: center; justify-content: center; gap: 4px; }
.rule-link:active { opacity: 0.7; }
.rule-link-text { font-size: 13px; font-weight: 500; color: #0057FF; }
.rule-link-icon { font-size: 18px; color: #0057FF; }

</style>
