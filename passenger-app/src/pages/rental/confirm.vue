<template>
  <view class="page">
    <navbar title="确认订单" :show-back="true" />

    <scroll-view scroll-y class="main">
      <!-- 车型 hero -->
      <view class="hero-card">
        <view class="hero-bg" :style="{ background: car.imageGradient }" />
        <view class="hero-mask" />
        <view class="hero-content">
          <view class="hero-tag">
            <text class="hero-tag-text">尊界车主专享</text>
          </view>
          <text class="hero-title">{{ car.fullName }}</text>
        </view>
      </view>

      <!-- 取还车信息 -->
      <view class="card">
        <view class="card-head">
          <view>
            <text class="card-title">取还车信息</text>
            <text class="card-sub">¥{{ car.dayPrice.toLocaleString() }} / 天 × {{ days }} 天</text>
          </view>
        </view>
        <view class="route">
          <view class="route-rail">
            <view class="route-dot dot-pickup" />
            <view class="route-line" />
            <view class="route-dot dot-return" />
          </view>
          <view class="route-info">
            <view class="route-row">
              <text class="route-label">取车位置</text>
              <text class="route-text">{{ form.pickup }}</text>
            </view>
            <view class="route-row">
              <text class="route-label">还车位置</text>
              <text class="route-text">{{ form.return }}</text>
            </view>
          </view>
        </view>
        <view class="card-divider" />
        <view class="card-row">
          <view>
            <text class="card-label">租期</text>
            <text class="card-value">{{ dateRange }}</text>
          </view>
          <view class="text-right">
            <text class="card-label">天数</text>
            <text class="card-value">共 {{ days }} 天</text>
          </view>
        </view>
      </view>

      <!-- 驾驶人 -->
      <view class="card card-row-h">
        <view class="driver">
          <view class="driver-avatar">
            <text class="material-symbols-outlined avatar-icon">person</text>
          </view>
          <view>
            <text class="card-label">驾驶人</text>
            <view class="driver-name">
              <text class="driver-text">{{ currentDriver.name }}</text>
              <text class="driver-phone">{{ currentDriver.phone }}</text>
            </view>
          </view>
        </view>
        <view class="switch-btn" @click="showDriverSheet = true">
          <text class="switch-btn-text">切换</text>
        </view>
      </view>

      <!-- 驾驶证上传 -->
      <view class="card">
        <text class="card-section-title">驾驶证信息</text>
        <text class="card-section-desc">上传驾驶证照片以核实驾驶资格</text>
        <view class="license-grid">
          <view class="license-box" @click="onUploadLicense">
            <text class="material-symbols-outlined license-icon">add_a_photo</text>
            <text class="license-label">上传正页</text>
          </view>
          <view class="license-box" @click="onUploadLicense">
            <text class="material-symbols-outlined license-icon">add_a_photo</text>
            <text class="license-label">上传副页</text>
          </view>
        </view>
      </view>

      <!-- 尊享权益 -->
      <view class="benefit-card">
        <view class="benefit-glow" />
        <view class="benefit-row">
          <view class="benefit-left">
            <text class="material-symbols-outlined benefit-icon ms-fill">workspace_premium</text>
            <text class="benefit-title">尊享权益</text>
            <text class="benefit-remain">剩余 <text class="benefit-count">3</text> 次</text>
          </view>
          <view class="benefit-btn" @click="onUseBenefit">
            <text class="benefit-btn-text">使用权益</text>
          </view>
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
          下单即代表您已阅读并同意
          <text class="link">《租车出行规则》</text>
          与
          <text class="link">《隐私保护协议》</text>
          。驾驶人应持 C1 及以上有效驾照，文明驾驶。
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
        <view class="footer-note">
          <text class="footer-note-text">超里程按实际结算</text>
        </view>
      </view>
      <view class="footer-btn" @click="onSubmit">
        <text class="footer-btn-text">确认下单</text>
      </view>
    </view>

    <!-- 驾驶人切换 sheet -->
    <bottom-sheet v-model="showDriverSheet" title="选择驾驶人" :max-height="'70vh'">
      <view class="ds-list">
        <view
          v-for="d in drivers"
          :key="d.id"
          class="ds-item"
          :class="{ active: currentDriverId === d.id }"
          @click="onPickDriver(d)"
        >
          <view class="ds-avatar" :class="{ self: d.isSelf }">
            <text class="material-symbols-outlined ds-avatar-icon">{{ d.isSelf ? 'person' : 'person_outline' }}</text>
          </view>
          <view class="ds-info">
            <view class="ds-name-row">
              <text class="ds-name">{{ d.name }}</text>
              <view v-if="d.isSelf" class="ds-tag-self">
                <text class="ds-tag-self-text">本人</text>
              </view>
            </view>
            <text class="ds-phone">{{ d.phone }}</text>
          </view>
          <view class="ds-radio" :class="{ active: currentDriverId === d.id }">
            <view v-if="currentDriverId === d.id" class="ds-radio-inner" />
          </view>
        </view>
      </view>

      <view class="ds-add" @click="showAddDriverSheet = true">
        <text class="material-symbols-outlined ds-add-icon">add</text>
        <text class="ds-add-text">添加驾驶人</text>
      </view>
    </bottom-sheet>

    <!-- 添加驾驶人 sheet -->
    <bottom-sheet v-model="showAddDriverSheet" title="添加驾驶人" :max-height="'70vh'">
      <view class="add-form">
        <view class="add-field">
          <text class="add-label">姓名</text>
          <input
            v-model="newDriver.name"
            class="add-input"
            placeholder="请输入驾驶人姓名"
            placeholder-class="add-placeholder"
            maxlength="20"
          />
        </view>
        <view class="add-field">
          <text class="add-label">手机号</text>
          <input
            v-model="newDriver.phone"
            class="add-input"
            type="number"
            placeholder="请输入驾驶人手机号"
            placeholder-class="add-placeholder"
            maxlength="11"
          />
        </view>
      </view>

      <template #footer>
        <view class="add-confirm" @click="onAddDriver">
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

const carData = [
  { id: 0, fullName: '增程星辉尊享版', dayPrice: 1500, imageGradient: 'linear-gradient(135deg, #2c2c2e 0%, #1a1a1c 50%, #0a0a0c 100%)' },
  { id: 1, fullName: '增程星辉行政版', dayPrice: 1800, imageGradient: 'linear-gradient(135deg, #3a3a3c 0%, #1f1f21 50%, #0d0d0f 100%)' },
  { id: 2, fullName: '增程星耀行政版', dayPrice: 2200, imageGradient: 'linear-gradient(135deg, #4a4a4c 0%, #252527 50%, #101012 100%)' },
];

type Driver = { id: string; name: string; phone: string; isSelf?: boolean };

const drivers = ref<Driver[]>([
  { id: 'self', name: '本人 (张先生)', phone: '138****8888', isSelf: true },
  { id: 'd1', name: '李女士', phone: '139****1234' },
]);
const currentDriverId = ref('self');
const showDriverSheet = ref(false);
const showAddDriverSheet = ref(false);
const newDriver = ref({ name: '', phone: '' });

const carIdx = ref(0);
const days = ref(1);
const remark = ref('');
const agreed = ref(false);
const payMethod = ref<'wechat' | 'alipay' | 'enterprise'>('wechat');

const form = ref({
  pickup: '合肥市政务中心',
  return: '合肥滨湖会展中心',
  pickupDate: '2026-06-10',
  returnDate: '2026-06-12',
});

const OrderDate = '202606098854';

onLoad((opts: Record<string, string> | undefined) => {
  if (!opts) return;
  if (opts.carIdx !== undefined) carIdx.value = parseInt(opts.carIdx, 10) || 0;
  if (opts.days) days.value = parseInt(opts.days, 10) || 1;
  if (opts.pickup) form.value.pickup = decodeURIComponent(opts.pickup);
  if (opts.return) form.value.return = decodeURIComponent(opts.return);
  if (opts.pickupDate) form.value.pickupDate = opts.pickupDate;
  if (opts.returnDate) form.value.returnDate = opts.returnDate;
});

const car = computed(() => carData[carIdx.value] || carData[0]);
const currentDriver = computed(() => drivers.value.find((d) => d.id === currentDriverId.value) || drivers.value[0]);

const totalNumber = computed(() => car.value.dayPrice * days.value);
const totalText = computed(() => totalNumber.value.toLocaleString() + '.00');

const orderNo = computed(() => `ZR${OrderDate}${carIdx.value}`);

const dateRange = computed(() => {
  const start = new Date(form.value.pickupDate);
  const end = new Date(form.value.returnDate);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return `${fmt(start)} 至 ${fmt(end)}`;
});

const payments = [
  { id: 'wechat' as const, name: '微信支付', icon: 'payments', color: '#07C160' },
  { id: 'alipay' as const, name: '支付宝', icon: 'account_balance_wallet', color: '#1677FF' },
  { id: 'enterprise' as const, name: '企业支付', icon: 'domain', color: '#D4AF37' },
];

const onPickDriver = (d: Driver) => {
  currentDriverId.value = d.id;
  showDriverSheet.value = false;
};

const onAddDriver = () => {
  const name = newDriver.value.name.trim();
  const phone = newDriver.value.phone.trim();
  if (!name) { uni.showToast({ title: '请输入驾驶人姓名', icon: 'none' }); return; }
  if (!/^1\d{10}$/.test(phone)) { uni.showToast({ title: '请输入正确的手机号', icon: 'none' }); return; }
  const masked = phone.slice(0, 3) + '****' + phone.slice(7);
  const id = `d-new-${drivers.value.length}`;
  drivers.value.push({ id, name, phone: masked });
  currentDriverId.value = id;
  newDriver.value = { name: '', phone: '' };
  showAddDriverSheet.value = false;
  showDriverSheet.value = false;
};

const onUploadLicense = () => {
  uni.showToast({ title: '上传驾驶证照片（模拟）', icon: 'none' });
};

const onUseBenefit = () => {
  uni.showToast({ title: '尊享权益抵扣（模拟）', icon: 'none' });
};

const goFee = () => {
  uni.navigateTo({
    url: `/pages/rental/fee?carIdx=${carIdx.value}&days=${days.value}`,
  });
};

const buildSuccessUrl = (status: 'paid' | 'pending') => {
  const params = [
    `source=rental`,
    `carIdx=${carIdx.value}`,
    `days=${days.value}`,
    `status=${status}`,
    `pay=${payMethod.value}`,
    `passenger=${encodeURIComponent(currentDriver.value.name)}`,
    `phone=${encodeURIComponent(currentDriver.value.phone)}`,
    `total=${encodeURIComponent(totalText.value)}`,
    `orderNo=${orderNo.value}`,
    `pickup=${encodeURIComponent(form.value.pickup)}`,
    `return=${encodeURIComponent(form.value.return)}`,
    `pickupDate=${form.value.pickupDate}`,
    `returnDate=${form.value.returnDate}`,
  ].join('&');
  return `/pages/rental/success?${params}`;
};

const buildPayUrl = () => {
  const params = [
    `source=rental`,
    `method=${payMethod.value}`,
    `total=${encodeURIComponent(totalText.value)}`,
    `orderNo=${orderNo.value}`,
    `carIdx=${carIdx.value}`,
    `days=${days.value}`,
    `passenger=${encodeURIComponent(currentDriver.value.name)}`,
    `phone=${encodeURIComponent(currentDriver.value.phone)}`,
    `product=${encodeURIComponent(car.value.fullName)}`,
  ].join('&');
  return `/pages/charter/pay?${params}`;
};

const onSubmit = () => {
  if (!agreed.value) {
    uni.showToast({ title: '请阅读并同意租车出行规则', icon: 'none' });
    return;
  }
  if (payMethod.value === 'enterprise') {
    uni.showModal({
      title: '企业额度支付',
      content: `本次将从企业额度中扣除 ¥${totalText.value}，是否确认下单？`,
      confirmText: '确认下单',
      cancelText: '取消',
      success: (res) => {
        uni.redirectTo({ url: buildSuccessUrl(res.confirm ? 'paid' : 'pending') });
      },
    });
    return;
  }
  uni.navigateTo({ url: buildPayUrl() });
};
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #F9F9F9; display: flex; flex-direction: column; }
.main { flex: 1; min-height: 0; }
.bottom-spacer { height: 160px; }

/* ===== Hero ===== */
.hero-card { position: relative; height: 208px; margin: 12px 24px 0; border-radius: 32px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
.hero-bg { position: absolute; inset: 0; }
.hero-mask { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%); }
.hero-content { position: absolute; bottom: 24px; left: 24px; display: flex; flex-direction: column; gap: 8px; }
.hero-tag { padding: 4px 12px; background: #0057FF; border-radius: 9999px; align-self: flex-start; }
.hero-tag-text { font-size: 11px; line-height: 16px; font-weight: 500; color: #FFF; letter-spacing: 0.1em; text-transform: uppercase; }
.hero-title { font-size: 24px; line-height: 32px; font-weight: 600; color: #FFF; }

/* ===== Card ===== */
.card { margin: 16px 24px 0; padding: 20px; background: #FFF; border: 1px solid #F2F2F2; border-radius: 24px; display: flex; flex-direction: column; gap: 20px; }
.card-row-h { flex-direction: row; align-items: center; justify-content: space-between; gap: 16px; }
.card-head { display: flex; justify-content: space-between; align-items: flex-start; }
.card-title { font-size: 20px; line-height: 28px; font-weight: 600; color: #000; display: block; }
.card-sub { margin-top: 4px; font-size: 13px; line-height: 18px; color: #86868B; display: block; }
.card-divider { height: 1px; background: #F2F2F2; }
.card-row { display: flex; justify-content: space-between; }
.text-right { text-align: right; }
.card-label { font-size: 11px; font-weight: 500; color: #86868B; letter-spacing: 0.05em; text-transform: uppercase; display: block; }
.card-value { margin-top: 4px; font-size: 15px; line-height: 22px; color: #000; display: block; }
.card-section-title { font-size: 11px; font-weight: 500; color: #86868B; letter-spacing: 0.05em; text-transform: uppercase; }
.card-section-desc { font-size: 13px; color: #86868B; display: block; }

/* ===== 路线 ===== */
.route { display: flex; gap: 16px; }
.route-rail { display: flex; flex-direction: column; align-items: center; padding-top: 6px; }
.route-dot { width: 10px; height: 10px; border-radius: 50%; }
.dot-pickup { background: #10B981; }
.dot-return { background: #EF4444; }
.route-line { width: 1px; height: 32px; background: #F2F2F2; margin: 4px 0; }
.route-info { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.route-row { display: flex; flex-direction: column; gap: 4px; }
.route-label { font-size: 11px; font-weight: 500; color: #86868B; letter-spacing: 0.05em; text-transform: uppercase; }
.route-text { font-size: 17px; line-height: 26px; color: #000; }

/* ===== 驾驶人 ===== */
.driver { display: flex; align-items: center; gap: 16px; flex: 1; }
.driver-avatar { width: 48px; height: 48px; background: #F2F2F2; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar-icon { font-size: 24px; color: #000; }
.driver-name { margin-top: 2px; display: flex; gap: 8px; }
.driver-text { font-size: 17px; line-height: 26px; color: #000; }
.driver-phone { font-size: 13px; line-height: 18px; color: #86868B; }
.switch-btn { flex-shrink: 0; height: 40px; padding: 0 24px; background: #F2F2F2; border-radius: 9999px; display: flex; align-items: center; }
.switch-btn:active { transform: scale(0.95); }
.switch-btn-text { font-size: 13px; font-weight: 500; color: #000; }

/* ===== 驾驶证 ===== */
.license-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.license-box { aspect-ratio: 1.58/1; border: 2px dashed #CFC4C5; border-radius: 16px; background: #F2F2F2; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
.license-box:active { background: #E8E8E8; }
.license-icon { font-size: 32px; color: #7E7576; }
.license-label { font-size: 11px; color: #7E7576; }

/* ===== 尊享权益 ===== */
.benefit-card { margin: 16px 24px 0; padding: 16px 20px; background: linear-gradient(135deg, #000 0%, #1A1A1A 50%, #3D2B1F 100%); border-radius: 24px; position: relative; overflow: hidden; }
.benefit-glow { position: absolute; right: -20px; top: -20px; width: 120px; height: 120px; background: rgba(0,87,255,0.15); border-radius: 50%; filter: blur(40px); }
.benefit-row { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; }
.benefit-left { display: flex; align-items: center; gap: 8px; }
.benefit-icon { font-size: 20px; color: #D4AF37; }
.benefit-title { font-size: 17px; line-height: 26px; font-weight: 600; color: #FFF; }
.benefit-remain { font-size: 11px; color: rgba(255,255,255,0.6); }
.benefit-count { color: #D4AF37; font-weight: 700; }
.benefit-btn { height: 36px; padding: 0 16px; background: #FFF; border-radius: 9999px; display: flex; align-items: center; }
.benefit-btn:active { transform: scale(0.95); }
.benefit-btn-text { font-size: 13px; font-weight: 500; color: #000; }

/* ===== 支付 ===== */
.payments { display: flex; flex-direction: column; gap: 8px; }
.payment-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border: 1px solid #F2F2F2; border-radius: 16px; background: #F2F2F2; }
.payment-item.active { border-color: #000; background: #FFF; }
.payment-left { display: flex; align-items: center; gap: 12px; }
.payment-icon { font-size: 24px; }
.payment-name { font-size: 15px; line-height: 22px; color: #1A1C1C; font-weight: 500; }
.payment-radio { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #E2E2E2; display: flex; align-items: center; justify-content: center; }
.payment-item.active .payment-radio { border-color: #000; }
.payment-radio-inner { width: 10px; height: 10px; border-radius: 50%; background: #000; }

/* ===== 备注 ===== */
.remark { width: 100%; height: 96px; padding: 16px; background: #F2F2F2; border: none; border-radius: 20px; font-size: 15px; color: #1A1C1C; resize: none; }
.remark-placeholder { color: #86868B; }

/* ===== 协议 ===== */
.agreement { margin: 16px 32px 0; display: flex; align-items: flex-start; gap: 8px; }
.checkbox { width: 16px; height: 16px; border-radius: 50%; border: 1px solid #E2E2E2; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 4px; }
.checkbox.checked { background: #000; border-color: #000; }
.check-icon { font-size: 12px; color: #FFF; }
.agreement-text { flex: 1; font-size: 11px; line-height: 18px; color: #86868B; }
.link { color: #0057FF; font-weight: 500; }

/* ===== Footer ===== */
.footer { position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; background: #FFF; border-top-left-radius: 32px; border-top-right-radius: 32px; padding: 24px 24px calc(40px + env(safe-area-inset-bottom, 0px)); box-shadow: 0 -10px 40px rgba(0,0,0,0.04); }
.footer-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.footer-price { display: flex; align-items: baseline; gap: 4px; }
.footer-symbol { font-size: 13px; font-weight: 700; color: #000; }
.footer-amount { font-size: 28px; line-height: 36px; font-weight: 700; color: #000; }
.footer-detail { margin-left: 8px; display: flex; align-items: center; gap: 2px; }
.footer-detail:active { opacity: 0.7; }
.footer-detail-text { font-size: 13px; font-weight: 500; color: #0057FF; }
.footer-detail-icon { font-size: 16px; color: #0057FF; }
.footer-note-text { font-size: 11px; color: #86868B; }
.footer-btn { height: 56px; background: #000; border-radius: 24px; display: flex; align-items: center; justify-content: center; }
.footer-btn:active { transform: scale(0.98); opacity: 0.85; }
.footer-btn-text { font-size: 20px; font-weight: 600; color: #FFF; }

/* ===== 驾驶人 sheet ===== */
.ds-list { display: flex; flex-direction: column; gap: 8px; }
.ds-item { display: flex; align-items: center; gap: 16px; padding: 12px 16px; border: 2px solid transparent; border-radius: 20px; background: #F9F9F9; }
.ds-item.active { background: #FFF; border-color: #000; }
.ds-item:active { background: #F2F2F2; }
.ds-avatar { width: 40px; height: 40px; border-radius: 50%; background: #E8E8E8; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ds-avatar.self { background: #000; }
.ds-avatar-icon { font-size: 20px; color: #5D5F5F; }
.ds-avatar.self .ds-avatar-icon { color: #FFF; }
.ds-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.ds-name-row { display: flex; align-items: center; gap: 8px; }
.ds-name { font-size: 17px; font-weight: 500; color: #000; }
.ds-tag-self { padding: 1px 8px; background: #000; border-radius: 9999px; }
.ds-tag-self-text { font-size: 10px; font-weight: 600; color: #FFF; }
.ds-phone { font-size: 13px; color: #86868B; }
.ds-radio { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #E2E2E2; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ds-radio.active { border-color: #000; }
.ds-radio-inner { width: 10px; height: 10px; border-radius: 50%; background: #000; }
.ds-add { margin-top: 16px; padding: 14px 16px; background: #F2F2F2; border-radius: 20px; display: flex; align-items: center; justify-content: center; gap: 6px; }
.ds-add:active { background: #E8E8E8; }
.ds-add-icon { font-size: 20px; color: #000; }
.ds-add-text { font-size: 15px; font-weight: 500; color: #000; }

/* ===== 添加驾驶人 form ===== */
.add-form { display: flex; flex-direction: column; gap: 16px; padding: 8px 0 16px; }
.add-field { display: flex; flex-direction: column; gap: 8px; }
.add-label { margin-left: 16px; font-size: 13px; font-weight: 500; color: #5D5F5F; }
.add-input { height: 56px; background: #F2F2F2; border-radius: 24px; padding: 0 24px; font-size: 17px; color: #1A1C1C; border: none; }
.add-placeholder { color: #86868B; }
.add-confirm { height: 56px; background: #000; border-radius: 24px; display: flex; align-items: center; justify-content: center; }
.add-confirm:active { opacity: 0.85; }
.add-confirm-text { font-size: 17px; font-weight: 600; color: #FFF; }
</style>
