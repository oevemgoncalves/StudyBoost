// profile.js
import { auth } from '../../firebase-config.js';

export function initProfile() {
    // Cria o container do perfil
    const profileContainer = document.createElement('div');
    profileContainer.className = 'profile-container';
    
    // Cria a imagem do perfil (usando a primeira letra do nome)
    const profileImage = document.createElement('div');
    profileImage.className = 'profile-image';
    
    // Cria as informações do perfil
    const profileInfo = document.createElement('div');
    profileInfo.className = 'profile-info';
    
    const profileName = document.createElement('div');
    profileName.className = 'profile-name';
    
    const profileEmail = document.createElement('div');
    profileEmail.className = 'profile-email';
    
    // Cria o ícone de engrenagem
    const settingsIcon = document.createElement('div');
    settingsIcon.className = 'profile-settings';
    settingsIcon.innerHTML = '<i class="fa-solid fa-gear"></i>';
    
    // Monta a estrutura
    profileInfo.appendChild(profileName);
    profileInfo.appendChild(profileEmail);
    profileContainer.appendChild(profileImage);
    profileContainer.appendChild(profileInfo);
    profileContainer.appendChild(settingsIcon);
    
    // Adiciona o perfil ao DOM (você pode ajustar o seletor conforme necessário)
    const sidebar = document.querySelector('.sidebar');
    sidebar.appendChild(profileContainer);
    
    // Cria o modal do perfil
    const profileModal = document.createElement('div');
    profileModal.className = 'profile-modal';
    profileModal.innerHTML = `
        <div class="profile-modal-content">
            <div class="profile-modal-header">
                <h2>Meu Perfil</h2>
                <button class="profile-modal-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="profile-modal-body">
                <div class="profile-modal-user">
                    <div class="profile-modal-image" id="modalProfileImage"></div>
                    <div class="profile-modal-user-info">
                        <div class="profile-modal-name" id="modalProfileName"></div>
                        <div class="profile-modal-email" id="modalProfileEmail"></div>
                    </div>
                </div>
                <div class="profile-modal-actions">
                    <div class="profile-modal-action" id="logoutBtn">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i>
                        <span>Sair</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(profileModal);
    
    // Atualiza as informações do perfil
    function updateProfileInfo(user) {
        const displayName = user.displayName || user.email.split('@')[0];
        const firstLetter = displayName.charAt(0).toUpperCase();
        
        // Atualiza o perfil pequeno
        profileImage.textContent = firstLetter;
        profileName.textContent = displayName;
        profileEmail.textContent = user.email;
        
        // Atualiza o modal
        document.getElementById('modalProfileImage').textContent = firstLetter;
        document.getElementById('modalProfileName').textContent = displayName;
        document.getElementById('modalProfileEmail').textContent = user.email;
    }
    
    // Event listeners
    settingsIcon.addEventListener('click', () => {
        profileModal.classList.add('active');
    });
    
    profileModal.querySelector('.profile-modal-close').addEventListener('click', () => {
        profileModal.classList.remove('active');
    });
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = '../../login/login.html'; //atualize o caminho conforme necessário
        });
    });
    
    // Fecha o modal ao clicar fora
    profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            profileModal.classList.remove('active');
        }
    });
    
    // Observa mudanças no estado de autenticação
    auth.onAuthStateChanged((user) => {
        if (user) {
            updateProfileInfo(user);
        } else {
            window.location.href = '../../login/login.html'; // Redireciona para a página de login se não houver usuário autenticado
        }
    });
}