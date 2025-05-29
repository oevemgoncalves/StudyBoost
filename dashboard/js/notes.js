// Gerenciamento de notas
import { store } from './store.js';

// elemento DOM
let notesContainer;

function initNotes() {
    // busca elemento DOM
    notesContainer = document.getElementById('notes-container');
    
    // Inscreva-se para receber alterações de notas
    store.subscribe('noteChange', renderNotes);
    store.subscribe('activeFolderChange', renderNotes);
    
    // Renderização inicial
    renderNotes();
}

function renderNotes() {
    const activeFolder = store.getActiveFolder();
    const notes = store.getNotesByFolder(activeFolder.id);
    
    // limpa o conteiner de notas
    notesContainer.innerHTML = '';
    
    if (notes.length === 0) {
        renderEmptyState();
        return;
    }
    
    // Adicione cada nota ao contêiner
    notes.forEach(note => {
        const noteEl = createNoteElement(note);
        notesContainer.appendChild(noteEl);
    });
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
    content.textContent = note.content;
    
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
    const emptyEl = document.createElement('div');
    emptyEl.className = 'empty-notes';
    
    const message = document.createElement('p');
    message.textContent = 'Nenhuma nota encontrada nesta pasta.';
    
    const createButton = document.createElement('button');
    createButton.textContent = 'Criar nova nota';
    createButton.addEventListener('click', createNewNote);
    
    emptyEl.appendChild(message);
    emptyEl.appendChild(createButton);
    
    notesContainer.appendChild(emptyEl);
}

// function openNote(noteId) {
//     const note = store.getNotes().find(n => n.id === noteId);
//     if (note) {
//         console.log('Opening note:', note);
//         // Em um aplicativo real, isso abriria um editor ou visualizador de notas
//         alert(`Nota aberta: ${note.title}`);
//     }
// }

// Modifique a função openNote
function openNote(noteId) {
    showNoteView(noteId);
    // Atualiza o botão ativo para "Notas"
    document.querySelector('.btn[data-target="notas"]').classList.add('active');
}

function createNewNote() {
    const activeFolder = store.getActiveFolder();
    const newNote = {
        title: 'Nova anotação',
        content: 'Clique para editar esta anotação.',
        folderId: activeFolder.id
    };
    
    const note = store.addNote(newNote);
    openNote(note.id);
}

function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
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
function showNoteView(noteId) {
    const note = store.getNotes().find(n => n.id === noteId);
    if (note) {
        // Atualiza o conteúdo da nota
        document.querySelector('#notas .container__nota__resumo').innerHTML = `
            <h1>${note.title}</h1>
            <p>${note.content}</p>
        `;
        
        // Mostra a view de nota e esconde o upload
        document.getElementById('noteContentContainer').classList.remove('hidden');
        document.querySelector('.nova-nota-section').classList.add('hidden');
    }
}

// Adicione esta função para voltar à visualização principal
function showMainView() {
    document.getElementById('noteContentContainer').classList.add('hidden');
    document.querySelector('.nova-nota-section').classList.remove('hidden');
}

// Modifique o event listener no app.js
document.getElementById('currentFolder').addEventListener('click', () => {
    showMainView();
});

export { initNotes, renderNotes, showNoteView };