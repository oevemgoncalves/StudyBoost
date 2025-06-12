// Main application file
import { getFolders } from '../../firebase-service.js';
import { initSidebar } from './sidebar.js';
import { initNotes, renderNotes } from './notes.js';
import { initFolders, getFolderNameById } from './folders.js';
import { initChatBot } from './chatbot.js';
import { initModalPdf } from './modal-pdf.js';
import { initCards, initFlashcards, renderQuestion, nextQuestion, resetQuiz, shuffleQuestions } from './cards.js';
import { initProfile } from './profile.js';
import { auth } from '../../firebase-config.js';

let currentUserUid = null

// Initialize the application
async function initApp() {
    // Espera pela autenticação
    currentUserUid = await getCurrentUserUid();
    
    if (!currentUserUid) {
        console.error("Usuário não autenticado");
        return;
    }

     // Initialize app components
    initSidebar();
    await initFolders(); // Agora é async
    initNotes();
    initChatBot();
    initModalPdf();
    initCards();
    initFlashcards();
    initProfile();

    // Render initial state
    await renderCurrentView();

    // Event delegation for the entire app
    

    // Conectar botões NOVOS
    document.getElementById("nextBtn").addEventListener("click", nextQuestion);
    document.getElementById("resetBtn").addEventListener("click", resetQuiz);
    document.getElementById("shuffleBtn").addEventListener("click", shuffleQuestions);

}

// Helper function para obter o UID do usuário
function getCurrentUserUid() {
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe(); // Para de escutar após o primeiro evento
            resolve(user ? user.uid : null);
        });
    });
}

// Render the current view based on active folder
async function renderCurrentView() {
    const activeFolderId = 'all'; // Ou obtenha de onde você armazena isso
    const activeName = activeFolderId === 'all' ? 'Todas as Pastas' : await getFolderNameById(activeFolderId);
    document.getElementById('currentFolder').textContent = activeName || 'Carregando...';

    // Atualiza a UI visual da sidebar
    const allFolders = document.querySelectorAll('.folder');
    allFolders.forEach(folder => {
        const folderId = folder.getAttribute('data-id');
        const isActive = folderId === activeFolderId;

        folder.classList.toggle('active', isActive);
        const icon = folder.querySelector('i');
        if (icon) {
            icon.className = isActive ? 'fa-regular fa-folder-open' : 'fa-regular fa-folder-closed';
        }
    });
}

function showMainView() {
    document.getElementById('noteContentContainer').classList.add('hidden');
    document.getElementById('notes-container').classList.remove('hidden');
    document.querySelector('.nova-nota-section').classList.remove('hidden');

    if (!window.notesContainer) {
        initNotes(); // se não foi inicializado ainda
    }

    renderNotes();

    document.querySelectorAll('.container__nota').forEach(el => el.classList.add('hidden'));
    document.querySelector('.btn[data-target="notas"]').classList.add('notaActive');

}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export functions that might be needed by other modules
export { renderCurrentView, showMainView }
