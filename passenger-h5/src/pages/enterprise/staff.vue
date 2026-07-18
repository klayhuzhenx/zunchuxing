<template>
  <view class="root">
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar">
        <view class="hleft" @click="back">
          <text class="material-symbols-outlined hicon">arrow_back</text>
          <text class="htitle">员工管理</text>
        </view>
        <text class="add" @click="nav('/pages/enterprise/add-staff')">+ 添加员工</text>
      </view>
    </view>

    <view class="body">
      <view class="search">
        <text class="material-symbols-outlined sicon">search</text>
        <input class="sinput" placeholder="搜索员工姓名或手机号" placeholder-class="sph" />
      </view>

      <text class="count">共 {{ list.length }} 位成员</text>

      <view class="cards">
        <view v-for="(s, i) in list" :key="i" class="card">
          <view class="cleft">
            <view class="av" :class="{ admin: s.admin }">
              <text class="material-symbols-outlined avt">person</text>
            </view>
            <view class="cinfo">
              <text class="cname">{{ s.name }}</text>
              <text class="crole">{{ s.admin ? '管理员' : '员工' }} · {{ s.phone }}</text>
            </view>
          </view>
          <view v-if="s.admin" class="tag"><text class="tt">管理员</text></view>
          <text v-else class="del" @click="onDel(i)">删除</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
const top = ref(0);
onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0; });
const list = reactive([
  { name: '王某某', phone: '138****8888', admin: true },
  { name: '李某某', phone: '139****9999', admin: false },
  { name: '赵某某', phone: '137****7777', admin: false },
  { name: '孙某某', phone: '136****6666', admin: false },
]);
const back = () => uni.navigateBack();
const nav = (u: string) => uni.navigateTo({ url: u });
const onDel = (i: number) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要移除该员工吗？移除后将无法恢复',
    confirmText: '确认删除',
    cancelText: '取消',
    confirmColor: '#FF4D4F',
    success: (r: any) => { if (r.confirm) { list.splice(i, 1); uni.showToast({ title: '已删除', icon: 'none' }); } },
  });
};
</script>

<style lang="scss" scoped>
.root { min-height: 100vh; background: #F9F9F9; }
.header { background: #F9F9F9; }
.hbar { height: 56px; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; }
.hleft { display: flex; align-items: center; gap: 16px; }
.hleft:active { opacity: 0.7; }
.hicon { font-size: 24px; color: #000; }
.htitle { font-size: 20px; font-weight: 700; color: #000; }
.add { font-size: 13px; font-weight: 500; color: #0057FF; }
.add:active { opacity: 0.7; }

.body { padding: 20px 24px 40px; }
.search { height: 56px; background: #F2F2F2; border-radius: 24px; padding: 0 20px; display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.sicon { font-size: 20px; color: #86868B; }
.sinput { flex: 1; background: transparent; border: none; font-size: 15px; color: #1A1C1C; height: 100%; }
.sph { color: #86868B; }

.count { font-size: 13px; color: #86868B; padding: 0 8px; display: block; margin-bottom: 12px; }

.cards { display: flex; flex-direction: column; gap: 12px; }
.card { background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; padding: 24px; display: flex; align-items: center; justify-content: space-between; }
.card:active { transform: scale(0.98); }
.cleft { display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0; }
.av { width: 48px; height: 48px; border-radius: 50%; background: #F2F2F2; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.av.admin { background: #000; }
.avt { font-size: 24px; color: #86868B; }
.av.admin .avt { color: #FFF; }
.cinfo { flex: 1; min-width: 0; }
.cname { font-size: 17px; font-weight: 600; color: #000; display: block; }
.crole { font-size: 11px; color: #86868B; display: block; margin-top: 2px; }

.tag { padding: 4px 12px; background: #F2F2F2; border-radius: 9999px; }
.tt { font-size: 11px; color: #86868B; }
.del { font-size: 13px; font-weight: 500; color: #FF4D4F; }
.del:active { opacity: 0.7; }
</style>
