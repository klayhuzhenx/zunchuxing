<template>
  <view class="root">
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar" @click="back">
        <text class="material-symbols-outlined hicon">arrow_back</text>
        <text class="htitle">我的行程</text>
      </view>
    </view>

    <view class="body">
      <!-- 搜索 -->
      <view class="search">
        <text class="material-symbols-outlined sicon">search</text>
        <input v-model="keyword" class="sinput" placeholder="搜索订单" placeholder-class="sph" />
      </view>

      <!-- tab -->
      <scroll-view scroll-x class="tabs" :show-scrollbar="false">
        <view v-for="t in tabs" :key="t.key" class="tab" :class="{ on: tab === t.key }" @click="tab = t.key">
          <text class="tt">{{ t.label }}</text>
        </view>
      </scroll-view>

      <!-- 列表 -->
      <view v-if="list.length > 0" class="cards">
        <view v-for="(o, i) in list" :key="i" class="card" :class="{ dim: o.s === 'cancelled' || o.s === 'completed' }" @click="detail(o)">
          <!-- head -->
          <view class="ch">
            <view class="ci">
              <text class="cg" :class="o.t === 'charter' ? 'gold' : 'black'">{{ o.t === 'charter' ? '包车出行' : '租车出行' }}</text>
              <text class="cr">{{ o.route }}</text>
            </view>
            <text class="cs" :class="sc(o.s)">
              <text v-if="o.s === 'ongoing'" class="sdot" />{{ sl(o) }}
            </text>
          </view>

          <!-- body info -->
          <view class="cb">
            <view class="ln" v-if="o.date"><text class="material-symbols-outlined li">calendar_today</text><text class="lt">{{ o.date }}</text></view>
            <view class="ln"><text class="material-symbols-outlined li">directions_car</text><text class="lt">{{ o.car }}</text></view>
            <view class="ln" v-if="o.drv"><text class="material-symbols-outlined li">person</text><text class="lt">{{ o.drv }}</text></view>
          </view>

          <!-- alerts -->
          <view v-if="o.s === 'unpaid'" class="al warn"><text class="material-symbols-outlined ai">schedule</text><text class="at">剩余支付时间 {{ o.cd }}</text></view>
          <view v-if="o.s === 'pending-pickup-undelivered'" class="al warn"><text class="material-symbols-outlined ai">local_shipping</text><text class="at">待司机将车辆送至取车点</text></view>
          <view v-if="o.s === 'pending-pickup'" class="al ok"><text class="material-symbols-outlined ai">check_circle</text><text class="at">车辆已送达取车点，请前往确认取车</text></view>
          <view v-if="o.s === 'pending-unassigned'" class="al warn"><text class="material-symbols-outlined ai">hourglass_top</text><text class="at">等待派车，请您耐心等待</text></view>
          <view v-if="o.s === 'pending-assigned'" class="al info"><text class="material-symbols-outlined ai">airport_shuttle</text><text class="at">司机正在前往接驾，请保持手机畅通</text></view>
          <view v-if="o.s === 'unpaid-extra'" class="al err"><view class="ar"><view class="alf"><text class="material-symbols-outlined ai">error_outline</text><text class="at">行程结束，差额待付</text></view><text class="ae">¥{{ o.ex }}</text></view></view>
          <view v-if="o.s === 'cancelled'" class="al cancel"><text class="material-symbols-outlined ai">info</text><view><text class="at bld">取消原因</text><text class="at sub">{{ o.reason }}</text></view></view>

          <!-- actions -->
          <view class="ca">
            <template v-if="o.s === 'unpaid'">
              <view class="btn bo er" @click.stop="cancelOrder(o,i)">取消订单</view>
              <view class="btn bf" @click.stop="goPay(o)">去支付</view>
            </template>
            <template v-if="o.s === 'unpaid-extra'">
              <view class="btn bf wf" @click.stop="goPay(o)">去补款</view>
            </template>
            <!-- 待派车/待接驾/待取车：不展示取消按钮 -->
            <template v-if="o.s === 'pending-pickup'">
              <view class="btn bf wf" @click.stop="takeCar(o)">确认取车</view>
            </template>
            <template v-if="o.s === 'completed'">
              <view class="btn bo" @click.stop="goInvoice">开发票</view>
            </template>
            <template v-if="o.s === 'cancelled'">
              <view class="btn bf wf" @click.stop="redoOrder(o)">重新下单</view>
            </template>
          </view>
        </view>
      </view>

      <view v-else class="empty">
        <text class="material-symbols-outlined eico">inbox</text>
        <text class="etx">暂无订单</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

type S = 'unpaid'|'unpaid-extra'|'pending-unassigned'|'pending-assigned'|'pending-pickup-undelivered'|'pending-pickup'|'ongoing'|'completed'|'cancelled';
type O = { t:'charter'|'rental'; s:S; route:string; date:string; car:string; drv:string; cd:string; ex:string; reason:string; ci:number; pi:string; dy:number };

const top = ref(0); const keyword = ref(''); const tab = ref('all');
onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0; });

const tabs = [
  { key:'all',label:'全部' },{ key:'unpaid',label:'待支付' },
  { key:'pending-start',label:'待开始' },{ key:'ongoing',label:'进行中' },
  { key:'completed',label:'已完成' },{ key:'cancelled',label:'已取消' },
];

const orders: O[] = [
  { t:'charter',s:'unpaid',route:'合肥南站 → 石门路',date:'06-10 至 06-12 · 3天',car:'增程星辉尊享版 · 尊享基础',drv:'',cd:'14:59',ex:'',reason:'',ci:0,pi:'a-f-pro',dy:3 },
  { t:'charter',s:'unpaid-extra',route:'半岛酒店 → 浦东机场 T2',date:'05-12 至 05-12 · 1天',car:'增程星辉尊享版 · 尊享基础',drv:'',cd:'',ex:'511.00',reason:'',ci:0,pi:'a-f-pro',dy:1 },
  { t:'charter',s:'pending-unassigned',route:'天鹅湖大酒店 → 骆岗公园',date:'06-12 至 06-14 · 3天',car:'增程星辉尊享版 · 尊享基础',drv:'',cd:'',ex:'',reason:'',ci:0,pi:'a-f-pro',dy:3 },
  { t:'charter',s:'pending-assigned',route:'政务中心 → 会展中心',date:'06-10 至 06-12 · 3天',car:'增程星辉尊享版 · 尊享基础',drv:'李师傅 · 京A12345',cd:'',ex:'',reason:'',ci:0,pi:'a-f-pro',dy:3 },
  { t:'charter',s:'ongoing',route:'政务中心 → 会展中心',date:'06-10 至 06-12 · 3天',car:'增程星辉尊享版 · 尊享基础',drv:'李师傅 · 京A12345',cd:'',ex:'',reason:'',ci:0,pi:'a-f-pro',dy:3 },
  { t:'charter',s:'completed',route:'半岛酒店 → 浦东机场 T2',date:'05月12日 14:30 · 2天',car:'增程星辉尊享版 · 尊享基础',drv:'',cd:'',ex:'',reason:'',ci:0,pi:'a-f-pro',dy:2 },
  { t:'charter',s:'cancelled',route:'政务中心 → 会展中心',date:'',car:'增程星辉尊享版 · 尊享基础',drv:'',cd:'',ex:'',reason:'行程计划有变 · 已扣违约金 ¥1,566.00',ci:0,pi:'a-f-pro',dy:3 },
  { t:'rental',s:'unpaid',route:'取车：政务中心',date:'06-10 至 06-12 · 3天',car:'增程星辉尊享版',drv:'',cd:'14:59',ex:'',reason:'',ci:0,pi:'',dy:3 },
  { t:'rental',s:'unpaid-extra',route:'已还车：会展中心',date:'05-12 至 05-14 · 3天',car:'增程星辉尊享版',drv:'',cd:'',ex:'180.00',reason:'',ci:0,pi:'',dy:3 },
  { t:'rental',s:'pending-unassigned',route:'取车：政务中心',date:'06-10 至 06-12 · 3天',car:'增程星辉尊享版',drv:'',cd:'',ex:'',reason:'',ci:0,pi:'',dy:3 },
  { t:'rental',s:'pending-pickup-undelivered',route:'取车：政务中心',date:'06-10 至 06-12 · 3天',car:'增程星辉尊享版',drv:'',cd:'',ex:'',reason:'',ci:0,pi:'',dy:3 },
  { t:'rental',s:'pending-pickup',route:'取车：政务中心',date:'06-10 至 06-12 · 3天',car:'增程星辉尊享版',drv:'',cd:'',ex:'',reason:'',ci:0,pi:'',dy:3 },
  { t:'rental',s:'ongoing',route:'取车：政务中心',date:'06-10 至 06-12 · 3天',car:'增程星辉尊享版',drv:'',cd:'',ex:'',reason:'',ci:0,pi:'',dy:3 },
  { t:'rental',s:'completed',route:'已还车：会展中心',date:'05月12日 14:30 · 3天',car:'增程星辉尊享版',drv:'',cd:'',ex:'',reason:'',ci:0,pi:'',dy:3 },
  { t:'rental',s:'cancelled',route:'取车：政务中心',date:'',car:'增程星辉尊享版',drv:'',cd:'',ex:'',reason:'行程计划有变 · 已扣违约金 ¥1,125.00',ci:0,pi:'',dy:3 },
];

const sl = (o: O) => {
  const m: Record<string,string> = { unpaid:'待支付','unpaid-extra':'待补款','pending-unassigned':'待派车','pending-assigned':'待接驾','pending-pickup-undelivered':'待取车','pending-pickup':'待取车',ongoing:'进行中',completed:'已完成',cancelled:'已取消' };
  return m[o.s]||o.s;
};
const sc = (s: S) => {
  if (s==='unpaid'||s==='unpaid-extra'||s==='cancelled') return 'er';
  if (s==='ongoing'||s==='completed'||s==='pending-pickup') return 'ok';
  if (s==='pending-assigned') return 'bl';
  return 'wn';
};

// 待派车合并到「待开始」，待取车也属于「待开始」
const tmap: Record<string, S[]> = {
  all:[],
  unpaid:['unpaid','unpaid-extra'],
  'pending-start':['pending-unassigned','pending-assigned','pending-pickup-undelivered','pending-pickup'],
  ongoing:['ongoing'],
  completed:['completed'],
  cancelled:['cancelled'],
};

const list = computed(() => {
  let r = orders;
  if (tab.value !== 'all') { const a = tmap[tab.value]||[]; r = r.filter(o => a.includes(o.s)); }
  if (keyword.value.trim()) { const kw = keyword.value.trim().toLowerCase(); r = r.filter(o => o.route.includes(kw)||o.car.includes(kw)); }
  return r;
});

const back = () => uni.navigateBack();
const detail = (o: O) => {
  const url = o.t === 'charter' ? '/pages/trips/detail-charter' : '/pages/trips/detail-rental';
  const params = [
    `status=${o.s}`, `days=${o.dy}`, `car=${encodeURIComponent(o.car)}`,
    `date=${encodeURIComponent(o.date)}`, `drv=${encodeURIComponent(o.drv)}`,
    `ex=${o.ex}`, `no=P2026061000${Math.min(orders.indexOf(o)+1,9)}`,
  ];
  if (o.t === 'charter') {
    const parts = o.route.split(' → ');
    params.push(`origin=${encodeURIComponent(parts[0]||'')}`, `dest=${encodeURIComponent(parts[1]||'')}`,
      `pkgTier=${encodeURIComponent(o.car.includes('·')?o.car.split('·')[1].trim():'尊享基础')}`,
      `pkgSpec=日租 · 8h/100km`, `price=2088`);
  } else {
    const p = o.route.startsWith('取车：') ? o.route.slice(3) : o.route.replace('已还车：','');
    params.push(`pickup=${encodeURIComponent(p)}`, `returnLoc=${encodeURIComponent('合肥滨湖会展中心')}`,
      `price=1500`);
  }
  uni.navigateTo({ url: `${url}?${params.join('&')}` });
};
const cancelOrder = (o: O, i: number) => {
  uni.showModal({ title:'取消订单', content:'确定要取消该订单吗？取消后将扣除相应违约金。', confirmText:'确认取消', cancelText:'暂不', confirmColor:'#FF4D4F',
    success: (r: any) => { if(r.confirm){ o.s='cancelled'; o.reason='主动取消'; } } });
};
const goPay = (o: O) => { uni.showToast({ title:'跳转支付', icon:'none' }); };
const takeCar = (o: O) => {
  uni.showModal({ title:'确认取车', content:'确认已收到车辆并检查车况无误？', confirmText:'确认取车', cancelText:'稍后',
    success: (r: any) => { if(r.confirm){ o.s='ongoing'; uni.showToast({ title:'已开始用车', icon:'none' }); } } });
};
const goInvoice = () => uni.navigateTo({ url:'/pages/invoice/index' });
const redoOrder = (o: O) => { uni.navigateTo({ url: o.t==='charter'?'/pages/charter/index':'/pages/rental/index' }); };
</script>

<style lang="scss" scoped>
.root { min-height: 100vh; background: #F9F9F9; }
.header { background: #F9F9F9; }
.hbar { height: 56px; padding: 0 24px; display: flex; align-items: center; gap: 16px; }
.hbar:active { opacity: 0.7; }
.hicon { font-size: 24px; color: #000; }
.htitle { font-size: 20px; font-weight: 700; color: #000; }

.body { padding: 20px 24px 40px; }

.search { height: 56px; background: #F2F2F2; border-radius: 24px; padding: 0 20px; display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.sicon { font-size: 20px; color: #86868B; }
.sinput { flex: 1; background: transparent; border: none; font-size: 15px; color: #1A1C1C; height: 100%; }
.sph { color: #86868B; }

.tabs { white-space: nowrap; margin-bottom: 20px; display: flex; }
.tab { display: inline-block; padding: 0 16px 12px; border-bottom: 2px solid transparent; }
.tab.on { border-color: #000; }
.tt { font-size: 13px; font-weight: 500; color: #86868B; }
.tab.on .tt { color: #000; font-weight: 700; }

.cards { display: flex; flex-direction: column; gap: 20px; }

.card { background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
.card:active { transform: scale(0.98); }
.card.dim { opacity: 0.85; }

.ch { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.ci { flex: 1; min-width: 0; }
.cg { display: inline-block; font-size: 11px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 8px; font-weight: 500; }
.cg.gold { background: rgba(212,175,55,0.15); color: #D4AF37; }
.cg.black { background: #000; color: #FFF; }
.cr { font-size: 20px; font-weight: 600; color: #000; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cs { font-size: 13px; font-weight: 600; flex-shrink: 0; margin-left: 12px; display: flex; align-items: center; gap: 4px; }
.cs.er { color: #FF4D4F; }
.cs.ok { color: #00B06B; }
.cs.wn { color: #D97706; }
.cs.bl { color: #0057FF; }
.sdot { width: 6px; height: 6px; background: #00B06B; border-radius: 50%; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

.cb { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.ln { display: flex; align-items: center; gap: 8px; }
.li { font-size: 18px; color: #86868B; }
.lt { font-size: 15px; color: #86868B; }

.al { padding: 12px; border-radius: 12px; display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.al.warn { background: rgba(217,119,6,0.06); }
.al.ok { background: rgba(0,176,107,0.06); }
.al.info { background: rgba(0,87,255,0.05); }
.al.err { background: rgba(255,77,79,0.05); }
.al.cancel { background: rgba(255,77,79,0.06); align-items: flex-start; }
.ai { font-size: 18px; flex-shrink: 0; margin-top: 0; }
.al.warn .ai { color: #D97706; }
.al.ok .ai { color: #00B06B; }
.al.info .ai { color: #0057FF; }
.al.err .ai { color: #FF4D4F; }
.al.cancel .ai { color: #93000A; }
.at { font-size: 13px; color: #1A1C1C; }
.al.warn .at { color: #92400E; }
.al.ok .at { color: #065F46; }
.al.info .at { color: #0057FF; }
.al.err .at { color: #FF4D4F; }
.al.cancel .at { color: #93000A; }
.at.bld { font-weight: 600; display: block; }
.at.sub { margin-top: 2px; opacity: 0.7; display: block; }
.ar { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.alf { display: flex; align-items: center; gap: 8px; }
.ae { font-size: 20px; font-weight: 600; color: #FF4D4F; }

.ca { display: flex; gap: 12px; }
.btn { flex: 1; height: 48px; border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; }
.btn:active { opacity: 0.8; }
.bf { background: #000; color: #FFF; }
.bo { border: 1px solid #F2F2F2; color: #1A1C1C; }
.bo.er { border-color: #FF4D4F; color: #FF4D4F; }
.wf { flex: none; width: 100%; }

.empty { display: flex; flex-direction: column; align-items: center; padding: 80px 0; }
.eico { font-size: 48px; color: #86868B; margin-bottom: 16px; }
.etx { font-size: 17px; color: #86868B; }
</style>
