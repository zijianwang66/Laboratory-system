const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require('playwright');
const root = path.resolve(__dirname,'..');
const api = require('../assets/device-common.js');
require('./record-management.cjs');
const output = path.join(root,'test-results','ui');
fs.mkdirSync(output,{recursive:true});
const checks=[];
function pass(name){checks.push(name);console.log('PASS',name);}
const sample = {id:'A',name:'仪器',booked:[]};
const record = (status,startAt,endAt) => ({id:'R',status,startAt,endAt,devices:[sample]});
assert.equal(api.label(record('已通过','2099-01-01','2099-01-02')),'已预约');
assert.equal(api.label(record('已通过','2000-01-01','2099-01-02')),'使用中');
assert.deepEqual(api.conflicts(sample,'2027-01-31T23:30','2027-02-01T01:00','',[record('待审批','2027-02-01T00:30','2027-02-01T02:00')]),['该时段已有申请或预约']);
assert.equal(api.conflicts(sample,'2099-02-01T02:00','2099-02-01T03:00','',[record('已通过','2099-02-01T01:00','2099-02-01T02:00')]).length,0);
assert.equal(api.conflicts(sample,'2027-02-05T00:00','2027-02-06T00:00','',[record('待归还确认','2027-02-01T01:00','2027-02-01T02:00')]).length,1);
assert.equal(api.conflicts({...sample,booked:[13]},'2026-10-13T00:00','2026-10-14T00:00','',[]).length,1);
assert.equal(api.conflicts({...sample,booked:[13]},'2026-11-13T00:00','2026-11-14T00:00','',[]).length,0);
assert.equal(api.conflicts({...sample,booked:[13]},'2026-10-12T23:00','2026-10-13T00:00','',[]).length,0);
assert.equal(api.normalizeDevice({...sample,custom:'keep'}).custom,'keep');
pass('跨月冲突、相邻时段、待验收占用、旧排期月份和数据兼容');

const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://127.0.0.1');const filename=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(!filename.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(filename,(error,content)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Content-Type',filename.endsWith('.html')?'text/html; charset=utf-8':filename.endsWith('.js')?'application/javascript; charset=utf-8':filename.endsWith('.css')?'text/css; charset=utf-8':'application/octet-stream');res.end(content);});});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}/`;
 const executable=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
 const browser=await chromium.launch({headless:true,...(executable?{executablePath:executable}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Shanghai',locale:'zh-CN'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const goto=async route=>{await page.goto(base+route);await page.locator('#app h1').waitFor();assert(!await page.locator('#app').innerText().then(t=>t.includes('暂时无法打开页面')));};
 const key=api.KEYS;
 try{
  await goto(api.PAGES.home);
  assert.equal(await page.locator('#deviceList .list-row').count(),11);
  await goto('index.html');assert.equal(await page.locator('#deviceList .list-row').count(),11);
  await page.locator('#searchInput').fill('手持气象站');
  await page.getByRole('link',{name:'申请借用',exact:true}).click();
  assert.match(await page.locator('#selectedStrip').innerText(),/手持气象站/);
  const homeFilters=await page.locator('#categoryFilters button').allTextContents();
  assert(homeFilters.includes('温湿度监测')&&homeFilters.includes('实验辅助'));
  pass('首页搜索直达预选仪器、统一分类');
  await page.locator('[data-calendar]').first().click();
  const firstMonth=await page.locator('.calendar-head strong').innerText();
  await page.getByRole('button',{name:'下个月',exact:true}).click();
  assert.notEqual(await page.locator('.calendar-head strong').innerText(),firstMonth);
  const start=new Date(Date.now()+90*86400000),end=new Date(start.getTime()+86400000);start.setSeconds(0,0);end.setSeconds(0,0);
  await page.locator('#startAt').fill(api.localInput(start));await page.locator('#endAt').fill(api.localInput(end));
  await page.locator('#place').fill('实验室603');await page.locator('#purpose').fill('跨月采集验证');
  await page.locator('#borrower').fill('测试学生');await page.locator('#contact').fill('test-contact');await page.locator('#group').fill('测试组');await page.locator('#rememberProfile').check();
  await page.getByRole('button',{name:'提交借用申请',exact:true}).click();
  assert.match(await page.locator('#formMessage').innerText(),/申请已提交/);
  let saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key.records);assert.equal(saved.length,1);let id=saved[0].id;
  pass('动态月份、借用申请提交和常用资料保存');
  await goto(api.PAGES.borrow);assert.equal(await page.locator('#borrower').inputValue(),'测试学生');assert(!await page.locator('#profileDetails').evaluate(el=>el.open));
  await goto(api.PAGES.admin);await page.getByRole('button',{name:'通过申请',exact:true}).click();
  await goto(api.PAGES.status);assert.match(await page.locator('#activeList').innerText(),/已预约/);assert.equal(await page.getByRole('link',{name:'去归还',exact:true}).count(),0);
  pass('后台审批通过、未来预约不误标使用中');
  await page.evaluate(({key,id})=>{const list=JSON.parse(localStorage.getItem(key));const r=list.find(r=>r.id===id);r.startAt=new Date(Date.now()-3600000).toISOString();r.endAt=new Date(Date.now()+3600000).toISOString();localStorage.setItem(key,JSON.stringify(list));},{key:key.records,id});
  await goto(api.PAGES.status);await page.getByRole('link',{name:'去归还',exact:true}).click();
  assert.equal(await page.locator('input[name=returnChoice]:checked').count(),1);assert.equal(await page.locator('#returnLocation').inputValue(),'实验室603-防潮柜');
  await page.getByRole('button',{name:'提交归还',exact:true}).click();assert.match(await page.locator('#formMessage').innerText(),/等待管理员验收/);assert(await page.locator('#returnSubmit').isDisabled());
  saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key.records);assert.equal(saved[0].status,'待归还确认');const submittedAt=saved[0].returnSubmittedAt;
  await page.locator('#returnForm').evaluate(form=>form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
  saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key.records);assert.equal(saved[0].returnSubmittedAt,submittedAt);
  pass('归还记录自动关联、默认位置、禁止重复提交');
  await goto(api.PAGES.admin);await page.getByRole('button',{name:'确认归还',exact:true}).click();
  await goto(api.PAGES.status);await page.locator('#historyDetails').evaluate(el=>el.open=true);assert.match(await page.locator('#historyList').textContent(),/已归还/);
  await page.locator('#historyList').getByRole('link',{name:'上传数据',exact:true}).click();
  assert.match(await page.locator('#recordSelect').inputValue(),new RegExp(id));
  await page.locator('#dataFile').setInputFiles({name:'采集数据.csv',mimeType:'text/csv',buffer:Buffer.from('time,value\n1,2')});
  await page.getByRole('button',{name:'提交数据记录',exact:true}).click();
  const data=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key.uploads);assert.equal(data[0].recordId,id);assert.equal(data[0].fileName,'采集数据.csv');
  await goto(api.PAGES.admin+'?view=data');assert.match(await page.locator('#uploadList').innerText(),/测试学生/);
  await page.locator('#uploadSearch').fill('不匹配的学生');assert.match(await page.locator('#uploadList').innerText(),/暂无符合/);await page.locator('#uploadSearch').fill('测试学生');assert.match(await page.locator('#uploadList').innerText(),/采集数据.csv/);
  pass('管理员验收、已归还记录关联上传、后台资料查询');
  await page.evaluate(({key})=>{const list=JSON.parse(localStorage.getItem(key));list.unshift({...list[0],id:'REJECT-TEST',status:'待审批',returnSubmittedAt:undefined,returnedAt:undefined,returnLocation:undefined,returnNote:undefined,returnPhotoName:undefined,purpose:'<img src=x onerror="window.injected=true">'});localStorage.setItem(key,JSON.stringify(list));},{key:key.records});
  await goto(api.PAGES.admin);await page.getByRole('button',{name:'拒绝',exact:true}).click();await page.locator('textarea[name=reason]').fill('请补充使用地点');await page.getByRole('button',{name:'确认拒绝',exact:true}).click();
  await goto(api.PAGES.status);assert.match(await page.locator('#pendingList').innerText(),/请补充使用地点/);assert.equal(await page.evaluate(()=>window.injected),undefined);
  pass('拒绝原因回显、历史状态兼容和用户内容转义');
  await page.evaluate(k=>{const list=JSON.parse(localStorage.getItem(k));list[0].customField='preserve';localStorage.setItem(k,JSON.stringify(list));},key.devices);
  await goto(api.PAGES.admin+'?view=devices');assert(await page.locator('#deviceEditor').isHidden());await page.locator('[data-edit]').first().click();await page.locator('#deviceLocation').fill('实验室603-新柜位');await page.getByRole('button',{name:'保存设备',exact:true}).click();
  const devices=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key.devices);assert.equal(devices[0].customField,'preserve');assert(devices[0].booked.length>0);assert.equal(devices[0].location,'实验室603-新柜位');
  await page.getByRole('button',{name:'新增设备',exact:true}).click();await page.locator('#deviceId').fill('NEW-TEST');await page.locator('#deviceName').fill('新实验辅助设备');await page.locator('#deviceCategory').selectOption({label:'实验辅助类'});await page.getByRole('button',{name:'保存设备',exact:true}).click();
  await goto(api.PAGES.home);await page.locator('#searchInput').fill('新实验辅助设备');assert.equal(await page.locator('#deviceList .list-row').count(),1);
  pass('设备编辑保留排期及额外字段、新增设备同步到首页');
  const preview=await context.newPage();preview.on('pageerror',e=>errors.push(e.message));await preview.goto(base+api.PAGES.home);await page.goto(base+api.PAGES.admin+'?view=devices');await page.locator('#deviceSearch').fill('新实验辅助设备');await page.locator('[data-toggle]').click();await preview.locator('#searchInput').fill('新实验辅助设备');assert.match(await preview.locator('#deviceList').innerText(),/没有找到/);await preview.close();
  pass('跨页面 storage 同步、隐藏设备不再进入学生目录');
  const fixture={id:'ACTIVE-FIXTURE',status:'已通过',borrower:'测试同学',contact:'test-contact',group:'测试组',place:'实验室603',purpose:'仪器采集',createdAt:'测试记录',startAt:new Date(Date.now()-3600000).toISOString(),endAt:new Date(Date.now()+3600000).toISOString(),devices:[{id:'2509154E',name:'手持气象站',location:'实验室603-防潮柜'}]};
  const futureA={...fixture,id:'PENDING-A',status:'待审批',startAt:'2099-03-31T23:00',endAt:'2099-04-01T02:00'};
  const futureB={...futureA,id:'PENDING-B'};
  await page.evaluate(({key,items})=>{const list=JSON.parse(localStorage.getItem(key));list.unshift(...items);localStorage.setItem(key,JSON.stringify(list));},{key:key.records,items:[fixture,futureA,futureB]});
  await goto(api.PAGES.admin);await page.locator('[data-approve="PENDING-A"]').click();assert.match(await page.locator('#pageMessage').innerText(),/排期冲突/);
  assert.equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).find(r=>r.id==='PENDING-A').status,key.records),'待审批');
  await page.locator('[data-reject="PENDING-B"]').click();await page.locator('textarea[name=reason]').fill('与另一申请时间重叠');await page.getByRole('button',{name:'确认拒绝',exact:true}).click();await page.locator('[data-approve="PENDING-A"]').click();assert.match(await page.locator('#pageMessage').innerText(),/申请已通过/);
  await goto(api.PAGES.admin+'?view=requests');const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'下载汇总表',exact:true}).click();const download=await downloadPromise;assert.match(download.suggestedFilename(),/借用登记汇总/);await download.saveAs(path.join(output,'export.csv'));assert.match(fs.readFileSync(path.join(output,'export.csv'),'utf8'),/拒绝原因/);
  pass('审批二次检查冲突、冲突解除后审批与 CSV 汇总导出');
  await goto(api.PAGES.returns+'?record=ACTIVE-FIXTURE');await page.getByLabel('有异常',{exact:true}).check();await page.locator('#returnNote').fill('保护套缺件，等待核对');
  const other=await context.newPage();await other.goto(base+api.PAGES.home);await other.evaluate(k=>{const list=JSON.parse(localStorage.getItem(k));list.find(r=>r.id==='REJECT-TEST').rejectReason='已补充地点';localStorage.setItem(k,JSON.stringify(list));},key.records);
  assert.equal(await page.locator('#returnNote').inputValue(),'保护套缺件，等待核对');
  await page.getByRole('button',{name:'提交归还',exact:true}).click();assert(await page.locator('#returnSubmit').isDisabled());
  const abnormal=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).find(r=>r.id==='ACTIVE-FIXTURE'),key.records);assert.equal(abnormal.returnNormal,'否');assert.match(abnormal.returnNote,/保护套缺件/);await other.close();
  pass('异常归还说明、跨标签页更新保留未提交内容');
  const backup=await page.evaluate(k=>localStorage.getItem(k),key.records);await page.evaluate(k=>localStorage.setItem(k,'{broken'),key.records);await page.goto(base+api.PAGES.status);assert.match(await page.locator('#app').innerText(),/记录格式异常/);assert.equal(await page.evaluate(k=>localStorage.getItem(k),key.records),'{broken');await page.evaluate(({key,value})=>localStorage.setItem(key,value),{key:key.records,value:backup});
  pass('异常存储明确报错且不覆盖原数据');
  await page.setViewportSize({width:1440,height:1000});await goto(api.PAGES.home);
  assert.deepEqual(await page.locator('.site-nav > a').allTextContents(),['我的借用','管理后台']);
  assert.equal(await page.locator('nav[aria-label="其他业务入口"]').count(),0);
  for(const [target,name] of [['home','仪器首页'],['borrow','借用仪器'],['returns','归还仪器'],['data','上传数据']]){
    await page.locator('#functionMenu').click();assert(await page.locator('#functionDrawer').isVisible());
    assert.deepEqual(await page.locator('.drawer-links a').allTextContents(),['仪器首页','借用仪器','归还仪器','上传数据']);
    await page.locator('#functionDrawer').getByRole('link',{name,exact:true}).click();assert.equal(new URL(page.url()).pathname,'/'+api.PAGES[target]);
  }
  await goto(api.PAGES.home);await page.locator('#functionMenu').click();
  for(let i=0;i<7;i++){await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement.closest('#functionDrawer')!==null));}
  await page.keyboard.press('Escape');assert(await page.locator('#functionDrawer').isHidden());assert.equal(await page.locator('#functionMenu').getAttribute('aria-expanded'),'false');assert.equal(await page.evaluate(()=>document.activeElement.id),'functionMenu');
  await page.locator('#functionMenu').click();await page.mouse.click(20,500);assert(await page.locator('#functionDrawer').isHidden());
  await page.locator('#functionMenu').click();await page.locator('#closeFunctionDrawer').click();assert(await page.locator('#functionDrawer').isHidden());
  for(const width of [1440,390]){await page.setViewportSize({width,height:1000});await page.locator('#functionMenu').click();assert(await page.locator('#functionDrawer').isVisible());await page.locator('#functionDrawer').evaluate(el=>Promise.all(el.getAnimations().map(animation=>animation.finished)));assert(await page.locator('#functionDrawer').evaluate(el=>el.getBoundingClientRect().right<=innerWidth+1));await page.screenshot({path:path.join(output,`drawer-${width}.png`),fullPage:false});await page.keyboard.press('Escape');}
  pass('四项侧栏导航、保留顶部入口、键盘焦点、Esc／遮罩／关闭按钮与手机适配');
  const managementDevice={id:'TEST-DEVICE',name:'管理功能验证仪器',category:'气象与风雨监测类',location:'测试柜位',status:'可预订',openToStudent:true,booked:[]};
  const returnDevice={...managementDevice,id:'RETURN-DEVICE',name:'归还纠正验证仪器'};
  const managementAt=h=>api.localInput(new Date(Date.now()+h*3600000));
  const baseRecord={borrower:'日期管理测试学生',contact:'test-contact',place:'实验室603',purpose:'日期管理验证',devices:[managementDevice],customField:'keep',createdAt:'测试记录'};
  const managed=[
    {...baseRecord,id:'SCHEDULE-A',status:'已通过',startAt:managementAt(48),endAt:managementAt(52)},
    {...baseRecord,id:'SCHEDULE-B',status:'已通过',startAt:managementAt(56),endAt:managementAt(60)},
    {...baseRecord,id:'ACTIVE-M',status:'已通过',startAt:managementAt(-2),endAt:managementAt(2)},
    {...baseRecord,id:'REJECTED-M',status:'已拒绝',rejectReason:'原拒绝原因',startAt:managementAt(72),endAt:managementAt(76)},
    {...baseRecord,id:'CANCEL-M',status:'待审批',startAt:managementAt(80),endAt:managementAt(84)},
    {...baseRecord,id:'STALE-M',status:'待审批',startAt:managementAt(88),endAt:managementAt(92)},
    {...baseRecord,id:'REVOKE-M',status:'已通过',startAt:managementAt(96),endAt:managementAt(100)},
    {...baseRecord,id:'RETURN-M',status:'已归还',startAt:managementAt(-48),endAt:managementAt(-24),devices:[returnDevice],returnSubmittedAt:'原归还提交时间',returnedAt:'原验收时间',returnLocation:'原柜位',returnNote:'原备注'}
  ];
  await page.evaluate(({key,devices,items})=>{localStorage.setItem(key.devices,JSON.stringify([...JSON.parse(localStorage.getItem(key.devices)),...devices]));localStorage.setItem(key.records,JSON.stringify([...JSON.parse(localStorage.getItem(key.records)),...items]));},{key,devices:[managementDevice,returnDevice],items:managed});
  const requestsUrl=api.PAGES.admin+'?view=requests&device=TEST-DEVICE';
  await goto(requestsUrl);
  await page.getByRole('button',{name:'今天',exact:true}).click();assert.equal(await page.locator('#requestList [data-row-id]').count(),1);assert.equal(await page.locator('#requestList [data-row-id]').getAttribute('data-row-id'),'ACTIVE-M');
  await page.getByRole('button',{name:'未来一周',exact:true}).click();assert.equal(await page.locator('#requestList [data-row-id]').count(),7);
  await page.getByRole('button',{name:'全部日期',exact:true}).click();await page.locator('#requestFrom').fill('2099-02-02');await page.locator('#requestTo').fill('2099-02-01');await page.locator('#requestTo').blur();assert.match(await page.locator('#requestFilterMessage').innerText(),/不能早于/);
  await page.getByRole('button',{name:'全部日期',exact:true}).click();
  const openManagement=async(recordId,action)=>{const row=page.locator(`[data-row-id="${recordId}"]`);await row.locator('.record-more > summary').click();await row.locator(`[data-record-action="${action}"]`).click();assert(await row.locator('[data-record-form]').evaluate(form=>form.contains(document.activeElement)));};
  const currentRecord=recordId=>page.evaluate(({key,id})=>JSON.parse(localStorage.getItem(key)).find(r=>r.id===id),{key:key.records,id:recordId});
  await openManagement('SCHEDULE-A','period');await page.locator('#editEndAt').fill(managementAt(58));await page.locator('#recordChangeReason').fill('外场实验延期');await page.getByRole('button',{name:'保存日期',exact:true}).click();assert.match(await page.locator('#recordEditMessage').innerText(),/排期|已有申请/);assert.equal((await currentRecord('SCHEDULE-A')).endAt,managed[0].endAt);
  await page.locator('#editEndAt').fill(managementAt(54));await page.getByRole('button',{name:'保存日期',exact:true}).click();let changed=await currentRecord('SCHEDULE-A');assert.equal(changed.endAt,managementAt(54));assert.equal(changed.changeHistory.at(-1).reason,'外场实验延期');assert.equal(changed.customField,'keep');
  await openManagement('SCHEDULE-A','undoLast');await page.locator('#recordChangeReason').fill('撤销测试改期');await page.getByRole('button',{name:'确认撤销变更',exact:true}).click();changed=await currentRecord('SCHEDULE-A');assert.equal(changed.endAt,managed[0].endAt);assert.equal(changed.changeHistory.length,2);assert.equal(changed.changeHistory.at(-1).action,'撤销上次变更');
  await openManagement('ACTIVE-M','period');assert(await page.locator('#editStartAt').evaluate(el=>el.readOnly));await page.locator('#editEndAt').fill(managementAt(3));await page.locator('#recordChangeReason').fill('使用中延期一小时');await page.getByRole('button',{name:'保存日期',exact:true}).click();assert.equal((await currentRecord('ACTIVE-M')).startAt,managed[2].startAt);
  pass('后台日期快捷筛选、无效范围、改期冲突拦截、改期撤销与使用中开始时间保护');
  await openManagement('REVOKE-M','revoke');await page.locator('#recordChangeReason').fill('误通过申请');await page.getByRole('button',{name:'确认撤回',exact:true}).click();assert.equal((await currentRecord('REVOKE-M')).status,'待审批');
  await openManagement('REJECTED-M','reopen');await page.locator('#recordChangeReason').fill('误拒绝，重新审核');await page.getByRole('button',{name:'恢复待审批',exact:true}).click();assert.equal((await currentRecord('REJECTED-M')).status,'待审批');assert(!Object.hasOwn(await currentRecord('REJECTED-M'),'rejectReason'));
  await openManagement('CANCEL-M','cancel');await page.locator('#recordChangeReason').fill('实验取消');await page.getByRole('button',{name:'确认取消预约',exact:true}).click();assert.equal((await currentRecord('CANCEL-M')).status,'已取消');
  await openManagement('CANCEL-M','undoLast');await page.locator('#recordChangeReason').fill('误取消，恢复申请');await page.getByRole('button',{name:'确认撤销变更',exact:true}).click();assert.equal((await currentRecord('CANCEL-M')).status,'待审批');
  await page.locator('#requestDevice').selectOption('RETURN-DEVICE');const uploadsBefore=await page.evaluate(k=>localStorage.getItem(k),key.uploads);await openManagement('RETURN-M','undoReturn');await page.locator('#recordChangeReason').fill('误点归还确认');await page.getByRole('button',{name:'恢复待验收',exact:true}).click();let restoredReturn=await currentRecord('RETURN-M');assert.equal(restoredReturn.status,'待归还确认');assert(!Object.hasOwn(restoredReturn,'returnedAt'));assert.equal(restoredReturn.returnNote,'原备注');assert.equal(await page.evaluate(k=>localStorage.getItem(k),key.uploads),uploadsBefore);
  await page.locator('[data-confirm="RETURN-M"]').click();await page.evaluate(({key,item})=>{const all=JSON.parse(localStorage.getItem(key));all.push(item);localStorage.setItem(key,JSON.stringify(all));},{key:key.records,item:{...managed[0],id:'RETURN-BLOCKER',devices:[returnDevice]}});
  await goto(api.PAGES.admin+'?view=requests&device=RETURN-DEVICE');await openManagement('RETURN-M','undoReturn');await page.locator('#recordChangeReason').fill('尝试恢复设备占用');await page.getByRole('button',{name:'恢复待验收',exact:true}).click();assert.match(await page.locator('#recordEditMessage').innerText(),/排期|已有申请/);assert.equal((await currentRecord('RETURN-M')).status,'已归还');await page.getByRole('button',{name:'取消修改',exact:true}).click();
  pass('撤回误审批、重新打开拒绝、取消与恢复预约、误验收恢复及后续预约冲突保护');
  await goto(requestsUrl);await openManagement('STALE-M','period');await page.locator('#editEndAt').fill(managementAt(94));await page.locator('#recordChangeReason').fill('准备延期');
  const updater=await context.newPage();await updater.goto(base+api.PAGES.home);await updater.evaluate(k=>{const all=JSON.parse(localStorage.getItem(k));all.find(r=>r.id==='STALE-M').place='另一标签页修改的位置';localStorage.setItem(k,JSON.stringify(all));},key.records);
  await page.waitForFunction(()=>document.querySelector('#recordEditMessage').textContent.includes('其他页面'));assert.equal(await page.locator('#recordChangeReason').inputValue(),'准备延期');await page.getByRole('button',{name:'保存日期',exact:true}).click();assert.match(await page.locator('#recordEditMessage').innerText(),/其他页面/);assert.equal((await currentRecord('STALE-M')).endAt,managed[5].endAt);await page.getByRole('button',{name:'取消修改',exact:true}).click();await updater.close();
  await page.locator('#requestSearch').fill('SCHEDULE-A');const filteredDownloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'下载汇总表',exact:true}).click();const filteredDownload=await filteredDownloadPromise;await filteredDownload.saveAs(path.join(output,'filtered-export.csv'));const csv=fs.readFileSync(path.join(output,'filtered-export.csv'),'utf8');assert.equal(csv.charCodeAt(0),0xfeff);assert.equal(csv.split('\r\n').length,2);assert.match(csv,/SCHEDULE-A/);assert(!csv.includes('SCHEDULE-B'));assert.match(csv,/最近变更原因/);
  await goto(api.PAGES.status);const studentRow=page.locator('#activeList .list-row').filter({hasText:'SCHEDULE-A'});await studentRow.locator('.change-history > summary').click();assert.match(await studentRow.locator('.change-history').innerText(),/外场实验延期/);assert.match(await studentRow.locator('.change-history').innerText(),/撤销测试改期/);
  pass('跨标签页旧编辑保护、筛选结果 CSV 与学生端变更历史同步');
  for(const width of [1440,390]){await page.setViewportSize({width,height:1000});await goto(requestsUrl);await page.locator('#requestSearch').fill('SCHEDULE-A');await page.locator('.change-history > summary').click();await page.screenshot({path:path.join(output,`record-history-${width}.png`),fullPage:true});await openManagement('SCHEDULE-A','period');await page.screenshot({path:path.join(output,`record-editor-${width}.png`),fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.getByRole('button',{name:'取消修改',exact:true}).click();}
  const screenshotRoutes=[['home',api.PAGES.home],['borrow',api.PAGES.borrow+'?device=2509154E'],['returns',api.PAGES.returns+'?record=ACTIVE-FIXTURE'],['data',api.PAGES.data+'?record='+id],['status',api.PAGES.status],['admin',api.PAGES.admin]];
  const overflows=[];
  for(const [name,route] of screenshotRoutes){for(const width of [1440,390]){await page.setViewportSize({width,height:1000});await goto(route);const sizes=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));if(sizes.scroll>sizes.width+1)overflows.push({name,...sizes});const unnamed=await page.locator('input:not([type=hidden]),select,textarea').evaluateAll(els=>els.filter(el=>!el.getAttribute('aria-label')&&!el.labels?.length).map(el=>el.id));assert.deepEqual(unnamed,[],name+' controls missing labels');if(name==='borrow'&&width===390)assert(await page.locator('#borrowForm').evaluate(el=>el.getBoundingClientRect().top)<350);await page.screenshot({path:path.join(output,`${name}-${width}.png`),fullPage:true});}}
  assert.deepEqual(overflows,[]);assert.deepEqual(errors,[]);pass('六个页面桌面与手机截图、无横向溢出、表单标签和控制台检查');
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({checks,screenshots:screenshotRoutes.length*2+6,consoleErrors:errors,overflows},null,2));
  console.log('Verified',checks.length,'groups; screenshots:',output);
 } catch(error) {fs.writeFileSync(path.join(output,'failure.json'),JSON.stringify({url:page.url(),body:await page.locator('body').innerText(),storage:await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage)))},null,2));await page.screenshot({path:path.join(output,'failure.png'),fullPage:true});throw error;} finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
