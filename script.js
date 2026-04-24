const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';
  const botMessageId = 'bot-' + Date.now();
  appendMessage('bot', 'Sedang berpikir...', botMessageId);

  try {
    const response = await fetch('/chat', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: userMessage,
        mode: 'creative'
      }),
    });

    const data = await response.json();

    if (response.ok) {
      updateBotMessage(botMessageId, data.result);
    } else {
      updateBotMessage(botMessageId, "Waduh, ada error: " + (data.message || 'Gagal konek API'));
    }
  } catch (error) {
    console.error('Error:', error);
    updateBotMessage(botMessageId, "Gagal terhubung ke server. Pastikan terminal sudah 'node index.js'");
  }
});

function appendMessage(sender, text, id = null) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  if (id) msg.setAttribute('id', id);
  if (sender === 'bot') {
    msg.innerHTML = marked.parse(text);
  } else {
    msg.textContent = text;
  }
  
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function updateBotMessage(id, newText) {
  const botMsgElement = document.getElementById(id);
  if (botMsgElement) {
    botMsgElement.innerHTML = marked.parse(newText);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}