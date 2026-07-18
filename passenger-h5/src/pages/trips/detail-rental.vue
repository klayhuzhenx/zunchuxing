<template>
  <view class="root">
    <view class="header" :style="{ paddingTop: top + 'px' }">
      <view class="hbar" @click="back">
        <text class="material-symbols-outlined hicon">arrow_back</text>
        <text class="htitle">订单详情</text>
      </view>
    </view>

    <view class="body">
      <view class="sh"><text class="st">{{ s.title }}</text><text class="ss">订单编号：ZR2026060988540</text></view>

      <view class="msg" :class="'msg-'+s.cls">
        <text class="material-symbols-outlined mi">{{ s.icon }}</text>
        <view><text class="md">{{ s.desc }}</text></view>
      </view>

      <!-- 提前结束·退款将由运营手动办理（仅情况A 完成后） -->
      <view v-if="s.key==='completed' && earlyEndRefundPending" class="msg msg-info">
        <text class="material-symbols-outlined mi">info</text>
        <view><text class="md">提前结束行程有预付结余，协商确认后平台退款，预计 3 个工作日完成。</text></view>
      </view>

      <!-- 司机送车位置（仅待取车-已开始送） -->
      <view v-if="s.key==='pending-pickup'" class="map-card">
        <map class="enroute-map" :latitude="31.82" :longitude="117.20" :scale="14" :markers="enrouteMarkers" />
      </view>

      <!-- 取还车 -->
      <view class="card">
        <text class="ctitle">用车信息</text>
        <view class="route">
          <view class="rr"><view class="rdot g" /><view class="rline" /><view class="rdot r" /></view>
          <view class="ri">
            <view class="riv"><text class="rlbl">取车地点</text><text class="rval">合肥市政务中心</text></view>
            <view class="riv"><text class="rlbl">还车地点</text><text class="rval">合肥滨湖会展中心</text></view>
          </view>
        </view>
        <view class="div" />
        <view class="row2">
          <view><text class="rlbl">租期</text><text class="rval s">06-10 至 06-12</text></view>
          <view class="tr"><text class="rlbl">天数</text><text class="rval s">共 3 天</text></view>
        </view>
        <view class="div" />
        <view><text class="rlbl">备注</text><text class="rval s">{{ remark || '无' }}</text></view>
      </view>

      <!-- 派车信息 -->
      <view v-if="s.key !== 'unpaid' && s.key !== 'pending-unassigned' && s.key !== 'cancelled'" class="card">
        <text class="ctitle">派车信息</text>
        <view class="assign-r">
          <view>
            <text class="albl">送车司机</text>
            <text v-if="hasDriver" class="aval">李师傅 · 京A12345</text>
            <text v-else class="ared">待派车</text>
          </view>
          <view class="atr">
            <text class="albl">收车司机</text>
            <text v-if="hasDriver" class="aval">李师傅 · 京A12345</text>
            <text v-else class="ared">待派车</text>
          </view>
        </view>
        <view class="div" />
        <view><text class="albl">车辆</text><text class="aval b">增程星辉尊享版 · 京A12345</text></view>
      </view>

      <!-- 驾驶信息 -->
      <view class="card">
        <text class="ctitle">驾驶信息</text>
        <view class="row2">
          <view><text class="rlbl">驾驶人姓名</text><text class="rval s">{{ driverName }}</text></view>
          <view class="tr"><text class="rlbl">联系电话</text><text class="rval s">{{ driverPhone }}</text></view>
        </view>
        <view class="div" />
        <text class="rlbl" style="margin-bottom:8px;">驾驶证</text>
        <view class="lic"><text class="material-symbols-outlined licicon">badge</text><view><text class="lict">驾驶证.jpg</text><text class="lics"><text class="material-symbols-outlined licchk">check_circle</text>上传成功</text></view></view>
      </view>

      <!-- 租车套餐 -->
      <view class="card">
        <text class="ctitle">租车套餐</text>
        <view class="carb"><text class="clbl">增程星辉尊享版</text></view>
        <view class="cpkg">日租</view>
      </view>

      <!-- 费用信息 -->
      <view class="card">
        <view class="ctitle-row">
          <text class="ctitle">费用信息</text>
          <text class="billing-link" @click="openPricingRule">计费规则</text>
        </view>

        <!-- 待支付 -->
        <template v-if="s.key==='unpaid'">
          <view class="fr" @click="openFeeInfoMain('needPay')">
            <text class="fl">订单金额</text>
            <view class="fr-right"><text class="fv big">¥{{ netTotal }}</text><text class="material-symbols-outlined more-arrow">chevron_right</text></view>
          </view>
          <view class="fr">
            <text class="fl-discount">（共优惠{{ savingsLabel }}元）</text>
            <text class="fv-orig">¥{{ grossTotal }}</text>
          </view>
        </template>

        <!-- 待派车 / 待取车 / 进行中 -->
        <template v-else-if="s.key==='pending-unassigned'||s.key==='pending-pickup-undelivered'||s.key==='pending-pickup'||s.key==='ongoing'">
          <view class="fr" @click="openFeeInfoMain('paid')">
            <text class="fl">已付订单金额</text>
            <view class="fr-right"><text class="fv big">¥{{ netTotal }}</text><text class="material-symbols-outlined more-arrow">chevron_right</text></view>
          </view>
        </template>

        <!-- 待结算 -->
        <template v-else-if="s.key==='unpaid-extra'">
          <view class="fr" @click="openFeeInfoMain('paid')">
            <text class="fl">已付订单金额</text>
            <view class="fr-right"><text class="fv">¥{{ netTotal }}</text><text class="material-symbols-outlined more-arrow">chevron_right</text></view>
          </view>
          <view class="fr" @click="openFeeInfoMain('extra')">
            <text class="fl">应付订单金额</text>
            <view class="fr-right"><text class="fv">¥{{ extraTotal }}</text><text class="material-symbols-outlined more-arrow">chevron_right</text></view>
          </view>
          <view class="fr last">
            <text class="fl bld">需补款</text>
            <text class="fv big err">¥{{ extraPay }}</text>
          </view>
        </template>

        <!-- 已完成 -->
        <template v-else-if="s.key==='completed'">
          <view class="fr" @click="openFeeInfoMain('paid')">
            <text class="fl">已付订单金额</text>
            <view class="fr-right"><text class="fv">¥{{ paidTotal }}</text><text class="material-symbols-outlined more-arrow">chevron_right</text></view>
          </view>
          <view class="fr" @click="openFeeInfoMain('refund')">
            <text class="fl">退款金额</text>
            <view class="fr-right"><text class="fv">¥0.00</text><text class="material-symbols-outlined more-arrow">chevron_right</text></view>
          </view>
          <view class="fr last">
            <text class="fl bld">实付订单金额</text>
            <text class="fv big">¥{{ paidTotal }}</text>
          </view>
        </template>

        <!-- 已取消（支付后） -->
        <template v-else-if="s.key==='cancelled'">
          <view class="fr" @click="openFeeInfoMain('paid')">
            <text class="fl">已付订单金额</text>
            <view class="fr-right"><text class="fv">¥{{ netTotal }}</text><text class="material-symbols-outlined more-arrow">chevron_right</text></view>
          </view>
          <view class="fr" @click="openFeeInfoMain('refund')">
            <text class="fl">退款金额</text>
            <view class="fr-right"><text class="fv">¥{{ netTotal }}</text><text class="material-symbols-outlined more-arrow">chevron_right</text></view>
          </view>
          <view class="fr last">
            <text class="fl bld">实付订单金额</text>
            <text class="fv big">¥0.00</text>
          </view>
        </template>
        <!-- 已取消（支付前）不展示费用区 -->
      </view>

      <!-- 押金信息（仅租车 · 个人身份，独立模块） -->
      <view v-if="!isEnterprise" class="card">
        <view class="ctitle-row">
          <text class="ctitle">押金信息</text>
          <text v-if="showDepositStatus" class="ctxt" :class="depositStatusCls">{{ depositStatusLabel }}</text>
        </view>
        <view class="fr">
          <text class="fl">合计押金</text>
          <text class="fv">¥{{ depositTotal.toLocaleString() }}.00</text>
        </view>
        <view class="fr" @click="openDepositDetail('vehicle')">
          <text class="fl">车辆押金</text>
          <view class="fr-right">
            <text class="fv">¥{{ depositVehicle.toLocaleString() }}.00</text>
            <text class="material-symbols-outlined more-arrow">chevron_right</text>
          </view>
        </view>
        <view class="fr" @click="openDepositDetail('violation')">
          <text class="fl">违章押金</text>
          <view class="fr-right">
            <text class="fv">¥{{ depositViolation.toLocaleString() }}.00</text>
            <text class="material-symbols-outlined more-arrow">chevron_right</text>
          </view>
        </view>
      </view>

      <!-- 押金明细弹窗（单项明细） -->
      <view v-if="depositDetailVisible" class="fd-mask" @click="depositDetailVisible = false">
        <view class="fd-sheet" @click.stop>
          <view class="fd-head">
            <text class="fd-title">{{ depositDetailTitle }}</text>
            <view class="fd-close" @click="depositDetailVisible = false">
              <text class="material-symbols-outlined">close</text>
            </view>
          </view>
          <view class="fd-body">
            <view class="fd-row"><text class="fdl">押金金额</text><text class="fdv">¥{{ depositDetailAmount.toLocaleString() }}.00</text></view>
            <view class="fd-row"><text class="fdl">扣款金额</text><text class="fdv">¥{{ depositDetailDeduct.toLocaleString() }}.00</text></view>
            <view class="fd-row"><text class="fdl">已退金额</text><text class="fdv" :class="{ points: depositDetailRefunded, err: !depositDetailRefunded }">{{ depositDetailRefunded ? `¥${depositDetailRefundedAmount.toLocaleString()}.00` : '¥0.00（未退）' }}</text></view>
            <view class="fd-row"><text class="fdl">申请退款时间</text><text class="fdv">{{ depositDetailTime || '—' }}</text></view>
            <view class="fd-row"><text class="fdl">备注</text><text class="fdv">{{ depositDetailRemark || '—' }}</text></view>
          </view>
        </view>
      </view>

      <!-- 额外费用明细弹窗（超时/超公里/远调/其他子明细）— 层级高于费用信息弹窗 -->
      <view v-if="feeDetailVisible" class="fd-mask fd-mask-top" @click="feeDetailVisible = false">
        <view class="fd-sheet" @click.stop>
          <view class="fd-head">
            <text class="fd-title">{{ feeDetailData.title }}</text>
            <view class="fd-close" @click="feeDetailVisible = false">
              <text class="material-symbols-outlined">close</text>
            </view>
          </view>
          <view class="fd-body">
            <template v-if="feeDetailType === 'waiting'">
              <view v-for="(d, i) in waitingDetails" :key="i" class="fd-day">
                <text class="fd-date">{{ d.date }}</text>
                <view class="fd-row"><text class="fdl">等待时长</text><text class="fdv err">{{ d.waitingDuration }}</text></view>
                <view class="fd-row"><text class="fdl bld">等待费</text><text class="fdv bld err">¥{{ d.amount }}</text></view>
                <view v-if="i < waitingDetails.length - 1" class="fd-div" />
              </view>
            </template>
            <template v-if="feeDetailType === 'overtime'">
              <view v-for="(d, i) in overtimeDetails" :key="i" class="fd-day">
                <text class="fd-date">{{ d.date }}</text>
                <view class="fd-row"><text class="fdl">行程时间</text><text class="fdv">{{ d.start }} — {{ d.end }}</text></view>
                <view class="fd-row"><text class="fdl">总时长</text><text class="fdv">{{ d.totalDuration }}</text></view>
                <view class="fd-row"><text class="fdl">套餐内时长</text><text class="fdv">{{ d.includedDuration }}</text></view>
                <view class="fd-row"><text class="fdl err">超时时长</text><text class="fdv err">{{ d.overtimeDuration }}</text></view>
                <view class="fd-row"><text class="fdl bld">超时长费</text><text class="fdv bld err">¥{{ d.amount }}</text></view>
              </view>
            </template>
            <template v-if="feeDetailType === 'remote'">
              <text class="fd-date">租车出行 · 远调费明细</text>
              <view class="fd-row"><text class="fdl">取远调距离</text><text class="fdv">{{ rdPickupKm }} km → ¥{{ rdPickupFee }}.00</text></view>
              <view class="fd-row"><text class="fdl">还远调距离</text><text class="fdv">{{ rdDropoffKm }} km → ¥{{ rdDropoffFee }}.00</text></view>
              <view class="fd-div" />
              <view class="fd-row"><text class="fdl bld">远调费合计</text><text class="fdv bld err">¥{{ rdTotalFee }}.00</text></view>
            </template>
            <template v-if="feeDetailType === 'mileage'">
              <view v-for="(d, i) in mileageDetails" :key="i" class="fd-day">
                <text class="fd-date">{{ d.date }}</text>
                <view class="fd-row"><text class="fdl">开始里程</text><text class="fdv">{{ d.startMileage }} km</text></view>
                <view class="fd-row"><text class="fdl">结束里程</text><text class="fdv">{{ d.endMileage }} km</text></view>
                <view class="fd-img-row"><view class="fd-img"><text class="material-symbols-outlined">image</text><text>开始</text></view><view class="fd-img"><text class="material-symbols-outlined">image</text><text>结束</text></view></view>
                <view class="fd-row"><text class="fdl">当日里程</text><text class="fdv">{{ d.totalMileage }} km</text></view>
                <view class="fd-row"><text class="fdl">套餐内里程</text><text class="fdv">{{ d.includedMileage }} km</text></view>
                <view class="fd-row"><text class="fdl err">超里程</text><text class="fdv err">{{ d.excessMileage }} km</text></view>
                <view class="fd-row"><text class="fdl bld">超里程费</text><text class="fdv bld err">¥{{ d.amount }}</text></view>
              </view>
            </template>
          </view>
        </view>
      </view>

      <!-- 费用信息主弹窗 -->
      <view v-if="feeInfoVisible" class="fd-mask" @click="feeInfoVisible = false">
        <view class="fd-sheet" @click.stop>
          <view class="fd-head">
            <view class="fd-back" @click="feeInfoVisible = false">
              <text class="material-symbols-outlined">arrow_back</text>
            </view>
            <text class="fd-title">费用明细</text>
            <view class="fd-placeholder" />
          </view>
          <view class="fd-body">
            <!-- needPay：订单金额明细 -->
            <template v-if="feeInfoMode==='needPay'">
              <view class="fd-row"><text class="fdl bld">套餐总价</text><text class="fdv bld">¥{{ netTotal }}</text></view>
              <view class="fd-row">
                <text class="fd-discount">共优惠{{ savingsLabel }}元</text>
                <text class="fdv-orig">¥{{ grossTotal }}</text>
              </view>
              <view class="fd-detail-box">
                <view class="fd-row">
                  <text class="fdl">套餐单价</text>
                  <text class="fdv">¥{{ discountedUnit.toLocaleString() }}</text>
                </view>
                <view class="fd-row">
                  <text class="fd-hint">租车{{ tripDays }}天，享{{ discountPercent }}折</text>
                  <text class="fdv-orig">¥{{ dayPriceText }}</text>
                </view>
                <view class="fd-row">
                  <text class="fdl">租车天数</text>
                  <text class="fdv">{{ tripDays }}天</text>
                </view>
              </view>
              <view v-if="rdTotalFee > 0" class="fd-row"><text class="fdl bld">远调费</text><text class="fdv bld">¥{{ rdTotalFee }}.00</text></view>
              <view v-if="pointsUsed > 0" class="fd-row"><text class="fdl">积分抵扣</text><text class="fdv deduction">-¥{{ pointsDeduction }}.00</text></view>
            </template>

            <!-- paid：已付订单金额（结算前=下单费用 / 结算后=全量） -->
            <template v-else-if="feeInfoMode==='paid'">
              <template v-if="s.key !== 'completed'">
                <view class="fd-row"><text class="fdl bld">套餐总价</text><text class="fdv bld">¥{{ netTotal }}</text></view>
                <view class="fd-row"><text class="fd-discount">共优惠{{ savingsLabel }}元</text><text class="fdv-orig">¥{{ grossTotal }}</text></view>
                <view class="fd-detail-box">
                  <view class="fd-row"><text class="fdl">套餐单价</text><text class="fdv">¥{{ discountedUnit.toLocaleString() }}</text></view>
                  <view class="fd-row"><text class="fd-hint">租车{{ tripDays }}天，享{{ discountPercent }}折</text><text class="fdv-orig">¥{{ dayPriceText }}</text></view>
                  <view class="fd-row"><text class="fdl">租车天数</text><text class="fdv">{{ tripDays }}天</text></view>
                </view>
                <view v-if="rdTotalFee > 0" class="fd-row"><text class="fdl bld">远调费</text><text class="fdv bld">¥{{ rdTotalFee }}.00</text></view>
                <view v-if="pointsUsed > 0" class="fd-row"><text class="fdl">积分抵扣</text><text class="fdv deduction">-¥{{ pointsDeduction }}.00</text></view>
              </template>
              <template v-else>
                <view class="fd-row"><text class="fdl bld">套餐总价</text><text class="fdv bld">¥{{ netTotal }}</text></view>
                <view class="fd-row"><text class="fd-discount">共优惠{{ savingsLabel }}元</text><text class="fdv-orig">¥{{ grossTotal }}</text></view>
                <view class="fd-detail-box">
                  <view class="fd-row"><text class="fdl">套餐单价</text><text class="fdv">¥{{ discountedUnit.toLocaleString() }}</text></view>
                  <view class="fd-row"><text class="fd-hint">租车{{ tripDays }}天，享{{ discountPercent }}折</text><text class="fdv-orig">¥{{ dayPriceText }}</text></view>
                  <view class="fd-row"><text class="fdl">实际使用天数</text><text class="fdv">{{ tripDays }}天</text></view>
                </view>
                <view class="fd-div" />
                <view v-if="rdTotalFee > 0" class="fd-row" @click="openFeeDetail('remote')"><text class="fdl">实际远调费</text><view class="fr-right"><text class="fdv err">¥{{ rdTotalFee }}.00</text><text class="material-symbols-outlined more-arrow">chevron_right</text></view></view>
                <view class="fd-row" @click="openFeeDetail('overtime')"><text class="fdl">超时费</text><view class="fr-right"><text class="fdv err">¥50.00</text><text class="material-symbols-outlined more-arrow">chevron_right</text></view></view>
                <view class="fd-row" @click="openFeeDetail('mileage')"><text class="fdl">超里程费</text><view class="fr-right"><text class="fdv err">¥180.00</text><text class="material-symbols-outlined more-arrow">chevron_right</text></view></view>
                <view class="fd-row" @click="openFeeDetail('waiting')"><text class="fdl">等待费</text><view class="fr-right"><text class="fdv err">¥{{ waitingFeeTotal }}.00</text><text class="material-symbols-outlined more-arrow">chevron_right</text></view></view>
              </template>
            </template>

            <!-- extra：应付订单金额（差额明细） -->
            <template v-else-if="feeInfoMode==='extra'">
              <view class="fd-row"><text class="fdl bld">套餐总价</text><text class="fdv bld">¥{{ netTotal }}</text></view>
              <view class="fd-row"><text class="fd-discount">共优惠{{ savingsLabel }}元</text><text class="fdv-orig">¥{{ grossTotal }}</text></view>
              <view class="fd-detail-box">
                <view class="fd-row"><text class="fdl">套餐单价</text><text class="fdv">¥{{ discountedUnit.toLocaleString() }}</text></view>
                <view class="fd-row"><text class="fd-hint">租车{{ tripDays }}天，享{{ discountPercent }}折</text><text class="fdv-orig">¥{{ dayPriceText }}</text></view>
                <view class="fd-row"><text class="fdl">实际使用天数</text><text class="fdv">{{ tripDays }}天</text></view>
              </view>
              <view class="fd-div" />
              <view v-if="rdTotalFee > 0" class="fd-row" @click="openFeeDetail('remote')"><text class="fdl">实际远调费</text><view class="fr-right"><text class="fdv err">¥{{ rdTotalFee }}.00</text><text class="material-symbols-outlined more-arrow">chevron_right</text></view></view>
              <view class="fd-row" @click="openFeeDetail('overtime')"><text class="fdl">超时费</text><view class="fr-right"><text class="fdv err">¥50.00</text><text class="material-symbols-outlined more-arrow">chevron_right</text></view></view>
              <view class="fd-row" @click="openFeeDetail('mileage')"><text class="fdl">超里程费</text><view class="fr-right"><text class="fdv err">¥180.00</text><text class="material-symbols-outlined more-arrow">chevron_right</text></view></view>
              <view class="fd-row" @click="openFeeDetail('waiting')"><text class="fdl">等待费</text><view class="fr-right"><text class="fdv err">¥{{ waitingFeeTotal }}.00</text><text class="material-symbols-outlined more-arrow">chevron_right</text></view></view>
            </template>

            <!-- refund：退款明细（灰底分笔记录） -->
            <template v-else-if="feeInfoMode==='refund'">
              <view v-for="(r, i) in refundRecords" :key="i" class="fd-detail-box">
                <view class="fd-row"><text class="fdl">退款金额</text><text class="fdv">¥{{ r.amount }}</text></view>
                <view class="fd-row"><text class="fdl">申请退款时间</text><text class="fdv">{{ r.time }}</text></view>
                <view class="fd-row"><text class="fdl">退款类型</text><text class="fdv">{{ r.type }}</text></view>
                <view class="fd-row"><text class="fdl">备注</text><text class="fdv">{{ r.remark }}</text></view>
              </view>
              <view v-if="refundRecords.length === 0" class="fd-row"><text class="fdl">暂无退款记录</text></view>
            </template>

            <!-- penalty：违约金明细 -->
            <template v-else-if="feeInfoMode==='penalty'">
              <view class="fd-row"><text class="fdl">订单价格</text><text class="fdv">¥{{ grossTotal }}</text></view>
              <view class="fd-row"><text class="fdl">距出发时长</text><text class="fdv">—</text></view>
              <view class="fd-row"><text class="fdl">扣款比例</text><text class="fdv">0%</text></view>
              <view class="fd-row"><text class="fdl bld">违约金金额</text><text class="fdv bld err">¥0.00</text></view>
            </template>
          </view>
        </view>
      </view>

      <!-- 订单动态 -->
      <view class="card">
        <text class="ctitle">订单动态</text>
        <view class="tl">
          <view v-for="(t, i) in timeline" :key="i" class="tlr" :class="{ tllast: i===timeline.length-1 }">
            <view class="tldot" :class="i===0?'active':(t.type==='warn'?'warn':'')" />
            <view v-if="i<timeline.length-1" class="tlline" />
            <view class="tli"><text class="tlt">{{ t.title }}</text><text class="tltime">{{ t.time }}</text></view>
          </view>
        </view>
      </view>
    </view>

    <view class="footer">
      <template v-if="s.key==='unpaid'">
        <view class="btn bo er" @click="onCancel">取消订单</view>
        <view class="btn bf" @click="onPay">去支付 ¥{{ rentalPayAmount }}</view>
      </template>
      <template v-else-if="s.key==='unpaid-extra'">
        <view class="btn bf wf" @click="onExtraPay">去补款 ¥{{ fromEarlyEnd ? earlyEndPayAmount.toLocaleString() : extraPay }}</view>
      </template>
      <template v-else-if="s.key==='pending-unassigned'||s.key==='pending-pickup-undelivered'">
        <view class="btn bo er wf" @click="onCancel">取消订单</view>
      </template>
     <template v-else-if="s.key==='pending-pickup'">
       <view class="btn bo er" @click="onCancel">取消订单</view>
     </template>
      <template v-else-if="s.key==='ongoing'">
        <view class="btn bo er" @click="onEarlyReturn">提前还车</view>
        <view class="btn bf" @click="toast('已拨打客服电话')"><text class="material-symbols-outlined ficon">support_agent</text>联系客服</view>
      </template>
      <template v-else-if="s.key==='cancelled'">
        <view class="btn bo" @click="onReorder">重新下单</view>
      </template>
    </view>

    <bottom-sheet v-model="showPaySheet" title="选择支付方式" :max-height="'auto'">
      <view class="paym-list">
        <view v-for="p in payMethods" :key="p.id" class="paym-item" :class="{act:payMethod===p.id}" @click="payMethod=p.id">
          <view class="paym-left"><text class="material-symbols-outlined paym-icon" :style="{color:p.color}">{{ p.icon }}</text><text class="paym-name">{{ p.name }}</text></view>
          <view class="paym-radio"><view v-if="payMethod===p.id" class="paym-inner" /></view>
        </view>
      </view>
      <view class="paym-btn" @click="onExtraPayConfirm"><text class="paym-btn-t">确认并支付 ¥{{ fromEarlyEnd ? earlyEndPayAmount.toLocaleString() : extraPay }}</text></view>
    </bottom-sheet>

    <!-- 取消订单弹窗（居中） -->
    <view v-if="showCancelSheet" class="modal-mask" @click="showCancelSheet = false">
      <view class="modal-center" @click.stop>
        <text class="mc-title">确认取消该订单吗？</text>
        <input v-model="cancelReason" class="mc-input" maxlength="200" placeholder="取消原因（选填）" placeholder-class="mc-ph" />
        <view v-if="showPenalty" class="mc-penalty">违约金 ¥20.50</view>
        <view class="mc-actions">
          <view class="mc-btn cancel" @click="showCancelSheet=false"><text>再想想</text></view>
          <view class="mc-btn confirm" @click="onConfirmCancel"><text>确认取消</text></view>
        </view>
      </view>
    </view>

    <!-- 提前还车 · 提示弹窗 -->
    <bottom-sheet v-model="earlyReturnTipSheet" title="提前还车" :max-height="'auto'">
      <view class="rt-tip">
        <text>您选择提前还车，请先联系客服预约收车时间与地点。工作人员现场核验车辆及里程后，会为您确认最终结算金额。</text>
      </view>
      <view class="ee-list">
        <view class="ee-row" @click="openFeeInfoMain('paid')"><text class="ee-l">已付订单费用</text><view class="ee-right"><text class="ee-v">¥{{ netTotal }}</text><text class="material-symbols-outlined ee-arrow">chevron_right</text></view></view>
      </view>
      <view v-if="discountCoef < 1" class="ee-discount-tip" @click="earlyReturnTipSheet=false; openPricingRule()">
        <text class="material-symbols-outlined ee-dt-icon">info</text>
        <view class="ee-dt-text"><text>本单参与优惠折扣，提前结束将按照实际使用天数重新测算折扣，</text><text class="ee-dt-link">点击查看计费规则 ›</text></view>
      </view>
      <view class="ee-actions">
        <view class="btn bo" @click="toast('已拨打客服电话')">联系客服</view>
        <view class="btn bf" @click="earlyReturnTipSheet=false">稍后再说</view>
      </view>
    </bottom-sheet>

  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import BottomSheet from '@/components/bottom-sheet.vue';
const top = ref(0); const st = ref('pending-unassigned');
const extraFee = ref('0.00');
const driverName = ref('张先生');
const driverPhone = ref('138****8888');
const remark = ref('');
onMounted(() => { top.value = uni.getSystemInfoSync().statusBarHeight || 0; });
onLoad((opts: Record<string, string> | undefined) => {
  if (opts?.status) st.value = opts.status;
  if (opts?.ex) extraFee.value = opts.ex;
  if (opts?.driverName) driverName.value = decodeURIComponent(opts.driverName);
  if (opts?.driverPhone) driverPhone.value = decodeURIComponent(opts.driverPhone);
  if (opts?.remark !== undefined) remark.value = decodeURIComponent(opts.remark || '');
});

const statusMap = computed<Record<string, { key:string; title:string; icon:string; msg:string; desc:string; cls:string }>>(() => ({
  unpaid:                       { key:'unpaid',                       title:'待支付', icon:'schedule',       msg:'', desc:'订单已确认，请在支付超时前完成支付',           cls:'warn' },
  'unpaid-extra':               { key:'unpaid-extra',                 title:'待结算', icon:'error_outline',  msg:'', desc:`行程结束产生额外费用 ¥${extraFee.value}，请及时补款`, cls:'err'  },
  'pending-unassigned':         { key:'pending-unassigned',           title:'待派车', icon:'hourglass_top',  msg:'', desc:'运营正在安排派车，请您耐心等待',                cls:'warn' },
  'pending-pickup-undelivered': { key:'pending-pickup-undelivered',   title:'待取车', icon:'local_shipping', msg:'', desc:'等待司机将车辆送往取车点',    cls:'warn' },
  'pending-pickup':             { key:'pending-pickup',               title:'待取车', icon:'local_shipping', msg:'', desc:'司机正在将车辆送往取车点 · 王师傅 · 沪B88888 · 预计 8 分钟到达',  cls:'info'   },
  ongoing:                      { key:'ongoing',                      title:'进行中', icon:'directions_car', msg:'', desc:'请在约定时间内还车',                            cls:'ok'   },
  completed:                    { key:'completed',                    title:'已完成', icon:'check_circle',   msg:'', desc:'感谢您的出行，欢迎再次使用尊出行',              cls:'ok'   },
  cancelled:                    { key:'cancelled',                    title:'已取消', icon:'cancel',         msg:'', desc:'取消原因：行程计划有变，违约金 ¥0.00',          cls:'err'  },
}));
const s = computed(() => statusMap.value[st.value] || statusMap.value['pending-unassigned']);
const hasDriver = computed(() => ['pending-pickup-undelivered','pending-pickup','ongoing','completed','unpaid-extra'].includes(s.value.key));
const enrouteMarkers = [
  { id: 1, latitude: 31.82, longitude: 117.20, width: 28, height: 28, iconPath: '/static/marker-car.png', title: '司机位置' },
  { id: 2, latitude: 31.83, longitude: 117.22, width: 24, height: 24, iconPath: '/static/marker-pickup.png', title: '取车点' },
];

// 费用明细弹窗
const feeDetailVisible = ref(false);
const feeDetailType = ref<'waiting' | 'overtime' | 'mileage' | 'remote' | 'other'>('overtime');
const feeDetailData = computed(() => {
  const titles: Record<string, string> = { waiting: '等待费明细', overtime: '超时长费明细', mileage: '超里程费明细', remote: '远调费明细', other: '其他费用明细' };
  return { title: titles[feeDetailType.value] };
});
const overtimeDetails = [
  { date: '06-10', start: '08:00', end: '17:00', totalDuration: '9小时', includedDuration: '8小时', overtimeDuration: '1小时', amount: 50 },
];
const waitingDetails = [
  { date: '06-10', waitingDuration: '45 分钟', amount: 45 },
  { date: '06-11', waitingDuration: '30 分钟', amount: 30 },
  { date: '06-12', waitingDuration: '20 分钟', amount: 20 },
];
const mileageDetails = [
  { date: '06-10', startMileage: 180, endMileage: 218, totalMileage: 38, includedMileage: 200, excessMileage: 18, amount: 180 },
];
const rdPickupKm = 0; const rdDropoffKm = 0;
const rdPickupFee = 0; const rdDropoffFee = 0;
const rdTotalFee = 0;
const waitingFeeTotal = 95;

/* ======= 费用信息：套餐计费（mock） ======= */
const tripDays = 3;
const dayPrice = 1500;
const discountCoef = 0.95;
const grossTotal = (dayPrice * tripDays).toLocaleString();           // ¥4,500
const netTotalVal = Math.round(dayPrice * tripDays * discountCoef); // 4275
const netTotal = netTotalVal.toLocaleString();
const savingsVal = dayPrice * tripDays - netTotalVal;
const savingsLabel = savingsVal.toLocaleString();
const discountPercent = (discountCoef * 10).toFixed(1).replace(/\.0$/, ''); // "9.5"
const discountedUnit = Math.round(dayPrice * discountCoef);
const discountedUnitText = (discountedUnit * tripDays).toLocaleString();
const dayPriceText = dayPrice.toLocaleString();
const extraTotalVal = netTotalVal + 50 + 180 + waitingFeeTotal;
const extraTotal = extraTotalVal.toLocaleString();
const extraPayVal = extraTotalVal - netTotalVal;
const extraPay = extraPayVal.toLocaleString();
// 已完成：已付 = 下单实付 + 补款
const paidTotalVal = netTotalVal + extraPayVal;
const paidTotal = paidTotalVal.toLocaleString();
// 退款记录（mock）
const refundRecords = [
  { amount: '2,000', time: '06-13 10:30', type: '差额退还', remark: '提前结束行程，差额自动退还' },
  { amount: '800', time: '06-14 16:00', type: '平台退款', remark: '运营手动退款：维修补偿' },
  { amount: '4,275', time: '06-09 18:00', type: '取消退款', remark: '支付超时全额自动退款' },
];

// 费用信息主弹窗
const feeInfoVisible = ref(false);
const feeInfoMode = ref<'needPay'|'paid'|'extra'|'refund'|'penalty'>('needPay');
const openFeeInfoMain = (mode: 'needPay'|'paid'|'extra'|'refund'|'penalty' = 'needPay') => {
  feeInfoMode.value = mode;
  feeInfoVisible.value = true;
};

const openFeeDetail = (type: 'waiting' | 'overtime' | 'mileage' | 'remote' | 'other') => {
  feeDetailType.value = type;
  feeDetailVisible.value = true;
};

const openPricingRule = () => {
  uni.navigateTo({ url: '/pages/webview/index?src=/pricingrental.html' })
};

// 支付方式 + 积分信息（spec：支付成功 — {支付方式} ¥{金额}（含押金 ¥{金额}））
const payMethodName = '微信支付';
const pointsUsed = 3000;
const pointsDeduction = 30; // 100积分=¥1 → 3000积分=¥30
const depositVehicle = 3000;
const depositViolation = 2000;
const depositTotal = depositVehicle + depositViolation;
// 车辆已退（暂 mock）、违章未退
const depositVRefunded = s.value.key === 'completed';
const depositViRefunded = s.value.key === 'completed' || s.value.key === 'cancelled';
const refundCount = (depositVRefunded ? 1 : 0) + (depositViRefunded ? 1 : 0);
const depositStatusLabel = refundCount === 0 ? '未退还' : refundCount === 1 ? '部分退还' : '已退还';
const depositStatusCls = refundCount === 0 ? 'err' : refundCount === 1 ? 'warn' : 'points';
// 待支付/已取消(支付前)不展示押金状态
const showDepositStatus = computed(() => !['unpaid','cancelled'].includes(s.value.key));

const paymentText = `支付成功 — ${payMethodName} ¥4,470.00 使用积分 ${pointsUsed.toLocaleString()}（含押金 ¥${depositTotal.toLocaleString()}.00）`;

// 押金明细弹窗
const depositDetailVisible = ref(false);
const depositDetailTitle = ref('');
const depositDetailAmount = ref(0);
const depositDetailDeduct = ref(0);
const depositDetailRefunded = ref(false);
const depositDetailRefundedAmount = ref(0);
const depositDetailTime = ref('');
const depositDetailRemark = ref('');
const openDepositDetail = (type: string) => {
  if (type === 'total') return;
  const isVehicle = type === 'vehicle';
  const amount = isVehicle ? depositVehicle : depositViolation;
  const refunded = isVehicle ? depositVRefunded : depositViRefunded;
  depositDetailTitle.value = isVehicle ? '车辆押金明细' : '违章押金明细';
  depositDetailAmount.value = amount;
  depositDetailDeduct.value = 0;
  depositDetailRefunded.value = refunded;
  depositDetailRefundedAmount.value = refunded ? amount : 0;
  depositDetailTime.value = refunded ? '06-13 10:00' : '';
  depositDetailRemark.value = '';
  depositDetailVisible.value = true;
};

const timeline = computed(() => {
  const t: { title:string; time:string; type?:string }[] = [];
  const plate = '京A12345'; const delivery = '李师傅'; const pickup = '陈师傅';
  switch (s.value.key) {
    case 'unpaid': t.push({ title: '订单已提交', time: '06-09 14:22' }); break;
    case 'pending-unassigned':
      t.push({ title: paymentText, time: '06-09 14:20' });
      t.push({ title: '订单已提交', time: '06-09 14:22' }); break;
    case 'pending-pickup-undelivered':
      t.push({ title: `已派车 — ${plate}。送车司机 ${delivery}、收车司机 ${pickup}`, time: '06-09 15:10' });
      t.push({ title: paymentText, time: '06-09 14:20' });
      t.push({ title: '订单已提交', time: '06-09 14:22' }); break;
    case 'pending-pickup':
      t.push({ title: `车辆已送达取车点`, time: '06-10 08:50' });
      t.push({ title: `送车司机 ${delivery} 已出发`, time: '06-10 08:30' });
      t.push({ title: `已派车 — ${plate}。送车司机 ${delivery}、收车司机 ${pickup}`, time: '06-09 15:10' });
      t.push({ title: paymentText, time: '06-09 14:20' });
      t.push({ title: '订单已提交', time: '06-09 14:22' }); break;
    case 'ongoing':
      t.push({ title: `行程开始 — ${plate}`, time: '06-10 09:05' });
      t.push({ title: `车辆已送达取车点`, time: '06-10 08:50' });
      t.push({ title: `送车司机 ${delivery} 已出发`, time: '06-10 08:30' });
      t.push({ title: `已派车 — ${plate}。送车司机 ${delivery}、收车司机 ${pickup}`, time: '06-09 15:10' });
      t.push({ title: paymentText, time: '06-09 14:20' });
      t.push({ title: '订单已提交', time: '06-09 14:22' }); break;
    case 'completed':
      t.push({ title: `押金 ¥${depositTotal.toLocaleString()}.00 已退还`, time: '06-13 10:00' });
      t.push({ title: '订单已完成', time: '06-12 18:45' });
      t.push({ title: `收车完成 — 里程 138km，用车 3 天`, time: '06-12 18:30' });
      t.push({ title: `收车司机 ${pickup} 已出发`, time: '06-12 17:50' });
      t.push({ title: `行程开始 — ${plate}`, time: '06-10 09:05' });
      t.push({ title: `车辆已送达取车点`, time: '06-10 08:50' });
      t.push({ title: `送车司机 ${delivery} 已出发`, time: '06-10 08:30' });
      t.push({ title: `已派车 — ${plate}。送车司机 ${delivery}、收车司机 ${pickup}`, time: '06-09 15:10' });
      t.push({ title: paymentText, time: '06-09 14:20' });
      t.push({ title: '订单已提交', time: '06-09 14:22' }); break;
    case 'unpaid-extra':
      t.push({ title: '需补款 ¥230.00', time: '06-12 18:30', type:'warn' });
      t.push({ title: `收车完成 — 里程 138km，用车 3 天`, time: '06-12 18:30' });
      t.push({ title: `收车司机 ${pickup} 已出发`, time: '06-12 17:50' });
      t.push({ title: `行程开始 — ${plate}`, time: '06-10 09:05' });
      t.push({ title: `车辆已送达取车点`, time: '06-10 08:50' });
      t.push({ title: `送车司机 ${delivery} 已出发`, time: '06-10 08:30' });
      t.push({ title: `已派车 — ${plate}。送车司机 ${delivery}、收车司机 ${pickup}`, time: '06-09 15:10' });
      t.push({ title: paymentText, time: '06-09 14:20' });
      t.push({ title: '订单已提交', time: '06-09 14:22' }); break;
    case 'cancelled':
      t.push({ title: `订单已取消 — 行程计划有变，退款 ¥4,470.00（含押金一次性退）`, time: '06-09 16:00', type:'warn' });
      t.push({ title: paymentText, time: '06-09 14:20' });
      t.push({ title: '订单已提交', time: '06-09 14:22' }); break;
    default: t.push({ title: '订单已提交', time: '06-09 14:22' });
  }
  return t;
});
const totalFee = computed(() => {
  const base = s.value.key === 'unpaid-extra' ? '4,730.00' : '4,500.00';
  return base;
});

const back = () => uni.navigateBack();
const toast = (m: string) => uni.showToast({ title: m, icon: 'none' });
const cancelReason = ref('');
const showCancelSheet = ref(false);
const showPenalty = computed(() =>
  ['pending-pickup'].includes(s.value.key));
const onCancel = () => { cancelReason.value = ''; showCancelSheet.value = true; };
const onConfirmCancel = () => {
  showCancelSheet.value = false;
  st.value = 'cancelled';
};
const showPaySheet = ref(false);
const isEnterprise = ref(uni.getStorageSync('user-identity') === 'enterprise');
const payMethod = ref<'wechat'|'alipay'|'enterprise'>(isEnterprise.value ? 'enterprise' : 'wechat');
const payMethods = computed(() => isEnterprise.value
  ? [{ id:'enterprise' as const, name:'企业支付', icon:'domain', color:'#D4AF37' }]
  : [
      { id:'wechat' as const, name:'微信支付', icon:'account_balance_wallet', color:'#07C160' },
      { id:'alipay' as const, name:'支付宝', icon:'payments', color:'#1677FF' },
    ]);
const rentalPayAmount = computed(() => (netTotalVal + (isEnterprise.value ? 0 : depositTotal)).toLocaleString());
const onPay = () => {
  uni.navigateTo({ url: `/pages/charter/pay?source=rental&method=wechat&total=4,500&orderNo=ZR2026060988540&carIdx=0&days=3&passenger=张先生&phone=138****8888&product=增程星辉尊享版` });
};
const onExtraPay = () => { showPaySheet.value = true; };

/* ======= 提前结束行程（提前还车） ======= */
// 结算预估（mock，实际由后端 /orders/{id}/early-end/estimate 返回 { prepaid, actual }）
const earlyEndSheet = ref(false);
const earlyEndType = ref<'refund'|'pay'>('refund');   // refund=预付≥实际(退款) / pay=预付<实际(补款)
const earlyEndPrepaid = ref(0);
const earlyEndActual = ref(0);
const earlyEndPayAmount = ref(0);                       // 情况B 补款金额 = actual - prepaid
const earlyEndRefundPending = ref(false);               // 情况A 完成后：退款待运营手动办理
const fromEarlyEnd = ref(false);                        // 补款是否来自提前结束（情况B）
const fetchEarlyEndEstimate = (): { prepaid:number; actual:number } => {
  const prepaid = netTotalVal;   // 预支付 = 下单实付（押金走原流程，不纳入）
  const actual = 3500;           // 实际费用（< 预付 → 情况A 退款；改为 4600 → 情况B 补款）
  return { prepaid, actual };
};
const earlyReturnTipSheet = ref(false);
const onEarlyReturn = () => { earlyReturnTipSheet.value = true; };
const onEarlyEndConfirm = () => {
  earlyEndSheet.value = false;
  if (earlyEndType.value === 'refund') {
    // 情况A：确认结束 → 已完成，差额退款由运营后台手动办理（备注「提前结束行程」）
    earlyEndRefundPending.value = true;
    st.value = 'completed';
  } else {
    // 情况B：确认结束 → 待结算，立即引导补款；未补款则停留待结算
    fromEarlyEnd.value = true;
    extraFee.value = earlyEndPayAmount.value.toLocaleString();
    st.value = 'unpaid-extra';
    showPaySheet.value = true;
  }
};
const onExtraPayConfirm = () => {
  showPaySheet.value = false;
  const amount = fromEarlyEnd.value ? earlyEndPayAmount.value : extraPayVal;
  if (payMethod.value === 'enterprise') {
    uni.showModal({
      title: '企业额度支付', content: `本次将从企业额度中扣除补款 ¥${amount}，是否确认？`, confirmText: '确认支付',
      success: (r: any) => { if (r.confirm) { uni.showToast({ title: '补款成功', icon: 'success' }); st.value = 'completed'; } },
    });
    return;
  }
  if (fromEarlyEnd.value) {
    // 提前结束补款：模拟支付成功闭环
    uni.showToast({ title: '补款成功', icon: 'success' });
    st.value = 'completed';
    return;
  }
  uni.navigateTo({ url: `/pages/charter/pay?source=rental&method=${payMethod.value}&total=230&orderNo=ZR2026060988540-EXTRA&carIdx=0&days=3&passenger=张先生&phone=138****8888&product=增程星辉尊享版` });
};
	const onReorder = () => uni.navigateTo({ url: '/pages/rental/index' });
</script>

<style lang="scss" scoped>
.root { height: 100vh; display: flex; flex-direction: column; background: #F9F9F9; overflow: hidden; }
.header { flex-shrink: 0; background: #F9F9F9; }
.hbar { height: 56px; padding: 0 24px; display: flex; align-items: center; gap: 16px; }
.hbar:active { opacity: 0.7; }
.hicon { font-size: 24px; color: #000; }
.htitle { font-size: 20px; font-weight: 700; color: #000; }
.body { flex: 1; overflow-y: auto; padding: 8px 24px 0; }
.sh { padding: 16px 0; }
.st { font-size: 28px; font-weight: 700; color: #000; display: block; }
.ss { font-size: 15px; color: #86868B; display: block; margin-top: 4px; }

.msg { padding: 16px; border-radius: 24px; display: flex; gap: 12px; margin-bottom: 20px; align-items: flex-start; }
.msg-warn { background: rgba(217,119,6,.06); } .msg-ok { background: rgba(0,176,107,.06); }
.msg-err { background: rgba(255,77,79,.06); } .msg-info { background: rgba(0,87,255,.05); }
.mi { font-size: 24px; flex-shrink: 0; }
.msg-warn .mi { color: #D97706; } .msg-ok .mi { color: #00B06B; }
.msg-err .mi { color: #FF4D4F; } .msg-info .mi { color: #0057FF; }
.ml { font-size: 15px; font-weight: 600; display: block; }
.msg-warn .ml { color: #92400E; } .msg-ok .ml { color: #065F46; }
.msg-err .ml { color: #FF4D4F; } .msg-info .ml { color: #0057FF; }
.md { font-size: 15px; font-weight: 600; display: block; }
.msg-warn .md { color: #D97706; }
.msg-ok   .md { color: #00B06B; }
.msg-err  .md { color: #FF4D4F; }
.msg-info .md { color: #0057FF; }

.card { background: #FFF; border: 1px solid #F2F2F2; border-radius: 32px; padding: 20px; margin-bottom: 20px; }
.ctitle { font-size: 20px; font-weight: 600; color: #000; display: block; margin-bottom: 20px; }
.ctitle-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.ctitle-row .ctitle { margin-bottom: 0; }
.ctxt { font-size: 13px; font-weight: 700; }
.ctxt.err { color: #F53F3F; }
.ctxt.warn { color: #FF7D00; }
.ctxt.points { color: #00B42A; }
.billing-link { font-size: 14px; color: #0057FF; }

.route { display: flex; gap: 16px; }
.rr { display: flex; flex-direction: column; align-items: center; padding-top: 6px; width: 6px; }
.rdot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid #FFF; box-shadow: 0 1px 2px rgba(0,0,0,.1); }
.rdot.g { background: #10B981; } .rdot.r { background: #EF4444; }
.rline { width: 1.5px; flex: 1; background: repeating-linear-gradient(#E2E2E2 0 3px, transparent 3px 6px); margin: 4px 0; min-height: 32px; }
.ri { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.rlbl { font-size: 11px; color: #86868B; text-transform: uppercase; letter-spacing: .05em; display: block; margin-bottom: 4px; }
.rval { font-size: 17px; font-weight: 600; color: #000; display: block; }
.rval.s { font-size: 15px; }
.div { height: 1px; background: #F2F2F2; margin: 20px 0; }
.row2 { display: flex; justify-content: space-between; } .tr { text-align: right; }

.assign-r { display: flex; justify-content: space-between; margin-bottom: 0; }
.ared { font-size: 13px; color: #FF4D4F; font-weight: 500; }
.aval { font-size: 15px; color: #1A1C1C; display: block; }
.aval.b { margin-top: 8px; }
.albl { font-size: 11px; color: #86868B; text-transform: uppercase; letter-spacing: .05em; display: block; margin-bottom: 4px; }
.atr { text-align: right; }

.lic { display: flex; align-items: center; gap: 16px; padding: 16px; background: #F2F2F2; border-radius: 16px; }
.licicon { font-size: 32px; color: #0057FF; }
.lict { font-size: 15px; color: #000; display: block; }
.lics { font-size: 11px; color: #86868B; display: flex; align-items: center; gap: 4px; margin-top: 2px; }
.licchk { font-size: 14px; color: #00B06B; }
.carb { height: 100px; background: linear-gradient(135deg,#2c2c2e,#1a1a1c); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
.clbl { font-size: 13px; color: rgba(255,255,255,.5); text-transform: uppercase; letter-spacing: .05em; }
.cpkg { font-size: 15px; color: #86868B; }

.fr { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
.fr.last { align-items: flex-end; }
.fl { font-size: 15px; color: #86868B; } .fl.err { color: #FF4D4F; } .fl.bld { font-size: 17px; font-weight: 700; color: #000; } .fl.points-deduction { color: #00B42A; } .fl-orig { font-size: 12px; color: #86868B; text-decoration: line-through; margin-left: 4px; } .fl-discount { font-size: 12px; color: #FF7D00; }
.fv { font-size: 17px; font-weight: 600; color: #000; } .fv.err { color: #FF4D4F; } .fv.big { font-size: 28px; font-weight: 700; } .fv.deduction { color: #00B42A; } .fv-orig { font-size: 13px; color: #86868B; text-decoration: line-through; }
.fpaid.wait { font-size: 11px; color: #D97706; display: block; }
.extra-badge { font-size: 11px; color: #FF4D4F; font-weight: 600; display: block; }

.tl { position: relative; padding-left: 24px; }
.tlr { position: relative; padding-bottom: 20px; display: flex; }
.tllast { padding-bottom: 0; }
.tldot { position: absolute; left: -20px; top: 1px; width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0; }
.tldot.active { background: #000; }
.tldot.active::after { content: ''; position: absolute; top: 4px; left: 4px; width: 8px; height: 8px; border-radius: 50%; background: #FFF; }
.tldot:not(.active) { background: #F2F2F2; border: 2px solid #E2E2E2; }
.tldot:not(.active).warn { background: #FF4D4F; border-color: #FF4D4F; }
.tldot:not(.active).warn::after { content: ''; position: absolute; top: 4px; left: 4px; width: 8px; height: 8px; border-radius: 50%; background: #FFF; }
.tlline { position: absolute; left: -13px; top: 18px; width: 1.5px; height: calc(100% - 2px); background: #E2E2E2; }
.tli { flex: 1; }
.tlt { font-size: 15px; color: #1A1C1C; display: block; font-weight: 500; line-height: 22px; }
.tltime { font-size: 11px; color: #86868B; display: block; margin-top: 2px; }

.footer { flex-shrink: 0; background: #FFF; border-top: 1px solid rgba(242,242,242,.5); padding: 16px 24px calc(16px + env(safe-area-inset-bottom, 0px)); box-shadow: 0 -10px 40px rgba(0,0,0,.04); display: flex; gap: 16px; }
.btn { flex: 1; height: 56px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 600; gap: 8px; }
.btn:active { opacity: 0.85; transform: scale(0.98); }
.bf { background: #000; color: #FFF; }
.bo { border: 1px solid #F2F2F2; color: #1A1C1C; } .bo.er { border-color: #FF4D4F; color: #FF4D4F; }
.wf { flex: none; width: 100%; }
.ficon { font-size: 18px; }

.paym-list { display: flex; flex-direction: column; gap: 8px; }
.paym-item { display: flex; align-items: center; justify-content: space-between; padding: 16px; border: 1px solid #F2F2F2; border-radius: 16px; background: #F9F9F9; }
.paym-item.act { border-color: #000; background: #FFF; }
.paym-item:active { background: #F2F2F2; }
.paym-left { display: flex; align-items: center; gap: 12px; }
.paym-icon { font-size: 24px; }
.paym-name { font-size: 15px; color: #1A1C1C; font-weight: 500; }
.paym-radio { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #E2E2E2; display: flex; align-items: center; justify-content: center; }
.paym-item.act .paym-radio { border-color: #000; }
.paym-inner { width: 10px; height: 10px; border-radius: 50%; background: #000; }
.paym-btn { height: 56px; background: #000; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin-top: 16px; }
.paym-btn:active { opacity: 0.85; }
.paym-btn-t { font-size: 17px; font-weight: 600; color: #FFF; }

/* 提前结束结算弹窗 */
.ee-list { padding: 4px 0 12px; }
.ee-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; }
.ee-l { font-size: 15px; color: #86868B; }
.ee-v { font-size: 17px; font-weight: 600; color: #000; }
.ee-tip { margin: 8px 0 20px; padding: 16px; border-radius: 16px; font-size: 14px; line-height: 1.6; }
.ee-tip-info { background: rgba(0,87,255,0.06); color: #0057FF; }
.ee-tip-warn { background: rgba(255,77,79,0.06); color: #FF4D4F; }
.ee-actions { display: flex; gap: 16px; padding-bottom: 8px; }

/* 取消订单居中弹窗 */
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 999; display: flex; align-items: center; justify-content: center; }
.modal-center { width: 300px; background: #FFF; border-radius: 24px; padding: 28px 24px 24px; }
.mc-title { font-size: 17px; font-weight: 600; color: #1A1C1C; display: block; text-align: center; margin-bottom: 16px; }
.mc-input { width: 100%; height: 40px; background: #F2F2F2; border-radius: 12px; padding: 0 14px; font-size: 14px; color: #1A1C1C; box-sizing: border-box; margin-bottom: 12px; }
.mc-ph { color: #86868B; font-size: 14px; }
.mc-penalty { text-align: center; font-size: 13px; color: #F53F3F; margin-bottom: 16px; }
.mc-actions { display: flex; gap: 12px; }
.mc-btn { flex: 1; height: 44px; border-radius: 22px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 500; }
.mc-btn.cancel { background: #F2F2F2; color: #4C4546; }
.mc-btn.confirm { background: #FF4D4F; color: #FFF; }
.mc-btn:active { opacity: 0.8; }
.ee-right { display: flex; align-items: center; gap: 4px; }
.ee-arrow { font-size: 18px; color: #C6C6C6; }
.rt-tip { padding: 8px 0 20px; font-size: 15px; line-height: 1.7; color: #1A1C1C; }
.ee-discount-tip { display: flex; gap: 8px; align-items: flex-start; padding: 12px 16px; background: rgba(255,125,0,0.08); border-radius: 12px; margin: 8px 0 16px; }
.ee-dt-icon { font-size: 18px; color: #FF7D00; flex-shrink: 0; }
.ee-dt-text { font-size: 13px; line-height: 1.6; color: #D97706; }
.ee-dt-link { color: #FF7D00; font-weight: 600; }

.fr-right { display: flex; align-items: center; gap: 2px; }
.more-arrow { font-size: 16px; color: #86868B; margin-left: 4px; flex-shrink: 0; }

.fd-mask { position: fixed; inset: 0; background: #FFF; z-index: 999; display: flex; align-items: stretch; justify-content: center; }
/* fd-mask-top：费用明细弹窗（超时/超里程等）保持底部浮层样式 */
.fd-mask-top { z-index: 1001; background: rgba(0,0,0,0.4); align-items: flex-end; }
.fd-mask-top .fd-sheet { height: auto; max-height: 80vh; border-radius: 32px 32px 0 0; }
.fd-sheet { width: 100%; height: 100%; background: #FFF; display: flex; flex-direction: column; overflow: hidden; }
.fd-head { display: flex; align-items: center; justify-content: space-between; padding: 24px 24px 16px; flex-shrink: 0; }
.fd-back { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.fd-back:active { opacity: 0.7; }
.fd-back .material-symbols-outlined { font-size: 24px; color: #1A1C1C; }
.fd-placeholder { width: 32px; height: 32px; flex-shrink: 0; }
.fd-title { font-size: 20px; font-weight: 700; color: #1A1C1C; }
.fd-close { width: 32px; height: 32px; border-radius: 50%; background: #F2F2F2; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.fd-close:active { opacity: 0.7; }
.fd-close .material-symbols-outlined { font-size: 18px; color: #4C4546; }
.fd-body { padding: 0 24px 40px; max-height: 65vh; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.fd-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; }
.fd-row.dth { padding: 8px 0; border-bottom: 1px solid #F2F2F2; }
.fdl { font-size: 14px; color: #4C4546; }
.fdl.bld { font-weight: 700; color: #1A1C1C; }
.fdl-orig { font-size: 14px; color: #86868B; text-decoration: line-through; margin-right: 6px; }
.fdl-orig2 { font-size: 12px; color: #86868B; text-decoration: line-through; margin-right: 4px; }
.fdl-sub { font-size: 13px; color: #5D5F5F; padding-left: 12px; }
.fdl-sub.discount-row { color: #FF7D00; }
.fdv { font-size: 14px; color: #1A1C1C; font-weight: 500; }
.fdv.err { color: #F53F3F; }
.fdv.bld { font-weight: 700; }
.dth-cell { font-size: 12px; color: #86868B; font-weight: 500; flex: 1; text-align: center; }
.dth-cell:first-child { text-align: left; flex: 1.5; }
.fdv-orig { font-size: 12px; color: #86868B; text-decoration: line-through; }
.fd-detail-box { margin: 8px 0; padding: 12px 16px; background: #F5F5F7; border-radius: 12px; display: flex; flex-direction: column; gap: 2px; }
.fd-price-wrap { display: flex; align-items: baseline; gap: 8px; }
.fd-discount { font-size: 12px; color: #FF7D00; }
.fd-hint { font-size: 12px; color: #86868B; }
.fd-div { height: 1px; background: #F2F2F2; margin: 8px 0; }
.fd-date { font-size: 15px; font-weight: 600; color: #1A1C1C; display: block; margin-bottom: 8px; }
.fd-day { margin-bottom: 4px; }
.fd-img-row { display: flex; gap: 12px; padding: 10px 0; }
.fd-img { width: 80px; height: 60px; background: #F2F2F2; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; font-size: 11px; color: #86868B; }
.fd-img .material-symbols-outlined { font-size: 18px; }

.map-card { margin: 0 16px 16px; border-radius: 16px; overflow: hidden; height: 200px; background: #F2F2F2; }
.enroute-map { width: 100%; height: 100%; }
</style>
