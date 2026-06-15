<template>
  <view class="page">
    <navbar title="租车出行" :show-back="true" />

    <scroll-view scroll-y class="main">
      <!-- 取还车位置 -->
      <view class="section">
        <view class="address-card">
          <view class="address-lines">
            <view class="address-line" @click="onPickAddress('pickup')">
              <view class="addr-dot dot-pickup" />
              <text class="addr-input" :class="{ placeholder: !form.pickup }">
                {{ form.pickup || '请输入取车地点' }}
              </text>
            </view>
            <view class="addr-divider" />
            <view class="address-line" @click="onPickAddress('return')">
              <view class="addr-dot dot-return" />
              <text class="addr-input" :class="{ placeholder: !form.return }">
                {{ form.return || '请输入还车位置' }}
              </text>
            </view>
          </view>
          <view class="addr-swap" @click="swapAddress">
            <text class="material-symbols-outlined">swap_vert</text>
          </view>
        </view>
      </view>

      <!-- 车型 3 tab -->
      <view class="section">
        <view class="car-card">
          <view class="car-tabs">
            <view
              v-for="(c, i) in cars"
              :key="c.id"
              class="car-tab"
              :class="{ active: carIdx === i }"
              @click="carIdx = i"
            >
              <text class="car-tab-text">{{ c.name1 }}<br />{{ c.name2 }}</text>
            </view>
          </view>

          <view class="car-detail">
            <view class="car-image">
              <view class="car-image-bg" :style="{ background: cars[carIdx].imageGradient }" />
              <text class="car-image-label">{{ cars[carIdx].seats }}座</text>
            </view>
            <view class="car-info">
              <text class="car-name">{{ cars[carIdx].tagline }}</text>
              <view class="car-features">
                <view v-for="f in cars[carIdx].features" :key="f.icon" class="car-feature">
                  <text class="material-symbols-outlined feature-icon">{{ f.icon }}</text>
                  <text class="feature-text">{{ f.text }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

    </scroll-view>

    <!-- Footer -->
    <view class="footer">
      <view class="footer-btn" @click="showPackageSheet = true">
        <text class="footer-btn-text">选择车型与日期</text>
        <text class="material-symbols-outlined footer-btn-icon">arrow_forward</text>
      </view>
    </view>

    <!-- 选择车型与日期 sheet -->
    <bottom-sheet v-model="showPackageSheet" title="选择车型与日期" :max-height="'90vh'">
      <view class="pkg-tabs">
        <view
          v-for="(c, i) in cars"
          :key="c.id"
          class="pkg-tab"
          :class="{ active: pkgCarIdx === i }"
          @click="pkgCarIdx = i"
        >
          <text class="pkg-tab-text">{{ c.name1 }}<br />{{ c.name2 }}</text>
        </view>
      </view>


      <view class="pkg-price-tag pkg-price-tag-prominent">
        <text class="pkg-price-text">¥{{ cars[pkgCarIdx].dayPrice.toLocaleString() }} / 天 · 含 {{ cars[pkgCarIdx].kmPerDay }}km</text>
      </view>

      <view class="pkg-row">
        <view class="pkg-col">
          <text class="pkg-col-label">取车日期</text>
          <view class="pkg-field" @click="onShowDateSheet">
            <text class="material-symbols-outlined field-icon">calendar_today</text>
            <text class="field-value">{{ pickupDateTimeText }}</text>
          </view>
        </view>
        <view class="pkg-col">
          <text class="pkg-col-label">租车天数</text>
          <view class="pkg-stepper">
            <view class="stepper-btn" @click="changeDays(-1)">
              <text class="material-symbols-outlined">remove</text>
            </view>
            <text class="stepper-value">{{ rentalDays }} 天</text>
            <view class="stepper-btn" @click="changeDays(1)">
              <text class="material-symbols-outlined">add</text>
            </view>
          </view>
        </view>
      </view>

      <view class="pkg-row">
        <view class="pkg-col-full">
          <text class="pkg-col-label">还车日期</text>
          <text class="return-hint">{{ returnDateHint }}</text>
        </view>
      </view>

      <template #footer>
        <view class="pkg-footer-row">
          <view class="pkg-total">
            <text class="total-label">预估总额</text>
            <view class="total-value-row">
              <text class="total-symbol">¥</text>
              <text class="total-value">{{ totalText }}</text>
            </view>
          </view>
          <view class="pkg-fee" @click="onShowFeeDetail">
            <text class="pkg-fee-text">费用明细</text>
            <text class="material-symbols-outlined pkg-fee-icon">expand_more</text>
          </view>
        </view>
        <view class="pkg-next-btn" @click="goConfirm">
          <text class="pkg-next-text">下一步</text>
          <text class="material-symbols-outlined pkg-next-icon">arrow_forward</text>
        </view>
      </template>
    </bottom-sheet>

    <!-- 取车日期 + 时间 sheet -->
    <bottom-sheet v-model="showDateSheet" title="选择取车时间" :max-height="'80vh'">
      <view class="date-section-title">日期</view>
      <view class="date-grid">
        <view
          v-for="d in dateList"
          :key="d.iso"
          class="date-cell"
          :class="{ active: pendingPickupDate === d.iso }"
          @click="pendingPickupDate = d.iso"
        >
          <text class="date-weekday">{{ d.weekday }}</text>
          <text class="date-day">{{ d.day }}</text>
          <text class="date-month">{{ d.monthLabel }}</text>
        </view>
      </view>

      <view class="date-section-title">时间</view>
      <view class="time-picker-wrap">
        <view class="time-picker-mask time-picker-mask-top" />
        <view class="time-picker-mask time-picker-mask-bottom" />
        <view class="time-picker-indicator" />
        <picker-view
          class="time-picker"
          :value="timePickerValue"
          indicator-style="height: 44px;"
          mask-style="background: transparent;"
          @change="onTimePickerChange"
        >
          <picker-view-column>
            <view v-for="h in hourList" :key="`h-${h}`" class="picker-item">{{ h }}</view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="m in minuteList" :key="`m-${m}`" class="picker-item">{{ m }}</view>
          </picker-view-column>
        </picker-view>
        <view class="time-picker-colon">:</view>
      </view>

      <template #footer>
        <view class="date-confirm" @click="confirmPickupDateTime">
          <text class="date-confirm-text">确认 {{ pendingPickupDateText }} {{ pendingPickupTime }}</text>
        </view>
      </template>
    </bottom-sheet>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import Navbar from '@/components/navbar.vue';
import BottomSheet from '@/components/bottom-sheet.vue';

type Car = {
  id: string;
  name1: string;
  name2: string;
  fullName: string;
  tagline: string;
  seats: number;
  imageGradient: string;
  dayPrice: number;
  kmPerDay: number;
  features: { icon: string; text: string }[];
};

const cars: Car[] = [
  {
    id: 'r-luxury',
    name1: '增程星辉',
    name2: '尊享版',
    fullName: '增程星辉尊享版',
    tagline: '极致尊贵 · 宽适空间',
    seats: 7,
    imageGradient: 'linear-gradient(135deg, #2c2c2e 0%, #1a1a1c 50%, #0a0a0c 100%)',
    dayPrice: 1500,
    kmPerDay: 200,
    features: [
      { icon: 'airline_seat_recline_extra', text: '头等舱座椅' },
      { icon: 'wifi', text: '5G车载WiFi' },
      { icon: 'coffee', text: '高端饮用水' },
    ],
  },
  {
    id: 'r-exec',
    name1: '增程星辉',
    name2: '行政版',
    fullName: '增程星辉行政版',
    tagline: '商务出行 · 稳健效率',
    seats: 7,
    imageGradient: 'linear-gradient(135deg, #3a3a3c 0%, #1f1f21 50%, #0d0d0f 100%)',
    dayPrice: 1800,
    kmPerDay: 200,
    features: [
      { icon: 'airline_seat_recline_extra', text: '行政座椅' },
      { icon: 'wifi', text: '5G车载WiFi' },
      { icon: 'ac_unit', text: '分区空调' },
    ],
  },
  {
    id: 'r-flagship',
    name1: '增程星耀',
    name2: '行政版',
    fullName: '增程星耀行政版',
    tagline: '旗舰豪华 · 尊荣体验',
    seats: 5,
    imageGradient: 'linear-gradient(135deg, #4a4a4c 0%, #252527 50%, #101012 100%)',
    dayPrice: 2200,
    kmPerDay: 200,
    features: [
      { icon: 'airline_seat_recline_extra', text: '按摩座椅' },
      { icon: 'wine_bar', text: '车载冷柜' },
      { icon: 'privacy_tip', text: '隐私玻璃' },
    ],
  },
];

const carIdx = ref(0);
const pkgCarIdx = ref(0);
const showPackageSheet = ref(false);
const showDateSheet = ref(false);
const statusBarHeight = ref(0);

const form = ref({
  pickup: '合肥市政务中心',
  return: '',
  pickupDate: '2026-06-09',
  pickupTime: '09:00',
});

// 租车天数 stepper
const rentalDays = ref(1);
const changeDays = (delta: number) => {
  const next = rentalDays.value + delta;
  if (next < 1) return;
  if (next > 30) { uni.showToast({ title: '最长可选择 30 天', icon: 'none' }); return; }
  rentalDays.value = next;
};

// 日期 grid
const dateList = computed(() => {
  const list: { iso: string; weekday: string; day: string; monthLabel: string }[] = [];
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const base = new Date('2026-06-09T00:00:00');
  for (let i = 0; i < 14; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    list.push({
      iso: `${y}-${m}-${dd}`,
      weekday: i === 0 ? '今天' : i === 1 ? '明天' : weekdays[d.getDay()],
      day: String(d.getDate()),
      monthLabel: `${parseInt(m, 10)}月`,
    });
  }
  return list;
});

// 时间滚轮
const hourList = computed(() => {
  const list: string[] = [];
  for (let h = 6; h <= 22; h++) list.push(String(h).padStart(2, '0'));
  return list;
});
const minuteList = ['00', '15', '30', '45'];
const timePickerValue = ref<[number, number]>([3, 0]); // 默认 09:00

const onTimePickerChange = (e: { detail: { value: number[] } }) => {
  const [hi, mi] = e.detail.value;
  timePickerValue.value = [hi, mi];
  const h = hourList.value[hi] ?? '09';
  const m = minuteList[mi] ?? '00';
  pendingPickupTime.value = `${h}:${m}`;
};

const pendingPickupDate = ref(form.value.pickupDate);
const pendingPickupTime = ref(form.value.pickupTime);

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 0;
});

// 取车时间展示文本
const pickupDateTimeText = computed(() => {
  const item = dateList.value.find(d => d.iso === form.value.pickupDate);
  if (!item) return `${form.value.pickupDate} ${form.value.pickupTime}`;
  return `${item.weekday} ${form.value.pickupDate.slice(5)} ${form.value.pickupTime}`;
});

const pendingPickupDateText = computed(() => {
  const item = dateList.value.find(d => d.iso === pendingPickupDate.value);
  if (!item) return '';
  return `${item.weekday} ${item.iso.slice(5)}`;
});

// 还车日期：根据取车日 + 天数自动推算，格式 "X号 周X前还车"
const returnDateHint = computed(() => {
  const start = new Date(`${form.value.pickupDate}T00:00:00`);
  start.setDate(start.getDate() + rentalDays.value);
  return `${start.getMonth() + 1}月${start.getDate()}日 ${form.value.pickupTime}前还车`;
});

const onShowDateSheet = () => {
  pendingPickupDate.value = form.value.pickupDate;
  pendingPickupTime.value = form.value.pickupTime;
  showDateSheet.value = true;
};

const confirmPickupDateTime = () => {
  const item = dateList.value.find(d => d.iso === pendingPickupDate.value);
  if (item) {
    form.value.pickupDate = item.iso;
    form.value.pickupTime = pendingPickupTime.value;
  }
  showDateSheet.value = false;
};

const totalDays = computed(() => rentalDays.value);

const totalText = computed(() =>
  (cars[pkgCarIdx.value].dayPrice * totalDays.value).toLocaleString()
);

const onPickAddress = (fld: 'pickup' | 'return') => {
  /* 复用现有 address 搜索流程：field 字段名要避开和包车冲突，用 rental 前缀 */
  uni.setStorageSync('address-pick-field', `rental-${fld}`);
  uni.navigateTo({ url: `/pages/address/search?field=rental-${fld}` });
};

onShow(() => {
  try {
    const result = uni.getStorageSync('address-pick-result');
    if (result && result.field && result.name) {
      if (result.field === 'rental-pickup') {
        form.value.pickup = result.name;
      } else if (result.field === 'rental-return') {
        form.value.return = result.name;
      }
      if (String(result.field).startsWith('rental-')) {
        uni.removeStorageSync('address-pick-result');
      }
    }
  } catch (e) {
    // ignore
  }
});

const swapAddress = () => {
  const t = form.value.pickup;
  form.value.pickup = form.value.return;
  form.value.return = t;
};

const onShowFeeDetail = () => {
  showPackageSheet.value = false;
  setTimeout(() => {
    uni.navigateTo({
      url: `/pages/rental/fee?carIdx=${pkgCarIdx.value}&days=${totalDays.value}`,
    });
  }, 350);
};

const goConfirm = () => {
  if (!form.value.return) {
    uni.showToast({ title: '请选择还车位置', icon: 'none' });
    return;
  }
  showPackageSheet.value = false;
  setTimeout(() => {
    const params = [
      `carIdx=${pkgCarIdx.value}`,
      `days=${totalDays.value}`,
      `pickup=${encodeURIComponent(form.value.pickup)}`,
      `return=${encodeURIComponent(form.value.return)}`,
      `pickupDate=${form.value.pickupDate}`,
      `pickupTime=${form.value.pickupTime}`,
      `rentalDays=${rentalDays.value}`,
    ].join('&');
    uni.navigateTo({ url: `/pages/rental/confirm?${params}` });
  }, 350);
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F9F9F9;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main {
  flex: 1;
  min-height: 0;
}

.section {
  padding: 0 24px;
  margin-top: 20px;
}

.bottom-spacer {
  height: 120px;
}

/* ===== 取还车 ===== */
.address-card {
  background: #FFFFFF;
  border: 1px solid #F2F2F2;
  border-radius: 32px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.address-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.address-line {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 32px;
}

.addr-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-pickup {
  background: #10B981;
}

.dot-return {
  background: #EF4444;
}

.addr-input {
  flex: 1;
  font-size: 17px;
  line-height: 26px;
  font-weight: 600;
  color: #1A1C1C;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &.placeholder {
    color: #9C9C9F;
    font-weight: 400;
  }
}

.addr-divider {
  height: 1px;
  margin-left: 26px;
  background: rgba(207, 196, 197, 0.3);
}

.addr-swap {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #F2F2F2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);

  .material-symbols-outlined {
    font-size: 20px;
    color: #1A1C1C;
  }

  &:active {
    transform: scale(0.95);
  }
}


/* ===== 车型卡 ===== */
.car-card {
  background: #FFFFFF;
  border: 1px solid #F2F2F2;
  border-radius: 32px;
  overflow: hidden;
}

.car-tabs {
  display: flex;
  border-bottom: 1px solid #F2F2F2;
}

.car-tab {
  flex: 1;
  padding: 14px 4px;
  text-align: center;
  border-bottom: 2px solid transparent;
}

.car-tab.active {
  border-bottom-color: #000000;
}

.car-tab-text {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #86868B;
}

.car-tab.active .car-tab-text {
  color: #000000;
  font-weight: 700;
}

.car-image {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.car-image-bg {
  position: absolute;
  inset: 0;
}

.car-image-label {
  position: absolute;
  bottom: 16px;
  left: 16px;
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
}

.car-info {
  padding: 16px 20px 20px;
}

.car-name {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: #000000;
}

.car-features {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.car-feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #F2F2F2;
  border-radius: 12px;
  padding: 10px 4px;
  gap: 4px;
}

.feature-icon {
  font-size: 18px;
  color: #5D5F5F;
}

.feature-text {
  font-size: 10px;
  line-height: 14px;
  color: #5D5F5F;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  padding: 16px 24px calc(24px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(to top, #F9F9F9 60%, rgba(249, 249, 249, 0));
}

.footer-btn {
  height: 58px;
  background: #000000;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);

  &:active {
    transform: scale(0.98);
    opacity: 0.85;
  }
}

.footer-btn-text {
  font-size: 17px;
  line-height: 26px;
  font-weight: 600;
  color: #FFFFFF;
}

.footer-btn-icon {
  font-size: 20px;
  color: #FFFFFF;
}

/* ===== Sheet: 选择车型与日期 ===== */
.pkg-tabs {
  display: flex;
  border-bottom: 1px solid #F2F2F2;
  margin-bottom: 16px;
}

.pkg-tab {
  flex: 1;
  padding: 12px 4px;
  text-align: center;
  border-bottom: 2px solid transparent;
}

.pkg-tab.active {
  border-bottom-color: #000000;
}

.pkg-tab-text {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #86868B;
}

.pkg-tab.active .pkg-tab-text {
  color: #000000;
  font-weight: 700;
}

.pkg-price-tag {
  display: block;
  padding: 14px 20px;
  background: #F2F2F2;
  border-radius: 16px;
  text-align: center;
  margin-bottom: 20px;
}

.pkg-price-tag-prominent {
  margin-bottom: 20px;
}

.pkg-price-text {
  font-size: 18px;
  line-height: 26px;
  font-weight: 600;
  color: #1A1C1C;
}

.pkg-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.pkg-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pkg-col-label {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #5D5F5F;
}

.pkg-field {
  height: 56px;
  background: #F2F2F2;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;

  &:active {
    background: #E8E8E8;
  }
}

.field-icon {
  font-size: 20px;
  color: #5D5F5F;
}

.field-value {
  font-size: 15px;
  line-height: 22px;
  color: #000000;
}

.pkg-col-full {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.return-hint {
  font-size: 14px;
  line-height: 22px;
  font-weight: 500;
  color: #1A1C1C;
}

.pkg-stepper {
  height: 56px;
  background: #F2F2F2;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.stepper-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

  .material-symbols-outlined {
    font-size: 18px;
    color: #1A1C1C;
  }

  &:active {
    transform: scale(0.95);
  }
}

.stepper-value {
  font-size: 15px;
  line-height: 22px;
  font-weight: 700;
  color: #000000;
}

/* 日期弹窗 */
.date-section-title {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: #86868B;
  text-transform: uppercase;
  padding: 12px 0 12px;
}

/* 时间滚轮 */
.time-picker-wrap {
  position: relative;
  height: 200px;
  margin-bottom: 16px;
  background: #F2F2F2;
  border-radius: 24px;
  overflow: hidden;
}

.time-picker {
  width: 100%;
  height: 100%;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  font-size: 22px;
  line-height: 28px;
  font-weight: 500;
  color: #1A1C1C;
  font-variant-numeric: tabular-nums;
}

.time-picker-mask { position: absolute; left: 0; right: 0; height: 78px; pointer-events: none; z-index: 2; }
.time-picker-mask-top { top: 0; background: linear-gradient(to bottom, #F2F2F2 0%, rgba(242, 242, 242, 0.8) 60%, rgba(242, 242, 242, 0) 100%); }
.time-picker-mask-bottom { bottom: 0; background: linear-gradient(to top, #F2F2F2 0%, rgba(242, 242, 242, 0.8) 60%, rgba(242, 242, 242, 0) 100%); }
.time-picker-indicator { position: absolute; top: 50%; left: 24px; right: 24px; height: 44px; transform: translateY(-50%); border-top: 1px solid #E2E2E2; border-bottom: 1px solid #E2E2E2; pointer-events: none; z-index: 1; }
.time-picker-colon { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 22px; line-height: 28px; font-weight: 500; color: #1A1C1C; pointer-events: none; z-index: 3; }


/* sheet footer */
.pkg-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
}

.pkg-total {
  display: flex;
  flex-direction: column;
}

.total-label {
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  color: #5D5F5F;
  letter-spacing: 0.05em;
}

.total-value-row {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin-top: 2px;
}

.total-symbol {
  font-size: 14px;
  font-weight: 700;
  color: #000000;
}

.total-value {
  font-size: 28px;
  line-height: 36px;
  font-weight: 700;
  color: #000000;
  letter-spacing: -0.01em;
}

.pkg-fee {
  display: flex;
  align-items: center;
  gap: 2px;

  &:active {
    opacity: 0.7;
  }
}

.pkg-fee-text {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #0057FF;
}

.pkg-fee-icon {
  font-size: 18px;
  color: #0057FF;
}

.pkg-next-btn {
  height: 56px;
  background: #000000;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:active {
    opacity: 0.8;
  }
}

.pkg-next-text {
  font-size: 17px;
  line-height: 26px;
  font-weight: 600;
  color: #FFFFFF;
}

.pkg-next-icon {
  font-size: 20px;
  color: #FFFFFF;
}

/* ===== Sheet: 日期 ===== */
.date-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 8px 0 16px;
}

.date-cell {
  background: #F2F2F2;
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 12px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.date-cell.active {
  background: #FFFFFF;
  border-color: #000000;
}

.date-cell.disabled {
  opacity: 0.35;
}

.date-weekday {
  font-size: 11px;
  font-weight: 500;
  color: #5D5F5F;
}

.date-day {
  font-size: 22px;
  line-height: 28px;
  font-weight: 700;
  color: #000000;
}

.date-month {
  font-size: 10px;
  color: #86868B;
}

.date-confirm {
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

.date-confirm-text {
  font-size: 17px;
  line-height: 26px;
  font-weight: 600;
  color: #FFFFFF;
}
</style>
