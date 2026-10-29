// Gerenciamento de notas
import { getNotes, createNote, getNoteById, deleteNote, updateNote, getFolders } from '../../firebase-service.js';
import { deletePdfFromCloudinary } from '../../upload-service.js';
import { showMainView } from './app.js';
import { activeFolderId, currentUserUid } from './folders.js';
import { updateFlashcardsUI, updateQuizUI } from './cards.js';

// elemento DOM
let notesContainer;
let moveFolderModal = null;
let noteIdToMove = null;

// Função auxiliar para extrair public_id do Cloudinary
function extractPublicIdFromUrl(url) {
    if (!url) return null;
    const matches = url.match(/upload\/(?:v\d+\/)?([^\.]+)/);
    return matches ? matches[1] : null;
}

// Função auxiliar para converter HTML em texto limpo para cópia
function htmlToPlainText(html) {
    if (!html) return '';
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return (temp.innerText || temp.textContent || '').trim();
}

function initNotes() {
    notesContainer = document.getElementById('notes-container');
    if (!notesContainer) {
        console.error('Elemento notes-container não encontrado no DOM');
        return false;
    }

    const currentFolderBtn = document.getElementById('currentFolder');
    if (currentFolderBtn && !currentFolderBtn.dataset.listenerAttached) {
        currentFolderBtn.dataset.listenerAttached = 'true';
        currentFolderBtn.addEventListener('click', () => {
            showMainView();
        });
    }

    ensureMoveFolderModal();
    return true;
}

function ensureMoveFolderModal() {
    if (moveFolderModal) return;

    moveFolderModal = document.createElement('div');
    moveFolderModal.className = 'rename-modal';
    moveFolderModal.innerHTML = `
        <div class="rename-modal-content" style="height: auto; min-height: 190px;">
            <h2 style="margin-bottom: 12px;">Mover para pasta</h2>
            <select id="moveFolderSelect" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 16px; font-size: 0.95rem;">
                <option value="all">Todas as Notas</option>
            </select>
            <div class="rename-modal-actions">
                <button id="cancelMoveFolderBtn" type="button" style="background: #64748b;">Cancelar</button>
                <button id="confirmMoveFolderBtn" type="button">Salvar</button>
            </div>
        </div>
    `;
    document.body.appendChild(moveFolderModal);

    moveFolderModal.querySelector('#cancelMoveFolderBtn').addEventListener('click', () => {
        moveFolderModal.classList.remove('active');
        noteIdToMove = null;
    });

    moveFolderModal.addEventListener('click', (e) => {
        if (e.target === moveFolderModal) {
            moveFolderModal.classList.remove('active');
            noteIdToMove = null;
        }
    });

    moveFolderModal.querySelector('#confirmMoveFolderBtn').addEventListener('click', async () => {
        if (!noteIdToMove || !currentUserUid) return;
        const selectEl = moveFolderModal.querySelector('#moveFolderSelect');
        const targetFolderId = selectEl.value;
        const confirmBtn = moveFolderModal.querySelector('#confirmMoveFolderBtn');
        confirmBtn.disabled = true;

        try {
            await updateNote(currentUserUid, noteIdToMove, { folderId: targetFolderId });
            moveFolderModal.classList.remove('active');
            noteIdToMove = null;
            await renderNotes();
        } catch (err) {
            console.error('Erro ao mover nota para pasta:', err);
            alert('Erro ao mover nota para a pasta selecionada.');
        } finally {
            confirmBtn.disabled = false;
        }
    });
}

async function openMoveFolderModal(note) {
    ensureMoveFolderModal();
    noteIdToMove = note.id;

    const selectEl = moveFolderModal.querySelector('#moveFolderSelect');
    selectEl.innerHTML = '<option value="all">Todas as Notas (Sem pasta específica)</option>';

    try {
        const folders = await getFolders(currentUserUid);
        folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.id;
            option.textContent = folder.name;
            if (note.folderId === folder.id) {
                option.selected = true;
            }
            selectEl.appendChild(option);
        });
    } catch (err) {
        console.error('Erro ao carregar pastas:', err);
    }

    moveFolderModal.classList.add('active');
}

async function renderNotes() {
    if (!currentUserUid || !activeFolderId) {
        return;
    }

    if (!notesContainer) {
        initNotes();
        if (!notesContainer) return;
    }

    try {
        notesContainer.classList.remove('hidden');
        notesContainer.innerHTML = '';

        let notes = [];
        if (activeFolderId === 'all') {
            notes = await getNotes(currentUserUid);
        } else {
            notes = await getNotes(currentUserUid, activeFolderId);
        }

        if (notes.length === 0) {
            renderEmptyState();
            return;
        }

        notes.forEach(note => {
            const noteEl = createNoteElement(note);
            notesContainer.appendChild(noteEl);
        });
    } catch (error) {
        console.error('Erro ao renderizar notas:', error);
    }
}

function createNoteElement(note) {
    const noteEl = document.createElement('div');
    noteEl.className = 'note-card';
    noteEl.setAttribute('data-id', note.id);

    const header = document.createElement('div');
    header.className = 'note-header';

    const title = document.createElement('h3');
    title.className = 'note-title';
    title.textContent = note.title;

    const content = document.createElement('div');
    content.className = 'note-content';

    if (note.isWelcome) {
        content.textContent = 'Transforme PDFs em resumos, flashcards, quizzes e áudios com IA.';
    } else {
        content.innerHTML = note.content;
    }

    const footer = document.createElement('div');
    footer.className = 'note-footer';

    const actions = document.createElement('div');
    actions.className = 'note-actions';

    const addToFolder = document.createElement('button');
    addToFolder.type = 'button';
    addToFolder.innerHTML = '<i class="fa-regular fa-folder"></i> Adicionar pasta';
    addToFolder.addEventListener('click', (e) => {
        e.stopPropagation();
        openMoveFolderModal(note);
    });

    const copyText = document.createElement('button');
    copyText.type = 'button';
    copyText.innerHTML = '<i class="fa-regular fa-copy"></i> Copiar texto';
    copyText.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
            const plainText = htmlToPlainText(note.content);
            await navigator.clipboard.writeText(plainText);
            const originalHTML = copyText.innerHTML;
            copyText.innerHTML = '<i class="fa-solid fa-check"></i> Copiado!';
            setTimeout(() => {
                copyText.innerHTML = originalHTML;
            }, 2000);
        } catch (err) {
            console.error('Erro ao copiar texto:', err);
        }
    });

    const date = document.createElement('div');
    date.className = 'note-date';
    date.textContent = formatDate(note.createdAt);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Excluir';
    deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja excluir esta nota permanentemente?')) {
            try {
                const fullNote = await getNoteById(currentUserUid, note.id);

                if (fullNote && fullNote.pdfUrl) {
                    try {
                        const publicId = extractPublicIdFromUrl(fullNote.pdfUrl);
                        await deletePdfFromCloudinary(publicId);
                    } catch (error) {
                        console.warn("Aviso ao excluir PDF do Cloudinary:", error);
                    }
                }

                await deleteNote(currentUserUid, note.id);
                await renderNotes();
            } catch (error) {
                console.error("Erro ao excluir nota:", error);
                alert("Erro ao excluir nota.");
            }
        }
    });

    actions.appendChild(deleteBtn);
    actions.appendChild(addToFolder);
    actions.appendChild(copyText);

    footer.appendChild(actions);
    footer.appendChild(date);

    header.appendChild(title);

    noteEl.appendChild(header);
    noteEl.appendChild(content);
    noteEl.appendChild(footer);

    // Adicionar evento de clique para abrir a nota
    noteEl.addEventListener('click', () => openNote(note.id));

    return noteEl;
}

function renderEmptyState() {
    if (!notesContainer) return;

    notesContainer.innerHTML = '';
    const emptyEl = document.createElement('div');
    emptyEl.className = 'empty-notes';

    const message = document.createElement('p');
    message.textContent = 'Nenhuma nota encontrada nesta pasta.';
    emptyEl.appendChild(message);

    notesContainer.appendChild(emptyEl);
}

async function openNote(noteId) {
    try {
        const note = await getNoteById(currentUserUid, noteId);
        if (!note) {
            alert("Nota não encontrada!");
            return;
        }

        const resumoContainer = document.querySelector('#notas .container__nota__resumo');
        if (resumoContainer) {
            resumoContainer.innerHTML = `
                <h1>${note.title}</h1>
                <div>${note.content}</div>
            `;
        }

        window.currentOpenedNoteId = note.id;
        window.currentOpenedNoteContent = note.content;

        // Atualização segura da UI
        document.getElementById('noteContentContainer')?.classList.remove('hidden');
        document.querySelector('.nova-nota-section')?.classList.add('hidden');
        document.getElementById('notes-container')?.classList.add('hidden');

        document.querySelectorAll(".container__nota").forEach(sec => sec.classList.add("hidden"));
        document.getElementById("notas")?.classList.remove("hidden");

        document.querySelectorAll(".botoes .btn").forEach(btn => btn.classList.remove("notaActive"));
        document.querySelector('.btn[data-target="notas"]')?.classList.add("notaActive");

        if (!note.isWelcome) {
            window.customFlashcards = note.flashcards || [];
            window.customQuiz = note.quiz || [];
        } else {
            window.customFlashcards = null;
            window.customQuiz = null;
        }

        updateFlashcardsUI();
        updateQuizUI();
    } catch (error) {
        console.error('Erro ao abrir nota:', error);
        alert("Erro ao carregar a nota");
    }
}

function formatDate(date) {
    if (!date) return "Sem data";
    if (!(date instanceof Date)) {
        date = new Date(date.seconds ? date.seconds * 1000 : date);
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
        return `Hoje, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isYesterday) {
        return `Ontem, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

function showNoteView(noteId) {
    return openNote(noteId);
}

export { initNotes, renderNotes, showNoteView };
