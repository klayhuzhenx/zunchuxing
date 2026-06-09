<template>
  <view class="page">
    <!-- header -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-icon" @click="onBack">
        <text class="material-symbols-outlined">arrow_back</text>
      </view>
      <text class="header-title">搜索地址</text>
      <view class="header-icon" @click="onFocus">
        <text class="material-symbols-outlined">search</text>
      </view>
    </view>

    <scroll-view scroll-y class="main">
      <!-- 搜索框 -->
      <view class="search-wrap">
        <view class="search-box">
          <text class="material-symbols-outlined search-icon">search</text>
          <input
            v-model="keyword"
            class="search-input"
            placeholder="您想去哪儿？"
            placeholder-class="search-placeholder"
            confirm-type="search"
            :focus="autoFocus"
            @input="onInput"
          />
          <view v-if="keyword" class="search-clear" @click="keyword = ''">
            <text class="material-symbols-outlined clear-icon">cancel</text>
          </view>
        </view>
      </view>

      <!-- 地图选点入口（无搜索关键词时显示） -->
      <view v-if="!keyword" class="map-entry" @click="goMapPick">
        <view class="map-entry-left">
          <view class="map-icon-wrap">
            <text class="material-symbols-outlined map-icon">map</text>
          </view>
          <view class="map-entry-text">
            <text class="map-entry-title">地图选点</text>
            <text class="map-entry-desc">在地图上直接定位</text>
          </view>
        </view>
        <text class="material-symbols-outlined map-entry-arrow">chevron_right</text>
      </view>

      <!-- 搜索结果 -->
      <view v-if="keyword && filteredResults.length > 0" class="results">
        <view
          v-for="item in filteredResults"
          :key="item.id"
          class="result-item"
          @click="onPickItem(item)"
        >
          <text class="material-symbols-outlined result-icon">location_on</text>
          <view class="result-info">
            <text class="result-title" v-html="highlight(item.name)" />
            <text class="result-desc">{{ item.address }}</text>
          </view>
        </view>
      </view>

      <!-- 历史记录 -->
      <view v-if="!keyword" class="history">
        <view class="history-head">
          <text class="history-title">历史记录</text>
          <view v-if="history.length > 0" class="history-clear" @click="onClearHistory">
            <text class="history-clear-text">清除全部</text>
          </view>
        </view>

        <view v-if="history.length > 0" class="history-list">
          <view
            v-for="(h, i) in history"
            :key="i"
            class="history-item"
            @click="onPickItem(h)"
          >
            <text class="material-symbols-outlined history-icon">history</text>
            <view class="history-info">
              <view class="history-row">
                <text class="history-name">{{ h.name }}</text>
                <text class="history-time">{{ h.timeText }}</text>
              </view>
              <text class="history-addr">{{ h.address }}</text>
            </view>
          </view>
        </view>

        <view v-else class="history-empty">
          <text class="empty-text">暂无历史记录</text>
        </view>
      </view>

      <!-- 空结果 -->
      <view v-if="keyword && filteredResults.length === 0" class="no-result">
        <text class="material-symbols-outlined no-result-icon">search_off</text>
        <text class="no-result-text">未找到「{{ keyword }}」相关地址</text>
        <text class="no-result-hint">试试其他关键词或使用地图选点</text>
        <view class="no-result-btn" @click="goMapPick">
          <text class="no-result-btn-text">使用地图选点</text>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

type AddrItem = {
  id: string;
  name: string;
  address: string;
  timeText?: string;
};

const STORAGE_KEY_FIELD = 'address-pick-field';
const STORAGE_KEY_RESULT = 'address-pick-result';
const STORAGE_KEY_HISTORY = 'address-history';

const statusBarHeight = ref(0);
const keyword = ref('');
const autoFocus = ref(false);
const field = ref<'origin' | 'destination'>('destination');

/* 模拟地址库 */
const addressLib: AddrItem[] = [
  { id: 'a1', name: '上海虹桥国际机场 T2', address: '上海市闵行区虹桥路 2550 号' },
  { id: 'a2', name: '上海浦东国际机场 T2', address: '上海市浦东新区启航路 6000 号' },
  { id: 'a3', name: '上海半岛酒店', address: '上海市黄浦区中山东一路 32 号' },
  { id: 'a4', name: '外滩十八号', address: '上海市黄浦区中山东一路 18 号' },
  { id: 'a5', name: '上海宝格丽酒店', address: '上海市静安区河南北路 172 号' },
  { id: 'a6', name: '上海中心大厦', address: '上海市浦东新区银城中路 501 号' },
  { id: 'a7', name: '虹桥火车站', address: '上海市闵行区申长路 1500 号' },
  { id: 'a8', name: '上海南站', address: '上海市徐汇区沪闵路 9001 号' },
  { id: 'a9', name: '迪士尼度假区', address: '上海市浦东新区申迪西路 753 号' },
  { id: 'a10', name: '陆家嘴金融中心', address: '上海市浦东新区世纪大道 100 号' },
  { id: 'a11', name: '杭州市西湖区灵隐路 1 号', address: '杭州市西湖区灵隐路 1 号' },
  { id: 'a12', name: '苏州金鸡湖大酒店', address: '苏州市工业园区星汉街 168 号' },
];

const history = ref<AddrItem[]>([]);

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 0;
  loadHistory();
  /* H5 上 input 自动聚焦比较友好 */
  setTimeout(() => { autoFocus.value = true; }, 200);
});

onLoad((opts: Record<string, string> | undefined) => {
  if (opts?.field === 'origin' || opts?.field === 'destination') {
    field.value = opts.field;
  } else {
    /* 兼容 storage 方式 */
    const saved = uni.getStorageSync(STORAGE_KEY_FIELD);
    if (saved === 'origin' || saved === 'destination') {
      field.value = saved;
    }
  }
});

const loadHistory = () => {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY_HISTORY);
    if (Array.isArray(raw)) {
      history.value = raw;
    } else {
      /* 默认演示数据 */
      history.value = [
        { id: 'h1', name: '上海半岛酒店', address: '上海市黄浦区中山东一路 32 号', timeText: '昨天' },
        { id: 'h2', name: '陆家嘴金融中心', address: '上海市浦东新区世纪大道 100 号', timeText: '3 天前' },
        { id: 'h3', name: '上海浦东国际机场 T2', address: '上海市浦东新区启航路 6000 号', timeText: '上周' },
      ];
    }
  } catch (e) {
    history.value = [];
  }
};

const filteredResults = computed(() => {
  const k = keyword.value.trim();
  if (!k) return [];
  return addressLib.filter(
    (item) =>
      item.name.includes(k) || item.address.includes(k)
  );
});

const highlight = (text: string) => {
  const k = keyword.value.trim();
  if (!k) return text;
  return text.replace(new RegExp(k, 'g'), `<text style="color:#0057FF;">${k}</text>`);
};

const onInput = () => {
  /* 仅做关键词刷新，filteredResults 自动更新 */
};

const onFocus = () => {
  autoFocus.value = false;
  setTimeout(() => { autoFocus.value = true; }, 50);
};

const pushHistory = (item: AddrItem) => {
  const newItem: AddrItem = { ...item, timeText: '刚刚' };
  const existing = history.value.filter((h) => h.id !== item.id);
  const next = [newItem, ...existing].slice(0, 10);
  history.value = next;
  uni.setStorageSync(STORAGE_KEY_HISTORY, next);
};

const onPickItem = (item: AddrItem) => {
  pushHistory(item);
  uni.setStorageSync(STORAGE_KEY_RESULT, {
    field: field.value,
    name: item.name,
    address: item.address,
    pickedAt: '2026-06-09',
  });
  uni.navigateBack();
};

const onClearHistory = () => {
  uni.showModal({
    title: '清除历史记录',
    content: '确定要清除全部历史记录吗？',
    success: (res) => {
      if (res.confirm) {
        history.value = [];
        uni.removeStorageSync(STORAGE_KEY_HISTORY);
      }
    },
  });
};

const goMapPick = () => {
  uni.navigateTo({ url: `/pages/address/map?field=${field.value}` });
};

const onBack = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F9F9F9;
  display: flex;
  flex-direction: column;
}

/* ===== Header ===== */
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #F9F9F9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  flex-shrink: 0;
}

.header-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  .material-symbols-outlined {
    font-size: 22px;
    color: #000000;
  }

  &:active {
    opacity: 0.7;
  }
}

.header-title {
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
  color: #000000;
}

.main {
  flex: 1;
  min-height: 0;
}

.bottom-spacer {
  height: 40px;
}

/* ===== 搜索框 ===== */
.search-wrap {
  padding: 16px 24px 0;
}

.search-box {
  height: 56px;
  background: #F2F2F2;
  border-radius: 24px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-icon {
  font-size: 22px;
  color: #86868B;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 17px;
  line-height: 26px;
  color: #1A1C1C;
  height: 100%;
}

.search-placeholder {
  color: #86868B;
}

.search-clear {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  .clear-icon {
    font-size: 18px;
    color: #C9CDD4;
  }

  &:active .clear-icon {
    color: #86868B;
  }
}

/* ===== 地图选点入口 ===== */
.map-entry {
  margin: 32px 24px 0;
  padding: 20px;
  background: #FFFFFF;
  border: 1px solid #F2F2F2;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.98);
  }
}

.map-entry-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.map-icon-wrap {
  width: 48px;
  height: 48px;
  background: #000000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.map-icon {
  font-size: 22px;
  color: #FFFFFF;
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.map-entry-text {
  flex: 1;
  min-width: 0;
}

.map-entry-title {
  font-size: 17px;
  line-height: 26px;
  font-weight: 700;
  color: #000000;
  display: block;
}

.map-entry-desc {
  font-size: 13px;
  line-height: 18px;
  color: #86868B;
  display: block;
}

.map-entry-arrow {
  font-size: 22px;
  color: #86868B;
}

/* ===== 历史 ===== */
.history {
  margin-top: 40px;
  padding: 0 24px;
}

.history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.history-title {
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
  color: #000000;
}

.history-clear:active {
  opacity: 0.6;
}

.history-clear-text {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #0057FF;
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #E8E8E8;

  &:active {
    opacity: 0.7;
  }

  &:last-child {
    border-bottom: none;
  }
}

.history-icon {
  font-size: 20px;
  color: #86868B;
  margin-top: 4px;
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.history-name {
  flex: 1;
  font-size: 17px;
  line-height: 26px;
  font-weight: 500;
  color: #000000;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-time {
  flex-shrink: 0;
  font-size: 11px;
  line-height: 16px;
  color: #86868B;
}

.history-addr {
  margin-top: 4px;
  font-size: 13px;
  line-height: 18px;
  color: #86868B;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-empty {
  padding: 48px 0;
  text-align: center;
}

.empty-text {
  font-size: 13px;
  color: #86868B;
}

/* ===== 搜索结果 ===== */
.results {
  margin: 16px 24px 0;
  background: #FFFFFF;
  border: 1px solid #F2F2F2;
  border-radius: 24px;
  overflow: hidden;
}

.result-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #F2F2F2;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #F9F9F9;
  }
}

.result-icon {
  font-size: 22px;
  color: #0057FF;
  margin-top: 2px;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: 17px;
  line-height: 26px;
  font-weight: 500;
  color: #000000;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-desc {
  margin-top: 2px;
  font-size: 13px;
  line-height: 18px;
  color: #86868B;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== 无结果 ===== */
.no-result {
  margin: 80px 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.no-result-icon {
  font-size: 48px;
  color: #C9CDD4;
  margin-bottom: 8px;
}

.no-result-text {
  font-size: 17px;
  line-height: 26px;
  font-weight: 500;
  color: #1A1C1C;
}

.no-result-hint {
  font-size: 13px;
  line-height: 18px;
  color: #86868B;
  margin-bottom: 12px;
}

.no-result-btn {
  height: 44px;
  padding: 0 24px;
  background: #000000;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.85;
  }
}

.no-result-btn-text {
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
  color: #FFFFFF;
}
</style>
