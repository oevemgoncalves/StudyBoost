function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const arrow = document.getElementById('toggleArrow');

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
            window.innerWidth < 768 &&
            !sidebar.contains(e.target) &&
            e.target !== arrow &&
            !arrow.contains(e.target)
        ) {
            sidebar.classList.add('closed');
            updateToggleArrowIcon();
        }
    });
}

export { initSidebar };
