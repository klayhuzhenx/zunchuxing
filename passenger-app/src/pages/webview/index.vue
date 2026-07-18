<template>
  <view class="root">
    <!-- #ifdef H5 -->
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar" @click="back">
        <text class="material-symbols-outlined hicon">arrow_back</text>
        <text class="htitle">{{ title }}</text>
      </view>
    </view>
    <view class="webview-wrap">
      <iframe v-if="src" :src="src" class="webview-iframe" frameborder="0" />
    </view>
    <!-- #endif -->
    <!-- #ifdef APP-PLUS -->
    <web-view v-if="src" :src="src" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const top = ref(0)
const src = ref('')
const title = ref('计费规则')

onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0 })

onLoad((opts: Record<string, string> | undefined) => {
  if (opts?.src) {
    const srcName = opts.src.replace(/^\//, '')
    if (srcName.includes('charter')) {
      title.value = '包车计费规则'
    } else if (srcName.includes('rental')) {
      title.value = '租车计费规则'
    }
    // #ifdef H5
    // 使用相对路径拼接，生产和开发环境都能正确访问
    src.value = window.location.href.split('#')[0] + srcName
    // #endif
    // #ifdef APP-PLUS
    src.value = srcName
    // #endif
  }
  if (opts?.title) {
    title.value = decodeURIComponent(opts.title)
  }
})

const back = () => uni.navigateBack()
</script>

<style lang="scss" scoped>
.root { height: 100vh; display: flex; flex-direction: column; background: #F9F9F9; }

/* #ifdef H5 */
.header { flex-shrink: 0; background: #FFF; border-bottom: 1px solid #F2F2F2; }
.hbar { height: 56px; padding: 0 24px; display: flex; align-items: center; gap: 16px; }
.hbar:active { opacity: 0.7; }
.hicon { font-size: 24px; color: #000; }
.htitle { font-size: 20px; font-weight: 700; color: #000; }
.webview-wrap { flex: 1; min-height: 0; overflow: hidden; }
.webview-iframe { width: 100%; height: 100%; border: none; }
/* #endif */
</style>
