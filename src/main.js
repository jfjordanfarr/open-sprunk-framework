/**
 * Sprunki App - Main application bootstrap
 * Initializes all modules and sets up the UI
 */
import { AppCore } from './core/AppCore.js';

class SpunkiApp {
    constructor() {
        this.appCore = null;
        this.editors = {};
        this.currentView = 'stage';
    }

    async init() {
        console.log('🎵 Initializing Sprunki Creative Studio...');

        try {
            // Initialize core application
            this.appCore = new AppCore();
            await this.appCore.init();

            // For now, we'll create placeholder editor modules
            // These will be implemented in subsequent iterations
            this.editors = {
                character: new PlaceholderEditor('character', this.appCore.getEventBus()),
                music: new PlaceholderEditor('music', this.appCore.getEventBus()),
                animation: new PlaceholderEditor('animation', this.appCore.getEventBus()),
                stage: new PlaceholderEditor('stage', this.appCore.getEventBus())
            };

            // Initialize all editors
            await Promise.all([
                this.editors.character.init(),
                this.editors.music.init(),
                this.editors.animation.init(),
                this.editors.stage.init()
            ]);

            // Register editors with the core
            Object.entries(this.editors).forEach(([name, editor]) => {
                this.appCore.registerModule(name, editor);
            });

            // Set up UI interactions
            this.setupNavigation();
            this.setupProjectControls();

            // Set up global event listeners
            this.setupGlobalEventListeners();

            // Show initial welcome message
            this.showWelcomeMessage();

            console.log('🎉 Sprunki Creative Studio initialized successfully!');
        } catch (error) {
            console.error('❌ Failed to initialize Sprunki App:', error);
            this.showErrorMessage('Failed to initialize application. Please refresh and try again.');
        }
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-tab');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const viewName = e.target.id.replace('nav-', '');
                this.switchView(viewName);
                
                // Emit navigation event
                this.appCore.getEventBus().emit('nav:tab-clicked', viewName);
            });
        });
    }

    switchView(viewName) {
        console.log(`[SpunkiApp] Switching to view: ${viewName}`);

        // Hide all panels
        document.querySelectorAll('.editor-panel').forEach(panel => {
            panel.classList.add('hidden');
        });

        // Show selected panel
        const targetPanel = document.getElementById(`${viewName}-editor`) || 
                          document.getElementById('performance-stage');
        
        if (targetPanel) {
            targetPanel.classList.remove('hidden');
        } else {
            console.warn(`[SpunkiApp] Could not find panel for view: ${viewName}`);
        }

        // Update navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const navButton = document.getElementById(`nav-${viewName}`);
        if (navButton) {
            navButton.classList.add('active');
        }

        this.currentView = viewName;

        // Notify the editor that it's now active
        if (this.editors[viewName] && this.editors[viewName].onActivate) {
            this.editors[viewName].onActivate();
        }

        // Update state
        this.appCore.getStateManager().setActiveView(viewName);
    }

    setupProjectControls() {
        document.getElementById('save-project').addEventListener('click', () => {
            this.appCore.getEventBus().emit('project:save');
        });

        document.getElementById('load-project').addEventListener('click', () => {
            this.appCore.getEventBus().emit('project:load-file');
        });

        document.getElementById('export-project').addEventListener('click', () => {
            this.appCore.getEventBus().emit('project:export');
        });
    }

    setupGlobalEventListeners() {
        const eventBus = this.appCore.getEventBus();

        // Listen for state changes
        eventBus.on('state:view-changed', ({ newView, oldView }) => {
            console.log(`[SpunkiApp] View changed: ${oldView} -> ${newView}`);
        });

        // Listen for project events
        eventBus.on('project:saved', () => {
            this.showNotification('Project saved successfully! 💾', 'success');
        });

        eventBus.on('project:loaded', (project) => {
            this.showNotification('Project loaded successfully! 📂', 'success');
        });

        eventBus.on('project:exported', () => {
            this.showNotification('Project exported successfully! 📤', 'success');
        });

        // Listen for errors
        eventBus.on('*:error', (error) => {
            this.showNotification('An error occurred: ' + error.message, 'error');
        });
    }

    showWelcomeMessage() {
        const stageContainer = document.getElementById('stage-canvas-container');
        if (stageContainer) {
            stageContainer.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #666;">
                    <h2>🎵 Welcome to Sprunki Creative Studio!</h2>
                    <p>Your creative playground for characters, music, and animation.</p>
                    <div style="margin: 30px 0;">
                        <button onclick="document.getElementById('nav-character').click()" 
                                style="margin: 5px; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Create Character
                        </button>
                        <button onclick="document.getElementById('nav-music').click()" 
                                style="margin: 5px; padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Compose Music
                        </button>
                        <button onclick="document.getElementById('nav-animation').click()" 
                                style="margin: 5px; padding: 10px 20px; background: #FF9800; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Animate Character
                        </button>
                    </div>
                    <p><small>Application Status: ✅ All systems initialized</small></p>
                </div>
            `;
        }
    }

    showNotification(message, type = 'info') {
        console.log(`[SpunkiApp] ${type.toUpperCase()}: ${message}`);
        
        // Create a simple notification (later this could be a proper toast system)
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }

    showErrorMessage(message) {
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #f44336;">
                    <h2>❌ Application Error</h2>
                    <p>${message}</p>
                    <button onclick="location.reload()" 
                            style="margin: 20px; padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Reload Application
                    </button>
                </div>
            `;
        }
    }
}

/**
 * Placeholder Editor - Temporary implementation for editors not yet built
 */
class PlaceholderEditor {
    constructor(name, eventBus) {
        this.name = name;
        this.eventBus = eventBus;
        this.initialized = false;
    }

    async init() {
        console.log(`[${this.name}Editor] Initializing placeholder editor...`);
        
        // Set up placeholder content
        const container = document.getElementById(`${this.name}-editor`) || 
                         document.getElementById('performance-stage');
        
        if (container) {
            const content = container.querySelector(`#${this.name}-canvas-container`) ||
                           container.querySelector(`#${this.name}-roll-container`) ||
                           container.querySelector(`#timeline-container`) ||
                           container.querySelector(`#stage-canvas-container`);
            
            if (content && this.name !== 'stage') {
                content.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #888; border: 2px dashed #ddd; margin: 20px;">
                        <h3>🚧 ${this.name.charAt(0).toUpperCase() + this.name.slice(1)} Editor</h3>
                        <p>Coming soon! This editor will let you create amazing ${this.name} content.</p>
                        <small>Status: Placeholder implementation</small>
                    </div>
                `;
            }
        }

        this.initialized = true;
        console.log(`[${this.name}Editor] ✅ Placeholder editor initialized`);
    }

    onActivate() {
        console.log(`[${this.name}Editor] Editor activated`);
        this.eventBus.emit(`${this.name}:activated`);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎵 DOM loaded, starting Sprunki Creative Studio...');
    
    const app = new SpunkiApp();
    
    // Make app globally available for debugging
    window.spunkiApp = app;
    
    try {
        await app.init();
    } catch (error) {
        console.error('Failed to initialize Sprunki App:', error);
    }
});

export { SpunkiApp };
