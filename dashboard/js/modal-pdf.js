function initModalPdf() {
    const modalPDF = document.getElementById('container__principal__modal__pdf');
    const openBtn = document.getElementById('abrirUploadModalBtn');
    const closeBtn = document.getElementById('closeUploadModalBtn');

    if (!modalPDF || !openBtn || !closeBtn) {
        console.warn('Algum elemento do modal PDF não foi encontrado.');
        return;
    }

    // Abrir o modal
    openBtn.addEventListener('click', () => {
        modalPDF.classList.remove('hidden');
        modalPDF.classList.add('active');
        document.body.classList.add('modal-open'); //trava scroll
    });

    // Fechar o modal
    closeBtn.addEventListener('click', () => {
        modalPDF.classList.remove('active');
        modalPDF.classList.add('hidden');
        document.body.classList.remove('modal-open'); //libera scroll
    });

    // Substitua o upload por extração de texto
    async function handleFileUpload(event) {
        const file = event.target.files[0];
        const text = "Texto extraído do PDF..."; // Use lib como pdf.js para extrair

        const note = await NoteService.createNote({
            title: file.name,
            content: text,
            folderId: "all"
        });

        alert("PDF convertido para nota textual!");
        closeModal();
    }
}

// Inicializa após carregar o DOM
window.addEventListener('DOMContentLoaded', initModalPdf);

export { initModalPdf };
