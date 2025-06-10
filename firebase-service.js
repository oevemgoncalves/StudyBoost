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
  const notesRef = collection(db, 'users', userId, 'notes');
  const docRef = await addDoc(notesRef, {
    title: note.title,
    content: note.content,
    folderId: note.folderId,
    createdAt: new Date(),
    isWelcome: note.isWelcome || false
  });
  return { id: docRef.id, ...note, createdAt: new Date() };
}

/**
 * Cria uma nova pasta no Firestore para o usuário.
 */
export async function createFolder(userId, name) {
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
  const notesRef = collection(db, 'users', userId, 'notes');

  // Verifica se já existe uma nota de boas-vindas
  const q = query(notesRef, where('isWelcome', '==', true));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    await addDoc(notesRef, {
      title: 'Bem-vindo ao StudyBoost',
      content: 'Transforme PDFs em resumos, flashcards, quizzes e Áudios com IA.',
      folderId: 'all',
      createdAt: new Date(),
      isWelcome: true
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