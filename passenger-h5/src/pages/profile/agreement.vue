<template>
  <view class="root">
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar" @click="back">
        <text class="material-symbols-outlined hicon">arrow_back</text>
        <text class="htitle">用户服务协议</text>
      </view>
    </view>

    <scroll-view scroll-y class="body">
      <view class="card">
        <text class="section-text">
欢迎使用尊出行高端出行服务平台。{'\n\n'}
一、服务条款的接受{'\n'}
1.1 本协议是您与尊出行平台之间关于使用尊出行服务所订立的协议。{'\n'}
1.2 您在使用尊出行服务前，请务必仔细阅读并充分理解本协议各条款内容。{'\n\n'}
二、服务内容{'\n'}
2.1 尊出行提供包括但不限于包车出行、租车出行等高端出行服务。{'\n'}
2.2 您理解并同意，尊出行有权根据业务发展需要，随时调整服务内容。{'\n\n'}
三、用户账号{'\n'}
3.1 您通过手机号验证或企业账号登录后，即成为尊出行注册用户。{'\n'}
3.2 您应当对使用您账号进行的所有活动承担法律责任。{'\n\n'}
四、使用规则{'\n'}
4.1 您承诺在使用尊出行服务过程中遵守国家法律法规。{'\n'}
4.2 您不得利用尊出行平台从事任何违法违规活动。{'\n'}
4.3 您应妥善保管账号信息，因账号保管不善导致的一切后果由您自行承担。{'\n\n'}
五、服务费用{'\n'}
5.1 尊出行服务费用按照订单确认时展示的价格收取。{'\n'}
5.2 如产生额外费用（超时、超里程等），将按照计费规则另行结算。{'\n\n'}
六、隐私保护{'\n'}
6.1 尊出行重视用户个人信息保护，详情请参阅《隐私政策》。{'\n\n'}
七、免责声明{'\n'}
7.1 尊出行不对因不可抗力或第三方原因造成的服务中断承担责任。{'\n\n'}
八、其他{'\n'}
8.1 本协议的解释、效力及纠纷解决适用中华人民共和国法律。{'\n'}
8.2 尊出行有权根据需要修改本协议，修改后的协议一经发布即生效。
        </text>
      </view>
      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const top = ref(0);
onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0; });
const back = () => uni.navigateBack();
</script>

<style lang="scss" scoped>
.root { min-height: 100vh; background: #F9F9F9; display: flex; flex-direction: column; }
.header { background: #F9F9F9; flex-shrink: 0; }
.hbar { height: 56px; padding: 0 24px; display: flex; align-items: center; gap: 16px; }
.hbar:active { opacity: 0.7; }
.hicon { font-size: 24px; color: #000; }
.htitle { font-size: 20px; font-weight: 700; color: #000; }
.body { flex: 1; padding: 8px 24px 40px; }
.card { background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; padding: 24px; }
.section-text { font-size: 15px; color: #4C4546; line-height: 1.8; }
.bottom-spacer { height: 40px; }
</style>
