//seta da sidebar
const sidebar = document.querySelector('.sidebar');
const arrow = document.getElementById('toggleArrow');

function toggleSidebar() {
  sidebar.classList.toggle('open');

  arrow.innerHTML = sidebar.classList.contains('open')
    ? '<i class="fa-regular fa-square-caret-left"></i>'
    : '<i class="fa-regular fa-square-caret-right"></i>';
}

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

//crição da pasta
function criarPasta() {
    let folderName = document.getElementById("pastaNome").value;

    if (folderName.trim() === "") {
        alert("Por favor, insira um nome para a pasta");
        return;
    }

    let folder = document.createElement("div") //criando div
    folder.className = "folder"; //add classe a pasta

    let folderIcon = document.createElement("i");
    folderIcon.className = "fa-regular fa-folder-open";

    let folderTitle = document.createElement("span");
    folderTitle.textContent = folderName;

    folder.appendChild(folderIcon);
    folder.appendChild(folderTitle);
    document.getElementById("folder-container").appendChild(folder);

    //criando o conteúdo da pasta no main
    let folderContent = document.createElement("div");
    folderContent.className = "folder-content";
    folderContent.innerHTML = `<h3>${folderName}</h3><p>Adicionar Texto:</p> <textarea placeholder="Escreva alog..."></textarea>`;

    folder.addEventListener("click", function() {
        //atualizar o conteúdo no main trocar ícones
        document.getElementById("folder__content__container").innerHTML = folderContent.innerHTML;

        document.querySelectorAll(".folder i").forEach(icon => {icon.className = "fa-regular fa-folder-closed";});

        folderIcon.className = "fa-regular fa-folder-open";

    });

    //limpa o campo e fecha o moda
    document.getElementById("pastaNome").value = "";

    document.getElementById("folder__content__container").innerHTML = folderContent.innerHTML;

    console.log("Pasta criada:", folderName);
}
