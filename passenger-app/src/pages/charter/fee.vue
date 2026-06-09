<template>
  <view class="page">
    <navbar title="费用明细" :show-back="true" />

    <scroll-view scroll-y class="main">
      <!-- 总额 banner -->
      <view class="total-card">
        <view class="total-bg" :style="{ background: car.imageGradient }" />
        <view class="total-mask" />
        <view class="total-info">
          <text class="total-label">包车出行 · 预计总额</text>
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
              <text class="bill-label">套餐价</text>
              <text class="bill-meta">{{ car.fullName }}（¥{{ pkg.price.toLocaleString() }} × {{ days }}天）</text>
            </view>
            <text class="bill-amount-primary">¥{{ subtotalText }}</text>
          </view>

          <view class="bill-divider" />

          <view class="bill-row">
            <view class="bill-info">
              <text class="bill-sub-label">夜间附加</text>
              <text class="bill-meta">0:00-5:00 出发（基础价 × 20%）</text>
            </view>
            <text class="bill-amount">¥{{ nightFee }}</text>
          </view>

          <view class="bill-row">
            <view class="bill-info">
              <text class="bill-sub-label">远调费</text>
              <text class="bill-meta">跨城跨区车辆调补差</text>
            </view>
            <text class="bill-amount">¥200</text>
          </view>

          <view class="bill-row">
            <view class="bill-info">
              <text class="bill-sub-label">超时费（预估）</text>
            </view>
            <text class="bill-amount">¥0</text>
          </view>

          <view class="bill-row">
            <view class="bill-info">
              <text class="bill-sub-label">超公里费（预估）</text>
            </view>
            <text class="bill-amount">¥0</text>
          </view>
        </view>

        <view class="rule-link" @click="onShowRule">
          <text class="rule-link-text">查看计价规则</text>
          <text class="material-symbols-outlined rule-link-icon">chevron_right</text>
        </view>
      </view>

      <!-- 费用说明 -->
      <view class="info-card">
        <text class="material-symbols-outlined info-icon">info</text>
        <view class="info-text">
          <text class="info-title">费用说明</text>
          <text class="info-desc">超时/超公里费按实际行程结算。套餐未用完时长/里程不退款。如产生高速费、停车费等将由乘客线下支付或据实代垫。</text>
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
  { id: 0, fullName: '增程星辉尊享版', imageGradient: 'linear-gradient(135deg, #2c2c2e 0%, #1a1a1c 50%, #0a0a0c 100%)' },
  { id: 1, fullName: '增程星辉行政版', imageGradient: 'linear-gradient(135deg, #3a3a3c 0%, #1f1f21 50%, #0d0d0f 100%)' },
  { id: 2, fullName: '增程星耀行政版', imageGradient: 'linear-gradient(135deg, #4a4a4c 0%, #252527 50%, #101012 100%)' },
];

const pkgMap: Record<string, { tier: string; spec: string; price: number }> = {
  'a-h-base': { tier: '尊享基础', spec: '半日租 · 4h/50km', price: 988 },
  'a-h-pro': { tier: '尊荣高级', spec: '半日租 · 4h/50km', price: 1188 },
  'a-h-top': { tier: '尊御顶级', spec: '半日租 · 4h/50km', price: 1588 },
  'a-f-base': { tier: '尊享基础', spec: '日租 · 8h/100km', price: 1888 },
  'a-f-pro': { tier: '尊荣高级', spec: '日租 · 8h/100km', price: 2088 },
  'a-f-top': { tier: '尊御顶级', spec: '日租 · 8h/100km', price: 2688 },
  'b-h-base': { tier: '尊享基础', spec: '半日租 · 4h/50km', price: 1088 },
  'b-h-pro': { tier: '尊荣高级', spec: '半日租 · 4h/50km', price: 1288 },
  'b-h-top': { tier: '尊御顶级', spec: '半日租 · 4h/50km', price: 1688 },
  'b-f-base': { tier: '尊享基础', spec: '日租 · 8h/100km', price: 1988 },
  'b-f-pro': { tier: '尊荣高级', spec: '日租 · 8h/100km', price: 2288 },
  'b-f-top': { tier: '尊御顶级', spec: '日租 · 8h/100km', price: 2888 },
  'c-h-base': { tier: '尊享基础', spec: '半日租 · 4h/50km', price: 1288 },
  'c-h-pro': { tier: '尊荣高级', spec: '半日租 · 4h/50km', price: 1588 },
  'c-h-top': { tier: '尊御顶级', spec: '半日租 · 4h/50km', price: 1888 },
  'c-f-base': { tier: '尊享基础', spec: '日租 · 8h/100km', price: 2288 },
  'c-f-pro': { tier: '尊荣高级', spec: '日租 · 8h/100km', price: 2688 },
  'c-f-top': { tier: '尊御顶级', spec: '日租 · 8h/100km', price: 3288 },
};

const carIdx = ref(0);
const pkgId = ref('a-f-pro');
const days = ref(1);

onLoad((opts: Record<string, string> | undefined) => {
  if (opts) {
    if (opts.carIdx !== undefined) carIdx.value = parseInt(opts.carIdx, 10) || 0;
    if (opts.pkgId) pkgId.value = opts.pkgId;
    if (opts.days) days.value = parseInt(opts.days, 10) || 1;
  }
});

const car = computed(() => carData[carIdx.value] || carData[0]);
const pkg = computed(() => pkgMap[pkgId.value] || pkgMap['a-f-pro']);

const subtotal = computed(() => pkg.value.price * days.value);
const subtotalText = computed(() => subtotal.value.toLocaleString());
const nightFee = computed(() => Math.round(subtotal.value * 0.2));
const total = computed(() => subtotal.value + nightFee.value + 200);
const totalText = computed(() => total.value.toLocaleString());

const onShowRule = () => {
  uni.showToast({ title: '查看计价规则', icon: 'none' });
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

/* ===== 总额 ===== */
.total-card {
  position: relative;
  margin: 16px 24px 0;
  height: 160px;
  border-radius: 32px;
  overflow: hidden;
}

.total-bg {
  position: absolute;
  inset: 0;
}

.total-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 100%);
}

.total-info {
  position: absolute;
  bottom: 24px;
  left: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.total-label {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.total-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.total-symbol {
  font-size: 22px;
  font-weight: 700;
  color: #FFFFFF;
}

.total-value {
  font-size: 36px;
  line-height: 44px;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: -0.02em;
}

/* ===== 计费清单卡 ===== */
.card {
  margin: 24px 24px 0;
  background: #FFFFFF;
  border: 1px solid #F2F2F2;
  border-radius: 32px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.card-title {
  display: block;
  padding: 0 8px 16px;
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: #000000;
}

.bill-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bill-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
}

.bill-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bill-label {
  font-size: 17px;
  line-height: 26px;
  color: #000000;
}

.bill-sub-label {
  font-size: 15px;
  line-height: 22px;
  color: #5D5F5F;
}

.bill-meta {
  font-size: 11px;
  line-height: 16px;
  color: #86868B;
}

.bill-amount {
  font-size: 15px;
  line-height: 22px;
  color: #000000;
  flex-shrink: 0;
}

.bill-amount-primary {
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: #000000;
  flex-shrink: 0;
}

.bill-divider {
  height: 1px;
  background: #F2F2F2;
  margin: 0 8px;
}

.rule-link {
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  &:active {
    opacity: 0.7;
  }
}

.rule-link-text {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #0057FF;
}

.rule-link-icon {
  font-size: 18px;
  color: #0057FF;
}

/* ===== 说明卡 ===== */
.info-card {
  margin: 16px 24px 0;
  padding: 20px;
  background: #EEEEEE;
  border-radius: 24px;
  display: flex;
  gap: 12px;
}

.info-icon {
  font-size: 22px;
  color: #86868B;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-title {
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  color: #1A1C1C;
}

.info-desc {
  font-size: 13px;
  line-height: 22px;
  color: #86868B;
}
</style>
