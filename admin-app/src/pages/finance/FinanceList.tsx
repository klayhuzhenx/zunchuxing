import { useState, useMemo, useRef } from 'react';
import {
  Card, Table, Tag, Button, Select, Space, Tabs, Modal, Message, Input, Drawer, Descriptions, InputNumber, DatePicker, Upload,
} from '@arco-design/web-react';
import { IconDownload, IconUpload } from '@arco-design/web-react/icon';
import { enterpriseBills, billOrderItems, billRefundItems, transactions } from '../../data/mock';
import type { EnterpriseBill, Transaction, SettlementStatus, TransactionType } from '../../types';

const settlementMap: Record<SettlementStatus, { label: string; color: string }> = {
  pending: { label: '待结算', color: 'orangered' },
  partial: { label: '部分结算', color: 'arcoblue' },
  settled: { label: '已结算', color: 'green' },
};

const txnTypeMap: Record<TransactionType, { label: string; color: string }> = {
  payment: { label: '支付', color: 'green' },
  refund: { label: '退款', color: 'red' },
  extra_payment: { label: '补款', color: 'orangered' },
};


// ===== 企业账单 Tab =====
function BillTab() {
  const [bills] = useState<EnterpriseBill[]>(enterpriseBills);
  const [monthFilter, setMonthFilter] = useState('2026-06');
  const [settleFilter, setSettleFilter] = useState<string[]>([]);
  const [enterpriseFilter, setEnterpriseFilter] = useState('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState<EnterpriseBill | null>(null);
  const [settleVisible, setSettleVisible] = useState(false);
  const [settleAmount, setSettleAmount] = useState<number>(0);
  const [settleFile, setSettleFile] = useState<File | null>(null);
  const [settleConfirmVisible, setSettleConfirmVisible] = useState(false);
  const [genBillVisible, setGenBillVisible] = useState(false);
  const [genBillMonth, setGenBillMonth] = useState('2026-07');

  const filtered = useMemo(() => {
    let result = bills;
    if (monthFilter) result = result.filter(b => b.month === monthFilter);
    if (settleFilter.length > 0) result = result.filter(b => settleFilter.includes(b.status));
    if (enterpriseFilter) result = result.filter(b => b.enterpriseName.includes(enterpriseFilter));
    return result;
  }, [bills, monthFilter, settleFilter, enterpriseFilter]);

  const summary = useMemo(() => ({
    consumption: filtered.reduce((s, b) => s + b.consumption, 0),
    refund: filtered.reduce((s, b) => s + b.refund, 0),
    pending: filtered.reduce((s, b) => s + b.pendingAmount, 0),
    settled: filtered.reduce((s, b) => s + b.settledAmount, 0),
  }), [filtered]);

  const openDetail = (b: EnterpriseBill) => { setSelectedBill(b); setDetailVisible(true); };

  const openSettle = (b: EnterpriseBill) => {
    setSelectedBill(b);
    setSettleAmount(b.pendingAmount);
    setSettleFile(null);
    setSettleVisible(true);
  };

  const handleSettleConfirm = () => {
    if (!selectedBill) return;
    if (!settleAmount || settleAmount <= 0) { Message.warning('请输入结算金额'); return; }
    if (settleAmount > selectedBill.pendingAmount) { Message.warning(`结算金额不能超过待结算总额 ¥${selectedBill.pendingAmount.toLocaleString()}`); return; }
    if (!settleFile) { Message.warning('请上传客户支付凭证'); return; }
    setSettleConfirmVisible(true);
  };

  const handleSettleSubmit = () => {
    setSettleConfirmVisible(false);
    setSettleVisible(false);
    Message.success('结算已确认');
  };

  const handleGenerateBill = () => {
    if (bills.some(b => b.month === genBillMonth)) {
      Message.warning(`${genBillMonth} 账单已存在，无需重复生成`);
      return;
    }
    Message.loading('账单生成中…');
    setTimeout(() => { Message.success(`${genBillMonth} 账单已生成`); setGenBillVisible(false); }, 800);
  };

  const columns = [
    { title: '账单编号', dataIndex: 'billNo', width: 160, render: (v: string, r: EnterpriseBill) => <a onClick={() => openDetail(r)}>{v}</a> },
    { title: '企业名称', dataIndex: 'enterpriseName', width: 140 },
    { title: '账单月份', dataIndex: 'month', width: 100 },
    { title: '当期消费', width: 110, render: (_: unknown, r: EnterpriseBill) => <span>¥{r.consumption.toLocaleString()}</span> },
    { title: '当期退款', width: 110, render: (_: unknown, r: EnterpriseBill) => <span style={{ color: '#00B42A' }}>¥{r.refund.toLocaleString()}</span> },
    { title: '待结算总额', width: 120, render: (_: unknown, r: EnterpriseBill) => <span style={{ color: '#F53F3F', fontWeight: 500 }}>¥{r.pendingAmount.toLocaleString()}</span> },
    { title: '已结算金额', width: 120, render: (_: unknown, r: EnterpriseBill) => <span style={{ color: '#00B42A' }}>¥{r.settledAmount.toLocaleString()}</span> },
    { title: '结算状态', dataIndex: 'status', width: 90, render: (v: SettlementStatus) => <Tag color={settlementMap[v].color} size="small">{settlementMap[v].label}</Tag> },
    {
      title: '操作', width: 200, fixed: 'right' as const, render: (_: unknown, r: EnterpriseBill) => (
        <Space size={4}>
          <Button type="text" size="small" onClick={() => openDetail(r)}>详情</Button>
          {r.status !== 'settled' && <Button type="text" size="small" status="warning" onClick={() => openSettle(r)}>结算</Button>}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 筛选行 */}
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <Select placeholder="账单月份" style={{ width: 140 }} value={monthFilter} onChange={setMonthFilter}
            options={['2026-04', '2026-05', '2026-06'].map(m => ({ label: m, value: m }))} allowClear />
          <Select placeholder="结算状态" style={{ width: 200 }} mode="multiple" value={settleFilter} onChange={setSettleFilter}
            options={[{ label: '待结算', value: 'pending' }, { label: '部分结算', value: 'partial' }, { label: '已结算', value: 'settled' }]} />
          <Select placeholder="企业" style={{ width: 160 }} value={enterpriseFilter || undefined} onChange={v => setEnterpriseFilter(v || '')} allowClear showSearch
            options={[...new Set(bills.map(b => b.enterpriseName))].map(n => ({ label: n, value: n }))} />
          <div style={{ flex: 1 }} />
          <Button type="outline" onClick={() => setGenBillVisible(true)}>刷新</Button>
          <Button icon={<IconDownload />} type="outline" onClick={() => Message.success('导出成功')}>导出</Button>
        </Space>
      </Card>

      {/* 汇总卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        <Card bodyStyle={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 13, color: '#86909c', marginBottom: 4 }}>当期消费</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1d2129' }}>¥{summary.consumption.toLocaleString()}</div>
        </Card>
        <Card bodyStyle={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 13, color: '#86909c', marginBottom: 4 }}>当期退款</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#00B42A' }}>¥{summary.refund.toLocaleString()}</div>
        </Card>
        <Card bodyStyle={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 13, color: '#86909c', marginBottom: 4 }}>待结算总额</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#F53F3F' }}>¥{summary.pending.toLocaleString()}</div>
        </Card>
        <Card bodyStyle={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 13, color: '#86909c', marginBottom: 4 }}>已结算金额</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#165DFF' }}>¥{summary.settled.toLocaleString()}</div>
        </Card>
      </div>



      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 1300 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>

      {/* Bill Detail Drawer */}
      <Drawer width="60%" title={selectedBill ? `账单详情 - ${selectedBill.billNo}` : '账单详情'} visible={detailVisible} onCancel={() => setDetailVisible(false)} footer={null}>
        {selectedBill && (
          <div>
            <Card title="账单概要" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small" data={[
                { label: '账单编号', value: selectedBill.billNo },
                { label: '企业名称', value: selectedBill.enterpriseName },
                { label: '账单月份', value: selectedBill.month },
                { label: '结算状态', value: <Tag color={settlementMap[selectedBill.status].color} size="small">{settlementMap[selectedBill.status].label}</Tag> },
                { label: '当期消费', value: `¥${selectedBill.consumption.toLocaleString()}` },
                { label: '当期退款', value: <span style={{ color: '#00B42A' }}>¥${selectedBill.refund.toLocaleString()}</span> },
                { label: '待结算总额', value: <span style={{ color: '#F53F3F', fontWeight: 500 }}>¥${selectedBill.pendingAmount.toLocaleString()}</span> },
                { label: '已结算金额', value: `¥${selectedBill.settledAmount.toLocaleString()}` },
              ]} />
            </Card>

            <Card title="账单明细" size="small" style={{ marginBottom: 16 }}
              extra={<Button type="text" size="small" icon={<IconDownload />} onClick={() => Message.success('导出成功')}>导出</Button>}
            >
              <Tabs defaultActiveTab="consumption">
                <Tabs.TabPane key="consumption" title="消费明细">
                  <Table columns={[
                    { title: '日期', dataIndex: 'date' }, { title: '订单号', dataIndex: 'orderNo' },
                    { title: '类型', dataIndex: 'type', render: (v: string) => v === 'charter' ? '包车' : '租车' },
                    { title: '用车人', dataIndex: 'passenger' }, { title: '金额', dataIndex: 'amount', render: (v: number) => `¥${v.toLocaleString()}` },
                    { title: '结算状态', dataIndex: 'settled', render: (v: boolean) => v ? <Tag color="green" size="small">已结算</Tag> : <Tag color="orangered" size="small">未结算</Tag> },
                  ]} data={billOrderItems.filter(i => selectedBill.month.startsWith(i.date.slice(0, 7)))} rowKey="orderNo" pagination={false} size="small" />
                </Tabs.TabPane>
                <Tabs.TabPane key="refund" title="退款明细">
                  <Table columns={[
                    { title: '日期', dataIndex: 'date' }, { title: '退款单号', dataIndex: 'refundNo' },
                    { title: '关联订单', dataIndex: 'orderNo' }, { title: '金额', dataIndex: 'amount', render: (v: number) => <span style={{ color: '#00B42A' }}>¥{v.toLocaleString()}</span> },
                    { title: '原因', dataIndex: 'reason' },
                  ]} data={billRefundItems.filter(i => selectedBill.month.startsWith(i.date.slice(0, 7)))} rowKey="refundNo" pagination={false} size="small" />
                </Tabs.TabPane>
              </Tabs>
            </Card>

            <Card title="额度变动记录" size="small" style={{ marginBottom: 16 }}>
              {(() => {
                const records = [
                  { time: '2026-06-01 00:00', type: '调增', amount: 50000, operator: '张运营', note: '线下打款 ¥50,000' },
                  { time: '2026-06-03 14:20', type: '调减', amount: -10000, operator: '李运营', note: '记账纠错' },
                ].filter(r => r.time.startsWith(selectedBill.month));
                return records.length > 0 ? (
                  <Table columns={[
                    { title: '时间', dataIndex: 'time', width: 160 },
                    { title: '类型', dataIndex: 'type', width: 70, render: (v: string) => <Tag color={v === '调增' ? 'green' : 'red'} size="small">{v}</Tag> },
                    { title: '金额', width: 110, render: (_: unknown, r: typeof records[0]) => <span style={{ color: r.amount > 0 ? '#00B42A' : '#F53F3F' }}>{r.amount > 0 ? `+¥${r.amount.toLocaleString()}` : `-¥${Math.abs(r.amount).toLocaleString()}`}</span> },
                    { title: '操作员', dataIndex: 'operator' },
                    { title: '备注', dataIndex: 'note' },
                  ]} data={records} rowKey="time" pagination={false} size="small" />
                ) : <div style={{ color: '#86909c', textAlign: 'center', padding: 24 }}>当月无限度变动</div>;
              })()}
            </Card>
          </div>
        )}
      </Drawer>

      {/* Generate Bill Modal */}
      <Modal title="生成账单" visible={genBillVisible}
        onOk={handleGenerateBill}
        onCancel={() => setGenBillVisible(false)}
      >
        <p style={{ marginBottom: 12 }}>系统每月1日自动生成上月账单，也可手动触发生成。当月账单不展示。</p>
        <Select placeholder="选择月份" style={{ width: '100%' }} value={genBillMonth} onChange={setGenBillMonth}
          options={['2026-04', '2026-05', '2026-06', '2026-07'].map(m => ({ label: m, value: m }))} />
      </Modal>

      {/* Settle Modal */}
      <Modal title="确认结算" visible={settleVisible}
        onOk={handleSettleConfirm}
        onCancel={() => setSettleVisible(false)}
        okText="确认"
        okButtonProps={{ disabled: !settleAmount || settleAmount <= 0 || (selectedBill !== null && settleAmount > selectedBill.pendingAmount) || !settleFile }}
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ marginBottom: 8, fontSize: 13, color: '#86909c' }}>本次结算金额（不超过待结算总额 <strong>¥{selectedBill?.pendingAmount.toLocaleString()}</strong>）</p>
          <InputNumber value={settleAmount} onChange={v => setSettleAmount(v || 0)} min={0} max={selectedBill?.pendingAmount || 0} style={{ width: '100%' }} suffix="元" />
        </div>
        <div>
          <p style={{ marginBottom: 8, fontSize: 13, color: '#86909c' }}>上传客户支付凭证（支持 jpg / png / pdf）</p>
          <Upload
            autoUpload={false}
            limit={1}
            accept=".jpg,.jpeg,.png,.pdf"
            fileList={settleFile ? [{ uid: '-1', name: settleFile.name, status: 'done' } as any] : []}
            onChange={(files) => { setSettleFile(files[0]?.originFile || null); }}
          >
            <Button icon={<IconUpload />} type="outline">选择文件</Button>
          </Upload>
        </div>
      </Modal>

      {/* Secondary Confirm for Settlement */}
      <Modal title="确认提交" visible={settleConfirmVisible}
        onOk={handleSettleSubmit}
        onCancel={() => setSettleConfirmVisible(false)}
        okText="确认提交"
        okButtonProps={{ status: 'danger' }}
      >
        <p>确认提交后结算记录不可撤回，是否继续？</p>
        {selectedBill && (
          <div style={{ marginTop: 12, padding: 12, background: '#f7f8fa', borderRadius: 8 }}>
            <p>结算金额：<strong>¥{settleAmount.toLocaleString()}</strong></p>
            <p>企业：{selectedBill.enterpriseName}</p>
            <p>账单月份：{selectedBill.month}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ===== 交易流水 Tab =====
function TransactionTab() {
  const [txns] = useState<Transaction[]>(transactions);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [methodFilter, setMethodFilter] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [txnDateRange, setTxnDateRange] = useState<[string, string] | null>(null);
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    let result = txns;
    if (typeFilter.length > 0) result = result.filter(t => typeFilter.includes(t.type));
    if (methodFilter.length > 0) result = result.filter(t => methodFilter.includes(t.paymentMethod));
    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(t => t.txnNo.toLowerCase().includes(kw) || t.orderNo.toLowerCase().includes(kw) || t.party.toLowerCase().includes(kw));
    }
    if (txnDateRange) {
      const [s, e] = txnDateRange;
      result = result.filter(t => t.time >= s && t.time <= (e + ' 23:59:59'));
    }
    if (amountMin) result = result.filter(t => Math.abs(t.amount) >= Number(amountMin));
    if (amountMax) result = result.filter(t => Math.abs(t.amount) <= Number(amountMax));
    return result;
  }, [txns, typeFilter, methodFilter, keyword, txnDateRange, amountMin, amountMax]);

  const openDetail = (t: Transaction) => { setSelectedTxn(t); setDetailVisible(true); };

  const summary = useMemo(() => {
    const pay = filtered.filter(t => t.type === 'payment' || t.type === 'extra_payment').reduce((s, t) => s + t.amount, 0);
    const refund = filtered.filter(t => t.type === 'refund').reduce((s, t) => s + Math.abs(t.amount), 0);
    return { pay, refund, net: pay - refund };
  }, [filtered]);

  const columns = [
    { title: '流水号', dataIndex: 'txnNo', width: 170, render: (v: string, r: Transaction) => <a onClick={() => openDetail(r)}>{v}</a> },
    { title: '关联订单', dataIndex: 'orderNo', width: 160 },
    { title: '交易类型', dataIndex: 'type', width: 80, render: (v: TransactionType) => <Tag color={txnTypeMap[v].color} size="small">{txnTypeMap[v].label}</Tag> },
    { title: '支付方式', dataIndex: 'paymentMethod', width: 120, render: (v: string) => {
      const map: Record<string, string> = { enterprise_credit: '企业额度支付', alipay: '支付宝', wechat: '微信' };
      return map[v] || v;
    }},
    { title: '金额', dataIndex: 'amount', width: 110, render: (v: number) => <span style={{ color: v < 0 ? '#00B42A' : '#1d2129', fontWeight: 500 }}>{v < 0 ? `-¥${Math.abs(v).toLocaleString()}` : `¥${v.toLocaleString()}`}</span> },
    { title: '交易方', dataIndex: 'party', width: 200, ellipsis: true },
    { title: '交易时间', dataIndex: 'time', width: 160 },
  ];

  return (
    <div>
      {/* Filters */}
      <Card bodyStyle={{ padding: '12px 24px' }} style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <Input placeholder="流水号/订单号/交易方" style={{ width: 240 }} value={keyword} onChange={setKeyword} allowClear />
          <Select placeholder="交易类型" style={{ width: 180 }} mode="multiple" value={typeFilter} onChange={setTypeFilter}
            options={[{ label: '支付', value: 'payment' }, { label: '退款', value: 'refund' }, { label: '补款', value: 'extra_payment' }]} />
          <Select placeholder="支付方式" style={{ width: 200 }} mode="multiple" value={methodFilter} onChange={setMethodFilter}
            options={[{ label: '企业额度支付', value: 'enterprise_credit' }, { label: '支付宝', value: 'alipay' }, { label: '微信', value: 'wechat' }]} />
          <DatePicker.RangePicker style={{ width: 260 }} placeholder={['交易时间起', '交易时间止']}
            onChange={(_, ds) => setTxnDateRange(ds && ds[0] && ds[1] ? ds as [string, string] : null)} />
          <Input placeholder="金额≥" style={{ width: 100 }} value={amountMin} onChange={setAmountMin} allowClear />
          <span style={{ color: '#86909c' }}>~</span>
          <Input placeholder="金额≤" style={{ width: 100 }} value={amountMax} onChange={setAmountMax} allowClear />
          <div style={{ flex: 1 }} />
          <Button icon={<IconDownload />}>导出</Button>
        </Space>
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <Table columns={columns} data={filtered} rowKey="id" scroll={{ x: 1300 }} pagination={{ pageSize: 15, showTotal: true }} stripe />
      </Card>

      {/* Transaction Detail */}
      <Drawer width="40%" title="流水详情" visible={detailVisible} onCancel={() => setDetailVisible(false)} footer={null}>
        {selectedTxn && (
          <Descriptions column={1} size="small" data={[
            { label: '流水号', value: selectedTxn.txnNo },
            { label: '关联订单', value: selectedTxn.orderNo },
            { label: '交易类型', value: <Tag color={txnTypeMap[selectedTxn.type].color} size="small">{txnTypeMap[selectedTxn.type].label}</Tag> },
            { label: '支付方式', value: { enterprise_credit: '企业额度支付', alipay: '支付宝', wechat: '微信' }[selectedTxn.paymentMethod] || selectedTxn.paymentMethod },
            { label: '金额', value: <span style={{ color: selectedTxn.amount < 0 ? '#00B42A' : '#1d2129', fontWeight: 500, fontSize: 16 }}>{selectedTxn.amount < 0 ? `-¥${Math.abs(selectedTxn.amount).toLocaleString()}` : `¥${selectedTxn.amount.toLocaleString()}`}</span> },
            { label: '交易方', value: selectedTxn.party },
            { label: '交易时间', value: selectedTxn.time },
            { label: '状态', value: <Tag color={txnStatusMap[selectedTxn.status].color} size="small">{txnStatusMap[selectedTxn.status].label}</Tag> },
          ]} />
        )}
      </Drawer>
    </div>
  );
}

// ===== 主组件 =====
export default function FinanceList() {
  const [activeTab, setActiveTab] = useState('bills');

  return (
    <div>
      <Tabs activeTab={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }}>
        <Tabs.TabPane key="bills" title="企业账单" />
        <Tabs.TabPane key="transactions" title="交易流水" />
      </Tabs>

      {activeTab === 'bills' ? <BillTab /> : <TransactionTab />}
    </div>
  );
}
