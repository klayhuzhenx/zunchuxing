<template>
  <view class="root">
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar" @click="back">
        <text class="material-symbols-outlined hicon">arrow_back</text>
        <text class="htitle">额度消费记录</text>
      </view>
    </view>

    <view class="body">
      <!-- 总额卡 -->
      <view class="total">
        <view class="tglow" />
        <view class="tz">
          <text class="tl">本月总消费（元）</text>
          <text class="tv">12,480.00</text>
        </view>
      </view>

      <!-- 搜索 + 日期 -->
      <view class="filters">
        <view class="search">
          <text class="material-symbols-outlined sicon">search</text>
          <input class="sinput" placeholder="搜索订单号或员工姓名" placeholder-class="sph" />
        </view>
        <view class="date" @click="tap('选择日期范围')">
          <text class="material-symbols-outlined dicon">calendar_today</text>
          <text class="dval">2023-10-01 至 2023-10-31</text>
          <text class="material-symbols-outlined darr">expand_more</text>
        </view>
      </view>

      <!-- 记录列表 -->
      <view class="list">
        <view v-for="(r, i) in records" :key="i" class="card">
          <view class="cleft">
            <view class="cicon">
              <text class="material-symbols-outlined cit">{{ r.icon }}</text>
            </view>
            <view class="cinfo">
              <text class="ctitle">{{ r.title }}</text>
              <text class="cmeta">{{ r.staff }} | 订单号: {{ r.order }}</text>
              <text class="cdate">{{ r.date }}</text>
            </view>
          </view>
          <text class="camount">-{{ r.amount }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const top = ref(0);
onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0; });
const back = () => uni.navigateBack();
const tap = (m: string) => uni.showToast({ title: m, icon: 'none' });
const records = [
  { icon: 'directions_car', title: '包车出行', staff: '王某某', order: 'P20260610001', date: '2026-06-10 18:45', amount: '6,264.00' },
  { icon: 'vpn_key', title: '租车出行', staff: '李某某', order: 'P20260512002', date: '2026-05-12 09:30', amount: '850.00' },
];
</script>

<style lang="scss" scoped>
.root { min-height: 100vh; background: #F9F9F9; }
.header { background: #F9F9F9; }
.hbar { height: 56px; padding: 0 24px; display: flex; align-items: center; gap: 16px; }
.hbar:active { opacity: 0.7; }
.hicon { font-size: 24px; color: #000; }
.htitle { font-size: 20px; font-weight: 700; color: #000; }

.body { padding: 20px 24px 40px; }

.total { position: relative; background: #000; border-radius: 32px; padding: 24px; overflow: hidden; margin-bottom: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
.tglow { position: absolute; top: -48px; right: -48px; width: 192px; height: 192px; background: rgba(212,175,55,0.1); border-radius: 50%; filter: blur(48px); }
.tz { position: relative; z-index: 1; }
.tl { font-size: 13px; color: rgba(255,255,255,0.6); display: block; margin-bottom: 4px; }
.tv { font-size: 24px; font-weight: 600; color: #FFF; display: block; }

.filters { margin-bottom: 20px; display: flex; flex-direction: column; gap: 12px; }
.search { height: 48px; background: #FFF; border: 1px solid #F2F2F2; border-radius: 9999px; padding: 0 20px; display: flex; align-items: center; gap: 12px; }
.sicon { font-size: 18px; color: #86868B; }
.sinput { flex: 1; background: transparent; border: none; font-size: 13px; color: #1A1C1C; }
.sph { color: #86868B; }
.date { height: 48px; background: #FFF; border: 1px solid #F2F2F2; border-radius: 9999px; padding: 0 20px; display: flex; align-items: center; gap: 8px; }
.date:active { background: #F2F2F2; }
.dicon { font-size: 18px; color: #86868B; }
.dval { flex: 1; font-size: 13px; color: #000; }
.darr { font-size: 18px; color: #86868B; }

.list { display: flex; flex-direction: column; gap: 12px; }
.card { background: #FFF; border: 1px solid #F2F2F2; border-radius: 24px; padding: 20px; display: flex; align-items: flex-start; justify-content: space-between; }
.cleft { display: flex; gap: 16px; flex: 1; min-width: 0; }
.cicon { width: 48px; height: 48px; background: #F2F2F2; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cit { font-size: 24px; color: #000; }
.cinfo { flex: 1; min-width: 0; }
.ctitle { font-size: 17px; font-weight: 600; color: #000; display: block; }
.cmeta { font-size: 13px; color: #86868B; display: block; margin-top: 4px; }
.cdate { font-size: 11px; color: #86868B; display: block; margin-top: 4px; }
.camount { font-size: 20px; font-weight: 600; color: #FF4D4F; flex-shrink: 0; margin-left: 12px; }
</style>
