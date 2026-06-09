<template>
  <view class="page">
    <!-- 页面头部 -->
    <view class="page-header" :style="{ paddingTop: statusBarHeight + 8 + 'px' }">
      <text class="page-title">我的行程</text>
    </view>

    <!-- 状态 Tab -->
    <scroll-view scroll-x class="tab-bar" :show-scrollbar="false" enhanced>
      <text
        v-for="t in tabs"
        :key="t.key"
        class="tab-item"
        :class="{ active: activeTab === t.key }"
        @click="activeTab = t.key"
      >
        {{ t.label }}
      </text>
    </scroll-view>

    <!-- 订单列表 -->
    <view class="list">
      <view v-if="filteredTrips.length > 0" class="trip-cards">
        <view
          v-for="trip in filteredTrips"
          :key="trip.id"
          class="trip-card"
        >
          <view class="card-top">
            <text class="trip-tag" :class="trip.type">{{ trip.typeLabel }}</text>
            <text class="trip-status" :class="trip.statusClass">{{ trip.status }}</text>
          </view>
          <text class="trip-route">{{ trip.from }} → {{ trip.to }}</text>
          <view class="trip-meta">
            <text>{{ trip.date }}</text>
            <text class="trip-amount">¥{{ trip.price.toLocaleString() }}</text>
          </view>

          <!-- 操作按钮 -->
          <view v-if="trip.actions && trip.actions.length > 0" class="trip-actions">
            <button
              v-for="(action, idx) in trip.actions"
              :key="action"
              class="action-btn"
              :class="{ primary: idx === trip.actions.length - 1 }"
              @click="handleAction(action, trip.id)"
            >
              {{ action }}
            </button>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="material-symbols-outlined empty-icon">receipt_long</text>
        <text class="empty-text">暂无相关行程</text>
      </view>
    </view>

    <view class="safe-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const statusBarHeight = ref(0);

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'unpaid', label: '待支付' },
  { key: 'pending', label: '待派车' },
  { key: 'ongoing', label: '行程中' },
  { key: 'done', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

const activeTab = ref('all');

const allTrips = ref([
  {
    id: '1', type: 'charter', typeLabel: '包车出行',
    status: '待支付', statusClass: 'unpaid',
    from: '合肥南站', to: '石门路', date: '06-08',
    price: 2088, tab: 'unpaid',
    actions: ['取消', '去支付'],
  },
  {
    id: '2', type: 'charter', typeLabel: '包车出行',
    status: '待补款', statusClass: 'extra',
    from: '半岛酒店', to: '浦东机场', date: '06-05',
    price: 4520, tab: 'unpaid',
    actions: ['补款'],
  },
  {
    id: '3', type: 'charter', typeLabel: '包车出行',
    status: '待派车', statusClass: 'pending',
    from: '天鹅湖', to: '骆岗公园', date: '06-10',
    price: 6264, tab: 'pending',
    actions: ['取消'],
  },
  {
    id: '4', type: 'charter', typeLabel: '包车出行',
    status: '行程中', statusClass: 'ongoing',
    from: '政务中心', to: '会展中心', date: '06-09',
    price: 2088, tab: 'ongoing',
    actions: [],
  },
  {
    id: '5', type: 'charter', typeLabel: '包车出行',
    status: '已完成', statusClass: 'done',
    from: '半岛酒店', to: '浦东机场', date: '06-01',
    price: 4520, tab: 'done',
    actions: ['评价', '开发票'],
  },
  {
    id: '6', type: 'rental', typeLabel: '租车出行',
    status: '已完成', statusClass: 'done',
    from: '政务中心', to: '翡翠路', date: '06-03',
    price: 4500, tab: 'done',
    actions: ['评价', '开发票'],
  },
  {
    id: '7', type: 'charter', typeLabel: '包车出行',
    status: '已取消', statusClass: 'cancelled',
    from: '滨湖新区', to: '南京南站', date: '05-28',
    price: 4176, tab: 'cancelled',
    actions: [],
  },
]);

const filteredTrips = computed(() => {
  if (activeTab.value === 'all') return allTrips.value;
  return allTrips.value.filter((t) => t.tab === activeTab.value);
});

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 0;
});

const handleAction = (action: string, id: string) => {
  uni.showToast({ title: `${action} - 订单${id}`, icon: 'none' });
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F5F5F5;
}

/* ===== 页面头部 ===== */
.page-header {
  background: #FFFFFF;
  padding: 16px 24px 4px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
}

/* ===== Tab 栏 ===== */
.tab-bar {
  white-space: nowrap;
  padding: 16px 24px;
  background: #FFFFFF;
}

.tab-item {
  display: inline-block;
  font-size: 14px;
  color: #86868B;
  padding: 8px 18px;
  margin-right: 8px;
  border-radius: 20px;
  background: #F2F2F2;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tab-item.active {
  background: #000000;
  color: #FFFFFF;
}

/* ===== 卡片列表 ===== */
.list {
  padding: 16px 24px 40px;
}

.trip-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.trip-card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.card-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.trip-tag {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.trip-tag.charter {
  background: rgba(212, 175, 55, 0.15);
  color: #D4AF37;
}

.trip-tag.rental {
  background: rgba(0, 0, 0, 0.08);
  color: #000000;
}

.trip-status {
  font-size: 13px;
  font-weight: 500;
}

.trip-status.unpaid { color: #FF7D00; }
.trip-status.extra { color: #F53F3F; }
.trip-status.pending { color: #0057FF; }
.trip-status.ongoing { color: #00B42A; }
.trip-status.done { color: #86868B; }
.trip-status.cancelled { color: #C9CDD4; }

.trip-route {
  font-size: 17px;
  font-weight: 600;
  color: #000000;
  display: block;
  margin-bottom: 8px;
}

.trip-meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #86868B;
  margin-bottom: 4px;
}

.trip-amount {
  font-weight: 500;
  color: #1D2129;
}

/* ===== 操作按钮 ===== */
.trip-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px solid #F2F2F2;
}

.action-btn {
  flex: 1;
  height: 40px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid #E5E6EB;
  background: #FFFFFF;
  color: #1D2129;
  line-height: 40px;
}

.action-btn.primary {
  background: #000000;
  color: #FFFFFF;
  border-color: #000000;
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

.safe-bottom {
  height: env(safe-area-inset-bottom, 0px);
}
</style>
