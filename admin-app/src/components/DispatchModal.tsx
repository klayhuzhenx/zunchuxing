import { useState, useMemo } from 'react';
import { Modal, Select, Input, Button, Tag, Space, Message, Typography, Table, Radio, Grid } from '@arco-design/web-react';
import { IconLeft, IconRight } from '@arco-design/web-react/icon';
import { vehicles } from '../data/mock';
import type { Order, DaySchedule } from '../types';

const { Text } = Typography;
const { Row, Col } = Grid;

interface Props { visible: boolean; order: Order | null; onClose: () => void; onComplete: (orderId: string, schedules: DaySchedule[]) => void; }

const vehicleOccupation: Record<string, { date: number; label: string; color: string }[]> = {
  '粤B12345': [{ date: 8, label: '包车·王雪梅', color: '#165DFF' }], '粤B67890': [{ date: 9, label: '包车·钱丽华', color: '#165DFF' }],
  '粤B34567': [{ date: 8, label: '租车·何志远', color: '#FF7D00' }], '粤B56789': [], '粤B99999': [], '粤A22222': [], '沪A11111': [],
};
const driverOccupation: Record<string, { date: number; label: string; color: string }[]> = {
  '王师傅': [{ date: 8, label: '包车·王雪梅', color: '#165DFF' }], '李师傅': [{ date: 9, label: '包车·钱丽华', color: '#165DFF' }],
  '赵师傅': [{ date: 8, label: '租车·何志远', color: '#FF7D00' }], '陈师傅': [], '黄师傅': [], '周师傅': [], '刘师傅': [],
};
const allDrivers = ['王师傅','李师傅','赵师傅','陈师傅','黄师傅','周师傅','刘师傅','钱师傅'];

function VehiclePicker({ visible, onClose, onSelect }: { visible: boolean; onClose: () => void; onSelect: (plate: string, model: string) => void }) {
  const [sel, setSel] = useState(''); const [month, setMonth] = useState(new Date().getMonth()+1);
  const y = new Date().getFullYear(); const dim = new Date(y, month, 0).getDate(); const fd = new Date(y, month-1, 1).getDay();
  const calDays = useMemo(() => {
    const days: { day: number; tasks: { label: string; color: string }[] }[] = [];
    for (let i=0;i<fd;i++) days.push({day:0,tasks:[]});
    for (let d=1;d<=dim;d++) days.push({day:d,tasks:sel?(vehicleOccupation[sel]||[]).filter(t=>t.date===d):[]});
    return days;
  }, [sel,month]);
  return (
    <Modal title="选择车辆" visible={visible} onCancel={onClose} footer={null} style={{width:900}}>
      <Row gutter={20}>
        <Col span={8}><Text type="secondary" style={{fontSize:12,marginBottom:8,display:'block'}}>车辆列表</Text>
          <div style={{maxHeight:420,overflow:'auto'}}>
            {vehicles.filter(v=>v.status==='in_use').map(v=>(
              <div key={v.plateNo} onClick={()=>setSel(v.plateNo)} style={{padding:'10px 12px',cursor:'pointer',borderRadius:4,marginBottom:4,background:sel===v.plateNo?'#E8F3FF':'#fafafa',border:sel===v.plateNo?'1px solid #165DFF':'1px solid transparent'}}>
                <div style={{fontWeight:500}}>{v.plateNo}</div><div style={{fontSize:12,color:'#86909c'}}>{v.brand} {v.model} · {v.seats}座</div></div>))}
          </div>
          <Button type="primary" long style={{marginTop:12}} disabled={!sel} onClick={()=>{const v=vehicles.find(x=>x.plateNo===sel);onSelect(sel,v?`${v.brand}${v.model}`:'');onClose();}}>确定选择</Button>
        </Col>
        <Col span={16}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <Button type="text" size="small" icon={<IconLeft/>} onClick={()=>setMonth(m=>m===1?12:m-1)}/><Text style={{fontWeight:500}}>{y}年 {month}月</Text>
            <Button type="text" size="small" icon={<IconRight/>} onClick={()=>setMonth(m=>m===12?1:m+1)}/></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
            {['日','一','二','三','四','五','六'].map(w=><div key={w} style={{textAlign:'center',fontSize:11,color:'#86909c',padding:'4px 0'}}>{w}</div>)}
            {calDays.map((d,i)=><div key={i} style={{minHeight:44,padding:3,fontSize:11,background:d.day===0?'#fafafa':'#fff',border:'1px solid #f0f0f0',color:d.day===0?'transparent':'#1d2129'}}>
              {d.day>0&&<div style={{fontWeight:500,marginBottom:1}}>{d.day}</div>}{d.tasks.map((t,j)=><div key={j} title={t.label} style={{background:t.color,color:'#fff',fontSize:9,padding:'1px 2px',borderRadius:2,marginBottom:1,overflow:'hidden',whiteSpace:'nowrap'}}>{t.label}</div>)}</div>)}</div>
        </Col></Row></Modal>);
}

function DriverPicker({ visible, onClose, onSelect }: { visible: boolean; onClose: () => void; onSelect: (name: string) => void }) {
  const [sel, setSel] = useState(''); const [month, setMonth] = useState(new Date().getMonth()+1);
  const y = new Date().getFullYear(); const dim = new Date(y, month, 0).getDate(); const fd = new Date(y, month-1, 1).getDay();
  const calDays = useMemo(() => {
    const days: { day: number; tasks: { label: string; color: string }[] }[] = [];
    for (let i=0;i<fd;i++) days.push({day:0,tasks:[]});
    for (let d=1;d<=dim;d++) days.push({day:d,tasks:sel?(driverOccupation[sel]||[]).filter(t=>t.date===d):[]});
    return days;
  }, [sel,month]);
  return (
    <Modal title="选择司机" visible={visible} onCancel={onClose} footer={null} style={{width:900}}>
      <Row gutter={20}>
        <Col span={8}><Text type="secondary" style={{fontSize:12,marginBottom:8,display:'block'}}>司机列表</Text>
          <div style={{maxHeight:420,overflow:'auto'}}>
            {allDrivers.map(d=><div key={d} onClick={()=>setSel(d)} style={{padding:'10px 12px',cursor:'pointer',borderRadius:4,marginBottom:4,background:sel===d?'#E8F3FF':'#fafafa',border:sel===d?'1px solid #165DFF':'1px solid transparent'}}><div style={{fontWeight:500}}>{d}</div></div>)}</div>
          <Button type="primary" long style={{marginTop:12}} disabled={!sel} onClick={()=>{onSelect(sel);onClose();}}>确定选择</Button>
        </Col>
        <Col span={16}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <Button type="text" size="small" icon={<IconLeft/>} onClick={()=>setMonth(m=>m===1?12:m-1)}/><Text style={{fontWeight:500}}>{y}年 {month}月</Text>
            <Button type="text" size="small" icon={<IconRight/>} onClick={()=>setMonth(m=>m===12?1:m+1)}/></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
            {['日','一','二','三','四','五','六'].map(w=><div key={w} style={{textAlign:'center',fontSize:11,color:'#86909c',padding:'4px 0'}}>{w}</div>)}
            {calDays.map((d,i)=><div key={i} style={{minHeight:44,padding:3,fontSize:11,background:d.day===0?'#fafafa':'#fff',border:'1px solid #f0f0f0',color:d.day===0?'transparent':'#1d2129'}}>
              {d.day>0&&<div style={{fontWeight:500,marginBottom:1}}>{d.day}</div>}{d.tasks.map((t,j)=><div key={j} title={t.label} style={{background:t.color,color:'#fff',fontSize:9,padding:'1px 2px',borderRadius:2,marginBottom:1,overflow:'hidden',whiteSpace:'nowrap'}}>{t.label}</div>)}</div>)}</div>
        </Col></Row></Modal>);
}

function buildSchedules(order: Order): (DaySchedule & { _key: string })[] {
  const rows: (DaySchedule & { _key: string })[] = []; const days = order.days || 1;
  if (order.type === 'charter' && order.startTime) {
    const sd = new Date(order.startTime); const st = order.startTime.split(' ')[1]?.slice(0,5)||'00:00'; const et = order.endTime?.split(' ')[1]?.slice(0,5)||'23:00';
    for (let i=0;i<days;i++) { const d=new Date(sd);d.setDate(d.getDate()+i); const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; rows.push({_key:ds,date:ds,timeRange:`${st}-${et}`}); }
  }
  return rows;
}

export default function DispatchModal({ visible, order, onClose, onComplete }: Props) {
  const isRental = order?.type === 'rental';
  const [mode, setMode] = useState<'same'|'different'>('same');
  const [vehicle, setVehicle] = useState(''); const [vehicleModel, setVehicleModel] = useState('');
  const [driver, setDriver] = useState('');
  const [deliveryDriver, setDeliveryDriver] = useState(''); const [pickupDriver, setPickupDriver] = useState('');
  const [remark, setRemark] = useState('');
  const [showVehiclePicker, setShowVehiclePicker] = useState(false); const [showDriverPicker, setShowDriverPicker] = useState(false);
  // Per-day: store vehicle + driver for each row
  const [rowVehicles, setRowVehicles] = useState<Record<string,string>>({});
  const [rowVehicleModels, setRowVehicleModels] = useState<Record<string,string>>({});
  const [rowDrivers, setRowDrivers] = useState<Record<string,string>>({});
  const scheduleRows = useMemo(() => order && !isRental ? buildSchedules(order) : [], [order, isRental]);

  const handleSubmit = () => {
    if (!order) return;
    if (isRental) {
      if (!vehicle) { Message.error('请选择车辆'); return; }
      if (!deliveryDriver) { Message.error('请选择送车司机'); return; }
      if (!pickupDriver) { Message.error('请选择收车司机'); return; }
    } else if (mode === 'same') {
      if (!vehicle) { Message.error('请选择车辆'); return; }
      if (!driver) { Message.error('请选择司机'); return; }
    } else {
      for (const row of scheduleRows) {
        if (!rowVehicles[row._key]) { Message.error(`请为 ${row.date} 选择车辆`); return; }
        if (!rowDrivers[row._key]) { Message.error(`请为 ${row.date} 选择司机`); return; }
      }
    }

    let schedules: DaySchedule[];
    if (isRental) {
      schedules = [{ date: order.rentalStart || '', timeRange: '', vehiclePlate: vehicle, vehicleModel, driverName: deliveryDriver, driverPhone: '' }];
    } else if (mode === 'same') {
      schedules = scheduleRows.map(row => ({ date: row.date, timeRange: row.timeRange, vehiclePlate: vehicle, vehicleModel, driverName: driver, driverPhone: '' }));
    } else {
      schedules = scheduleRows.map(row => ({
        date: row.date, timeRange: row.timeRange,
        vehiclePlate: rowVehicles[row._key],
        vehicleModel: rowVehicleModels[row._key] || vehicles.find(v=>v.plateNo===rowVehicles[row._key])?.brand + (vehicles.find(v=>v.plateNo===rowVehicles[row._key])?.model||''),
        driverName: rowDrivers[row._key], driverPhone: ''
      }));
    }
    const isChange = order.status==='pending_start'||order.status==='ongoing';
    Message.success(isChange?'改派成功':'派车成功');
    onComplete(order.id, schedules);
  };

  const selectVehicleForRow = (key: string, plate: string, model: string) => {
    setRowVehicles(prev => ({...prev, [key]: plate}));
    setRowVehicleModels(prev => ({...prev, [key]: model}));
  };

  // Per-row vehicle picker state
  const [rowPickerTarget, setRowPickerTarget] = useState<string>('');

  return (
    <Modal title={order?.status==='pending_dispatch'?'派车':'改派'} visible={visible} onOk={handleSubmit} onCancel={onClose} style={{width:960}} okText="确认派车">
      {order && <div style={{display:'flex',gap:20}}>
        <div style={{flex:'0 0 250px',borderRight:'1px solid #e5e6eb',paddingRight:20}}>
          <Text type="secondary" style={{fontSize:12,marginBottom:8,display:'block'}}>订单概览</Text>
          <div style={{fontSize:13,lineHeight:2}}>
            <div><Text type="secondary">订单号：</Text>{order.orderNo}</div>
            <div><Text type="secondary">类型：</Text><Tag color={isRental?'purple':'arcoblue'} size="small">{isRental?'租车出行':'包车出行'}</Tag></div>
            <div><Text type="secondary">天数：</Text>{order.days}天</div>
            <div style={{marginTop:4}}><Text type="secondary">{isRental?'取还车：':'上下车：'}</Text></div>
            <div style={{fontSize:12}}>{order.pickupAddress}</div><div style={{fontSize:12,marginTop:4,marginBottom:8}}>↓ {order.dropoffAddress}</div>
            <div><Text type="secondary">乘客：</Text>{order.passengerName||'—'} {order.passengerPhone}</div>
          </div>
        </div>

        <div style={{flex:1}}>
          {isRental ? (
            <>
              {/* 租车：车辆 + 送车司机 + 收车司机 */}
              <div style={{marginBottom:16}}>
                <Text type="secondary" style={{fontSize:12,marginBottom:4,display:'block'}}>选择车辆</Text>
                <div onClick={()=>setShowVehiclePicker(true)} style={{border:'1px solid #c9cdd4',borderRadius:4,padding:'8px 12px',cursor:'pointer',minHeight:40,display:'flex',alignItems:'center',background:vehicle?'#E8FFEA':'#fff'}}>
                  {vehicle?<Space><Tag color="green">{vehicle}</Tag><span style={{fontSize:13,color:'#86909c'}}>{vehicleModel}</span></Space>:<span style={{color:'#c9cdd4',fontSize:13}}>点击选择车辆</span>}
                </div>
              </div>
              <Row gutter={16} style={{marginBottom:16}}>
                <Col span={12}><Text type="secondary" style={{fontSize:12,marginBottom:4,display:'block'}}>送车司机</Text>
                  <Select placeholder="选择送车司机" value={deliveryDriver||undefined} onChange={setDeliveryDriver} options={allDrivers.map(d=>({label:d,value:d}))} style={{width:'100%'}} allowClear /></Col>
                <Col span={12}><Text type="secondary" style={{fontSize:12,marginBottom:4,display:'block'}}>收车司机</Text>
                  <Select placeholder="选择收车司机" value={pickupDriver||undefined} onChange={setPickupDriver} options={allDrivers.map(d=>({label:d,value:d}))} style={{width:'100%'}} allowClear /></Col>
              </Row>
            </>
          ) : (
            <>
              <div style={{marginBottom:12}}><Radio.Group value={mode} onChange={setMode} type="button"><Radio value="same">统一车辆与司机（所有日程相同）</Radio><Radio value="different">按日分配车辆与司机（每天可不同）</Radio></Radio.Group></div>
              {mode==='same'?(
                <>
                  <div style={{marginBottom:16}}>
                    <Text type="secondary" style={{fontSize:12,marginBottom:4,display:'block'}}>选择车辆</Text>
                    <div onClick={()=>setShowVehiclePicker(true)} style={{border:'1px solid #c9cdd4',borderRadius:4,padding:'8px 12px',cursor:'pointer',minHeight:40,display:'flex',alignItems:'center',background:vehicle?'#E8FFEA':'#fff'}}>
                      {vehicle?<Space><Tag color="green">{vehicle}</Tag><span style={{fontSize:13,color:'#86909c'}}>{vehicleModel}</span></Space>:<span style={{color:'#c9cdd4',fontSize:13}}>点击选择车辆</span>}
                    </div>
                  </div>
                  <div style={{marginBottom:16}}><Text type="secondary" style={{fontSize:12,marginBottom:4,display:'block'}}>选择司机</Text>
                    <div onClick={()=>setShowDriverPicker(true)} style={{border:'1px solid #c9cdd4',borderRadius:4,padding:'8px 12px',cursor:'pointer',minHeight:40,display:'flex',alignItems:'center',background:driver?'#E8FFEA':'#fff'}}>
                      {driver?<Tag color="green">{driver}</Tag>:<span style={{color:'#c9cdd4',fontSize:13}}>点击选择司机</span>}</div></div>
                </>
              ):(
                <Table
                  columns={[
                    {title:'日期',dataIndex:'date',width:110},
                    {title:'时段',dataIndex:'timeRange',width:110},
                    {title:'车辆',width:160,render:(_:unknown,row:{_key:string})=>(
                      rowVehicles[row._key]
                        ? <div style={{display:'flex',alignItems:'center',gap:4,cursor:'pointer'}} onClick={()=>{setRowPickerTarget(row._key);setShowVehiclePicker(true);}}>
                            <Tag color="green" size="small">{rowVehicles[row._key]}</Tag>
                            <span style={{fontSize:11,color:'#86909c'}}>{rowVehicleModels[row._key]||''}</span>
                          </div>
                        : <Button size="mini" type="dashed" onClick={()=>{setRowPickerTarget(row._key);setShowVehiclePicker(true);}}>选车</Button>
                    )},
                    {title:'司机',width:150,render:(_:unknown,row:{_key:string})=>(
                      <Select placeholder="选择司机" value={rowDrivers[row._key]||undefined} onChange={v=>setRowDrivers(prev=>({...prev,[row._key]:v}))} options={allDrivers.map(d=>({label:d,value:d}))} style={{width:'100%'}} size="small" allowClear />
                    )},
                  ]}
                  data={scheduleRows} rowKey="_key" pagination={false} size="small" style={{marginBottom:16}} />
              )}
            </>
          )}

          <div style={{marginTop:16}}><Text type="secondary" style={{fontSize:12,marginBottom:4,display:'block'}}>派车备注</Text>
            <Input.TextArea placeholder="选填" value={remark} onChange={setRemark} maxLength={200} showWordLimit rows={2} /></div>
        </div>
      </div>}
      <VehiclePicker visible={showVehiclePicker} onClose={()=>setShowVehiclePicker(false)}
        onSelect={(p,m)=>{
          if (isRental || mode === 'same') { setVehicle(p); setVehicleModel(m); }
          else if (rowPickerTarget) { selectVehicleForRow(rowPickerTarget, p, m); setRowPickerTarget(''); }
        }}/>
      <DriverPicker visible={showDriverPicker} onClose={()=>setShowDriverPicker(false)} onSelect={setDriver}/>
    </Modal>);
}
