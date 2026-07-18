<template>
  <view class="empty-state">
    <text class="material-symbols-outlined empty-icon">{{ icon }}</text>
    <text class="empty-text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  text?: string;
  icon?: string;
}>(), {
  text: '暂无数据',
  icon: 'inbox',
});
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
}

.empty-icon {
  font-size: 48px;
  color: #C9CDD4;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 15px;
  color: #C9CDD4;
}
</style>
