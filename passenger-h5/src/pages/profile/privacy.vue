<template>
  <view class="root">
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar" @click="back">
        <text class="material-symbols-outlined hicon">arrow_back</text>
        <text class="htitle">隐私管理</text>
      </view>
    </view>

    <view class="body">
      <!-- 隐私政策概要 / 内容 / 用户服务协议 -->
      <view class="card">
        <view class="r" @click="nav('/pages/webview/index?src=/privacy-summary.html')">
          <text class="rl">隐私政策概要</text>
          <text class="material-symbols-outlined ra">chevron_right</text>
        </view>
        <view class="r rl1" @click="nav('/pages/webview/index?src=/privacy.html')">
          <text class="rl">隐私政策内容</text>
          <text class="material-symbols-outlined ra">chevron_right</text>
        </view>
      </view>

      <!-- 隐私协议授权 -->
      <view class="card">
        <view class="switch-row">
          <text class="switch-label">隐私协议授权</text>
          <switch :checked="authorized" @change="onToggleAuth" color="#0052FF" />
        </view>
        <text class="switch-hint">开启后表示您已阅读并同意隐私政策内容，授权我们依法处理您的个人信息</text>
      </view>
    </view>

    <!-- 撤回授权确认弹窗 -->
    <view v-if="showRevokeModal" class="modal-mask" @click="showRevokeModal = false">
      <view class="modal-sheet" @click.stop>
        <text class="modal-title">撤回授权确认</text>
        <text class="modal-desc">是否撤回隐私协议授权？撤回后将无法使用尊出行服务。</text>
        <view class="modal-actions">
          <view class="modal-btn cancel" @click="showRevokeModal = false"><text class="modal-btn-text">取消</text></view>
          <view class="modal-btn confirm" @click="onConfirmRevoke"><text class="modal-btn-text white">确认退出</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const top = ref(0);
const authorized = ref(true);
const showRevokeModal = ref(false);

onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0; });
const back = () => uni.navigateBack();
const nav = (u: string) => uni.navigateTo({ url: u });

const onToggleAuth = (e: any) => {
  if (!e.detail.value) { authorized.value = true; showRevokeModal.value = true; }
};
const onConfirmRevoke = () => {
  showRevokeModal.value = false; authorized.value = false;
  uni.showToast({ title: '授权已撤回', icon: 'none' });
  setTimeout(() => { uni.reLaunch({ url: '/pages/login/index' }); }, 1000);
};
</script>

<style lang="scss" scoped>
.root { min-height: 100vh; background: #F9F9F9; }

.header { background: #F9F9F9; }
.hbar { height: 56px; padding: 0 24px; display: flex; align-items: center; gap: 16px; }
.hbar:active { opacity: 0.7; }
.hicon { font-size: 24px; color: #000; }
.htitle { font-size: 20px; font-weight: 700; color: #000; }

.body { padding: 8px 24px 40px; }

.card { background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; overflow: hidden; margin-bottom: 16px; }
.r { display: flex; align-items: center; justify-content: space-between; padding: 20px; border-bottom: 1px solid #F2F2F2; }
.r:active { background: #F2F2F2; }
.rl1 { border-bottom: none; }
.rl { font-size: 17px; color: #1A1C1C; }
.ra { font-size: 18px; color: #86868B; }

.switch-row { display: flex; align-items: center; justify-content: space-between; padding: 20px; }
.switch-label { font-size: 17px; color: #1A1C1C; font-weight: 600; }
.switch-hint { font-size: 13px; color: #86868B; padding: 0 20px 20px; line-height: 1.5; }

.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 999; display: flex; align-items: flex-end; }
.modal-sheet { width: 100%; background: #FFF; border-radius: 32px 32px 0 0; padding: 32px 24px 48px; }
.modal-title { font-size: 20px; font-weight: 700; color: #1A1C1C; display: block; margin-bottom: 12px; }
.modal-desc { font-size: 15px; color: #4C4546; line-height: 1.6; display: block; margin-bottom: 24px; }
.modal-actions { display: flex; gap: 12px; }
.modal-btn { flex: 1; height: 48px; border-radius: 24px; display: flex; align-items: center; justify-content: center; }
.modal-btn:active { opacity: 0.8; }
.modal-btn.cancel { background: #F2F2F2; }
.modal-btn.confirm { background: #FF4D4F; }
.modal-btn-text { font-size: 16px; font-weight: 600; color: #4C4546; }
.modal-btn-text.white { color: #FFF; }
</style>
