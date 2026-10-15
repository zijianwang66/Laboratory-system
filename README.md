# Laboratory System · 实验室仪器借用

实验室仪器目录、借用申请、审批、归还登记与原始数据登记的前端原型。采用 HTML、CSS 和原生 JavaScript，无需构建即可预览。

## 功能

- 按分类、名称、型号和存放位置查找仪器，直接带入借用申请。
- 一次申请多台仪器，查看动态月历，检查借用时段冲突。
- 可选择记住本机常用资料，查看预约状态、拒绝原因与历史记录。
- 从借用记录进入归还或数据登记，自动关联对应仪器。
- 管理后台按待办、设备、借用记录与数据资料分区，支持审批、归还验收、筛选和 CSV 导出。
- 右侧弹出栏集中提供仪器首页、借用、归还、上传入口；顶部保留我的借用与管理后台。
- 适配桌面与手机，侧栏支持键盘、Esc、点击遮罩和关闭后焦点返回。

## 本地运行

在项目根目录启动静态服务器：

```bash
python -m http.server 8765 --bind 127.0.0.1
```

Windows 也可以使用 `py -m http.server 8765 --bind 127.0.0.1`。

- 学生首页：[http://127.0.0.1:8765/student_device_home.html](http://127.0.0.1:8765/student_device_home.html)
- 管理后台：[http://127.0.0.1:8765/admin_device_dashboard.html](http://127.0.0.1:8765/admin_device_dashboard.html)

建议通过固定的 HTTP 地址访问，让各页面共享相同站点来源下的浏览器存储。

## 文件结构

```text
assets/
  ui.css                       公共样式与响应式布局
  device-common.js             设备、排期、状态与各页面逻辑
tests/
  ui-regression.cjs            独立浏览器回归验证
student_device_home.html       仪器首页
student_borrow_stage2.html     借用申请
student_return_stage4.html     归还登记
student_data_stage5.html       数据登记
student_status_stage6.html     我的借用
admin_device_dashboard.html    管理后台
device_borrow_form.html        旧版独立演示页
```

更多说明：[UI 改版实施记录](UI改版实施记录.md)、[UI 技能调研与产品简化评审](UI技能调研与产品简化评审.md)。

## 验证

页面运行不需要安装 npm 依赖。运行开发验证时，需要 Node.js 与 Playwright：

```bash
npm install
npx playwright install chromium
npm run check
npm test
```

脚本启动临时本地服务器，在隔离浏览器中验证申请、审批、归还、数据登记、设备维护、排期冲突、存储兼容与侧栏操作，并生成桌面和手机截图。测试结果输出到 `test-results/ui/`，不会提交到仓库。

## 当前边界

这是前端原型。数据通过 `localStorage` 保存在当前浏览器、当前站点来源下，尚未接入账号权限、服务器数据库或跨设备同步。“已预约／使用中”按预约时间显示，不代表实际领用确认；归还按整单处理。

照片和数据文件仅登记文件名等信息，尚不保存文件内容。原始 Excel、Word 资料、临时截图、本地备份与第三方风格参考目录不在仓库中。
