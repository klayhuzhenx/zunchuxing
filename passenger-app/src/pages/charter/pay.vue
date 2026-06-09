<template>
  <view class="page" :class="`page-${method}`">
    <!-- 顶部品牌栏（模拟聚合支付的伪装样式） -->
    <view class="brand-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="brand-back" @click="onBack">
        <text class="material-symbols-outlined">close</text>
      </view>
      <view class="brand-title">
        <text class="brand-title-text">{{ brandTitle }}</text>
      </view>
      <view class="brand-more">
        <text class="material-symbols-outlined">more_horiz</text>
      </view>
    </view>

    <scroll-view scroll-y class="main">
      <!-- 商户信息 -->
      <view class="merchant-block">
        <view class="merchant-logo" :class="`merchant-logo-${method}`">
          <text class="material-symbols-outlined merchant-icon">domain</text>
        </view>
        <text class="merchant-name">尊出行 · 包车出行</text>
        <text class="merchant-sub">上海和行科技有限公司</text>
      </view>

      <!-- 金额 -->
      <view class="amount-block">
        <text class="amount-label">付款金额</text>
        <view class="amount-row">
          <text class="amount-symbol">¥</text>
          <text class="amount-value">{{ totalText }}</text>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="info-card">
        <view class="info-row">
          <text class="info-label">订单号</text>
          <text class="info-value mono">{{ orderNo }}</text>
        </view>
        <view class="info-divider" />
        <view class="info-row">
          <text class="info-label">商品</text>
          <text class="info-value">包车出行 · {{ pkg.tier }}</text>
        </view>
        <view class="info-divider" />
        <view class="info-row">
          <text class="info-label">乘车人</text>
          <text class="info-value">{{ passengerName }} · {{ passengerPhone }}</text>
        </view>
        <view class="info-divider" />
        <view class="info-row">
          <text class="info-label">用车时长</text>
          <text class="info-value">{{ days }} 天</text>
        </view>
      </view>

      <!-- 支付方式 -->
      <view class="method-card">
        <view class="method-row">
          <view class="method-left">
            <view class="method-icon-wrap" :class="`method-icon-${method}`">
              <text class="material-symbols-outlined method-icon">{{ methodIcon }}</text>
            </view>
            <view>
              <text class="method-name">{{ methodName }}</text>
              <text class="method-desc">{{ methodDesc }}</text>
            </view>
          </view>
          <view class="method-radio active">
            <view class="method-radio-inner" />
          </view>
        </view>
      </view>

      <!-- 安全提示 -->
      <view class="security-tip">
        <text class="material-symbols-outlined security-icon">verified_user</text>
        <text class="security-text">本次交易由{{ methodFullName }}担保，全程加密保障资金安全</text>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>

    <!-- Footer -->
    <view class="footer">
      <view class="pay-btn" :class="`pay-btn-${method}`" @click="onPayConfirm">
        <text v-if="!paying" class="pay-btn-text">确认支付 ¥{{ totalText }}</text>
        <view v-else class="pay-btn-loading">
          <view class="loading-dot" style="animation-delay: 0s" />
          <view class="loading-dot" style="animation-delay: 0.15s" />
          <view class="loading-dot" style="animation-delay: 0.3s" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const pkgMap: Record<string, { tier: string; spec: string }> = {
  'a-h-base': { tier: '尊享基础', spec: '半日租 · 4h/50km' },
  'a-h-pro': { tier: '尊荣高级', spec: '半日租 · 4h/50km' },
  'a-h-top': { tier: '尊御顶级', spec: '半日租 · 4h/50km' },
  'a-f-base': { tier: '尊享基础', spec: '日租 · 8h/100km' },
  'a-f-pro': { tier: '尊荣高级', spec: '日租 · 8h/100km' },
  'a-f-top': { tier: '尊御顶级', spec: '日租 · 8h/100km' },
  'b-h-base': { tier: '尊享基础', spec: '半日租 · 4h/50km' },
  'b-h-pro': { tier: '尊荣高级', spec: '半日租 · 4h/50km' },
  'b-h-top': { tier: '尊御顶级', spec: '半日租 · 4h/50km' },
  'b-f-base': { tier: '尊享基础', spec: '日租 · 8h/100km' },
  'b-f-pro': { tier: '尊荣高级', spec: '日租 · 8h/100km' },
  'b-f-top': { tier: '尊御顶级', spec: '日租 · 8h/100km' },
  'c-h-base': { tier: '尊享基础', spec: '半日租 · 4h/50km' },
  'c-h-pro': { tier: '尊荣高级', spec: '半日租 · 4h/50km' },
  'c-h-top': { tier: '尊御顶级', spec: '半日租 · 4h/50km' },
  'c-f-base': { tier: '尊享基础', spec: '日租 · 8h/100km' },
  'c-f-pro': { tier: '尊荣高级', spec: '日租 · 8h/100km' },
  'c-f-top': { tier: '尊御顶级', spec: '日租 · 8h/100km' },
};

const statusBarHeight = ref(0);
const method = ref<'wechat' | 'alipay'>('wechat');
const totalText = ref('2,088.00');
const orderNo = ref('ZC2026060988540');
const carIdx = ref(0);
const pkgId = ref('a-f-pro');
const days = ref(1);
const passengerName = ref('本人 (张先生)');
const passengerPhone = ref('138****8888');
const paying = ref(false);

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 0;
});

onLoad((opts: Record<string, string> | undefined) => {
  if (!opts) return;
  if (opts.method === 'wechat' || opts.method === 'alipay') method.value = opts.method;
  if (opts.total) totalText.value = decodeURIComponent(opts.total);
  if (opts.orderNo) orderNo.value = opts.orderNo;
  if (opts.carIdx !== undefined) carIdx.value = parseInt(opts.carIdx, 10) || 0;
  if (opts.pkgId) pkgId.value = opts.pkgId;
  if (opts.days) days.value = parseInt(opts.days, 10) || 1;
  if (opts.passenger) passengerName.value = decodeURIComponent(opts.passenger);
  if (opts.phone) passengerPhone.value = decodeURIComponent(opts.phone);
});

const pkg = computed(() => pkgMap[pkgId.value] || pkgMap['a-f-pro']);

const brandTitle = computed(() => (method.value === 'wechat' ? '微信支付' : '支付宝'));
const methodName = computed(() => (method.value === 'wechat' ? '零钱通' : '余额宝'));
const methodDesc = computed(() =>
  method.value === 'wechat' ? '可用余额 ¥12,388.00' : '可用余额 ¥9,820.50'
);
const methodFullName = computed(() => (method.value === 'wechat' ? '微信支付' : '蚂蚁科技'));
const methodIcon = computed(() => (method.value === 'wechat' ? 'savings' : 'account_balance'));

const buildSuccessUrl = (status: 'paid' | 'pending') => {
  const params = [
    `carIdx=${carIdx.value}`,
    `pkgId=${pkgId.value}`,
    `days=${days.value}`,
    `status=${status}`,
    `pay=${method.value}`,
    `passenger=${encodeURIComponent(passengerName.value)}`,
    `phone=${encodeURIComponent(passengerPhone.value)}`,
    `total=${encodeURIComponent(totalText.value)}`,
    `orderNo=${orderNo.value}`,
  ].join('&');
  return `/pages/charter/success?${params}`;
};

const onPayConfirm = () => {
  if (paying.value) return;
  paying.value = true;
  /* 模拟聚合支付：800ms 跳成功 */
  setTimeout(() => {
    paying.value = false;
    uni.redirectTo({ url: buildSuccessUrl('paid') });
  }, 800);
};

const onBack = () => {
  /* 返回 = 取消支付，生成待支付订单 */
  uni.showModal({
    title: '确认离开？',
    content: '订单未完成支付，离开后订单将保存为「待支付」状态，请在 30 分钟内完成支付',
    confirmText: '确认离开',
    cancelText: '继续支付',
    success: (res) => {
      if (res.confirm) {
        uni.redirectTo({ url: buildSuccessUrl('pending') });
      }
    },
  });
};
</script>

<style lang="scss" scoped>
.page {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-wechat {
  background: #EDEDED;
}

.page-alipay {
  background: #F5F5F5;
}

/* ===== 品牌栏 ===== */
.brand-bar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 56px;
  flex-shrink: 0;
}

.page-wechat .brand-bar {
  background: #EDEDED;
}

.page-alipay .brand-bar {
  background: #F5F5F5;
}

.brand-back,
.brand-more {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;

  .material-symbols-outlined {
    font-size: 22px;
    color: #1A1C1C;
  }

  &:active {
    opacity: 0.6;
  }
}

.brand-title-text {
  font-size: 17px;
  line-height: 26px;
  font-weight: 600;
  color: #1A1C1C;
}

.main {
  flex: 1;
  min-height: 0;
}

.bottom-spacer {
  height: 120px;
}

/* ===== 商户信息 ===== */
.merchant-block {
  padding: 32px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

.merchant-logo {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.merchant-logo-wechat {
  background: #07C160;
}

.merchant-logo-alipay {
  background: #1677FF;
}

.merchant-icon {
  font-size: 28px;
  color: #FFFFFF;
}

.merchant-name {
  font-size: 17px;
  line-height: 26px;
  font-weight: 600;
  color: #1A1C1C;
}

.merchant-sub {
  font-size: 13px;
  line-height: 18px;
  color: #86868B;
}

/* ===== 金额 ===== */
.amount-block {
  padding: 16px 24px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.amount-label {
  font-size: 13px;
  line-height: 18px;
  color: #86868B;
}

.amount-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.amount-symbol {
  font-size: 24px;
  font-weight: 700;
  color: #1A1C1C;
}

.amount-value {
  font-size: 44px;
  line-height: 52px;
  font-weight: 700;
  color: #1A1C1C;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

/* ===== 信息卡 ===== */
.info-card {
  margin: 0 16px 16px;
  background: #FFFFFF;
  border-radius: 12px;
  padding: 4px 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  gap: 16px;
}

.info-label {
  flex-shrink: 0;
  font-size: 14px;
  line-height: 20px;
  color: #86868B;
}

.info-value {
  flex: 1;
  text-align: right;
  font-size: 14px;
  line-height: 20px;
  color: #1A1C1C;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-value.mono {
  font-family: 'SF Mono', Menlo, monospace;
  letter-spacing: 0.02em;
}

.info-divider {
  height: 1px;
  background: #F2F2F2;
}

/* ===== 支付方式 ===== */
.method-card {
  margin: 0 16px 16px;
  background: #FFFFFF;
  border-radius: 12px;
  padding: 4px 16px;
}

.method-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
}

.method-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.method-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.method-icon-wechat {
  background: rgba(7, 193, 96, 0.12);

  .method-icon {
    color: #07C160;
  }
}

.method-icon-alipay {
  background: rgba(22, 119, 255, 0.12);

  .method-icon {
    color: #1677FF;
  }
}

.method-icon {
  font-size: 22px;
}

.method-name {
  font-size: 15px;
  line-height: 22px;
  font-weight: 500;
  color: #1A1C1C;
  display: block;
}

.method-desc {
  font-size: 12px;
  line-height: 16px;
  color: #86868B;
  display: block;
  margin-top: 2px;
}

.method-radio {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #E2E2E2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.method-radio.active {
  border-color: #07C160;
}

.page-alipay .method-radio.active {
  border-color: #1677FF;
}

.method-radio-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #07C160;
}

.page-alipay .method-radio-inner {
  background: #1677FF;
}

/* ===== 安全提示 ===== */
.security-tip {
  margin: 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 16px 0;
}

.security-icon {
  font-size: 14px;
  color: #86868B;
}

.security-text {
  font-size: 11px;
  line-height: 16px;
  color: #86868B;
}

/* ===== Footer ===== */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  padding: 16px 16px calc(24px + env(safe-area-inset-bottom, 0px));
  background: inherit;
}

.page-wechat .footer {
  background: #EDEDED;
}

.page-alipay .footer {
  background: #F5F5F5;
}

.pay-btn {
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.85;
  }
}

.pay-btn-wechat {
  background: #07C160;
}

.pay-btn-alipay {
  background: #1677FF;
}

.pay-btn-text {
  font-size: 17px;
  line-height: 26px;
  font-weight: 600;
  color: #FFFFFF;
}

.pay-btn-loading {
  display: flex;
  align-items: center;
  gap: 6px;
}

.loading-dot {
  width: 8px;
  height: 8px;
  background: #FFFFFF;
  border-radius: 50%;
  animation: loading-bounce 0.9s infinite ease-in-out;
}

@keyframes loading-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.6; }
  40% { transform: scale(1); opacity: 1; }
}
</style>
