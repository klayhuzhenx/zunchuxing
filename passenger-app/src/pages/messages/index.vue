<template>
  <view class="root">
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar">
        <view class="hleft" @click="back">
          <text class="material-symbols-outlined hicon">arrow_back</text>
          <text class="htitle">消息中心</text>
        </view>
        <text class="hread" @click="markAllRead">全部已读</text>
      </view>
    </view>

    <view class="body">
      <view v-for="m in list" :key="m.id" class="card" :class="{ read: !m.unread }" @click="onTap(m)">
        <view class="ctop">
          <view class="ctags">
            <view class="tag" :class="'tag-'+m.type"><text class="ttx">{{ m.type==='charter'?'包车出行':'租车出行' }}</text></view>
            <view v-if="m.unread" class="dot" />
          </view>
          <text class="ctime">{{ m.time }}</text>
        </view>
        <text class="ctitle">{{ m.title }}</text>
        <text class="cdesc">{{ m.desc }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
const top = ref(0);
onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0; });
const back = () => uni.navigateBack();

const list = reactive([
  { id:'m1', type:'charter', title:'派车成功', desc:'您的订单已由苏A·88888 黑色迈巴赫承运，司机师傅正赶往出发地点...', time:'10分钟前', unread:true, linkTrip:'charter', linkStatus:'pending-assigned' },
  { id:'m2', type:'charter', title:'行程开始', desc:'您的8小时包车行程已正式开始，如需协助请联系专属管家。', time:'1小时前', unread:true, linkTrip:'charter', linkStatus:'ongoing' },
  { id:'m3', type:'rental', title:'还车成功', desc:'车辆验交手续已完成，押金将在3-7个工作日内原路退回。', time:'昨天', unread:false, linkTrip:'rental', linkStatus:'completed' },
  { id:'m4', type:'charter', title:'感谢您的选择', desc:'本次行程已圆满结束，期待与您的下一次尊贵相遇。', time:'3天前', unread:false, linkTrip:'charter', linkStatus:'completed' },
]);

const markAllRead = () => { list.forEach(m => m.unread = false); uni.showToast({ title:'全部已读', icon:'none' }); };

const onTap = (m: any) => {
  m.unread = false;
  const url = m.linkTrip === 'charter' ? '/pages/trips/detail-charter' : '/pages/trips/detail-rental';
  uni.navigateTo({ url: `${url}?status=${m.linkStatus}` });
};
</script>

<style lang="scss" scoped>
.root { min-height: 100vh; background: #F9F9F9; }
.header { position: sticky; top: 0; z-index: 50; background: #F9F9F9; }
.hbar { height: 56px; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; }
.hleft { display: flex; align-items: center; gap: 16px; }
.hleft:active { opacity: 0.7; }
.hicon { font-size: 24px; color: #000; }
.htitle { font-size: 20px; font-weight: 700; color: #000; }
.hread { font-size: 13px; font-weight: 500; color: #0057FF; }
.hread:active { opacity: 0.7; }

.body { padding: 24px 24px 40px; display: flex; flex-direction: column; gap: 16px; }

.card { background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; padding: 24px; }
.card:active { transform: scale(0.98); }
.card.read { opacity: 0.6; }

.ctop { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.ctags { display: flex; align-items: center; gap: 8px; }
.tag { padding: 4px 12px; background: #F2F2F2; border-radius: 9999px; }
.ttx { font-size: 11px; color: #86868B; }
.dot { width: 8px; height: 8px; background: #FF4D4F; border-radius: 50%; }
.ctime { font-size: 11px; color: #86868B; opacity: 0.6; flex-shrink: 0; }

.ctitle { font-size: 20px; font-weight: 600; color: #000; display: block; margin-bottom: 8px; }
.cdesc {
  font-size: 15px;
  color: #86868B;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}
</style>
