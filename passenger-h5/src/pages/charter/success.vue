<template>
  <view class="page">
    <view class="bg-decoration">
      <view class="bg-blob bg-blob-tr" />
      <view class="bg-blob bg-blob-bl" />
    </view>

    <!-- 顶部 brand -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-inner" @click="goHome">
        <text class="material-symbols-outlined header-icon">arrow_back</text>
        <text class="header-title">尊出行</text>
      </view>
    </view>

    <scroll-view scroll-y class="main">
      <!-- 状态 icon -->
      <view class="success-block">
        <view class="check-wrap">
          <view class="check-glow" :class="`glow-${status}`" />
          <view class="check-circle">
            <text
              class="material-symbols-outlined check-icon"
              :class="`icon-${status}`"
            >{{ statusIcon }}</text>
          </view>
        </view>
        <text class="success-title">{{ statusTitle }}</text>
        <text class="success-sub">{{ statusSub }}</text>

        <!-- 待支付倒计时 -->
        <view v-if="status === 'pending'" class="countdown">
          <text class="material-symbols-outlined countdown-icon">schedule</text>
          <text class="countdown-text">请在 {{ countdownText }} 内完成支付，超时订单将自动取消</text>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="order-card">
        <view class="order-row order-head">
          <text class="order-label">订单编号</text>
          <text class="order-value mono">{{ orderNo }}</text>
        </view>

        <view class="order-item">
          <view class="order-icon-wrap">
            <text class="material-symbols-outlined order-icon">directions_car</text>
          </view>
          <view class="order-content">
            <text class="order-content-title">{{ car.fullName }}</text>
            <text class="order-content-desc">{{ pkg.tier }} · {{ pkg.spec }}</text>
          </view>
        </view>

        <view class="order-item">
          <view class="order-icon-wrap">
            <text class="material-symbols-outlined order-icon">calendar_today</text>
          </view>
          <view class="order-content">
            <text class="order-content-title">{{ dateRange }}</text>
            <text class="order-content-desc">共计 {{ days }} 天</text>
          </view>
        </view>

        <view class="order-item">
          <view class="order-icon-wrap">
            <text class="material-symbols-outlined order-icon">person</text>
          </view>
          <view class="order-content">
            <text class="order-content-title">{{ passengerName }}</text>
            <text class="order-content-desc">{{ passengerPhone }}</text>
          </view>
        </view>

        <view class="order-item">
          <view class="order-icon-wrap">
            <text class="material-symbols-outlined order-icon">payments</text>
          </view>
          <view class="order-content">
            <view class="order-pay-row">
              <text class="order-content-title">{{ payLabel }}</text>
              <view class="order-pay-tag" :class="`tag-${status}`">
                <text class="order-pay-tag-text">{{ payTagText }}</text>
              </view>
            </view>
            <text class="order-content-desc">¥{{ totalText }}</text>
          </view>
        </view>

        <view class="order-item">
          <view class="order-icon-wrap">
            <text class="material-symbols-outlined order-icon">route</text>
          </view>
          <view class="order-content">
            <view class="route-row">
              <view class="route-dot dot-green" />
              <text class="route-text">上海浦东国际机场 T2</text>
            </view>
            <view class="route-line" />
            <view class="route-row">
              <view class="route-dot dot-black" />
              <text class="route-text">上海半岛酒店</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 匹配中 dots: 仅 paid 时显示 -->
      <view v-if="status === 'paid'" class="matching">
        <view class="matching-dots">
          <view class="match-dot" style="animation-delay: 0s" />
          <view class="match-dot" style="animation-delay: 0.2s" />
          <view class="match-dot" style="animation-delay: 0.4s" />
        </view>
        <text class="matching-text">MATCHING PREMIUM CHAUFFEUR</text>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>

    <!-- Footer -->
    <view class="footer">
      <view
        v-if="status === 'pending'"
        class="footer-btn-primary footer-btn-pay"
        @click="onContinuePay"
      >
        <text class="footer-btn-primary-text">立即支付 ¥{{ totalText }}</text>
      </view>
      <view v-else class="footer-btn-primary" @click="goDetail">
        <text class="footer-btn-primary-text">查看订单详情</text>
      </view>
      <view class="footer-btn-secondary" @click="goHome">
        <text class="footer-btn-secondary-text">返回首页</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { charterCars, findPkgById, payTimeoutSeconds } from '@/data/charter';

const statusBarHeight = ref(0);
const carIdx = ref(0);
const pkgId = ref('a-f-pro');
const days = ref(1);
const status = ref<'paid' | 'pending'>('paid');
const payMethod = ref<'wechat' | 'alipay' | 'enterprise'>('wechat');
const passengerName = ref('本人 (张先生)');
const passengerPhone = ref('138****8888');
const totalText = ref('2,088.00');
const passedOrderNo = ref('');

/* 倒计时（待支付剩余时间）：取自运营后台 §8.1.6 平台级超时规则 */
const remainSeconds = ref(payTimeoutSeconds);
let countdownTimer: ReturnType<typeof setInterval> | null = null;

const countdownText = computed(() => {
  const m = Math.floor(remainSeconds.value / 60);
  const s = remainSeconds.value % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

const statusIcon = computed(() => (status.value === 'paid' ? 'check_circle' : 'schedule'));
const statusTitle = computed(() => (status.value === 'paid' ? '下单成功' : '订单待支付'));
const statusSub = computed(() =>
  status.value === 'paid' ? '正在为您匹配司机...' : '订单已生成，请尽快完成支付'
);

const payLabel = computed(() => {
  if (payMethod.value === 'wechat') return '微信支付';
  if (payMethod.value === 'alipay') return '支付宝支付';
  return '企业支付';
});

const payTagText = computed(() => (status.value === 'paid' ? '已支付' : '待支付'));

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 0;
});

onLoad((opts: Record<string, string> | undefined) => {
  if (opts) {
    if (opts.carIdx !== undefined) carIdx.value = parseInt(opts.carIdx, 10) || 0;
    if (opts.pkgId) pkgId.value = opts.pkgId;
    if (opts.days) days.value = parseInt(opts.days, 10) || 1;
    if (opts.status === 'paid' || opts.status === 'pending') status.value = opts.status;
    if (opts.pay === 'wechat' || opts.pay === 'alipay' || opts.pay === 'enterprise') {
      payMethod.value = opts.pay;
    }
    if (opts.passenger) passengerName.value = decodeURIComponent(opts.passenger);
    if (opts.phone) passengerPhone.value = decodeURIComponent(opts.phone);
    if (opts.total) totalText.value = decodeURIComponent(opts.total);
    if (opts.orderNo) passedOrderNo.value = opts.orderNo;
  }

  if (status.value === 'pending') {
    countdownTimer = setInterval(() => {
      if (remainSeconds.value <= 0) {
        if (countdownTimer) clearInterval(countdownTimer);
        return;
      }
      remainSeconds.value--;
    }, 1000);
  }
});

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});

const car = computed(() => charterCars[carIdx.value] || charterCars[0]);
const pkg = computed(() => findPkgById(pkgId.value)?.pkg || charterCars[0].packages[4]);

/* 订单号：优先使用上游传入的，否则按车型/套餐回算 */
const orderNo = computed(() => {
  if (passedOrderNo.value) return passedOrderNo.value;
  const prefix = 'ZC202606098854';
  return `${prefix}${carIdx.value}${pkgId.value.replace(/-/g, '').slice(0, 2).toUpperCase()}`;
});

const dateRange = computed(() => {
  const start = new Date('2026-06-09T00:00:00');
  const end = new Date(start);
  end.setDate(start.getDate() + days.value - 1);
  const fmt = (d: Date) =>
    `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  return days.value > 1 ? `${fmt(start)} - ${end.getMonth() + 1}月${end.getDate()}日` : fmt(start);
});

const goHome = () => {
  uni.reLaunch({ url: '/pages/index/index' });
};

const goDetail = () => {
  const params = [
    `orderNo=${orderNo.value}`,
    `status=${status.value === 'paid' ? 'pending-dispatch' : 'unpaid'}`,
    `carIdx=${carIdx.value}`,
    `pkgId=${pkgId.value}`,
    `days=${days.value}`,
  ].join('&');
  uni.redirectTo({ url: `/pages/trips/detail-charter?${params}` });
};

const onContinuePay = () => {
  if (payMethod.value === 'enterprise') {
    uni.showModal({
      title: '企业额度支付',
      content: `本次将从企业额度中扣除 ¥${totalText.value}，是否确认支付？`,
      confirmText: '确认',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          status.value = 'paid';
          if (countdownTimer) clearInterval(countdownTimer);
          uni.showToast({ title: '支付成功', icon: 'success' });
        }
      },
    });
    return;
  }

  /* 微信/支付宝：跳聚合支付页 */
  const params = [
    `method=${payMethod.value}`,
    `total=${encodeURIComponent(totalText.value)}`,
    `orderNo=${orderNo.value}`,
    `carIdx=${carIdx.value}`,
    `pkgId=${pkgId.value}`,
    `days=${days.value}`,
    `passenger=${encodeURIComponent(passengerName.value)}`,
    `phone=${encodeURIComponent(passengerPhone.value)}`,
  ].join('&');
  uni.navigateTo({ url: `/pages/charter/pay?${params}` });
};
</script>

<style lang="scss" scoped>
.page {
  position: relative;
  min-height: 100vh;
  background: #F9F9F9;
  display: flex;
  flex-direction: column;
}

/* ===== 背景 ===== */
.bg-decoration {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
}

.bg-blob-tr {
  top: -10%;
  right: -10%;
  width: 320px;
  height: 320px;
  background: rgba(0, 87, 255, 0.04);
}

.bg-blob-bl {
  bottom: 20%;
  left: -10%;
  width: 280px;
  height: 280px;
  background: rgba(0, 0, 0, 0.03);
}

/* ===== Header ===== */
.header {
  position: relative;
  z-index: 5;
  background: rgba(249, 249, 249, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.header-inner {
  height: 56px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 8px;

  &:active {
    opacity: 0.7;
  }
}

.header-icon {
  font-size: 22px;
  color: #000000;
}

.header-title {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: #000000;
}

/* ===== Main ===== */
.main {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
}

.bottom-spacer {
  height: 200px;
}

/* ===== Success ===== */
.success-block {
  padding: 40px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.check-wrap {
  position: relative;
  margin-bottom: 24px;
  display: inline-flex;
}

.check-glow {
  position: absolute;
  inset: -16px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 50%;
  filter: blur(20px);
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.check-circle {
  position: relative;
  width: 80px;
  height: 80px;
  background: #FFFFFF;
  border-radius: 50%;
  border: 1px solid #F2F2F2;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  font-size: 48px;
  color: #22C55E;
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.success-title {
  font-size: 28px;
  line-height: 36px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 8px;
}

.success-sub {
  font-size: 17px;
  line-height: 26px;
  color: #86868B;
}

/* ===== 订单卡 ===== */
.order-card {
  margin: 0 24px;
  padding: 32px;
  background: #FFFFFF;
  border: 1px solid #F2F2F2;
  border-radius: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.order-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-head {
  padding-bottom: 16px;
  border-bottom: 1px solid #F2F2F2;
}

.order-label {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #86868B;
}

.order-value {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #000000;
  letter-spacing: 0.05em;
}

.mono {
  font-family: 'SF Mono', Menlo, monospace;
}

.order-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.order-icon-wrap {
  width: 48px;
  height: 48px;
  background: #F2F2F2;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.order-icon {
  font-size: 24px;
  color: #000000;
}

.order-content {
  flex: 1;
  min-width: 0;
}

.order-content-title {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: #000000;
  display: block;
}

.order-content-desc {
  margin-top: 4px;
  font-size: 15px;
  line-height: 22px;
  color: #86868B;
  display: block;
}

/* ===== 路线 ===== */
.route-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.route-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-green {
  background: #22C55E;
}

.dot-black {
  background: #000000;
}

.route-text {
  font-size: 15px;
  line-height: 22px;
  color: #000000;
}

.route-line {
  width: 1px;
  height: 24px;
  background: #F2F2F2;
  margin-left: 4px;
  margin-top: 4px;
  margin-bottom: 4px;
}

/* ===== 匹配中 ===== */
.matching {
  margin: 24px 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.matching-dots {
  display: flex;
  gap: 6px;
}

.match-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #000000;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}

.matching-text {
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.15em;
  color: #86868B;
}

/* ===== Footer ===== */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: #FFFFFF;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  padding: 24px 24px calc(40px + env(safe-area-inset-bottom, 0px));
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-btn-primary {
  height: 56px;
  background: #000000;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.footer-btn-primary-text {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: #FFFFFF;
}

.footer-btn-secondary {
  height: 56px;
  background: #FFFFFF;
  border: 1px solid #F2F2F2;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    transform: scale(0.98);
    background: #F9F9F9;
  }
}

.footer-btn-secondary-text {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: #000000;
}

/* ============ pending 状态扩展 ============ */
.glow-pending {
  background: rgba(255, 125, 0, 0.12) !important;
}

.icon-pending {
  color: #FF7D00 !important;
}

.countdown {
  margin-top: 16px;
  padding: 10px 16px;
  background: rgba(255, 125, 0, 0.08);
  border: 1px solid rgba(255, 125, 0, 0.18);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 90%;
}

.countdown-icon {
  font-size: 16px;
  color: #FF7D00;
}

.countdown-text {
  font-size: 12px;
  line-height: 18px;
  color: #FF7D00;
  font-weight: 500;
}

/* 订单卡支付方式行 */
.order-pay-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-pay-tag {
  padding: 2px 8px;
  border-radius: 9999px;
}

.order-pay-tag.tag-paid {
  background: rgba(0, 176, 107, 0.12);
}

.order-pay-tag.tag-pending {
  background: rgba(255, 125, 0, 0.12);
}

.order-pay-tag-text {
  font-size: 11px;
  line-height: 14px;
  font-weight: 600;
}

.tag-paid .order-pay-tag-text {
  color: #00B06B;
}

.tag-pending .order-pay-tag-text {
  color: #FF7D00;
}

/* footer 待支付按钮使用主题橙色 */
.footer-btn-pay {
  background: #FF7D00 !important;
}
</style>
