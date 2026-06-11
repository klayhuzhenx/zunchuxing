<template>
  <view class="root">
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar" @click="back">
        <text class="material-symbols-outlined hicon">arrow_back</text>
        <text class="htitle">电子发票</text>
      </view>
      <!-- 状态 Tab -->
      <view class="tabs">
        <view v-for="t in tabs" :key="t.key" class="tab" :class="{ on: curTab===t.key }" @click="curTab=t.key">
          <text class="tt">{{ t.label }}</text>
        </view>
      </view>
    </view>

    <view class="body">
      <view v-if="filtered.length===0" class="empty">
        <text class="material-symbols-outlined ei">receipt_long</text>
        <text class="et">暂无发票记录</text>
      </view>

      <view v-for="inv in filtered" :key="inv.id" class="card" @click="detail(inv)">
        <view class="ctop">
          <text class="cname">{{ inv.title }}</text>
          <text class="cstatus" :class="'s-'+inv.status">{{ statusLabel(inv.status) }}</text>
        </view>
        <view class="cbot">
          <view>
            <text class="cdate">{{ inv.date }}</text>
            <text v-if="inv.status==='processing'" class="chint"><text class="material-symbols-outlined csicon">schedule</text>预计1-2个工作日内完成</text>
          </view>
          <text class="camt">¥ {{ inv.amount }}</text>
        </view>
      </view>
    </view>

    <view class="footer">
      <view class="fbtn" @click="goSelect"><text class="material-symbols-outlined ficon">add</text>申请开票</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
const top = ref(0);
onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0; });
const back = () => uni.navigateBack();

const tabs = [
  {key:'all',label:'全部'},{key:'processing',label:'开票中'},{key:'issued',label:'已开票'},{key:'cancelled',label:'已取消'},
];
const curTab = ref('all');

// 仅个人发票
const list = reactive([
  { id:'i1', title:'张先生', amount:'458.50', date:'2026-06-10 09:15', status:'processing' },
  { id:'i2', title:'李女士', amount:'1,280.00', date:'2026-05-24 14:30', status:'issued' },
  { id:'i3', title:'王先生', amount:'88.00', date:'2026-05-05 11:20', status:'issued' },
  { id:'i4', title:'赵女士', amount:'6,264.00', date:'2026-06-08 18:30', status:'cancelled' },
]);

const filtered = computed(() => {
  if (curTab.value === 'all') return list;
  return list.filter(i => i.status === curTab.value);
});

const statusLabel = (s: string) => ({ processing:'开票中', issued:'已开票', cancelled:'已取消' }[s]||s);

const detail = (inv: any) => {
  uni.navigateTo({ url: `/pages/invoice/detail?id=${inv.id}&title=${encodeURIComponent(inv.title)}&amount=${inv.amount}&date=${inv.date}&status=${inv.status}` });
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

.empty { padding: 80px 0; text-align: center; }
.ei { font-size: 48px; color: #C9CDD4; }
.et { font-size: 14px; color: #86868B; display: block; margin-top: 12px; }

.card { background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; padding: 24px; margin-bottom: 20px; }
.card:active { transform: scale(0.98); }
.ctop { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.cname { font-size: 20px; font-weight: 600; color: #000; }
.cstatus { font-size: 13px; font-weight: 700; flex-shrink: 0; }
.s-issued { color: #00B42A; } .s-processing { color: #165DFF; } .s-cancelled { color: #C9CDD4; }
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
