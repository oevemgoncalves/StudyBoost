function novaPasta() {
    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.add('active');
    }, 10); // Pequeno delay para o transition funcionar
}

function fecharModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300); // Tempo igual ao transition de 0.3s
}

//seta da sidebar
const sidebar = document.querySelector('.sidebar');
const arrow = document.getElementById('toggleArrow');

function toggleSidebar() {
  sidebar.classList.toggle('open');

  arrow.innerHTML = sidebar.classList.contains('open')
    ? '<i class="fa-regular fa-square-caret-left"></i>'
    : '<i class="fa-regular fa-square-caret-right"></i>';
}

  