<template>
  <view class="root">
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar" @click="back">
        <text class="material-symbols-outlined hicon">arrow_back</text>
        <text class="htitle">发票详情</text>
      </view>
    </view>

    <view class="body">
      <!-- 当前状态 -->
      <view class="status-card">
        <text class="sl">当前状态</text>
        <text class="sv" :class="'s-'+info.status">{{ statusLine }}</text>
      </view>

      <!-- 状态备注 -->
      <view v-if="info.status==='processing'" class="status-note">
        <text class="material-symbols-outlined sni">schedule</text><text>预计 1-2 个工作日内完成开票</text>
      </view>

      <!-- 抬头信息 -->
      <view class="card">
        <view class="card-hd"><text class="ctitle">抬头信息</text></view>
        <view class="r"><text class="rl">抬头类型</text><text class="rv">个人</text></view>
        <view class="r rl1"><text class="rl">抬头名称</text><text class="rv">{{ info.title }}</text></view>
      </view>

      <!-- 包含行程 -->
      <view class="card">
        <view class="card-hd"><text class="ctitle">包含行程</text></view>
        <view v-for="(t, i) in trips" :key="i" class="trip-row" :class="{ last: i===trips.length-1 }">
          <view class="trip-info">
            <view class="trip-top"><view class="ttag">{{ t.tag }}</view><text class="tdate">{{ t.date }}</text></view>
            <text class="troute">{{ t.route }}</text>
          </view>
          <text class="tprice">¥{{ t.price }}</text>
        </view>

        <!-- 汇总 -->
        <view class="summary">
          <view><text class="slbl">申请日期</text><text class="sval">{{ info.date }}</text></view>
          <view class="sr"><text class="slbl">合计金额</text><text class="samt">¥{{ info.amount }}</text></view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="actions">
        <template v-if="info.status==='issued'">
          <view class="abtn bf" @click="onDownload"><text class="material-symbols-outlined ai">picture_as_pdf</text>下载 PDF</view>
        </template>
        <template v-else-if="info.status==='processing'">
          <view class="abtn bo er wf" @click="onCancel">取消开票申请</view>
        </template>
        <template v-else-if="info.status==='cancelled'">
          <view class="abtn bf wf" @click="onReapply">重新申请</view>
        </template>
      </view>

      <text class="legal">电子发票与纸质发票具有同等法律效力</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
const top = ref(0);
const info = reactive({ id:'', title:'', amount:'', date:'', status:'processing' });
onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0; });
onLoad((opts: any) => {
  if (!opts) return;
  info.id = opts.id||''; info.title = decodeURIComponent(opts.title||'');
  info.amount = opts.amount||''; info.date = opts.date||''; info.status = opts.status||'processing';
});

const statusLine = computed(() => {
  const m: Record<string,string> = { processing:'开票中', issued:'已开票', cancelled:'已取消' };
  return m[info.status] || info.status;
});

const trips = computed(() => {
  if (info.amount === '1,280.00') return [
    { tag:'包车', date:'2026.05.24', route:'虹桥机场 → 静安香格里拉', price:'992.00' },
    { tag:'租车', date:'2026.05.24', route:'静安香格里拉 → 浦东机场', price:'288.00' },
  ];
  return [{ tag:'包车', date:'2026.06.10', route:'政务中心 → 会展中心', price:info.amount }];
});

const back = () => uni.navigateBack();
const onDownload = () => uni.showToast({ title:'PDF 已下载', icon:'none' });
const onCancel = () => {
  uni.showModal({ title:'取消开票申请', content:'确定取消该开票申请吗？', confirmText:'确认取消', confirmColor:'#FF4D4F',
    success:(r:any) => { if(r.confirm){ uni.showToast({title:'已取消',icon:'none'}); setTimeout(()=>back(),800); } } });
};
const onReapply = () => { uni.navigateTo({ url: '/pages/invoice/select' }); };
</script>

<style lang="scss" scoped>
.root { min-height: 100vh; background: #F9F9F9; }
.header { background: #F9F9F9; }
.hbar { height: 56px; padding: 0 24px; display: flex; align-items: center; gap: 16px; }
.hbar:active { opacity: 0.7; }
.hicon { font-size: 24px; color: #000; }
.htitle { font-size: 20px; font-weight: 700; color: #000; }

.body { padding: 20px 24px 40px; display: flex; flex-direction: column; gap: 20px; }

.status-card { background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; padding: 20px; }
.sl { font-size: 13px; color: #86868B; display: block; margin-bottom: 4px; }
.sv { font-size: 22px; font-weight: 700; display: block; }
.s-issued { color: #00B42A; } .s-processing { color: #165DFF; } .s-cancelled { color: #C9CDD4; }

.status-note { font-size: 11px; color: #86868B; display: flex; align-items: center; gap: 4px; }
.status-note.red { color: #FF4D4F; }
.sni { font-size: 16px; }

.card { background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; overflow: hidden; }
.card-hd { padding: 20px 20px 0; }
.ctitle { font-size: 20px; font-weight: 600; color: #000; }
.r { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #F2F2F2; }
.rl1 { border-bottom: none; }
.rl { font-size: 15px; color: #86868B; }
.rv { font-size: 15px; color: #1A1C1C; font-weight: 500; max-width: 200px; text-align: right; }

.trip-row { padding: 14px 20px; border-bottom: 1px solid #F2F2F2; display: flex; justify-content: space-between; align-items: flex-start; }
.trip-row.last { border-bottom: none; }
.trip-info { flex: 1; min-width: 0; }
.trip-top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.ttag { padding: 1px 6px; background: #000; color: #FFF; font-size: 10px; font-weight: 700; border-radius: 2px; }
.tdate { font-size: 13px; color: #000; }
.troute { font-size: 15px; color: #86868B; }
.tprice { font-size: 15px; font-weight: 700; color: #000; flex-shrink: 0; margin-left: 12px; }

.summary { padding: 24px 20px 20px; border-top: 1px dashed #F2F2F2; display: flex; justify-content: space-between; align-items: flex-end; }
.slbl { font-size: 13px; color: #86868B; display: block; margin-bottom: 4px; }
.sval { font-size: 15px; color: #000; }
.sr { text-align: right; }
.samt { font-size: 22px; font-weight: 700; color: #000; }

.actions { display: flex; flex-direction: column; gap: 16px; }
.abtn { height: 56px; border-radius: 24px; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 17px; font-weight: 700; }
.abtn:active { opacity: 0.8; }
.bf { background: #000; color: #FFF; }
.bo { border: 1px solid #F2F2F2; color: #000; }
.er { border-color: #FF4D4F; color: #FF4D4F; }
.wf { width: 100%; }
.ai { font-size: 20px; }

.legal { text-align: center; font-size: 13px; color: #86868B; opacity: 0.6; padding: 0 16px; }
</style>
