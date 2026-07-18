<template>
  <view class="root">
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar" @click="back">
        <text class="material-symbols-outlined hicon">arrow_back</text>
        <text class="htitle">发票管理</text>
      </view>
      <!-- 状态 Tab -->
      <view class="tabs">
        <view v-for="t in tabs" :key="t.key" class="tab" :class="{ on: curTab===t.key }" @click="curTab=t.key">
          <text class="tt">{{ t.label }}</text>
        </view>
      </view>
    </view>

    <view class="body">
      <!-- 企业身份：顶部蓝色提示条 -->
      <view v-if="isEnterprise" class="ent-tip">
        <text class="material-symbols-outlined eti">info</text>
        <text class="ett">企业出行订单发票请管理员前往后台申请</text>
      </view>

      <view v-if="filtered.length===0" class="empty">
        <text class="material-symbols-outlined ei">receipt_long</text>
        <text class="et">暂无发票记录</text>
      </view>

      <view v-for="inv in filtered" :key="inv.id" class="card" @click="detail(inv)">
        <view class="ctop">
          <view>
            <text class="cname">{{ inv.title }}</text>
            <text class="ctype">{{ inv.type }}</text>
          </view>
          <text class="cstatus" :class="'s-'+inv.status">{{ statusLabel(inv.status) }}</text>
        </view>
        <view class="cbot">
          <view>
            <text class="cdate">{{ inv.date }}</text>
          </view>
          <text class="camt">¥ {{ inv.amount }}</text>
        </view>
      </view>
    </view>

    <!-- 仅个人身份展示申请入口 -->
    <view v-if="!isEnterprise" class="footer">
      <view class="fbtn" @click="goSelect"><text class="material-symbols-outlined ficon">add</text>申请开票</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
const top = ref(0);
onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0; });
const back = () => uni.navigateBack();
const isEnterprise = ref(uni.getStorageSync('user-identity') === 'enterprise');

const tabs = [
  {key:'all',label:'全部'},{key:'processing',label:'开票中'},{key:'issued',label:'已开票'},{key:'rejected',label:'已驳回'},{key:'cancelled',label:'已取消'},
];
const curTab = ref('all');

// 个人发票数据
const personalList = reactive([
  { id:'i1', title:'张先生', type:'个人普票', amount:'458.50', date:'2026-06-10 09:15', status:'processing' },
  { id:'i2', title:'李女士', type:'个人普票', amount:'1,280.00', date:'2026-05-24 14:30', status:'issued' },
  { id:'i3', title:'王先生', type:'个人普票', amount:'88.00', date:'2026-05-05 11:20', status:'issued' },
  { id:'i4', title:'赵女士', type:'个人普票', amount:'6,264.00', date:'2026-06-08 18:30', status:'rejected', reason:'发票信息有误，请核对后重新提交' },
]);
// 企业发票数据（管理员看本企业全部）
const enterpriseList = reactive([
  { id:'e1', title:'深圳腾讯科技有限公司', type:'企业普票', amount:'4,176.00', date:'2026-06-08 10:00', status:'issued' },
  { id:'e2', title:'深圳腾讯科技有限公司', type:'企业专票', amount:'10,440.00', date:'2026-06-09 11:00', status:'processing' },
  { id:'e3', title:'深圳腾讯科技有限公司', type:'企业普票', amount:'2,088.00', date:'2026-06-15 10:00', status:'rejected', reason:'企业税号信息有误' },
]);

const list = computed(() => isEnterprise.value ? enterpriseList : personalList);
const hasRejected = computed(() => list.value.some((i: any) => i.status === 'rejected'));

const filtered = computed(() => {
  if (curTab.value === 'all') return list.value;
  return list.value.filter(i => i.status === curTab.value);
});

const statusLabel = (s: string) => ({ processing:'开票中', issued:'已开票', rejected:'已驳回', cancelled:'已取消' }[s]||s);

const detail = (inv: any) => {
  const params = `id=${inv.id}&title=${encodeURIComponent(inv.title)}&amount=${inv.amount}&date=${inv.date}&status=${inv.status}&reason=${encodeURIComponent(inv.reason||'')}&identity=${isEnterprise.value ? 'enterprise' : 'personal'}`;
  uni.navigateTo({ url: `/pages/invoice/detail?${params}` });
};
const goSelect = () => { uni.navigateTo({ url: '/pages/invoice/select' }); };
</script>

<style lang="scss" scoped>
.root { min-height: 100vh; background: #F9F9F9; }
.header { position: sticky; top: 0; z-index: 50; background: #F9F9F9; }
.hbar { height: 56px; padding: 0 24px; display: flex; align-items: center; gap: 16px; }
.hbar:active { opacity: 0.7; }
.hicon { font-size: 24px; color: #000; }
.htitle { font-size: 20px; font-weight: 700; color: #000; }

.tabs { height: 48px; padding: 0 24px; display: flex; align-items: center; gap: 0; }
.tab { padding: 0 16px; height: 100%; display: flex; align-items: center; border-bottom: 2px solid transparent; }
.tab.on { border-bottom-color: #000; }
.tt { font-size: 13px; font-weight: 500; color: #86868B; }
.tab.on .tt { color: #000; font-weight: 700; }

.body { padding: 16px 24px 120px; }
.ent-tip { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #E8F3FF; border-radius: 12px; margin-bottom: 16px; }
.ent-tip.red { background: #FFECE8; }
.eti { font-size: 18px; color: #165DFF; flex-shrink: 0; }
.ent-tip.red .eti { color: #F53F3F; }
.ett { font-size: 13px; color: #165DFF; }
.ent-tip.red .ett { color: #F53F3F; }

.empty { padding: 80px 0; text-align: center; }
.ei { font-size: 48px; color: #C9CDD4; }
.et { font-size: 14px; color: #86868B; display: block; margin-top: 12px; }

.card { background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; padding: 24px; margin-bottom: 20px; }
.card:active { transform: scale(0.98); }
.ctop { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.cname { font-size: 20px; font-weight: 600; color: #000; }
.cstatus { font-size: 13px; font-weight: 700; flex-shrink: 0; }
.s-issued { color: #00B42A; } .s-processing { color: #165DFF; } .s-rejected { color: #F53F3F; } .s-cancelled { color: #C9CDD4; }
.ctype { font-size: 12px; color: #86868B; margin-top: 2px; }
.cbot { display: flex; justify-content: space-between; align-items: flex-end; }
.cdate { font-size: 11px; color: #86868B; display: block; }
.chint { font-size: 11px; color: #86868B; display: flex; align-items: center; gap: 4px; margin-top: 4px; }
.csicon { font-size: 14px; }
.camt { font-size: 22px; font-weight: 600; color: #000; flex-shrink: 0; }

.footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 24px 24px calc(24px + env(safe-area-inset-bottom, 0px)); background: linear-gradient(to top, #F9F9F9 60%, rgba(249,249,249,0)); z-index: 40; }
.fbtn { height: 56px; background: #000; border-radius: 24px; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 20px; font-weight: 600; color: #FFF; }
.fbtn:active { opacity: 0.8; }
.ficon { font-size: 22px; }
</style>
