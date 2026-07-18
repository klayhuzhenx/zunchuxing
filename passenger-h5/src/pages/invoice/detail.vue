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
      <view v-if="info.status==='rejected'" class="status-note red">
        <text class="material-symbols-outlined sni">error</text><text>驳回原因：{{ info.reason || '信息有误' }}</text>
      </view>
      <!-- 企业身份 + 已驳回：额外红色提示 -->
      <view v-if="isEnterprise && info.status==='rejected'" class="status-note red">
        <text class="material-symbols-outlined sni">priority_high</text><text>请前往管理后台修改后重新提交</text>
      </view>

      <!-- 开票信息 -->
      <view class="card">
        <view class="card-hd"><text class="ctitle">开票信息</text></view>
        <view class="r"><text class="rl">申请编号</text><text class="rv">{{ info.applyNo }}</text></view>
        <view class="r"><text class="rl">发票类型</text><text class="rv">{{ info.invType }}</text></view>
        <view class="r"><text class="rl">发票抬头</text><text class="rv">{{ info.title }}</text></view>
        <!-- 个人专票 / 企业票 额外信息 -->
        <template v-if="info.invType && info.invType.indexOf('专票') >= 0">
          <view class="r"><text class="rl">纳税人识别号</text><text class="rv">{{ info.taxNo || '—' }}</text></view>
          <view class="r"><text class="rl">地址</text><text class="rv">{{ info.address || '—' }}</text></view>
          <view class="r"><text class="rl">开户银行</text><text class="rv">{{ info.bank || '—' }}</text></view>
          <view class="r"><text class="rl">银行账户</text><text class="rv">{{ info.account || '—' }}</text></view>
          <view class="r"><text class="rl">企业电话</text><text class="rv">{{ info.phone || '—' }}</text></view>
        </template>
        <view class="r"><text class="rl">开票金额</text><text class="rv">¥{{ info.amount }}</text></view>
        <view class="r"><text class="rl">申请时间</text><text class="rv">{{ info.date }}</text></view>
        <view class="r rl1"><text class="rl">开票状态</text><text class="rv" :class="'s-'+info.status">{{ statusLine }}</text></view>
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
        <view class="summary">
          <view><text class="slbl">申请日期</text><text class="sval">{{ info.date }}</text></view>
          <view class="sr"><text class="slbl">合计金额</text><text class="samt">¥{{ info.amount }}</text></view>
        </view>
      </view>

      <!-- 发票附件（已开票） -->
      <view v-if="info.status==='issued'" class="card">
        <view class="card-hd"><text class="ctitle">发票附件</text></view>
        <view class="attach">
          <text class="material-symbols-outlined ati">description</text>
          <text class="att-name">{{ info.title }}发票.pdf</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="actions">
        <template v-if="info.status==='issued'">
          <view class="abtn bf" @click="onDownload"><text class="material-symbols-outlined ai">download</text>下载发票</view>
        </template>
        <template v-else-if="!isEnterprise && (info.status==='processing'||info.status==='rejected')">
          <view class="abtn bo er wf" @click="onCancel">取消开票申请</view>
        </template>
        <template v-else-if="!isEnterprise && info.status==='cancelled'">
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
const isEnterprise = ref(uni.getStorageSync('user-identity') === 'enterprise');
const info = reactive({ id:'', title:'', amount:'', date:'', status:'processing', reason:'', applyNo:'', invType:'', taxNo:'', address:'', bank:'', account:'', phone:'' });
onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0; });
onLoad((opts: any) => {
  if (!opts) return;
  info.id = opts.id||'';
  info.title = decodeURIComponent(opts.title||'');
  info.amount = opts.amount||'';
  info.date = opts.date||'';
  info.status = opts.status||'processing';
  info.reason = opts.reason ? decodeURIComponent(opts.reason) : '';
  if (opts.identity === 'enterprise') isEnterprise.value = true;
  // 从 mock 映射补充字段
  const detailMap: Record<string, any> = {
    i1: { applyNo:'FP20260610-0001', invType:'个人普票' },
    i2: { applyNo:'FP20260524-0002', invType:'个人普票' },
    i3: { applyNo:'FP20260505-0003', invType:'个人普票' },
    i4: { applyNo:'FP20260608-0004', invType:'个人专票', taxNo:'440301199001011234', address:'深圳市南山区科技园', bank:'招商银行深圳分行', account:'6225880123456789', phone:'13800010001' },
    e1: { applyNo:'FP20260608-0005', invType:'企业普票' },
    e2: { applyNo:'FP20260609-0006', invType:'企业专票', taxNo:'91110108551491491M', address:'深圳市南山区科技园腾讯大厦', bank:'招商银行深圳分行', account:'6225880987654321', phone:'0755-12345678' },
    e3: { applyNo:'FP20260615-0007', invType:'企业普票' },
  };
  const extra = detailMap[info.id];
  if (extra) Object.assign(info, extra);
});

const statusLine = computed(() => {
  const m: Record<string,string> = { processing:'开票中', issued:'已开票', rejected:'已驳回', cancelled:'已取消' };
  return m[info.status] || info.status;
});

const trips = computed(() => {
  if (info.amount === '1,280.00') return [
    { tag:'包车', date:'2026.05.24', route:'虹桥机场 → 静安香格里拉', price:'992.00' },
    { tag:'租车', date:'2026.05.24', route:'静安香格里拉 → 浦东机场', price:'288.00' },
  ];
  return [{ tag: info.invType && info.invType.indexOf('企业')>=0 ? '企业' : '包车', date:'2026.06.10', route:'政务中心 → 会展中心', price:info.amount }];
});

const back = () => uni.navigateBack();
const onDownload = () => uni.showToast({ title:'发票已下载', icon:'none' });
const onCancel = () => {
  uni.showModal({ title:'取消开票申请', content:'确定取消该开票申请吗？取消后关联订单将释放。', confirmText:'确认取消', confirmColor:'#FF4D4F',
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
.s-issued { color: #00B42A; } .s-processing { color: #165DFF; } .s-rejected { color: #F53F3F; } .s-cancelled { color: #C9CDD4; }

.status-note { font-size: 13px; color: #86868B; display: flex; align-items: center; gap: 4px; padding: 12px 16px; background: #FFF; border-radius: 16px; }
.status-note.red { color: #F53F3F; background: #FFECE8; }
.sni { font-size: 16px; }

.card { background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; overflow: hidden; }
.card-hd { padding: 20px 20px 0; }
.ctitle { font-size: 18px; font-weight: 600; color: #000; }
.r { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-bottom: 1px solid #F2F2F2; }
.rl1 { border-bottom: none; }
.rl { font-size: 14px; color: #86868B; }
.rv { font-size: 14px; color: #1A1C1C; font-weight: 500; max-width: 200px; text-align: right; }

.attach { display: flex; align-items: center; gap: 10px; padding: 20px; }
.ati { font-size: 24px; color: #165DFF; }
.att-name { font-size: 15px; color: #1A1C1C; font-weight: 500; }

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
