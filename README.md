# Life Coach AI 网站

## 项目概述
本项目是一个基于DeepSeek R1 API的网站应用，旨在创建一个个人Life Coach AI助手。通过与AI的对话，用户可以获取建议和指导，帮助个人成长和发展。

## 技术架构
- 前端：HTML5, CSS3, JavaScript
- 后端：Node.js (Express框架)
- API：火山方舟DeepSeek R1 API

## 页面结构

### 主页 (index.html)
- **布局结构**：采用响应式设计，分为顶部标题区、中间对话区和底部输入区
- **顶部标题区**：包含网站标题和简短描述
- **中间对话区**：显示用户与AI之间的对话历史，采用气泡式布局
- **底部输入区**：包含文本输入框和发送按钮

### 样式说明 (styles.css)
- 使用柔和的色彩方案，创造平静友好的氛围
- 采用Flexbox布局实现页面结构
- 响应式设计确保在移动设备和桌面设备上都有良好的显示效果
- 对话气泡采用不同的颜色区分用户和AI

## 功能说明
1. **实时对话**：用户可以输入问题或想法，AI会给出回应
2. **对话历史**：保存当前会话的对话历史
3. **流式输出**：AI回答采用流式输出，实时显示
4. **个性化建议**：基于用户输入提供个性化的建议和指导

## 实现方式
- 前端通过JavaScript发送用户输入到后端
- 后端Node.js服务器转发请求到DeepSeek R1 API
- 接收API返回的结果并传回前端显示
- 使用流式输出技术实时显示AI回答

## 文件结构
- `index.html`: 主页面HTML结构
- `styles.css`: 样式表文件
- `script.js`: 前端JavaScript逻辑
- `server.js`: Node.js后端服务器