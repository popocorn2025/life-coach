const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 启用CORS，允许前端页面访问API
app.use(cors());

// 添加全局中间件来设置安全响应头
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline'");
  next();
});

// 解析JSON请求体
app.use(express.json());

// 提供静态文件
app.use(express.static(path.join(__dirname, '/')));

// 主页路由
app.get('/', (req, res) => {
  // 添加安全响应头
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline'");
  
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API路由 - 处理与DeepSeek R1 API的通信
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // 从环境变量获取DeepSeek R1 API密钥和端点
    const API_KEY = process.env.DEEPSEEK_API_KEY;
    const API_ENDPOINT = process.env.DEEPSEEK_API_ENDPOINT; // 火山方舟API端点
    
    const response = await axios.post(API_ENDPOINT, {
      model: 'deepseek-r1-250120', // 火山方舟DeepSeek R1模型名称
      messages: [
        { role: 'system', content: 'You are a helpful life coach AI assistant.' },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    // 添加安全响应头
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    
    res.json(response.data);
  } catch (error) {
    console.error('Error communicating with DeepSeek API:', error.message);
    res.status(500).json({ error: 'Failed to communicate with AI service' });
  }
});

// API路由 - 处理同步到Flomo的请求
app.post('/api/sync-to-flomo', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      // 添加安全响应头
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Content-Security-Policy', "default-src 'self'");
      
      return res.status(400).json({ success: false, message: '没有可同步的消息' });
    }
    
    // 这里应该是Flomo API的实际实现
    // 由于我们没有实际的Flomo API密钥，这里只是模拟成功响应
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 添加安全响应头
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    
    // 返回成功响应
    res.json({ success: true, message: '成功同步到Flomo' });
    
    console.log(`已同步 ${messages.length} 条消息到Flomo`);
  } catch (error) {
    console.error('Error syncing to Flomo:', error.message);
    
    // 添加安全响应头，即使在错误情况下
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    
    res.status(500).json({ success: false, message: '同步到Flomo失败' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Open your browser and navigate to http://localhost:${PORT} to use the Life Coach AI`);
});