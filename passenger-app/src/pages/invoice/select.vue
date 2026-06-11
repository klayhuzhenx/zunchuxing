<template>
  <view class="root">
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar" @click="back">
        <text class="material-symbols-outlined hicon">arrow_back</text>
        <text class="htitle">选择订单</text>
      </view>
    </view>

    <view class="body">
      <!-- 企业发票提示 -->
      <view class="enterprise-hint">
        <text class="material-symbols-outlined hint-icon">corporate_fare</text>
        <text class="hint-text">开企业发票请前往企业管理后台申请</text>
      </view>

      <!-- 订单列表 -->
      <view v-for="o in orders" :key="o.id" class="card" :class="{sel:o.checked}" @click="o.checked=!o.checked">
        <view class="chk" :class="{on:o.checked}"><text v-if="o.checked" class="material-symbols-outlined chkicon">check</text></view>
        <view class="cinfo">
          <text class="cname">{{ o.name }}</text>
          <text class="cdate">{{ o.date }}</text>
        </view>
        <text class="camt">¥{{ o.amount }}</text>
      </view>
    </view>

    <view class="footer">
      <view class="frow"><text class="fl">已选 {{ selCount }} 笔</text><text class="fr">¥{{ selTotal }}</text></view>
      <view class="fbtn" :class="{dis:selCount===0}" @click="next"><text class="fbt">下一步</text></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
const top = ref(0); onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0; });
const back = () => uni.navigateBack();

// 仅个人支付 + 已完成 + 未开票的订单
const orders = reactive([
  { id:'o1', name:'包车出行 · 政务中心 → 会展中心', date:'06-10 至 06-12 · 3天', amount:'6,264', checked:true },
  { id:'o2', name:'包车出行 · 半岛酒店 → 浦东机场', date:'05-12 · 1天', amount:'488', checked:false },
  { id:'o3', name:'租车出行 · 新桥机场接机', date:'05-10 至 05-12 · 3天', amount:'4,500', checked:false },
]);

const selCount = computed(() => orders.filter(o=>o.checked).length);
const selTotal = computed(() => orders.filter(o=>o.checked).reduce((s,o)=>s+parseInt(o.amount.replace(/,/g,'')),0).toLocaleString()+'.00');

const next = () => {
  if (selCount.value===0) return;
  uni.navigateTo({ url: `/pages/invoice/create?amount=${selTotal.value}&count=${selCount.value}` });
};
</script>

<style lang="scss" scoped>
.root { min-height: 100vh; background: #F9F9F9; }
.header { position: sticky; top: 0; z-index: 50; background: #F9F9F9; }
.hbar { height: 56px; padding: 0 24px; display: flex; align-items: center; gap: 16px; }
.hbar:active { opacity: 0.7; }
.hicon { font-size: 24px; color: #000; }
.htitle { font-size: 20px; font-weight: 700; color: #000; }

.enterprise-hint { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #E8F3FF; border: 1px solid #BEDAFF; border-radius: 16px; margin-bottom: 16px; }
.hint-icon { font-size: 18px; color: #165DFF; }
.hint-text { font-size: 13px; color: #165DFF; font-weight: 500; }

.body { padding: 8px 24px 160px; display: flex; flex-direction: column; gap: 12px; }

.card { background: #FFF; border: 2px solid #F2F2F2; border-radius: 32px; padding: 20px; display: flex; align-items: center; gap: 16px; }
.card:active { transform: scale(0.98); }
.card.sel { border-color: #000; }
.chk { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #F2F2F2; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.chk.on { background: #000; border-color: #000; }
.chkicon { font-size: 16px; color: #FFF; }
.cinfo { flex: 1; min-width: 0; }
.cname { font-size: 13px; font-weight: 600; color: #000; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cdate { font-size: 11px; color: #86868B; display: block; margin-top: 4px; }
.camt { font-size: 20px; font-weight: 600; color: #000; flex-shrink: 0; }

.footer { position: fixed; bottom: 0; left: 0; right: 0; background: #FFF; border-top: 1px solid rgba(242,242,242,.5); padding: 16px 24px calc(16px + env(safe-area-inset-bottom, 0px)); box-shadow: 0 -10px 40px rgba(0,0,0,.04); z-index: 40; }
.frow { display: flex; justify-content: space-between; margin-bottom: 16px; }
.fl { font-size: 13px; color: #86868B; }
.fr { font-size: 20px; font-weight: 600; color: #000; }
.fbtn { height: 56px; background: #000; border-radius: 24px; display: flex; align-items: center; justify-content: center; }
.fbtn:active { opacity: 0.8; }
.fbtn.dis { opacity: 0.3; pointer-events: none; }
.fbt { font-size: 20px; font-weight: 600; color: #FFF; }
</style>
