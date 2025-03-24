const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 启用CORS，允许前端页面访问API
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 提供静态文件
app.use(express.static(path.join(__dirname, '/')));

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API路由 - 处理与DeepSeek R1 API的通信
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // DeepSeek R1 API密钥和端点
    const API_KEY = '842fc4f0-54bd-4e46-b000-88860911c7ea';
    const API_ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'; // 火山方舟API端点
    
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
    
    res.json(response.data);
  } catch (error) {
    console.error('Error communicating with DeepSeek API:', error.message);
    res.status(500).json({ error: 'Failed to communicate with AI service' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Open your browser and navigate to http://localhost:${PORT} to use the Life Coach AI`);
});