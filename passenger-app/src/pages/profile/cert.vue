<template>
  <view class="root">
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar" @click="back">
        <text class="material-symbols-outlined hicon">arrow_back</text>
        <text class="htitle">尊享认证</text>
      </view>
    </view>

    <view class="body">
      <view class="hero">
        <view class="hero-icon">
          <text class="material-symbols-outlined hi">workspace_premium</text>
        </view>
        <text class="hero-title">尊界车主身份认证</text>
      </view>
      <text class="hero-desc">认证您的尊界车主身份，即可享受年度免费出行次数、四大场景通用、专属车辆优先调度等尊享权益。认证信息将用于华为车主数据库核验。</text>

      <view class="card">
        <view class="field"><text class="label">姓名</text><input v-model="f.name" class="input" placeholder="请输入车主姓名" placeholder-class="ph" /></view>
        <view class="field"><text class="label">身份证号</text><input v-model="f.idCard" class="input" placeholder="请输入18位身份证号" placeholder-class="ph" maxlength="18" /></view>
        <view class="field field-last"><text class="label">手机号</text><input v-model="f.phone" class="input" type="number" placeholder="请输入手机号" placeholder-class="ph" maxlength="11" /></view>
        <view class="submit" @click="submit"><text class="st">提交认证</text></view>
      </view>

      <view class="notice">
        <text class="material-symbols-outlined ni">info</text>
        <text class="nt">认证信息提交后将通过华为车主数据库进行核验，核验结果将在24小时内以短信方式通知您。如有疑问请联系客服。</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
const top = ref(0);
onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0; });
const back = () => uni.navigateBack();
const f = reactive({ name:'', idCard:'', phone:'138****8888' });
const submit = () => {
  if (!f.name.trim()) { uni.showToast({ title:'请输入车主姓名', icon:'none' }); return; }
  if (!f.idCard.trim() || f.idCard.length !== 18) { uni.showToast({ title:'请输入18位身份证号', icon:'none' }); return; }
  if (!/^1\d{10}$/.test(f.phone)) { uni.showToast({ title:'请输入正确的手机号', icon:'none' }); return; }
  uni.showModal({
    title:'提交认证', content:'确认提交车主身份认证信息？核验结果将在24小时内短信通知。',
    confirmText:'确认提交', success:(r:any)=>{
      if(r.confirm){ uni.showToast({ title:'已提交，等待核验', icon:'none' }); setTimeout(()=>back(),800); }
    } });
};
</script>

<style lang="scss" scoped>
.root { min-height: 100vh; background: #F9F9F9; }
.header { background: #F9F9F9; }
.hbar { height: 56px; padding: 0 24px; display: flex; align-items: center; gap: 16px; }
.hbar:active { opacity: 0.7; }
.hicon { font-size: 24px; color: #000; }
.htitle { font-size: 20px; font-weight: 700; color: #000; }

.body { padding: 32px 24px 40px; }

.hero { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.hero-icon { width: 32px; height: 32px; background: rgba(212,175,55,.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.hi { font-size: 20px; color: #D4AF37; font-variation-settings: 'FILL' 1; }
.hero-title { font-size: 20px; font-weight: 600; color: #000; }
.hero-desc { font-size: 15px; color: #86868B; line-height: 24px; margin-bottom: 48px; }

.card { background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,.02); display: flex; flex-direction: column; gap: 20px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.label { font-size: 13px; color: #000; padding: 0 4px; }
.input { height: 56px; background: #F2F2F2; border-radius: 24px; padding: 0 24px; font-size: 17px; color: #1A1C1C; border: none; }
.ph { color: #86868B; }

.submit { height: 56px; background: #000; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin-top: 8px; box-shadow: 0 10px 40px rgba(0,0,0,.04); }
.submit:active { opacity: 0.8; }
.st { font-size: 20px; font-weight: 600; color: #FFF; }

.notice { margin-top: 32px; padding: 16px; background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; display: flex; gap: 8px; }
.ni { font-size: 18px; color: #86868B; flex-shrink: 0; margin-top: 2px; }
.nt { font-size: 11px; color: #86868B; line-height: 18px; }
</style>
