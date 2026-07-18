<template>
  <view class="root">
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar" @click="back">
        <text class="material-symbols-outlined hicon">arrow_back</text>
        <text class="htitle">添加员工</text>
      </view>
    </view>

    <view class="body">
      <view class="icon">
        <text class="material-symbols-outlined ic">person_add</text>
      </view>

      <view class="field">
        <text class="label">员工姓名</text>
        <input v-model="name" class="input" placeholder="请输入姓名" placeholder-class="ph" />
      </view>
      <view class="field">
        <text class="label">员工手机号</text>
        <input v-model="phone" class="input" type="number" placeholder="请输入手机号" placeholder-class="ph" maxlength="11" />
      </view>

      <view class="tip">
        <text class="material-symbols-outlined ticon">info</text>
        <text class="ttext">输入的手机号需已在尊出行注册，添加成功后员工小程序自动关联企业身份。</text>
      </view>

      <view class="spacer" />

      <view class="btn" @click="submit">
        <text class="bt">确认添加</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const top = ref(0);
const name = ref('');
const phone = ref('');
onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0; });
const back = () => uni.navigateBack();
const submit = () => {
  if (!name.value.trim()) { uni.showToast({ title: '请输入员工姓名', icon: 'none' }); return; }
  if (!/^1\d{10}$/.test(phone.value)) { uni.showToast({ title: '请输入正确的手机号', icon: 'none' }); return; }
  uni.showToast({ title: '添加成功', icon: 'none' });
  setTimeout(() => back(), 800);
};
</script>

<style lang="scss" scoped>
.root { min-height: 100vh; background: #F9F9F9; display: flex; flex-direction: column; }
.header { background: #F9F9F9; }
.hbar { height: 56px; padding: 0 24px; display: flex; align-items: center; gap: 16px; }
.hbar:active { opacity: 0.7; }
.hicon { font-size: 24px; color: #000; }
.htitle { font-size: 20px; font-weight: 700; color: #000; }

.body { flex: 1; padding: 48px 24px 40px; display: flex; flex-direction: column; }

.icon { width: 96px; height: 96px; background: #F2F2F2; border-radius: 32px; display: flex; align-items: center; justify-content: center; align-self: center; margin-bottom: 48px; }
.ic { font-size: 48px; color: #000; }

.field { margin-bottom: 16px; }
.label { font-size: 13px; color: #86868B; display: block; margin-bottom: 8px; padding: 0 8px; }
.input { height: 56px; background: #F2F2F2; border-radius: 24px; padding: 0 24px; font-size: 17px; color: #1A1C1C; border: none; }
.ph { color: #86868B; }

.tip { display: flex; gap: 8px; padding: 0 8px; margin-top: 8px; }
.ticon { font-size: 16px; color: #86868B; flex-shrink: 0; margin-top: 2px; }
.ttext { font-size: 13px; color: #86868B; line-height: 20px; }

.spacer { flex: 1; }

.btn { height: 56px; background: #000; border-radius: 24px; display: flex; align-items: center; justify-content: center; }
.btn:active { transform: scale(0.98); }
.bt { font-size: 20px; font-weight: 600; color: #FFF; }
</style>
