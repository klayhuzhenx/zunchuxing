<template>
  <view class="page">
    <view class="bg-decoration">
      <view class="bg-blob bg-blob-tr" />
      <view class="bg-blob bg-blob-bl" />
    </view>

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
            <text class="material-symbols-outlined check-icon" :class="`icon-${status}`">{{ statusIcon }}</text>
          </view>
        </view>
        <text class="success-title">{{ statusTitle }}</text>
        <text class="success-sub">{{ statusSub }}</text>

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
            <text class="order-content-desc">¥{{ car.dayPrice.toLocaleString() }} / 天 × {{ days }} 天</text>
          </view>
        </view>

        <view class="order-item">
          <view class="order-icon-wrap">
            <text class="material-symbols-outlined order-icon">calendar_today</text>
          </view>
          <view class="order-content">
            <text class="order-content-title">{{ dateRange }}</text>
            <text class="order-content-desc">共 {{ days }} 天</text>
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
              <view class="route-dot dot-pickup" />
              <text class="route-text">{{ form.pickup }}</text>
            </view>
            <view class="route-line" />
            <view class="route-row">
              <view class="route-dot dot-return" />
              <text class="route-text">{{ form.return }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="status === 'paid'" class="matching">
        <view class="matching-dots">
          <view class="match-dot" style="animation-delay: 0s" />
          <view class="match-dot" style="animation-delay: 0.2s" />
          <view class="match-dot" style="animation-delay: 0.4s" />
        </view>
        <text class="matching-text">Awaiting Vehicle Dispatch</text>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>

    <view class="footer">
      <view v-if="status === 'pending'" class="footer-btn-primary footer-btn-pay" @click="onContinuePay">
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

const carData = [
  { id: 0, fullName: '增程星辉尊享版', dayPrice: 1500 },
  { id: 1, fullName: '增程星辉行政版', dayPrice: 1800 },
  { id: 2, fullName: '增程星耀行政版', dayPrice: 2200 },
];

const statusBarHeight = ref(0);
const carIdx = ref(0);
const days = ref(1);
const status = ref<'paid' | 'pending'>('paid');
const payMethod = ref<'wechat' | 'alipay' | 'enterprise'>('wechat');
const passengerName = ref('本人 (张先生)');
const passengerPhone = ref('138****8888');
const totalText = ref('3,000.00');
const orderNo = ref('ZR2026060988540');

const form = ref({
  pickup: '合肥市政务中心',
  return: '合肥滨湖会展中心',
  pickupDate: '2026-06-10',
  returnDate: '2026-06-12',
});

const remainSeconds = ref(30 * 60);
let countdownTimer: ReturnType<typeof setInterval> | null = null;

const countdownText = computed(() => {
  const m = Math.floor(remainSeconds.value / 60);
  const s = remainSeconds.value % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

const statusIcon = computed(() => (status.value === 'paid' ? 'check_circle' : 'schedule'));
const statusTitle = computed(() => (status.value === 'paid' ? '下单成功' : '订单待支付'));
const statusSub = computed(() => (status.value === 'paid' ? '订单已生成，等待派车...' : '订单已生成，请尽快完成支付'));
const payLabel = computed(() => {
  if (payMethod.value === 'wechat') return '微信支付';
  if (payMethod.value === 'alipay') return '支付宝支付';
  return '企业支付';
});
const payTagText = computed(() => (status.value === 'paid' ? '已支付' : '待支付'));
const car = computed(() => carData[carIdx.value] || carData[0]);

const dateRange = computed(() => `${form.value.pickupDate} 至 ${form.value.returnDate}`);

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 0;
});

onLoad((opts: Record<string, string> | undefined) => {
  if (!opts) return;
  if (opts.carIdx !== undefined) carIdx.value = parseInt(opts.carIdx, 10) || 0;
  if (opts.days) days.value = parseInt(opts.days, 10) || 1;
  if (opts.status === 'paid' || opts.status === 'pending') status.value = opts.status;
  if (opts.pay === 'wechat' || opts.pay === 'alipay' || opts.pay === 'enterprise') payMethod.value = opts.pay;
  if (opts.passenger) passengerName.value = decodeURIComponent(opts.passenger);
  if (opts.phone) passengerPhone.value = decodeURIComponent(opts.phone);
  if (opts.total) totalText.value = decodeURIComponent(opts.total);
  if (opts.orderNo) orderNo.value = opts.orderNo;
  if (opts.pickup) form.value.pickup = decodeURIComponent(opts.pickup);
  if (opts.return) form.value.return = decodeURIComponent(opts.return);
  if (opts.pickupDate) form.value.pickupDate = opts.pickupDate;
  if (opts.returnDate) form.value.returnDate = opts.returnDate;

  if (status.value === 'pending') {
    countdownTimer = setInterval(() => {
      if (remainSeconds.value > 0) remainSeconds.value--;
    }, 1000);
  }
});

onUnmounted(() => { if (countdownTimer) clearInterval(countdownTimer); });

const goHome = () => { uni.reLaunch({ url: '/pages/index/index' }); };
const goDetail = () => { uni.showToast({ title: '订单详情建设中', icon: 'none' }); };

const onContinuePay = () => {
  if (payMethod.value === 'enterprise') {
    uni.showModal({
      title: '企业额度支付',
      content: `本次将从企业额度中扣除 ¥${totalText.value}，是否确认支付？`,
      confirmText: '确认', cancelText: '取消',
      success: (res) => {
        if (res.confirm) { status.value = 'paid'; if (countdownTimer) clearInterval(countdownTimer); uni.showToast({ title: '支付成功', icon: 'success' }); }
      },
    });
    return;
  }
  const params = [
    `source=rental`, `method=${payMethod.value}`,
    `total=${encodeURIComponent(totalText.value)}`, `orderNo=${orderNo.value}`,
    `carIdx=${carIdx.value}`, `days=${days.value}`,
    `passenger=${encodeURIComponent(passengerName.value)}`, `phone=${encodeURIComponent(passengerPhone.value)}`,
    `product=${encodeURIComponent(car.value.fullName)}`,
  ].join('&');
  uni.navigateTo({ url: `/pages/charter/pay?${params}` });
};
</script>

<style lang="scss" scoped>
.page { position: relative; min-height: 100vh; background: #F9F9F9; display: flex; flex-direction: column; }
.bg-decoration { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.bg-blob { position: absolute; border-radius: 50%; filter: blur(80px); }
.bg-blob-tr { top: -10%; right: -10%; width: 320px; height: 320px; background: rgba(0,87,255,0.04); }
.bg-blob-bl { bottom: 20%; left: -10%; width: 280px; height: 280px; background: rgba(0,0,0,0.03); }
.header { position: relative; z-index: 5; background: rgba(249,249,249,0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
.header-inner { height: 56px; padding: 0 24px; display: flex; align-items: center; gap: 8px; }
.header-inner:active { opacity: 0.7; }
.header-icon { font-size: 22px; color: #000; }
.header-title { font-size: 20px; font-weight: 600; color: #000; }
.main { position: relative; z-index: 1; flex: 1; min-height: 0; }
.bottom-spacer { height: 200px; }

/* ===== Success ===== */
.success-block { padding: 40px 24px 24px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.check-wrap { position: relative; margin-bottom: 24px; display: inline-flex; }
.check-glow { position: absolute; inset: -16px; border-radius: 50%; filter: blur(20px); animation: pulse 2s infinite ease-in-out; background: rgba(34,197,94,0.1); }
.check-glow.glow-pending { background: rgba(255,125,0,0.12) !important; }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
.check-circle { position: relative; width: 80px; height: 80px; background: #FFF; border-radius: 50%; border: 1px solid #F2F2F2; box-shadow: 0 2px 12px rgba(0,0,0,0.04); display: flex; align-items: center; justify-content: center; }
.check-icon { font-size: 48px; color: #22C55E; font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
.check-icon.icon-pending { color: #FF7D00 !important; }
.success-title { font-size: 28px; font-weight: 700; color: #000; margin-bottom: 8px; }
.success-sub { font-size: 17px; color: #86868B; }
.countdown { margin-top: 16px; padding: 10px 16px; background: rgba(255,125,0,0.08); border: 1px solid rgba(255,125,0,0.18); border-radius: 9999px; display: flex; align-items: center; gap: 6px; }
.countdown-icon { font-size: 16px; color: #FF7D00; }
.countdown-text { font-size: 12px; color: #FF7D00; font-weight: 500; }

/* ===== 订单卡 ===== */
.order-card { margin: 0 24px; padding: 32px; background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 24px; }
.order-row { display: flex; justify-content: space-between; align-items: center; }
.order-head { padding-bottom: 16px; border-bottom: 1px solid #F2F2F2; }
.order-label { font-size: 13px; font-weight: 500; color: #86868B; }
.order-value { font-size: 13px; font-weight: 500; color: #000; letter-spacing: 0.05em; }
.order-value.mono { font-family: 'SF Mono', Menlo, monospace; }
.order-item { display: flex; align-items: flex-start; gap: 16px; }
.order-icon-wrap { width: 48px; height: 48px; background: #F2F2F2; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.order-icon { font-size: 24px; color: #000; }
.order-content { flex: 1; min-width: 0; }
.order-content-title { font-size: 20px; font-weight: 600; color: #000; display: block; }
.order-content-desc { margin-top: 4px; font-size: 15px; color: #86868B; display: block; }
.order-pay-row { display: flex; align-items: center; gap: 8px; }
.order-pay-tag { padding: 2px 8px; border-radius: 9999px; }
.order-pay-tag.tag-paid { background: rgba(0,176,107,0.12); }
.order-pay-tag.tag-pending { background: rgba(255,125,0,0.12); }
.order-pay-tag-text { font-size: 11px; font-weight: 600; }
.tag-paid .order-pay-tag-text { color: #00B06B; }
.tag-pending .order-pay-tag-text { color: #FF7D00; }

.route-row { display: flex; align-items: center; gap: 8px; }
.route-dot { width: 8px; height: 8px; border-radius: 50%; }
.dot-pickup { background: #10B981; }
.dot-return { background: #EF4444; }
.route-text { font-size: 15px; color: #000; }
.route-line { width: 1px; height: 24px; background: #F2F2F2; margin-left: 4px; margin: 4px 0 4px 4px; }

/* ===== 匹配中 ===== */
.matching { margin: 24px 24px 0; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.matching-dots { display: flex; gap: 6px; }
.match-dot { width: 6px; height: 6px; border-radius: 50%; background: #000; animation: bounce 1s infinite; }
@keyframes bounce { 0%,80%,100% { transform:translateY(0); } 40% { transform:translateY(-6px); } }
.matching-text { font-size: 11px; font-weight: 500; letter-spacing: 0.15em; color: #86868B; }

/* ===== Footer ===== */
.footer { position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; background: #FFF; border-top-left-radius: 32px; border-top-right-radius: 32px; padding: 24px 24px calc(40px + env(safe-area-inset-bottom, 0px)); box-shadow: 0 -10px 40px rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 16px; }
.footer-btn-primary { height: 56px; background: #000; border-radius: 24px; display: flex; align-items: center; justify-content: center; }
.footer-btn-primary:active { transform: scale(0.98); opacity: 0.9; }
.footer-btn-pay { background: #FF7D00 !important; }
.footer-btn-primary-text { font-size: 20px; font-weight: 600; color: #FFF; }
.footer-btn-secondary { height: 56px; background: #FFF; border: 1px solid #F2F2F2; border-radius: 24px; display: flex; align-items: center; justify-content: center; }
.footer-btn-secondary:active { transform: scale(0.98); background: #F9F9F9; }
.footer-btn-secondary-text { font-size: 20px; font-weight: 600; color: #000; }
</style>
