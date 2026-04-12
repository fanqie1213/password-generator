# 密码生成器实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个可直接部署到 GitHub Pages 的中文静态密码生成网页，并完成分支清理、测试、文档更新与 GitHub 提交。

**Architecture:** 页面采用纯静态结构，使用 `index.html`、`styles.css` 和浏览器端脚本实现界面与交互。核心密码生成逻辑抽离到独立模块，通过 Node 内置测试运行器做纯逻辑测试，页面脚本只负责读取表单状态、调用逻辑模块并更新中文界面反馈。

**Tech Stack:** HTML、CSS、原生 JavaScript、Node.js 内置 `node:test`、GitHub Pages

---

## 文件结构

- 创建：`index.html`
- 创建：`styles.css`
- 创建：`password-generator.mjs`
- 创建：`script.js`
- 创建：`tests/password-generator.test.mjs`
- 修改：`README.md`
- 删除：`new.txt`

### Task 1: 搭建可测试的密码逻辑模块

**Files:**
- Create: `D:/学习/项目/My_project/password-generator.mjs`
- Create: `D:/学习/项目/My_project/tests/password-generator.test.mjs`

- [ ] **Step 1: 写出第一个失败测试，验证长度正确**
- [ ] **Step 2: 运行测试，确认它因模块缺失而失败**
- [ ] **Step 3: 编写最小实现，让长度测试通过**
- [ ] **Step 4: 再次运行测试，确认通过**
- [ ] **Step 5: 提交当前最小可用逻辑**

### Task 2: 用 TDD 补齐字符规则、易混淆排除与错误处理

**Files:**
- Modify: `D:/学习/项目/My_project/password-generator.mjs`
- Modify: `D:/学习/项目/My_project/tests/password-generator.test.mjs`

- [ ] **Step 1: 增加失败测试，验证结果只包含允许字符**
- [ ] **Step 2: 运行测试，确认失败原因符合预期**
- [ ] **Step 3: 写最小实现，按选项构建字符池**
- [ ] **Step 4: 再加失败测试，验证启用的类型至少各出现一次**
- [ ] **Step 5: 运行测试，确认失败是因为当前实现没有保障每类都出现**
- [ ] **Step 6: 写最小实现，先从每个字符池取一个字符，再补足剩余长度并打乱**
- [ ] **Step 7: 增加失败测试，验证排除易混淆字符与无选项报错**
- [ ] **Step 8: 运行测试，确认新增测试失败**
- [ ] **Step 9: 写最小实现，加入易混淆字符过滤、长度边界和中文错误消息**
- [ ] **Step 10: 运行完整逻辑测试，确认全部通过**
- [ ] **Step 11: 提交逻辑模块与测试完善结果**

### Task 3: 实现中文页面与交互

**Files:**
- Create: `D:/学习/项目/My_project/index.html`
- Create: `D:/学习/项目/My_project/styles.css`
- Create: `D:/学习/项目/My_project/script.js`
- Modify: `D:/学习/项目/My_project/password-generator.mjs`

- [ ] **Step 1: 先写页面结构，包含中文文案和必要控件**
- [ ] **Step 2: 手动对照页面需求检查缺口并补齐控件**
- [ ] **Step 3: 编写最小页面脚本，读取表单选项并调用逻辑模块生成密码**
- [ ] **Step 4: 补充最小样式，让页面在桌面和移动端都可用**
- [ ] **Step 5: 增强脚本，加入首次加载自动生成、中文状态提示、强度标签和复制反馈**
- [ ] **Step 6: 在浏览器中手工检查核心交互**
- [ ] **Step 7: 提交页面与交互实现**

### Task 4: 更新文档并清理旧文件

**Files:**
- Modify: `D:/学习/项目/My_project/README.md`
- Delete: `D:/学习/项目/My_project/new.txt`

- [ ] **Step 1: 重写 README，说明项目用途、使用方法、Pages 适配和本地测试命令**
- [ ] **Step 2: 删除无关旧文件 `new.txt`**
- [ ] **Step 3: 检查文档与文件结构是否和当前实现一致**
- [ ] **Step 4: 提交文档与清理结果**

### Task 5: 完整验证、删除分支并推送到 GitHub

**Files:**
- Modify: Git refs only

- [ ] **Step 1: 运行完整验证，确认逻辑测试通过**
- [ ] **Step 2: 重新检查需求覆盖**
- [ ] **Step 3: 删除本地分支 `main` 和 `status`**
- [ ] **Step 4: 删除远端 `main` 分支**
- [ ] **Step 5: 推送 `master` 分支最新提交到 GitHub**
- [ ] **Step 6: 汇报验证结果与剩余事项**
