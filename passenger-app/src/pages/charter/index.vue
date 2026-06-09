<template>
  <view class="page">
    <!-- 顶部 navbar -->
    <navbar title="包车出行" :show-back="true" />

    <!-- 主内容 -->
    <scroll-view scroll-y class="main">
      <!-- 起终点输入 -->
      <view class="section">
        <view class="address-card">
          <view class="address-lines">
            <view class="address-line" @click="onPickAddress('origin')">
              <view class="addr-dot dot-origin" />
              <text class="addr-input" :class="{ placeholder: !form.origin }">
                {{ form.origin || '您在哪儿出发？' }}
              </text>
            </view>
            <view class="addr-divider" />
            <view class="address-line" @click="onPickAddress('destination')">
              <view class="addr-dot dot-dest" />
              <text class="addr-input" :class="{ placeholder: !form.destination }">
                {{ form.destination || '要去哪儿？' }}
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
          <!-- 车型 tab -->
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

          <!-- 当前车型详情 -->
          <view class="car-detail">
            <view class="car-image">
              <view class="car-image-bg" :style="{ background: cars[carIdx].imageGradient }" />
              <text class="car-image-label">{{ cars[carIdx].fullName }}</text>
            </view>
            <view class="car-info">
              <text class="car-name">{{ cars[carIdx].fullName }}</text>
              <text class="car-tagline">{{ cars[carIdx].tagline }}</text>
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

      <!-- 尊崇礼遇 -->
      <view class="section">
        <view class="privilege-card">
          <text class="privilege-title">尊崇礼遇</text>
          <view class="privilege-list">
            <view class="privilege-item">
              <text class="material-symbols-outlined privilege-icon ms-fill">verified</text>
              <text class="privilege-text">金牌管家式司机服务</text>
            </view>
            <view class="privilege-item">
              <text class="material-symbols-outlined privilege-icon ms-fill">security</text>
              <text class="privilege-text">千万级乘客意外保障险</text>
            </view>
          </view>
          <view class="privilege-glow" />
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="footer">
      <view class="footer-btn" @click="showPackageSheet = true">
        <text class="footer-btn-text">选择套餐</text>
        <text class="material-symbols-outlined footer-btn-icon">arrow_forward</text>
      </view>
    </view>

    <!-- 套餐弹窗 -->
    <bottom-sheet v-model="showPackageSheet" title="选择套餐" :max-height="'88vh'">
      <!-- 套餐 tab (复用车型 tab 结构) -->
      <view class="pkg-tabs">
        <view
          v-for="(c, i) in cars"
          :key="c.id"
          class="pkg-tab"
          :class="{ active: pkgCarIdx === i }"
          @click="onPkgTabChange(i)"
        >
          <text class="pkg-tab-text">{{ c.name1 }}<br />{{ c.name2 }}</text>
        </view>
      </view>

      <!-- 当前车型小图 -->
      <view class="pkg-image">
        <view class="pkg-image-bg" :style="{ background: cars[pkgCarIdx].imageGradient }" />
        <text class="pkg-image-label">{{ cars[pkgCarIdx].fullName }}</text>
      </view>

      <!-- 套餐 grid 3列x2行 -->
      <view class="pkg-grid">
        <view
          v-for="pkg in cars[pkgCarIdx].packages"
          :key="pkg.id"
          class="pkg-item"
          :class="{ active: selectedPkgId === pkg.id }"
          @click="selectPkg(pkg)"
        >
          <text class="pkg-tier">{{ pkg.tier }}</text>
          <text class="pkg-spec">{{ pkg.spec }}</text>
          <text class="pkg-price">¥{{ pkg.price }}</text>
        </view>
      </view>

      <!-- 包含权益 -->
      <view class="pkg-section-title">包含权益</view>
      <view class="amenity-chips">
        <view class="amenity-chip">
          <text class="material-symbols-outlined chip-icon">local_drink</text>
          <text class="chip-text">免费饮用水</text>
        </view>
        <view class="amenity-chip">
          <text class="material-symbols-outlined chip-icon">wifi</text>
          <text class="chip-text">车载 WiFi</text>
        </view>
        <view class="amenity-chip">
          <text class="material-symbols-outlined chip-icon">layers</text>
          <text class="chip-text">纸巾湿巾</text>
        </view>
        <view v-if="hasAmenityTea" class="amenity-chip">
          <text class="material-symbols-outlined chip-icon">restaurant</text>
          <text class="chip-text">精致茶点</text>
        </view>
        <view v-if="hasAmenityChampagne" class="amenity-chip">
          <text class="material-symbols-outlined chip-icon">celebration</text>
          <text class="chip-text">香槟礼遇</text>
        </view>
        <view class="amenity-chip">
          <text class="material-symbols-outlined chip-icon">face</text>
          <text class="chip-text">专属管家</text>
        </view>
      </view>

      <!-- 日期 + 天数 -->
      <view class="pkg-row">
        <view class="pkg-col">
          <text class="pkg-col-label">开始日期</text>
          <view class="pkg-field" @click="showDateSheet = true">
            <text class="material-symbols-outlined field-icon">calendar_today</text>
            <text class="field-value">{{ form.dateText }}</text>
          </view>
        </view>
        <view class="pkg-col">
          <text class="pkg-col-label">包车天数</text>
          <view class="pkg-stepper">
            <view class="stepper-btn" @click="changeDays(-1)">
              <text class="material-symbols-outlined">remove</text>
            </view>
            <text class="stepper-value">{{ form.days }} 天</text>
            <view class="stepper-btn" @click="changeDays(1)">
              <text class="material-symbols-outlined">add</text>
            </view>
          </view>
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

    <!-- 日期弹窗 -->
    <bottom-sheet v-model="showDateSheet" title="选择用车时间" :max-height="'82vh'">
      <view class="date-section-title">日期</view>
      <view class="date-grid">
        <view
          v-for="d in dateList"
          :key="d.iso"
          class="date-cell"
          :class="{ active: pendingDate === d.iso }"
          @click="pendingDate = d.iso"
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
            <view
              v-for="h in hourList"
              :key="`h-${h}`"
              class="picker-item"
            >{{ h }}</view>
          </picker-view-column>
          <picker-view-column>
            <view
              v-for="m in minuteList"
              :key="`m-${m}`"
              class="picker-item"
            >{{ m }}</view>
          </picker-view-column>
        </picker-view>
        <view class="time-picker-colon">:</view>
      </view>

      <template #footer>
        <view class="date-confirm" @click="confirmDate">
          <text class="date-confirm-text">确认 {{ pendingDateText }} {{ pendingTime }}</text>
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

/* ============ 数据 ============ */
type Pkg = { id: string; tier: string; spec: string; price: number; duration: 'half' | 'full' };
type Car = {
  id: string;
  name1: string;
  name2: string;
  fullName: string;
  tagline: string;
  imageGradient: string;
  features: { icon: string; text: string }[];
  packages: Pkg[];
};

const cars = ref<Car[]>([
  {
    id: 'star-shine-luxury',
    name1: '增程星辉',
    name2: '尊享版',
    fullName: '增程星辉尊享版',
    tagline: '极致尊贵 · 宽适空间',
    imageGradient: 'linear-gradient(135deg, #2c2c2e 0%, #1a1a1c 50%, #0a0a0c 100%)',
    features: [
      { icon: 'airline_seat_recline_extra', text: '头等舱座椅' },
      { icon: 'wifi', text: '5G车载WiFi' },
      { icon: 'coffee', text: '高端饮用水' },
    ],
    packages: [
      { id: 'a-h-base', tier: '尊享基础', spec: '半日租 · 4h/50km', price: 988, duration: 'half' },
      { id: 'a-h-pro', tier: '尊荣高级', spec: '半日租 · 4h/50km', price: 1188, duration: 'half' },
      { id: 'a-h-top', tier: '尊御顶级', spec: '半日租 · 4h/50km', price: 1588, duration: 'half' },
      { id: 'a-f-base', tier: '尊享基础', spec: '日租 · 8h/100km', price: 1888, duration: 'full' },
      { id: 'a-f-pro', tier: '尊荣高级', spec: '日租 · 8h/100km', price: 2088, duration: 'full' },
      { id: 'a-f-top', tier: '尊御顶级', spec: '日租 · 8h/100km', price: 2688, duration: 'full' },
    ],
  },
  {
    id: 'star-shine-exec',
    name1: '增程星辉',
    name2: '行政版',
    fullName: '增程星辉行政版',
    tagline: '商务出行 · 稳健效率',
    imageGradient: 'linear-gradient(135deg, #3a3a3c 0%, #1f1f21 50%, #0d0d0f 100%)',
    features: [
      { icon: 'airline_seat_recline_extra', text: '行政座椅' },
      { icon: 'wifi', text: '5G车载WiFi' },
      { icon: 'ac_unit', text: '分区空调' },
    ],
    packages: [
      { id: 'b-h-base', tier: '尊享基础', spec: '半日租 · 4h/50km', price: 1088, duration: 'half' },
      { id: 'b-h-pro', tier: '尊荣高级', spec: '半日租 · 4h/50km', price: 1288, duration: 'half' },
      { id: 'b-h-top', tier: '尊御顶级', spec: '半日租 · 4h/50km', price: 1688, duration: 'half' },
      { id: 'b-f-base', tier: '尊享基础', spec: '日租 · 8h/100km', price: 1988, duration: 'full' },
      { id: 'b-f-pro', tier: '尊荣高级', spec: '日租 · 8h/100km', price: 2288, duration: 'full' },
      { id: 'b-f-top', tier: '尊御顶级', spec: '日租 · 8h/100km', price: 2888, duration: 'full' },
    ],
  },
  {
    id: 'star-radiance-exec',
    name1: '增程星耀',
    name2: '行政版',
    fullName: '增程星耀行政版',
    tagline: '旗舰豪华 · 尊荣体验',
    imageGradient: 'linear-gradient(135deg, #4a4a4c 0%, #252527 50%, #101012 100%)',
    features: [
      { icon: 'airline_seat_recline_extra', text: '按摩座椅' },
      { icon: 'wine_bar', text: '车载冷柜' },
      { icon: 'privacy_tip', text: '隐私玻璃' },
    ],
    packages: [
      { id: 'c-h-base', tier: '尊享基础', spec: '半日租 · 4h/50km', price: 1288, duration: 'half' },
      { id: 'c-h-pro', tier: '尊荣高级', spec: '半日租 · 4h/50km', price: 1588, duration: 'half' },
      { id: 'c-h-top', tier: '尊御顶级', spec: '半日租 · 4h/50km', price: 1888, duration: 'half' },
      { id: 'c-f-base', tier: '尊享基础', spec: '日租 · 8h/100km', price: 2288, duration: 'full' },
      { id: 'c-f-pro', tier: '尊荣高级', spec: '日租 · 8h/100km', price: 2688, duration: 'full' },
      { id: 'c-f-top', tier: '尊御顶级', spec: '日租 · 8h/100km', price: 3288, duration: 'full' },
    ],
  },
]);

const carIdx = ref(0);
const pkgCarIdx = ref(0);
const showPackageSheet = ref(false);
const showDateSheet = ref(false);

/* 默认套餐：日租尊荣高级（每辆车的第 5 个） */
const defaultPkg = computed(() => cars.value[pkgCarIdx.value].packages[4]);
const selectedPkgId = ref<string>(defaultPkg.value.id);

const form = ref({
  origin: '上海虹桥国际机场',
  destination: '',
  dateText: '今天 · 06-09 09:00',
  dateIso: '2026-06-09',
  timeText: '09:00',
  days: 1,
});

const pendingDate = ref(form.value.dateIso);
const pendingTime = ref(form.value.timeText);

/* 时间滚轮：6:00 - 22:45，每 15 分钟一档 */
const hourList = computed(() => {
  const list: string[] = [];
  for (let h = 6; h <= 22; h++) {
    list.push(String(h).padStart(2, '0'));
  }
  return list;
});

const minuteList = ['00', '15', '30', '45'];

/* picker-view 双列索引 */
const timePickerValue = ref<[number, number]>([3, 0]); // 默认 09:00

const onTimePickerChange = (e: { detail: { value: number[] } }) => {
  const [hi, mi] = e.detail.value;
  timePickerValue.value = [hi, mi];
  const h = hourList.value[hi] ?? '09';
  const m = minuteList[mi] ?? '00';
  pendingTime.value = `${h}:${m}`;
};

/* pendingDateText：sheet 底部按钮上预览 */
const pendingDateText = computed(() => {
  const item = dateList.value.find((d) => d.iso === pendingDate.value);
  if (!item) return '';
  const monthDay = item.iso.slice(5);
  return `${item.weekday} ${monthDay}`;
});

/* ============ 计算 ============ */
const selectedPkg = computed(() =>
  cars.value[pkgCarIdx.value].packages.find((p) => p.id === selectedPkgId.value)
  || defaultPkg.value
);

const totalText = computed(() => {
  const total = selectedPkg.value.price * form.value.days;
  return total.toLocaleString();
});

/* 顶级套餐附加权益 */
const hasAmenityTea = computed(() => selectedPkg.value.tier !== '尊享基础');
const hasAmenityChampagne = computed(() => selectedPkg.value.tier === '尊御顶级');

/* 日期 grid：未来 12 天 */
const dateList = computed(() => {
  const list: { iso: string; weekday: string; day: string; monthLabel: string }[] = [];
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const base = new Date('2026-06-09T00:00:00');
  for (let i = 0; i < 12; i++) {
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

/* ============ 事件 ============ */
const onPickAddress = (fld: 'origin' | 'destination') => {
  uni.setStorageSync('address-pick-field', fld);
  uni.navigateTo({ url: `/pages/address/search?field=${fld}` });
};

/* 页面回到前台时，读取选址结果回填 */
onShow(() => {
  try {
    const result = uni.getStorageSync('address-pick-result');
    if (result && result.field && result.name) {
      if (result.field === 'origin') {
        form.value.origin = result.name;
      } else if (result.field === 'destination') {
        form.value.destination = result.name;
      }
      uni.removeStorageSync('address-pick-result');
    }
  } catch (e) {
    // 忽略
  }
});

const swapAddress = () => {
  const t = form.value.origin;
  form.value.origin = form.value.destination;
  form.value.destination = t;
};

const onPkgTabChange = (i: number) => {
  pkgCarIdx.value = i;
  // 切换车型后，默认选中该车型的第 5 个（日租尊荣高级）
  selectedPkgId.value = cars.value[i].packages[4].id;
};

const selectPkg = (pkg: Pkg) => {
  selectedPkgId.value = pkg.id;
};

const changeDays = (delta: number) => {
  const next = form.value.days + delta;
  if (next < 1 || next > 30) return;
  form.value.days = next;
};

const confirmDate = () => {
  const item = dateList.value.find((d) => d.iso === pendingDate.value);
  if (item) {
    form.value.dateIso = item.iso;
    form.value.timeText = pendingTime.value;
    const monthDay = item.iso.slice(5);
    form.value.dateText = `${item.weekday} · ${monthDay} ${pendingTime.value}`;
  }
  showDateSheet.value = false;
};

const onShowFeeDetail = () => {
  /* 关闭套餐弹窗后跳转费用明细页 */
  showPackageSheet.value = false;
  setTimeout(() => {
    uni.navigateTo({
      url: `/pages/charter/fee?carIdx=${pkgCarIdx.value}&pkgId=${selectedPkgId.value}&days=${form.value.days}`,
    });
  }, 350);
};

const goConfirm = () => {
  if (!form.value.destination) {
    uni.showToast({ title: '请选择目的地', icon: 'none' });
    return;
  }
  showPackageSheet.value = false;
  setTimeout(() => {
    const params = [
      `carIdx=${pkgCarIdx.value}`,
      `pkgId=${selectedPkgId.value}`,
      `days=${form.value.days}`,
      `dateIso=${form.value.dateIso}`,
      `time=${form.value.timeText}`,
      `origin=${encodeURIComponent(form.value.origin)}`,
      `destination=${encodeURIComponent(form.value.destination)}`,
    ].join('&');
    uni.navigateTo({ url: `/pages/charter/confirm?${params}` });
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

/* ============ 起终点输入 ============ */
.address-card {
  background: #FFFFFF;
  border: 1px solid #F2F2F2;
  border-radius: 32px;
  padding: 20px;
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
  gap: 12px;
  height: 32px;
}

.addr-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-origin {
  background: #10B981;
}

.dot-dest {
  background: #EF4444;
}

.addr-input {
  flex: 1;
  font-size: 17px;
  line-height: 26px;
  font-weight: 400;
  color: #1A1C1C;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &.placeholder {
    color: #9C9C9F;
  }
}

.addr-divider {
  height: 1px;
  margin-left: 22px;
  background: #F2F2F2;
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
  transition: transform 0.15s ease;

  .material-symbols-outlined {
    font-size: 20px;
    color: #1A1C1C;
  }

  &:active {
    transform: scale(0.95);
    background: #E2E2E2;
  }
}

/* ============ 车型卡片 ============ */
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
  transition: all 0.2s ease;
}

.car-tab.active {
  border-bottom-color: #000000;
}

.car-tab-text {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #86868B;
  letter-spacing: 0.01em;
}

.car-tab.active .car-tab-text {
  color: #000000;
  font-weight: 700;
}

.car-detail {
  padding: 0;
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

.car-tagline {
  margin-top: 4px;
  font-size: 13px;
  line-height: 18px;
  color: #86868B;
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
  text-align: center;
}

/* ============ 尊崇礼遇 ============ */
.privilege-card {
  position: relative;
  background: #000000;
  border-radius: 32px;
  padding: 20px;
  overflow: hidden;
}

.privilege-title {
  position: relative;
  z-index: 1;
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 12px;
}

.privilege-list {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.privilege-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.privilege-icon {
  font-size: 20px;
  color: #D4AF37;
}

.privilege-text {
  font-size: 15px;
  line-height: 22px;
  color: rgba(255, 255, 255, 0.9);
}

.privilege-glow {
  position: absolute;
  right: -20px;
  top: -20px;
  width: 160px;
  height: 160px;
  background: rgba(0, 87, 255, 0.20);
  border-radius: 50%;
  filter: blur(60px);
}

/* ============ Footer 按钮 ============ */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px calc(16px + env(safe-area-inset-bottom, 0px));
  background: #FFFFFF;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.04);
  z-index: 40;
}

.footer-btn {
  height: 56px;
  background: #000000;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;

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

/* ============ 套餐弹窗 ============ */
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

.pkg-image {
  position: relative;
  width: 100%;
  height: 112px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
}

.pkg-image-bg {
  position: absolute;
  inset: 0;
}

.pkg-image-label {
  position: absolute;
  bottom: 12px;
  left: 16px;
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.05em;
}

.pkg-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.pkg-item {
  background: #F2F2F2;
  border: 2px solid transparent;
  border-radius: 20px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  transition: all 0.15s ease;
}

.pkg-item.active {
  background: #FFFFFF;
  border-color: #000000;
}

.pkg-tier {
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  color: #5D5F5F;
}

.pkg-spec {
  font-size: 9px;
  line-height: 14px;
  color: #86868B;
}

.pkg-price {
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: #000000;
  margin-top: 4px;
}

.pkg-section-title {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #5D5F5F;
  margin-bottom: 12px;
}

.amenity-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.amenity-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #F2F2F2;
  border-radius: 9999px;
}

.chip-icon {
  font-size: 16px;
  color: #1A1C1C;
}

.chip-text {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #1A1C1C;
}

.pkg-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
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

/* ============ 套餐底部 ============ */
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
  color: #0057FF;

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
  transition: all 0.2s ease;

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

/* ============ 日期弹窗 ============ */
.date-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 8px 0 24px;
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
  transition: all 0.15s ease;
}

.date-cell.active {
  background: #FFFFFF;
  border-color: #000000;
}

.date-weekday {
  font-size: 11px;
  line-height: 16px;
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
  line-height: 14px;
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

/* ============ Section title (sheet 内) ============ */
.date-section-title {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: #86868B;
  text-transform: uppercase;
  padding: 12px 0 12px;
}

/* ============ 时间滚轮 picker ============ */
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

/* 上下渐变遮罩 */
.time-picker-mask {
  position: absolute;
  left: 0;
  right: 0;
  height: 78px;
  pointer-events: none;
  z-index: 2;
}

.time-picker-mask-top {
  top: 0;
  background: linear-gradient(to bottom, #F2F2F2 0%, rgba(242, 242, 242, 0.8) 60%, rgba(242, 242, 242, 0) 100%);
}

.time-picker-mask-bottom {
  bottom: 0;
  background: linear-gradient(to top, #F2F2F2 0%, rgba(242, 242, 242, 0.8) 60%, rgba(242, 242, 242, 0) 100%);
}

/* 中间指示线 */
.time-picker-indicator {
  position: absolute;
  top: 50%;
  left: 24px;
  right: 24px;
  height: 44px;
  transform: translateY(-50%);
  border-top: 1px solid #E2E2E2;
  border-bottom: 1px solid #E2E2E2;
  pointer-events: none;
  z-index: 1;
}

.time-picker-colon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 22px;
  line-height: 28px;
  font-weight: 500;
  color: #1A1C1C;
  pointer-events: none;
  z-index: 3;
}
</style>
