// modal-pdf.js
import { createNote } from '../../firebase-service.js';
import { activeFolderId, currentUserUid } from './folders.js';
import { uploadPdfToCloudinary } from '../../upload-service.js';

function initModalPdf() {
    const modalPDF = document.getElementById('container__principal__modal__pdf');
    const openBtn = document.getElementById('abrirUploadModalBtn');
    const closeBtn = document.getElementById('closeUploadModalBtn');
    const fileInput = document.getElementById('fileInput');
    const gerarNotaBtn = document.getElementById('btnGerarNota');
    const pdfPreviewContainer = document.getElementById('pdfPreviewContainer');
    const pdfPreview = document.getElementById('pdfPreview');
    const removePdfBtn = document.getElementById('removePdfBtn');
    const viewPdfBtn = document.getElementById('viewPdfBtn');
    const uploadArea = document.getElementById('uploadArea');
    const uploadText = document.getElementById('uploadText');
    const modalContainer = document.querySelector('.container__modal-pdf');
    let selectedFile = null;
    


    if (!modalPDF || !openBtn || !closeBtn || !fileInput || !gerarNotaBtn) {
        console.warn('Algum elemento do modal PDF não foi encontrado.');
        return;
    }

    // Abrir o modal
    openBtn.addEventListener('click', () => {
        modalPDF.classList.remove('hidden');
        modalPDF.classList.add('active');
        document.body.classList.add('modal-open');
    });

    // Fechar o modal
    closeBtn.addEventListener('click', () => {
        resetFileInput();
        modalPDF.classList.remove('active');
        modalPDF.classList.add('hidden');
        document.body.classList.remove('modal-open');
    });

    // Função para limpar seleção
    function resetFileInput() {
        fileInput.value = '';
        pdfActions.classList.add('hidden');
        selectedFile = null;
        enableUploadArea();
        modalContainer.classList.remove('pdf-selected'); // Remove classe para diminuir o modal
    }

    // Modifique o event listener do fileInput
    fileInput.addEventListener('change', (e) => {
        selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            pdfActions.classList.remove('hidden');
            disableUploadArea();
            modalContainer.classList.add('pdf-selected'); // Adiciona classe para aumentar o modal
        } else {
            alert('Por favor, selecione um arquivo PDF válido.');
            resetFileInput();
        }
    });

    // Visualizar PDF em nova guia
    viewPdfBtn.addEventListener('click', () => {
        if (selectedFile) {
            const fileURL = URL.createObjectURL(selectedFile);
            window.open(fileURL, '_blank');
            // Libera a memória depois de um tempo (opcional)
            setTimeout(() => URL.revokeObjectURL(fileURL), 1000);
        }
    });

    // Remover PDF
    removePdfBtn.addEventListener('click', () => {
        resetFileInput();
    });

    // Atualize também o fechamento do modal
    closeBtn.addEventListener('click', () => {
        if (pdfPreview.src) {
            URL.revokeObjectURL(pdfPreview.src);
        }
        fileInput.value = '';
        pdfPreview.src = '';
        pdfPreviewContainer.classList.add('hidden');
        viewPdfBtn.classList.add('hidden');
        selectedFile = null;
        modalPDF.classList.remove('active');
        modalPDF.classList.add('hidden');
        document.body.classList.remove('modal-open');
    });

    // Função para desativar a área de upload
    function disableUploadArea() {
        uploadArea.classList.add('disabled');
        uploadText.textContent = "PDF selecionado"; // Altera o texto
    }

    // Função para reativar a área de upload
    function enableUploadArea() {
        uploadArea.classList.remove('disabled');
        uploadText.textContent = "Clique para selecionar seu arquivo PDF"; // Volta ao texto original
    }

    // Quando o botão "Gerar Nota" for clicado
    gerarNotaBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) {
            alert('Selecione um arquivo PDF primeiro.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'pdf_unsigned');
        //formData.append('resource_type', 'raw');

        const cloudRes = await fetch('https://api.cloudinary.com/v1_1/dyqp5onvs/raw/upload',)

        // Substitua o bloco try-catch por:
        try {
            const { url } = await uploadPdfToCloudinary(file);

            const note = {
                title: file.name.replace(/\.pdf$/i, ''),
                content: `PDF disponível em: ${url}`,
                folderId: activeFolderId,
                pdfUrl: url,
                pdfPublicId: data.public_id,
                createdAt: new Date(),
                isPdf: true
            };

            await createNote(currentUserUid, note);
            alert("PDF enviado e nota criada!");
            
            fileInput.value = '';
            closeBtn.click();
        } catch (err) {
            console.error('Erro ao fazer upload do PDF:', err);
            alert('Erro ao fazer upload: ' + err.message);
        }
    });
}

export { initModalPdf };
