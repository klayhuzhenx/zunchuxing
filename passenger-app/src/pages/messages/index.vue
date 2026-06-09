<template>
  <view class="page">
    <view class="page-header" :style="{ paddingTop: statusBarHeight + 8 + 'px' }">
      <view class="header-row">
        <text class="page-title">消息中心</text>
        <text class="header-action" @click="markAllRead">全部已读</text>
      </view>
    </view>

    <view v-if="messages.length > 0" class="list">
      <view
        v-for="msg in messages"
        :key="msg.id"
        class="message-card"
        :class="{ unread: !msg.read }"
        @click="readMessage(msg)"
      >
        <view v-if="!msg.read" class="msg-dot"></view>
        <view class="msg-content">
          <text class="msg-title">{{ msg.title }}</text>
          <text class="msg-desc">{{ msg.desc }}</text>
          <text class="msg-time">{{ msg.time }}</text>
        </view>
        <text class="material-symbols-outlined msg-arrow">chevron_right</text>
      </view>
    </view>

    <view v-else class="empty-state">
      <text class="material-symbols-outlined empty-icon">mail</text>
      <text class="empty-text">暂无消息</text>
    </view>

    <!-- 清空按钮 -->
    <view v-if="messages.length > 0" class="footer-actions">
      <button class="clear-btn" @click="clearAll">清空消息</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const statusBarHeight = ref(0);

const messages = ref([
  { id: '1', title: '派车成功', desc: '您的包车出行订单 ZC-20260608-001 已成功分配司机，司机将在约定时间到达上车地点。', time: '10分钟前', read: false },
  { id: '2', title: '行程即将开始', desc: '您预订的包车出行将于明天 07:00 从合肥南站出发，请提前做好准备。', time: '2小时前', read: false },
  { id: '3', title: '行程结束 · 待补款', desc: '您的包车出行已结束，因超出约定里程产生额外费用 ¥500.00，请尽快完成补款。', time: '3小时前', read: false },
  { id: '4', title: '感谢选择尊出行', desc: '您的行程已完成，感谢选择尊出行。期待再次为您服务。', time: '2天前', read: true },
  { id: '5', title: '企业额度调整通知', desc: '贵司的出行额度已由运营方调整，当前总额度为 ¥200,000.00。', time: '5天前', read: true },
]);

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 0;
});

const readMessage = (msg: any) => {
  msg.read = true;
  uni.showToast({ title: `查看: ${msg.title}`, icon: 'none' });
};

const markAllRead = () => {
  messages.value.forEach((m) => (m.read = true));
  uni.showToast({ title: '已全部标记为已读', icon: 'none' });
};

const clearAll = () => {
  messages.value = [];
  uni.showToast({ title: '消息已清空', icon: 'none' });
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

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
}

.header-action {
  font-size: 14px;
  color: #0057FF;
  font-weight: 500;
}

/* ===== 消息列表 ===== */
.list {
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.message-card.unread {
  background: #FAFAFA;
}

.msg-dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: #F53F3F;
  flex-shrink: 0;
  margin-top: 5px;
}

.msg-content {
  flex: 1;
  min-width: 0;
}

.msg-title {
  font-size: 16px;
  font-weight: 500;
  color: #1D2129;
  display: block;
  margin-bottom: 4px;
}

.msg-desc {
  font-size: 13px;
  color: #86868B;
  display: block;
  margin-bottom: 4px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.msg-time {
  font-size: 12px;
  color: #C9CDD4;
}

.msg-arrow {
  font-size: 20px;
  color: #C9CDD4;
  flex-shrink: 0;
  margin-top: 2px;
}

/* ===== 底部操作 ===== */
.footer-actions {
  padding: 24px;
}

.clear-btn {
  width: 100%;
  height: 48px;
  border-radius: 24px;
  font-size: 15px;
  border: 1px solid #E5E6EB;
  background: #FFFFFF;
  color: #F53F3F;
  line-height: 48px;
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
