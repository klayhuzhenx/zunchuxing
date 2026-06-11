<template>
  <view class="root">
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar" @click="back">
        <text class="material-symbols-outlined hicon">arrow_back</text>
        <text class="htitle">填写发票信息</text>
      </view>
    </view>

    <view class="body">
      <!-- 个人发票表单 -->
      <view class="form">
        <view class="field">
          <text class="label">姓名</text>
          <input v-model="f.name" class="input" placeholder="请输入姓名" placeholder-class="ph" maxlength="20" />
        </view>
        <view class="field">
          <text class="label">手机号</text>
          <input v-model="f.phone" class="input" type="number" placeholder="请输入手机号" placeholder-class="ph" maxlength="11" />
        </view>
      </view>

      <!-- 须知 -->
      <view class="notice">
        <text class="material-symbols-outlined ni">info</text>
        <view class="nt">
          <text class="ntt">开票须知</text>
          <text class="ntd">1. 电子发票将在申请提交后 1-3 个工作日内开具。\n2. 每笔订单仅可开票一次。\n3. 开票金额为行程实付金额。\n4. 企业发票请前往企业管理后台申请。</text>
        </view>
      </view>
    </view>

    <view class="footer">
      <view class="frow">
        <view class="fv">开票金额 <text class="fvp">¥{{ amount }}</text></view>
      </view>
      <view class="fbtn" @click="submit"><text class="fbt">提交申请</text></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
const top = ref(0);
const amount = ref('0.00'); const count = ref(1);
onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0; });
onLoad((opts: any) => { if (opts?.amount) amount.value = opts.amount; if (opts?.count) count.value = parseInt(opts.count,10); });
const back = () => uni.navigateBack();

const f = reactive({ name: '', phone: '' });

const submit = () => {
  if (!f.name.trim()) { uni.showToast({ title: '请输入姓名', icon: 'none' }); return; }
  if (f.name.trim().length < 2 || f.name.trim().length > 20) { uni.showToast({ title: '姓名为 2-20 个字', icon: 'none' }); return; }
  if (!/^[一-龥a-zA-Z·]+$/.test(f.name.trim())) { uni.showToast({ title: '请输入正确的中文姓名', icon: 'none' }); return; }
  if (!/^1[3-9]\d{9}$/.test(f.phone)) { uni.showToast({ title: '请输入正确的手机号', icon: 'none' }); return; }

  uni.showToast({ title: '提交成功', icon: 'success' });
  setTimeout(() => { uni.navigateBack({ delta: 2 }); }, 1200);
};
</script>

<style lang="scss" scoped>
.root { height: 100vh; display: flex; flex-direction: column; background: #F9F9F9; overflow: hidden; }
.header { flex-shrink: 0; background: #F9F9F9; }
.hbar { height: 56px; padding: 0 24px; display: flex; align-items: center; gap: 16px; }
.hbar:active { opacity: 0.7; }
.hicon { font-size: 24px; color: #000; }
.htitle { font-size: 20px; font-weight: 700; color: #000; }

.body { flex: 1; overflow-y: auto; padding: 32px 24px 0; }

.form { display: flex; flex-direction: column; gap: 20px; margin-bottom: 32px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.label { font-size: 13px; color: #86868B; padding: 0 8px; }
.input { height: 56px; background: #F2F2F2; border-radius: 24px; padding: 0 20px; font-size: 15px; color: #1A1C1C; border: none; }
.ph { color: #86868B; }

.notice { padding: 24px; background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; display: flex; gap: 12px; }
.ni { font-size: 20px; color: #0057FF; flex-shrink: 0; }
.nt { flex: 1; }
.ntt { font-size: 13px; font-weight: 700; color: #000; display: block; margin-bottom: 4px; }
.ntd { font-size: 13px; color: #86868B; line-height: 22px; white-space: pre-line; }

.footer { flex-shrink: 0; background: #FFF; border-top: 1px solid rgba(242,242,242,.5); padding: 16px 24px calc(16px + env(safe-area-inset-bottom, 0px)); box-shadow: 0 -10px 40px rgba(0,0,0,.04); }
.frow { margin-bottom: 16px; text-align: center; }
.fv { font-size: 14px; color: #86868B; }
.fvp { font-size: 22px; font-weight: 700; color: #000; }
.fbtn { height: 56px; background: #000; border-radius: 24px; display: flex; align-items: center; justify-content: center; }
.fbtn:active { opacity: 0.8; }
.fbt { font-size: 20px; font-weight: 600; color: #FFF; }
</style>
