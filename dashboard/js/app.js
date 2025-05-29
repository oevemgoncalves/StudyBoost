// Main application file
import { initSidebar } from './sidebar.js';
import { initNotes, showNoteView } from './notes.js';
import { initFolders } from './folders.js';
import { initChatBot } from './chatbot.js';
import { store } from './store.js';
import { initModalPdf } from './modal-pdf.js';
import { initCards } from './cards.js';

// Initialize the application
function initApp() {
    // Initialize app components
    initSidebar();
    initFolders();
    initNotes();
    initChatBot();
    initModalPdf();
    initCards();
    
    // Add some demo notes if there are none
    if (store.getNotes().length === 0) {
        addDemoNotes();
    }
    
    // Render initial state
    renderCurrentView();
    
    // Event delegation for the entire app
    document.addEventListener('click', handleAppClicks);
}

// Handle app-wide click events using event delegation
function handleAppClicks(event) {
    // We can add app-wide click handlers here if needed
}

// Render the current view based on active folder
function renderCurrentView() {
    const activeFolder = store.getActiveFolder();
    document.getElementById('currentFolder').textContent = activeFolder.name;
    
    // Update folder UI in sidebar
    const allFolders = document.querySelectorAll('.folder');
    allFolders.forEach(folder => {
        folder.classList.remove('active');
        const folderId = folder.getAttribute('data-id');
        if (folderId === activeFolder.id) {
            folder.classList.add('active');
            folder.querySelector('i').className = 'fa-regular fa-folder-open';
        } else {
            folder.querySelector('i').className = 'fa-regular fa-folder-closed';
        }
    });
}

// Add demo notes for initial state
function addDemoNotes() {

    const welcomeNote = {
        //id: 'note-1',
        title: 'Bem-vindo ao StudyBoost, a plataforma inteligente para seu aprendizado.',
        content: 'Uma ferramenta poderosa para transformar PDFs em notas organizadas usando a técnica de estudos.',
        folderId: 'all',
        createdAt: new Date('2024-11-07T10:15:00')
    }

    store.addNote(welcomeNote);

    //mostra a nota de boas-vindas inicilamente
    const notes = store.getNotes();
    if (notes.length > 0) {
        openNote(notes[0].id);
    }
}

function showMainView() {
    document.getElementById('noteContentContainer').classList.add('hidden');
    document.getElementById('notes-container').classList.remove('hidden');
    document.querySelector('.nova-nota-section').classList.remove('hidden');
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export functions that might be needed by other modules
export { renderCurrentView, showMainView };
