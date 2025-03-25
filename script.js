// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const syncButton = document.querySelector('.icon-sync').parentElement;

    // 发送消息函数
    async function sendMessage() {
        const message = userInput.value.trim();
        
        // 如果消息为空，不执行任何操作
        if (!message) return;
        
        // 清空输入框
        userInput.value = '';
        
        // 添加用户消息到聊天区
        addMessage(message, 'user');
        
        try {
            // 显示加载状态
            const loadingMessage = addMessage('正在思考...', 'ai');
            
            // 发送请求到后端
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            
            if (!response.ok) {
                throw new Error('网络请求失败');
            }
            
            const data = await response.json();
            
            // 移除加载消息
            chatMessages.removeChild(loadingMessage);
            
            // 添加AI回复到聊天区
            if (data && data.choices && data.choices[0] && data.choices[0].message) {
                const aiResponse = data.choices[0].message.content;
                addMessage(aiResponse, 'ai');
            } else {
                throw new Error('无效的API响应格式');
            }
            
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = error.message || '抱歉，发生了一些错误，请稍后再试。';
            addMessage(errorMessage, 'ai');
        }
    }
    
    // 添加消息到聊天区函数
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        // 滚动到最新消息
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return messageDiv;
    }
    
    // 绑定发送按钮点击事件
    sendButton.addEventListener('click', sendMessage);
    
    // 绑定输入框回车事件
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // 阻止默认的换行行为
            sendMessage();
        }
    });
    
    // 自动聚焦到输入框
    userInput.focus();
    
    // 同步到Flomo功能
    syncButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // 获取所有聊天记录
        const messages = Array.from(chatMessages.querySelectorAll('.message'));
        if (messages.length === 0) {
            alert('没有可同步的聊天记录');
            return;
        }
        
        try {
            // 显示同步中状态
            const syncStatus = addMessage('正在同步到Flomo...', 'ai');
            
            // 准备同步数据
            const syncData = messages.map(msg => {
                const content = msg.querySelector('.message-content').textContent;
                const isUser = msg.classList.contains('user-message');
                return {
                    role: isUser ? 'user' : 'ai',
                    content: content
                };
            });
            
            // 发送同步请求到后端
            const response = await fetch('/api/sync-to-flomo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages: syncData })
            });
            
            if (!response.ok) {
                throw new Error('同步失败');
            }
            
            const result = await response.json();
            
            // 移除同步状态消息
            chatMessages.removeChild(syncStatus);
            
xx            // 显示同步结果
            if (result && typeof result.success === 'boolean') {
                const message = result.success ? '同步到Flomo成功！' : `同步到Flomo失败：${result.message || '未知错误'}`;
                addMessage(message, 'ai');
            } else {
                throw new Error('无效的同步响应格式');
            }
            
        } catch (error) {
            console.error('Sync Error:', error);
            const syncErrorMessage = error.message || '同步到Flomo时发生错误，请稍后再试。';
            addMessage(syncErrorMessage, 'ai');
        }
    });
});