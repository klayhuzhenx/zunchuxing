<template>
  <view class="page">
    <view class="page-header" :style="{ paddingTop: statusBarHeight + 8 + 'px' }">
      <text class="page-title">电子发票</text>
    </view>

    <view class="list">
      <view v-if="invoices.length > 0" class="invoice-cards">
        <view v-for="inv in invoices" :key="inv.id" class="invoice-card">
          <view class="inv-top">
            <text class="inv-no">{{ inv.no }}</text>
            <text class="inv-status" :class="inv.statusClass">{{ inv.status }}</text>
          </view>
          <text class="inv-amount">¥{{ inv.amount.toLocaleString() }}</text>
          <text class="inv-date">{{ inv.date }}</text>

          <view class="inv-actions">
            <button
              v-for="action in inv.actions"
              :key="action"
              class="inv-btn"
              @click="handleAction(action, inv.id)"
            >
              {{ action }}
            </button>
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <text class="material-symbols-outlined empty-icon">description</text>
        <text class="empty-text">暂无发票记录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const statusBarHeight = ref(0);

const invoices = ref([
  {
    id: '1', no: 'INV20260601-001', status: '已开具', statusClass: 'done',
    amount: 4520, date: '2026-06-01',
    actions: ['重新发送', '下载'],
  },
  {
    id: '2', no: 'INV20260605-002', status: '开票中', statusClass: 'pending',
    amount: 2088, date: '2026-06-05',
    actions: ['取消申请'],
  },
  {
    id: '3', no: 'INV20260520-003', status: '已作废', statusClass: 'cancelled',
    amount: 1800, date: '2026-05-20',
    actions: ['重新开具'],
  },
]);

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 0;
});

const handleAction = (action: string, id: string) => {
  uni.showToast({ title: `${action} - ${id}`, icon: 'none' });
};
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
}

/* ===== 发票列表 ===== */
.list {
  padding: 16px 24px 40px;
}

.invoice-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.invoice-card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.inv-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.inv-no {
  font-size: 15px;
  font-weight: 600;
  color: #1D2129;
}

.inv-status {
  font-size: 13px;
  font-weight: 500;
}

.inv-status.done {
  color: #00B42A;
}

.inv-status.pending {
  color: #FF7D00;
}

.inv-status.cancelled {
  color: #C9CDD4;
}

.inv-amount {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  display: block;
  margin-bottom: 4px;
}

.inv-date {
  font-size: 13px;
  color: #86868B;
  display: block;
  margin-bottom: 12px;
}

.inv-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #F2F2F2;
}

.inv-btn {
  flex: 1;
  height: 36px;
  border-radius: 18px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #E5E6EB;
  background: #FFFFFF;
  color: #1D2129;
  line-height: 36px;
}

/* ===== 空状态 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 24px;
}

.empty-icon {
  font-size: 48px;
  color: #C9CDD4;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 15px;
  color: #C9CDD4;
}
</style>
