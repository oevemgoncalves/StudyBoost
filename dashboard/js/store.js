// Armazenamento de dados simples para o aplicativo
const store = (() => {
    // Estado do aplicativo
    let state = {
        notes: [],
        folders: [
            { id: 'all', name: 'Todas as Notas', isFixed: true }
        ],
        activeFolder: { id: 'all', name: 'Todas as Notas', isFixed: true }
    };
    
    // Assinantes do evento
    const subscribers = {
        noteChange: [],
        folderChange: [],
        activeFolderChange: []
    };
    
    // Assine as mudanças de estado
    function subscribe(event, callback) {
        if (subscribers[event]) {
            subscribers[event].push(callback);
            return () => {
                subscribers[event] = subscribers[event].filter(cb => cb !== callback);
            };
        }
        return () => {};
    }
    
    // Notificar assinantes sobre mudanças de estado
    function notify(event) {
        if (subscribers[event]) {
            subscribers[event].forEach(callback => callback(state));
        }
    }
    
    // Obtenha todas as notas
    function getNotes() {
        return [...state.notes];
    }
    
    // Obter notas para uma pasta específica
    function getNotesByFolder(folderId) {
        if (folderId === 'all') {
            return [...state.notes];
        }
        return state.notes.filter(note => note.folderId === folderId);
    }
    
    // add uma nova nota
    function addNote(note) {
        const newNote = {
            ...note,
            id: note.id || `note-${Date.now()}`,
            createdAt: note.createdAt || new Date()
        };
        state.notes = [newNote, ...state.notes];
        notify('noteChange');
        return newNote;
    }
    
    // atualiza uma nota existente
    function updateNote(noteId, updates) {
        state.notes = state.notes.map(note => 
            note.id === noteId ? { ...note, ...updates } : note
        );
        notify('noteChange');
    }
    
    // excluir uma nota
    function deleteNote(noteId) {
        state.notes = state.notes.filter(note => note.id !== noteId);
        notify('noteChange');
    }
    
    // obtendo todas as pastas
    function getFolders() {
        return [...state.folders];
    }
    
    // Add uma nova pasta
    function addFolder(folder) {
        const newFolder = {
            ...folder,
            id: folder.id || `folder-${Date.now()}`
        };
        state.folders = [...state.folders, newFolder];
        notify('folderChange');
        return newFolder;
    }
    
    // excluindo uma nova pasta e suas notas
    function deleteFolder(folderId) {
        // Não é possível excluir a pasta corrigida
        if (folderId === 'all') return false;
        
        // exclua a pasta
        state.folders = state.folders.filter(folder => folder.id !== folderId);
        
        // Defina a pasta ativa como 'todos' se a pasta excluída estiver ativa
        if (state.activeFolder.id === folderId) {
            setActiveFolder('all');
        }
        
        notify('folderChange');
        return true;
    }
    
    // Defina a pasta ativa
    function setActiveFolder(folderId) {
        const folder = state.folders.find(f => f.id === folderId);
        if (folder) {
            state.activeFolder = { ...folder };
            notify('activeFolderChange');
        }
    }
    
    // obtendo a pasta ativa
    function getActiveFolder() {
        return { ...state.activeFolder };
    }
    
    // Carregar dados da pasta localStoragetive
    function loadFromStorage() {
        try {
            const savedNotes = localStorage.getItem('studyboost_notes');
            const savedFolders = localStorage.getItem('studyboost_folders');
            const savedActiveFolder = localStorage.getItem('studyboost_activeFolder');
            
            if (savedNotes) {
                state.notes = JSON.parse(savedNotes).map(note => ({
                    ...note,
                    createdAt: new Date(note.createdAt)
                }));
            }
            
            if (savedFolders) {
                const folders = JSON.parse(savedFolders);
                // Certifique-se de que sempre temos a pasta 'all' fixa
                if (!folders.some(f => f.id === 'all')) {
                    folders.unshift({ id: 'all', name: 'Todas as Notas', isFixed: true });
                }
                state.folders = folders;
            }
            
            if (savedActiveFolder) {
                const activeFolder = JSON.parse(savedActiveFolder);
                state.activeFolder = activeFolder;
            }
            
            notify('noteChange');
            notify('folderChange');
            notify('activeFolderChange');
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
        }
    }
    
    // Salvar dados no localStorage
    function saveToStorage() {
        try {
            localStorage.setItem('studyboost_notes', JSON.stringify(state.notes));
            localStorage.setItem('studyboost_folders', JSON.stringify(state.folders));
            localStorage.setItem('studyboost_activeFolder', JSON.stringify(state.activeFolder));
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
        }
    }
    
    // Inicialize o armazenamento
    function init() {
        loadFromStorage();
        
        // Configurar salvamento automático quando o estado mudar
        subscribe('noteChange', saveToStorage);
        subscribe('folderChange', saveToStorage);
        subscribe('activeFolderChange', saveToStorage);
    }
    
    // Inicializar o armazenamento quando o módulo for carregado
    init();
    
    // API pública
    return {
        getNotes,
        getNotesByFolder,
        addNote,
        updateNote,
        deleteNote,
        getFolders,
        addFolder,
        deleteFolder,
        setActiveFolder,
        getActiveFolder,
        subscribe
    };
})();

export { store };