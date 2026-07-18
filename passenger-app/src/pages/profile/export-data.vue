<template>
  <view class="root">
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar" @click="back">
        <text class="material-symbols-outlined hicon">arrow_back</text>
        <text class="htitle">个人信息副本导出</text>
      </view>
    </view>

    <view class="body">
      <view class="card">
        <text class="label">接收邮箱</text>
        <input v-model="email" class="input" placeholder="请输入接收邮箱地址" placeholder-class="ph" />
      </view>

      <view class="btn" @click="onSubmit">
        <text class="bt">确认</text>
      </view>
    </view>

    <!-- 短信验证弹窗 -->
    <view v-if="showSmsModal" class="modal-mask" @click="showSmsModal = false">
      <view class="modal-sheet" @click.stop>
        <text class="modal-title">短信验证</text>
        <text class="modal-sub">验证码已发送至 138****8888</text>
        <input v-model="smsCode" class="modal-input" maxlength="6" placeholder="请输入6位验证码" placeholder-class="modal-placeholder" />
        <view class="modal-actions">
          <view class="modal-btn cancel" @click="showSmsModal = false"><text class="modal-btn-text">取消</text></view>
          <view class="modal-btn confirm" @click="onConfirmExport"><text class="modal-btn-text white">确认</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const top = ref(0);
const email = ref('');
const showSmsModal = ref(false);
const smsCode = ref('');

onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0; });
const back = () => uni.navigateBack();

const onSubmit = () => {
  const v = email.value.trim();
  if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    uni.showToast({ title: '请输入有效的邮箱地址', icon: 'none' });
    return;
  }
  uni.showToast({ title: '验证码已发送', icon: 'none' });
  showSmsModal.value = true;
};

const onConfirmExport = () => {
  if (!smsCode.value || smsCode.value.length < 4) {
    uni.showToast({ title: '请输入正确的验证码', icon: 'none' });
    return;
  }
  showSmsModal.value = false;
  uni.showToast({ title: '副本导出申请已提交，将于3个工作日内发送至您的邮箱', icon: 'none' });
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

.card { background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; padding: 24px; margin-bottom: 24px; }
.label { font-size: 15px; color: #4C4546; font-weight: 600; display: block; margin-bottom: 12px; }
.input { width: 100%; height: 56px; background: #F2F2F2; border-radius: 24px; padding: 0 24px; font-size: 17px; color: #1A1C1C; }
.ph { color: #86868B; font-size: 15px; }

.btn { height: 56px; background: #000; border-radius: 24px; display: flex; align-items: center; justify-content: center; }
.btn:active { opacity: 0.8; }
.bt { font-size: 20px; font-weight: 600; color: #FFF; }

.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 999; display: flex; align-items: flex-end; justify-content: center; }
.modal-sheet { width: 100%; background: #FFF; border-radius: 32px 32px 0 0; padding: 32px 24px 48px; }
.modal-title { font-size: 20px; font-weight: 700; color: #1A1C1C; display: block; margin-bottom: 8px; }
.modal-sub { font-size: 14px; color: #86868B; display: block; margin-bottom: 24px; }
.modal-input { width: 100%; height: 56px; background: #F2F2F2; border-radius: 24px; padding: 0 24px; font-size: 17px; color: #1A1C1C; margin-bottom: 24px; }
.modal-placeholder { color: #86868B; font-size: 15px; }
.modal-actions { display: flex; gap: 12px; }
.modal-btn { flex: 1; height: 48px; border-radius: 24px; display: flex; align-items: center; justify-content: center; }
.modal-btn:active { opacity: 0.8; }
.modal-btn.cancel { background: #F2F2F2; }
.modal-btn.confirm { background: #000; }
.modal-btn-text { font-size: 16px; font-weight: 600; color: #4C4546; }
.modal-btn-text.white { color: #FFF; }
</style>
