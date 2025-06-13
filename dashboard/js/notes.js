// Gerenciamento de notas
//import { store } from './store.js';
import { getNotes, createNote, getNoteById, deleteNote as deleteNoteFirebase } from '../../firebase-service.js';
//import { currentUserUid } from './folders.js'; // exporte ela se ainda não estiver
import { showMainView } from './app.js';
import { activeFolderId, currentUserUid } from './folders.js';

// elemento DOM
let notesContainer;
let currentOpenedNote = null; //variavel global

function initNotes() {
    notesContainer = document.getElementById('notes-container');
    if (!notesContainer) {
        console.error('Elemento notes-container não encontrado no DOM');
        return false;
    }
    return true;
}

async function renderNotes() {
    if (!currentUserUid || !activeFolderId) {
        console.warn("⚠️ renderNotes não continuará porque currentUserUid ou activeFolderId está indefinido.");
        return;
    }

    if (!notesContainer) {
        console.error('notesContainer não inicializado - chamar initNotes() primeiro');
        return;
    }

    if (!currentUserUid) {
        console.log("Aguardando autenticação para renderizar notas...");
        return;
    }

    console.log("🔥 renderNotes foi chamado com:", {
        currentUserUid,
        activeFolderId
    });

    try {
        notesContainer.classList.remove('hidden'); // Mostra container se estiver oculto
        notesContainer.innerHTML = ''; // Limpa o container antes de renderizar novas notas
    } catch (error) {
        console.error('Erro ao renderizar notas:', error);
    }
    if (!activeFolderId || !currentUserUid) return;

    console.log("🔄 Buscando notas da pasta:", activeFolderId);

    let notes = [];

    if (activeFolderId === 'all') {
        notes = await getNotes(currentUserUid); // ← Busca todas
    } else {
        notes = await getNotes(currentUserUid, activeFolderId); // ← Busca por pasta
    }

    if (notes.length === 0) {
        renderEmptyState();
        return;
    }

    // Adicione cada nota ao contêiner
    notes.forEach(note => {
        const noteEl = createNoteElement(note);
        notesContainer.appendChild(noteEl);
        console.log("📄 Criando nota:", note.title);
    });
    if (notes.length === 0) {
        console.log("📭 Nenhuma nota encontrada.");
        notesContainer.innerHTML = "<p style='color: red;'>Nenhuma nota encontrada nessa pasta.</p>";
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

     // Mostra o início do resumo para notas PDF
    content.className = 'note-content';

    if (note.isWelcome) {
        content.textContent = 'Transforme PDFs em resumos, flashcards, quizzes e Aúdios com IA.';
    } else {
        content.innerHTML = note.content; // Exibe todo o conteúdo do resumo, com formatação HTML
    }

    const footer = document.createElement('div');
    footer.className = 'note-footer';

    const actions = document.createElement('div');
    actions.className = 'note-actions';

    const addToFolder = document.createElement('button');
    addToFolder.innerHTML = '<i class="fa-regular fa-folder"></i> Adicionar pasta';
    addToFolder.addEventListener('click', (e) => {
        e.stopPropagation();
        // A funcionalidade Adicionar à pasta ficar aqui
    });

    const copyText = document.createElement('button');
    copyText.innerHTML = '<i class="fa-regular fa-copy"></i> Copiar texto';
    copyText.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(note.content);
    });

    const date = document.createElement('div');
    date.className = 'note-date';
    date.textContent = formatDate(note.createdAt);
    // novo. excluir nota
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Excluir';
    deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja excluir esta nota permanentemente?')) {
            await store.deleteNote(note.id);
            await renderNotes();
            if (note.isPdf) {
                // Se for um PDF, também excluir do Storage
                await PdfService.deletePdf(note.pdfId, note.pdfPath);
            }
        }
    });

    // Adicione o botão às ações
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

// Modifique a função openNote
async function openNote(noteId) {
    try {
        const note = await getNoteById(currentUserUid, noteId);
        if (!note) {
            alert("Nota não encontrada!");
            return;
        }

        currentOpenedNote = note; //armazena a nota aberta

        const resumoContainer = document.querySelector('#notas .container__nota__resumo');
        if (resumoContainer) {
            resumoContainer.innerHTML = `
                <h1>${note.title}</h1>
                <div>${note.content}</div>
            `;
        }

        // Atualização segura da UI
        document.getElementById('noteContentContainer')?.classList.remove('hidden');
        document.querySelector('.nova-nota-section')?.classList.add('hidden');
        document.getElementById('notes-container')?.classList.add('hidden');

        document.querySelectorAll(".container__nota").forEach(sec => sec.classList.add("hidden"));
        document.getElementById("notas")?.classList.remove("hidden");

        document.querySelectorAll(".btn").forEach(btn => btn.classList.remove("notaActive"));
        document.querySelector('.btn[data-target="notas"]')?.classList.add("notaActive");
    } catch (error) {
        console.error('Erro ao abrir nota:', error);
        alert("Erro ao carregar a nota");
    }
}

async function createNewNote() {
  if (!activeFolderId || !currentUserUid) return;

  const newNote = {
    title: 'Nova anotação',
    content: 'Clique para editar esta anotação.',
    folderId: activeFolderId
  };

  try {
    const note = await createNote(currentUserUid, newNote);
    //renderNotes(); // recarrega as notas na tela
  } catch (err) {
    console.error("Erro ao criar nova nota:", err);
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

// Adicione esta função para mostrar a view de nota

//novo
function showNoteView(noteId) {
    const note = store.getNotes().find(n => n.id === noteId);
    if (note) {
        // Atualiza o conteúdo da nota
        document.querySelector('#notas .container__nota__resumo').innerHTML = `
            <h1>${note.title}</h1>
            <p>${note.content}</p>
        `;

        // Mostra o container principal
        document.getElementById('noteContentContainer').classList.remove('hidden');
        document.querySelector('.nova-nota-section').classList.add('hidden');
        document.getElementById('notes-container').classList.add('hidden');

        // 👇 Corrige: mostra seção "Notas" e oculta as outras
        document.querySelectorAll(".container__nota").forEach(sec => sec.classList.add("hidden"));
        document.getElementById("notas").classList.remove("hidden");

        // Atualiza botões
        document.querySelectorAll(".btn").forEach(btn => btn.classList.remove("notaActive"));
        document.querySelector('.btn[data-target="notas"]').classList.add("notaActive");
    }
}

// Modifique o event listener no app.js
document.getElementById('currentFolder').addEventListener('click', () => {
    showMainView();
});

export function getCurrentOpenedNote() {    
    return currentOpenedNote;
}

export { initNotes, renderNotes, showNoteView };