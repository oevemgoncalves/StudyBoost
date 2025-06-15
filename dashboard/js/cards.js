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

      // 🚨 Re-renderiza o conteúdo quando muda de aba
      if (target === "flashcards") {
        renderCard(); // agora será chamado na hora certa
      } else if (target === "quiz") {
        renderQuestion(); // agora será chamado na hora certa
      }
    });
  });
}


//flashcards novos
const flashcards = [
  {
    pergunta: "Que técnica o StudyBoost utiliza para ajudar no ensino?",
    resposta: "O StudyBoost utiliza as técnicas de estudos para ajudar os usuários a entender e reter ideias complexas de forma mais eficaz."
  },
  {
    pergunta: "Que tipos de conteúdo o StudyBoost pode resumir?",
    resposta: "O StudyBoost pode resumir PDFs em quizzes, flashcards e audios."
  },
  {
    pergunta: "Qual é o principal benefício do StudyBoost?",
    resposta: "ele transfomar informações complexas em formatos mais fáceis de entender e reter, como resumos, flashcards e quizzes interativos."
  },
  {
    pergunta: "Você pode usar o StudyBoost em quais dispositivos?",
    resposta: "O StudyBoost oferece suporte a múltiplas plataformas, incluindo PCs, tablets e smartphones."
  },
  {
    pergunta: "Como o StudyBoost organiza os materiais?",
    resposta: "O StudyBoost organiza os materiais em pastas personalizadas, facilitando o acesso e a gestão dos conteúdos."
  },
  // ... até 16 cartões
];

let current = 0;
let flipped = false;
let card, content, hint, counter, prev, next;

function getActiveQuiz() {
    return window.customQuiz && window.customQuiz.length > 0 ? window.customQuiz : quiz;
}

function renderCard() {
  flipped = false;
  const cardEl = document.getElementById("card");
  const inner = cardEl.querySelector(".card-inner");

  // Aplica classe de queda
  inner.classList.add("falling");

  // Remove depois de 200ms (tempo suficiente pro efeito de transição)
  setTimeout(() => {
    inner.classList.remove("falling");
    inner.style.transform = ''; // limpa qualquer valor antigo se existir
  }, 200);

  cardEl.classList.remove("flipped");

  const activeFlashcards = window.customFlashcards && window.customFlashcards.length > 0 ? window.customFlashcards : flashcards;

  document.getElementById("card-content").textContent = activeFlashcards[current].pergunta;
  document.getElementById("card-back").textContent = activeFlashcards[current].resposta;

  prev.style.visibility = current === 0 ? "hidden" : "visible";
  next.style.visibility = current === activeFlashcards.length - 1 ? "hidden" : "visible";

}

export function updateFlashcardsUI() {
    current = 0;
    flipped = false;
    renderCard();
}

export function updateQuizUI() {
    currentQuiz = 0;
    embaralhado = false;
    renderQuestion();
}


function flipCard() {
  flipped = !flipped;
  const cardEl = document.getElementById("card");
  cardEl.classList.toggle("flipped");
  hint.textContent = flipped ? "🔄 Pressione para voltar" : "🖐️ Pressione para virar";
}

function nextCard() {
  const activeFlashcards = window.customFlashcards && window.customFlashcards.length > 0 ? window.customFlashcards : flashcards;
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


// 👇 Esta função inicia o módulo corretamente
function initFlashcards() {
  card = document.getElementById("card");
  content = document.getElementById("card-content");
  hint = document.getElementById("hint");
  counter = document.getElementById("counter");
  prev = document.getElementById("prev");
  next = document.getElementById("next");

  card.addEventListener("click", flipCard);
  prev.addEventListener("click", prevCard);
  next.addEventListener("click", nextCard);

  renderCard();
}

// QUIZ novo
const quiz = [
  { //exemplo de pergunta
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
    alternativas: [" Criar vídeos educativos", "Gerar conteúdo de entretenimento", "Facilitar os estudos com ajuda de IA", " Oferecer cursos online pagos"],
    correta: 2
  },
  {
    pergunta: "Além de resumos, quais recursos o StudyBoost gera automaticamente a partir do conteúdo?",
    alternativas: ["Apresentações em PowerPoint", "Mapas mentais, quizzes e flashcards", "Planilhas financeiras", "Tarefas e redações"],
    correta: 1
  },
  {
    pergunta: "O StudyBoost oferece uma experiência otimizada para quais dispositivos?",
    alternativas: ["Computadores", "Tablets", "Multiplataformas (PC, tablet, smartphone)", "Apenas celulares Android"],
    correta: 2
  },
  // Adicione mais 21 perguntas neste formato...
];

let currentQuiz = 0;
let embaralhado = false;

function renderQuestion() {
  const activeQuiz = getActiveQuiz();
  const q = activeQuiz[currentQuiz];
  const questionEl = document.getElementById('question');
  const optionsEl = document.getElementById('options');
  const nextBtn = document.getElementById('nextBtn');
  const counter = document.getElementById('counter');
  const progressBar = document.getElementById('progress');

  questionEl.textContent = `Questão ${currentQuiz + 1}: ${q.pergunta}`;
  optionsEl.innerHTML = "";
  nextBtn.style.display = "none";

  q.alternativas.forEach((alt, i) => {
    const btn = document.createElement('button');
    btn.textContent = alt;
    btn.onclick = () => {
      if (i === q.correta) {
        btn.classList.add("correct");
      } else {
        btn.classList.add("incorrect");
        optionsEl.children[q.correta].classList.add("correct");
      }
      document.querySelectorAll('.options button').forEach(b => b.disabled = true);
      nextBtn.style.display = "inline-block";
    };
    optionsEl.appendChild(btn);
  });

  counter.textContent = `Questão ${currentQuiz + 1} de ${activeQuiz.length}`;
  const progressoPercentual = ((currentQuiz + 1) / activeQuiz.length) * 100;
  progressBar.style.width = `${progressoPercentual}%`;
}


function nextQuestion() {
  if (currentQuiz < getActiveQuiz().length - 1) {
    currentQuiz++;
    renderQuestion();
  }
}

function resetQuiz() {
  currentQuiz = 0;
  renderQuestion();
}

function shuffleQuestions() {
  const activeQuiz = getActiveQuiz();
  for (let i = activeQuiz.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [activeQuiz[i], activeQuiz[j]] = [activeQuiz[j], activeQuiz[i]];
  }
}

export { initCards, initFlashcards, renderQuestion, nextQuestion, resetQuiz, shuffleQuestions };