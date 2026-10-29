// modal-pdf.js
import { createNote } from '../../firebase-service.js';
import { activeFolderId, currentUserUid } from './folders.js';
import { renderNotes } from './notes.js';

const RENDER_API_URL = "https://studyboost-backend.onrender.com";
const LOCAL_API_URL = "http://127.0.0.1:8000";

async function fetchBackend(endpoint, options) {
    const isLocalhost = ["127.0.0.1", "localhost"].includes(window.location.hostname);
    if (isLocalhost) {
        try {
            return await fetch(`${LOCAL_API_URL}${endpoint}`, options);
        } catch (err) {
            console.info("Back-end local não detectado na porta 8000, usando servidor Render...");
        }
    }
    return await fetch(`${RENDER_API_URL}${endpoint}`, options);
}

let modalPdfInitialized = false;

function initModalPdf() {
    if (modalPdfInitialized) return;
    modalPdfInitialized = true;

    const modalPDF = document.getElementById('container__principal__modal__pdf');
    const openBtn = document.getElementById('abrirUploadModalBtn');
    const closeBtn = document.getElementById('closeUploadModalBtn');
    const fileInput = document.getElementById('fileInput');
    const gerarNotaBtn = document.getElementById('btnGerarNota');
    const removePdfBtn = document.getElementById('removePdfBtn');
    const viewPdfBtn = document.getElementById('viewPdfBtn');
    const uploadArea = document.getElementById('uploadArea');
    const uploadText = document.getElementById('uploadText');
    const modalContainer = document.querySelector('.container__modal-pdf');
    const pdfActions = document.getElementById('pdfActions');
    let selectedFile = null;
    let isProcessing = false;

    if (!modalPDF || !openBtn || !closeBtn || !fileInput || !gerarNotaBtn) {
        console.warn('Algum elemento do modal PDF não foi encontrado.');
        return;
    }

    // Função para limpar seleção
    function resetFileInput() {
        fileInput.value = '';
        if (pdfActions) pdfActions.classList.add('hidden');
        selectedFile = null;
        enableUploadArea();
        if (modalContainer) modalContainer.classList.remove('pdf-selected');
    }

    function openUploadModal() {
        modalPDF.classList.remove('hidden');
        document.body.classList.add('modal-open');
        setTimeout(() => {
            modalPDF.classList.add('active');
        }, 10);
    }

    function closeUploadModal() {
        if (isProcessing) return;
        resetFileInput();
        modalPDF.classList.remove('active');
        document.body.classList.remove('modal-open');
        setTimeout(() => {
            modalPDF.classList.add('hidden');
        }, 300);
    }

    // Abrir o modal
    openBtn.addEventListener('click', openUploadModal);

    // Fechar o modal
    closeBtn.addEventListener('click', closeUploadModal);

    // Fechar ao clicar fora do modal
    modalPDF.addEventListener('click', (e) => {
        if (e.target === modalPDF) {
            closeUploadModal();
        }
    });

    function handleSelectedFile(file) {
        if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
            selectedFile = file;
            if (pdfActions) pdfActions.classList.remove('hidden');
            disableUploadArea(file.name);
            if (modalContainer) modalContainer.classList.add('pdf-selected');
        } else {
            alert('Por favor, selecione um arquivo PDF válido.');
            resetFileInput();
        }
    }

    // Seleção via input de arquivo
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleSelectedFile(file);
        }
    });

    // Suporte a Drag & Drop na área de upload
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!selectedFile) {
                uploadArea.style.borderColor = '#3b82f6';
                uploadArea.style.backgroundColor = '#eff6ff';
            }
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            uploadArea.style.backgroundColor = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            uploadArea.style.backgroundColor = '';
            if (selectedFile) return;

            const droppedFile = e.dataTransfer?.files?.[0];
            if (droppedFile) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(droppedFile);
                fileInput.files = dataTransfer.files;
                handleSelectedFile(droppedFile);
            }
        });
    }

    // Visualizar PDF em nova guia
    if (viewPdfBtn) {
        viewPdfBtn.addEventListener('click', () => {
            if (selectedFile) {
                const fileURL = URL.createObjectURL(selectedFile);
                window.open(fileURL, '_blank');
                setTimeout(() => URL.revokeObjectURL(fileURL), 60000);
            }
        });
    }

    // Remover PDF
    if (removePdfBtn) {
        removePdfBtn.addEventListener('click', () => {
            resetFileInput();
        });
    }

    // Função para desativar a área de upload
    function disableUploadArea(fileName) {
        if (uploadArea) uploadArea.classList.add('disabled');
        if (uploadText) uploadText.textContent = fileName ? `📄 ${fileName}` : "PDF selecionado";
    }

    // Função para reativar a área de upload
    function enableUploadArea() {
        if (uploadArea) uploadArea.classList.remove('disabled');
        if (uploadText) uploadText.textContent = "Clique ou arraste seu arquivo PDF aqui";
    }

    // Quando o botão "Gerar Nota" for clicado
    gerarNotaBtn.addEventListener('click', async () => {
        const file = selectedFile || fileInput.files[0];
        if (!file) {
            alert('Selecione um arquivo PDF primeiro.');
            return;
        }

        isProcessing = true;
        gerarNotaBtn.disabled = true;
        if (removePdfBtn) removePdfBtn.disabled = true;
        gerarNotaBtn.textContent = '1/3 Enviando PDF... ⏳';

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
            gerarNotaBtn.textContent = '2/3 Gerando resumo com IA... 🧠';
            const resumoRes = await fetchBackend("/gerar-resumo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ pdf_url: pdfUrl })
            });

            if (!resumoRes.ok) {
                const erroTexto = await resumoRes.text();
                throw new Error(`Erro HTTP ${resumoRes.status}: ${erroTexto}`);
            }

            let resumoData;
            try {
                resumoData = await resumoRes.json();
                console.log("✅ Resumo recebido da IA:", resumoData);
            } catch (jsonErr) {
                console.error("❌ Erro ao converter para JSON:", jsonErr);
                throw new Error("Erro ao interpretar resposta da IA");
            }

            // 3. Gerar Flashcards e Quiz com base no resumo
            gerarNotaBtn.textContent = '3/3 Gerando Flashcards e Quiz... ✨';
            let flashcards = [];
            let quiz = [];

            try {
                const flashQuizRes = await fetchBackend("/gerar-flashcards-e-quiz", {
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

                flashcards = Array.isArray(flashQuizData.flashcards) ? flashQuizData.flashcards : [];
                quiz = Array.isArray(flashQuizData.quiz) ? flashQuizData.quiz : [];
            } catch (error) {
                console.error("❌ Erro ao gerar Flashcards e Quiz:", error);
                alert("Aviso: Falha ao gerar Flashcards e Quiz. A nota será salva com o resumo.");
            }

            // 4. Cria a nota no Firebase com flashcards e quiz inclusos
            gerarNotaBtn.textContent = 'Salvando nota... 💾';
            const note = {
                title: file.name.replace(/\.pdf$/i, ''),
                content: resumoData.resumo,
                folderId: activeFolderId || 'all',
                pdfUrl: pdfUrl,
                createdAt: new Date(),
                isPdf: true,
                isWelcome: false,
                flashcards: flashcards,
                quiz: quiz
            };

            await createNote(currentUserUid, note);
            isProcessing = false;
            closeUploadModal();
            await renderNotes();

        } catch (err) {
            console.error("❌ Erro ao processar PDF:", err);
            alert("Erro: " + (err.message || err.toString() || "Erro desconhecido"));
        } finally {
            isProcessing = false;
            gerarNotaBtn.disabled = false;
            if (removePdfBtn) removePdfBtn.disabled = false;
            gerarNotaBtn.textContent = 'Gerar Nota';
        }
    });
}

export { initModalPdf };
