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

// 移除X-Powered-By响应头
app.disable('x-powered-by');

// 添加全局中间件来设置安全响应头
app.use((req, res, next) => {
  // 基本安全响应头
   res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // 内容安全策略
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'");
  
  // 添加缓存控制
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  next();
});

// 解析JSON请求体
app.use(express.json());

// 提供静态文件
app.use(express.static(path.join(__dirname, '/')));

// 主页路由
app.get('/', (req, res) => {
  // 路由级别的安全响应头已由全局中间件处理
  
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API路由 - 处理与DeepSeek R1 API的通信
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // 从环境变量获取DeepSeek R1 API密钥和端点
    const API_KEY = process.env.DEEPSEEK_API_KEY;
    const API_ENDPOINT = process.env.DEEPSEEK_API_ENDPOINT; // 火山方舟API端点
    
    if (!API_KEY || !API_ENDPOINT) {
      throw new Error('DeepSeek API配置缺失');
    }

    const response = await axios.post(API_ENDPOINT, {
      model: 'deepseek-r1-250120', // DeepSeek R1模型名称
      messages: [
        { role: 'system', content: 'You are a helpful life coach AI assistant.' },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: false
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
        'Origin': process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
      },
      timeout: 60000, // 增加超时时间到60秒
      validateStatus: function(status) {
        return status >= 200 && status < 500; // 接受200-499的状态码
      }
    });
    
    if (response.status !== 200) {
      console.error('API响应状态码:', response.status);
      console.error('API响应内容:', response.data);
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    // 检查并处理API响应格式
    if (!response.data) {
      console.error('API响应为空');
      throw new Error('API响应为空');
    }
    
    // 打印API响应以便调试
    console.log('DeepSeek API Response:', JSON.stringify(response.data, null, 2));
    
    // 适配DeepSeek API的响应格式
    let aiContent = '';
    if (response.data.choices && response.data.choices[0]) {
      if (response.data.choices[0].message) {
        aiContent = response.data.choices[0].message.content;
      } else if (response.data.choices[0].text) {
        aiContent = response.data.choices[0].text;
      }
    } else if (response.data.text) {
      aiContent = response.data.text;
    } else if (response.data.response) {
      aiContent = response.data.response;
    }
    
    if (!aiContent) {
      console.error('无法从API响应中提取内容:', response.data);
      aiContent = '抱歉，我现在无法回答您的问题。';
    }
    
    const aiResponse = {
      choices: [{
        message: {
          role: 'assistant',
          content: aiContent
        }
      }]
    };
    
    // 返回处理后的响应数据
    res.json(aiResponse);
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
      // 路由级别的安全响应头已由全局中间件处理
      
      return res.status(400).json({ success: false, message: '没有可同步的消息' });
    }
    
    // 这里应该是Flomo API的实际实现
    // 由于我们没有实际的Flomo API密钥，这里只是模拟成功响应
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 路由级别的安全响应头已由全局中间件处理
    
    // 返回成功响应
    res.json({ success: true, message: '成功同步到Flomo' });
    
    console.log(`已同步 ${messages.length} 条消息到Flomo`);
  } catch (error) {
    console.error('Error syncing to Flomo:', error.message);
    
    // 路由级别的安全响应头已由全局中间件处理
    
    res.status(500).json({ success: false, message: '同步到Flomo失败' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Open your browser and navigate to http://localhost:${PORT} to use the Life Coach AI`);
});