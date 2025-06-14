// Funcionalidade do bot de bate-papo
function initChatBot() {
    const chatBot = document.getElementById('chatBot');
    let chatContainer = null;
    
    // Configurar ouvinte de eventos
    chatBot.addEventListener('click', toggleChatBot);
    
    // Crie uma interface de bate-papo dinamicamente quando necessário
    function createChatInterface() {
        // Crie um contêiner de bate-papo se ele não existir
        if (!chatContainer) {
            chatContainer = document.createElement('div');
            chatContainer.className = 'chat-container';
            chatContainer.innerHTML = `
                <div class="chat-header">
                    <h3>StudyBoost Assistant</h3>
                    <button class="chat-close" id="chatClose">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <div class="chat-messages" id="chatMessages">
                    <div class="message bot">
                        Olá! Sou o assistente do StudyBoost. Como posso ajudar você com seus estudos hoje?
                    </div>
                </div>
                <div class="chat-input">
                    <input type="text" id="chatInput" placeholder="Digite sua mensagem...">
                    <button id="sendMessage">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
            `;
            
            document.body.appendChild(chatContainer);
            
            // Configurar ouvintes de eventos para interface de bate-papo
            const chatClose = document.getElementById('chatClose');
            const chatInput = document.getElementById('chatInput');
            const sendMessage = document.getElementById('sendMessage');
            
            chatClose.addEventListener('click', closeChatBot);
            
            sendMessage.addEventListener('click', () => {
                sendChatMessage(chatInput.value);
                chatInput.value = '';
            });
            
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendChatMessage(chatInput.value);
                    chatInput.value = '';
                }
            });
        }
    }
    
    function toggleChatBot() {
        // Crie uma interface de bate-papo se ela não existir
        createChatInterface();
        
        // Alternar visibilidade do bate-papo
        if (chatContainer.classList.contains('active')) {
            closeChatBot();
        } else {
            openChatBot();
        }
    }
    
    function openChatBot() {
        chatContainer.classList.add('active');
        document.getElementById('chatInput').focus();
    }
    
    function closeChatBot() {
        chatContainer.classList.remove('active');
    }
    
    function sendChatMessage(message) {
        if (!message.trim()) return;
        
        const chatMessages = document.getElementById('chatMessages');
        
        // Adicionar mensagem do usuário
        const userMessageEl = document.createElement('div');
        userMessageEl.className = 'message user';
        userMessageEl.textContent = message;
        chatMessages.appendChild(userMessageEl);
        
        // Role para baixo
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Adicionar resposta do bot após um atraso (simulando o pensamento)
        setTimeout(() => {
            const botMessageEl = document.createElement('div');
            botMessageEl.className = 'message bot';
            botMessageEl.textContent = getBotResponse(message);
            chatMessages.appendChild(botMessageEl);
            
            // Role para baixo novamente
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    }
    
    function getBotResponse(message) {
        message = message.toLowerCase();
        
        if (message.includes('oi') || message.includes('olá') || message.includes('ola')) {
            return 'Olá! Como posso ajudar com seus estudos hoje?';
        } else if (message.includes('nota') || message.includes('anotação')) {
            return 'Para criar uma nova nota, clique em "Nova nota" no topo da página. Para organizar suas notas, você pode criar pastas clicando em "criar nova pasta" no menu lateral.';
        } else if (message.includes('pasta')) {
            return 'Você pode criar novas pastas clicando no botão "criar nova pasta" no menu lateral. Todas as suas notas são automaticamente salvas na pasta "Todas as Notas".';
        } else if (message.includes('áudio') || message.includes('audio') || message.includes('gravar')) {
            return 'Para gravar áudio, clique no botão "Gravar áudio" ao criar uma nova nota. Você também pode enviar arquivos de áudio existentes.';
        } else if (message.includes('pdf')) {
            return 'Para adicionar um PDF às suas notas, clique no botão "Upload PDF" ao criar uma nova nota.';
        } else if (message.includes('youtube') || message.includes('vídeo') || message.includes('video')) {
            return 'Para adicionar um vídeo do YouTube, clique no botão "Vídeo do YouTube" e cole o link do vídeo.';
        } else if (message.includes('obrigado') || message.includes('obrigada') || message.includes('valeu')) {
            return 'De nada! Estou sempre à disposição para ajudar.';
        } else {
            return 'Desculpe, não entendi sua pergunta. Posso ajudar com: criação de notas, organização de pastas, gravação de áudio, upload de PDF ou inclusão de vídeos do YouTube.';
        }
    }
}

export { initChatBot };