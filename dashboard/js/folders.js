// gerenciamento de pastas
import { auth } from '../../firebase-config.js';
import {
  createFolder as createFolderFirebase,
  createWelcomeNoteIfNeeded,
  getFolders,
  deleteFolder,
  updateFolder
} from '../../firebase-service.js';

import { db } from '../../firebase-config.js';
import {
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

import { renderCurrentView, showMainView } from './app.js';
import { initModalPdf } from './modal-pdf.js';
//import { renderNotes } from './notes.js';

// elementos do DOM (variaves)
let modal;
let pastaInput;
let criarPastaBtn;
let folderContainer;
let btnCriarNovaPasta;
let pastaFixa;
let renameModal;
let renameInput;
let renameFolderId;
let confirmMessage;
let currentUserUid = null;
let activeFolderId = null; // Variável para armazenar a pasta ativa 

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
    //exluir pasta
    renameModal = document.createElement('div');
    renameModal.className = 'rename-modal';
    renameModal.innerHTML = `
        <div class="rename-modal-content">
            <h2>Renomear Pasta</h2>
            <input type="text" id="renameInput" placeholder="Novo nome da pasta">
            <div class="rename-modal-actions">
                <button id="cancelRenameBtn">Cancelar</button>
                <button id="confirmRenameBtn">Salvar</button>
            </div>
        </div>
    `;
    document.body.appendChild(renameModal);

    renameInput = renameModal.querySelector('#renameInput');
    renameModal.querySelector('#confirmRenameBtn').addEventListener('click', confirmRename);
    renameModal.querySelector('#cancelRenameBtn').addEventListener('click', closeRenameModal);

    confirmMessage = document.createElement('div');
    confirmMessage.className = 'confirm-message';
    confirmMessage.textContent = 'Pasta excluída com sucesso!';
    document.body.appendChild(confirmMessage);

    // 🔁 Agora carregamos as pastas do Firebase
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUserUid = user.uid; // ⬅️ Salva o UID globalmente
            await createWelcomeNoteIfNeeded(currentUserUid);
            const pastas = await getFolders(currentUserUid);

            activeFolderId = 'all';
            renderFolders(pastas);
            showMainView();

            // ✅ Agora é seguro iniciar o modal de upload
            initModalPdf();  
        } else {
            alert('Usuário não autenticado.');
            // Redireciona pra login se quiser
            // window.location.href = "/login.html";
        }
    });

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

async function createFolder() {
    const folderName = pastaInput.value.trim();

    if (!folderName) {
        alert('Por favor, insira um nome para a pasta');
        return;
    }

    if (!currentUserUid) {
        alert('Usuário não autenticado.');
        return;
    }


    try {
        // Cria no Firestore
        const newFolder = await createFolderFirebase(currentUserUid, folderName);
        const pastas = await getFolders(currentUserUid);
        renderFolders(pastas);
        selectFolder(newFolder.id);

        closeModal();
    } catch (error) {
        console.error("Erro ao criar pasta:", error);
        alert("Erro ao criar pasta. Tente novamente.");
    }
}


async function selectFolder(folderId) {
    activeFolderId = folderId;
    await renderCurrentView(); // Atualiza o nome no topo
    showMainView(); // Mostra a view principal
}
// renderFolder modificado para incluir os 3 pontos
function renderFolders(folders) {
    folderContainer.innerHTML = '';

    folders.forEach(folder => {
        console.log("Criando elemento para pasta:", folder.name);
        const folderEl = document.createElement('div');
        folderEl.className = 'folder';
        folderEl.setAttribute('data-id', folder.id);
        
        const folderContent = document.createElement('div');
        folderContent.className = 'folder-content';
        folderContent.style.display = 'flex';
        folderContent.style.alignItems = 'center';
        folderContent.style.width = '100%';

        const icon = document.createElement('i');
        icon.className = 'fa-regular fa-folder-closed';
        
        const name = document.createElement('span');
        name.textContent = folder.name;
        name.style.flexGrow = '1';
        
        const menu = document.createElement('div');
        menu.className = 'folder-menu';
        
        const menuBtn = document.createElement('button');
        menuBtn.className = 'folder-menu-btn';
        menuBtn.innerHTML = '<i class="fa-solid fa-ellipsis-vertical"></i>';
        
        const menuOptions = document.createElement('div');
        menuOptions.className = 'folder-menu-options';
        
        const renameOption = document.createElement('div');
        renameOption.className = 'folder-menu-option';
        renameOption.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Renomear';
        renameOption.addEventListener('click', (e) => {
            e.stopPropagation();
            openRenameModal(folder.id, folder.name);
            menuOptions.classList.remove('show');
        });
        
        const deleteOption = document.createElement('div');
        deleteOption.className = 'folder-menu-option';
        deleteOption.innerHTML = '<i class="fa-regular fa-trash-can"></i> Excluir';
        deleteOption.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm(`Tem certeza que deseja excluir a pasta "${folder.name}" e todas as suas notas?`)) {
                try {
                    // Buscar todas as notas dessa pasta
                    const notes = await getNotes(currentUserUid, folder.id);

                    // Excluir cada nota
                    for (const note of notes) {
                        const noteRef = doc(db, 'users', currentUserUid, 'notes', note.id);
                        await deleteDoc(noteRef);
                    }

                    // Excluir a pasta
                    await deleteFolder(currentUserUid, folder.id);

                    // Atualiza visualmente
                    const pastasAtualizadas = await getFolders(currentUserUid);
                    renderFolders(pastasAtualizadas);

                    // Se a pasta ativa era a que foi deletada, volta para "all"
                    if (activeFolderId === folder.id) {
                        activeFolderId = 'all';
                    }

                    showMainView(); // atualiza as notas também
                } catch (error) {
                    console.error("Erro ao excluir pasta e notas:", error);
                    alert("Erro ao excluir pasta.");
                }
            }

            menuOptions.classList.remove('show');
        });

        
        menuOptions.appendChild(renameOption);
        menuOptions.appendChild(deleteOption);
        menu.appendChild(menuBtn);
        menu.appendChild(menuOptions);
        
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menuOptions.classList.toggle('show');
        });
        
        folderContent.appendChild(icon);
        folderContent.appendChild(name);
        folderEl.appendChild(folderContent);
        folderEl.appendChild(menu);
        
        folderEl.addEventListener('click', () => {
            document.querySelectorAll('.folder-menu-options').forEach(opt => {
                opt.classList.remove('show');
            });
            selectFolder(folder.id);
        });
        
        folderContainer.appendChild(folderEl);
    });

    // Atualizar UI da pasta ativa
    document.querySelectorAll('.folder').forEach(folderEl => {
        const folderId = folderEl.getAttribute('data-id');
        const isActive = folderId === activeFolderId;

        folderEl.classList.toggle('active', isActive);
        const icon = folderEl.querySelector('i');
        if (icon) {
            icon.className = isActive ? 'fa-regular fa-folder-open' : 'fa-regular fa-folder-closed';
        }
    });


    // Fechar menus ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.folder-menu-btn')) {
            document.querySelectorAll('.folder-menu-options').forEach(opt => {
                opt.classList.remove('show');
            });
        }
    });

}

//novas funcçoes para renomear e excluir pastas
function openRenameModal(folderId, currentName) {
    renameFolderId = folderId;
    renameInput.value = currentName;
    renameModal.classList.add('active');
    renameInput.focus();
}

function closeRenameModal() {
    renameModal.classList.remove('active');
}

async function confirmRename() {
    const newName = renameInput.value.trim();

    if (newName && currentUserUid && renameFolderId) {
        try {
            await updateFolder(currentUserUid, renameFolderId, { name: newName });
            const pastas = await getFolders(currentUserUid);
            renderFolders(pastas);
            closeRenameModal();
        } catch (err) {
            console.error("Erro ao renomear pasta:", err);
            alert("Erro ao renomear pasta.");
        }
    }
}


function showConfirmMessage() {
    confirmMessage.classList.add('show');
    setTimeout(() => {
        confirmMessage.classList.remove('show');
    }, 3000);
}

// No final de folders.js, adicione:
async function getFolderNameById(folderId) {
    if (folderId === 'all') return 'Todas as Notas';
    
    const folders = await getFolders(currentUserUid);
    const folder = folders.find(f => f.id === folderId);
    return folder ? folder.name : 'Pasta';
}


export { initFolders, activeFolderId, currentUserUid, getFolderNameById };