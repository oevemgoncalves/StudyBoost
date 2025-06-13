import { getCurrentOpenedNote } from "./notes.js";

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

const WELCOME_FLASHCARDS = [
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

// Dados fixos para a nota de boas-vindas, se desejar
const WELCOME_QUIZ = [
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

let currentFlashcardIndex = 0; // Renomeado para evitar conflito com 'current'
let currentQuizIndex = 0;
let flashcardFlipped = false;

// Elementos DOM para Flashcards - INICIALIZADOS EM initFlashcards()
let flashcardContainerEl; // Representa o elemento #card
let flashcardContentEl;   // Representa o elemento #card-content
let flashcardBackEl;      // Representa o elemento #card-back
let flashcardHintEl;      // Representa o elemento #hint
let flashcardPrevBtn;     // Representa o elemento #prev
let flashcardNextBtn;     // Representa o elemento #next

// Elementos DOM para Quiz - INICIALIZADOS EM renderQuestion() ou initQuiz()
let quizQuestionEl;
let quizOptionsEl;
let quizNextBtn;
let quizCounterEl;
let quizProgressEl;

function renderCard() {
  flashcardFlipped = false;
  const note = getCurrentOpenedNote();
  const activeFlashcards = note && !note.isWelcome ? note.flashcards : WELCOME_FLASHCARDS;

  if (!flashcardContainerEl || !flashcardContentEl || !flashcardBackEl || !flashcardHintEl || !flashcardPrevBtn || !flashcardNextBtn) {
      console.error("Elementos DOM do Flashcard não inicializados. Verifique initFlashcards().");
 
      return; // Saia se não tiver os elementos
  }
  const cardEl = document.getElementById("card");
  const inner = flashcardContainerEl.querySelector(".card-inner");

  if (!inner) { // Adicione uma verificação de segurança
      console.error("Elemento .card-inner não encontrado para flashcards.");
      return;
  }

  // Aplica classe de queda
  inner.classList.add("falling");

  // Remove depois de 200ms (tempo suficiente pro efeito de transição)
  setTimeout(() => {
    inner.classList.remove("falling");
    inner.style.transform = ''; // limpa qualquer valor antigo se existir
  }, 200);

  flashcardContainerEl.classList.remove("flipped");

  flashcardContentEl.textContent = activeFlashcards[currentFlashcardIndex].pergunta;
  flashcardBackEl.textContent = activeFlashcards[currentFlashcardIndex].resposta; // ✅ card-back precisa ter um ID no HTML
  flashcardHintEl.textContent = "🖐️ Pressione para virar"; // ✅ hintEl agora está definido

  flashcardPrevBtn.style.visibility = currentFlashcardIndex === 0 ? "hidden" : "visible";
  flashcardNextBtn.style.visibility = currentFlashcardIndex === activeFlashcards.length - 1 ? "hidden" : "visible";

}

function flipCard() {
  if (!flashcardContainerEl || !flashcardHintEl) {
      console.error("Elementos do card para virar não encontrados.");
      return;
  }

  flashcardFlipped = !flashcardFlipped;
  flashcardContainerEl.classList.toggle("flipped");
  flashcardHintEl.textContent = flashcardFlipped ? "🔄 Pressione para voltar" : "🖐️ Pressione para virar";
}


function nextCard() {
  const note = getCurrentOpenedNote();
  const activeFlashcards = note && !note.isWelcome ? note.flashcards : WELCOME_FLASHCARDS;

  if (!activeFlashcards) return; // Segurança

  if (currentFlashcardIndex < activeFlashcards.length - 1) {
    currentFlashcardIndex++;
    renderCard();
  }
}

function prevCard() {
  const note = getCurrentOpenedNote();
  const activeFlashcards = note && !note.isWelcome ? note.flashcards : WELCOME_FLASHCARDS;

  if (!activeFlashcards) return; // Segurança

  if (currentFlashcardIndex > 0) {
    currentFlashcardIndex--;
    renderCard();
  }
}

// 👇 Esta função inicia o módulo corretamente
function initFlashcards() {
  flashcardContainerEl = document.getElementById("card");
  flashcardContentEl = document.getElementById("card-content");
  flashcardBackEl = document.getElementById("card-back");
  flashcardHintEl = document.getElementById("hint");
  flashcardPrevBtn = document.getElementById("prev");
  flashcardNextBtn = document.getElementById("next");

  // Anexar event listeners usando as variáveis globais
  flashcardContainerEl.addEventListener("click", flipCard);
  flashcardPrevBtn.addEventListener("click", prevCard);
  flashcardNextBtn.addEventListener("click", nextCard);

  renderCard();
}

function renderQuestion() {
  const note = getCurrentOpenedNote();
  console.log("Nota atual em renderQuestion:", note); // Debug 1

  const activeQuiz = note && !note.isWelcome ? note.quiz : WELCOME_QUIZ;
  console.log("Quiz ativo em renderQuestion:", activeQuiz); // Debug 2


  if (!activeQuiz || activeQuiz.length === 0) {
    document.getElementById("quiz").innerHTML = "<p>Nenhum quiz disponível para esta nota.</p>";
    console.warn("activeQuiz está vazio ou indefinido. Retornando."); // Debug 3
    return;
  }
  // Reinicia o índice do quiz para 0 sempre que uma nova pergunta é renderizada, a menos que já esteja no meio de um quiz. Isso impede o erro de 'undefined'.
  if (currentQuizIndex >= activeQuiz.length) {
      currentQuizIndex = 0;
  }
  const q = activeQuiz[currentQuizIndex];
  if (!q) {
    console.error("Pergunta do quiz não encontrada para o índice:", currentQuizIndex);
    document.getElementById("quiz").innerHTML = "<p>Erro ao carregar a pergunta do quiz.</p>";
    return;
  }

  const quizQuestionEl = document.getElementById('question');
  const quizOptionsEl = document.getElementById('options');
  const quizNextBtn = document.getElementById('nextBtn'); // ID do botão de próxima questão do quiz
  const quizCounterEl = document.getElementById('counterQuiz'); // ID para o contador do quiz
  const quizProgressEl = document.getElementById('progress'); // ID para a barra de progresso

  quizQuestionEl.textContent = `Questão ${currentQuizIndex + 1}: ${q.pergunta}`;
  quizOptionsEl.innerHTML = "";
  quizNextBtn.style.display = "none";

 q.alternativas.forEach((alt, i) => {
    const btn = document.createElement('button');
    btn.textContent = alt;
    btn.onclick = () => {
      if (i === q.correta) {
        btn.classList.add("correct");
      } else {
        btn.classList.add("incorrect");
        // Certifique-se de que optionsEl.children[q.correta] existe antes de tentar acessá-lo
        if (optionsEl.children[q.correta]) {
            optionsEl.children[q.correta].classList.add("correct");
        }
      }
      document.querySelectorAll('.options button').forEach(b => b.disabled = true);
      quizNextBtn.style.display = "inline-block";
    }
    quizOptionsEl.appendChild(btn);
  })

  quizCounterEl.textContent = `Questão ${currentQuizIndex + 1} de ${activeQuiz.length}`;
  quizProgressEl.style.width = `${(currentQuizIndex + 1) / activeQuiz.length * 100}%`;
}

function nextQuestion() {
  const note = getCurrentOpenedNote();
  const activeQuiz = note && !note.isWelcome ? note.quiz : WELCOME_QUIZ;

  if (!activeQuiz) return; // Segurança

  if (currentQuizIndex < activeQuiz.length - 1) {
    currentQuizIndex++;
    renderQuestion();
  } else {
      // Opcional: o que acontece quando o quiz termina?
      alert("Quiz concluído!");
      resetQuiz(); // Reinicia o quiz automaticamente
  }
}

function resetQuiz() {
  currentQuizIndex = 0;
  renderQuestion();
}

function shuffleQuestions() {
  const note = getCurrentOpenedNote();
  const activeQuiz = note && !note.isWelcome ? note.quiz : WELCOME_QUIZ;

  if (!activeQuiz) return;

  // Embaralha o array diretamente
  for (let i = activeQuiz.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Troca os elementos no array original ou na cópia que você está usando
    [activeQuiz[i], activeQuiz[j]] = [activeQuiz[j], activeQuiz[i]];
  }
  resetQuiz();
}

export { initCards, initFlashcards, renderQuestion, nextQuestion, resetQuiz, shuffleQuestions };