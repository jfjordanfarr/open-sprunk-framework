// MDMD Source: docs/Specification/Implementations/core/app-core-class.mdmd

/**
 * AppCore - Central application coordinator
 * Manages shared resources and facilitates communication between modules
 * 
 * @class AppCore
 * @description Central orchestrator that manages the EventBus, StateManager, and module lifecycle.
 *              Provides a single point of access for all core application services.
 */
import { EventBus } from './EventBus.js';
import { StateManager } from './StateManager.js';

export class AppCore {
    /**
     * Create an AppCore instance
     */
    constructor() {
        this.eventBus = null;
        this.stateManager = null;
        this.initialized = false;
        this.modules = new Map();
    }

    /**
     * Initialize the application core system
     * @async
     * @returns {Promise<void>} Resolves when initialization is complete
     * @description Sets up EventBus, StateManager, and prepares for module registration
     */
    async init() {
        if (this.initialized) {
            console.log('[AppCore] Already initialized');
            return;
        }

        console.log('[AppCore] Initializing application core...');

        // Initialize core services
        this.eventBus = new EventBus({
            debugMode: true, // Enable debug logging for development
            suppressedDebugEvents: ['stage:mouse_move']
        });
        
        this.stateManager = new StateManager(this.eventBus);
        await this.stateManager.init();

        // Set up global event handlers
        this._setupGlobalEventHandlers();

        this.initialized = true;
        
        // Emit initialization complete event
        this.eventBus.emit('app:core-initialized');
        
        console.log('[AppCore] ✅ Application core initialized successfully');
    }

    _setupGlobalEventHandlers() {
        // Handle project loading
        this.eventBus.on('project:load', (projectData) => {
            console.log('[AppCore] Loading project:', projectData);
            this.stateManager.loadProject(projectData);
        });

        // Handle view changes
        this.eventBus.on('nav:tab-clicked', (viewName) => {
            console.log('[AppCore] Navigation tab clicked:', viewName);
            this.eventBus.emit('view:change', viewName);
        });

        // Handle project controls
        this.eventBus.on('project:save', () => {
            console.log('[AppCore] Save project requested');
            this._saveProject();
        });

        this.eventBus.on('project:load-file', () => {
            console.log('[AppCore] Load project requested');
            this._loadProject();
        });

        this.eventBus.on('project:export', () => {
            console.log('[AppCore] Export project requested');
            this._exportProject();
        });

        // Handle application lifecycle
        this.eventBus.on('app:shutdown', () => {
            this._shutdown();
        });
    }

    /**
     * Register a module with the core
     * @param {string} name - Module name
     * @param {Object} module - Module instance
     */
    registerModule(name, module) {
        this.modules.set(name, module);
        console.log(`[AppCore] Module registered: ${name}`);
        
        // Emit module registration event
        this.eventBus.emit('module:registered', { name, module });
    }

    /**
     * Get a registered module
     * @param {string} name - Module name
     * @returns {Object|null} Module instance or null
     */
    getModule(name) {
        return this.modules.get(name) || null;
    }

    /**
     * Get the event bus instance
     * @returns {EventBus} Event bus instance
     */
    getEventBus() {
        return this.eventBus;
    }

    /**
     * Get the state manager instance
     * @returns {StateManager} State manager instance
     */
    getStateManager() {
        return this.stateManager;
    }

    /**
     * Get current application state
     * @returns {Object} Current application state
     */
    getAppState() {
        return this.stateManager.getState();
    }

    /**
     * Save the current project
     */
    async _saveProject() {
        try {
            const projectData = this.stateManager.getCurrentProject();
            
            // For now, just save to localStorage
            // Later this could save to file or cloud storage
            const projectJson = JSON.stringify(projectData, null, 2);
            localStorage.setItem('sprunk-current-project', projectJson);
            
            this.stateManager.markSaved();
            this.eventBus.emit('project:saved', projectData);
            
            console.log('[AppCore] ✅ Project saved successfully');
        } catch (error) {
            console.error('[AppCore] ❌ Failed to save project:', error);
            this.eventBus.emit('project:save-error', error);
        }
    }

    /**
     * Load a project from storage
     */
    async _loadProject() {
        try {
            // For now, load from localStorage
            // Later this could load from file picker or cloud storage
            const projectJson = localStorage.getItem('sprunk-current-project');
            
            if (projectJson) {
                const projectData = JSON.parse(projectJson);
                this.eventBus.emit('project:load', projectData);
                console.log('[AppCore] ✅ Project loaded successfully');
            } else {
                console.log('[AppCore] No saved project found');
                this.eventBus.emit('project:load-empty');
            }
        } catch (error) {
            console.error('[AppCore] ❌ Failed to load project:', error);
            this.eventBus.emit('project:load-error', error);
        }
    }

    /**
     * Export the current project
     */
    async _exportProject() {
        try {
            const projectData = this.stateManager.getCurrentProject();
            const blob = new Blob([JSON.stringify(projectData, null, 2)], { 
                type: 'application/json' 
            });
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sprunk-project-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.eventBus.emit('project:exported');
            console.log('[AppCore] ✅ Project exported successfully');
        } catch (error) {
            console.error('[AppCore] ❌ Failed to export project:', error);
            this.eventBus.emit('project:export-error', error);
        }
    }

    /**
     * Shutdown the application
     */
    _shutdown() {
        console.log('[AppCore] Shutting down application...');
        
        // Save state before shutdown
        this.stateManager.persist();
        
        // Clear event listeners
        this.eventBus.clear();
        
        console.log('[AppCore] Application shutdown complete');
    }
}
