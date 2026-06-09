<template>
  <text class="status-tag" :class="tagClass">{{ text }}</text>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  type: 'charter' | 'rental' | 'unpaid' | 'extra' | 'pending' | 'ongoing' | 'done' | 'cancelled';
  text: string;
}>();

const tagClass = computed(() => `tag-${props.type}`);
</script>

<style lang="scss" scoped>
.status-tag {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 12px;
  display: inline-block;
  font-weight: 500;
}

.tag-charter {
  background: rgba(212, 175, 55, 0.15);
  color: #D4AF37;
}

.tag-rental {
  background: rgba(0, 0, 0, 0.08);
  color: #000000;
}

.tag-unpaid {
  color: #FF7D00;
}

.tag-extra {
  color: #F53F3F;
}

.tag-pending {
  color: #0057FF;
}

.tag-ongoing {
  color: #00B42A;
}

.tag-done {
  color: #86868B;
}

.tag-cancelled {
  color: #C9CDD4;
}
</style>
