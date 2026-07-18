<template>
  <view class="page" :style="{ paddingTop: statusBarHeight + 'px' }">
    <!-- 顶部 Header -->
    <view class="header">
      <view class="header-row">
        <text class="header-time">{{ currentTime }}</text>
        <view class="header-signal">
          <view class="signal-bars">
            <view class="bar" style="height:4px" /><view class="bar" style="height:6px" />
            <view class="bar" style="height:8px" /><view class="bar" style="height:10px" />
          </view>
          <text class="signal-label">5G</text>
          <view class="battery"><view class="battery-fill" /><view class="battery-cap" /></view>
        </view>
      </view>
      <text class="header-title">服务</text>
    </view>

    <!-- 主内容 -->
    <scroll-view scroll-y class="main">
      <!-- 服务门店 -->
      <view class="section">
        <view class="section-head">
          <text class="section-title">服务门店</text>
          <text class="section-more">更多 <text class="more-arrow">></text></text>
        </view>
        <view class="store-card">
          <image class="store-img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8pBRssEZzF7L5g9T3WJuh1bb1cKHHuOURFFMICo1STfJ91lVoaTWMDlLd_UlsLxTa5Q4ONQxCHEdkhckl1Boxe5TwW0YSUAkb93lGNTYiMM7IyLT083FxfjCeBNo2JCUDdfBCUD6IZwY832bmgAOQPVK_-tpZsV_UOLhSetjeE9CnlKU4WvtkOr5V0a0udzcOeHTLx0CpyQP9DEC-06nDIxftFVQEqrI2r9nfq7pSCVxKwhmEw62N0Lb-kSpuF40FjkIaBbV59ewh" mode="aspectFill" />
          <view class="store-info">
            <view class="store-text">
              <text class="store-name">鸿蒙智行智界用户中心·合肥永丰汽车城</text>
              <text class="store-addr">安徽省合肥市经济技术开发区临湖社区宿松路与卧云路交叉口西南角6772号永丰汽配工业园C型厂房</text>
            </view>
            <view class="store-dist">
              <text class="material-symbols-outlined dist-icon">flag</text>
              <text class="dist-text">2.91km</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 更多服务 -->
      <view class="section">
        <text class="section-title">更多服务</text>
        <view class="service-grid">
          <view class="service-item"><image class="service-icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9eOee0lQ1MCofJdkfN4nztSxpE6F_E1sVxownzNlqU6FMIQ04yBe68ME0_oCSHxNWajSpgfV1mz5Kb_Jd8_Of8D6bxbwpZa7lqru1Z98WEGZ0yXclR_D8AC4hO5gT9oGltQHAJNbA-ExXahG1nl0sMD8CdPqprCugmjSCY61X5ztvunnESJWReXiXvmJRNzCwORHH-EnI63RNU65V4bjjidrAvsSZmRAgKdTbI0iXXLWw9Nt87IFL2uYJdHTEFtGW27iYpRy2-FIa" mode="aspectFit" /><text class="service-label">道路救援</text></view>
          <view class="service-item"><image class="service-icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSq5NdAoX7-OaJW68O_d2H4y3pHkg6_KVUHxCaCREMjJyQZDxqs38LiaWNtheGw4BhTk8Zl5IsAMm6o7MwuCB_9s6fWU1p7UJvzS1lAgiIiZih3OJk8wSy9Qm2aSgHR9TKwgxlYyldMRystgk1N_2JzQ43cuKgB9hEOIv6lPDzYTFGKIK4IlvEh_xq6hyaDLa-kqx1fAdN7fQd7UHZIAefUrMWDaurgSR3gnTEHZjkga0kR3WA5CU13pzdLVl81dQVNK0KyZxNmWfb" mode="aspectFit" /><text class="service-label">预约试驾</text></view>
          <view class="service-item"><image class="service-icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaaRoTrahdvIKddELscpU673WAB-9RRZ338fT7dGpc2x0HzbESIJaWyc5zSnqX0JegSFIqD3-hYLqgTqGA5RbOQLWvqHSzQGJBVZgwry-dUR-r4dyYuuMRKIlaW2pDk6XdeCqO5NJWYUyyhrSQhsj9UEQ94zW52W9Qr8HFrHCTgzyijxHCWMF35rtWxK46L0ZSZKh8RU9PbBN-LHi0RRWAFpJ3cbnRxJ-TuRP_BiyuLoSKNqUXRhEJ5v2jXhCvbQ9PP2FTXBxE4Iw_" mode="aspectFit" /><text class="service-label">体验中心</text></view>
          <view class="service-item"><image class="service-icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKCp3gP-AAg9mPxC2QXrf8i14pqunlPO2mSKZT42QFo6kulDbTj9F6zbf8duMH6b7TPSSiRRqR3mz3tlmmdJEirym8X6e9kWPyKzWs8S2mqw4Psx2REDGSWqHMTmk_CfwQROA6qbiN9QCS_MVs8vp95ws9i490_L4PdByzoJFV_Ox9pg4sVa2K4lAUcguM619-sIWS6lTtrpGojvYaKJxbdcWX2GWnE2gD2wg8OUritfe7ELkkQSDwAHQRHVOMlxQgzs7KE0Bx5cjf" mode="aspectFit" /><text class="service-label">智选购车</text></view>
          <view class="service-item"><image class="service-icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJ1gRiecF0CAq9QKRUqk9HvzQql1vEFVwgQI_qql9-j4lEcUQFexMLkgNK08j5f-i_8oITmMMGUchezQC-UFZepFxrka-GRZvFAg3fPTs3gQUcIVlT1Q4oSPS9dSg57Do4qSG62wpcQHnt07T-4g4FBln3N5E-MO6pkvGwCnLYl6qK1CCwnjYcClaRYqPL6AK9qMfJQk4tji88B7I3w4azcMJGUz3yzfawkUbEmDCfHxEiOcqTvBbSbCDVyrXlHWrGA68xQHflSsqP" mode="aspectFit" /><text class="service-label">金融试算器</text></view>
          <view class="service-item"><image class="service-icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaF6c9fXDb57DnkQDxHjzru7kCKA69CUqlmaUve_A5CsAGlmqIxWf_UNcNZ2DpM1IP2zoYwBn1IHhCJygwahRSyRTgOOiOVTOt6gIPgPspDNp-P-_MJaIjWnKHRxaSZ7yMvhlD_zFKZFPbtH-Uv2qJtd8qvBeM_euy2lO6xZcY2Sd5sK9NwhifPAm_lPqec-cNFbJtiPPN19Lnpjo48rv_PwDp2G9Qm5KIuDwhWjCerEQNDmnkKBmlPFNURB7bxHrNBBwU6BsUIc7_" mode="aspectFit" /><text class="service-label">我的家充桩</text></view>
          <view class="service-item"><image class="service-icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDN2Kgoac9t9TYkUc9ZeYAIzvD0zaF_j5HOqs66XCZiMBpjSWBBs85g6rb2w3dwzh-b8n6Mv_2dRcrzekzjerzg_xxFVexgBLNcuBO-EYcYVeqw11Aiijq0imBWZyPDMfDUU3FM03f8lG4B3ikj1S9jMR6wNxef76zXJyzgxmOgA83ixF1gM4q_agPs-L-rEI7s5-rLg-0F9zVwjcvoEJQkUrA0GTZwaWrUDd4dGt0mfhv1ubSPY-EwGABt2thc7m86vMm2M6_R3L70" mode="aspectFit" /><text class="service-label">置换服务</text></view>
          <view class="service-item"><image class="service-icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPmtLLB8UuQR3gZhY2TYyln24_HcE72gpZvB_KMoLSefUmeM_LCFm3eF8TEiOgB_YzJZR06jgYRx4UQDnyKVJodLeD6QY6oTGX2wFkY0YQPrPpgtE90-tRkBYeK59qpXH_inXYWLHrFGEafsxzSFwSiYu4X-JJiXJn0PjkhCo0NPkN2dIVSfb8jKh-q849c5XSDSBGhfV0SytF7F5OQX8apAAjW2nDJkWXmoUDKcfE3BRw4kQiZ7TIu_h-7tfjOFQysTBjEq9tdSiX" mode="aspectFit" /><text class="service-label">车主指南</text></view>
          <!-- 尊出行入口 -->
          <view class="service-item service-item-zun" @click="onEnterZun">
            <view class="service-icon-zun"><text class="material-symbols-outlined zun-car">directions_car</text></view>
            <text class="service-label service-label-zun">尊出行</text>
          </view>
        </view>
      </view>
      <view class="bottom-spacer" />
    </scroll-view>

    <!-- 底部导航 -->
    <view class="bottom-nav">
      <view class="nav-item"><text class="material-symbols-outlined nav-icon muted">explore</text><text class="nav-label muted">发现</text></view>
      <view class="nav-item"><text class="material-symbols-outlined nav-icon muted">apps</text><text class="nav-label muted">精选</text></view>
      <view class="nav-item"><text class="material-symbols-outlined nav-icon muted">shopping_bag</text><text class="nav-label muted">购车</text></view>
      <view class="nav-item active"><text class="material-symbols-outlined nav-icon">favorite</text><text class="nav-label">服务</text></view>
      <view class="nav-item"><text class="material-symbols-outlined nav-icon muted">person</text><text class="nav-label muted">我的</text></view>
    </view>

    <!-- 尊出行 · 用户协议弹窗 -->
    <view class="zun-overlay" v-if="showZunSheet" @click="onDecline">
      <view class="zun-sheet" @click.stop>
        <view class="zun-handle"><view class="zun-handle-bar" /></view>
        <text class="zun-title">用户隐私协议</text>
        <scroll-view scroll-y class="zun-body">
          <text class="zun-text">
欢迎使用尊出行高端出行服务平台。{'\n\n'}
一、服务条款的接受{'\n'}
1.1 本协议是您与尊出行平台之间关于使用尊出行服务所订立的协议。{'\n'}
1.2 您在使用尊出行服务前，请务必仔细阅读并充分理解本协议各条款内容。{'\n\n'}
二、服务内容{'\n'}
2.1 尊出行提供包括但不限于包车出行、租车出行等高端出行服务。{'\n\n'}
三、用户账号{'\n'}
3.1 您通过手机号验证或企业账号登录后，即成为尊出行注册用户。{'\n\n'}
四、隐私保护{'\n'}
4.1 尊出行重视用户个人信息保护，详情请参阅《隐私政策》。{'\n\n'}
五、免责声明{'\n'}
5.1 尊出行不对因不可抗力或第三方原因造成的服务中断承担责任。
          </text>
        </scroll-view>
        <view class="zun-actions">
          <view class="zun-btn-cancel" @click="onDecline"><text class="zun-btn-text">不同意</text></view>
          <view class="zun-btn-confirm" @click="onAgree"><text class="zun-btn-text confirm">同意并进入</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const statusBarHeight = ref(0);
const currentTime = ref('3:15');
const showZunSheet = ref(false);

onMounted(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 0;
  const now = new Date(); currentTime.value = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
});

const onEnterZun = () => { showZunSheet.value = true; };
const onAgree = () => {
  showZunSheet.value = false;
  uni.setStorageSync('agreement_accepted', 'true');
  uni.reLaunch({ url: '/pages/index/index' });
};
const onDecline = () => { showZunSheet.value = false; };
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #F7F7F7; display: flex; flex-direction: column; overflow: hidden; }
.header { padding: 8px 24px 16px; flex-shrink: 0; }
.header-row { display: flex; justify-content: space-between; align-items: center; height: 40px; margin-bottom: 16px; }
.header-time { font-size: 15px; font-weight: 600; color: #000; }
.header-signal { display: flex; align-items: center; gap: 6px; }
.signal-bars { display: flex; align-items: flex-end; gap: 2px; height: 12px; }
.signal-bars .bar { width: 2px; background: #000; border-radius: 1px; }
.signal-label { font-size: 12px; font-weight: 700; color: #000; }
.battery { width: 24px; height: 12px; border-radius: 3px; border: 1px solid #000; padding: 2px; display: flex; align-items: center; margin-left: 2px; }
.battery-fill { width: 18px; height: 6px; background: #000; border-radius: 1px; }
.battery-cap { width: 3px; height: 4px; background: #000; border-radius: 0 2px 2px 0; }
.header-title { font-size: 36px; font-weight: 700; color: #000; }
.main { flex: 1; }
.section { padding: 24px 24px 0; }
.section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-title { font-size: 20px; font-weight: 600; color: #000; }
.section-more { font-size: 14px; color: #0057FF; }
.more-arrow { font-size: 12px; }
.store-card { background: #FFF; border-radius: 16px; overflow: hidden; }
.store-img { width: 100%; height: 160px; }
.store-info { padding: 16px; display: flex; gap: 12px; }
.store-text { flex: 1; }
.store-name { font-size: 16px; font-weight: 600; color: #000; display: block; }
.store-addr { font-size: 12px; color: #86868B; margin-top: 4px; display: block; line-height: 1.4; }
.store-dist { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.dist-icon { font-size: 14px; color: #1BA854; }
.dist-text { font-size: 13px; color: #1BA854; }
.service-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.service-item { width: calc(25% - 9px); display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px 4px; }
.service-icon { width: 44px; height: 44px; }
.service-label { font-size: 11px; color: #4C4546; }
.service-item-zun { background: #F2F2F2; border-radius: 12px; }
.service-icon-zun { width: 44px; height: 44px; background: #000; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.zun-car { font-size: 24px; color: #FFF; font-variation-settings: 'FILL' 1; }
.service-label-zun { font-weight: 600; color: #000; }
.bottom-spacer { height: 40px; }

.bottom-nav { display: flex; justify-content: space-around; background: #F7F7F7; padding: 12px 16px; border-top: 1px solid #E8E8E8; flex-shrink: 0; }
.nav-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.nav-item.active .nav-label { color: #000; font-weight: 600; }
.nav-item.active .nav-icon { color: #000; font-variation-settings: 'FILL' 1; }
.nav-icon { font-size: 22px; color: #000; }
.nav-icon.muted { color: #86868B; font-variation-settings: 'FILL' 0; }
.nav-label { font-size: 11px; color: #86868B; }
.nav-label.muted { color: #86868B; }

/* 尊出行协议弹窗 */
.zun-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 999; display: flex; align-items: flex-end; }
.zun-sheet { width: 100%; height: 70vh; max-height: 70vh; background: #FFF; border-radius: 32px 32px 0 0; padding: 16px 24px 0; display: flex; flex-direction: column; overflow: hidden; }
.zun-handle { display: flex; justify-content: center; margin-bottom: 16px; }
.zun-handle-bar { width: 40px; height: 4px; background: #E8E8E8; border-radius: 2px; }
.zun-title { font-size: 20px; font-weight: 700; color: #1A1C1C; display: block; margin-bottom: 16px; }
.zun-body { flex: 1; min-height: 0; margin-bottom: 12px; }
.zun-text { font-size: 14px; color: #4C4546; line-height: 1.8; }
.zun-actions { display: flex; gap: 12px; flex-shrink: 0; padding: 16px 0 calc(16px + env(safe-area-inset-bottom, 0px)); }
.zun-btn-cancel { flex: 1; height: 48px; border-radius: 24px; border: 1px solid #CFC4C5; display: flex; align-items: center; justify-content: center; }
.zun-btn-confirm { flex: 2; height: 48px; background: #000; border-radius: 24px; display: flex; align-items: center; justify-content: center; }
.zun-btn-text { font-size: 15px; color: #4C4546; }
.zun-btn-text.confirm { color: #FFF; }
</style>
