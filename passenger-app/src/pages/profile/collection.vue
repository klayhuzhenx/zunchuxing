<template>
  <view class="page">
    <navbar title="个人信息收集清单" :show-back="true" />
    <scroll-view scroll-y class="main">
      <view class="card">
        <view class="item" v-for="(row, i) in list" :key="i" :class="{ 'item-last': i === list.length - 1 }">
          <view class="item-left">
            <text class="item-title">{{ row.title }}</text>
            <text class="item-desc">{{ row.desc }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import Navbar from '@/components/navbar.vue';
const list = [
  { title: '手机号', desc: '用于账号注册、登录与安全验证' },
  { title: '姓名', desc: '用于行程订单与实名认证' },
  { title: '身份证号', desc: '用于车主认证与合规审核' },
  { title: '邮箱', desc: '用于电子发票与重要通知' },
  { title: '位置信息', desc: '用于行程规划、导航与上车点推荐' },
];
</script>

<style lang="scss" scoped>
.page { height: 100vh; background: #F9F9F9; display: flex; flex-direction: column; overflow: hidden; }
.main { flex: 1; height: 0; padding: 16px 24px 0; }
.card { background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; overflow: hidden; }
.item { padding: 20px; border-bottom: 1px solid #F2F2F2; }
.item-last { border-bottom: none; }
.item-title { font-size: 17px; font-weight: 500; color: #1A1C1C; display: block; }
.item-desc { margin-top: 4px; font-size: 13px; color: #86868B; display: block; }
</style>
