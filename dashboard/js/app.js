// Main application file
import { getFolders } from '../../firebase-service.js';
import { initSidebar } from './sidebar.js';
import { initNotes, renderNotes, showNoteView } from './notes.js';
import { initFolders, activeFolderId, currentUserUid, getFolderNameById } from './folders.js';
import { initChatBot } from './chatbot.js';
import { store } from './store.js';
import { initModalPdf } from './modal-pdf.js';
import { initCards, initFlashcards, renderQuestion, nextQuestion, resetQuiz, shuffleQuestions } from './cards.js';
import { initProfile } from './profile.js'; 

// Initialize the application
function initApp() {
    // Initialize app components
    initSidebar();
    initFolders();
    initNotes();
    initChatBot();
    initModalPdf();
    initCards();
    initFlashcards();
    initProfile();

    // Add some demo notes if there are none
    if (store.getNotes().length === 0) {
        addDemoNotes();
    }

    // Render initial state
    renderCurrentView();

    // Event delegation for the entire app
    document.addEventListener('click', handleAppClicks);

    // Conectar botões NOVOS
    document.getElementById("nextBtn").addEventListener("click", nextQuestion);
    document.getElementById("resetBtn").addEventListener("click", resetQuiz);
    document.getElementById("shuffleBtn").addEventListener("click", shuffleQuestions);

}

// Handle app-wide click events using event delegation
function handleAppClicks(event) {
    // We can add app-wide click handlers here if needed
}

// Render the current view based on active folder
async function renderCurrentView() {
     // Atualiza o nome da pasta atual no topo
    const activeName = activeFolderId === 'all' ? 'Todas as Pastas' : await getFolderNameById(activeFolderId);
    document.getElementById('currentFolder').textContent = activeName;

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

// Add demo notes for initial state
function addDemoNotes() {
    const welcomeNote = {
        title: 'Bem-vindo ao StudyBoost, a plataforma inteligente para seu aprendizado.',
        content: `
        <p>Transforme PDFs em resumos, flashcards, quizzes e Aúdios com IA.</p>
        <br />

        <h2>Bem-vindo ao StudyBoost seu companheiro de estudo </h2>
        <p><strong>StudyBoost</strong> é uma plataforma inovadora que utiliza tecnologia avançada de <strong>Inteligência Artificial</strong> para transformar PDFs em <strong>resumos inteligentes</strong>, <strong>flashcards</strong> e <strong>quizzes interativos</strong>. Ideal para estudantes e profissionais, o StudyBoost organiza o conteúdo em pastas personalizadas e torna o aprendizado mais eficiente, dinâmico e acessível.</p>

        <br />

        <h2>Principais Características</h2>

        <ul>
            <li><strong>Resumos Inteligentes</strong>: Converta PDFs automaticamente em resumos claros e objetivos, focados 
            nos pontos-chave.</li>

            <li><strong>Quizzes e Flashcards</strong>: Crie quizzes e flashcards instantaneamente com base no PDF.</li>

            <li><strong>Organização em Pastas</strong>: Armazene materiais em pastas personalizadas.</li>

            <li><strong>Painel Interativo</strong>: Acesse rapidamente seus arquivos e progresso.</li>

            <li><strong>Experiência Multiplataforma</strong>: Use o StudyBoost em qualquer dispositivo com sincronização automática.</li>

            <li><strong>Design Intuitivo</strong>: Interface moderna e fácil de usar.</li>
        </ul>

        <br />

        <h2>Conclusão</h2>

        <p><strong>StudyBoost</strong> revoluciona a forma de estudar, oferecendo uma experiência <strong>personalizada, automatizada e intuitiva</strong>. Com ele, transformar PDFs em ferramentas práticas de aprendizado é simples, rápido e eficaz.</p>

        <br />

        <h3>Recomendação</h3>

        <p>Se você quer otimizar seus estudos e ter tudo em um só lugar, o <strong>StudyBoost</strong> é sua melhor escolha. Aproveite o poder da IA para turbinar seu aprendizado!</p>
        `,
        folderId: 'all',
        createdAt: new Date('2024-11-07T10:15:00'),
        isWelcome: true
    };

    store.addNote(welcomeNote);

    const notes = store.getNotes();
    if (notes.length > 0) {
        openNote(notes[0].id);
    }
}


function showMainView() {
    document.getElementById('noteContentContainer').classList.add('hidden');
    document.getElementById('notes-container').classList.remove('hidden');
    document.querySelector('.nova-nota-section').classList.remove('hidden');

    renderNotes();

    document.querySelectorAll('.container__nota').forEach(el => el.classList.add('hidden'));
    document.querySelector('.btn[data-target="notas"]').classList.add('notaActive');

}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export functions that might be needed by other modules
export { renderCurrentView, showMainView };
