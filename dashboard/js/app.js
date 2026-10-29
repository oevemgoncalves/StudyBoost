// Main application file
import { initSidebar } from './sidebar.js';
import { initNotes, renderNotes } from './notes.js';
import { initFolders, getFolderNameById, activeFolderId } from './folders.js';
import { initChatBot } from './chatbot.js';
import { initModalPdf } from './modal-pdf.js';
import { initCards, initFlashcards, nextQuestion, resetQuiz, shuffleQuestions } from './cards.js';
import { initProfile } from './profile.js';
import { auth } from '../../firebase-config.js';

let currentUserUid = null;

// Initialize the application
async function initApp() {
    // Espera pela autenticação
    currentUserUid = await getCurrentUserUid();

    if (!currentUserUid) {
        console.warn("Usuário não autenticado. Redirecionando para o login...");
        window.location.href = '../login/login.html';
        return;
    }

    // Initialize app components
    initSidebar();
    initNotes();
    initChatBot();
    initModalPdf();
    initCards();
    initFlashcards();
    initProfile();

    await initFolders(currentUserUid);

    // Render initial state
    await renderCurrentView();
    await showMainView();

    // Conectar botões de controle do Quiz
    const nextBtn = document.getElementById("nextBtn");
    const resetBtn = document.getElementById("resetBtn");
    const shuffleBtn = document.getElementById("shuffleBtn");

    if (nextBtn) nextBtn.addEventListener("click", nextQuestion);
    if (resetBtn) resetBtn.addEventListener("click", resetQuiz);
    if (shuffleBtn) shuffleBtn.addEventListener("click", shuffleQuestions);
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
    const activeName = activeFolderId === 'all'
        ? 'Todas as Notas'
        : await getFolderNameById(activeFolderId);

    const currentFolderBtn = document.getElementById('currentFolder');
    if (currentFolderBtn) {
        currentFolderBtn.textContent = activeName || 'Todas as Notas';
    }

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

async function showMainView() {
    const noteContentContainer = document.getElementById('noteContentContainer');
    const notesContainer = document.getElementById('notes-container');
    const novaNotaSection = document.querySelector('.nova-nota-section');

    if (noteContentContainer) noteContentContainer.classList.add('hidden');
    if (notesContainer) notesContainer.classList.remove('hidden');
    if (novaNotaSection) novaNotaSection.classList.remove('hidden');

    initNotes();
    await renderNotes();

    document.querySelectorAll('.container__nota').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.botoes .btn').forEach(btn => btn.classList.remove('notaActive'));
    const notasBtn = document.querySelector('.btn[data-target="notas"]');
    if (notasBtn) notasBtn.classList.add('notaActive');
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export functions that might be needed by other modules
export { renderCurrentView, showMainView };
