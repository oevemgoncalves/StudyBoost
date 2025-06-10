import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  onSnapshot
} from './firebase-config.js';

export class NoteService {
  static async createNote(userId, noteData) {
    try {
      // Verificar limite de notas (máximo 3)
      const notesCount = await this.getUserNotesCount(userId);
      if (notesCount >= 3) {
        throw new Error("Limite de notas atingido (máximo 3)");
      }

      const notesRef = collection(db, 'users', userId, 'notes');
      const newNoteRef = doc(notesRef);
      await setDoc(newNoteRef, {
        ...noteData,
        createdAt: new Date()
      });
      return { id: newNoteRef.id, ...noteData };
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  }

  static async getUserNotesCount(userId) {
    const notesRef = collection(db, 'users', userId, 'notes');
    const querySnapshot = await getDocs(notesRef);
    return querySnapshot.size;
  }

  static async getNotesByFolder(userId, folderId) {
    try {
      const notesRef = collection(db, 'users', userId, 'notes');
      let q;
      
      if (folderId === 'all') {
        q = query(notesRef);
      } else {
        q = query(notesRef, where('folderId', '==', folderId));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting notes:", error);
      throw error;
    }
  }

  static async updateNote(userId, noteId, updates) {
    try {
      const noteRef = doc(db, 'users', userId, 'notes', noteId);
      await updateDoc(noteRef, updates);
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  }

  static async deleteNote(userId, noteId) {
    try {
      const noteRef = doc(db, 'users', userId, 'notes', noteId);
      await deleteDoc(noteRef);
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  }

  static subscribeToNotes(userId, folderId, callback) {
    const notesRef = collection(db, 'users', userId, 'notes');
    let q;
    
    if (folderId === 'all') {
      q = query(notesRef);
    } else {
      q = query(notesRef, where('folderId', '==', folderId));
    }
    
    return onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(notes);
    });
  }
}