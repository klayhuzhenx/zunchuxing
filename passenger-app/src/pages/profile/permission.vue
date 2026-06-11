<template>
  <view class="page">
    <navbar title="个人信息权限管理" :show-back="true" />
    <scroll-view scroll-y class="main">
      <view class="card">
        <view class="item" v-for="(row, i) in list" :key="i" :class="{ 'item-last': i === list.length - 1 }">
          <view class="item-info">
            <text class="item-title">{{ row.title }}</text>
            <text class="item-desc">{{ row.desc }}</text>
          </view>
          <view class="item-switch" :class="{ on: row.enabled }" @click="row.enabled = !row.enabled">
            <view class="item-switch-knob" :class="{ on: row.enabled }" />
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import Navbar from '@/components/navbar.vue';
const list = reactive([
  { title: '位置信息', desc: '用于行程规划与上车点推荐', enabled: true },
  { title: '相机', desc: '用于驾驶证拍照上传', enabled: true },
  { title: '相册', desc: '用于头像与证件照片选取', enabled: true },
  { title: '通知', desc: '接收订单状态与活动推送', enabled: true },
]);
</script>

<style lang="scss" scoped>
.page { height: 100vh; background: #F9F9F9; display: flex; flex-direction: column; overflow: hidden; }
.main { flex: 1; height: 0; padding: 16px 24px 0; }
.card { background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; overflow: hidden; }
.item { display: flex; align-items: center; justify-content: space-between; padding: 20px; border-bottom: 1px solid #F2F2F2; gap: 16px; }
.item-last { border-bottom: none; }
.item-info { flex: 1; min-width: 0; }
.item-title { font-size: 17px; font-weight: 500; color: #1A1C1C; display: block; }
.item-desc { margin-top: 4px; font-size: 13px; color: #86868B; display: block; }
.item-switch { width: 48px; height: 28px; border-radius: 14px; background: #E2E2E2; display: flex; align-items: center; padding: 2px; flex-shrink: 0; transition: background 0.2s; }
.item-switch.on { background: #000; }
.item-switch-knob { width: 24px; height: 24px; border-radius: 50%; background: #FFF; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
.item-switch-knob.on { transform: translateX(20px); }
</style>
