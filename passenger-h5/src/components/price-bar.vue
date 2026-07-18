<template>
  <view class="price-bar">
    <view class="price-bar-left">
      <text class="price-label">预估总额</text>
      <view class="price-row">
        <text class="price-symbol">¥</text>
        <text class="price-value">{{ amount.toLocaleString() }}</text>
      </view>
      <text v-if="note" class="price-note">{{ note }}</text>
    </view>
    <button class="price-bar-btn" :disabled="disabled" @click="$emit('submit')">
      {{ btnText }}
    </button>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  amount: number;
  btnText?: string;
  note?: string;
  disabled?: boolean;
}>(), {
  amount: 0,
  btnText: '立即下单',
  note: '',
  disabled: false,
});

defineEmits<{
  submit: [];
}>();
</script>

<style lang="scss" scoped>
.price-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #000000;
  padding: 16px 24px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #FFFFFF;
  z-index: 50;
}

.price-bar-left {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin-top: 2px;
}

.price-symbol {
  font-size: 20px;
  font-weight: 500;
}

.price-value {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.price-note {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  margin-top: 2px;
}

.price-bar-btn {
  background: #D4AF37;
  color: #000000;
  border-radius: 24px;
  height: 48px;
  padding: 0 32px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  line-height: 48px;
}

.price-bar-btn[disabled] {
  opacity: 0.4;
}
</style>
