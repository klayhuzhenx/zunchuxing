<template>
  <view
    class="navbar"
    :class="[`navbar-${theme}`, { 'navbar-sticky': sticky }]"
    :style="{ paddingTop: statusBarHeight + 'px', background: bgColor }"
  >
    <view class="navbar-inner">
      <view class="navbar-left">
        <view
          v-if="showBack"
          class="navbar-back"
          hover-class="navbar-back-active"
          :hover-stay-time="100"
          @click="onBack"
        >
          <text class="material-symbols-outlined">arrow_back</text>
        </view>
        <slot name="left" />
      </view>
      <text v-if="title" class="navbar-title" :class="`navbar-title-${align}`">{{ title }}</text>
      <view class="navbar-right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = withDefaults(defineProps<{
  title?: string;
  showBack?: boolean;
  /** light: 白底黑字 (默认，对齐原型) / dark: 黑底白字 */
  theme?: 'light' | 'dark' | 'transparent';
  /** 标题对齐方式：left 对齐原型 charter/booking，center 用于普通页 */
  align?: 'left' | 'center';
  sticky?: boolean;
  bgColor?: string;
  /** 兜底回退页（无返回栈时跳转） */
  fallbackUrl?: string;
}>(), {
  title: '',
  showBack: false,
  theme: 'light',
  align: 'left',
  sticky: false,
  bgColor: '',
  fallbackUrl: '/pages/index/index',
});

const emit = defineEmits<{
  (e: 'back'): void;
}>();

const statusBarHeight = ref(0);

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 0;
});

const onBack = () => {
  emit('back');
  /* 优先 navigateBack；如果是直接进入的页面（无返回栈），回退到 fallbackUrl */
  const pages = getCurrentPages();
  if (pages && pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.reLaunch({ url: props.fallbackUrl });
  }
};
</script>

<style lang="scss" scoped>
.navbar {
  width: 100%;
  z-index: 50;

  &.navbar-sticky {
    position: sticky;
    top: 0;
  }

  &.navbar-light {
    background: #F9F9F9;
    color: #000000;
  }

  &.navbar-dark {
    background: #000000;
    color: #FFFFFF;
  }

  &.navbar-transparent {
    background: transparent;
    color: #000000;
  }
}

.navbar-inner {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
}

.navbar-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.navbar-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: auto;
}

.navbar-back {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;

  .material-symbols-outlined {
    font-size: 24px;
    color: inherit;
  }
}

.navbar-back-active {
  background: rgba(0, 0, 0, 0.06);
  transform: scale(0.92);
}

.navbar-dark .navbar-back-active {
  background: rgba(255, 255, 255, 0.12);
}

.navbar-title {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: inherit;
  margin-left: 8px;

  &.navbar-title-left {
    flex: 0 0 auto;
  }

  &.navbar-title-center {
    flex: 1;
    text-align: center;
    margin-left: 0;
  }
}
</style>
