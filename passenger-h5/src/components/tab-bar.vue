<template>
  <view class="tab-bar-wrap">
    <view class="tab-bar pb-safe">
      <view
        v-for="item in items"
        :key="item.key"
        class="tab-item"
        :class="{ active: current === item.key }"
        @click="onTap(item)"
      >
        <text
          class="material-symbols-outlined tab-icon"
          :style="{ fontVariationSettings: current === item.key ? `'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24` : `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24` }"
        >
          {{ item.icon }}
        </text>
        <text class="tab-label">{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
type TabKey = 'home' | 'profile';
type TabItem = { key: TabKey; icon: string; label: string; path: string };

const props = withDefaults(defineProps<{
  current: TabKey;
}>(), {
  current: 'home',
});

const items: TabItem[] = [
  { key: 'home', icon: 'home', label: '服务', path: '/pages/index/index' },
  { key: 'profile', icon: 'person', label: '我的', path: '/pages/profile/index' },
];

const onTap = (item: TabItem) => {
  if (item.key === props.current) return;
  uni.redirectTo({ url: item.path });
};
</script>

<style lang="scss" scoped>
.tab-bar-wrap {
  /* 占位，避免内容被遮挡 */
  height: calc(80px + env(safe-area-inset-bottom, 0px));
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #F9F9F9;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 80px;
  padding: 0 16px;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.04);
  z-index: 50;
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #5D5F5F;
  transition: all 0.15s ease;

  &.active {
    color: #000000;

    .tab-label {
      font-weight: 700;
    }
  }

  &:active {
    transform: scale(0.95);
  }
}

.tab-icon {
  font-size: 24px;
  color: inherit;
}

.tab-label {
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: inherit;
}
</style>
