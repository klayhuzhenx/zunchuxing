<template>
  <view class="page">
    <!-- 页面头部 -->
    <view class="page-header" :style="{ paddingTop: statusBarHeight + 8 + 'px' }">
      <text class="page-title">企业管理</text>
      <text class="page-subtitle">{{ enterprise.name }}</text>
    </view>

    <!-- 额度概览 -->
    <view class="quota-cards">
      <view class="quota-item">
        <text class="quota-label">总额度</text>
        <text class="quota-value">¥{{ enterprise.totalQuota.toLocaleString() }}</text>
      </view>
      <view class="quota-item">
        <text class="quota-label">已使用</text>
        <text class="quota-value used">¥{{ enterprise.usedQuota.toLocaleString() }}</text>
      </view>
      <view class="quota-item">
        <text class="quota-label">剩余</text>
        <text class="quota-value remain">¥{{ (enterprise.totalQuota - enterprise.usedQuota).toLocaleString() }}</text>
      </view>
    </view>

    <!-- 员工管理 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">员工管理</text>
        <text class="section-action" @click="addEmployee">添加</text>
      </view>
      <view class="card-list">
        <view v-for="emp in employees" :key="emp.id" class="card-item">
          <view class="card-avatar">{{ emp.name.charAt(0) }}</view>
          <view class="card-info">
            <text class="card-name">{{ emp.name }}</text>
            <text class="card-sub">{{ emp.phone }} · {{ emp.dept }}</text>
          </view>
          <text class="material-symbols-outlined card-arrow">chevron_right</text>
        </view>
      </view>
    </view>

    <!-- 消费记录 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">消费记录</text>
        <text class="section-action" @click="filterRecords">筛选</text>
      </view>
      <view class="card-list">
        <view v-for="rec in records" :key="rec.id" class="record-item">
          <view class="record-left">
            <text class="record-emp">{{ rec.emp }}</text>
            <text class="record-scene">{{ rec.scene }}</text>
          </view>
          <text class="record-amount" :class="rec.type">
            {{ rec.type === 'consume' ? '-' : '+' }}¥{{ rec.amount.toLocaleString() }}
          </text>
        </view>
      </view>
    </view>

    <view class="safe-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const statusBarHeight = ref(0);

const enterprise = ref({
  name: '腾讯科技',
  totalQuota: 200000,
  usedQuota: 87650,
});

const employees = ref([
  { id: '1', name: '张先生', phone: '138****0000', dept: '行政部' },
  { id: '2', name: '李女士', phone: '139****1111', dept: '市场部' },
  { id: '3', name: '王先生', phone: '137****2222', dept: '技术部' },
]);

const records = ref([
  { id: '1', emp: '张先生', scene: '包车出行', amount: 2088, type: 'consume', date: '2026-06-08' },
  { id: '2', emp: '张先生', scene: '包车出行（退款）', amount: 500, type: 'refund', date: '2026-06-05' },
  { id: '3', emp: '李女士', scene: '租车出行', amount: 4500, type: 'consume', date: '2026-06-03' },
  { id: '4', emp: '王先生', scene: '包车出行', amount: 3480, type: 'consume', date: '2026-06-01' },
]);

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 0;
});

const addEmployee = () => uni.showToast({ title: '添加员工', icon: 'none' });
const filterRecords = () => uni.showToast({ title: '筛选记录', icon: 'none' });
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F5F5F5;
}

.page-header {
  background: #FFFFFF;
  padding: 16px 24px 8px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  display: block;
}

.page-subtitle {
  font-size: 14px;
  color: #86868B;
  margin-top: 4px;
  display: block;
}

/* ===== 额度卡片 ===== */
.quota-cards {
  background: #FFFFFF;
  margin: 16px 24px;
  border-radius: 24px;
  padding: 20px;
  display: flex;
}

.quota-item {
  flex: 1;
  text-align: center;
}

.quota-label {
  font-size: 12px;
  color: #86868B;
  display: block;
  margin-bottom: 4px;
}

.quota-value {
  font-size: 18px;
  font-weight: 700;
  color: #1D2129;
}

.quota-value.used {
  color: #F53F3F;
}

.quota-value.remain {
  color: #00B42A;
}

/* ===== 区域 ===== */
.section {
  padding: 8px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 24px 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
}

.section-action {
  font-size: 14px;
  color: #0057FF;
  font-weight: 500;
}

/* ===== 卡片列表 ===== */
.card-list {
  margin: 0 24px;
  background: #FFFFFF;
  border-radius: 20px;
  overflow: hidden;
}

.card-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #F2F2F2;
  gap: 12px;
}

.card-item:last-child {
  border-bottom: none;
}

.card-avatar {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: #F2F2F2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: #86868B;
  flex-shrink: 0;
}

.card-info {
  flex: 1;
}

.card-name {
  font-size: 15px;
  font-weight: 500;
  color: #1D2129;
  display: block;
}

.card-sub {
  font-size: 13px;
  color: #86868B;
  display: block;
  margin-top: 2px;
}

.card-arrow {
  font-size: 20px;
  color: #C9CDD4;
}

/* ===== 消费记录 ===== */
.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #F2F2F2;
}

.record-item:last-child {
  border-bottom: none;
}

.record-emp {
  font-size: 15px;
  color: #1D2129;
  display: block;
}

.record-scene {
  font-size: 12px;
  color: #86868B;
  margin-top: 2px;
  display: block;
}

.record-amount {
  font-size: 16px;
  font-weight: 600;
}

.record-amount.consume {
  color: #F53F3F;
}

.record-amount.refund {
  color: #00B42A;
}

.safe-bottom {
  height: 40px;
}
</style>
