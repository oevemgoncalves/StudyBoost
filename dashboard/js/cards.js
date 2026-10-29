// Botões de resumo e troca de abas (Notas, Quiz, Flashcards, Áudio)
function initCards() {
  document.querySelectorAll(".botoes .btn").forEach(btn => {
    btn.addEventListener("click", () => {
      // Remove 'notaActive' dos outros botões
      document.querySelectorAll(".botoes .btn").forEach(b => b.classList.remove("notaActive"));
      btn.classList.add("notaActive");

      // Esconde todas as seções
      document.querySelectorAll(".container__nota").forEach(sec => sec.classList.add("hidden"));

      // Mostra a seção correspondente
      const target = btn.getAttribute("data-target");
      const targetEl = document.getElementById(target);
      if (targetEl) targetEl.classList.remove("hidden");

      // Re-renderiza o conteúdo quando muda de aba
      if (target === "flashcards") {
        renderCard();
      } else if (target === "quiz") {
        renderQuestion();
      } else if (target === "audio") {
        gerarEAbrirAudio();
      }
    });
  });
}

// Flashcards padrão (para a nota de boas-vindas)
const flashcards = [
  {
    pergunta: "Que técnica o StudyBoost utiliza para ajudar no ensino?",
    resposta: "O StudyBoost utiliza técnicas de estudo baseadas em ciência para ajudar os usuários a entender e reter ideias complexas de forma mais eficaz."
  },
  {
    pergunta: "Que tipos de conteúdo o StudyBoost pode resumir?",
    resposta: "O StudyBoost pode transformar PDFs em resumos estruturados, quizzes, flashcards e áudios."
  },
  {
    pergunta: "Qual é o principal benefício do StudyBoost?",
    resposta: "Transformar informações complexas em formatos mais fáceis de entender e reter, como resumos, flashcards e quizzes interativos."
  },
  {
    pergunta: "Você pode usar o StudyBoost em quais dispositivos?",
    resposta: "O StudyBoost oferece suporte a múltiplas plataformas, incluindo PCs, tablets e smartphones."
  },
  {
    pergunta: "Como o StudyBoost organiza os materiais?",
    resposta: "O StudyBoost organiza os materiais em pastas personalizadas, facilitando o acesso e a gestão dos conteúdos."
  }
];

let current = 0;
let flipped = false;
let card, content, hint, flashcardCounter, prev, next;

function getActiveFlashcards() {
  return window.customFlashcards && window.customFlashcards.length > 0
    ? window.customFlashcards
    : flashcards;
}

function getActiveQuiz() {
  return window.customQuiz && window.customQuiz.length > 0
    ? window.customQuiz
    : quiz;
}

function renderCard() {
  flipped = false;
  const cardEl = document.getElementById("card");
  if (!cardEl) return;

  const inner = cardEl.querySelector(".card-inner");
  const activeFlashcards = getActiveFlashcards();

  if (current >= activeFlashcards.length) {
    current = 0;
  }

  // Aplica classe de queda suave na transição
  if (inner) {
    inner.classList.add("falling");
    setTimeout(() => {
      inner.classList.remove("falling");
      inner.style.transform = '';
    }, 200);
  }

  cardEl.classList.remove("flipped");
  if (hint) {
    hint.textContent = "🖐️ Pressione para virar";
  }

  const cardFrontEl = document.getElementById("card-content");
  const cardBackEl = document.getElementById("card-back");

  if (activeFlashcards.length === 0) {
    if (cardFrontEl) cardFrontEl.textContent = "Nenhum flashcard disponível para esta nota.";
    if (cardBackEl) cardBackEl.textContent = "";
    if (flashcardCounter) flashcardCounter.textContent = "0 de 0";
    if (prev) prev.style.visibility = "hidden";
    if (next) next.style.visibility = "hidden";
    return;
  }

  if (cardFrontEl) cardFrontEl.textContent = activeFlashcards[current].pergunta;
  if (cardBackEl) cardBackEl.textContent = activeFlashcards[current].resposta;

  if (flashcardCounter) {
    flashcardCounter.textContent = `Cartão ${current + 1} de ${activeFlashcards.length}`;
  }

  if (prev) {
    prev.style.visibility = current === 0 ? "hidden" : "visible";
  }
  if (next) {
    next.style.visibility = current === activeFlashcards.length - 1 ? "hidden" : "visible";
  }
}

export function updateFlashcardsUI() {
  current = 0;
  flipped = false;
  renderCard();
}

export function updateQuizUI() {
  currentQuiz = 0;
  quizScore = 0;
  renderQuestion();
}

function flipCard() {
  flipped = !flipped;
  const cardEl = document.getElementById("card");
  if (cardEl) {
    cardEl.classList.toggle("flipped", flipped);
  }
  if (hint) {
    hint.textContent = flipped ? "🔄 Pressione para voltar" : "🖐️ Pressione para virar";
  }
}

function nextCard() {
  const activeFlashcards = getActiveFlashcards();
  if (current < activeFlashcards.length - 1) {
    current++;
    renderCard();
  }
}

function prevCard() {
  if (current > 0) {
    current--;
    renderCard();
  }
}

window.nextCard = nextCard;
window.prevCard = prevCard;

// Inicializa os flashcards e eventos
function initFlashcards() {
  card = document.getElementById("card");
  content = document.getElementById("card-content");
  hint = document.getElementById("hint");
  flashcardCounter = document.getElementById("flashcard-counter");
  prev = document.getElementById("prev");
  next = document.getElementById("next");

  if (card) card.addEventListener("click", flipCard);
  if (prev) prev.addEventListener("click", prevCard);
  if (next) next.addEventListener("click", nextCard);

  // Atalhos de teclado quando a aba de flashcards estiver visível
  document.addEventListener("keydown", (e) => {
    const flashcardsSection = document.getElementById("flashcards");
    if (!flashcardsSection || flashcardsSection.classList.contains("hidden")) return;
    if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextCard();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevCard();
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      flipCard();
    }
  });

  renderCard();
}

// Quiz padrão (para a nota de boas-vindas)
const quiz = [
  {
    pergunta: "Que técnica o StudyBoost utiliza para melhorar a retenção de memória?",
    alternativas: ["Repetição espaçada", "Mapas mentais", "Técnica Pomodoro", "Técnica Feynman"],
    correta: 3
  },
  {
    pergunta: "Que tipo de conteúdo o StudyBoost pode resumir?",
    alternativas: ["Palestras", "PDFs", "Podcasts", "Documentos do Word"],
    correta: 1
  },
  {
    pergunta: "Qual é o principal objetivo do StudyBoost?",
    alternativas: ["Criar vídeos educativos", "Gerar conteúdo de entretenimento", "Facilitar os estudos com ajuda de IA", "Oferecer cursos online pagos"],
    correta: 2
  },
  {
    pergunta: "Além de resumos, quais recursos o StudyBoost gera automaticamente a partir do conteúdo?",
    alternativas: ["Apresentações em PowerPoint", "Quizzes, flashcards e áudios", "Planilhas financeiras", "Tarefas e redações"],
    correta: 1
  },
  {
    pergunta: "O StudyBoost oferece uma experiência otimizada para quais dispositivos?",
    alternativas: ["Apenas computadores", "Apenas tablets", "Multiplataformas (PC, tablet, smartphone)", "Apenas celulares Android"],
    correta: 2
  }
];

let currentQuiz = 0;
let quizScore = 0;

function renderQuestion() {
  const activeQuiz = getActiveQuiz();
  const questionEl = document.getElementById('question');
  const optionsEl = document.getElementById('options');
  const nextBtn = document.getElementById('nextBtn');
  const quizCounterEl = document.getElementById('counter');
  const progressBar = document.getElementById('progress');

  if (!questionEl || !optionsEl || !nextBtn || !quizCounterEl || !progressBar) return;

  if (!activeQuiz || activeQuiz.length === 0) {
    questionEl.textContent = "Nenhuma questão disponível para esta nota.";
    optionsEl.innerHTML = "";
    nextBtn.style.display = "none";
    quizCounterEl.textContent = "";
    progressBar.style.width = "0%";
    return;
  }

  // Se chegou ao fim do quiz, mostra a tela de resultado
  if (currentQuiz >= activeQuiz.length) {
    const percent = Math.round((quizScore / activeQuiz.length) * 100);
    questionEl.textContent = `🎉 Quiz Concluído!`;
    optionsEl.innerHTML = `
      <div style="padding: 1.5rem; background: #f8fafc; border-radius: 10px; text-align: center; margin: 1rem 0; border: 1px solid #e2e8f0;">
        <p style="font-size: 1.25rem; font-weight: 600; color: #1e293b; margin-bottom: 0.5rem;">
          Você acertou ${quizScore} de ${activeQuiz.length} questões (${percent}%)
        </p>
        <p style="color: #64748b; font-size: 0.95rem;">
          ${percent >= 70 ? 'Excelente desempenho! Continue assim! 🚀' : 'Bom esforço! Revise os flashcards e tente novamente para fixar o conteúdo. 💪'}
        </p>
      </div>
    `;
    nextBtn.textContent = "🔁 Tentar novamente";
    nextBtn.style.display = "inline-block";
    quizCounterEl.textContent = `Finalizado • ${quizScore}/${activeQuiz.length} acertos`;
    progressBar.style.width = "100%";
    return;
  }

  const q = activeQuiz[currentQuiz];
  questionEl.textContent = `Questão ${currentQuiz + 1}: ${q.pergunta}`;
  optionsEl.innerHTML = "";
  nextBtn.style.display = "none";
  nextBtn.textContent = currentQuiz === activeQuiz.length - 1 ? "Ver resultado 🏆" : "Próximo →";

  q.alternativas.forEach((alt, i) => {
    const btn = document.createElement('button');
    btn.textContent = alt;
    btn.onclick = () => {
      if (i === q.correta) {
        btn.classList.add("correct");
        quizScore++;
      } else {
        btn.classList.add("incorrect");
        if (optionsEl.children[q.correta]) {
          optionsEl.children[q.correta].classList.add("correct");
        }
      }
      optionsEl.querySelectorAll('button').forEach(b => b.disabled = true);
      nextBtn.style.display = "inline-block";
    };
    optionsEl.appendChild(btn);
  });

  quizCounterEl.textContent = `Questão ${currentQuiz + 1} de ${activeQuiz.length}`;
  const progressoPercentual = ((currentQuiz + 1) / activeQuiz.length) * 100;
  progressBar.style.width = `${progressoPercentual}%`;
}

function nextQuestion() {
  const activeQuiz = getActiveQuiz();
  if (currentQuiz >= activeQuiz.length) {
    resetQuiz();
    return;
  }
  currentQuiz++;
  renderQuestion();
}

function resetQuiz() {
  currentQuiz = 0;
  quizScore = 0;
  renderQuestion();
}

function shuffleQuestions() {
  const activeQuiz = getActiveQuiz();
  for (let i = activeQuiz.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [activeQuiz[i], activeQuiz[j]] = [activeQuiz[j], activeQuiz[i]];
  }
  currentQuiz = 0;
  quizScore = 0;
  renderQuestion();
}

// Cache de áudio por nota para evitar regerar ao trocar de aba
let cachedAudioNoteId = null;
let cachedAudioUrl = null;

function stripHtmlToText(html) {
  if (!html) return '';
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return (temp.textContent || temp.innerText || '').replace(/\s+/g, ' ').trim();
}

async function gerarEAbrirAudio() {
  const audioSection = document.getElementById('audio');
  if (!audioSection) return;

  const currentNoteId = window.currentOpenedNoteId || 'welcome';

  // Se já geramos o áudio para esta mesma nota, reutiliza imediatamente
  if (cachedAudioUrl && cachedAudioNoteId === currentNoteId) {
    renderAudioPlayer(audioSection, cachedAudioUrl);
    return;
  }

  const plainText = stripHtmlToText(window.currentOpenedNoteContent);
  if (!plainText) {
    audioSection.innerHTML = '<p>❌ Nenhum texto disponível nesta nota para gerar áudio.</p>';
    return;
  }

  audioSection.innerHTML = '<p style="margin: auto; font-size: 1.1rem;">Gerando áudio da nota... ⏳</p>';

  try {
    const response = await fetch('https://studyboost-backend.onrender.com/gerar-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ texto: plainText })
    });

    if (!response.ok) {
      throw new Error(`Erro ao gerar áudio: ${response.status}`);
    }

    const audioBlob = await response.blob();
    if (cachedAudioUrl) {
      URL.revokeObjectURL(cachedAudioUrl);
    }
    cachedAudioUrl = URL.createObjectURL(audioBlob);
    cachedAudioNoteId = currentNoteId;

    renderAudioPlayer(audioSection, cachedAudioUrl);
  } catch (error) {
    console.error("Erro ao gerar áudio:", error);
    audioSection.innerHTML = '<p style="margin: auto; color: #dc2626;">❌ Falha ao gerar o áudio. Tente novamente.</p>';
  }
}

function renderAudioPlayer(container, audioUrl) {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; gap: 16px;">
      <p style="font-weight: 600; color: #1e293b;">🎧 Ouça o resumo da sua nota</p>
      <audio controls autoplay style="width: 100%; max-width: 500px;">
        <source src="${audioUrl}" type="audio/mpeg">
        Seu navegador não suporta áudio.
      </audio>
    </div>
  `;
}

export { initCards, initFlashcards, renderQuestion, nextQuestion, resetQuiz, shuffleQuestions, gerarEAbrirAudio };
