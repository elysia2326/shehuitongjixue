// AI浮动聊天浮窗组件 - 插入到所有页面
(function() {
  // 创建HTML结构
  var container = document.createElement('div');
  container.innerHTML = `
    <div id="ai-chat-widget" style="display:none;position:fixed;bottom:80px;right:20px;width:340px;max-height:480px;background:white;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.25);z-index:9999;display:none;flex-direction:column;font-size:14px;overflow:hidden;">
      <div style="background:#8b4513;color:white;padding:10px 14px;font-weight:600;display:flex;justify-content:space-between;align-items:center;">
        <span>🤖 AI助教</span>
        <span id="ai-close" style="cursor:pointer;font-size:18px;">&times;</span>
      </div>
      <div id="ai-chat-msgs" style="flex:1;overflow-y:auto;padding:10px;background:#f9f7f3;">
        <div style="margin:6px 0;padding:8px 12px;background:white;border:1px solid #ddd;border-radius:8px;align-self:flex-start;">你好！问任何社会统计学的问题，我会直接在这里回答，不用跳转页面。</div>
      </div>
      <div id="ai-api-section" style="padding:6px 10px;background:#f0e6d9;font-size:12px;">
        <input id="ai-api-input" type="password" placeholder="DeepSeek API Key (sk-...)" style="width:100%;padding:4px 8px;border:1px solid #ccc;border-radius:4px;font-size:12px;">
        <button id="ai-save-key" style="margin-top:4px;padding:3px 10px;background:#8b4513;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;">保存Key</button>
        <span id="ai-key-status" style="margin-left:6px;font-size:11px;"></span>
      </div>
      <div style="display:flex;padding:6px 10px;gap:4px;flex-wrap:wrap;">
        <button class="ai-q-btn" data-q="条件概率和全概率有什么区别？" style="font-size:11px;padding:3px 6px;border:1px solid #ddd;border-radius:4px;cursor:pointer;background:white;">条件概率vs全概率</button>
        <button class="ai-q-btn" data-q="独立和不相关有什么区别？" style="font-size:11px;padding:3px 6px;border:1px solid #ddd;border-radius:4px;cursor:pointer;background:white;">独立vs不相关</button>
        <button class="ai-q-btn" data-q="中心极限定理是什么？" style="font-size:11px;padding:3px 6px;border:1px solid #ddd;border-radius:4px;cursor:pointer;background:white;">中心极限定理</button>
      </div>
      <div style="display:flex;border-top:1px solid #eee;padding:8px 10px;">
        <input id="ai-input" type="text" placeholder="输入问题..." style="flex:1;padding:6px 10px;border:1px solid #ccc;border-radius:4px;font-size:13px;">
        <button id="ai-send" style="margin-left:6px;padding:6px 14px;background:#8b4513;color:white;border:none;border-radius:4px;cursor:pointer;font-size:13px;">发送</button>
      </div>
    </div>
    <button id="ai-toggle" style="position:fixed;bottom:20px;right:20px;width:52px;height:52px;border-radius:50%;background:#8b4513;color:white;border:none;font-size:24px;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,0.25);z-index:9998;display:flex;align-items:center;justify-content:center;">🤖</button>
  `;
  document.body.appendChild(container);

  var widget = document.getElementById('ai-chat-widget');
  var toggle = document.getElementById('ai-toggle');
  var close = document.getElementById('ai-close');
  var input = document.getElementById('ai-input');
  var sendBtn = document.getElementById('ai-send');
  var msgs = document.getElementById('ai-chat-msgs');
  var apiInput = document.getElementById('ai-api-input');
  var saveKey = document.getElementById('ai-save-key');
  var keyStatus = document.getElementById('ai-key-status');

  var apiKey = localStorage.getItem('ds_api_key') || '';
  if (apiKey) {
    apiInput.value = '****已保存****';
    keyStatus.textContent = '✅';
  }

  // Toggle widget
  toggle.onclick = function() {
    widget.style.display = widget.style.display === 'none' ? 'flex' : 'none';
    if (widget.style.display === 'flex') input.focus();
  };
  close.onclick = function() { widget.style.display = 'none'; };

  // Save key
  saveKey.onclick = function() {
    var k = apiInput.value.trim();
    if (k.startsWith('sk-')) {
      apiKey = k;
      localStorage.setItem('ds_api_key', k);
      apiInput.value = '****已保存****';
      keyStatus.textContent = '✅';
    } else {
      keyStatus.textContent = '❌ 需以sk-开头';
    }
  };

  // Quick questions
  document.querySelectorAll('.ai-q-btn').forEach(function(btn) {
    btn.onclick = function() {
      input.value = this.getAttribute('data-q');
      sendMsg();
    };
  });

  // Send message
function markdownToHtml(text) {
  // Convert bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Convert headings
  text = text.replace(/### (.*)/g, '<div style="font-weight:600;margin:8px 0 4px;font-size:1em;">$1</div>');
  text = text.replace(/## (.*)/g, '<div style="font-weight:700;margin:10px 0 4px;font-size:1.1em;">$1</div>');
  // Convert bullet points
  text = text.replace(/^- (.*)/gm, '&bull; $1<br>');
  text = text.replace(/^\* (.*)/gm, '&bull; $1<br>');
  // Convert code blocks
  text = text.replace(/```([\s\S]*?)```/g, '<code style="background:#eee;padding:4px 8px;border-radius:4px;display:block;margin:4px 0;">$1</code>');
  text = text.replace(/`([^`]+)`/g, '<code style="background:#eee;padding:1px 4px;border-radius:3px;">$1</code>');
  // Convert line breaks
  text = text.replace(/\n\n/g, '<br><br>');
  text = text.replace(/\n/g, '<br>');
  // Convert horizontal rules
  text = text.replace(/---/g, '<hr style="border:0;border-top:1px solid #ddd;margin:8px 0;">');
  return text;
}(text, role) {
    var div = document.createElement('div');
    div.style.cssText = 'margin:6px 0;padding:8px 12px;border-radius:8px;' + (role === 'user' ? 'background:#8b4513;color:white;align-self:flex-end;margin-left:auto;' : 'background:white;border:1px solid #ddd;align-self:flex-start;word-break:break-word;white-space:pre-wrap;');
    div.innerHTML = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  async function sendMsg() {
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    addMsg(text, 'user');
    sendBtn.disabled = true;

    if (!apiKey) {
      addMsg('⚠️ 请在上方输入你的DeepSeek API Key并保存。');
      sendBtn.disabled = false;
      return;
    }

    var typing = addMsg('...', 'assistant');
    typing.className = '';
    typing.style.cssText = 'margin:6px 0;padding:8px 12px;background:white;border:1px solid #ddd;border-radius:8px;align-self:flex-start;';

    try {
      var resp = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {'Content-Type':'application/json','Authorization':'Bearer '+apiKey},
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{role:'system',content:'你是一个社会统计学(概率论与数理统计)助教。规则：1.用中文回答 2.不要使用markdown符号如## **等，用纯中文段落 3.每段之间空一行 4.公式用文字描述或用/表示除法 5.多用p>0这样的简写代替复杂符号'},{role:'user',content:text}],
          max_tokens: 800,
          temperature: 0.7
        })
      });
      if (!resp.ok) {
        typing.textContent = resp.status === 401 ? 'API Key无效，请检查。' : '请求失败:'+resp.status;
        return;
      }
      var data = await resp.json();
      typing.innerHTML = markdownToHtml(data.choices[0].message.content);
    } catch(e) {
      typing.textContent = '网络错误:'+e.message;
    }
    sendBtn.disabled = false;
  }

  sendBtn.onclick = sendMsg;
  input.onkeypress = function(e) { if (e.key === 'Enter') sendMsg(); };
})();
