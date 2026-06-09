<template>
  <text
    class="material-symbols-outlined m-icon"
    :class="{ 'ms-fill': fill }"
    :style="iconStyle"
  >
    {{ name }}
  </text>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  name: string;
  size?: number | string;
  color?: string;
  fill?: boolean;
  weight?: number;
}>(), {
  size: 24,
  color: '',
  fill: false,
  weight: 400,
});

const iconStyle = computed(() => ({
  fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
  color: props.color || 'inherit',
  fontVariationSettings: `'FILL' ${props.fill ? 1 : 0}, 'wght' ${props.weight}, 'GRAD' 0, 'opsz' 24`,
}));
</script>

<style lang="scss" scoped>
.m-icon {
  font-family: 'Material Symbols Outlined';
  display: inline-block;
  line-height: 1;
  vertical-align: middle;
  font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}
</style>
