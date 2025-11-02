document.addEventListener('DOMContentLoaded', () => {
    initializePhoneChatStandalone();
});

let chatHistory = [];

function initializePhoneChatStandalone() {
    const sendBtn = document.getElementById('chat-send');
    const inputEl = document.getElementById('chat-input');
    const chatEl = document.getElementById('chat-messages');
    const keyInput = null;
    const keySave = null;
    const modelInput = null;
    const modelSave = null;
    if (!sendBtn || !inputEl || !chatEl) return;

    // Load saved key
    const savedKey = null;

    

    // Load/save model id
    
    if (modelSave && modelInput) {
        modelSave.addEventListener('click', () => {
            const v = (modelInput.value || '').trim();
            if (v) {
                localStorage.setItem('iquit_bedrock_model_id', v);
            } else {
                localStorage.removeItem('iquit_bedrock_model_id');
            }
        });
    }

    sendBtn.addEventListener('click', () => {
        const text = (inputEl.value || '').trim();
        if (!text) return;
        appendBubble('user', text);
        chatHistory.push({ role: 'user', content: text });
        inputEl.value = '';
        inputEl.focus();
        requestReplyStandalone(text);
    });

    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendBtn.click();
        }
    });
}

function appendBubble(role, text) {
    const chatEl = document.getElementById('chat-messages');
    if (!chatEl) return;
    const bubble = document.createElement('div');
    bubble.className = `bubble ${role}`;
    bubble.textContent = text;
    chatEl.appendChild(bubble);
    chatEl.scrollTop = chatEl.scrollHeight;
}

function appendTyping() {
    const chatEl = document.getElementById('chat-messages');
    if (!chatEl) return null;
    const bubble = document.createElement('div');
    bubble.className = 'bubble assistant';
    const dots = document.createElement('span');
    dots.className = 'typing';
    bubble.appendChild(dots);
    chatEl.appendChild(bubble);
    chatEl.scrollTop = chatEl.scrollHeight;
    return bubble;
}

async function requestReplyStandalone(message) {
    const typing = appendTyping();
    try {
        // Avoid sending duplicate 'user' roles: strip trailing user from history
        const historyForServer = Array.isArray(chatHistory) ? chatHistory.slice(0) : [];
        if (historyForServer.length && historyForServer[historyForServer.length - 1].role === 'user') {
            historyForServer.pop();
        }

        const res = await fetch('/api/sim/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history: historyForServer })
        });
        const data = await res.json().catch(() => ({}));
        if (typing && typing.parentNode) typing.parentNode.removeChild(typing);

        if (!res.ok) {
            const raw = (data && (data.detail || data.raw)) ? (data.detail || JSON.stringify(data.raw)) : '';
            const errMsg = (data && (data.error || raw)) ? `${data.error || 'Error'}: ${raw}` : `HTTP ${res.status}`;
            appendBubble('assistant', errMsg.trim());
            return;
        }

        const reply = (data && data.reply) ? String(data.reply) : '[no reply]';
        appendBubble('assistant', reply);
        chatHistory.push({ role: 'assistant', content: reply });
    } catch (err) {
        if (typing && typing.parentNode) typing.parentNode.removeChild(typing);
        const msg = (err && err.message) ? err.message : 'Error contacting AI.';
        appendBubble('assistant', `Error: ${msg}`);
    }
}


