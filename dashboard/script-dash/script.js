function novaPasta() {
    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open'); // <-- trava o scroll

    setTimeout(() => {
        modal.classList.add('active');
        document.getElementById('nomePasta').focus();
    }, 10); // Pequeno delay para o transition funcionar
}

function fecharModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    document.body.classList.remove('modal-open') // <-- destrava o scroll

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