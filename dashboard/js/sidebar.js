import { showMainView } from './app.js';

function closeSidebarOnMobile() {
    const sidebar = document.querySelector('.sidebar');
    const arrow = document.getElementById('toggleArrow');
    if (sidebar && window.innerWidth <= 768) {
        sidebar.classList.remove('open');
        if (arrow) {
            arrow.innerHTML = '<i class="fa-regular fa-square-caret-right"></i>';
        }
    }
}

function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const arrow = document.getElementById('toggleArrow');

    if (!sidebar || !arrow) return;

    function toggleSidebar() {
        sidebar.classList.toggle('open');
        updateToggleArrowIcon();
    }

    function updateToggleArrowIcon() {
        arrow.innerHTML = sidebar.classList.contains('open') ?
            '<i class="fa-regular fa-square-caret-left"></i>' :
            '<i class="fa-regular fa-square-caret-right"></i>';
    }

    // Adiciona o evento de clique ao botão da seta
    arrow.addEventListener('click', toggleSidebar);

    // Fecha a sidebar ao clicar fora (em telas pequenas)
    document.addEventListener('click', (e) => {
        if (
            window.innerWidth <= 768 &&
            sidebar.classList.contains('open') &&
            !sidebar.contains(e.target) &&
            e.target !== arrow &&
            !arrow.contains(e.target)
        ) {
            sidebar.classList.remove('open');
            updateToggleArrowIcon();
        }
    });

    // Evento para a pasta fixa
    const pastaFixa = document.getElementById('pasta-fixa');
    if (pastaFixa) {
        pastaFixa.addEventListener('click', () => {
            closeSidebarOnMobile();
        });
    }
}

// Exporte a função
export { initSidebar, closeSidebarOnMobile };
