<template>
  <view class="page">
    <navbar title="确认订单" :show-back="true" />

    <scroll-view scroll-y class="main">
      <!-- 车型 banner -->
      <view class="hero-card">
        <view class="hero-bg" :style="{ background: car.imageGradient }" />
        <view class="hero-mask" />
        <view class="hero-content">
          <view class="hero-tag">
            <text class="hero-tag-text">{{ car.tagText }}</text>
          </view>
          <text class="hero-title">{{ car.fullName }}</text>
        </view>
      </view>

      <!-- 行程信息 -->
      <view class="card">
        <view class="card-head">
          <view>
            <text class="card-title">行程信息</text>
            <text class="card-sub">{{ pkg.spec }}（{{ pkg.tier }}）共 {{ days }} 天</text>
          </view>
        </view>
        <view class="route">
          <view class="route-rail">
            <view class="route-dot dot-solid" />
            <view class="route-line" />
            <view class="route-dot dot-ring" />
          </view>
          <view class="route-info">
            <view class="route-row">
              <text class="route-label">出发地</text>
              <text class="route-text">上海市浦东国际机场 T2</text>
            </view>
            <view class="route-row">
              <text class="route-label">目的地</text>
              <text class="route-text">杭州市西湖区灵隐路 1 号</text>
            </view>
          </view>
        </view>
        <view class="card-divider" />
        <view class="card-row">
          <view>
            <text class="card-label">行程日期</text>
            <text class="card-value">{{ dateRange }}</text>
          </view>
          <view class="text-right">
            <text class="card-label">车型套餐</text>
            <text class="card-value">{{ pkg.tier }} {{ pkg.spec.split('·')[1] || pkg.spec }}</text>
          </view>
        </view>
      </view>

      <!-- 乘车人 -->
      <view class="card card-row-h">
        <view class="passenger">
          <view class="passenger-avatar">
            <text class="material-symbols-outlined avatar-icon">person</text>
          </view>
          <view>
            <text class="card-label">乘车人</text>
            <view class="passenger-name">
              <text class="passenger-text">{{ currentPassenger.name }}</text>
              <text class="passenger-phone">{{ currentPassenger.phone }}</text>
            </view>
          </view>
        </view>
        <view class="switch-btn" @click="showPassengerSheet = true">
          <text class="switch-btn-text">切换</text>
        </view>
      </view>

      <!-- 支付方式 -->
      <view class="card">
        <text class="card-section-title">支付方式</text>
        <view class="payments">
          <view
            v-for="p in payments"
            :key="p.id"
            class="payment-item"
            :class="{ active: payMethod === p.id }"
            @click="payMethod = p.id"
          >
            <view class="payment-left">
              <text class="material-symbols-outlined payment-icon" :style="{ color: p.color }">{{ p.icon }}</text>
              <text class="payment-name">{{ p.name }}</text>
            </view>
            <view class="payment-radio">
              <view v-if="payMethod === p.id" class="payment-radio-inner" />
            </view>
          </view>
        </view>
      </view>

      <!-- 备注 -->
      <view class="card">
        <text class="card-section-title">备注信息</text>
        <textarea
          v-model="remark"
          class="remark"
          placeholder="如有特殊需求请填写（选填）"
          placeholder-class="remark-placeholder"
          maxlength="200"
        />
      </view>

      <!-- 协议 -->
      <view class="agreement" @click="agreed = !agreed">
        <view class="checkbox" :class="{ checked: agreed }">
          <text v-if="agreed" class="material-symbols-outlined check-icon">check</text>
        </view>
        <text class="agreement-text">
          下单即表示您已阅读并同意
          <text class="link">《包车出行规则》</text>
          及
          <text class="link">《隐私保护协议》</text>
          。我们将竭诚为您提供高标准的礼宾服务。
        </text>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>

    <!-- Footer -->
    <view class="footer">
      <view class="footer-top">
        <view class="footer-price">
          <text class="footer-symbol">¥</text>
          <text class="footer-amount">{{ totalText }}</text>
          <view class="footer-detail" @click="goFee">
            <text class="footer-detail-text">明细</text>
            <text class="material-symbols-outlined footer-detail-icon">expand_less</text>
          </view>
        </view>
        <view class="footer-discount">
          <text class="footer-discount-text">已优惠 ¥200</text>
        </view>
      </view>
      <view class="footer-btn" @click="onSubmit">
        <text class="footer-btn-text">确认下单</text>
      </view>
    </view>

    <!-- 乘车人切换 sheet -->
    <bottom-sheet v-model="showPassengerSheet" title="选择乘车人" :max-height="'70vh'">
      <view class="ps-list">
        <view
          v-for="p in passengers"
          :key="p.id"
          class="ps-item"
          :class="{ active: currentPassengerId === p.id }"
          @click="onPickPassenger(p)"
        >
          <view class="ps-avatar" :class="{ self: p.isSelf }">
            <text class="material-symbols-outlined ps-avatar-icon">{{ p.isSelf ? 'person' : 'person_outline' }}</text>
          </view>
          <view class="ps-info">
            <view class="ps-name-row">
              <text class="ps-name">{{ p.name }}</text>
              <view v-if="p.isSelf" class="ps-tag-self">
                <text class="ps-tag-self-text">本人</text>
              </view>
            </view>
            <text class="ps-phone">{{ p.phone }}</text>
          </view>
          <view class="ps-radio" :class="{ active: currentPassengerId === p.id }">
            <view v-if="currentPassengerId === p.id" class="ps-radio-inner" />
          </view>
        </view>
      </view>

      <view class="ps-add" @click="showAddPassengerSheet = true">
        <text class="material-symbols-outlined ps-add-icon">add</text>
        <text class="ps-add-text">添加乘车人</text>
      </view>
    </bottom-sheet>

    <!-- 添加乘车人 sheet -->
    <bottom-sheet v-model="showAddPassengerSheet" title="添加乘车人" :max-height="'70vh'">
      <view class="add-form">
        <view class="add-field">
          <text class="add-label">姓名</text>
          <input
            v-model="newPassenger.name"
            class="add-input"
            placeholder="请输入乘车人姓名"
            placeholder-class="add-placeholder"
            maxlength="20"
          />
        </view>
        <view class="add-field">
          <text class="add-label">手机号</text>
          <input
            v-model="newPassenger.phone"
            class="add-input"
            type="number"
            placeholder="请输入乘车人手机号"
            placeholder-class="add-placeholder"
            maxlength="11"
          />
        </view>
      </view>

      <template #footer>
        <view class="add-confirm" @click="onAddPassenger">
          <text class="add-confirm-text">保存并使用</text>
        </view>
      </template>
    </bottom-sheet>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import Navbar from '@/components/navbar.vue';
import BottomSheet from '@/components/bottom-sheet.vue';

/* 车型库（与 charter/index.vue 保持一致简化版） */
const carData = [
  { id: 0, fullName: '增程星辉尊享版', tagText: '极致尊贵', imageGradient: 'linear-gradient(135deg, #2c2c2e 0%, #1a1a1c 50%, #0a0a0c 100%)' },
  { id: 1, fullName: '增程星辉行政版', tagText: '商务出行', imageGradient: 'linear-gradient(135deg, #3a3a3c 0%, #1f1f21 50%, #0d0d0f 100%)' },
  { id: 2, fullName: '增程星耀行政版', tagText: '旗舰豪华', imageGradient: 'linear-gradient(135deg, #4a4a4c 0%, #252527 50%, #101012 100%)' },
];

/* 套餐价格表（与 charter/index 对齐） */
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
const remark = ref('');
const agreed = ref(false);
const payMethod = ref<'wechat' | 'alipay' | 'enterprise'>('wechat');

/* ============ 乘车人 ============ */
type Passenger = { id: string; name: string; phone: string; isSelf?: boolean };

const passengers = ref<Passenger[]>([
  { id: 'self', name: '本人 (张先生)', phone: '138****8888', isSelf: true },
  { id: 'p1', name: '李女士', phone: '139****1234' },
  { id: 'p2', name: '王总', phone: '186****5678' },
]);
const currentPassengerId = ref('self');
const showPassengerSheet = ref(false);
const showAddPassengerSheet = ref(false);
const newPassenger = ref({ name: '', phone: '' });

const currentPassenger = computed(
  () => passengers.value.find((p) => p.id === currentPassengerId.value) || passengers.value[0]
);

const onPickPassenger = (p: Passenger) => {
  currentPassengerId.value = p.id;
  showPassengerSheet.value = false;
};

const onAddPassenger = () => {
  const name = newPassenger.value.name.trim();
  const phone = newPassenger.value.phone.trim();
  if (!name) {
    uni.showToast({ title: '请输入乘车人姓名', icon: 'none' });
    return;
  }
  if (!/^1\d{10}$/.test(phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
    return;
  }
  const masked = phone.slice(0, 3) + '****' + phone.slice(7);
  const id = `p-new-${passengers.value.length}`;
  passengers.value.push({ id, name, phone: masked });
  currentPassengerId.value = id;
  newPassenger.value = { name: '', phone: '' };
  showAddPassengerSheet.value = false;
  showPassengerSheet.value = false;
};

/* ============ 支付 ============ */
/* 固定订单号（避免 Date.now，保证可复现） */
const Date_safe = '202606098854';
const orderNo = computed(() => `ZC${Date_safe}${carIdx.value}${pkgId.value.replace(/-/g, '').slice(0, 2).toUpperCase()}`);

onLoad((opts: Record<string, string> | undefined) => {
  if (opts) {
    if (opts.carIdx !== undefined) carIdx.value = parseInt(opts.carIdx, 10) || 0;
    if (opts.pkgId) pkgId.value = opts.pkgId;
    if (opts.days) days.value = parseInt(opts.days, 10) || 1;
  }
});

const car = computed(() => carData[carIdx.value] || carData[0]);
const pkg = computed(() => pkgMap[pkgId.value] || pkgMap['a-f-pro']);

const totalNumber = computed(() => pkg.value.price * days.value);
const totalText = computed(() => totalNumber.value.toLocaleString() + '.00');

const dateRange = computed(() => {
  const start = new Date('2026-06-09T00:00:00');
  const end = new Date(start);
  end.setDate(start.getDate() + days.value - 1);
  const fmt = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  return days.value > 1 ? `${fmt(start)} - ${fmt(end)}` : fmt(start);
});

const payments = [
  { id: 'wechat' as const, name: '微信支付', icon: 'account_balance_wallet', color: '#07C160' },
  { id: 'alipay' as const, name: '支付宝支付', icon: 'payments', color: '#1677FF' },
  { id: 'enterprise' as const, name: '企业支付', icon: 'domain', color: '#D4AF37' },
];

const goFee = () => {
  uni.navigateTo({
    url: `/pages/charter/fee?carIdx=${carIdx.value}&pkgId=${pkgId.value}&days=${days.value}`,
  });
};

/* 拼装跳转 success 的参数 */
const buildSuccessUrl = (status: 'paid' | 'pending') => {
  const params = [
    `carIdx=${carIdx.value}`,
    `pkgId=${pkgId.value}`,
    `days=${days.value}`,
    `status=${status}`,
    `pay=${payMethod.value}`,
    `passenger=${encodeURIComponent(currentPassenger.value.name)}`,
    `phone=${encodeURIComponent(currentPassenger.value.phone)}`,
    `total=${encodeURIComponent(totalText.value)}`,
    `orderNo=${orderNo.value}`,
  ].join('&');
  return `/pages/charter/success?${params}`;
};

/* 拼装跳转 pay 页面参数 */
const buildPayUrl = () => {
  const params = [
    `method=${payMethod.value}`,
    `total=${encodeURIComponent(totalText.value)}`,
    `orderNo=${orderNo.value}`,
    `carIdx=${carIdx.value}`,
    `pkgId=${pkgId.value}`,
    `days=${days.value}`,
    `passenger=${encodeURIComponent(currentPassenger.value.name)}`,
    `phone=${encodeURIComponent(currentPassenger.value.phone)}`,
  ].join('&');
  return `/pages/charter/pay?${params}`;
};

const onSubmit = () => {
  if (!agreed.value) {
    uni.showToast({ title: '请阅读并同意包车出行规则', icon: 'none' });
    return;
  }

  if (payMethod.value === 'enterprise') {
    /* 企业额度支付：二次确认 */
    uni.showModal({
      title: '企业额度支付',
      content: `本次将从企业额度中扣除 ¥${totalText.value}，是否确认下单？`,
      confirmText: '确认下单',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          uni.redirectTo({ url: buildSuccessUrl('paid') });
        } else {
          /* 取消 = 生成待支付订单 */
          uni.redirectTo({ url: buildSuccessUrl('pending') });
        }
      },
    });
    return;
  }

  /* 微信 / 支付宝：跳转聚合支付页 */
  uni.navigateTo({ url: buildPayUrl() });
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
  height: 200px;
}

/* ===== Hero ===== */
.hero-card {
  position: relative;
  height: 192px;
  margin: 12px 24px 0;
  border-radius: 32px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
}

.hero-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 100%);
}

.hero-content {
  position: absolute;
  bottom: 24px;
  left: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.hero-tag {
  padding: 4px 12px;
  background: #0057FF;
  border-radius: 9999px;
}

.hero-tag-text {
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  color: #FFFFFF;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.hero-title {
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
  color: #FFFFFF;
}

/* ===== 卡片 ===== */
.card {
  margin: 16px 24px 0;
  padding: 20px;
  background: #FFFFFF;
  border: 1px solid #F2F2F2;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-row-h {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-title {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: #000000;
  display: block;
}

.card-sub {
  margin-top: 4px;
  font-size: 13px;
  line-height: 18px;
  color: #86868B;
  display: block;
}

.card-divider {
  height: 1px;
  background: #F2F2F2;
}

.card-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.text-right {
  text-align: right;
}

.card-label {
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  color: #86868B;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  display: block;
}

.card-value {
  margin-top: 4px;
  font-size: 15px;
  line-height: 22px;
  color: #000000;
  display: block;
}

.card-section-title {
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  color: #86868B;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* ===== 路线 ===== */
.route {
  display: flex;
  gap: 16px;
}

.route-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 6px;
}

.route-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot-solid {
  background: #000000;
}

.dot-ring {
  border: 2px solid #000000;
  background: transparent;
}

.route-line {
  width: 1px;
  height: 32px;
  background: #F2F2F2;
  margin: 4px 0;
}

.route-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.route-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.route-label {
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  color: #86868B;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.route-text {
  font-size: 17px;
  line-height: 26px;
  color: #000000;
}

/* ===== 乘车人 ===== */
.passenger {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.passenger-avatar {
  width: 48px;
  height: 48px;
  background: #F2F2F2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  font-size: 24px;
  color: #000000;
}

.passenger-name {
  margin-top: 2px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.passenger-text {
  font-size: 17px;
  line-height: 26px;
  color: #000000;
}

.passenger-phone {
  font-size: 13px;
  line-height: 18px;
  color: #86868B;
}

.switch-btn {
  flex-shrink: 0;
  height: 40px;
  padding: 0 24px;
  background: #F2F2F2;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    transform: scale(0.95);
  }
}

.switch-btn-text {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #000000;
}

/* ===== 支付 ===== */
.payments {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #F2F2F2;
  border-radius: 16px;
  transition: all 0.15s ease;
}

.payment-item.active {
  border-color: #000000;
}

.payment-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.payment-icon {
  font-size: 24px;
}

.payment-name {
  font-size: 15px;
  line-height: 22px;
  color: #1A1C1C;
}

.payment-radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #E2E2E2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-item.active .payment-radio {
  border-color: #000000;
}

.payment-radio-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #000000;
}

/* ===== 备注 ===== */
.remark {
  width: 100%;
  height: 96px;
  padding: 16px;
  background: #F2F2F2;
  border: none;
  border-radius: 20px;
  font-size: 15px;
  line-height: 22px;
  color: #1A1C1C;
  resize: none;
}

.remark-placeholder {
  color: #86868B;
}

/* ===== 协议 ===== */
.agreement {
  margin: 16px 32px 0;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.checkbox {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #E2E2E2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4px;

  &.checked {
    background: #000000;
    border-color: #000000;
  }
}

.check-icon {
  font-size: 12px;
  color: #FFFFFF;
}

.agreement-text {
  flex: 1;
  font-size: 11px;
  line-height: 18px;
  color: #86868B;
}

.link {
  color: #0057FF;
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
}

.footer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.footer-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.footer-symbol {
  font-size: 13px;
  font-weight: 700;
  color: #000000;
}

.footer-amount {
  font-size: 28px;
  line-height: 36px;
  font-weight: 700;
  color: #000000;
  letter-spacing: -0.01em;
}

.footer-detail {
  margin-left: 8px;
  display: flex;
  align-items: center;
  gap: 2px;

  &:active {
    opacity: 0.7;
  }
}

.footer-detail-text {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #0057FF;
}

.footer-detail-icon {
  font-size: 16px;
  color: #0057FF;
}

.footer-discount-text {
  font-size: 11px;
  line-height: 16px;
  color: #86868B;
}

.footer-btn {
  height: 56px;
  background: #000000;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    transform: scale(0.98);
    opacity: 0.85;
  }
}

.footer-btn-text {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: #FFFFFF;
}

/* ============ 乘车人 sheet ============ */
.ps-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0 16px;
}

.ps-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: #F9F9F9;
  border: 2px solid transparent;
  border-radius: 20px;
  transition: all 0.15s ease;
}

.ps-item.active {
  background: #FFFFFF;
  border-color: #000000;
}

.ps-item:active {
  background: #F2F2F2;
}

.ps-avatar {
  width: 44px;
  height: 44px;
  background: #E8E8E8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.self {
    background: #000000;
  }
}

.ps-avatar-icon {
  font-size: 22px;
  color: #5D5F5F;
}

.ps-avatar.self .ps-avatar-icon {
  color: #FFFFFF;
}

.ps-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ps-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ps-name {
  font-size: 17px;
  line-height: 26px;
  font-weight: 500;
  color: #000000;
}

.ps-tag-self {
  padding: 1px 8px;
  background: #000000;
  border-radius: 9999px;
}

.ps-tag-self-text {
  font-size: 10px;
  line-height: 14px;
  font-weight: 600;
  color: #FFFFFF;
  letter-spacing: 0.05em;
}

.ps-phone {
  font-size: 13px;
  line-height: 18px;
  color: #86868B;
}

.ps-radio {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #E2E2E2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.active {
    border-color: #000000;
  }
}

.ps-radio-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #000000;
}

.ps-add {
  margin-top: 16px;
  padding: 14px 16px;
  background: #F2F2F2;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:active {
    background: #E8E8E8;
  }
}

.ps-add-icon {
  font-size: 20px;
  color: #000000;
}

.ps-add-text {
  font-size: 15px;
  line-height: 22px;
  font-weight: 500;
  color: #000000;
}

/* ============ 添加乘车人 form ============ */
.add-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0 16px;
}

.add-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-label {
  margin-left: 16px;
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #5D5F5F;
}

.add-input {
  height: 56px;
  background: #F2F2F2;
  border-radius: 24px;
  padding: 0 24px;
  font-size: 17px;
  line-height: 26px;
  color: #1A1C1C;
  border: none;
}

.add-placeholder {
  color: #86868B;
}

.add-confirm {
  height: 56px;
  background: #000000;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.85;
  }
}

.add-confirm-text {
  font-size: 17px;
  line-height: 26px;
  font-weight: 600;
  color: #FFFFFF;
}
</style>
