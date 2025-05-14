const chatBox       = document.getElementById("chat-box");    
const userInput     = document.getElementById("user-input");
const sendButton    = document.getElementById("send-btn");   
const languageSelect= document.getElementById("language-select");
const chatContainer = document.getElementById("chat-container");

const adjustFontSize = (textDiv) => {
    const maxFontSize = 18; 
    const minFontSize = 12; 
    const bubbleWidth = textDiv.parentElement.offsetWidth; 
    const textLength = textDiv.textContent.length; 

   
    let fontSize = Math.max(minFontSize, Math.min(maxFontSize, bubbleWidth / (textLength * 0.6)));
    textDiv.style.fontSize = `${fontSize}px`;
};

const appendMessage = (message, sender) => {
    const container = document.createElement("div");
    container.className = sender === "bot"
        ? "bot-message-container"
        : "user-message-container";

    const icon = document.createElement("img");
    icon.src = sender === "bot"
        ? "static/images/bot-little-icon.jpg"
        : "static/images/user-icon.jpg";

    const bubble = document.createElement("div");
    bubble.className = `message ${sender}-message`;


    if (message.trim().startsWith("<")) {
        bubble.innerHTML = message;
    } else {
        bubble.textContent = message;
    }

    
    if (message.length > 100) {
        bubble.classList.add("long");
    }

    container.appendChild(icon);
    container.appendChild(bubble);
    chatBox.appendChild(container);
    chatBox.scrollTop = chatBox.scrollHeight;
};

let typingElem; 

const showTypingIndicator = () => {
  typingElem = document.createElement('div');
  typingElem.className = 'bot-message-container';
  const icon = document.createElement('img');
  icon.src = 'static/images/bot-little-icon.jpg';
  const bubble = document.createElement('div');
  bubble.className = 'message bot-message';
  bubble.innerHTML = '<span class="typing-indicator"><span>.</span><span>.</span><span>.</span></span>';
  typingElem.appendChild(icon);
  typingElem.appendChild(bubble);
  chatBox.appendChild(typingElem);
  chatBox.scrollTop = chatBox.scrollHeight;
};

const hideTypingIndicator = () => {
  if (typingElem) {
    typingElem.remove();
    typingElem = null;
  }
};

const sendMessage = async () => {
  const userMessage = userInput.value.trim();
  const selectedLanguage = languageSelect.value;
  if (userMessage) {
    appendMessage(userMessage, "user");
    userInput.value = "";

    showTypingIndicator(); 

    try {
      const response = await fetch("/get_response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage, language: selectedLanguage }),
      });

      const data = await response.json();
      hideTypingIndicator();
      appendMessage(data.response, "bot");
    } catch (error) {
      hideTypingIndicator(); 
      appendMessage("Something went wrong. Please try again.", "bot");
    }
  }
};

function quickReply(text) {
    const input = document.getElementById('user-input');
    input.value = text;
    sendMessage();
}

sendButton.textContent = '➤';
sendButton.addEventListener("click", sendMessage);

userInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

function toggleChat() {
  if (chatContainer.classList.contains('open')) {

    chatContainer.classList.remove('open');
    chatContainer.classList.add('closing');
    const onEnd = () => {
      chatContainer.classList.remove('closing');
      chatContainer.removeEventListener('animationend', onEnd);
    };
    chatContainer.addEventListener('animationend', onEnd);
  } else {

    chatContainer.classList.remove('closing');
    chatContainer.classList.add('open');
  }
}
