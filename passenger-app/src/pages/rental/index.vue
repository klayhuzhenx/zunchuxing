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
        <text class="addr-tip">取车与还车位置可相同也可不同，由专属司机送至取车位置</text>
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
              <text class="car-image-label">{{ cars[carIdx].fullName }}</text>
            </view>
            <view class="car-info">
              <view class="car-info-left">
                <text class="car-name">{{ cars[carIdx].fullName }}</text>
                <text class="car-tagline">{{ cars[carIdx].tagline }}</text>
              </view>
              <view class="car-info-right">
                <text class="car-price">¥{{ cars[carIdx].dayPrice.toLocaleString() }}<text class="car-price-unit"> /天</text></text>
                <text class="car-km">含 {{ cars[carIdx].kmPerDay }}km</text>
              </view>
            </view>
            <view class="car-features">
              <view v-for="f in cars[carIdx].features" :key="f.icon" class="car-feature">
                <text class="material-symbols-outlined feature-icon">{{ f.icon }}</text>
                <text class="feature-text">{{ f.text }}</text>
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
          <view class="pkg-field" @click="onShowDateSheet('pickup')">
            <text class="material-symbols-outlined field-icon">calendar_today</text>
            <text class="field-value">{{ form.pickupDateText }}</text>
          </view>
        </view>
        <view class="pkg-col">
          <text class="pkg-col-label">还车日期</text>
          <view class="pkg-field" @click="onShowDateSheet('return')">
            <text class="material-symbols-outlined field-icon">event</text>
            <text class="field-value">{{ form.returnDateText }}</text>
          </view>
        </view>
      </view>

      <view class="pkg-days-row">
        <text class="pkg-days-label">租车天数</text>
        <text class="pkg-days-value">{{ totalDays }} 天</text>
      </view>

      <view class="pkg-warn">
        <text class="material-symbols-outlined pkg-warn-icon">info</text>
        <text class="pkg-warn-text">超里程 ¥10/公里，按实际结算</text>
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

    <!-- 取车/还车日期 sheet -->
    <bottom-sheet
      v-model="showDateSheet"
      :title="dateSheetTitle"
      :max-height="'70vh'"
    >
      <view class="date-grid">
        <view
          v-for="d in dateList"
          :key="d.iso"
          class="date-cell"
          :class="{
            active: pendingDate === d.iso,
            disabled: dateMode === 'return' && d.iso < form.pickupDate,
          }"
          @click="onPickDateCell(d)"
        >
          <text class="date-weekday">{{ d.weekday }}</text>
          <text class="date-day">{{ d.day }}</text>
          <text class="date-month">{{ d.monthLabel }}</text>
        </view>
      </view>

      <template #footer>
        <view class="date-confirm" @click="confirmDate">
          <text class="date-confirm-text">确认日期</text>
        </view>
      </template>
    </bottom-sheet>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import Navbar from '@/components/navbar.vue';
import BottomSheet from '@/components/bottom-sheet.vue';

type Car = {
  id: string;
  name1: string;
  name2: string;
  fullName: string;
  tagline: string;
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
const dateMode = ref<'pickup' | 'return'>('pickup');

const form = ref({
  pickup: '合肥市政务中心',
  return: '',
  pickupDate: '2026-06-09',
  pickupDateText: '今天 06-09',
  returnDate: '2026-06-12',
  returnDateText: '06-12',
});

const pendingDate = ref(form.value.pickupDate);

/* 12 天 */
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

const totalDays = computed(() => {
  const start = new Date(form.value.pickupDate);
  const end = new Date(form.value.returnDate);
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000);
  return Math.max(1, diff);
});

const totalText = computed(() =>
  (cars[pkgCarIdx.value].dayPrice * totalDays.value).toLocaleString()
);

const dateSheetTitle = computed(() =>
  dateMode.value === 'pickup' ? '选择取车日期' : '选择还车日期'
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

const onShowDateSheet = (mode: 'pickup' | 'return') => {
  dateMode.value = mode;
  pendingDate.value = mode === 'pickup' ? form.value.pickupDate : form.value.returnDate;
  showDateSheet.value = true;
};

const onPickDateCell = (d: { iso: string }) => {
  if (dateMode.value === 'return' && d.iso < form.value.pickupDate) {
    uni.showToast({ title: '还车日期不能早于取车日期', icon: 'none' });
    return;
  }
  pendingDate.value = d.iso;
};

const confirmDate = () => {
  const item = dateList.value.find((d) => d.iso === pendingDate.value);
  if (!item) {
    showDateSheet.value = false;
    return;
  }
  const monthDay = item.iso.slice(5);
  const text = item.weekday === '今天' || item.weekday === '明天' ? `${item.weekday} ${monthDay}` : `${item.weekday} ${monthDay}`;
  if (dateMode.value === 'pickup') {
    form.value.pickupDate = item.iso;
    form.value.pickupDateText = text;
    /* 如果还车 < 取车，自动顺延为取车 + 1 天 */
    if (form.value.returnDate <= item.iso) {
      const nextDay = dateList.value.find((d) => d.iso > item.iso);
      if (nextDay) {
        form.value.returnDate = nextDay.iso;
        form.value.returnDateText = `${nextDay.weekday} ${nextDay.iso.slice(5)}`;
      }
    }
  } else {
    form.value.returnDate = item.iso;
    form.value.returnDateText = text;
  }
  showDateSheet.value = false;
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
      `returnDate=${form.value.returnDate}`,
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

.addr-tip {
  display: block;
  margin-top: 16px;
  font-size: 11px;
  line-height: 16px;
  color: #86868B;
  text-align: center;
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
  padding: 16px 20px 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.car-info-left {
  flex: 1;
}

.car-name {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: #000000;
  display: block;
}

.car-tagline {
  margin-top: 4px;
  font-size: 13px;
  line-height: 18px;
  color: #86868B;
  display: block;
}

.car-info-right {
  text-align: right;
}

.car-price {
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
  color: #000000;
}

.car-price-unit {
  font-size: 11px;
  font-weight: 500;
  color: #86868B;
}

.car-km {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: #86868B;
}

.car-features {
  padding: 16px 20px 20px;
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
  padding: 20px;
  background: #000;
  border-radius: 20px;
  text-align: center;
  margin-bottom: 20px;
}

.pkg-price-tag-prominent {
  margin-bottom: 20px;
}

.pkg-price-text {
  font-size: 28px;
  line-height: 36px;
  font-weight: 700;
  color: #FFF;
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

.pkg-days-row {
  background: #F2F2F2;
  border-radius: 24px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.pkg-days-label {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #5D5F5F;
}

.pkg-days-value {
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
  color: #000000;
}

.pkg-warn {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  padding: 0 4px;
}

.pkg-warn-icon {
  font-size: 14px;
  color: #86868B;
}

.pkg-warn-text {
  font-size: 11px;
  line-height: 16px;
  color: #86868B;
}

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
