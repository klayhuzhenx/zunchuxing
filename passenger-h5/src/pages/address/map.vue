<template>
  <view class="page">
    <!-- header (浮在地图上) -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-icon" @click="onBack">
        <text class="material-symbols-outlined">arrow_back</text>
      </view>
      <text class="header-title">地图选点</text>
      <view class="header-icon" @click="goSearch">
        <text class="material-symbols-outlined">search</text>
      </view>
    </view>

    <!-- 地图区域 -->
    <view class="map-area">
      <!-- 模拟地图背景：路网 + 区块 -->
      <view class="map-bg">
        <view class="map-grid" />
        <view class="map-blob map-blob-1" />
        <view class="map-blob map-blob-2" />
        <view class="map-blob map-blob-3" />
        <view class="map-road map-road-h-1" />
        <view class="map-road map-road-h-2" />
        <view class="map-road map-road-v-1" />
        <view class="map-road map-road-v-2" />
        <view class="map-road map-road-v-3" />
        <view class="map-pin map-pin-1">
          <text class="material-symbols-outlined map-pin-icon">restaurant</text>
        </view>
        <view class="map-pin map-pin-2">
          <text class="material-symbols-outlined map-pin-icon">local_cafe</text>
        </view>
        <view class="map-pin map-pin-3">
          <text class="material-symbols-outlined map-pin-icon">store</text>
        </view>
      </view>

      <!-- 中央定位 pin -->
      <view class="center-pin">
        <view class="center-pin-marker">
          <text class="material-symbols-outlined center-pin-icon">location_on</text>
        </view>
        <view class="center-pin-shadow" />
      </view>

      <!-- 右侧操作按钮 -->
      <view class="map-tools">
        <view class="tool-btn" @click="onLocate">
          <text class="material-symbols-outlined">my_location</text>
        </view>
        <view class="tool-btn" @click="onZoomIn">
          <text class="material-symbols-outlined">add</text>
        </view>
        <view class="tool-btn" @click="onZoomOut">
          <text class="material-symbols-outlined">remove</text>
        </view>
      </view>

      <!-- 候选地址 toast (拖动后显示) -->
      <view v-if="candidates.length > 1" class="candidates-tip">
        <text class="material-symbols-outlined tip-icon">touch_app</text>
        <text class="tip-text">拖动地图选择位置</text>
      </view>
    </view>

    <!-- 底部确认抽屉 -->
    <view class="sheet">
      <view class="sheet-handle" />

      <!-- 当前位置 -->
      <view class="addr-row">
        <text class="material-symbols-outlined addr-icon ms-fill">location_on</text>
        <view class="addr-info">
          <text class="addr-name">{{ currentAddr.name }}</text>
          <text class="addr-detail">{{ currentAddr.address }}</text>
        </view>
      </view>

      <!-- 附近候选 -->
      <view v-if="nearby.length > 0" class="nearby-list">
        <text class="nearby-title">附近</text>
        <view
          v-for="item in nearby"
          :key="item.id"
          class="nearby-item"
          :class="{ active: currentAddr.id === item.id }"
          @click="onSelectNearby(item)"
        >
          <view class="nearby-dot" :class="{ active: currentAddr.id === item.id }" />
          <view class="nearby-info">
            <text class="nearby-name">{{ item.name }}</text>
            <text class="nearby-addr">{{ item.address }}</text>
          </view>
          <text class="nearby-distance">{{ item.distance }}m</text>
        </view>
      </view>

      <view class="sheet-btn" @click="onConfirm">
        <text class="sheet-btn-text">确认选择</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

type AddrItem = {
  id: string;
  name: string;
  address: string;
  distance?: number;
};

const STORAGE_KEY_RESULT = 'address-pick-result';

const statusBarHeight = ref(0);
const field = ref<string>('destination');

/* 模拟附近候选 */
const candidates = ref<AddrItem[]>([
  { id: 'c1', name: '外滩十八号', address: '上海市黄浦区中山东一路 18 号', distance: 0 },
  { id: 'c2', name: '上海半岛酒店', address: '上海市黄浦区中山东一路 32 号', distance: 80 },
  { id: 'c3', name: '和平饭店', address: '上海市黄浦区南京东路 20 号', distance: 220 },
  { id: 'c4', name: '外滩源', address: '上海市黄浦区中山东一路 33 号', distance: 320 },
]);

const currentIdx = ref(0);

const currentAddr = computed(() => candidates.value[currentIdx.value]);
const nearby = computed(() => candidates.value);

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 0;
});

onLoad((opts: Record<string, string> | undefined) => {
  if (opts?.field) {
    field.value = opts.field;
  }
});

const onSelectNearby = (item: AddrItem) => {
  const idx = candidates.value.findIndex((c) => c.id === item.id);
  if (idx >= 0) currentIdx.value = idx;
};

const onLocate = () => {
  uni.showToast({ title: '已定位到当前位置', icon: 'none' });
};

const onZoomIn = () => {
  uni.showToast({ title: '放大', icon: 'none' });
};

const onZoomOut = () => {
  uni.showToast({ title: '缩小', icon: 'none' });
};

const onConfirm = () => {
  const item = currentAddr.value;
  uni.setStorageSync(STORAGE_KEY_RESULT, {
    field: field.value,
    name: item.name,
    address: item.address,
    pickedAt: '2026-06-09',
  });
  /* 返回 2 层：从地图选点 → 跳过搜索页 → 直接回到包车页 */
  uni.navigateBack({ delta: 2 });
};

const onBack = () => {
  uni.navigateBack();
};

const goSearch = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.page {
  position: relative;
  min-height: 100vh;
  background: #F9F9F9;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ===== Header ===== */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(249, 249, 249, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
}

.header-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;

  .material-symbols-outlined {
    font-size: 22px;
    color: #000000;
  }

  &:active {
    opacity: 0.7;
  }
}

.header-title {
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
  color: #000000;
}

/* ===== 地图区 ===== */
.map-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.map-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #EAEAEA 0%, #DDDDDD 100%);
}

.map-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.6) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.5;
}

.map-blob {
  position: absolute;
  border-radius: 30%;
  background: rgba(216, 232, 218, 0.7);
}

.map-blob-1 {
  top: 12%;
  left: 8%;
  width: 38%;
  height: 24%;
  background: rgba(195, 224, 199, 0.6);
}

.map-blob-2 {
  bottom: 18%;
  right: 6%;
  width: 32%;
  height: 22%;
  background: rgba(176, 211, 232, 0.5);
}

.map-blob-3 {
  top: 40%;
  right: 24%;
  width: 22%;
  height: 16%;
  background: rgba(210, 220, 200, 0.55);
}

.map-road {
  position: absolute;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.map-road-h-1 {
  top: 35%;
  left: 0;
  right: 0;
  height: 8px;
}

.map-road-h-2 {
  top: 65%;
  left: 0;
  right: 0;
  height: 6px;
}

.map-road-v-1 {
  left: 22%;
  top: 0;
  bottom: 0;
  width: 6px;
}

.map-road-v-2 {
  left: 55%;
  top: 0;
  bottom: 0;
  width: 8px;
}

.map-road-v-3 {
  left: 80%;
  top: 0;
  bottom: 0;
  width: 5px;
}

.map-pin {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.map-pin-icon {
  font-size: 16px;
  color: #5D5F5F;
}

.map-pin-1 {
  top: 22%;
  left: 30%;
}

.map-pin-2 {
  top: 50%;
  left: 65%;
}

.map-pin-3 {
  top: 75%;
  left: 18%;
}

/* ===== 中央 pin ===== */
.center-pin {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  margin-top: -120px; /* 让 pin 在视觉中心稍上方，因为底部有 sheet */
}

.center-pin-marker {
  width: 48px;
  height: 48px;
  background: #000000;
  border: 2px solid #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  animation: pin-float 2s ease-in-out infinite;
}

@keyframes pin-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.center-pin-icon {
  font-size: 24px;
  color: #FFFFFF;
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.center-pin-shadow {
  width: 8px;
  height: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  margin-top: 6px;
  filter: blur(2px);
}

/* ===== 工具按钮 ===== */
.map-tools {
  position: absolute;
  right: 24px;
  bottom: 360px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tool-btn {
  width: 48px;
  height: 48px;
  background: #F9F9F9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);

  .material-symbols-outlined {
    font-size: 22px;
    color: #000000;
  }

  &:active {
    transform: scale(0.95);
  }
}

.candidates-tip {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 9999px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.tip-icon {
  font-size: 16px;
  color: #FFFFFF;
}

.tip-text {
  font-size: 12px;
  line-height: 16px;
  color: #FFFFFF;
}

/* ===== 底部抽屉 ===== */
.sheet {
  position: relative;
  z-index: 30;
  background: #F9F9F9;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  padding: 12px 24px calc(40px + env(safe-area-inset-bottom, 0px));
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
}

.sheet-handle {
  width: 48px;
  height: 6px;
  background: #E2E2E2;
  border-radius: 3px;
  margin: 0 auto 8px;
}

.addr-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.addr-icon {
  font-size: 24px;
  color: #0057FF;
  margin-top: 2px;
  flex-shrink: 0;
}

.addr-info {
  flex: 1;
  min-width: 0;
}

.addr-name {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: #000000;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.addr-detail {
  margin-top: 2px;
  font-size: 13px;
  line-height: 20px;
  color: #86868B;
  display: block;
}

/* ===== 附近 ===== */
.nearby-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
  border-top: 1px solid #F2F2F2;
}

.nearby-title {
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: #86868B;
  text-transform: uppercase;
  padding: 8px 0 4px;
}

.nearby-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 4px;
  border-radius: 12px;

  &.active {
    background: rgba(0, 87, 255, 0.06);
  }

  &:active {
    background: #F2F2F2;
  }
}

.nearby-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #C9CDD4;
  flex-shrink: 0;

  &.active {
    background: #0057FF;
    box-shadow: 0 0 0 3px rgba(0, 87, 255, 0.18);
  }
}

.nearby-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.nearby-name {
  font-size: 15px;
  line-height: 22px;
  font-weight: 500;
  color: #000000;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nearby-addr {
  font-size: 12px;
  line-height: 16px;
  color: #86868B;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nearby-distance {
  flex-shrink: 0;
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  color: #86868B;
}

/* ===== 确认按钮 ===== */
.sheet-btn {
  margin-top: 8px;
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

.sheet-btn-text {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: #FFFFFF;
}
</style>
