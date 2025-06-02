/**
 * Sprunki App - Main application bootstrap
 * Initializes all modules and sets up the UI
 */
import { AppCore } from './core/AppCore.js';
import { PerformanceStage } from './stage/PerformanceStage.js';

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

            // Initialize editors - Stage gets real implementation!
            this.editors = {
                character: new PlaceholderEditor('character', this.appCore.getEventBus()),
                music: new PlaceholderEditor('music', this.appCore.getEventBus()),
                animation: new PlaceholderEditor('animation', this.appCore.getEventBus()),
                stage: await this.createPerformanceStage()
            };

            // Initialize other editors (non-async)
            await Promise.all([
                this.editors.character.init(),
                this.editors.music.init(),
                this.editors.animation.init()
            ]);
            
            // Stage is already initialized in createPerformanceStage

            // Register editors with the core
            Object.entries(this.editors).forEach(([name, editor]) => {
                this.appCore.registerModule(name, editor);
            });

            // Set up UI interactions
            this.setupNavigation();
            this.setupProjectControls();

            // Set up global event listeners
            this.setupGlobalEventListeners();

            // Show initial message in console
            console.log('🎉 Sprunki Creative Studio initialized successfully!');
            console.log('🎭 Performance Stage is ready for creativity!');
            
            // Add some test data to demonstrate the stage
            this.addTestData();

            console.log('🎉 Sprunki Creative Studio initialized successfully!');
        } catch (error) {
            console.error('❌ Failed to initialize Sprunki App:', error);
            this.showErrorMessage('Failed to initialize application. Please refresh and try again.');
        }
    }

    async createPerformanceStage() {
        console.log('🎭 Creating Performance Stage...');
        
        // Get or create canvas element
        const stageContainer = document.getElementById('stage-canvas-container');
        if (!stageContainer) {
            throw new Error('Stage canvas container not found');
        }
        
        // Create canvas element
        let canvas = stageContainer.querySelector('canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'stage-canvas';
            canvas.style.cssText = `
                width: 100%;
                height: 100%;
                background: #1a1a2e;
                border-radius: 8px;
                cursor: crosshair;
            `;
            stageContainer.appendChild(canvas);
        }
        
        // Create Performance Stage instance
        const stage = new PerformanceStage(
            canvas, 
            this.appCore.getEventBus(), 
            this.appCore.getStateManager()
        );
        
        // Initialize the stage
        await stage.initialize();
        
        // Add stage-specific methods for editor interface compatibility
        stage.onActivate = () => {
            console.log('🎭 Performance Stage activated');
            this.appCore.getEventBus().emit('stage:activated');
            stage.render(stage.currentTime); // Refresh render when activated
        };
        
        console.log('🎭 Performance Stage created successfully');
        return stage;
    }

    addTestData() {
        console.log('🧪 Adding test data for Performance Stage demonstration...');
        
        const stateManager = this.appCore.getStateManager();
        const eventBus = this.appCore.getEventBus();
        
        // Add test characters
        const testCharacters = [
            {
                id: 'test-character-1',
                name: 'Sprunki Blue',
                color: '#4285f4',
                size: 80,
                shape: 'humanoid'
            },
            {
                id: 'test-character-2', 
                name: 'Sprunki Red',
                color: '#ea4335',
                size: 100,
                shape: 'humanoid'
            },
            {
                id: 'test-character-3',
                name: 'Sprunki Green', 
                color: '#34a853',
                size: 90,
                shape: 'humanoid'
            }
        ];
        
        // Set test project data
        stateManager.setState('project.characters', testCharacters);
        
        // Place characters on stage
        const stageLayout = {
            characters: [
                {
                    characterId: 'test-character-1',
                    x: 200,
                    y: 300,
                    scale: 1,
                    rotation: 0
                },
                {
                    characterId: 'test-character-2',
                    x: 400,
                    y: 300,
                    scale: 1.2,
                    rotation: 0
                },
                {
                    characterId: 'test-character-3',
                    x: 600,
                    y: 300,
                    scale: 0.8,
                    rotation: 0
                }
            ]
        };
        
        stateManager.setState('project.stages.main', stageLayout);
        
        // Add stage controls
        this.addStageControls();
        
        console.log('🧪 Test data added - 3 Sprunki characters placed on stage!');
        eventBus.emit('test:data-loaded');
    }

    addStageControls() {
        const stageContainer = document.getElementById('stage-controls');
        if (!stageContainer) return;
        
        stageContainer.innerHTML = `
            <div style="padding: 10px; background: rgba(0,0,0,0.1); border-radius: 8px; margin: 10px 0;">
                <h4 style="margin: 0 0 10px 0; color: #333;">🎭 Performance Controls</h4>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button id="stage-play" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        ▶️ Play
                    </button>
                    <button id="stage-pause" style="padding: 8px 16px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        ⏸️ Pause
                    </button>
                    <button id="stage-stop" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        ⏹️ Stop
                    </button>
                    <span style="margin-left: 20px; color: #666;">
                        Time: <span id="stage-time">0.00s</span>
                    </span>
                    <span style="margin-left: 20px; color: #666;">
                        FPS: <span id="stage-fps">--</span>
                    </span>
                </div>
                <div style="margin-top: 10px;">
                    <label style="color: #666; margin-right: 10px;">
                        <input type="checkbox" id="debug-mode" style="margin-right: 5px;"> Debug Mode
                    </label>
                    <button id="add-character" style="padding: 6px 12px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
                        + Add Character
                    </button>
                </div>
            </div>
        `;
        
        // Set up stage control event handlers
        document.getElementById('stage-play').addEventListener('click', () => {
            this.appCore.getEventBus().emit('timeline:play');
        });
        
        document.getElementById('stage-pause').addEventListener('click', () => {
            this.appCore.getEventBus().emit('timeline:pause');
        });
        
        document.getElementById('stage-stop').addEventListener('click', () => {
            this.appCore.getEventBus().emit('timeline:stop');
        });
        
        document.getElementById('debug-mode').addEventListener('change', (e) => {
            this.appCore.getStateManager().setState('ui.debugMode', e.target.checked);
        });
        
        document.getElementById('add-character').addEventListener('click', () => {
            this.addRandomCharacter();
        });
        
        // Set up real-time updates
        this.setupStageMonitoring();
    }

    addRandomCharacter() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        const names = ['Sprunki Pink', 'Sprunki Cyan', 'Sprunki Blue', 'Sprunki Mint', 'Sprunki Yellow', 'Sprunki Purple'];
        
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomId = `test-character-${Date.now()}`;
        
        const newCharacter = {
            id: randomId,
            name: randomName,
            color: randomColor,
            size: 60 + Math.random() * 80,
            shape: 'humanoid'
        };
        
        // Add to project
        const currentCharacters = this.appCore.getStateManager().getState('project.characters') || [];
        currentCharacters.push(newCharacter);
        this.appCore.getStateManager().setState('project.characters', currentCharacters);
        
        // Place on stage at random position
        this.appCore.getEventBus().emit('stage:character_placed', {
            characterId: randomId,
            x: 100 + Math.random() * 600,
            y: 200 + Math.random() * 200,
            scale: 0.8 + Math.random() * 0.4,
            rotation: 0
        });
        
        console.log('🎨 Added random character:', randomName, randomColor);
    }

    setupStageMonitoring() {
        // Update time and FPS displays
        setInterval(() => {
            if (this.editors.stage && this.editors.stage.getPerformanceMetrics) {
                const metrics = this.editors.stage.getPerformanceMetrics();
                
                document.getElementById('stage-time').textContent = `${metrics.currentTime.toFixed(2)}s`;
                document.getElementById('stage-fps').textContent = `${metrics.fps.toFixed(1)}`;
            }
        }, 100);
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
