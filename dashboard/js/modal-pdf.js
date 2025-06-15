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
        if (pdfPreview) {
            if (pdfPreview.src) {
                URL.revokeObjectURL(pdfPreview.src);
            }
            pdfPreview.src = '';
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

            const cloudinaryData = await cloudinaryResponse.json();

            if (!cloudinaryData.secure_url) {
                throw new Error("Não foi possível obter a URL do PDF do Cloudinary.");
            }

            const pdfUrl = cloudinaryData.secure_url;
            console.log("📤 PDF enviado para Cloudinary:", pdfUrl);

            // 2. Chamada para o back-end com a URL do PDF
            const resumoRes = await fetch("https://studyboost-backend.onrender.com/gerar-resumo", {
                method: "POST",
                //mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ pdf_url: pdfUrl })
            });

            console.log("Status da resposta:", resumoRes.status);
            let resumoData;

            if (!resumoRes.ok) {
                const erroTexto = await resumoRes.text();
                throw new Error(`Erro HTTP ${resumoRes.status}: ${erroTexto}`);
            }

            try {
                resumoData = await resumoRes.json();
                console.log("✅ Resumo recebido da IA:", resumoData);
            } catch (jsonErr) {
                const textoBruto = await resumoRes.text();
                console.error("❌ Erro ao converter para JSON:", jsonErr);
                console.log("⚠️ Conteúdo bruto da resposta:", textoBruto);
                throw new Error("Erro ao interpretar resposta da IA");
            }

            console.log("Resumo recebido da IA:", resumoData);

            // Agora... Vamos gerar Flashcards e Quiz com base no resumo
            let flashcards = [];
            let quiz = [];

            try {
                const flashQuizRes = await fetch("https://studyboost-backend.onrender.com/gerar-flashcards-e-quiz", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ resumo: resumoData.resumo })
                });

                if (!flashQuizRes.ok) {
                    throw new Error(`Erro HTTP ao gerar Flashcards e Quiz: ${flashQuizRes.status}`);
                }

                const flashQuizData = await flashQuizRes.json();
                console.log("✅ Flashcards e Quiz gerados:", flashQuizData);

                flashcards = flashQuizData.flashcards;
                quiz = flashQuizData.quiz;

            } catch (error) {
                console.error("❌ Erro ao gerar Flashcards e Quiz:", error);
                alert("Falha ao gerar Flashcards e Quiz. A nota será salva apenas com o resumo.");
            }

            // Agora cria a nota no Firebase com flashcards e quiz inclusos
            const note = {
                title: file.name.replace(/\.pdf$/i, ''),
                content: resumoData.resumo,
                folderId: activeFolderId,
                pdfUrl: pdfUrl,
                createdAt: new Date(),
                isPdf: true,
                isWelcome: false,
                flashcards: flashcards,
                quiz: quiz
            };

            await createNote(currentUserUid, note);
            closeBtn.click();
            renderNotes();


        } catch (err) {
            console.error("❌ Erro ao processar PDF:", err);

            if (err instanceof SyntaxError) {
                console.log("🔎 Isso parece um erro de JSON.parse()");
            } else if (err instanceof TypeError) {
                console.log("🚫 Erro de conexão com o back-end (fetch falhou?)");
            }

            alert("Erro: " + (err.message || err.toString() || "Erro desconhecido"));

        } finally {
            gerarNotaBtn.disabled = false;
            gerarNotaBtn.textContent = 'Gerar Nota';
        }


    });
}

//}

export { initModalPdf };