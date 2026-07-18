<template>
  <view class="root">
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar" @click="back">
        <text class="material-symbols-outlined hicon">arrow_back</text>
        <text class="htitle">设置</text>
      </view>
    </view>

    <view class="body">
      <!-- 卡1: 头像/手机/邮箱 -->
      <view class="card">
        <view class="r" @click="tap('更换头像')">
          <text class="rl">头像</text>
          <view class="rr">
            <view class="av"><view class="avb" /></view>
            <text class="material-symbols-outlined ra">chevron_right</text>
          </view>
        </view>
        <view class="r" @click="showNameModal = true">
          <text class="rl">姓名</text>
          <view class="rr">
            <text class="rv">{{ userName || '未设置' }}</text>
            <text class="material-symbols-outlined ra">chevron_right</text>
          </view>
        </view>
        <view class="r rl1" @click="nav('/pages/profile/change-phone')">
          <text class="rl">手机号</text>
          <view class="rr">
            <text class="rv">138****8888</text>
            <text class="material-symbols-outlined ra">chevron_right</text>
          </view>
        </view>
      </view>

      <!-- 卡2: 清单/共享/导出/权限 -->
      <view class="card">
        <view class="r" @click="nav('/pages/profile/collection')">
          <text class="rl">个人信息收集清单</text>
          <text class="material-symbols-outlined ra">chevron_right</text>
        </view>
        <view class="r" @click="nav('/pages/profile/share')">
          <text class="rl">第三方信息共享清单</text>
          <text class="material-symbols-outlined ra">chevron_right</text>
        </view>
        <view class="r" @click="nav('/pages/profile/export-data')">
          <text class="rl">个人信息副本导出</text>
          <text class="material-symbols-outlined ra">chevron_right</text>
        </view>
        <view class="r rl1" @click="nav('/pages/profile/permission')">
          <text class="rl">个人信息权限管理</text>
          <text class="material-symbols-outlined ra">chevron_right</text>
        </view>
      </view>

      <!-- 注销账号 -->
      <view class="btn btn-danger" @click="nav('/pages/profile/deactivate')">
        <text class="bt bt-danger">注销账号</text>
      </view>

      <!-- 退出 -->
      <view class="btn" @click="logout">
        <text class="bt">退出登录</text>
      </view>

      <view class="sp" />
    </view>

    <!-- 姓名编辑弹窗 -->
    <view v-if="showNameModal" class="modal-mask" @click="showNameModal = false">
      <view class="modal-sheet" @click.stop>
        <text class="modal-title">修改姓名</text>
        <input
          v-model="nameInput"
          class="modal-input"
          maxlength="20"
          placeholder="请输入真实姓名（2-20位中文）"
          placeholder-class="modal-placeholder"
          :focus="true"
        />
        <view class="modal-actions">
          <view class="modal-btn cancel" @click="showNameModal = false">
            <text class="modal-btn-text">取消</text>
          </view>
          <view class="modal-btn confirm" @click="saveName">
            <text class="modal-btn-text white">保存</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const top = ref(0);

// 姓名维护
const userName = ref('');
const showNameModal = ref(false);
const nameInput = ref('');

onMounted(() => {
  const s = uni.getSystemInfoSync();
  top.value = s.statusBarHeight || 0;
  // 从缓存读取已保存的姓名
  userName.value = uni.getStorageSync('userName') || '';
});

const saveName = () => {
  const v = nameInput.value.trim();
  if (!v) { uni.showToast({ title: '请输入姓名', icon: 'none' }); return; }
  if (v.length < 2) { uni.showToast({ title: '姓名至少 2 个字', icon: 'none' }); return; }
  if (v.length > 20) { uni.showToast({ title: '姓名不超过 20 个字', icon: 'none' }); return; }
  if (!/^[一-龥a-zA-Z·]+$/.test(v)) { uni.showToast({ title: '姓名仅支持中文/英文/·', icon: 'none' }); return; }
  userName.value = v;
  uni.setStorageSync('userName', v);
  showNameModal.value = false;
  uni.showToast({ title: '姓名已保存', icon: 'success' });
};

const back = () => uni.navigateBack();
const tap = (m: string) => uni.showToast({ title: m, icon: 'none' });
const nav = (u: string) => uni.navigateTo({ url: u });
const logout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    confirmText: '退出',
    cancelText: '取消',
    success: (r: any) => { if (r.confirm) uni.reLaunch({ url: '/pages/login/index' }); },
  });
};
</script>

<style lang="scss" scoped>
.root { min-height: 100vh; background: #F9F9F9; }

.header { background: #F9F9F9; }
.hbar { height: 56px; padding: 0 24px; display: flex; align-items: center; gap: 16px; }
.hbar:active { opacity: 0.7; }
.hicon { font-size: 24px; color: #000; }
.htitle { font-size: 20px; font-weight: 700; color: #000; }

.body { padding: 8px 24px 40px; }

.card { background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; overflow: hidden; margin-bottom: 16px; }
.r { display: flex; align-items: center; justify-content: space-between; padding: 20px; border-bottom: 1px solid #F2F2F2; }
.r:active { background: #F2F2F2; }
.rl1 { border-bottom: none; }
.rl { font-size: 17px; color: #1A1C1C; flex-shrink: 0; }
.rv { font-size: 15px; color: #1A1C1C; }
.rvp { color: #1A1C1C; }
.rr { display: flex; align-items: center; gap: 8px; }
.ra { font-size: 18px; color: #86868B; }

.av { width: 48px; height: 48px; border-radius: 50%; overflow: hidden; border: 2px solid #F2F2F2; }
.avb { width: 100%; height: 100%; background: linear-gradient(135deg, #E8E8E8, #C6C6C7); }

.btn { height: 56px; background: #000; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin-top: 8px; }
.btn:active { opacity: 0.8; }
.bt { font-size: 20px; font-weight: 600; color: #FFF; }
.btn-danger { background: #FFF; border: 1px solid #FF4D4F; }
.btn-danger:active { background: #FFF1F0; }
.bt-danger { color: #FF4D4F; }

.sp { height: 40px; }

/* ===== 姓名弹窗 ===== */
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 999; display: flex; align-items: flex-end; justify-content: center; }
.modal-sheet { width: 100%; background: #FFF; border-radius: 32px 32px 0 0; padding: 32px 24px 48px; }
.modal-title { font-size: 20px; font-weight: 700; color: #1A1C1C; display: block; margin-bottom: 24px; }
.modal-input { width: 100%; height: 56px; background: #F2F2F2; border-radius: 24px; padding: 0 24px; font-size: 17px; color: #1A1C1C; margin-bottom: 24px; }
.modal-placeholder { color: #86868B; font-size: 15px; }
.modal-actions { display: flex; gap: 12px; }
.modal-btn { flex: 1; height: 48px; border-radius: 24px; display: flex; align-items: center; justify-content: center; }
.modal-btn:active { opacity: 0.8; }
.modal-btn.cancel { background: #F2F2F2; }
.modal-btn.confirm { background: #000; }
.modal-btn-text { font-size: 16px; font-weight: 600; color: #4C4546; }
.modal-btn-text.white { color: #FFF; }
</style>
