/* Shared inventory and workflow. Existing v1 storage keys remain compatible. */
(() => {
  'use strict';
  const DEFAULT_DEVICES = [
      {
        id: "2509154E",
        type: "wind",
        name: "手持气象站",
        model: "Kestrel 5500 Link",
        category: "气象与风雨监测类",
        location: "实验室603-防潮柜",
        status: "可预订",
        usage: "用于现场风速、温湿度、气压等气象参数快速测量。",
        scenarios: "室外热环境测试、风环境测量、气象参数记录、课程实验。",
        notes: "借用前确认电量、保护套和蓝牙连接状态；外场使用后擦拭清洁。",
        booked: [13, 18],
        openToStudent: true
      },
      {
        id: "2421281E",
        type: "wind",
        name: "风速计",
        model: "senseca HD2003.1",
        category: "气象与风雨监测类",
        location: "实验室7楼",
        status: "需确认",
        usage: "用于现场风速测量，适合室内外通风和边界层观测。",
        scenarios: "通风廊道、室外风环境、空调送风口、课程实验。",
        notes: "借用前确认探头、延长线和支架是否齐全。",
        booked: [14, 15, 21],
        openToStudent: true
      },
      {
        id: "2404929E",
        type: "light",
        name: "四分量净辐射表",
        model: "Hukseflux NR01",
        category: "辐射与热舒适监测类",
        location: "实验室603-防潮柜",
        status: "可预订",
        usage: "用于短波、长波辐射分量观测。",
        scenarios: "室外辐射实验、热环境监测、屋面或庭院辐射观测。",
        notes: "搬运时保护探头表面，安装时保持水平，避免遮挡。",
        booked: [13, 16],
        openToStudent: true
      },
      {
        id: "2509148E",
        type: "light",
        name: "室内温湿度照度数据记录器",
        model: "ONSET MX1104",
        category: "环境温湿度监测类",
        location: "实验室603-防潮柜",
        status: "可预订",
        usage: "用于室内温湿度和照度连续记录。",
        scenarios: "教室、办公室、实验空间、展厅光热环境监测。",
        notes: "布点前确认采样间隔和电量，归还时导出原始数据。",
        booked: [17, 22],
        openToStudent: true
      },
      {
        id: "2509155E",
        type: "heat",
        name: "温湿度记录器",
        model: "ONSET MX1101",
        category: "环境温湿度监测类",
        location: "实验室603-防潮柜",
        status: "可预订",
        usage: "用于短期室内温湿度采样，适合多点布设。",
        scenarios: "房间热环境、材料实验、室内舒适度观察。",
        notes: "使用前设置采样间隔，归还时上传对应时间段原始数据。",
        booked: [19],
        openToStudent: true
      },
      {
        id: "2508192E",
        type: "heat",
        name: "热舒适度仪器",
        model: "DELTAOHM HD323TC",
        category: "辐射与热舒适监测类",
        location: "实验室603-防潮柜",
        status: "可预订",
        usage: "用于热舒适相关参数测量。",
        scenarios: "人体热舒适实验、室内外热环境对比、课程实验。",
        notes: "需确认探头、支架和供电方式，使用后按原箱位归还。",
        booked: [15, 16, 23],
        openToStudent: true
      },
      {
        id: "2420809E",
        type: "rain",
        name: "雨滴谱仪",
        model: "OTT Parsivel2",
        category: "气象与风雨监测类",
        location: "实验室7楼",
        status: "需确认",
        usage: "用于降雨粒径、速度和降雨强度观测。",
        scenarios: "降雨过程监测、外场气象观测、课程展示。",
        notes: "安装位置和供电需管理员确认，雨天外场使用后检查防水。",
        booked: [13, 14, 20, 21],
        openToStudent: true
      },
      {
        id: "2421280E",
        type: "rain",
        name: "雨量传感器",
        model: "锦州 LQC-YF12",
        category: "气象与风雨监测类",
        location: "实验室7楼",
        status: "可预订",
        usage: "用于雨量采集，通常配合采集器使用。",
        scenarios: "屋面雨量观测、雨水实验、外场降水监测。",
        notes: "借用时确认数据线、支架和采集器接口。",
        booked: [18],
        openToStudent: true
      },
      {
        id: "2404323E",
        type: "electric",
        name: "数据采集器",
        model: "DV105 TRUWEL/DL1000X",
        category: "数据采集与测量模块类",
        location: "实验室603",
        status: "可预订",
        usage: "用于多通道数据采集任务。",
        scenarios: "雨量传感器、辐射表、电压信号和外场连续记录。",
        notes: "借用前确认通道配置，归还时一并上传原始数据文件。",
        booked: [14, 15],
        openToStudent: true
      },
      {
        id: "2404325E",
        type: "electric",
        name: "电压测量模块",
        model: "TRUWEL/DV105",
        category: "数据采集与测量模块类",
        location: "实验室603",
        status: "可预订",
        usage: "配合数据采集器进行电压信号测量。",
        scenarios: "传感器输出、电源监测、外场采集系统。",
        notes: "确认接线端子和量程，避免反接。",
        booked: [16],
        openToStudent: true
      },
      {
        id: "2604547E",
        type: "electric",
        name: "蓄电池",
        model: "EASY SOLAR 旗圣锂电池",
        category: "电源与供电设备类",
        location: "实验室7楼",
        status: "需确认",
        usage: "用于室外采集任务临时供电。",
        scenarios: "长期外场采集、雨量监测、辐射监测供电。",
        notes: "借用前确认电量、充电器和输出接口。",
        booked: [13, 22],
        openToStudent: true
      }
    ];
  const KEYS = { devices:'scd_device_inventory_v1', records:'scd_device_borrow_records_v1', uploads:'scd_device_data_uploads_v1', profile:'scd_device_common_profile_v1' };
  const CATEGORIES = ['环境温湿度监测类','气象与风雨监测类','辐射与热舒适监测类','数据采集与测量模块类','电源与供电设备类','实验辅助类','计算显示类','其他类'];
  const SHORT = ['温湿度监测','气象与风雨','辐射与热舒适','数据采集','电源设备','实验辅助','计算显示','其他'];
  const PAGES = {home:'student_device_home.html',borrow:'student_borrow_stage2.html',returns:'student_return_stage4.html',data:'student_data_stage5.html',status:'student_status_stage6.html',admin:'admin_device_dashboard.html'};
  const $ = (selector, parent=document) => parent.querySelector(selector);
  const $$ = (selector, parent=document) => [...parent.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const params = new URLSearchParams(typeof location==='undefined'?'':location.search);
  const route = (page, args={}) => { const query = new URLSearchParams(Object.entries(args).filter(([,v]) => v !== '' && v != null)); return PAGES[page] + (query.size ? '?' + query : ''); };
  const uid = prefix => prefix + '-' + (globalThis.crypto?.randomUUID?.() || Date.now() + '-' + Math.random().toString(36).slice(2));
  const validDate = value => value && Number.isFinite(new Date(value).getTime());
  const time = value => validDate(value) ? new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value)) : '未填写';
  const stamp = () => new Date().toLocaleString('zh-CN',{hour12:false});
  const localInput = value => { if (!validDate(value)) return ''; const d=new Date(value); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
  const dayKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const period = record => `${time(record.startAt)} 至 ${time(record.endAt)}`;
  function read(key, fallback=[]) {
    const raw=localStorage.getItem(key);
    if(raw === null) return fallback;
    try { const value=JSON.parse(raw); if(Array.isArray(fallback) && !Array.isArray(value)) throw new Error(); if(!Array.isArray(fallback) && (!value || typeof value!=='object' || Array.isArray(value))) throw new Error(); return value; }
    catch { throw new Error('浏览器中的记录格式异常，已停止写入以保留原数据。请联系维护人员检查。'); }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { throw new Error('未能保存，浏览器存储可能已满或被禁用。请保留填写内容，检查浏览器设置后重试。'); }
  }
  function normalizeDevice(d) {
    return {...d,id:String(d.id),name:String(d.name || '未命名仪器'),model:String(d.model || '未登记'),category:String(d.category || '其他类'),location:String(d.location || '未登记'),status:String(d.status || '可预订'),usage:String(d.usage || d.intro || '暂无用途说明'),scenarios:String(d.scenarios || ''),notes:String(d.notes || ''),booked:Array.isArray(d.booked)?d.booked:[],openToStudent:d.openToStudent!==false};
  }
  function inventory() {
    if(localStorage.getItem(KEYS.devices)===null) save(KEYS.devices,DEFAULT_DEVICES.map(normalizeDevice));
    return read(KEYS.devices).map(normalizeDevice);
  }
  const records = () => read(KEYS.records);
  const uploads = () => read(KEYS.uploads);
  const openDevice = d => d.openToStudent && !['计算显示类','其他类'].includes(d.category);
  const usable = d => !['维护中','暂不可借'].includes(d.status);
  const approved = r => ['已通过','已预约','使用中'].includes(r.status);
  const label = (r, now=Date.now()) => approved(r) ? (validDate(r.startAt) && new Date(r.startAt).getTime()>now ? '已预约' : '使用中') : r.status;
  const overdue = r => approved(r) && validDate(r.endAt) && new Date(r.endAt).getTime()<Date.now();
  const tone = status => ['待审批','待归还确认','需确认'].includes(status)?'wait':['已拒绝','维护中','暂不可借'].includes(status)?'bad':['已归还','已取消','已撤回'].includes(status)?'neutral':'';
  const badge = value => `<span class="status ${tone(value)}">${esc(value)}</span>`;
  const recordBadge = r => badge(label(r)) + (overdue(r)?' <span class="status wait">已超期</span>':'');
  const deviceText = r => (r.devices||[]).map(d=>d.name).join('、') || '未登记仪器';
  const empty = (text, link='') => `<div class="empty"><p>${esc(text)}</p>${link}</div>`;
  function msg(id,text,error=false) {const el=$(id); if(!el)return; el.textContent=text; el.className='message'+(error?' error':''); if(error){el.tabIndex=-1;el.focus();} }
  function listen(el, type, handler) { if(typeof el==='string')el=$(el); el?.addEventListener(type,event=>{try{handler(event);}catch(error){msg('#pageMessage',error.message,true);}}); }
  function guardDirty(form) {
    let dirty=false;
    form.addEventListener('input',()=>{dirty=true;}); form.addEventListener('change',()=>{dirty=true;});
    window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
    const clean=()=>{dirty=false;}; clean.isDirty=()=>dirty; clean.markDirty=()=>{dirty=true;}; return clean;
  }
  function fixedBookings(d) {
    // Legacy numeric days were explicitly the original October 2026 demo schedule.
    return d.booked.map(value=>typeof value==='number'?`2026-10-${String(value).padStart(2,'0')}`:String(value)).filter(value=>/^\d{4}-\d{2}-\d{2}$/.test(value));
  }
  const overlap = (a,b,c,d) => a<d && b>c;
  function conflicts(device, start, end, excludeId='', source=records()) {
    const a=new Date(start).getTime(), b=end===Infinity?Infinity:new Date(end).getTime();
    if(!Number.isFinite(a)||(!Number.isFinite(b)&&b!==Infinity)||b<=a)return [];
    const found=[];
    for(const date of fixedBookings(device)) {
      const from=new Date(date+'T00:00').getTime(), to=new Date(date+'T00:00');to.setDate(to.getDate()+1);
      if(overlap(a,b,from,to.getTime()))found.push('已有预置排期');
    }
    for(const r of source) {
      if(r.id===excludeId || !(r.devices||[]).some(d=>d.id===device.id))continue;
      if(!(approved(r)||['待审批','待归还确认'].includes(r.status)))continue;
      const from=new Date(r.startAt).getTime();
      let to=new Date(r.endAt).getTime();
      if(r.status==='待归还确认'||overdue(r))to=Infinity;
      if(overlap(a,b,from,to))found.push(r.status==='待归还确认'?'有待验收的归还':overdue(r)?'上一笔借用超期未归还':'该时段已有申请或预约');
    }
    return [...new Set(found)];
  }
  const AUDIT_FIELDS={status:'状态',startAt:'借用开始',endAt:'预计归还',rejectReason:'拒绝原因',reviewedAt:'审批时间',returnSubmittedAt:'归还提交时间',returnLocation:'归还位置',returnNormal:'设备是否正常',returnNote:'归还备注',returnPhotoName:'照片文件名',returnedAt:'验收时间',cancelledAt:'取消时间',cancelReason:'取消原因'};
  const recordToken = r => JSON.stringify(r);
  const revisionOf = r => Number.isSafeInteger(r.revision)&&r.revision>=0?r.revision:0;
  const latestChange = r => Array.isArray(r.changeHistory)?r.changeHistory.at(-1):null;
  const occupies = r => approved(r)||['待审批','待归还确认'].includes(r.status);
  function appendHistory(record,before,meta={}) {
    const changes=Object.keys(AUDIT_FIELDS).flatMap(field=>{
      const oldValue=before?.[field]??null,newValue=record[field]??null;
      return oldValue===newValue?[]:[{field,before:oldValue,after:newValue}];
    });
    if(!changes.length)return;
    const action=meta.action||(record.status==='已拒绝'?'拒绝申请':before?.status==='待审批'&&approved(record)?'通过申请':record.status==='已归还'?'确认归还':record.status==='待归还确认'?'提交归还':'更新记录');
    record.revision=revisionOf(before||record)+1;
    record.changeHistory=[...(Array.isArray(before?.changeHistory)?before.changeHistory:[]),{
      id:uid('CHANGE'),action,reason:meta.reason|| (action==='拒绝申请'?record.rejectReason:'') || '常规流程操作',
      actor:meta.actor||(action==='提交归还'?'学生（本机原型）':'管理员（本机原型）'),
      at:new Date().toISOString(),version:record.revision,changes,
      ...(meta.undoOf?{undoOf:meta.undoOf}:{})
    }];
  }
  function updateRecord(id, statuses, change, meta={}) {
    const list=records(), record=list.find(r=>r.id===id);
    if(!record || !statuses(record))throw new Error('记录状态已变化，请刷新后再操作。');
    if(meta.expectedToken&&recordToken(record)!==meta.expectedToken)throw new Error('这条记录已在其他页面发生变更。请取消编辑，重新打开后核对。');
    const before=JSON.parse(JSON.stringify(record));
    change(record);appendHistory(record,before,meta);save(KEYS.records,list);return record;
  }
  function correctionActions(r) {
    const list=[];
    if(r.status==='待审批'||approved(r))list.push(['period','调整使用期']);
    if(approved(r)&&label(r)==='已预约')list.push(['revoke','撤回审批']);
    if(r.status==='已拒绝')list.push(['reopen','重新打开申请']);
    if(r.status==='待审批'||(approved(r)&&label(r)==='已预约'))list.push(['cancel','取消预约']);
    if(r.status==='已归还')list.push(['undoReturn','撤销归还确认']);
    const last=latestChange(r);
    if(last&&last.version===revisionOf(r)&&!['提交申请','确认归还','撤销上次变更'].includes(last.action))list.push(['undoLast','撤销上次变更']);
    return list;
  }
  function validateOccupiedRecord(candidate,source,devices) {
    if(!occupies(candidate))return;
    if(!validDate(candidate.startAt)||!validDate(candidate.endAt)||new Date(candidate.endAt)<=new Date(candidate.startAt))throw new Error('借用时段无效，请填写有效的起止时间。');
    if(candidate.status==='待审批'&&new Date(candidate.endAt)<=new Date())throw new Error('原使用期已结束，请重新设置日期或重新申请。');
    const end=candidate.status==='待归还确认'||overdue(candidate)?Infinity:candidate.endAt;
    if(!(candidate.devices||[]).length)throw new Error('记录缺少仪器明细，无法恢复占用。');
    for(const item of candidate.devices){
      const device=devices.find(d=>d.id===item.id);
      if(!device)throw new Error(`${item.name}已不在设备库，无法恢复占用。`);
      if((candidate.status==='待审批'||label(candidate)==='已预约')&&(!openDevice(device)||!usable(device)))throw new Error(`${item.name}已暂停学生借用，请先核对设备状态。`);
      const issues=conflicts(device,candidate.startAt,end,candidate.id,source);
      if(issues.length)throw new Error(`${item.name}：${issues.join('；')}。未保存本次变更，请先协调排期。`);
    }
  }
  function applyCorrection(original,action,values,source,devices) {
    if(!correctionActions(original).some(([key])=>key===action))throw new Error('当前状态不支持这项操作，请重新核对记录。');
    const reason=String(values.reason||'').trim();
    if(!reason)throw new Error('请填写修改或纠正原因。');
    const candidate=JSON.parse(JSON.stringify(original));
    const checkPeriod=()=>{
      if(!validDate(values.startAt)||!validDate(values.endAt)||new Date(values.endAt)<=new Date(values.startAt))throw new Error('预计归还时间应晚于借用开始时间。');
      if(new Date(values.endAt)<=new Date())throw new Error('新的预计归还时间应晚于当前时间。');
    };
    if(action==='period'||action==='reopen'){
      checkPeriod();
      if(action==='period'&&label(original)==='使用中'){
        if(new Date(values.startAt).getTime()!==new Date(original.startAt).getTime())throw new Error('使用中的记录只能调整预计归还时间，开始时间保留。');
      }else{
        if(new Date(values.startAt).getTime()<Date.now()-60000)throw new Error('新的借用开始时间已过去，请重新选择。');
        candidate.startAt=values.startAt;
      }
      candidate.endAt=values.endAt;
      if(action==='period'&&new Date(candidate.startAt).getTime()===new Date(original.startAt).getTime()&&new Date(candidate.endAt).getTime()===new Date(original.endAt).getTime())throw new Error('日期未发生变化，无需保存。');
      if(!candidate.originalPeriod)candidate.originalPeriod={startAt:original.startAt,endAt:original.endAt};
      if(action==='reopen'){candidate.status='待审批';delete candidate.rejectReason;delete candidate.reviewedAt;}
    }
    if(action==='revoke'){candidate.status='待审批';delete candidate.reviewedAt;delete candidate.rejectReason;}
    if(action==='cancel'){candidate.status='已取消';candidate.cancelledAt=stamp();candidate.cancelReason=reason;}
    if(action==='undoReturn'){candidate.status='待归还确认';delete candidate.returnedAt;}
    if(action==='undoLast'){
      const entry=latestChange(original);
      if(values.undoOf!==entry?.id||entry.version!==revisionOf(original))throw new Error('后续操作已发生变化，不能撤销旧操作。');
      if(entry.action==='通过申请'&&label(original)==='使用中')throw new Error('预约已经进入使用期，不能直接撤回审批。');
      if(entry.action==='取消预约'&&new Date(original.startAt)<=new Date())throw new Error('原预约开始时间已过去，请重新申请。');
      for(const change of entry.changes){
        if(!Object.hasOwn(AUDIT_FIELDS,change.field))continue;
        if((original[change.field]??null)!==change.after)throw new Error('记录内容已发生变化，不能恢复旧版本。');
        if(change.before===null)delete candidate[change.field];else candidate[change.field]=change.before;
      }
      if(label(original)==='使用中'&&new Date(candidate.startAt).getTime()!==new Date(original.startAt).getTime())throw new Error('预约已进入使用期，不能通过撤销改写开始时间。');
    }
    // Reversals preserve uploads and history; only this record's changed business fields are restored.
    validateOccupiedRecord(candidate,source,devices);
    return candidate;
  }
  function auditValue(field,value){if(value==null||value==='')return '未设置';if(['startAt','endAt'].includes(field))return time(value);return String(value);}
  function changeHistoryHtml(r) {
    const history=Array.isArray(r.changeHistory)?r.changeHistory:[];
    if(!history.length)return '';
    return `<details class="change-history"><summary>变更记录（${history.length}）</summary><ol>${[...history].reverse().map(entry=>`<li><strong>${esc(entry.action)}</strong><div class="meta">${esc(time(entry.at))} · ${esc(entry.actor||'本机原型操作')}</div><p>原因：${esc(entry.reason||'未填写')}</p>${(entry.changes||[]).filter(c=>Object.hasOwn(AUDIT_FIELDS,c.field)).map(c=>`<div class="meta">${esc(AUDIT_FIELDS[c.field])}：${esc(auditValue(c.field,c.before))} → ${esc(auditValue(c.field,c.after))}</div>`).join('')}</li>`).join('')}</ol></details>`;
  }
  function filterBorrowRecords(list,filter={}) {
    const keyword=String(filter.keyword||'').trim().toLowerCase();
    const from=filter.from?new Date(filter.from+'T00:00').getTime():-Infinity;
    let to=Infinity;
    if(filter.to){const date=new Date(filter.to+'T00:00');date.setDate(date.getDate()+1);to=date.getTime();}
    if(Number.isNaN(from)||Number.isNaN(to)||to<=from)throw new Error('筛选结束日期不能早于开始日期。');
    return list.filter(r=>{
      if(filter.status&&filter.status!=='ALL'&&label(r)!==filter.status)return false;
      if(filter.device&&(r.devices||[]).every(d=>d.id!==filter.device))return false;
      if(filter.overdue&&!overdue(r))return false;
      if(keyword&&!`${r.id} ${r.borrower} ${deviceText(r)} ${r.place} ${r.group}`.toLowerCase().includes(keyword))return false;
      if(filter.from||filter.to){if(!validDate(r.startAt)||!validDate(r.endAt))return false;return overlap(new Date(r.startAt).getTime(),new Date(r.endAt).getTime(),from,to);}
      return true;
    });
  }
  function recordActions(r) {
    const state=label(r), actions=[];
    if(state==='使用中') actions.push(`<a class="button compact" href="${route('returns',{record:r.id})}">去归还</a>`);
    if(state==='待归还确认')actions.push(`<a class="button secondary compact" href="${route('returns',{record:r.id})}">查看归还</a>`);
    if((approved(r)&&state!=='已预约')||['已归还','待归还确认'].includes(state))actions.push(`<a class="button secondary compact" href="${route('data',{record:r.id})}">上传数据</a>`);
    if(state==='已拒绝')actions.push(`<a class="button secondary compact" href="${route('borrow',{devices:(r.devices||[]).map(d=>d.id).join(',')})}">重新申请</a>`);
    return actions.join('');
  }
  function recordRow(r, actions=true) {
    return `<article class="list-row"><div class="row-main"><div class="row-title"><h3>${esc(deviceText(r))}</h3>${recordBadge(r)}</div><div class="meta">${esc(period(r))} · ${esc(r.place||'未填写地点')}</div><div class="meta">${esc(r.borrower||'未登记借用人')} · 申请编号 ${esc(r.id)}</div>${r.rejectReason?`<p class="row-desc">未通过原因：${esc(r.rejectReason)}</p>`:''}${r.returnSubmittedAt?`<p class="row-desc">归还提交：${esc(r.returnSubmittedAt)} · ${esc(r.returnLocation||'原位置')}${r.returnNormal==='否'?' · 已报告异常':''}</p>`:''}${r.returnedAt?`<div class="meta">验收完成：${esc(r.returnedAt)}</div>`:''}${r.cancelReason?`<p class="row-desc">取消原因：${esc(r.cancelReason)}</p>`:''}${changeHistoryHtml(r)}</div>${actions?`<div class="row-actions">${recordActions(r)}</div>`:''}</article>`;
  }
  function header(page) {
    const links=[['home','仪器首页'],['borrow','借用仪器'],['returns','归还仪器'],['data','上传数据']];
    const icons={home:'M3 10l9-7 9 7M5 9v12h14V9M9 21v-7h6v7',borrow:'M4 4h16v16H4zM8 12h8M12 8v8',returns:'M8 4H4v16h16V4h-4M8 11l-3 3 3 3M5 14h10v-4',data:'M4 15v6h16v-6M12 16V3M7 8l5-5 5 5'};
    const icon=paths=>`<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${paths}"/></svg>`;
    $('#siteHeader').innerHTML=`<div class="header-inner"><a class="brand" href="${PAGES.home}"><svg class="brand-mark" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 3h8M10 3v7L4.8 19a1.3 1.3 0 0 0 1.1 2h12.2a1.3 1.3 0 0 0 1.1-2L14 10V3M8 15h8"/></svg>实验室仪器借用</a><nav class="site-nav" aria-label="主导航"><button id="functionMenu" class="drawer-toggle" type="button" aria-haspopup="dialog" aria-controls="functionDrawer" aria-expanded="false">${icon('M4 6h16M4 12h16M4 18h16')}<span>仪器功能</span></button><a href="${PAGES.status}" ${page==='status'?'aria-current="page"':''}>我的借用</a><a class="admin-link" href="${PAGES.admin}" ${page==='admin'?'aria-current="page"':''}>管理后台</a></nav></div><dialog id="functionDrawer" class="function-drawer" aria-labelledby="functionDrawerTitle"><div class="drawer-heading"><h2 id="functionDrawerTitle">仪器功能</h2><button id="closeFunctionDrawer" class="quiet drawer-close" type="button" aria-label="关闭功能侧栏">${icon('M6 6l12 12M18 6L6 18')}</button></div><nav class="drawer-links" aria-label="仪器功能导航">${links.map(([key,name])=>`<a href="${PAGES[key]}" ${key===page?'aria-current="page"':''}>${icon(icons[key])}<span>${name}</span></a>`).join('')}</nav></dialog>`;
    const drawer=$('#functionDrawer'),toggle=$('#functionMenu');
    const closeDrawer=()=>{drawer.close();toggle.setAttribute('aria-expanded','false');document.body.classList.remove('drawer-open');toggle.focus({preventScroll:true});};
    listen(toggle,'click',()=>{drawer.showModal();toggle.setAttribute('aria-expanded','true');document.body.classList.add('drawer-open');});
    listen('#closeFunctionDrawer','click',closeDrawer);
    listen(drawer,'cancel',event=>{event.preventDefault();closeDrawer();});
    listen(drawer,'keydown',event=>{if(event.key!=='Tab')return;const items=$$('a[href],button:not([disabled])',drawer),first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
    listen(drawer,'close',()=>{if(drawer.open)return;toggle.setAttribute('aria-expanded','false');document.body.classList.remove('drawer-open');toggle.focus({preventScroll:true});});
    listen(drawer,'click',event=>{const bounds=drawer.getBoundingClientRect();if(event.target===drawer&&(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom))closeDrawer();});
  }
  function head(title,subtitle,actions='') {return `<div class="page-head"><div><h1>${title}</h1><p class="lead">${subtitle}</p></div>${actions?`<div class="inline">${actions}</div>`:''}</div><div id="pageMessage" role="status" aria-live="polite"></div>`;}
  function filtersHtml(id,selected='ALL',all=true) {
    const available=CATEGORIES.filter(c=>!['计算显示类','其他类'].includes(c));
    return `<div class="chips" id="${id}" role="group" aria-label="仪器分类">${[...(all?['ALL']:[]),...available].map(c=>`<button class="filter" type="button" data-category="${esc(c)}" aria-pressed="${c===selected}">${c==='ALL'?'全部仪器':SHORT[CATEGORIES.indexOf(c)]}</button>`).join('')}</div>`;
  }
  function setQuery(key,value) {const url=new URL(location.href); if(value && value!=='ALL')url.searchParams.set(key,value);else url.searchParams.delete(key);history.replaceState(null,'',url);}
  function bindFilters(id,initial,callback) {
    let category=initial;
    listen('#'+id,'click',event=>{const b=event.target.closest('[data-category]');if(!b)return;category=b.dataset.category;$$('[data-category]',$('#'+id)).forEach(el=>el.setAttribute('aria-pressed',String(el===b)));setQuery('category',category);callback();});
    return ()=>category;
  }
  function searchDevices(list,category,query) {const text=query.trim().toLowerCase();return list.filter(d=>(category==='ALL'||d.category===category)&&`${d.id} ${d.name} ${d.model} ${d.category} ${d.location} ${d.usage}`.toLowerCase().includes(text));}
  function home() {
    const category=CATEGORIES.includes(params.get('category'))?params.get('category'):'ALL';
    $('#app').innerHTML=head('找到需要的仪器','按分类浏览或直接搜索，选好仪器后进入借用申请。')+`<section class="task-strip" aria-label="我的借用概览"><div id="homeSummary" class="summary-strip"></div><a href="${PAGES.status}">查看我的借用</a></section><section aria-labelledby="catalogTitle"><div class="toolbar"><div class="grow search-box"><label for="searchInput">查找仪器</label><input id="searchInput" name="search" type="search" value="${esc(params.get('q')||'')}" placeholder="搜索名称、型号、编号或存放位置…" autocomplete="off"></div><button class="secondary" id="clearSearch" type="button">清空</button></div>${filtersHtml('categoryFilters',category)}<div class="section-head"><h2 id="catalogTitle">开放借用的仪器</h2><span id="deviceCount" class="meta" aria-live="polite"></span></div><div id="deviceList" class="list"></div><p class="help">计算显示及其他类设备请联系管理员。</p></section><section class="section" aria-labelledby="recentTitle"><div class="section-head"><h2 id="recentTitle">我的待办与近期借用</h2><a href="${PAGES.status}">查看全部</a></div><div id="recentList" class="list"></div></section>`;
    const selected=bindFilters('categoryFilters',category,renderDevices);
    function renderDevices(){const list=searchDevices(inventory().filter(openDevice),selected(),$('#searchInput').value);$('#deviceCount').textContent=`${list.length} 台`;$('#deviceList').innerHTML=list.length?list.map(d=>`<article class="list-row"><div class="row-main"><div class="row-title"><h3>${esc(d.name)}</h3>${badge(d.status)}</div><div class="meta">${esc(d.model)} · ${esc(d.location)}</div><p class="row-desc">${esc(d.usage)}</p><div class="meta">${esc(d.category)} · ${esc(d.id)}</div></div><div class="row-actions">${usable(d)?`<a class="button secondary" href="${route('borrow',{device:d.id})}">申请借用</a>`:'<span class="meta">暂不接受申请</span>'}</div></article>`).join(''):empty('没有找到匹配的仪器，请更换关键词或分类。');}
    function renderRecords(){const list=records();const pending=list.filter(r=>r.status==='待审批').length,active=list.filter(r=>approved(r)).length,waiting=list.filter(r=>r.status==='待归还确认').length;$('#homeSummary').innerHTML=`<span><strong>${pending}</strong>待审批</span><span><strong>${active}</strong>预约与使用中</span><span><strong>${waiting}</strong>待归还验收</span>`;const priority=r=>['待归还确认','已拒绝'].includes(r.status)?0:approved(r)?1:r.status==='待审批'?2:3;const recent=[...list].sort((a,b)=>priority(a)-priority(b)).slice(0,3);$('#recentList').innerHTML=recent.length?recent.map(r=>recordRow(r)).join(''):empty('还没有借用记录。找到仪器后即可提交申请。');}
    listen('#searchInput','input',()=>{setQuery('q',$('#searchInput').value);renderDevices();});listen('#clearSearch','click',()=>{$('#searchInput').value='';setQuery('q','');renderDevices();$('#searchInput').focus();});
    renderDevices();renderRecords();return ()=>{renderDevices();renderRecords();};
  }
  function borrow() {
    let selectedIds=new Set([...(params.get('devices')||'').split(','),params.get('device')].filter(Boolean));
    let calendarDevice='';let calendarMonth=new Date();calendarMonth.setDate(1);
    const category=CATEGORIES.includes(params.get('category'))?params.get('category'):'ALL';
    $('#app').innerHTML=head('借用仪器','选择仪器和时间，填写用途后提交。一次申请可以借用多台仪器。',`<a href="${PAGES.home}">返回仪器首页</a>`)+`<div class="borrow-layout"><section aria-labelledby="chooseTitle"><h2 id="chooseTitle">选择仪器</h2><label class="sr-only" for="searchInput">搜索仪器</label><input id="searchInput" type="search" name="search" placeholder="搜索名称、型号或编号…" autocomplete="off" value="${esc(params.get('q')||'')}">${filtersHtml('categoryFilters',category)}<div id="results" class="list device-list"></div></section><form id="borrowForm" class="panel booking"><h2>借用申请</h2><div class="section-head"><span class="field-label">已选仪器</span><a href="#chooseTitle">继续选择仪器</a></div><div id="selectedStrip" class="chips" aria-live="polite"></div><div class="form-grid"><div><label for="startAt">借用开始时间</label><input id="startAt" name="startAt" type="datetime-local" required></div><div><label for="endAt">预计归还时间</label><input id="endAt" name="endAt" type="datetime-local" required></div></div><div class="actions"><button type="button" class="secondary compact" data-duration="4">借用 4 小时</button><button type="button" class="secondary compact" data-duration="24">借用 1 天</button><button type="button" class="secondary compact" data-duration="168">借用 1 周</button></div><div id="availability" class="help" aria-live="polite">选好时间后检查可用情况。</div><div class="form-grid section"><div class="full"><label for="place">使用地点</label><input id="place" name="place" required maxlength="200" placeholder="例如：实验室603…" autocomplete="off"></div><div class="full"><label for="purpose">使用用途</label><textarea id="purpose" name="purpose" required maxlength="2000" placeholder="简要说明实验或测量用途…"></textarea></div></div><details id="profileDetails" open><summary>借用人资料</summary><div class="form-grid"><div><label for="borrower">姓名</label><input id="borrower" name="borrower" required maxlength="80" autocomplete="name"></div><div><label for="contact">手机或微信</label><input id="contact" name="contact" required maxlength="100" autocomplete="tel"></div><div class="full"><label for="group">课题组／老师（选填）</label><input id="group" name="group" maxlength="100" autocomplete="organization"></div></div><label class="check"><input id="rememberProfile" type="checkbox" name="rememberProfile">在这台浏览器记住这些资料</label><button type="button" id="clearProfile" class="quiet compact">清除常用资料</button></details><div class="form-footer"><button type="submit">提交借用申请</button><div id="formMessage" role="status" aria-live="polite" class="message"></div></div></form></div>`;
    const form=$('#borrowForm'),clean=guardDirty(form);
    const list=inventory().filter(openDevice),requested=[...selectedIds];selectedIds=new Set(requested.filter(id=>list.some(d=>d.id===id&&usable(d))));
    if(requested.length!==selectedIds.size)msg('#pageMessage','部分仪器已下架或暂停借用，请重新核对选择。',true);
    const profile=read(KEYS.profile,{});for(const key of ['borrower','contact','group'])if(typeof profile[key]==='string')form.elements[key].value=profile[key];
    if(profile.borrower&&profile.contact){$('#rememberProfile').checked=true;$('#profileDetails').open=false;}
    const getCategory=bindFilters('categoryFilters',category,renderDevices);
    function selected(){return inventory().filter(d=>selectedIds.has(d.id));}
    function renderSelected(){const chosen=selected();$('.borrow-layout').classList.toggle('has-selection',chosen.length>0);$('#selectedStrip').innerHTML=chosen.length?chosen.map(d=>`<span class="chip">${esc(d.name)}<button type="button" data-remove="${esc(d.id)}" aria-label="移除${esc(d.name)}">×</button></span>`).join(''):'<span class="meta">从左侧列表选择仪器。</span>';}
    function availability(){const start=$('#startAt').value,end=$('#endAt').value;const el=$('#availability');if(!start||!end){el.textContent='选好时间后检查可用情况。';return;}if(new Date(end)<=new Date(start)){el.textContent='归还时间应晚于借用开始时间。';return;}const issues=selected().flatMap(d=>conflicts(d,start,end).map(reason=>`${d.name}：${reason}`));el.textContent=issues.length?issues.join('；'):selectedIds.size?'所选仪器在该时段可申请，最终由管理员审批。':'请先选择仪器。';}
    function calendar(d){const first=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth(),1),last=new Date(first.getFullYear(),first.getMonth()+1,0),leading=(first.getDay()+6)%7;let cells='';for(let i=0;i<leading;i++)cells+='<td class="outside"></td>';for(let day=1;day<=last.getDate();day++){const date=new Date(first.getFullYear(),first.getMonth(),day),next=new Date(first.getFullYear(),first.getMonth(),day+1),busy=conflicts(d,date,next).length>0;cells+=`<td class="${busy?'busy ':''}${dayKey(date)===dayKey(new Date())?'today':''}">${day}<span>${busy?'有占用':'可申请'}</span></td>`;}while((leading+last.getDate())%7 && (cells.match(/<td/g)||[]).length%7)cells+='<td class="outside"></td>';const chunks=cells.match(/(?:<td[\s\S]*?<\/td>){1,7}/g)||[];return `<div class="calendar"><div class="calendar-head"><button class="secondary compact" type="button" data-month="-1" aria-label="上个月">上月</button><strong>${new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'long'}).format(first)}</strong><button class="secondary compact" type="button" data-month="1" aria-label="下个月">下月</button></div><table aria-label="${esc(d.name)}可用日期"><thead><tr>${['一','二','三','四','五','六','日'].map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${chunks.map(row=>`<tr>${row}</tr>`).join('')}</tbody></table><p class="calendar-key">“有占用”表示当天部分或全天有预约，请以具体起止时间检查结果为准。</p></div>`;}
    function renderDevices(){const items=searchDevices(inventory().filter(openDevice),getCategory(),$('#searchInput').value);$('#results').innerHTML=items.length?items.map(d=>`<article class="list-row"><div class="row-main"><div class="row-title"><h3>${esc(d.name)}</h3>${badge(d.status)}</div><div class="meta">${esc(d.model)} · ${esc(d.location)}</div><div class="meta">${esc(d.category)} · ${esc(d.id)}</div><p class="row-desc">${esc(d.usage)}</p><details><summary>用途与注意事项</summary><p>${esc(d.scenarios||d.usage)}</p><p>${esc(d.notes||'请按管理员要求保管和归还。')}</p></details></div><div class="row-actions"><button class="${selectedIds.has(d.id)?'':'secondary'}" type="button" data-select="${esc(d.id)}" aria-pressed="${selectedIds.has(d.id)}" ${usable(d)?'':'disabled'}>${selectedIds.has(d.id)?'已选择':'选择仪器'}</button><button class="quiet" type="button" data-calendar="${esc(d.id)}" aria-expanded="${calendarDevice===d.id}">${calendarDevice===d.id?'收起日期':'查看可用日期'}</button></div>${calendarDevice===d.id?`<div class="full" style="width:100%">${calendar(d)}</div>`:''}</article>`).join(''):empty('没有匹配的仪器，请更换分类或关键词。');}
    listen('#results','click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.select){const id=b.dataset.select,wasEmpty=selectedIds.size===0;selectedIds.has(id)?selectedIds.delete(id):selectedIds.add(id);clean.markDirty();renderSelected();availability();renderDevices();if(wasEmpty&&selectedIds.size&&matchMedia('(max-width:900px)').matches){form.scrollIntoView({block:'start'});$('#startAt').focus({preventScroll:true});}}else if(b.dataset.calendar){calendarDevice=calendarDevice===b.dataset.calendar?'':b.dataset.calendar;if($('#startAt').value){calendarMonth=new Date($('#startAt').value);calendarMonth.setDate(1);}renderDevices();}else if(b.dataset.month){calendarMonth.setMonth(calendarMonth.getMonth()+Number(b.dataset.month));renderDevices();}});
    listen('#selectedStrip','click',e=>{const b=e.target.closest('[data-remove]');if(b){clean.markDirty();selectedIds.delete(b.dataset.remove);renderSelected();renderDevices();availability();}});
    listen('#searchInput','input',()=>{setQuery('q',$('#searchInput').value);renderDevices();});
    for(const id of ['#startAt','#endAt'])listen(id,'change',()=>{availability();if(calendarDevice&&$('#startAt').value){calendarMonth=new Date($('#startAt').value);calendarMonth.setDate(1);renderDevices();}});
    listen(form,'click',e=>{const b=e.target.closest('[data-duration]');if(!b)return;let start=$('#startAt').value?new Date($('#startAt').value):new Date();start.setSeconds(0,0);if(!$('#startAt').value){start.setMinutes(Math.ceil(start.getMinutes()/30)*30);$('#startAt').value=localInput(start);}$('#endAt').value=localInput(new Date(start.getTime()+Number(b.dataset.duration)*3600000));availability();});
    listen('#clearProfile','click',()=>{if(!window.confirm('清除这台浏览器记住的姓名、联系方式和课题组？历史借用记录会保留。'))return;localStorage.removeItem(KEYS.profile);for(const key of ['borrower','contact','group'])form.elements[key].value='';$('#rememberProfile').checked=false;$('#profileDetails').open=true;msg('#formMessage','已清除本机常用资料，历史借用记录保留。');});
    form.addEventListener('invalid',e=>{if(e.target.closest('#profileDetails'))$('#profileDetails').open=true;},true);
    listen(form,'submit',e=>{e.preventDefault();msg('#formMessage','');const data=new FormData(form),chosen=selected();const start=String(data.get('startAt')),end=String(data.get('endAt'));if(!chosen.length){msg('#formMessage','请先选择至少一台仪器。',true);return;}if(chosen.length!==selectedIds.size||chosen.some(d=>!openDevice(d)||!usable(d)))throw new Error('部分仪器已暂停借用，请重新选择。');if(!validDate(start)||!validDate(end)||new Date(end)<=new Date(start)){msg('#formMessage','预计归还时间应晚于借用开始时间。',true);return;}if(new Date(start).getTime()<Date.now()-60000){msg('#formMessage','借用开始时间已过去，请重新选择时间。',true);return;}const issues=chosen.flatMap(d=>conflicts(d,start,end).map(reason=>`${d.name}：${reason}`));if(issues.length){msg('#formMessage',issues.join('；')+'。请调整时间或移除冲突仪器。',true);return;}const fields=Object.fromEntries(['borrower','contact','group','place','purpose'].map(k=>[k,String(data.get(k)||'').trim()]));if(!fields.borrower||!fields.contact||!fields.place||!fields.purpose){msg('#formMessage','姓名、联系方式、地点和用途不能为空。',true);$('#profileDetails').open=true;return;}const record={id:uid('STU'),...fields,leaveLab:'学生端待确认',startAt:start,endAt:end,status:'待审批',createdAt:stamp(),devices:chosen.map(d=>({id:d.id,name:d.name,model:d.model,location:d.location,category:d.category,domain:d.category}))};appendHistory(record,null,{action:'提交申请',actor:'学生（本机原型）',reason:'提交借用申请'});if($('#rememberProfile').checked)save(KEYS.profile,{borrower:fields.borrower,contact:fields.contact,group:fields.group});else localStorage.removeItem(KEYS.profile);const all=records();all.unshift(record);save(KEYS.records,all);selectedIds.clear();form.reset();for(const key of ['borrower','contact','group'])form.elements[key].value=fields[key];$('#rememberProfile').checked=!!localStorage.getItem(KEYS.profile);renderSelected();renderDevices();availability();msg('#formMessage',`申请已提交，等待管理员审批。申请编号：${record.id}`);$('#formMessage').insertAdjacentHTML('beforeend',` <a href="${PAGES.status}">查看我的借用</a>`);clean();});
    renderSelected();renderDevices();availability();return ()=>{renderSelected();renderDevices();availability();};
  }
  function returns() {
    let selectedId='',selectedState='';const requested=params.get('record');
    $('#app').innerHTML=head('归还仪器','核对归还位置和设备状态，提交后等待管理员验收。',`<a href="${PAGES.status}">返回我的借用</a>`)+`<div class="split"><section><h2>选择借用记录</h2><div id="returnChoices" class="list"></div></section><form id="returnForm" class="panel"><h2>归还登记</h2><div id="selectedInfo" class="notice">请选择一条借用记录。</div><fieldset id="returnFields" style="border:0;padding:0;margin:0" disabled><div class="form-stack"><div><label for="returnLocation">归还位置</label><input id="returnLocation" name="returnLocation" required maxlength="300" autocomplete="off"><p class="help">默认原存放位置，位置改变时再修改。</p></div><fieldset style="border:0;padding:0;margin:0"><legend class="field-label">设备及配件是否正常</legend><div class="inline"><label class="check"><input type="radio" name="returnNormal" value="是" checked>正常</label><label class="check"><input type="radio" name="returnNormal" value="否">有异常</label></div></fieldset><div id="abnormalFields" hidden><label for="returnNote">异常说明</label><textarea id="returnNote" name="returnNote" maxlength="2000" placeholder="请说明损坏、缺件或其他异常…"></textarea></div><details id="returnExtra"><summary>补充备注与照片（选填）</summary><label for="returnExtraNote">补充备注</label><textarea id="returnExtraNote" name="returnExtraNote" maxlength="2000"></textarea><label for="returnPhoto">归还照片</label><input id="returnPhoto" name="returnPhoto" type="file" accept="image/*" capture="environment"><p class="file-note">当前原型仅登记照片文件名，不保存图片内容。</p></details></div><div class="form-footer"><button type="submit" id="returnSubmit">提交归还</button></div></fieldset><div id="formMessage" class="message" role="status" aria-live="polite"></div><div id="afterReturn" class="actions" hidden></div></form></div>`;
    const form=$('#returnForm'),clean=guardDirty(form);
    function choices(){return records().filter(r=>label(r)==='使用中'||r.status==='待归还确认');}
    function draw(){const list=choices();$('#returnChoices').innerHTML=list.length?list.map(r=>`<label class="selection-option"><input type="radio" name="returnChoice" value="${esc(r.id)}" ${r.id===selectedId?'checked':''}><span><span class="row-title"><strong>${esc(deviceText(r))}</strong>${recordBadge(r)}</span><span class="meta">${esc(period(r))}<br>${esc(r.id)}</span></span></label>`).join(''):empty('暂无可归还的仪器。已预约的仪器在借用开始后显示在这里。',`<a href="${PAGES.status}">查看我的借用</a>`);}
    function select(id){const record=records().find(r=>r.id===id);if(!record)return;selectedId=id;selectedState=record.status;$('#returnPhoto').value='';const eligible=label(record)==='使用中';$('#selectedInfo').textContent=`${deviceText(record)} · ${period(record)}`;$('#returnLocation').value=record.returnLocation||(record.devices||[]).map(d=>d.location).filter(Boolean).join('、')||'原存放位置';$('#returnFields').disabled=!eligible;if(record.returnNormal){const radio=$(`input[name=returnNormal][value="${record.returnNormal==='否'?'否':'是'}"]`);radio.checked=true;}$('#returnNote').value=record.returnNormal==='否'?record.returnNote||'':'';$('#abnormalFields').hidden=record.returnNormal!=='否';$('#returnNote').required=record.returnNormal==='否';$('#returnExtraNote').value=record.returnNormal==='否'?'':record.returnNote||'';if(record.status==='待归还确认')msg('#formMessage',`已于 ${record.returnSubmittedAt||'此前'} 提交归还，请等待管理员验收。`);else if(record.status==='已归还')msg('#formMessage','管理员已确认归还。');else msg('#formMessage','');draw();setQuery('record',id);}
    listen('#returnChoices','change',e=>{if(e.target.name==='returnChoice'){if(clean.isDirty()&&!window.confirm('切换借用记录会清除尚未提交的归还内容，是否继续？')){draw();return;}clean();select(e.target.value);$('#afterReturn').hidden=true;}});
    listen(form,'change',e=>{if(e.target.name==='returnNormal'){const abnormal=e.target.value==='否';$('#abnormalFields').hidden=!abnormal;$('#returnNote').required=abnormal;}});
    listen(form,'submit',e=>{e.preventDefault();const data=new FormData(form);const normal=String(data.get('returnNormal')||'是'),note=String(data.get('returnNote')||'').trim(),extra=String(data.get('returnExtraNote')||'').trim();if(!selectedId)throw new Error('请先选择要归还的记录。');if(!String(data.get('returnLocation')||'').trim())throw new Error('请填写归还位置。');if(normal==='否'&&!note)throw new Error('请补充异常说明，方便管理员验收。');const record=updateRecord(selectedId,r=>label(r)==='使用中',r=>{r.status='待归还确认';r.returnSubmittedAt=stamp();r.returnLocation=String(data.get('returnLocation')).trim();r.returnNormal=normal;r.returnNote=[normal==='否'?note:'',extra].filter(Boolean).join('；');r.returnPhotoName=$('#returnPhoto').files[0]?.name||'未上传照片';});clean();select(record.id);$('#afterReturn').innerHTML=`<a class="button secondary" href="${route('data',{record:record.id})}">上传对应数据</a><a href="${PAGES.status}">查看借用状态</a>`;$('#afterReturn').hidden=false;});
    draw();if(requested){const r=records().find(item=>item.id===requested);if(r&&(choices().some(item=>item.id===requested)||r.status==='已归还'))select(requested);else msg('#pageMessage','这条记录当前不可归还，请从列表选择使用中的记录。',true);}else if(choices().length===1)select(choices()[0].id);
    return ()=>{draw();if(selectedId){const current=records().find(r=>r.id===selectedId);if(!current){$('#returnFields').disabled=true;msg('#formMessage','这条记录已不存在，请重新选择。',true);}else if(current.status!==selectedState){clean();select(selectedId);}}};
  }
  function dataPage() {
    $('#app').innerHTML=head('上传原始数据','选择文件并核对采集时间，数据会关联到对应仪器。',`<a href="${PAGES.status}">返回我的借用</a>`)+`<div class="split"><form id="uploadForm" class="panel"><h2>数据登记</h2><div class="form-stack"><div><label for="recordSelect">关联仪器与借用记录</label><select id="recordSelect" name="recordSelect" required></select><p id="recordInfo" class="help"></p></div><div class="form-grid"><div><label for="dataStart">采集开始时间</label><input id="dataStart" name="dataStart" type="datetime-local" required></div><div><label for="dataEnd">采集结束时间</label><input id="dataEnd" name="dataEnd" type="datetime-local" required></div></div><p class="help">时间初值参考借用时段，请按实际采集时间核对修改。</p><div><label for="dataFile">原始数据文件</label><input id="dataFile" name="dataFile" type="file" required accept=".csv,.txt,.xlsx,.xls,.json,.dat,.zip"><p class="file-note">当前原型仅登记文件信息，尚不能保存或下载文件内容。</p></div><details><summary>补充说明（选填）</summary><label for="dataNote">数据备注</label><textarea id="dataNote" name="dataNote" maxlength="2000" placeholder="例如：采样间隔、布点位置或异常情况…"></textarea></details></div><div class="form-footer"><button type="submit" id="uploadSubmit">提交数据记录</button><div id="formMessage" class="message" role="status" aria-live="polite"></div></div></form><section><h2>已登记的数据</h2><div id="uploadList" class="list"></div></section></div>`;
    const form=$('#uploadForm'),clean=guardDirty(form);let pairs=[];
    function getPairs(){return records().filter(r=>(approved(r)&&label(r)!=='已预约')||['待归还确认','已归还'].includes(r.status)).flatMap(r=>(r.devices||[]).map(d=>({r,d})));}
    function pair(){const selected=$('#recordSelect').value;return pairs.find(p=>JSON.stringify([p.r.id,p.d.id])===selected);}
    function setTimes(){const p=pair();$('#recordInfo').textContent=p?`${p.r.borrower||'学生'} · ${p.r.id}`:'请先完成借用，再登记对应数据。';$('#dataStart').value=p?localInput(p.r.startAt):'';$('#dataEnd').value=p?localInput(p.r.endAt):'';}
    function options(initial=false){const previous=$('#recordSelect').value;pairs=getPairs();$('#recordSelect').innerHTML='<option value="">请选择仪器与借用日期</option>'+pairs.map(p=>`<option value="${esc(JSON.stringify([p.r.id,p.d.id]))}">${esc(p.d.name)} · ${esc(period(p.r))} · ${esc(label(p.r))}</option>`).join('');let target=pairs.find(p=>JSON.stringify([p.r.id,p.d.id])===previous);if(initial&&params.get('record'))target=pairs.find(p=>p.r.id===params.get('record')&&(!params.get('device')||p.d.id===params.get('device')));if(initial&&!params.get('record')&&pairs.length===1)target=pairs[0];if(target)$('#recordSelect').value=JSON.stringify([target.r.id,target.d.id]);else if(initial&&params.get('record'))msg('#pageMessage','指定记录当前不可登记数据，请核对借用状态或从列表重新选择。',true);$('#uploadSubmit').disabled=!pairs.length;if(initial)setTimes();}
    function renderUploads(){const record=new URLSearchParams(location.search).get('record');const list=uploads().filter(u=>!record||u.recordId===record);$('#uploadList').innerHTML=list.length?list.map(u=>`<article class="list-row"><div class="row-main"><h3>${esc(u.deviceName)}</h3><p class="row-desc">${esc(u.fileName)} · ${esc(u.fileSize)}</p><div class="meta">采集 ${esc(time(u.dataStart))} 至 ${esc(time(u.dataEnd))}</div><div class="meta">登记 ${esc(u.createdAt)} · ${esc(u.recordId)}</div>${u.note?`<p class="row-desc">${esc(u.note)}</p>`:''}</div></article>`).join(''):empty(record?'这条借用记录还没有登记数据。':'还没有登记数据，选择仪器和文件后即可提交。');}
    listen('#recordSelect','change',()=>{setTimes();const p=pair();setQuery('record',p?.r.id||'');setQuery('device',p?.d.id||'');renderUploads();});
    listen(form,'submit',e=>{e.preventDefault();const current=getPairs().find(p=>JSON.stringify([p.r.id,p.d.id])===$('#recordSelect').value);if(!current)throw new Error('关联记录已变化，请刷新后重新选择。');const file=$('#dataFile').files[0],start=$('#dataStart').value,end=$('#dataEnd').value;if(!file)throw new Error('请选择原始数据文件。');if(!validDate(start)||!validDate(end)||new Date(end)<=new Date(start))throw new Error('采集结束时间应晚于开始时间。');const list=uploads();list.unshift({id:uid('DATA'),recordId:current.r.id,deviceId:current.d.id,deviceName:current.d.name,dataStart:start,dataEnd:end,fileName:file.name,fileSize:`${Math.ceil(file.size/1024)} KB`,note:$('#dataNote').value.trim(),createdAt:stamp()});save(KEYS.uploads,list);$('#dataFile').value='';$('#dataNote').value='';clean();renderUploads();msg('#formMessage','数据记录已登记。你可以继续登记其他文件。');});
    options(true);renderUploads();return ()=>{options();renderUploads();};
  }
  function statusPage() {
    $('#app').innerHTML=head('我的借用','查看处理进度，从对应记录继续归还或上传数据。',`<a class="button" href="${PAGES.borrow}">借用仪器</a>`)+`<div id="statusSummary" class="summary-strip"></div><p class="help">已预约与使用中按预约时间展示，不代表实际领用确认。</p><section class="section"><h2>待处理</h2><div id="pendingList" class="list"></div></section><section class="section"><h2>预约与进行中</h2><div id="activeList" class="list"></div></section><section class="section"><details id="historyDetails"><summary id="historySummary">历史借用记录</summary><div id="historyList" class="list"></div></details></section><section class="section"><details><summary>原始数据登记记录</summary><div id="uploadList" class="list"></div></details></section>`;
    function draw(){const list=records();const pending=list.filter(r=>['待审批','待归还确认','已拒绝'].includes(r.status)),active=list.filter(approved),history=list.filter(r=>!pending.includes(r)&&!active.includes(r));$('#statusSummary').innerHTML=`<span><strong>${pending.length}</strong>待处理</span><span><strong>${active.filter(r=>label(r)==='已预约').length}</strong>已预约</span><span><strong>${active.filter(r=>label(r)==='使用中').length}</strong>使用中</span><span><strong>${history.filter(r=>r.status==='已归还').length}</strong>已归还</span>`;$('#pendingList').innerHTML=pending.length?pending.map(r=>recordRow(r)).join(''):empty('目前没有待审批或待验收事项。');$('#activeList').innerHTML=active.length?active.map(r=>recordRow(r)).join(''):empty('暂无正在预约或使用的仪器。');$('#historySummary').textContent=`历史借用记录（${history.length}）`;$('#historyList').innerHTML=history.length?history.map(r=>recordRow(r)).join(''):empty('尚无历史借用记录。');const data=uploads();$('#uploadList').innerHTML=data.length?data.map(u=>`<article class="list-row"><div class="row-main"><h3>${esc(u.deviceName)}</h3><div class="meta">${esc(u.fileName)} · ${esc(time(u.dataStart))} 至 ${esc(time(u.dataEnd))}</div><div class="meta">${esc(u.recordId)}</div></div></article>`).join(''):empty('尚未登记原始数据。');}
    draw();return draw;
  }
  function admin() {
    let editingId='';const views={todo:'待办',devices:'设备管理',requests:'借用记录',data:'数据资料'};
    const view=Object.hasOwn(views,params.get('view'))?params.get('view'):'todo';
    $('#app').innerHTML=head('仪器管理','先处理审批与归还，再维护设备和查阅资料。',`<a href="${PAGES.home}">学生端首页</a>`)+`<nav class="view-nav" aria-label="后台模块">${Object.entries(views).map(([key,name])=>`<a href="${route('admin',{view:key})}" ${view===key?'aria-current="page"':''}>${name}<span id="count-${key}"></span></a>`).join('')}</nav><div id="adminContent"></div>`;

    let activeRecordEditor=null;
    let requestQuick=params.get('quick')||'';
    let requestDeviceInitialized=false;
    const correctionTitles={period:'调整使用期',revoke:'撤回审批',reopen:'重新打开申请',cancel:'取消预约',undoReturn:'撤销归还确认',undoLast:'撤销上次变更',reject:'拒绝申请'};
    const correctionSubmits={period:'保存日期',revoke:'确认撤回',reopen:'恢复待审批',cancel:'确认取消预约',undoReturn:'恢复待验收',undoLast:'确认撤销变更',reject:'确认拒绝'};
    function moreActions(r){const list=correctionActions(r);return list.length?`<details class="record-more"><summary>更多操作</summary><div class="more-actions">${list.map(([action,title])=>`<button class="quiet" type="button" data-record-action="${action}" data-record-id="${esc(r.id)}">${title}</button>`).join('')}</div></details>`:'';}
    function editorControls(disabled){
      $$('#adminContent [data-approve],#adminContent [data-reject],#adminContent [data-confirm],#adminContent [data-record-action],#requestFilters input,#requestFilters select,#requestFilters button,#downloadRequests').forEach(el=>{el.disabled=disabled;});
    }
    function closeRecordEditor(redraw=true){if(!activeRecordEditor)return;activeRecordEditor.clean();activeRecordEditor.form.remove();activeRecordEditor=null;editorControls(false);if(redraw)refresh();}
    function openRecordEditor(action,id){
      if(activeRecordEditor)return;
      const record=records().find(r=>r.id===id);
      if(!record||(action==='reject'?record.status!=='待审批':!correctionActions(record).some(([key])=>key===action)))throw new Error('记录状态已变化，请刷新后重新操作。');
      const row=$$('[data-row-id]').find(el=>el.dataset.rowId===id);
      if(!row)return;
      const menu=$('.record-more',row);if(menu)menu.open=false;
      const needsDates=action==='period'||action==='reopen';
      const lockedStart=action==='period'&&label(record)==='使用中';
      const last=latestChange(record);
      const explanation={period:lockedStart?'使用中的仪器保留原开始时间。保存前会检查新的预计归还时间是否与其他预约冲突。':'调整后会重新检查所有仪器的排期，原日期保留在变更记录中。',revoke:'仅适用于尚未开始的预约。撤回后恢复待审批，原审批保留在变更记录中。',reopen:'恢复为待审批，可同时修正新的借用日期。仍需再次审批。',cancel:'取消后释放预约排期，保留申请及取消原因。',undoReturn:'恢复为待归还验收，并恢复设备占用。后续已有冲突预约时不能直接恢复。',undoLast:last?`仅撤销最近一次“${last.action}”，保留所有变更历史和数据登记。`:'',reject:'原因会显示给学生，方便修改后重新申请。'};
      row.insertAdjacentHTML('beforeend',`<form class="record-editor" data-record-form="${action}"><h3 tabindex="-1">${correctionTitles[action]}</h3><p class="help">${esc(explanation[action])}</p>${needsDates?`<div class="form-grid"><div><label for="editStartAt">借用开始时间</label><input id="editStartAt" name="startAt" type="datetime-local" value="${esc(localInput(record.startAt))}" required ${lockedStart?'readonly':''}></div><div><label for="editEndAt">预计归还时间</label><input id="editEndAt" name="endAt" type="datetime-local" value="${esc(localInput(record.endAt))}" required></div></div>`:''}<label for="recordChangeReason">${action==='reject'?'拒绝原因':'修改／纠正原因'}</label><textarea id="recordChangeReason" name="reason" required maxlength="1000" placeholder="说明原因，方便学生和管理员核对…"></textarea><div class="actions"><button type="submit">${correctionSubmits[action]}</button><button type="button" class="secondary" data-close-record-editor>取消修改</button></div><div class="message" id="recordEditMessage" role="status" aria-live="polite"></div></form>`);
      const form=$('[data-record-form]',row);
      activeRecordEditor={form,id,action,token:recordToken(record),original:record,undoOf:last?.id,clean:guardDirty(form)};
      editorControls(true);$('h3',form).focus({preventScroll:true});form.scrollIntoView({block:'nearest'});
      if(action==='reject')form.elements.reason.focus();
    }
    function saveRecordEditor(form){
      const editor=activeRecordEditor;
      if(!editor||editor.form!==form)return;
      const reason=form.elements.reason.value.trim();
      if(!reason){msg('#recordEditMessage','请填写修改或纠正原因。',true);return;}
      const values={reason,undoOf:editor.undoOf};
      for(const key of ['startAt','endAt'])if(form.elements[key])values[key]=form.elements[key].value===localInput(editor.original[key])?editor.original[key]:form.elements[key].value;
      try{
        updateRecord(editor.id,r=>editor.action==='reject'?r.status==='待审批':true,r=>{
          if(editor.action==='reject'){r.status='已拒绝';r.rejectReason=reason;r.reviewedAt=stamp();return;}
          const candidate=applyCorrection(r,editor.action,values,records(),inventory());
          for(const field of Object.keys(AUDIT_FIELDS))if(!Object.hasOwn(candidate,field))delete r[field];
          Object.assign(r,candidate);
        },{expectedToken:editor.token,action:correctionTitles[editor.action],reason,...(editor.action==='undoLast'?{undoOf:editor.undoOf}:{})});
        const title=correctionTitles[editor.action];closeRecordEditor(false);refresh();msg('#pageMessage',`${title}已保存，学生端与排期已更新。`);
      }catch(error){msg('#recordEditMessage',error.message,true);}
    }
    function requestSelection(){return filterBorrowRecords(records(),{keyword:$('#requestSearch').value,status:$('#requestStatus').value,device:$('#requestDevice').value,from:$('#requestFrom').value,to:$('#requestTo').value,overdue:requestQuick==='overdue'});}
    function totals(){const list=records();$('#count-todo').textContent=` (${list.filter(r=>['待审批','待归还确认'].includes(r.status)).length})`;}
    function actions(r){if(r.status==='待审批')return `<button type="button" data-approve="${esc(r.id)}">通过申请</button><button type="button" class="secondary" data-reject="${esc(r.id)}">拒绝</button>`;if(r.status==='待归还确认')return `<button type="button" data-confirm="${esc(r.id)}">确认归还</button>`;return '';}
    function adminRow(r){return `<article class="list-row" data-row-id="${esc(r.id)}"><div class="row-main"><div class="row-title"><h3>${esc(deviceText(r))}</h3>${recordBadge(r)}</div><div class="meta">${esc(r.borrower)} · ${esc(r.contact)} · ${esc(period(r))}</div><div class="meta">使用地点 ${esc(r.place||'未填写')} · ${esc(r.group||'未填写课题组')}</div><p class="row-desc">用途：${esc(r.purpose||'未填写')}</p>${r.status==='待归还确认'||r.status==='已归还'?`<div class="notice">归还位置：${esc(r.returnLocation||'未填写')}<br>设备状态：${r.returnNormal==='否'?'有异常':'正常'}${r.returnNote?`<br>备注：${esc(r.returnNote)}`:''}<br>照片登记：${esc(r.returnPhotoName||'未登记')}<br>提交：${esc(r.returnSubmittedAt||'未登记')}</div>`:''}${r.rejectReason?`<p class="row-desc">拒绝原因：${esc(r.rejectReason)}</p>`:''}${r.cancelReason?`<p class="row-desc">取消原因：${esc(r.cancelReason)}</p>`:''}${r.originalPeriod?`<div class="meta">最初申请：${esc(period(r.originalPeriod))}</div>`:''}${changeHistoryHtml(r)}<details><summary>完整记录</summary><p>编号：${esc(r.id)}<br>提交：${esc(r.createdAt)}${r.reviewedAt?`<br>审批：${esc(r.reviewedAt)}`:''}${r.returnedAt?`<br>归还确认：${esc(r.returnedAt)}`:''}<br>仪器明细：${esc((r.devices||[]).map(d=>`${d.name}（${d.id}）`).join('、'))}</p></details></div><div class="row-actions">${actions(r)}${moreActions(r)}</div></article>`;}
    function todoDraw(){const list=records(),pending=list.filter(r=>r.status==='待审批'),waiting=list.filter(r=>r.status==='待归还确认'),late=list.filter(overdue);$('#pendingList').innerHTML=pending.length?pending.map(adminRow).join(''):empty('所有申请均已处理。');$('#returnList').innerHTML=waiting.length?waiting.map(adminRow).join(''):empty('暂无待验收的归还登记。');$('#overdueList').innerHTML=late.length?late.map(adminRow).join(''):empty('暂无超期未归还的记录。');totals();}

    function requestDraw(){
      const select=$('#requestDevice'),previous=requestDeviceInitialized?select.value:params.get('device')||'';
      requestDeviceInitialized=true;
      const names=new Map(inventory().map(d=>[d.id,d.name]));for(const r of records())for(const d of r.devices||[])if(!names.has(d.id))names.set(d.id,d.name);
      select.innerHTML='<option value="">全部仪器</option>'+[...names].map(([id,name])=>`<option value="${esc(id)}">${esc(name)}（${esc(id)}）</option>`).join('');select.value=previous;
      try{const list=requestSelection();$('#requestList').innerHTML=list.length?list.map(adminRow).join(''):empty('暂无符合筛选条件的借用记录。');$('#requestCount').textContent=`${list.length} 条`;msg('#requestFilterMessage','');}
      catch(error){$('#requestList').innerHTML=empty('请先修正筛选日期。');$('#requestCount').textContent='';msg('#requestFilterMessage',error.message,true);}
      $$('[data-request-quick]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.requestQuick||'')===requestQuick)));
      totals();
    }

    const field=(id,name,labelText,value='',type='text',required=false)=>`<div><label for="${id}">${labelText}</label><input id="${id}" name="${name}" type="${type}" value="${esc(value)}" ${required?'required':''} autocomplete="off" maxlength="300"></div>`;
    let cleanDevice=()=>{};
    function showDeviceForm(d=null){editingId=d?.id||'';$('#deviceEditor').hidden=false;$('#deviceEditor').innerHTML=`<form id="deviceForm" class="panel admin-form"><h2 id="deviceFormTitle" tabindex="-1">${d?'编辑设备':'新增设备'}</h2><div class="form-grid">${field('deviceId','id','仪器编号',d?.id||'','text',true)}${field('deviceName','name','仪器名称',d?.name||'','text',true)}${field('deviceModel','model','型号',d?.model||'')}<div><label for="deviceCategory">仪器分类</label><select id="deviceCategory" name="category">${CATEGORIES.map(c=>`<option ${c===d?.category?'selected':''}>${c}</option>`).join('')}</select></div>${field('deviceLocation','location','存放位置',d?.location||'')}${field('ownerTeacher','ownerTeacher','归属老师',d?.ownerTeacher||'未分配')}${field('purchaseYear','purchaseYear','购买年份／年限',d?.purchaseYear||'')}<div><label for="deviceStatus">借用状态</label><select id="deviceStatus" name="status">${['可预订','需确认','维护中','暂不可借'].map(s=>`<option ${s===d?.status?'selected':''}>${s}</option>`).join('')}</select></div><div><label for="purposeTag">用途标签</label><select id="purposeTag" name="purposeTag">${['风','光','热','雨','电','其他'].map(t=>`<option ${t===d?.purposeTag?'selected':''}>${t}</option>`).join('')}</select></div><label class="check"><input id="openToStudent" name="openToStudent" type="checkbox" ${d?.openToStudent!==false?'checked':''}>开放学生端借用</label><div class="full"><label for="deviceUsage">用途说明</label><textarea id="deviceUsage" name="usage" maxlength="2000">${esc(d?.usage||'')}</textarea></div><details class="full"><summary>场景与注意事项（选填）</summary><label for="deviceScenarios">适用场景</label><textarea id="deviceScenarios" name="scenarios" maxlength="2000">${esc(d?.scenarios||'')}</textarea><label for="deviceNotes">注意事项</label><textarea id="deviceNotes" name="notes" maxlength="2000">${esc(d?.notes||'')}</textarea></details></div><p class="help">计算显示及其他类设备仍由管理员线下管理。</p><div class="actions"><button type="submit">保存设备</button><button class="secondary" id="cancelEdit" type="button">取消编辑</button></div></form>`;if(d)$('#deviceId').readOnly=true;cleanDevice=guardDirty($('#deviceForm'));$('#deviceFormTitle').focus();listen('#cancelEdit','click',()=>{cleanDevice();$('#deviceEditor').hidden=true;$('#addDevice').focus();});listen('#deviceForm','submit',e=>{e.preventDefault();const form=e.currentTarget,data=new FormData(form),list=inventory(),id=String(data.get('id')).trim(),name=String(data.get('name')).trim();if(!id||!name)throw new Error('请填写仪器编号和名称。');if(!editingId&&list.some(x=>x.id===id))throw new Error('仪器编号已存在，请使用不同编号。');const original=list.find(x=>x.id===editingId);if(editingId&&!original)throw new Error('设备已发生变化，请刷新后重新编辑。');const values=Object.fromEntries(['id','name','model','category','location','ownerTeacher','purchaseYear','purposeTag','status','usage','scenarios','notes'].map(k=>[k,String(data.get(k)||'').trim()]));const typeMap={'风':'wind','光':'light','热':'heat','雨':'rain','电':'electric','其他':'electric'};const device=normalizeDevice({...original,...values,type:original?.type||typeMap[values.purposeTag],openToStudent:form.elements.openToStudent.checked,booked:original?.booked||[]});save(KEYS.devices,editingId?list.map(x=>x.id===editingId?device:x):[device,...list]);cleanDevice();$('#deviceEditor').hidden=true;deviceDraw();msg('#pageMessage','设备已保存，学生端会读取更新后的设备资料。');$('#addDevice').focus();});}
    function deviceDraw(){const all=inventory(),text=$('#deviceSearch').value.trim().toLowerCase();const list=all.filter(d=>(!$('#deviceOpen').value||String(openDevice(d))===$('#deviceOpen').value)&&(!$('#teacherFilter').value||(d.ownerTeacher||'未分配')===$('#teacherFilter').value)&&(!$('#yearFilter').value||(d.purchaseYear||'未登记')===$('#yearFilter').value)&&(!$('#purposeFilter').value||(d.purposeTag||'其他')===$('#purposeFilter').value)&&`${d.id} ${d.name} ${d.model} ${d.category} ${d.location}`.toLowerCase().includes(text));$('#deviceCount').textContent=`${list.length} / ${all.length} 台`;$('#deviceList').innerHTML=list.length?list.map(d=>`<article class="list-row"><div class="row-main"><div class="row-title"><h3>${esc(d.name)}</h3>${badge(d.status)}${!openDevice(d)?badge('学生端隐藏'):''}</div><div class="meta">${esc(d.id)} · ${esc(d.model)} · ${esc(d.category)}</div><div class="meta">${esc(d.location)} · ${esc(d.ownerTeacher||'未分配')} · ${esc(d.purchaseYear||'未登记')}</div><p class="row-desc">${esc(d.usage)}</p></div><div class="row-actions"><button class="secondary" type="button" data-edit="${esc(d.id)}">编辑</button><button class="quiet" type="button" data-toggle="${esc(d.id)}">${d.openToStudent?'隐藏':'开放'}</button></div></article>`).join(''):empty('暂无符合筛选条件的设备。');for(const [id,prop,fallback] of [['teacherFilter','ownerTeacher','未分配'],['yearFilter','purchaseYear','未登记'],['purposeFilter','purposeTag','其他']]){const el=$('#'+id),value=el.value;el.innerHTML=`<option value="">全部${id==='teacherFilter'?'老师':id==='yearFilter'?'年限':'用途'}</option>`+[...new Set(all.map(d=>d[prop]||fallback))].map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');el.value=value;}}
    function dataDraw(){const keyword=$('#uploadSearch').value.trim().toLowerCase(),device=$('#uploadDevice').value,start=$('#uploadStart').value,end=$('#uploadEnd').value;const all=uploads(),borrowList=records();const filtered=all.filter(u=>{const owner=borrowList.find(r=>r.id===u.recordId);return (!device||u.deviceName===device)&&`${u.id} ${u.recordId} ${u.fileName} ${owner?.borrower||''} ${owner?.group||''}`.toLowerCase().includes(keyword)&&(!start||new Date(u.dataEnd)>=new Date(start+'T00:00'))&&(!end||new Date(u.dataStart)<new Date(new Date(end+'T00:00').getTime()+86400000));});$('#uploadList').innerHTML=filtered.length?`<div class="data-table" role="region" aria-label="原始数据登记表" tabindex="0"><table><thead><tr>${['仪器／学生','文件','采集时间段','关联借用','登记时间／备注'].map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${filtered.map(u=>`<tr><td>${esc(u.deviceName)}<br>${esc(borrowList.find(r=>r.id===u.recordId)?.borrower||'未登记')}</td><td>${esc(u.fileName)}<br>${esc(u.fileSize)}</td><td>${esc(time(u.dataStart))}<br>至 ${esc(time(u.dataEnd))}</td><td>${esc(u.recordId)}<br>${esc(u.id)}</td><td>${esc(u.createdAt)}<br>${esc(u.note||'')}</td></tr>`).join('')}</tbody></table></div>`:empty('暂无符合筛选条件的数据登记。');const previous=$('#uploadDevice').value;$('#uploadDevice').innerHTML='<option value="">全部仪器</option>'+[...new Set(all.map(u=>u.deviceName))].map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');$('#uploadDevice').value=previous;}
    if(view==='todo'){$('#adminContent').innerHTML=`<section><div class="section-head"><h2>待审批申请</h2><a href="${route('admin',{view:'requests'})}">全部借用记录</a></div><div id="pendingList" class="list"></div></section><section class="section"><h2>待归还验收</h2><div id="returnList" class="list"></div></section><section class="section"><details><summary>超期未归还</summary><div id="overdueList" class="list"></div></details></section>`;todoDraw();}

    if(view==='requests'){
      $('#adminContent').innerHTML=`<div id="requestFilters"><div class="toolbar"><div class="grow"><label for="requestSearch">搜索借用记录</label><input id="requestSearch" name="requestSearch" type="search" value="${esc(params.get('q')||'')}" placeholder="学生、仪器、地点或申请编号…" autocomplete="off"></div><div><label for="requestStatus">状态</label><select id="requestStatus" name="requestStatus">${['ALL','待审批','已预约','使用中','待归还确认','已归还','已拒绝','已取消'].map(s=>`<option value="${s}" ${params.get('status')===s?'selected':''}>${s==='ALL'?'全部状态':s}</option>`).join('')}</select></div></div><div class="toolbar"><div class="field"><label for="requestDevice">仪器</label><select id="requestDevice" name="requestDevice"></select></div><div class="field"><label for="requestFrom">借用时段：开始日期</label><input id="requestFrom" name="requestFrom" type="date" value="${esc(params.get('from')||'')}"></div><div class="field"><label for="requestTo">借用时段：结束日期</label><input id="requestTo" name="requestTo" type="date" value="${esc(params.get('to')||'')}"></div></div><div class="chips" role="group" aria-label="借用日期快捷筛选"><button type="button" class="filter" data-request-quick="">全部日期</button><button type="button" class="filter" data-request-quick="today">今天</button><button type="button" class="filter" data-request-quick="week">未来一周</button><button type="button" class="filter" data-request-quick="overdue">已超期</button></div></div><p class="help">按借用时段与日期范围的重叠部分筛选；导出当前筛选结果。修改记录时请先保存或取消，再继续筛选。</p><div id="requestFilterMessage" class="message" role="status" aria-live="polite"></div><div class="section-head"><h2>借用记录 <span id="requestCount" class="meta" aria-live="polite"></span></h2><button class="secondary" id="downloadRequests" type="button">下载汇总表</button></div><div id="requestList" class="list"></div>`;
      const syncFilters=()=>{setQuery('q',$('#requestSearch').value);setQuery('status',$('#requestStatus').value);setQuery('device',$('#requestDevice').value);setQuery('from',$('#requestFrom').value);setQuery('to',$('#requestTo').value);setQuery('quick',requestQuick);};
      listen('#requestSearch','input',()=>{syncFilters();requestDraw();});
      for(const id of ['requestStatus','requestDevice','requestFrom','requestTo'])listen('#'+id,'change',()=>{if(id!=='requestDevice')requestQuick='';syncFilters();requestDraw();});
      listen('#requestFilters','click',e=>{const button=e.target.closest('[data-request-quick]');if(!button)return;requestQuick=button.dataset.requestQuick;const today=new Date(),end=new Date(today);$('#requestFrom').value='';$('#requestTo').value='';if(requestQuick==='today'||requestQuick==='week'){if(requestQuick==='week')end.setDate(end.getDate()+6);$('#requestFrom').value=dayKey(today);$('#requestTo').value=dayKey(end);}if(requestQuick==='overdue')$('#requestStatus').value='ALL';syncFilters();requestDraw();});
      listen('#downloadRequests','click',()=>{
        const cell=v=>{let text=String(v??'');if(/^[=+@\-\t\r]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';};
        const lines=[['申请编号','状态','借用人','联系方式','课题组','地点','开始时间','预计归还','仪器','用途','拒绝原因','审批时间','最初开始时间','最初预计归还','变更次数','最近变更原因'],...requestSelection().map(r=>[r.id,label(r),r.borrower,r.contact,r.group,r.place,r.startAt,r.endAt,deviceText(r),r.purpose,r.rejectReason,r.reviewedAt,r.originalPeriod?.startAt||r.startAt,r.originalPeriod?.endAt||r.endAt,r.changeHistory?.length||0,latestChange(r)?.reason||''])];
        const blob=new Blob(['\ufeff'+lines.map(row=>row.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`借用登记汇总-${dayKey(new Date())}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      });requestDraw();
    }

    if(view==='devices'){$('#adminContent').innerHTML=`<div class="section-head"><h2>设备管理 <span id="deviceCount" class="meta"></span></h2><button id="addDevice" type="button">新增设备</button></div><div class="toolbar"><div class="grow"><label for="deviceSearch">搜索设备</label><input id="deviceSearch" name="deviceSearch" type="search" placeholder="名称、编号、型号或位置…" autocomplete="off"></div><div><label for="deviceOpen">开放状态</label><select id="deviceOpen" name="deviceOpen"><option value="">全部设备</option><option value="true">学生端开放</option><option value="false">学生端隐藏</option></select></div></div><details><summary>更多筛选</summary><div class="toolbar"><div class="field"><label for="teacherFilter">归属老师</label><select id="teacherFilter" name="teacherFilter"></select></div><div class="field"><label for="yearFilter">购买年限</label><select id="yearFilter" name="yearFilter"></select></div><div class="field"><label for="purposeFilter">用途标签</label><select id="purposeFilter" name="purposeFilter"></select></div></div></details><div id="deviceEditor" hidden></div><div id="deviceList" class="list section"></div>`;listen('#addDevice','click',()=>showDeviceForm());listen('#deviceSearch','input',deviceDraw);for(const id of ['deviceOpen','teacherFilter','yearFilter','purposeFilter'])listen('#'+id,'change',deviceDraw);listen('#deviceList','click',e=>{const edit=e.target.closest('[data-edit]'),toggle=e.target.closest('[data-toggle]');if(edit)showDeviceForm(inventory().find(d=>d.id===edit.dataset.edit));if(toggle){const list=inventory(),d=list.find(d=>d.id===toggle.dataset.toggle);if(d){d.openToStudent=!d.openToStudent;save(KEYS.devices,list);deviceDraw();msg('#pageMessage',`${d.name}已${d.openToStudent?'设为开放':'隐藏'}。`);}}});deviceDraw();}
    if(view==='data'){$('#adminContent').innerHTML=`<h2>原始数据汇总</h2><div class="toolbar"><div class="grow"><label for="uploadSearch">搜索学生或文件</label><input id="uploadSearch" name="uploadSearch" type="search" placeholder="学生、课题组、文件或记录编号…" autocomplete="off"></div><div><label for="uploadDevice">仪器</label><select id="uploadDevice" name="uploadDevice"></select></div><div><label for="uploadStart">采集开始日期</label><input id="uploadStart" name="uploadStart" type="date"></div><div><label for="uploadEnd">采集结束日期</label><input id="uploadEnd" name="uploadEnd" type="date"></div></div><p class="help">按采集时间与筛选日期的重叠范围查询。</p><div id="uploadList"></div>`;listen('#uploadSearch','input',dataDraw);for(const id of ['uploadDevice','uploadStart','uploadEnd'])listen('#'+id,'change',dataDraw);dataDraw();}

    function refresh(){
      totals();
      if(activeRecordEditor?.form.isConnected){const current=records().find(r=>r.id===activeRecordEditor.id);if(!current||recordToken(current)!==activeRecordEditor.token)msg('#recordEditMessage','这条记录已在其他页面发生变更。请取消编辑，重新打开后核对。');return;}
      if(view==='todo')todoDraw();if(view==='requests')requestDraw();if(view==='devices')deviceDraw();if(view==='data')dataDraw();
    }
    listen('#adminContent','click',e=>{
      const management=e.target.closest('[data-record-action]');
      if(management){openRecordEditor(management.dataset.recordAction,management.dataset.recordId);return;}
      if(e.target.closest('[data-close-record-editor]')){closeRecordEditor();return;}
      const approve=e.target.closest('[data-approve]'),reject=e.target.closest('[data-reject]'),confirm=e.target.closest('[data-confirm]');
      if(approve){updateRecord(approve.dataset.approve,r=>r.status==='待审批',r=>{if(!validDate(r.startAt)||!validDate(r.endAt)||new Date(r.endAt)<=new Date(r.startAt)||new Date(r.endAt)<=new Date())throw new Error('申请时段无效或预计归还时间已过去，请拒绝并让学生重新申请。');const list=inventory();for(const device of r.devices||[]){const d=list.find(x=>x.id===device.id);if(!d||!openDevice(d)||!usable(d))throw new Error(`${device.name}已暂停借用，请核对设备状态。`);if(conflicts(d,r.startAt,r.endAt,r.id).length)throw new Error(`${device.name}存在排期冲突，请先处理冲突记录。`);}r.status='已通过';r.reviewedAt=stamp();r.rejectReason='';});refresh();msg('#pageMessage','申请已通过，学生端会显示对应预约状态。');}
      if(reject)openRecordEditor('reject',reject.dataset.reject);
      if(confirm){updateRecord(confirm.dataset.confirm,r=>r.status==='待归还确认',r=>{r.status='已归还';r.returnedAt=stamp();});refresh();msg('#pageMessage','归还已确认，学生端状态已更新。');}
    });
    listen('#adminContent','submit',e=>{const form=e.target.closest('[data-record-form]');if(!form)return;e.preventDefault();saveRecordEditor(form);});

    totals();return refresh;
  }
  function boot(){const page=document.body.dataset.page;header(page);inventory();const refresh=({home,borrow,returns,data:dataPage,status:statusPage,admin}[page])();window.addEventListener('storage',event=>{if(Object.values(KEYS).includes(event.key)){try{refresh();}catch(error){msg('#pageMessage',error.message,true);}}});window.addEventListener('pageshow',event=>{if(event.persisted)refresh();});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});}
  // Export pure workflow helpers for focused regression tests without a browser.
  const api={KEYS,CATEGORIES,PAGES,label,overdue,conflicts,fixedBookings,normalizeDevice,openDevice,localInput,applyCorrection,filterBorrowRecords,appendHistory,correctionActions,recordToken};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(typeof document!=='undefined'){try{boot();}catch(error){const app=$('#app');app.innerHTML=`<h1>暂时无法打开页面</h1><p>${esc(error.message)}</p><a href="${PAGES.home}">返回仪器首页</a>`;}}
})();
