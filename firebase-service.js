import { db, storage } from './firebase-config.js';
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
import { 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-storage.js";

// Serviço para Pastas
export const FolderService = {
    async getFolders(userId) {
        const q = query(
            collection(db, "folders"), 
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    async createFolder(folderData) {
        const folderRef = doc(collection(db, "folders"));
        await setDoc(folderRef, {
            ...folderData,
            createdAt: new Date()
        });
        return { id: folderRef.id, ...folderData };
    },
    
    async updateFolder(folderId, updates) {
        const folderRef = doc(db, "folders", folderId);
        await updateDoc(folderRef, {
            ...updates,
            updatedAt: new Date()
        });
    },
    
    async deleteFolder(folderId) {
        await deleteDoc(doc(db, "folders", folderId));
    }
};

// Serviço para Notas
export const NoteService = {
    async getNotes(userId, folderId = null) {
        let q;
        if (folderId) {
            q = query(
                collection(db, "notes"),
                where("userId", "==", userId),
                where("folderId", "==", folderId),
                orderBy("createdAt", "desc")
            );
        } else {
            q = query(
                collection(db, "notes"),
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            );
        }
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    async createNote(noteData) {
        const noteRef = doc(collection(db, "notes"));
        await setDoc(noteRef, {
            ...noteData,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return { id: noteRef.id, ...noteData };
    },
    
    async updateNote(noteId, updates) {
        const noteRef = doc(db, "notes", noteId);
        await updateDoc(noteRef, {
            ...updates,
            updatedAt: new Date()
        });
    },
    
    async deleteNote(noteId) {
        await deleteDoc(doc(db, "notes", noteId));
    }
};

// Serviço para PDFs
export const PdfService = {
    async uploadPdf(userId, file) {
        const storageRef = ref(storage, `pdfs/${userId}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    },
    
    async savePdfSummary(noteId, pdfData) {
        const pdfRef = doc(collection(db, "pdfSummaries"));
        await setDoc(pdfRef, {
            ...pdfData,
            noteId,
            createdAt: new Date()
        });
        return { id: pdfRef.id, ...pdfData };
    },
    
    async getPdfSummariesByNote(noteId) {
        const q = query(
            collection(db, "pdfSummaries"),
            where("noteId", "==", noteId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    async deletePdf(pdfId, filePath) {
        // Delete from Firestore
        await deleteDoc(doc(db, "pdfSummaries", pdfId));
        
        // Delete from Storage
        const fileRef = ref(storage, filePath);
        await deleteObject(fileRef);
    }
};

// Serviços similares para Flashcards, Quizzes e Áudios...