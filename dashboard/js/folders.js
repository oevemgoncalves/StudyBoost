// Folder management
import { store } from './store.js';
import { renderCurrentView } from './app.js';
import { renderNotes } from './notes.js';

// DOM elements
let modal;
let pastaInput;
let criarPastaBtn;
let folderContainer;
let btnCriarNovaPasta;
let pastaFixa;

function initFolders() {
    // Get DOM elements
    modal = document.getElementById('modal');
    pastaInput = document.getElementById('pastaNome');
    criarPastaBtn = document.getElementById('criarPastaBtn');
    folderContainer = document.getElementById('folder-container');
    btnCriarNovaPasta = document.getElementById('btnCriarNovaPasta');
    pastaFixa = document.getElementById('pasta-fixa');
    
    // Set up event listeners
    btnCriarNovaPasta.addEventListener('click', openModal);
    document.getElementById('fecharModal').addEventListener('click', closeModal);
    criarPastaBtn.addEventListener('click', createFolder);
    pastaFixa.addEventListener('click', () => selectFolder('all'));
    
    // Handle pressing Enter in the input
    pastaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            createFolder();
        }
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Subscribe to folder changes
    store.subscribe('folderChange', renderFolders);
    
    // Initial render
    renderFolders();
}

function openModal() {
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    
    // Small delay to ensure the modal is in the DOM before animating
    setTimeout(() => {
        modal.classList.add('active');
        pastaInput.focus();
    }, 10);
}

function closeModal() {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    
    // Delay hiding the modal until animation completes
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
    
    // Add the folder to the store
    const newFolder = store.addFolder({
        name: folderName
    });
    
    // Select the new folder
    selectFolder(newFolder.id);
    
    // Close the modal
    closeModal();
}

function selectFolder(folderId) {
    store.setActiveFolder(folderId);
    renderCurrentView();
    renderNotes();
}

function renderFolders() {
    // Get all folders except the fixed one
    const folders = store.getFolders().filter(folder => !folder.isFixed);
    
    // Clear folder container
    folderContainer.innerHTML = '';
    
    // Add each folder to the container
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
    
    // Update active folder UI
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