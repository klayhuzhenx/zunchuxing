<template>
  <view class="root">
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar" @click="back">
        <text class="material-symbols-outlined hicon">arrow_back</text>
        <text class="htitle">修改手机号</text>
      </view>
    </view>

    <view class="body">
      <!-- 第一步：安全验证 -->
      <template v-if="step === 1">
        <view class="card">
          <text class="card-title">安全验证</text>
          <text class="card-desc">为确认是您本人操作，请进行身份验证</text>
          <view class="field">
            <text class="field-label">验证码</text>
            <view class="field-row">
              <input v-model="verifyCode" class="field-input" type="number" maxlength="6" placeholder="请输入6位验证码" placeholder-class="ph" />
              <view class="field-btn" :class="{ disabled: countdown > 0 }" @click="onSendVerifyCode">
                <text>{{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}</text>
              </view>
            </view>
            <text class="field-hint">验证码已发送至 138****8888</text>
          </view>
        </view>
        <view class="btn" @click="onVerify"><text class="bt">下一步</text></view>
      </template>

      <!-- 第二步：绑定新手机号 -->
      <template v-if="step === 2">
        <view class="card">
          <text class="card-title">绑定新手机号</text>
          <view class="field">
            <text class="field-label">新手机号</text>
            <input v-model="newPhone" class="field-input" type="number" maxlength="11" placeholder="请输入新手机号" placeholder-class="ph" />
          </view>
          <view class="field">
            <text class="field-label">验证码</text>
            <view class="field-row">
              <input v-model="newCode" class="field-input" type="number" maxlength="6" placeholder="请输入6位验证码" placeholder-class="ph" />
              <view class="field-btn" :class="{ disabled: countdown2 > 0 }" @click="onSendNewCode">
                <text>{{ countdown2 > 0 ? `${countdown2}s 后重发` : '获取验证码' }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="btn" @click="onSubmit"><text class="bt">确认更换</text></view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
const top = ref(0);
const step = ref(1);
const verifyCode = ref('');
const newPhone = ref('');
const newCode = ref('');
const countdown = ref(0);
const countdown2 = ref(0);
let timer: any = null;
let timer2: any = null;

onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0; });
onUnmounted(() => { if (timer) clearInterval(timer); if (timer2) clearInterval(timer2); });

const back = () => {
  if (step.value === 2) { step.value = 1; return; }
  uni.navigateBack();
};

const onSendVerifyCode = () => {
  if (countdown.value > 0) return;
  countdown.value = 60;
  uni.showToast({ title: '验证码已发送', icon: 'none' });
  timer = setInterval(() => { countdown.value--; if (countdown.value <= 0 && timer) { clearInterval(timer); timer = null; } }, 1000);
};

const onVerify = () => {
  if (!/^\d{6}$/.test(verifyCode.value)) { uni.showToast({ title: '验证码错误', icon: 'none' }); return; }
  step.value = 2;
};

const onSendNewCode = () => {
  if (countdown2.value > 0) return;
  if (!/^1[3-9]\d{9}$/.test(newPhone.value)) { uni.showToast({ title: '请输入正确的手机号', icon: 'none' }); return; }
  countdown2.value = 60;
  uni.showToast({ title: '验证码已发送', icon: 'none' });
  timer2 = setInterval(() => { countdown2.value--; if (countdown2.value <= 0 && timer2) { clearInterval(timer2); timer2 = null; } }, 1000);
};

const onSubmit = () => {
  if (!/^1[3-9]\d{9}$/.test(newPhone.value)) { uni.showToast({ title: '请输入正确的手机号', icon: 'none' }); return; }
  if (!/^\d{6}$/.test(newCode.value)) { uni.showToast({ title: '验证码错误', icon: 'none' }); return; }
  uni.showToast({ title: '更换成功', icon: 'success' });
  setTimeout(() => uni.navigateBack(), 1000);
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
.card-title { font-size: 20px; font-weight: 700; color: #1A1C1C; display: block; margin-bottom: 8px; }
.card-desc { font-size: 14px; color: #86868B; display: block; margin-bottom: 20px; line-height: 1.5; }

.field { margin-bottom: 16px; }
.field-label { font-size: 14px; color: #4C4546; font-weight: 500; display: block; margin-bottom: 8px; }
.field-row { display: flex; gap: 12px; align-items: center; }
.field-input { flex: 1; height: 52px; background: #F2F2F2; border-radius: 16px; padding: 0 16px; font-size: 16px; color: #1A1C1C; }
.ph { color: #86868B; font-size: 15px; }
.field-btn { flex-shrink: 0; padding: 10px 16px; border-radius: 20px; background: #F2F2F2; font-size: 14px; color: #000; font-weight: 500; }
.field-btn.disabled { opacity: 0.4; }
.field-btn:active:not(.disabled) { opacity: 0.7; }
.field-hint { font-size: 12px; color: #86868B; margin-top: 8px; }

.btn { height: 56px; background: #000; border-radius: 24px; display: flex; align-items: center; justify-content: center; }
.btn:active { opacity: 0.8; }
.bt { font-size: 20px; font-weight: 600; color: #FFF; }
</style>
