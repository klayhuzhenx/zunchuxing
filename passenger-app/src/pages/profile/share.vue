<template>
  <view class="page">
    <navbar title="第三方信息共享清单" :show-back="true" />
    <scroll-view scroll-y class="main">
      <view class="card" v-for="(g, gi) in groups" :key="gi">
        <text class="group-title">{{ g.title }}</text>
        <view class="item" v-for="(row, ri) in g.items" :key="ri" :class="{ 'item-last': ri === g.items.length - 1 }">
          <text class="item-name">{{ row.name }}</text>
          <text class="item-desc">{{ row.desc }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import Navbar from '@/components/navbar.vue';
const groups = [
  { title: '支付服务', items: [
    { name: '财付通支付科技有限公司', desc: '微信支付通道，用于订单支付与退款' },
    { name: '支付宝（中国）网络技术有限公司', desc: '支付宝支付通道，用于订单支付与退款' },
  ]},
  { title: '地图与位置服务', items: [
    { name: '高德软件有限公司', desc: '地图展示、地址搜索、路线规划、实时位置' },
  ]},
  { title: '短信与通知', items: [
    { name: '阿里云计算有限公司', desc: '短信验证码发送、订单状态通知推送' },
  ]},
];
</script>

<style lang="scss" scoped>
.page { height: 100vh; background: #F9F9F9; display: flex; flex-direction: column; overflow: hidden; }
.main { flex: 1; height: 0; padding: 16px 24px 0; }
.card { background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; overflow: hidden; margin-bottom: 16px; padding: 20px; }
.group-title { font-size: 17px; font-weight: 600; color: #1A1C1C; display: block; margin-bottom: 12px; }
.item { padding: 14px 0; border-bottom: 1px solid #F2F2F2; }
.item-last { border-bottom: none; padding-bottom: 0; }
.item-name { font-size: 15px; font-weight: 500; color: #1A1C1C; display: block; }
.item-desc { margin-top: 4px; font-size: 13px; color: #86868B; display: block; }
</style>
