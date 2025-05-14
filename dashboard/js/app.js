// Main application file
import { initSidebar } from './sidebar.js';
import { initNotes } from './notes.js';
import { initFolders } from './folders.js';
import { initChatBot } from './chatbot.js';
import { store } from './store.js';

// Initialize the application
function initApp() {
    // Initialize app components
    initSidebar();
    initFolders();
    initNotes();
    initChatBot();
    
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
    store.addNote({
        id: 'note-1',
        title: 'Welcome to Feynman AI: Your Study and Work Companion',
        content: 'A powerful tool for transforming recordings and PDFs into organized notes using the Feynman technique.',
        folderId: 'all',
        createdAt: new Date('2024-11-09T15:08:00')
    });
    
    store.addNote({
        id: 'note-2',
        title: 'Como fazer anotações eficientes',
        content: 'Utilize o método Cornell para organizar suas anotações. Divida a página em seções para perguntas, notas e resumo.',
        folderId: 'all',
        createdAt: new Date('2024-11-07T10:15:00')
    });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export functions that might be needed by other modules
export { renderCurrentView };