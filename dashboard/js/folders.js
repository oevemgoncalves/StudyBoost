// gerenciamento de pastas
import { auth } from '../../firebase-config.js';
import {
    createFolder as createFolderFirebase,
    createWelcomeNoteIfNeeded,
    getFolders,
    deleteFolder,
    updateFolder,
    getNotes,
    deleteNote
} from '../../firebase-service.js';
import { deletePdfFromCloudinary } from '../../upload-service.js';
import { renderCurrentView, showMainView } from './app.js';
import { closeSidebarOnMobile } from './sidebar.js';

// elementos do DOM (variáveis)
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
let activeFolderId = 'all'; // Variável para armazenar a pasta ativa
let cachedFolders = [];

// Função auxiliar para extrair public_id da URL do Cloudinary
function extractPublicIdFromUrl(url) {
    if (!url) return null;
    const matches = url.match(/upload\/(?:v\d+\/)?([^\.]+)/);
    return matches ? matches[1] : null;
}

async function initFolders(uid) {
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

    // Quando pressionar Enter, cria a pasta
    pastaInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            createFolder();
        } else if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Modal de renomear pasta
    renameModal = document.createElement('div');
    renameModal.className = 'rename-modal';
    renameModal.innerHTML = `
        <div class="rename-modal-content">
            <h2>Renomear Pasta</h2>
            <input type="text" id="renameInput" placeholder="Novo nome da pasta">
            <div class="rename-modal-actions">
                <button id="cancelRenameBtn" type="button">Cancelar</button>
                <button id="confirmRenameBtn" type="button">Salvar</button>
            </div>
        </div>
    `;
    document.body.appendChild(renameModal);

    renameInput = renameModal.querySelector('#renameInput');
    renameModal.querySelector('#confirmRenameBtn').addEventListener('click', confirmRename);
    renameModal.querySelector('#cancelRenameBtn').addEventListener('click', closeRenameModal);

    renameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            confirmRename();
        } else if (e.key === 'Escape') {
            closeRenameModal();
        }
    });

    renameModal.addEventListener('click', (e) => {
        if (e.target === renameModal) {
            closeRenameModal();
        }
    });

    confirmMessage = document.createElement('div');
    confirmMessage.className = 'confirm-message';
    confirmMessage.textContent = 'Pasta excluída com sucesso!';
    document.body.appendChild(confirmMessage);

    // Fechar menus de 3 pontos ao clicar fora (registrado apenas uma vez)
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.folder-menu')) {
            document.querySelectorAll('.folder-menu-options.show').forEach(opt => {
                opt.classList.remove('show');
            });
        }
    });

    if (uid) {
        currentUserUid = uid;
        await createWelcomeNoteIfNeeded(currentUserUid);
        cachedFolders = await getFolders(currentUserUid);
        activeFolderId = 'all';
        renderFolders(cachedFolders);
        return;
    }

    // Fallback caso uid não tenha sido passado
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            unsubscribe();
            if (user) {
                currentUserUid = user.uid;
                await createWelcomeNoteIfNeeded(currentUserUid);
                cachedFolders = await getFolders(currentUserUid);
                activeFolderId = 'all';
                renderFolders(cachedFolders);
                resolve();
            } else {
                resolve();
            }
        });
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
        pastaInput.focus();
        return;
    }

    if (!currentUserUid) {
        alert('Usuário não autenticado.');
        return;
    }

    criarPastaBtn.disabled = true;
    const originalText = criarPastaBtn.textContent;
    criarPastaBtn.textContent = 'Criando...';

    try {
        // Cria no Firestore
        const newFolder = await createFolderFirebase(currentUserUid, folderName);
        cachedFolders = await getFolders(currentUserUid);
        renderFolders(cachedFolders);
        await selectFolder(newFolder.id);
        closeModal();
    } catch (error) {
        console.error("Erro ao criar pasta:", error);
        alert("Erro ao criar pasta. Tente novamente.");
    } finally {
        criarPastaBtn.disabled = false;
        criarPastaBtn.textContent = originalText;
    }
}

async function selectFolder(folderId) {
    activeFolderId = folderId;
    closeSidebarOnMobile();
    await renderCurrentView(); // Atualiza o nome no topo e a pasta ativa
    showMainView(); // Mostra a view principal com as notas da pasta
}

// renderFolders modificado para incluir os 3 pontos
function renderFolders(folders) {
    cachedFolders = folders;
    folderContainer.innerHTML = '';

    folders.forEach(folder => {
        const folderEl = document.createElement('div');
        folderEl.className = 'folder';
        folderEl.setAttribute('data-id', folder.id);

        const folderContent = document.createElement('div');
        folderContent.className = 'folder-content';
        folderContent.style.display = 'flex';
        folderContent.style.alignItems = 'center';
        folderContent.style.width = '100%';
        folderContent.style.overflow = 'hidden';

        const icon = document.createElement('i');
        icon.className = 'fa-regular fa-folder-closed';

        const name = document.createElement('span');
        name.textContent = folder.name;
        name.style.flexGrow = '1';
        name.style.whiteSpace = 'nowrap';
        name.style.overflow = 'hidden';
        name.style.textOverflow = 'ellipsis';

        const menu = document.createElement('div');
        menu.className = 'folder-menu';

        const menuBtn = document.createElement('button');
        menuBtn.className = 'folder-menu-btn';
        menuBtn.type = 'button';
        menuBtn.setAttribute('aria-label', 'Opções da pasta');
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
            menuOptions.classList.remove('show');

            if (confirm(`Tem certeza que deseja excluir a pasta "${folder.name}" e todas as suas notas?`)) {
                try {
                    // Buscar todas as notas dessa pasta
                    const notes = await getNotes(currentUserUid, folder.id);

                    // Excluir cada nota e seus PDFs associados
                    for (const note of notes) {
                        if (note.pdfUrl) {
                            try {
                                const publicId = extractPublicIdFromUrl(note.pdfUrl);
                                await deletePdfFromCloudinary(publicId);
                            } catch (error) {
                                console.warn("Aviso ao excluir PDF do Cloudinary:", error);
                            }
                        }
                        await deleteNote(currentUserUid, note.id);
                    }

                    // Excluir a pasta
                    await deleteFolder(currentUserUid, folder.id);

                    // Atualiza visualmente
                    cachedFolders = await getFolders(currentUserUid);
                    renderFolders(cachedFolders);

                    // Se a pasta ativa era a que foi deletada, volta para "all"
                    if (activeFolderId === folder.id) {
                        activeFolderId = 'all';
                    }

                    await renderCurrentView();
                    showMainView();
                    showConfirmMessage('Pasta excluída com sucesso!');
                } catch (error) {
                    console.error("Erro ao excluir pasta e notas:", error);
                    alert("Erro ao excluir pasta.");
                }
            }
        });

        menuOptions.appendChild(renameOption);
        menuOptions.appendChild(deleteOption);
        menu.appendChild(menuBtn);
        menu.appendChild(menuOptions);

        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Fecha outros menus abertos antes de alternar o atual
            document.querySelectorAll('.folder-menu-options.show').forEach(opt => {
                if (opt !== menuOptions) opt.classList.remove('show');
            });
            menuOptions.classList.toggle('show');
        });

        folderContent.appendChild(icon);
        folderContent.appendChild(name);
        folderEl.appendChild(folderContent);
        folderEl.appendChild(menu);

        folderEl.addEventListener('click', () => {
            document.querySelectorAll('.folder-menu-options.show').forEach(opt => {
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
}

// Funções para renomear e excluir pastas
function openRenameModal(folderId, currentName) {
    renameFolderId = folderId;
    renameInput.value = currentName;
    renameModal.classList.add('active');
    setTimeout(() => renameInput.focus(), 50);
}

function closeRenameModal() {
    renameModal.classList.remove('active');
}

async function confirmRename() {
    const newName = renameInput.value.trim();
    if (!newName) {
        alert("Digite um nome válido para a pasta.");
        renameInput.focus();
        return;
    }

    if (currentUserUid && renameFolderId) {
        const confirmBtn = renameModal.querySelector('#confirmRenameBtn');
        confirmBtn.disabled = true;
        try {
            await updateFolder(currentUserUid, renameFolderId, { name: newName });
            cachedFolders = await getFolders(currentUserUid);
            renderFolders(cachedFolders);
            if (activeFolderId === renameFolderId) {
                await renderCurrentView();
            }
            closeRenameModal();
        } catch (err) {
            console.error("Erro ao renomear pasta:", err);
            alert("Erro ao renomear pasta.");
        } finally {
            confirmBtn.disabled = false;
        }
    }
}

function showConfirmMessage(msg = 'Pasta excluída com sucesso!') {
    if (!confirmMessage) return;
    confirmMessage.textContent = msg;
    confirmMessage.classList.remove('show');
    // Força reflow para reiniciar animação
    void confirmMessage.offsetWidth;
    confirmMessage.classList.add('show');
    setTimeout(() => {
        confirmMessage.classList.remove('show');
    }, 3000);
}

async function getFolderNameById(folderId) {
    if (!folderId || folderId === 'all') return 'Todas as Notas';

    let folder = cachedFolders.find(f => f.id === folderId);
    if (!folder && currentUserUid) {
        cachedFolders = await getFolders(currentUserUid);
        folder = cachedFolders.find(f => f.id === folderId);
    }
    return folder ? folder.name : 'Pasta';
}

function getCachedFolders() {
    return cachedFolders;
}

export {
    initFolders,
    activeFolderId,
    currentUserUid,
    getFolderNameById,
    getCachedFolders,
    selectFolder
};
