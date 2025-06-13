// firebase-service.js
import { db } from './firebase-config.js';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

export async function createNote(userId, note) {
  if (!userId) {
    throw new Error("❌ userId está indefinido ao acessar o Firestore.");
  }

  const notesRef = collection(db, 'users', userId, 'notes');
  const docRef = await addDoc(notesRef, {
    title: note.title,
    content: note.content,
    folderId: note.folderId,
    createdAt: new Date(),
    isWelcome: note.isWelcome || false,
    quiz: note.quiz || [],
    flashcards: note.flashcards || []// Se não houver, salve como array vazio
  });
  return { id: docRef.id, ...note, createdAt: new Date() };
}

/**
 * Cria uma nova pasta no Firestore para o usuário.
 */
export async function createFolder(userId, name) {
  if (!userId) {
    throw new Error("❌ userId está indefinido ao acessar o Firestore.");
  }

  const foldersRef = collection(db, 'users', userId, 'folders');
  const docRef = await addDoc(foldersRef, {
    name: name,
    createdAt: new Date()
  });
  return { id: docRef.id, name, createdAt: new Date() };
}

/**
 * Busca todas as pastas do usuário no Firestore.
 */
export async function getFolders(userId) {
  if (!userId) {
    throw new Error("❌ userId está indefinido ao acessar o Firestore.");
  }

  const foldersRef = collection(db, 'users', userId, 'folders');
  const snapshot = await getDocs(foldersRef);

  const folders = [];
  snapshot.forEach(doc => {
    folders.push({
      id: doc.id,
      ...doc.data()
    });
  });
  return folders;

}

/**
 * Deleta uma pasta específica.
 */
export async function deleteFolder(userId, folderId) {
  const folderRef = doc(db, 'users', userId, 'folders', folderId);
  await deleteDoc(folderRef);
}

/**
 * Atualiza o nome de uma pasta.
 */
export async function updateFolder(userId, folderId, updates) {
  const folderRef = doc(db, 'users', userId, 'folders', folderId);
  await updateDoc(folderRef, updates);
}

// Busca todas as notas de uma pasta
export async function getNotes(userId, folderId = null) {
  if (!userId) {
    throw new Error("❌ userId está indefinido ao acessar o Firestore.");
  }

  const notesRef = collection(db, 'users', userId, 'notes');
  let q = notesRef;

  if (folderId && folderId !== 'all') {
    q = query(notesRef, where('folderId', '==', folderId));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function createWelcomeNoteIfNeeded(userId) {
  if (!userId) {
    throw new Error("❌ userId está indefinido ao acessar o Firestore.");
  }

  const notesRef = collection(db, 'users', userId, 'notes');

  // Verifica se já existe uma nota de boas-vindas
  const q = query(notesRef, where('isWelcome', '==', true));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    await addDoc(notesRef, {
      title: 'Bem-vindo ao StudyBoost',
      content: `<p>Transforme PDFs em resumos, flashcards, quizzes e Aúdios com IA.</p>
        <br />

        <h2>Bem-vindo ao StudyBoost seu companheiro de estudo </h2>
        <p><strong>StudyBoost</strong> é uma plataforma inovadora que utiliza tecnologia avançada de <strong>Inteligência Artificial</strong> para transformar PDFs em <strong>resumos inteligentes</strong>, <strong>flashcards</strong> e <strong>quizzes interativos</strong>. Ideal para estudantes e profissionais, o StudyBoost organiza o conteúdo em pastas personalizadas e torna o aprendizado mais eficiente, dinâmico e acessível.</p>

        <br />

        <h2>Principais Características</h2>

        <ul>
            <li><strong>Resumos Inteligentes</strong>: Converta PDFs automaticamente em resumos claros e objetivos, focados 
            nos pontos-chave.</li>

            <li><strong>Quizzes e Flashcards</strong>: Crie quizzes e flashcards instantaneamente com base no PDF.</li>

            <li><strong>Organização em Pastas</strong>: Armazene materiais em pastas personalizadas.</li>

            <li><strong>Painel Interativo</strong>: Acesse rapidamente seus arquivos e progresso.</li>

            <li><strong>Experiência Multiplataforma</strong>: Use o StudyBoost em qualquer dispositivo com sincronização automática.</li>

            <li><strong>Design Intuitivo</strong>: Interface moderna e fácil de usar.</li>
        </ul>

        <br />

        <h2>Conclusão</h2>

        <p><strong>StudyBoost</strong> revoluciona a forma de estudar, oferecendo uma experiência <strong>personalizada, automatizada e intuitiva</strong>. Com ele, transformar PDFs em ferramentas práticas de aprendizado é simples, rápido e eficaz.</p>

        <br />

        <h3>Recomendação</h3>

        <p>Se você quer otimizar seus estudos e ter tudo em um só lugar, o <strong>StudyBoost</strong> é sua melhor escolha. Aproveite o poder da IA para turbinar seu aprendizado!</p>`,
      folderId: 'all',
      createdAt: new Date(),
      isWelcome: true,
      quiz: [],
      flashcards: []
    });
    console.log("✅ Nota de boas-vindas criada.");
  } else {
    console.log("🟢 Nota de boas-vindas já existe.");
  }
}

export async function getNoteById(userId, noteId) {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  const noteSnap = await getDoc(noteRef);
  if (noteSnap.exists()) {
    return { id: noteSnap.id, ...noteSnap.data() };
  }
  return null;
}

export async function deleteNote(userId, noteId) {
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  await deleteDoc(noteRef);
}