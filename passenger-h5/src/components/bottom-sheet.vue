<template>
  <view v-if="modelValue" class="bs-root" @touchmove.prevent.stop>
    <!-- 背景遮罩 -->
    <view
      class="bs-backdrop"
      :class="{ 'bs-backdrop-show': visible }"
      @click="onMaskClose"
    />

    <!-- 抽屉本体 -->
    <view
      class="bs-sheet"
      :class="{ 'bs-sheet-show': visible }"
      :style="{ maxHeight: maxHeight }"
      @click.stop
    >
      <!-- 顶部把手 -->
      <view v-if="showHandle" class="bs-handle-wrap">
        <view class="bs-handle" />
      </view>

      <!-- header -->
      <view v-if="title || $slots.header || closable" class="bs-header">
        <slot name="header">
          <text class="bs-title">{{ title }}</text>
        </slot>
        <view v-if="closable" class="bs-close" @click="close">
          <text class="material-symbols-outlined">close</text>
        </view>
      </view>

      <!-- body：可滚动区，footer 用绝对定位浮在底部 -->
      <view
        class="bs-body"
        :style="{ paddingBottom: hasFooter ? footerOffset + 'px' : '24px' }"
      >
        <view class="bs-body-inner">
          <slot />
        </view>
      </view>

      <!-- footer：absolute bottom，浮在 body 上面 -->
      <view v-if="hasFooter" class="bs-footer" ref="footerRef">
        <slot name="footer" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, useSlots, computed } from 'vue';

const props = withDefaults(defineProps<{
  modelValue: boolean;
  title?: string;
  closable?: boolean;
  showHandle?: boolean;
  /** css 单位字符串 */
  maxHeight?: string;
  /** 点击遮罩是否关闭 */
  closeOnMask?: boolean;
}>(), {
  title: '',
  closable: true,
  showHandle: true,
  maxHeight: '85vh',
  closeOnMask: true,
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'close'): void;
}>();

const slots = useSlots();
const hasFooter = computed(() => !!slots.footer);

const visible = ref(false);
const footerOffset = ref(160);

watch(
  () => props.modelValue,
  async (v) => {
    if (v) {
      await nextTick();
      requestAnimationFrame(() => {
        visible.value = true;
      });
      // 测量 footer 高度
      setTimeout(() => {
        const query = uni.createSelectorQuery();
        query.select('.bs-footer').boundingClientRect((rect: any) => {
          if (rect && rect.height) {
            footerOffset.value = rect.height + 24;
          }
        }).exec();
      }, 50);
    } else {
      visible.value = false;
    }
  },
  { immediate: true }
);

const close = () => {
  visible.value = false;
  setTimeout(() => {
    emit('update:modelValue', false);
    emit('close');
  }, 300);
};

const onMaskClose = () => {
  if (props.closeOnMask) close();
};

defineExpose({ close });
</script>

<style lang="scss" scoped>
.bs-root {
  position: fixed;
  inset: 0;
  z-index: 100;
}

.bs-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  backdrop-filter: blur(0);
  -webkit-backdrop-filter: blur(0);
  transition: background 0.3s ease, backdrop-filter 0.3s ease;

  &.bs-backdrop-show {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
}

.bs-sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.08);
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0.16, 1);
  display: flex;
  flex-direction: column;

  &.bs-sheet-show {
    transform: translateY(0);
  }
}

.bs-handle-wrap {
  display: flex;
  justify-content: center;
  padding: 12px 0 4px;
  flex-shrink: 0;
}

.bs-handle {
  width: 40px;
  height: 4px;
  background: #E8E8E8;
  border-radius: 2px;
}

.bs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px 12px;
  flex-shrink: 0;
}

.bs-title {
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: #000000;
}

.bs-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F2F2F2;
  border-radius: 50%;

  .material-symbols-outlined {
    font-size: 20px;
    color: #1A1C1C;
  }

  &:active {
    transform: scale(0.95);
  }
}

.bs-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.bs-body-inner {
  padding: 0 24px 8px;
}

.bs-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px calc(16px + env(safe-area-inset-bottom, 0px));
  background: #FFFFFF;
  border-top: 1px solid #F2F2F2;
  z-index: 2;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.04);
}
</style>
