const assert = require('node:assert/strict');
const api = require('../assets/device-common.js');
const now=Date.now(),at=hours=>api.localInput(new Date(now+hours*3600000));
const device=api.normalizeDevice({id:'TEST-DEVICE',name:'测试仪器',category:'气象与风雨监测类',booked:[]});
const reservation={id:'RESERVATION',status:'已通过',startAt:at(48),endAt:at(52),devices:[device],customField:'keep',returnPhotoName:'existing.jpg'};
const reason='实验安排调整';
const edit=(r,action,values={},others=[])=>api.applyCorrection(r,action,{reason,...values},[r,...others],[device]);

const adjusted=edit(reservation,'period',{startAt:at(49),endAt:at(54)});
assert.equal(adjusted.startAt,at(49));
assert.equal(adjusted.originalPeriod.startAt,reservation.startAt);
assert.equal(reservation.startAt,at(48));
assert.equal(adjusted.customField,'keep');
assert.throws(()=>edit(reservation,'period',{startAt:at(49),endAt:at(55)},[{...reservation,id:'BLOCKER',startAt:at(54),endAt:at(56)}]),/排期|已有申请/);
assert.throws(()=>api.applyCorrection(reservation,'period',{reason,startAt:at(49),endAt:at(54)},[reservation],[{...device,status:'维护中'}]),/暂停学生借用/);
assert.throws(()=>edit(reservation,'period',{startAt:at(52),endAt:at(51)}),/晚于/);
assert.throws(()=>edit(reservation,'period',{startAt:at(48),endAt:at(54),reason:' '}),/原因/);
const active={...reservation,id:'ACTIVE',startAt:at(-2),endAt:at(2)};
assert.throws(()=>edit(active,'period',{startAt:at(-1),endAt:at(4)}),/开始时间保留/);
assert.equal(edit(active,'period',{startAt:active.startAt,endAt:at(1)}).endAt,at(1));
assert.throws(()=>edit(active,'period',{startAt:active.startAt,endAt:at(4)},[{...reservation,id:'NEXT',startAt:at(3),endAt:at(5)}]),/排期|已有申请/);
assert.throws(()=>edit(active,'cancel'),/当前状态/);
assert.throws(()=>edit(active,'revoke'),/当前状态/);

assert.equal(edit(reservation,'revoke').status,'待审批');
const cancelled=edit(reservation,'cancel');assert.equal(cancelled.status,'已取消');assert.equal(cancelled.cancelReason,reason);
assert.equal(api.conflicts(device,reservation.startAt,reservation.endAt,'',[cancelled]).length,0);
const rejected={...reservation,status:'已拒绝',rejectReason:'原拒绝原因',reviewedAt:'原审批时间'};
const reopened=edit(rejected,'reopen',{startAt:at(60),endAt:at(64)});assert.equal(reopened.status,'待审批');assert(!Object.hasOwn(reopened,'rejectReason'));

const returned={...reservation,status:'已归还',startAt:at(-48),endAt:at(-24),returnedAt:'验收时间',returnSubmittedAt:'提交时间',returnLocation:'原存放位置'};
const restored=edit(returned,'undoReturn');assert.equal(restored.status,'待归还确认');assert(!Object.hasOwn(restored,'returnedAt'));assert.equal(restored.returnSubmittedAt,'提交时间');assert.equal(restored.returnPhotoName,'existing.jpg');
assert.throws(()=>edit(returned,'undoReturn',{},[{...reservation,id:'LATER',startAt:at(72),endAt:at(76)}]),/未保存|已有申请/);

const logged=structuredClone(reservation);api.appendHistory(logged,null,{action:'提交申请',actor:'学生（本机原型）',reason:'原申请'});
const before=structuredClone(logged);logged.endAt=at(54);api.appendHistory(logged,before,{action:'调整使用期',reason});
assert.equal(logged.changeHistory.length,2);assert.equal(logged.revision,2);assert.equal(logged.changeHistory[1].changes.find(c=>c.field==='endAt').before,reservation.endAt);
const undone=edit(logged,'undoLast',{undoOf:logged.changeHistory.at(-1).id});assert.equal(undone.endAt,reservation.endAt);assert.equal(undone.changeHistory.length,2);
assert.throws(()=>edit(logged,'undoLast',{undoOf:'OLDER-ACTION'}),/不能撤销旧操作/);
const stale=structuredClone(logged);stale.revision+=1;assert.throws(()=>edit(stale,'undoLast',{undoOf:logged.changeHistory.at(-1).id}),/当前状态/);
const approvedLate=structuredClone(logged);approvedLate.startAt=at(-1);approvedLate.changeHistory.at(-1).action='通过申请';assert.throws(()=>edit(approvedLate,'undoLast',{undoOf:approvedLate.changeHistory.at(-1).id}),/进入使用期/);
const startedAfterEdit={...logged,startAt:at(-1)};startedAfterEdit.changeHistory=structuredClone(logged.changeHistory);startedAfterEdit.changeHistory.at(-1).changes.push({field:'startAt',before:at(1),after:startedAfterEdit.startAt});assert.throws(()=>edit(startedAfterEdit,'undoLast',{undoOf:startedAfterEdit.changeHistory.at(-1).id}),/改写开始时间/);

const crossing={...reservation,id:'CROSS',startAt:'2099-01-31T23:00',endAt:'2099-02-01T01:00'};
const boundary={...reservation,id:'BOUNDARY',startAt:'2099-01-31T23:00',endAt:'2099-02-01T00:00'};
assert.deepEqual(api.filterBorrowRecords([crossing,boundary],{from:'2099-02-01',to:'2099-02-01'}).map(r=>r.id),['CROSS']);
assert.equal(api.filterBorrowRecords([crossing],{device:'MISSING'}).length,0);
assert.throws(()=>api.filterBorrowRecords([crossing],{from:'2099-02-02',to:'2099-02-01'}),/不能早于/);
console.log('PASS 使用期调整、状态纠正、冲突保护、逐项撤销、变更历史与日期筛选规则');
