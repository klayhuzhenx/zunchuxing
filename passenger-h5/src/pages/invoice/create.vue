<template>
  <view class="root">
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar" @click="back">
        <text class="material-symbols-outlined hicon">arrow_back</text>
        <text class="htitle">填写发票信息</text>
      </view>
    </view>

    <view class="body">
      <!-- 开票类型（个人身份固定为个人，不展示申请属性） -->
      <view class="section-title">开票类型</view>
      <view class="opt-row">
        <view class="opt" :class="{ on: invType === 'general' }" @click="invType = 'general'">
          <text class="opt-label">普通发票</text>
        </view>
        <view class="opt" :class="{ on: invType === 'special' }" @click="invType = 'special'">
          <text class="opt-label">专用发票</text>
        </view>
      </view>

      <!-- 发票信息表单 -->
      <view class="section-title">发票信息</view>
      <view class="form">
        <view class="field">
          <text class="label">发票抬头 <text class="req">*</text></text>
          <input v-model="f.name" class="input" placeholder="请输入姓名（中文）" placeholder-class="ph" maxlength="20" />
          <text v-if="err.name" class="err-text">{{ err.name }}</text>
        </view>
        <template v-if="invType === 'special'">
          <view class="field">
            <text class="label">纳税人识别号 <text class="req">*</text></text>
            <input v-model="f.taxNo" class="input" placeholder="15-20位" placeholder-class="ph" maxlength="20" />
            <text v-if="err.taxNo" class="err-text">{{ err.taxNo }}</text>
          </view>
          <view class="field">
            <text class="label">地址 <text class="req">*</text></text>
            <input v-model="f.address" class="input" placeholder="请输入地址" placeholder-class="ph" />
            <text v-if="err.address" class="err-text">{{ err.address }}</text>
          </view>
          <view class="field">
            <text class="label">开户银行 <text class="req">*</text></text>
            <input v-model="f.bank" class="input" placeholder="请输入开户银行" placeholder-class="ph" />
            <text v-if="err.bank" class="err-text">{{ err.bank }}</text>
          </view>
          <view class="field">
            <text class="label">银行账户 <text class="req">*</text></text>
            <input v-model="f.account" class="input" placeholder="请输入银行账户" placeholder-class="ph" />
            <text v-if="err.account" class="err-text">{{ err.account }}</text>
          </view>
          <view class="field">
            <text class="label">电话 <text class="req">*</text></text>
            <input v-model="f.phone" class="input" placeholder="请输入电话" placeholder-class="ph" type="number" maxlength="11" />
            <text v-if="err.phone" class="err-text">{{ err.phone }}</text>
          </view>
        </template>
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
      <view class="fbtn" @click="submit">
        <text class="fbt">提交申请</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
const top = ref(0);
const amount = ref('0.00'); const count = ref(1);
onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0; });
onLoad((opts: any) => { if (opts?.amount) amount.value = opts.amount; if (opts?.count) count.value = parseInt(opts.count, 10); });
const back = () => uni.navigateBack();

const invType = ref<'general' | 'special'>('general');
const f = reactive({ name: '', taxNo: '', address: '', bank: '', account: '', phone: '' });
const err = reactive({ name: '', taxNo: '', address: '', bank: '', account: '', phone: '' });
const clearErr = () => { Object.keys(err).forEach(k => (err as any)[k] = ''); };

const submit = () => {
  clearErr();
  if (!f.name.trim()) { err.name = '请输入姓名'; return; }
  if (f.name.trim().length < 2 || f.name.trim().length > 20) { err.name = '姓名为 2-20 个字'; return; }
  if (!/^[一-龥]+$/.test(f.name.trim())) { err.name = '请输入中文姓名'; return; }
  if (invType.value === 'special') {
    if (!f.taxNo.trim() || (f.taxNo.length !== 15 && f.taxNo.length !== 18 && f.taxNo.length !== 20)) { err.taxNo = '请输入正确的纳税人识别号（15-20位）'; return; }
    if (!f.address.trim()) { err.address = '请输入地址'; return; }
    if (!f.bank.trim()) { err.bank = '请输入开户银行'; return; }
    if (!f.account.trim()) { err.account = '请输入银行账户'; return; }
    if (!/^1[3-9]\d{9}$/.test(f.phone)) { err.phone = '请输入正确的电话'; return; }
  }
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

.body { flex: 1; overflow-y: auto; padding: 24px 24px 0; }

.section-title { font-size: 15px; font-weight: 600; color: #1A1C1C; margin-bottom: 12px; margin-top: 8px; }
.opt-row { display: flex; gap: 12px; margin-bottom: 20px; }
.opt { flex: 1; height: 52px; border: 2px solid #F2F2F2; border-radius: 16px; display: flex; align-items: center; justify-content: center; background: #FFF; }
.opt.on { border-color: #000; }
.opt.dis { opacity: 0.4; }
.opt-label { font-size: 15px; font-weight: 500; color: #1A1C1C; }
.opt-hint { font-size: 11px; color: #F53F3F; }

.form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.label { font-size: 13px; color: #4E5969; padding: 0 8px; }
.req { color: #F53F3F; }
.input { height: 52px; background: #F2F2F2; border-radius: 16px; padding: 0 16px; font-size: 15px; color: #1A1C1C; border: none; }
.ph { color: #C9CDD4; }
.err-text { font-size: 12px; color: #F53F3F; padding: 0 8px; }

.notice { padding: 20px; background: #FFF; border: 1px solid #F2F2F2; border-radius: 24px; display: flex; gap: 12px; }
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
