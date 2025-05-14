// Note management
import { store } from './store.js';

// DOM elements
let notesContainer;

function initNotes() {
    // Get DOM elements
    notesContainer = document.getElementById('notes-container');
    
    // Subscribe to note changes
    store.subscribe('noteChange', renderNotes);
    store.subscribe('activeFolderChange', renderNotes);
    
    // Initial render
    renderNotes();
}

function renderNotes() {
    const activeFolder = store.getActiveFolder();
    const notes = store.getNotesByFolder(activeFolder.id);
    
    // Clear notes container
    notesContainer.innerHTML = '';
    
    if (notes.length === 0) {
        renderEmptyState();
        return;
    }
    
    // Add each note to the container
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
        // Add to folder functionality would go here
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
    
    // Add click event to open the note
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

function openNote(noteId) {
    const note = store.getNotes().find(n => n.id === noteId);
    if (note) {
        console.log('Opening note:', note);
        // In a real app, this would open a note editor or viewer
        alert(`Nota aberta: ${note.title}`);
    }
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

export { initNotes, renderNotes };