/**
 * StateManager - Global application state management
 * Manages project data, UI state, and provides reactive state updates
 */
export class StateManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.state = {
            // Project state
            currentProject: null,
            projectData: {
                characters: [],
                music: [],
                animations: [],
                stages: []
            },
            
            // UI state
            activeView: 'stage', // character, music, animation, stage
            unsavedChanges: false,
            
            // Editor states
            selectedCharacter: null,
            selectedMusicTrack: null,
            selectedAnimation: null,
            
            // Application metadata
            lastSaveTime: null,
            version: '1.0.0'
        };

        this._setupEventHandlers();
    }

    async init() {
        console.log('[StateManager] Initializing state management...');
        
        // Load any persisted state from localStorage
        await this._loadPersistedState();
        
        // Emit initial state
        this.eventBus.emit('state:initialized', this.getState());
        
        console.log('[StateManager] State management initialized');
    }

    _setupEventHandlers() {
        // Listen for view changes
        this.eventBus.on('view:change', (viewName) => {
            this.setActiveView(viewName);
        });

        // Listen for project data changes
        this.eventBus.on('project:*', () => {
            this.markUnsavedChanges();
        });

        // Listen for save operations
        this.eventBus.on('project:saved', () => {
            this.markSaved();
        });
    }

    /**
     * Get a copy of the current state
     * @returns {Object} Current application state
     */
    getState() {
        return JSON.parse(JSON.stringify(this.state)); // Deep copy
    }

    /**
     * Get specific state property
     * @param {string} key - State property key
     * @returns {any} State property value
     */
    get(key) {
        const keys = key.split('.');
        let value = this.state;
        
        for (const k of keys) {
            value = value?.[k];
        }
        
        return value;
    }

    /**
     * Set state property and emit change event
     * @param {string} key - State property key (supports dot notation)
     * @param {any} value - New value
     */
    set(key, value) {
        const keys = key.split('.');
        const lastKey = keys.pop();
        let target = this.state;
        
        // Navigate to the parent object
        for (const k of keys) {
            if (!target[k]) {
                target[k] = {};
            }
            target = target[k];
        }
        
        // Set the value
        const oldValue = target[lastKey];
        target[lastKey] = value;
        
        // Emit change event
        this.eventBus.emit('state:changed', { key, value, oldValue });
        this.eventBus.emit(`state:changed:${key}`, { value, oldValue });
        
        console.log(`[StateManager] State changed: ${key}`, value);
    }

    /**
     * Set the active view/editor
     * @param {string} viewName - Name of the view (character, music, animation, stage)
     */
    setActiveView(viewName) {
        const validViews = ['character', 'music', 'animation', 'stage'];
        if (!validViews.includes(viewName)) {
            console.warn(`[StateManager] Invalid view name: ${viewName}`);
            return;
        }

        const oldView = this.state.activeView;
        this.state.activeView = viewName;
        
        this.eventBus.emit('state:view-changed', { newView: viewName, oldView });
        console.log(`[StateManager] View changed: ${oldView} -> ${viewName}`);
    }

    /**
     * Mark the project as having unsaved changes
     */
    markUnsavedChanges() {
        if (!this.state.unsavedChanges) {
            this.state.unsavedChanges = true;
            this.eventBus.emit('state:unsaved-changes', true);
        }
    }

    /**
     * Mark the project as saved
     */
    markSaved() {
        this.state.unsavedChanges = false;
        this.state.lastSaveTime = new Date().toISOString();
        this.eventBus.emit('state:saved', this.state.lastSaveTime);
    }

    /**
     * Load a project into state
     * @param {Object} projectData - Project data to load
     */
    loadProject(projectData) {
        this.state.currentProject = projectData.id;
        this.state.projectData = { ...projectData };
        this.state.unsavedChanges = false;
        
        this.eventBus.emit('project:loaded', projectData);
        console.log('[StateManager] Project loaded:', projectData.id);
    }

    /**
     * Get current project data
     * @returns {Object} Current project data
     */
    getCurrentProject() {
        return this.state.projectData;
    }

    /**
     * Load persisted state from localStorage
     */
    async _loadPersistedState() {
        try {
            const persistedState = localStorage.getItem('sprunk-app-state');
            if (persistedState) {
                const parsed = JSON.parse(persistedState);
                // Only restore certain parts of state (not UI state)
                this.state.projectData = parsed.projectData || this.state.projectData;
                this.state.currentProject = parsed.currentProject || this.state.currentProject;
                console.log('[StateManager] Persisted state restored');
            }
        } catch (error) {
            console.warn('[StateManager] Failed to load persisted state:', error);
        }
    }

    /**
     * Save current state to localStorage
     */
    persist() {
        try {
            const stateToSave = {
                projectData: this.state.projectData,
                currentProject: this.state.currentProject,
                lastSaveTime: this.state.lastSaveTime
            };
            localStorage.setItem('sprunk-app-state', JSON.stringify(stateToSave));
            console.log('[StateManager] State persisted to localStorage');
        } catch (error) {
            console.error('[StateManager] Failed to persist state:', error);
        }
    }
}
