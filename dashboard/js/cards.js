//botoes de resumo...troca de tela
function initCards() {
    document.querySelectorAll(".btn").forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove 'notaActive' dos outros botões
            document.querySelectorAll(".btn").forEach(b => b.classList.remove("notaActive"));
            btn.classList.add("notaActive");

            // Esconde todas as seções
            document.querySelectorAll(".container__nota").forEach(sec => sec.classList.add("hidden"));

            // Mostra a seção correspondente
            const target = btn.getAttribute("data-target");
            document.getElementById(target).classList.remove("hidden");
        });
    });
}

export { initCards };