// gerenciamento de pastas
import { store } from './store.js';
import { renderCurrentView } from './app.js';
import { showMainView } from './app.js';
import { renderNotes } from './notes.js';

// elementos do DOM (variaves)
let modal;
let pastaInput;
let criarPastaBtn;
let folderContainer;
let btnCriarNovaPasta;
let pastaFixa;

function initFolders() {
    // Obtendo os elementos do DOM
    modal = document.getElementById('modal');
    pastaInput = document.getElementById('pastaNome');
    criarPastaBtn = document.getElementById('criarPastaBtn');
    folderContainer = document.getElementById('folder-container');
    btnCriarNovaPasta = document.getElementById('btnCriarNovaPasta');
    pastaFixa = document.getElementById('pasta-fixa');
    
    // Configurando ouvintes de eventos
    btnCriarNovaPasta.addEventListener('click', openModal);
    document.getElementById('fecharModal').addEventListener('click', closeModal);
    criarPastaBtn.addEventListener('click', createFolder);
    pastaFixa.addEventListener('click', () => selectFolder('all'));
    
    // quando precionar Enter ele vai entrar
    pastaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            createFolder();
        }
    });
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Subscribe to folder changes
    store.subscribe('folderChange', renderFolders);
    
    // Renderização inicial
    renderFolders();
}

function openModal() {
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    
    // Pequeno atraso para garantir que o modal esteja no DOM antes da animação
    setTimeout(() => {
        modal.classList.add('active');
        pastaInput.focus();
    }, 10);
}

function closeModal() {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    
    // Atrasar a ocultação do modal até que a animação seja concluída
    setTimeout(() => {
        modal.classList.add('hidden');
        pastaInput.value = '';
    }, 300);
}

function createFolder() {
    const folderName = pastaInput.value.trim();
    
    if (!folderName) {
        alert('Por favor, insira um nome para a pasta');
        return;
    }
    
    // Adiciona a pasta ao armazenamento (navegador)
    const newFolder = store.addFolder({
        name: folderName
    });
    
    // selecionar a nova pasta
    selectFolder(newFolder.id);
    
    // fecha o modal
    closeModal();
}

function selectFolder(folderId) {
    store.setActiveFolder(folderId);
    showMainView(); // Mostra a view principal
    renderCurrentView();
    renderNotes();
}

function renderFolders() {
    // Seleciona todas as pastas, exceto a fixa
    const folders = store.getFolders().filter(folder => !folder.isFixed);
    
    // Limpar contêiner de pasta
    folderContainer.innerHTML = '';
    
    // Adicione cada pasta ao contêiner
    folders.forEach(folder => {
        const folderEl = document.createElement('div');
        folderEl.className = 'folder';
        folderEl.setAttribute('data-id', folder.id);
        
        const icon = document.createElement('i');
        icon.className = 'fa-regular fa-folder-closed';
        
        const name = document.createElement('span');
        name.textContent = folder.name;
        
        folderEl.appendChild(icon);
        folderEl.appendChild(name);
        
        folderEl.addEventListener('click', () => selectFolder(folder.id));
        
        folderContainer.appendChild(folderEl);
    });
    
    // Atualizar UI da pasta ativa
    const activeFolder = store.getActiveFolder();
    document.querySelectorAll('.folder').forEach(folderEl => {
        const folderId = folderEl.getAttribute('data-id');
        if (folderId === activeFolder.id) {
            folderEl.classList.add('active');
            folderEl.querySelector('i').className = 'fa-regular fa-folder-open';
        } else {
            folderEl.classList.remove('active');
            folderEl.querySelector('i').className = 'fa-regular fa-folder-closed';
        }
    });
}

export { initFolders };