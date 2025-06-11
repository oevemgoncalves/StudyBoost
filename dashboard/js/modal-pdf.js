// modal-pdf.js
import { createNote } from '../../firebase-service.js';
import { activeFolderId, currentUserUid } from './folders.js';
import { renderNotes } from './notes.js';
//import { uploadPdfToCloudinary } from '../../upload-service.js';

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
    const pdfActions = document.getElementById('pdfActions');
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

    //Fechar o modal
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
        resetFileInput();
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

        gerarNotaBtn.disabled = true;
        gerarNotaBtn.textContent = 'Processando...';

        try {
            // 1. Upload para Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'pdf_unsigned');

            const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/dyqp5onvs/raw/upload', {
                method: 'POST',
                body: formData
            });

            if (!cloudinaryResponse.ok) {
                throw new Error('Falha no upload para Cloudinary');
            }

            const cloudinaryData = await cloudinaryResponse.json();
            const pdfUrl = cloudinaryData.secure_url;
            console.log("PDF enviado com sucesso:", pdfUrl);

            // 2. Chamar o backend para gerar resumo com IA
            const resumoRes = await fetch("http://127.0.0.1:8000/gerar-resumo", {
                method: "POST",
                mode: "cors",  // Adicione esta linha
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"  // Adicione esta linha
                },
                body: JSON.stringify({ pdf_url: pdfUrl })
            });

            console.log("Resposta recebida:", resumoRes);
            if (!resumoRes.ok) {
                const errorText = await resumoRes.text();
                console.error("Erro detalhado:", errorText);
                throw new Error(`Erro ${resumoRes.status}: ${errorText}`);
            }

            const resumoData = await resumoRes.json();

            // 3. Criar nota no Firebase
            const note = {
                title: file.name.replace(/\.pdf$/i, ''),
                content: resumoData.resumo,
                folderId: activeFolderId,
                pdfUrl: pdfUrl,
                createdAt: new Date(),
                isPdf: true
            };

            await createNote(currentUserUid, note);

            // 4. Fechar modal e atualizar a lista de notas
            closeBtn.click();
            renderNotes(); // Atualiza a lista de notas

        } catch (err) {
            console.error('Erro ao processar PDF:', err);
            alert('Erro: ' + (err.message || 'Ocorreu um erro ao processar o PDF'));
        } finally {
            gerarNotaBtn.disabled = false;
            gerarNotaBtn.textContent = 'Gerar Nota';
        }
    });
}

//}

export { initModalPdf };
