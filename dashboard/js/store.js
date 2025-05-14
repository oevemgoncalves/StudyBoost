// Simple data store for the application
const store = (() => {
    // Application state
    let state = {
        notes: [],
        folders: [
            { id: 'all', name: 'Todas as Notas', isFixed: true }
        ],
        activeFolder: { id: 'all', name: 'Todas as Notas', isFixed: true }
    };
    
    // Event subscribers
    const subscribers = {
        noteChange: [],
        folderChange: [],
        activeFolderChange: []
    };
    
    // Subscribe to state changes
    function subscribe(event, callback) {
        if (subscribers[event]) {
            subscribers[event].push(callback);
            return () => {
                subscribers[event] = subscribers[event].filter(cb => cb !== callback);
            };
        }
        return () => {};
    }
    
    // Notify subscribers of state changes
    function notify(event) {
        if (subscribers[event]) {
            subscribers[event].forEach(callback => callback(state));
        }
    }
    
    // Get all notes
    function getNotes() {
        return [...state.notes];
    }
    
    // Get notes for a specific folder
    function getNotesByFolder(folderId) {
        if (folderId === 'all') {
            return [...state.notes];
        }
        return state.notes.filter(note => note.folderId === folderId);
    }
    
    // Add a new note
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
    
    // Update an existing note
    function updateNote(noteId, updates) {
        state.notes = state.notes.map(note => 
            note.id === noteId ? { ...note, ...updates } : note
        );
        notify('noteChange');
    }
    
    // Delete a note
    function deleteNote(noteId) {
        state.notes = state.notes.filter(note => note.id !== noteId);
        notify('noteChange');
    }
    
    // Get all folders
    function getFolders() {
        return [...state.folders];
    }
    
    // Add a new folder
    function addFolder(folder) {
        const newFolder = {
            ...folder,
            id: folder.id || `folder-${Date.now()}`
        };
        state.folders = [...state.folders, newFolder];
        notify('folderChange');
        return newFolder;
    }
    
    // Delete a folder and its notes
    function deleteFolder(folderId) {
        // Can't delete the fixed folder
        if (folderId === 'all') return false;
        
        // Delete the folder
        state.folders = state.folders.filter(folder => folder.id !== folderId);
        
        // Set active folder to 'all' if the deleted folder was active
        if (state.activeFolder.id === folderId) {
            setActiveFolder('all');
        }
        
        notify('folderChange');
        return true;
    }
    
    // Set the active folder
    function setActiveFolder(folderId) {
        const folder = state.folders.find(f => f.id === folderId);
        if (folder) {
            state.activeFolder = { ...folder };
            notify('activeFolderChange');
        }
    }
    
    // Get the active folder
    function getActiveFolder() {
        return { ...state.activeFolder };
    }
    
    // Load data from localStorage
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
                // Make sure we always have the fixed 'all' folder
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
    
    // Save data to localStorage
    function saveToStorage() {
        try {
            localStorage.setItem('studyboost_notes', JSON.stringify(state.notes));
            localStorage.setItem('studyboost_folders', JSON.stringify(state.folders));
            localStorage.setItem('studyboost_activeFolder', JSON.stringify(state.activeFolder));
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
        }
    }
    
    // Initialize the store
    function init() {
        loadFromStorage();
        
        // Set up auto-save when state changes
        subscribe('noteChange', saveToStorage);
        subscribe('folderChange', saveToStorage);
        subscribe('activeFolderChange', saveToStorage);
    }
    
    // Initialize store when module is loaded
    init();
    
    // Public API
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