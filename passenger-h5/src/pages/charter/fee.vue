<template>
  <view class="page">
    <navbar title="费用明细" :show-back="true" />

    <scroll-view scroll-y class="main">
      <!-- 总额 banner -->
      <view class="total-card">
        <view class="total-bg" :style="{ background: car.imageGradient }" />
        <view class="total-mask" />
        <view class="total-info">
          <text class="total-label">包车出行 · 总额</text>
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
          <!-- 套餐价：折后金额（右） + 共优惠xxx元（左标签） -->
          <view class="bill-row primary">
            <view class="bill-info">
              <text class="bill-label">
                套餐价<template v-if="hasDiscount">（共优惠{{ savingsText }}元）</template>
              </text>
              <text v-if="!hasDiscount" class="bill-meta">{{ car.fullName }}（¥{{ pkg.price.toLocaleString() }} × {{ days }}天）</text>
            </view>
            <text class="bill-amount-primary">¥{{ netSubtotalText }}</text>
          </view>
          <!-- 原总额（右对齐划线，仅折扣时展示） -->
          <view v-if="hasDiscount" class="bill-row">
            <text />
            <text class="bill-amount-orig">¥{{ subtotalText }}</text>
          </view>

          <!-- 灰底明细框：套餐单价 / 说明 / 天数 -->
          <view v-if="hasDiscount" class="bill-detail-box">
            <view class="bill-detail-row">
              <text class="bill-detail-label">套餐单价</text>
              <text class="bill-detail-value">¥{{ unitPriceText }}</text>
            </view>
            <view class="bill-detail-row">
              <text class="bill-detail-meta">包车{{ days }}天，享{{ discountLabel }}</text>
              <text class="bill-detail-orig">¥{{ pkg.price.toLocaleString() }}</text>
            </view>
            <view class="bill-detail-row">
              <text class="bill-detail-label">包车天数</text>
              <text class="bill-detail-value">{{ days }}天</text>
            </view>
          </view>

          <!-- 有产生的费用才展示；夜间附加费已移除 -->
          <view v-if="false" class="bill-row">
            <view class="bill-info">
              <text class="bill-sub-label">等待费</text>
              <text class="bill-meta">免费 {{ feeRule.freeWaitMinutes }} 分钟，超出 ¥{{ feeRule.waitPerMinute }}/分钟</text>
            </view>
            <text class="bill-amount">¥0</text>
          </view>

          <view v-if="false" class="bill-row">
            <view class="bill-info">
              <text class="bill-sub-label">超时长费</text>
              <text class="bill-meta">¥{{ feeRule.overtimePerHour }} / 小时</text>
            </view>
            <text class="bill-amount">¥0</text>
          </view>

          <view v-if="false" class="bill-row">
            <view class="bill-info">
              <text class="bill-sub-label">超公里费</text>
              <text class="bill-meta">¥{{ feeRule.overKmPerKm }} / 公里</text>
            </view>
            <text class="bill-amount">¥0</text>
          </view>

          <view v-if="remoteDispatchFee > 0" class="bill-row">
            <view class="bill-info">
              <text class="bill-sub-label">远调费</text>
              <text class="bill-meta">接/送远调超出运营范围按梯度收费：{{ remoteDispatchMeta }}</text>
            </view>
            <text class="bill-amount" :class="{ pending: remoteDispatchFee > 0 }">¥{{ remoteDispatchFee }}</text>
          </view>
        </view>

        <view class="rule-link" @click="onShowRule">
          <text class="rule-link-text">计费规则</text>
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
import {
  charterCars,
  findPkgById,
  calcNightSurcharge,
  nightSurchargeConfig,
  getDiscountLabel,
  calcDiscountSavings,
  calcDiscountedUnit,
} from '@/data/charter';

const carIdx = ref(0);
const pkgId = ref('a-f-pro');
const days = ref(1);
const departTime = ref('09:00');

onLoad((opts: Record<string, string> | undefined) => {
  if (opts) {
    if (opts.carIdx !== undefined) carIdx.value = parseInt(opts.carIdx, 10) || 0;
    if (opts.pkgId) pkgId.value = opts.pkgId;
    if (opts.days) days.value = parseInt(opts.days, 10) || 1;
    if (opts.time) departTime.value = decodeURIComponent(opts.time);
  }
});

const car = computed(() => charterCars[carIdx.value] || charterCars[0]);
const pkg = computed(() => findPkgById(pkgId.value)?.pkg || charterCars[0].packages[4]);
const feeRule = computed(() => car.value.feeRule);

const subtotal = computed(() => pkg.value.price * days.value);
const subtotalText = computed(() => subtotal.value.toLocaleString());

/* 梯度折扣：按包车天数让利 */
const discountSavings = computed(() => calcDiscountSavings(pkg.value.price, days.value));
const discountLabel = computed(() => getDiscountLabel(days.value));
const hasDiscount = computed(() => discountSavings.value > 0);
const savingsText = computed(() => discountSavings.value.toLocaleString());

/* 折后小计（套餐价行金额） */
const netSubtotal = computed(() => subtotal.value - discountSavings.value);
const netSubtotalText = computed(() => netSubtotal.value.toLocaleString());
/* 套餐单价（折后；仅展示用） */
const unitPriceText = computed(() => calcDiscountedUnit(pkg.value.price, days.value).toLocaleString());

const isNightDepart = computed(() => {
  const hh = parseInt(departTime.value.split(':')[0] || '0', 10);
  return hh >= nightSurchargeConfig.startHour && hh < nightSurchargeConfig.endHour;
});

const nightSurcharge = computed(() => calcNightSurcharge(subtotal.value, departTime.value));
const nightSurchargeText = computed(() => `¥${nightSurcharge.value}`);

// 远调费：预估阶段默认 ¥0，实际按接/送点超出运营范围的直线距离 × 梯度单价结算
const remoteDispatchFee = ref(0);
const remoteDispatchMeta = computed(() => {
  const tiers = car.value.feeRule?.remoteDispatchTiers;
  if (!tiers || tiers.length === 0) return '未配置';
  return tiers.map(t => `${t.fromKm}~${t.toKm === -1 ? '∞' : t.toKm}km ¥${t.amount}`).join(' | ');
});

const total = computed(() => netSubtotal.value + remoteDispatchFee.value);
const totalText = computed(() => total.value.toLocaleString());

const onShowRule = () => {
  uni.navigateTo({ url: '/pages/webview/index?src=/pricingcharter.html' })
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

.bill-meta-orig {
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  color: #86868B;
  text-decoration: line-through;
}

.bill-amount-orig {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #86868B;
  text-decoration: line-through;
  flex-shrink: 0;
}

.bill-amount {
  font-size: 15px;
  line-height: 22px;
  color: #000000;
  flex-shrink: 0;

  &.pending {
    color: #FF7D00;
  }

  &.discount {
    color: #FF7D00;
    font-weight: 600;
  }
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

/* ===== 灰底明细框 ===== */
.bill-detail-box {
  margin: 0 8px;
  padding: 12px 16px;
  background: #F5F5F7;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bill-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bill-detail-label {
  font-size: 13px;
  line-height: 18px;
  color: #5D5F5F;
}

.bill-detail-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.bill-detail-value {
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: #000000;
}

.bill-detail-orig {
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  color: #86868B;
  text-decoration: line-through;
}

.bill-detail-meta {
  font-size: 12px;
  line-height: 16px;
  color: #86868B;
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

</style>
