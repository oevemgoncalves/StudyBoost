//troca de imgagens para mobile
function inverterImagens() {
    let larguraTela = window.innerWidth;
    let divLivros = document.getElementById("imglivros"); // Seleciona a div com a imagem de livros
    let divLendo = document.getElementById("imglendo"); // Seleciona a div com a imagem de estudante lendo
    let sectionHero = document.querySelector(".hero"); // Seção original da imagem de livros
    let section2 = document.getElementById("section2"); // Seção onde a divLivros será movida
    let divConteudoHero = document.querySelector(".hero__conteudo"); // Conteúdo dentro da section.hero
    let divConteudoSection2 = document.querySelector(".conteiner__conteudo"); // Conteúdo dentro da section2

    if (larguraTela <= 768) {
        // Move imgLivros para section2 abaixo de divConteudoSection2
        if (!section2.contains(divLivros)) {
            section2.appendChild(divLivros);
        }

        // Move imgLendo para hero, abaixo do conteúdo .hero__conteudo
        if (!sectionHero.contains(divLendo)) {
            divConteudoHero.insertAdjacentElement("afterend", divLendo);
        }
    } else {
        // Retorna os elementos para a posição original no desktop
        if (!sectionHero.contains(divLivros)) {
            sectionHero.appendChild(divLivros);
        }
        if (!section2.contains(divLendo)) {
            section2.insertBefore(divLendo, section2.firstChild);
        }
    }
}

// Executa ao carregar e ao redimensionar a tela
window.addEventListener("load", inverterImagens);
window.addEventListener("resize", inverterImagens);

