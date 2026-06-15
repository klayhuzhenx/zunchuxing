<template>
  <view class="root">
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar" @click="back">
        <text class="material-symbols-outlined hicon">arrow_back</text>
        <text class="htitle">订单详情</text>
      </view>
    </view>

    <view class="body">
      <view class="sh"><text class="st">{{ s.title }}</text><text class="ss">订单编号：ZR2026060988540</text></view>

      <view class="msg" :class="'msg-'+s.cls">
        <text class="material-symbols-outlined mi">{{ s.icon }}</text>
        <view><text class="ml">{{ s.msg }}</text><text class="md">{{ s.desc }}</text></view>
      </view>

      <!-- 取还车 -->
      <view class="card">
        <text class="ctitle">用车信息</text>
        <view class="route">
          <view class="rr"><view class="rdot g" /><view class="rline" /><view class="rdot r" /></view>
          <view class="ri">
            <view class="riv"><text class="rlbl">取车地点</text><text class="rval">合肥市政务中心</text></view>
            <view class="riv"><text class="rlbl">还车地点</text><text class="rval">合肥滨湖会展中心</text></view>
          </view>
        </view>
        <view class="div" />
        <view class="row2">
          <view><text class="rlbl">租期</text><text class="rval s">06-10 至 06-12</text></view>
          <view class="tr"><text class="rlbl">天数</text><text class="rval s">共 3 天</text></view>
        </view>
      </view>

      <!-- 派车信息 -->
      <view class="card">
        <text class="ctitle">派车信息</text>
        <view class="assign-r">
          <view>
            <text class="albl">送车司机</text>
            <text v-if="hasDriver" class="aval">李师傅 · 京A12345</text>
            <text v-else class="ared">待派车</text>
          </view>
          <view class="atr">
            <text class="albl">收车司机</text>
            <text v-if="hasDriver" class="aval">李师傅 · 京A12345</text>
            <text v-else class="ared">待派车</text>
          </view>
        </view>
        <view class="div" />
        <view><text class="albl">车辆</text><text class="aval b">增程星辉尊享版 · 京A12345</text></view>
      </view>

      <!-- 驾驶证 -->
      <view class="card">
        <text class="ctitle">驾驶证信息</text>
        <view class="lic"><text class="material-symbols-outlined licicon">badge</text><view><text class="lict">驾驶证.jpg</text><text class="lics"><text class="material-symbols-outlined licchk">check_circle</text>上传成功</text></view></view>
      </view>

      <!-- 费用明细 -->
      <view class="card">
        <text class="ctitle">费用明细</text>
        <view class="fr"><text class="fl">日租费 ¥1,500 × 3天</text><text class="fv">¥4,500.00</text></view>
        <view v-if="hasDriver" class="fr">
          <text class="fl">等待费（超 15 分钟后 ¥1/分钟）</text><text class="fv">¥0.00</text>
        </view>
        <view v-if="s.key==='unpaid-extra'||s.key==='completed'" class="fr" @click="openFeeDetail('overtime')">
          <text class="fl err">超时长费 · ¥50/小时（超 1 小时）</text>
          <view class="fr-right"><text class="fv err">¥50.00</text><text class="material-symbols-outlined more-arrow">chevron_right</text></view>
        </view>
        <view v-if="s.key==='unpaid-extra'||s.key==='completed'" class="fr" @click="openFeeDetail('mileage')">
          <text class="fl err">超里程费 · ¥10/km（超 18km）</text>
          <view class="fr-right"><text class="fv err">¥180.00</text><text class="material-symbols-outlined more-arrow">chevron_right</text></view>
        </view>
        <view v-if="(s.key==='unpaid-extra'||s.key==='completed') && rdTotalFee > 0" class="fr" @click="openFeeDetail('remote')">
          <text class="fl err">远调费 · 取{{ rdPickupKm }}km + 还{{ rdDropoffKm }}km</text>
          <view class="fr-right"><text class="fv err">¥{{ rdTotalFee }}.00</text><text class="material-symbols-outlined more-arrow">chevron_right</text></view>
        </view>
        <view v-else-if="s.key==='unpaid-extra'||s.key==='completed'" class="fr">
          <text class="fl">远调费</text><text class="fv">¥0.00</text>
        </view>
        <view v-if="pointsUsed > 0" class="fr">
          <text class="fl points-deduction">积分抵扣（使用 {{ pointsUsed.toLocaleString() }} 积分）</text>
          <text class="fv deduction">-¥{{ pointsDeduction }}.00</text>
        </view>
        <view class="div" />
        <view class="fr last">
          <text class="fl bld">合计费用</text>
          <view class="tr">
            <text class="fv big">¥{{ totalFee }}</text>
            <text v-if="s.key==='unpaid-extra'" class="extra-badge">待补款 ¥230.00</text>
            <text v-if="s.key==='unpaid'" class="fpaid wait">待支付</text>
          </view>
        </view>
      </view>

      <!-- 费用明细弹窗 (复用 charter 样式) -->
      <view v-if="feeDetailVisible" class="fd-mask" @click="feeDetailVisible = false">
        <view class="fd-sheet" @click.stop>
          <view class="fd-head">
            <text class="fd-title">{{ feeDetailData.title }}</text>
            <view class="fd-close" @click="feeDetailVisible = false">
              <text class="material-symbols-outlined">close</text>
            </view>
          </view>
          <view class="fd-body">
            <template v-if="feeDetailType === 'overtime'">
              <view v-for="(d, i) in overtimeDetails" :key="i" class="fd-day">
                <text class="fd-date">{{ d.date }}</text>
                <view class="fd-row"><text class="fdl">行程时间</text><text class="fdv">{{ d.start }} — {{ d.end }}</text></view>
                <view class="fd-row"><text class="fdl">总时长</text><text class="fdv">{{ d.totalDuration }}</text></view>
                <view class="fd-row"><text class="fdl">套餐内时长</text><text class="fdv">{{ d.includedDuration }}</text></view>
                <view class="fd-row"><text class="fdl err">超时时长</text><text class="fdv err">{{ d.overtimeDuration }}</text></view>
                <view class="fd-row"><text class="fdl bld">超时长费</text><text class="fdv bld err">¥{{ d.amount }}</text></view>
              </view>
            </template>
            <template v-if="feeDetailType === 'remote'">
              <text class="fd-date">租车出行 · 远调费明细</text>
              <view class="fd-row"><text class="fdl">取远调距离</text><text class="fdv">{{ rdPickupKm }} km → ¥{{ rdPickupFee }}.00</text></view>
              <view class="fd-row"><text class="fdl">还远调距离</text><text class="fdv">{{ rdDropoffKm }} km → ¥{{ rdDropoffFee }}.00</text></view>
              <view class="fd-div" />
              <view class="fd-row"><text class="fdl bld">远调费合计</text><text class="fdv bld err">¥{{ rdTotalFee }}.00</text></view>
            </template>
            <template v-if="feeDetailType === 'mileage'">
              <view v-for="(d, i) in mileageDetails" :key="i" class="fd-day">
                <text class="fd-date">{{ d.date }}</text>
                <view class="fd-row"><text class="fdl">开始里程</text><text class="fdv">{{ d.startMileage }} km</text></view>
                <view class="fd-row"><text class="fdl">结束里程</text><text class="fdv">{{ d.endMileage }} km</text></view>
                <view class="fd-img-row"><view class="fd-img"><text class="material-symbols-outlined">image</text><text>开始</text></view><view class="fd-img"><text class="material-symbols-outlined">image</text><text>结束</text></view></view>
                <view class="fd-row"><text class="fdl">当日里程</text><text class="fdv">{{ d.totalMileage }} km</text></view>
                <view class="fd-row"><text class="fdl">套餐内里程</text><text class="fdv">{{ d.includedMileage }} km</text></view>
                <view class="fd-row"><text class="fdl err">超里程</text><text class="fdv err">{{ d.excessMileage }} km</text></view>
                <view class="fd-row"><text class="fdl bld">超里程费</text><text class="fdv bld err">¥{{ d.amount }}</text></view>
              </view>
            </template>
          </view>
        </view>
      </view>

      <!-- 订单动态 -->
      <view class="card">
        <text class="ctitle">订单动态</text>
        <view class="tl">
          <view v-for="(t, i) in timeline" :key="i" class="tlr" :class="{ tllast: i===timeline.length-1 }">
            <view class="tldot" :class="i===0?'active':(t.type==='warn'?'warn':'')" />
            <view v-if="i<timeline.length-1" class="tlline" />
            <view class="tli"><text class="tlt">{{ t.title }}</text><text class="tltime">{{ t.time }}</text></view>
          </view>
        </view>
      </view>
    </view>

    <view class="footer">
      <template v-if="s.key==='unpaid'">
        <view class="btn bo er" @click="onCancel">取消订单</view>
        <view class="btn bf" @click="onPay">去支付 ¥4,500</view>
      </template>
      <template v-else-if="s.key==='unpaid-extra'">
        <view class="btn bf wf" @click="onExtraPay">去补款 ¥180.00</view>
      </template>
      <template v-else-if="s.key==='pending-unassigned'||s.key==='pending-pickup-undelivered'">
        <view class="btn bo er wf" @click="onCancel">取消订单</view>
      </template>
      <template v-else-if="s.key==='pending-pickup'">
        <view class="btn bo er" @click="onCancel">取消订单</view>
        <view class="btn bf" @click="onTakeCar">确认取车</view>
      </template>
      <template v-else-if="s.key==='ongoing'">
        <view class="btn bo er" @click="onEarlyReturn">提前还车</view>
        <view class="btn bf" @click="toast('已拨打客服电话')"><text class="material-symbols-outlined ficon">support_agent</text>联系客服</view>
      </template>
      <template v-else-if="s.key==='completed'">
        <view class="btn bo" @click="goInvoice">开具发票</view>
      </template>
      <template v-else-if="s.key==='cancelled'">
        <view class="btn bf wf" @click="onReorder">重新下单</view>
      </template>
    </view>

    <bottom-sheet v-model="showPaySheet" title="选择支付方式" :max-height="'auto'">
      <view class="paym-list">
        <view v-for="p in payMethods" :key="p.id" class="paym-item" :class="{act:payMethod===p.id}" @click="payMethod=p.id">
          <view class="paym-left"><text class="material-symbols-outlined paym-icon" :style="{color:p.color}">{{ p.icon }}</text><text class="paym-name">{{ p.name }}</text></view>
          <view class="paym-radio"><view v-if="payMethod===p.id" class="paym-inner" /></view>
        </view>
      </view>
      <view class="paym-btn" @click="onExtraPayConfirm"><text class="paym-btn-t">确认并支付 ¥180.00</text></view>
    </bottom-sheet>

  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import BottomSheet from '@/components/bottom-sheet.vue';
const top = ref(0); const st = ref('pending-unassigned');
onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0; });
onLoad((opts: Record<string, string> | undefined) => { if (opts?.status) st.value = opts.status; });

const statusMap: Record<string, { key:string; title:string; icon:string; msg:string; desc:string; cls:string }> = {
  unpaid:          { key:'unpaid',          title:'等待支付',   icon:'schedule',       msg:'等待支付', desc:'订单已提交，等待乘客完成支付', cls:'warn' },
  'unpaid-extra':  { key:'unpaid-extra',    title:'差额待付',  icon:'error_outline',  msg:'差额待付', desc:'行程结束产生额外费用 ¥180.00，等待乘客补款', cls:'err' },
  'pending-unassigned':{ key:'pending-unassigned', title:'待派车', icon:'hourglass_top', msg:'待派车', desc:'订单已支付，请尽快安排送车司机', cls:'err' },
  'pending-pickup-undelivered':{ key:'pending-pickup-undelivered', title:'待司机送达', icon:'local_shipping', msg:'待司机送达', desc:'司机正在将车辆送至取车点，预计30分钟内到达', cls:'warn' },
  'pending-pickup':{ key:'pending-pickup', title:'车辆已送达', icon:'check_circle', msg:'车辆已送达', desc:'车辆已送达取车地点，请前往确认取车', cls:'ok' },
  ongoing:         { key:'ongoing',          title:'用车中',    icon:'directions_car', msg:'用车中', desc:'车辆使用中，如需帮助请联系客服', cls:'ok' },
  completed:       { key:'completed',        title:'已还车',    icon:'check_circle', msg:'已还车', desc:'感谢使用尊出行', cls:'ok' },
  cancelled:       { key:'cancelled',        title:'订单已取消',icon:'cancel',         msg:'订单已取消', desc:'取消原因：行程计划有变', cls:'err' },
};
const s = computed(() => statusMap[st.value] || statusMap['pending-unassigned']);
const hasDriver = computed(() => ['pending-pickup-undelivered','pending-pickup','ongoing','completed','unpaid-extra'].includes(s.value.key));

// 费用明细弹窗
const feeDetailVisible = ref(false);
const feeDetailType = ref<'waiting' | 'overtime' | 'mileage' | 'remote' | 'other'>('overtime');
const feeDetailData = computed(() => {
  const titles: Record<string, string> = { waiting: '等待费明细', overtime: '超时长费明细', mileage: '超里程费明细', remote: '远调费明细', other: '其他费用明细' };
  return { title: titles[feeDetailType.value] };
});
const overtimeDetails = [
  { date: '06-10', start: '08:00', end: '17:00', totalDuration: '9小时', includedDuration: '8小时', overtimeDuration: '1小时', amount: 50 },
];
const mileageDetails = [
  { date: '06-10', startMileage: 180, endMileage: 218, totalMileage: 38, includedMileage: 200, excessMileage: 18, amount: 180 },
];
const rdPickupKm = 0; const rdDropoffKm = 0;
const rdPickupFee = 0; const rdDropoffFee = 0;
const rdTotalFee = 0;
const openFeeDetail = (type: 'waiting' | 'overtime' | 'mileage' | 'remote' | 'other') => {
  feeDetailType.value = type;
  feeDetailVisible.value = true;
};

// 支付方式 + 积分信息（spec §6.6：支付成功（支付方式，如使用积分则展示「微信支付 ¥230 使用积分 3000」））
const payMethodName = '微信支付';
const pointsUsed = 3000;
const pointsDeduction = 30; // 100积分=¥1 → 3000积分=¥30
const paymentText = pointsUsed > 0
  ? `${payMethodName} ¥4,470.00 使用积分 ${pointsUsed.toLocaleString()}`
  : `${payMethodName} ¥4,500.00`;

const timeline = computed(() => {
  const t: { title:string; time:string; type?:string }[] = [];
  switch (s.value.key) {
    case 'unpaid': t.push({ title: '订单已提交', time: '06-09 14:22' }); break;
    case 'pending-unassigned':
      t.push({ title: paymentText, time: '06-09 14:20' });
      t.push({ title: '订单已提交', time: '06-09 14:22' }); break;
    case 'pending-pickup-undelivered':
      t.push({ title: '已派车 — 李师傅送车中 · 京A12345 · 增程星辉尊享版', time: '06-09 15:10' });
      t.push({ title: paymentText, time: '06-09 14:20' });
      t.push({ title: '订单已提交', time: '06-09 14:22' }); break;
    case 'pending-pickup':
      t.push({ title: '已派车 — 李师傅送车中 · 京A12345 · 增程星辉尊享版', time: '06-09 15:10' });
      t.push({ title: paymentText, time: '06-09 14:20' });
      t.push({ title: '订单已提交', time: '06-09 14:22' }); break;
    case 'ongoing':
      t.push({ title: '乘客确认取车 · 行程开始', time: '06-10 09:05' });
      t.push({ title: '车辆已送达取车点', time: '06-10 08:50' });
      t.push({ title: '已派车 — 李师傅送车中 · 京A12345', time: '06-09 15:10' });
      t.push({ title: paymentText, time: '06-09 14:20' });
      t.push({ title: '订单已提交', time: '06-09 14:22' }); break;
    case 'completed':
      t.push({ title: '还车完成 · 06-12 18:30 车辆已收回', time: '06-12 18:30' });
      t.push({ title: '乘客确认取车 · 行程开始', time: '06-10 09:05' });
      t.push({ title: '已派车 — 李师傅送车中 · 京A12345', time: '06-09 15:10' });
      t.push({ title: paymentText, time: '06-09 14:20' });
      t.push({ title: '订单已提交', time: '06-09 14:22' }); break;
    case 'unpaid-extra':
      t.push({ title: '还车完成 · 有待补款 ¥180.00', time: '06-12 18:30', type:'warn' });
      t.push({ title: '乘客确认取车 · 行程开始', time: '06-10 09:05' });
      t.push({ title: '已派车 — 李师傅送车中 · 京A12345', time: '06-09 15:10' });
      t.push({ title: paymentText, time: '06-09 14:20' });
      t.push({ title: '订单已提交', time: '06-09 14:22' }); break;
    case 'cancelled':
      t.push({ title: '订单已取消 — 取消原因：行程计划有变', time: '06-09 16:00', type:'warn' });
      t.push({ title: paymentText, time: '06-09 14:20' });
      t.push({ title: '订单已提交', time: '06-09 14:22' }); break;
    default: t.push({ title: '订单已提交', time: '06-09 14:22' });
  }
  return t;
});
const totalFee = computed(() => {
  const base = s.value.key === 'unpaid-extra' ? '4,730.00' : '4,500.00';
  return base;
});

const back = () => uni.navigateBack();
const toast = (m: string) => uni.showToast({ title: m, icon: 'none' });
const onCancel = () => { uni.showModal({ title:'取消订单', content:'确定要取消该订单吗？', confirmText:'确认取消', confirmColor:'#FF4D4F', success:(r:any)=>{ if(r.confirm) st.value='cancelled'; } }); };
const showPaySheet = ref(false);
const payMethod = ref<'wechat'|'alipay'|'enterprise'>('wechat');
const payMethods = [
  { id:'wechat' as const, name:'微信支付', icon:'account_balance_wallet', color:'#07C160' },
  { id:'alipay' as const, name:'支付宝', icon:'payments', color:'#1677FF' },
  { id:'enterprise' as const, name:'企业支付', icon:'domain', color:'#D4AF37' },
];
const onPay = () => {
  uni.navigateTo({ url: `/pages/charter/pay?source=rental&method=wechat&total=4,500&orderNo=ZR2026060988540&carIdx=0&days=3&passenger=张先生&phone=138****8888&product=增程星辉尊享版` });
};
const onExtraPay = () => { showPaySheet.value = true; };
const onExtraPayConfirm = () => {
  showPaySheet.value = false;
  uni.navigateTo({ url: `/pages/charter/pay?source=rental&method=${payMethod.value}&total=180&orderNo=ZR2026060988540-EXTRA&carIdx=0&days=3&passenger=张先生&phone=138****8888&product=增程星辉尊享版` });
};
const onTakeCar = () => { uni.showModal({ title:'确认取车', content:'确认已收到车辆并检查车况无误？', confirmText:'确认取车', success:(r:any)=>{ if(r.confirm){ st.value='ongoing'; uni.showToast({title:'已开始用车',icon:'none'}); } } }); };
const onEarlyReturn = () => { uni.showModal({ title:'提前还车', content:'确定提前还车？', confirmText:'确认还车', confirmColor:'#FF4D4F', success:(r:any)=>{ if(r.confirm) st.value='completed'; } }); };
const goInvoice = () => uni.navigateTo({ url: '/pages/invoice/index' });
const onReorder = () => uni.navigateTo({ url: '/pages/rental/index' });
</script>

<style lang="scss" scoped>
.root { height: 100vh; display: flex; flex-direction: column; background: #F9F9F9; overflow: hidden; }
.header { flex-shrink: 0; background: #F9F9F9; }
.hbar { height: 56px; padding: 0 24px; display: flex; align-items: center; gap: 16px; }
.hbar:active { opacity: 0.7; }
.hicon { font-size: 24px; color: #000; }
.htitle { font-size: 20px; font-weight: 700; color: #000; }
.body { flex: 1; overflow-y: auto; padding: 8px 24px 0; }
.sh { padding: 16px 0; }
.st { font-size: 28px; font-weight: 700; color: #000; display: block; }
.ss { font-size: 15px; color: #86868B; display: block; margin-top: 4px; }

.msg { padding: 16px; border-radius: 24px; display: flex; gap: 12px; margin-bottom: 20px; align-items: flex-start; }
.msg-warn { background: rgba(217,119,6,.06); } .msg-ok { background: rgba(0,176,107,.06); }
.msg-err { background: rgba(255,77,79,.06); } .msg-info { background: rgba(0,87,255,.05); }
.mi { font-size: 24px; flex-shrink: 0; }
.msg-warn .mi { color: #D97706; } .msg-ok .mi { color: #00B06B; }
.msg-err .mi { color: #FF4D4F; } .msg-info .mi { color: #0057FF; }
.ml { font-size: 15px; font-weight: 600; display: block; }
.msg-warn .ml { color: #92400E; } .msg-ok .ml { color: #065F46; }
.msg-err .ml { color: #FF4D4F; } .msg-info .ml { color: #0057FF; }
.md { font-size: 13px; color: #86868B; display: block; margin-top: 4px; }

.card { background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; padding: 20px; margin-bottom: 20px; }
.ctitle { font-size: 20px; font-weight: 600; color: #000; display: block; margin-bottom: 20px; }

.route { display: flex; gap: 16px; }
.rr { display: flex; flex-direction: column; align-items: center; padding-top: 6px; width: 6px; }
.rdot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid #FFF; box-shadow: 0 1px 2px rgba(0,0,0,.1); }
.rdot.g { background: #10B981; } .rdot.r { background: #EF4444; }
.rline { width: 1.5px; flex: 1; background: repeating-linear-gradient(#E2E2E2 0 3px, transparent 3px 6px); margin: 4px 0; min-height: 32px; }
.ri { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.rlbl { font-size: 11px; color: #86868B; text-transform: uppercase; letter-spacing: .05em; display: block; margin-bottom: 4px; }
.rval { font-size: 17px; font-weight: 600; color: #000; display: block; }
.rval.s { font-size: 15px; }
.div { height: 1px; background: #F2F2F2; margin: 20px 0; }
.row2 { display: flex; justify-content: space-between; } .tr { text-align: right; }

.assign-r { display: flex; justify-content: space-between; margin-bottom: 0; }
.ared { font-size: 13px; color: #FF4D4F; font-weight: 500; }
.aval { font-size: 15px; color: #1A1C1C; display: block; }
.aval.b { margin-top: 8px; }
.albl { font-size: 11px; color: #86868B; text-transform: uppercase; letter-spacing: .05em; display: block; margin-bottom: 4px; }
.atr { text-align: right; }

.lic { display: flex; align-items: center; gap: 16px; padding: 16px; background: #F2F2F2; border-radius: 16px; }
.licicon { font-size: 32px; color: #0057FF; }
.lict { font-size: 15px; color: #000; display: block; }
.lics { font-size: 11px; color: #86868B; display: flex; align-items: center; gap: 4px; margin-top: 2px; }
.licchk { font-size: 14px; color: #00B06B; }

.fr { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
.fr.last { align-items: flex-end; }
.fl { font-size: 15px; color: #86868B; } .fl.err { color: #FF4D4F; } .fl.bld { font-size: 17px; font-weight: 700; color: #000; } .fl.points-deduction { color: #00B42A; }
.fv { font-size: 17px; font-weight: 600; color: #000; } .fv.err { color: #FF4D4F; } .fv.big { font-size: 28px; font-weight: 700; } .fv.deduction { color: #00B42A; }
.fpaid.wait { font-size: 11px; color: #D97706; display: block; }
.extra-badge { font-size: 11px; color: #FF4D4F; font-weight: 600; display: block; }

.tl { position: relative; padding-left: 24px; }
.tlr { position: relative; padding-bottom: 20px; display: flex; }
.tllast { padding-bottom: 0; }
.tldot { position: absolute; left: -20px; top: 1px; width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0; }
.tldot.active { background: #000; }
.tldot.active::after { content: ''; position: absolute; top: 4px; left: 4px; width: 8px; height: 8px; border-radius: 50%; background: #FFF; }
.tldot:not(.active) { background: #F2F2F2; border: 2px solid #E2E2E2; }
.tldot:not(.active).warn { background: #FF4D4F; border-color: #FF4D4F; }
.tldot:not(.active).warn::after { content: ''; position: absolute; top: 4px; left: 4px; width: 8px; height: 8px; border-radius: 50%; background: #FFF; }
.tlline { position: absolute; left: -13px; top: 18px; width: 1.5px; height: calc(100% - 2px); background: #E2E2E2; }
.tli { flex: 1; }
.tlt { font-size: 15px; color: #1A1C1C; display: block; font-weight: 500; line-height: 22px; }
.tltime { font-size: 11px; color: #86868B; display: block; margin-top: 2px; }

.footer { flex-shrink: 0; background: #FFF; border-top: 1px solid rgba(242,242,242,.5); padding: 16px 24px calc(16px + env(safe-area-inset-bottom, 0px)); box-shadow: 0 -10px 40px rgba(0,0,0,.04); display: flex; gap: 16px; }
.btn { flex: 1; height: 56px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 600; gap: 8px; }
.btn:active { opacity: 0.85; transform: scale(0.98); }
.bf { background: #000; color: #FFF; }
.bo { border: 1px solid #F2F2F2; color: #1A1C1C; } .bo.er { border-color: #FF4D4F; color: #FF4D4F; }
.wf { flex: none; width: 100%; }
.ficon { font-size: 18px; }

.paym-list { display: flex; flex-direction: column; gap: 8px; }
.paym-item { display: flex; align-items: center; justify-content: space-between; padding: 16px; border: 1px solid #F2F2F2; border-radius: 16px; background: #F9F9F9; }
.paym-item.act { border-color: #000; background: #FFF; }
.paym-item:active { background: #F2F2F2; }
.paym-left { display: flex; align-items: center; gap: 12px; }
.paym-icon { font-size: 24px; }
.paym-name { font-size: 15px; color: #1A1C1C; font-weight: 500; }
.paym-radio { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #E2E2E2; display: flex; align-items: center; justify-content: center; }
.paym-item.act .paym-radio { border-color: #000; }
.paym-inner { width: 10px; height: 10px; border-radius: 50%; background: #000; }
.paym-btn { height: 56px; background: #000; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin-top: 16px; }
.paym-btn:active { opacity: 0.85; }
.paym-btn-t { font-size: 17px; font-weight: 600; color: #FFF; }

.fr-right { display: flex; align-items: center; gap: 2px; }
.more-arrow { font-size: 16px; color: #86868B; margin-left: 4px; flex-shrink: 0; }

.fd-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 999; display: flex; align-items: flex-end; justify-content: center; }
.fd-sheet { width: 100%; max-height: 80vh; background: #FFF; border-radius: 32px 32px 0 0; display: flex; flex-direction: column; overflow: hidden; }
.fd-head { display: flex; align-items: center; justify-content: space-between; padding: 24px 24px 16px; flex-shrink: 0; }
.fd-title { font-size: 20px; font-weight: 700; color: #1A1C1C; }
.fd-close { width: 32px; height: 32px; border-radius: 50%; background: #F2F2F2; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.fd-close:active { opacity: 0.7; }
.fd-close .material-symbols-outlined { font-size: 18px; color: #4C4546; }
.fd-body { padding: 0 24px 40px; max-height: 65vh; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.fd-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; }
.fdl { font-size: 14px; color: #4C4546; }
.fdl.bld { font-weight: 700; color: #1A1C1C; }
.fdv { font-size: 14px; color: #1A1C1C; font-weight: 500; }
.fdv.err { color: #F53F3F; }
.fdv.bld { font-weight: 700; }
.fd-div { height: 1px; background: #F2F2F2; margin: 8px 0; }
.fd-date { font-size: 15px; font-weight: 600; color: #1A1C1C; display: block; margin-bottom: 8px; }
.fd-day { margin-bottom: 4px; }
.fd-img-row { display: flex; gap: 12px; padding: 10px 0; }
.fd-img { width: 80px; height: 60px; background: #F2F2F2; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; font-size: 11px; color: #86868B; }
.fd-img .material-symbols-outlined { font-size: 18px; }
</style>
