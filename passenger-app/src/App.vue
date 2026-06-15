<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app';

onLaunch(() => {
  console.log('尊出行乘客端启动');
});

onShow(() => {
  // 检查登录态
});
</script>

<style lang="scss">
/* ============================================================
 * 全局重置
 * ============================================================ */
page {
  background: #F9F9F9;
  font-family: -apple-system, BlinkMacSystemFont, 'Hanken Grotesk',
    'PingFang SC', 'HarmonyOS Sans', 'Helvetica Neue', sans-serif;
  color: #1A1C1C;
  font-size: 15px;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
}

view, text, button, input, textarea {
  box-sizing: border-box;
}

/* ============================================================
 * Material Symbols Outlined 图标（本地字体，避免 Google Fonts 国内无法访问）
 * ============================================================ */
@font-face {
  font-family: 'Material Symbols Outlined';
  font-style: normal;
  font-weight: 400;
  src: url('/static/fonts/MaterialSymbolsOutlined.ttf') format('truetype');
}

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: 'liga';
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  vertical-align: middle;
}

.ms-fill {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* ============================================================
 * 字体类（对齐原型 typography token）
 * ============================================================ */
.font-display-lg-mobile {
  font-size: 28px;
  line-height: 36px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.font-headline-md-mobile {
  font-size: 22px;
  line-height: 30px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.font-headline-sm-mobile {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
}

.font-body-lg {
  font-size: 17px;
  line-height: 26px;
  font-weight: 400;
}

.font-body-md {
  font-size: 15px;
  line-height: 22px;
  font-weight: 400;
}

.font-label-md {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.font-label-sm {
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.05em;
}

/* ============================================================
 * 通用工具类
 * ============================================================ */
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* ============================================================
 * 全局过渡动画
 * ============================================================ */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
