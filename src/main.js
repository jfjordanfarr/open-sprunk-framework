// MDMD Source: docs/Specification/Implementations/app-main-bootstrap.mdmd

/**
 * Sprunki App - Main application bootstrap
 * Initializes all modules and sets up the UI
 * 
 * @class SpunkiApp
 * @description Main application controller that bootstraps the entire system,
 *              manages module initialization, and coordinates the user interface.
 */
import { AppCore } from './core/AppCore.js';
import { PerformanceStage } from './stage/PerformanceStage.js';
import { DrawingWindow } from './character/DrawingWindow.js';
import { AnimationTimelineEditor } from './animation/AnimationTimelineEditor.js';
// Import testing framework for development
import { TestFramework } from './testing/TestFramework.js';
import { CoreTests } from './testing/CoreTests.js';
import { IntegrationTests } from './testing/IntegrationTests.js';
// Import development utilities
import { PathValidator } from './utils/pathValidator.js';
import { LLMContextHelper } from './utils/llmContextHelper.js';

class SpunkiApp {
    constructor() {
        this.appCore = null;
        this.editors = {};
        this.developmentMode = this.isDevelopmentMode();
        this.developerModeEnabled = false; // New: Developer Mode state
        console.log(`🎵 Development mode: ${this.developmentMode ? 'ON' : 'OFF'}`);
    }

    async init() {
        console.log('🎵 Initializing Sprunki Creative Studio...');

        try {
            // Initialize core application
            this.appCore = new AppCore();
            await this.appCore.init();

            // Initialize testing framework in development mode
            if (this.developmentMode) {
                await this.initializeTestFramework();
            }

            // Initialize Performance Stage first (foundation for unified authoring)
            this.editors.stage = await this.createPerformanceStage();

            // Initialize unified editors with stage integration
            this.editors.character = await this.createCharacterEditor();
            this.editors.music = new PlaceholderEditor('music', this.appCore.getEventBus());
            this.editors.animation = await this.createAnimationTimelineEditor();

            // Initialize placeholder editors (non-async) 
            await this.editors.music.init();

            // Register editors with the core
            Object.entries(this.editors).forEach(([name, editor]) => {
                this.appCore.registerModule(name, editor);
            });

            // Set up UI interactions
            this.setupNavigation();
            this.setupProjectControls();
            this.setupUnifiedAuthoringControls();
            this.setupDeveloperMode(); // New: Setup Developer Mode controls

            // Set up global event listeners
            this.setupGlobalEventListeners();

            // Show initial message in console
            console.log('🎉 Sprunki Creative Studio initialized successfully!');
            console.log('🎭 Performance Stage is ready for unified authoring!');
            
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

    async createCharacterEditor() {
        console.log('🎨 Creating Drawing Window...'); // Updated log
        const editorContainer = document.getElementById('character-editor');
        if (!editorContainer) {
            console.warn('Character editor container (#character-editor) not found. Drawing Window will not be initialized.'); // Updated log
            // Return a placeholder or handle error appropriately if DrawingWindow cannot be created
            // For now, let's assume we might want a specific placeholder for this.
            // Or, if DrawingWindow is critical, we might throw an error or return a more specific null/error object.
            // For consistency with existing pattern:
            return new PlaceholderEditor('drawing-window-placeholder', this.appCore.getEventBus()); 
        }

        const characterEditor = new DrawingWindow( // Instantiating DrawingWindow
            editorContainer,                     // Correct container
            this.appCore.getEventBus()           // Correct eventBus
            // No stateManager needed for DrawingWindow's current constructor
        );
        
        // Constructor of DrawingWindow calls init(), so this explicit call is redundant
        // and was causing duplicate event listener registration.
        // await characterEditor.init(); 
        console.log('SpunkiApp: DrawingWindow instance created, constructor handles init.');
        return characterEditor;
    }

    async createAnimationTimelineEditor() {
        console.log('🎬 Creating Animation Timeline Editor with stage integration...');
        
        // Create Animation Timeline Editor instance with Performance Stage integration
        const animationEditor = new AnimationTimelineEditor(
            this.editors.stage,
            this.appCore.getEventBus(),
            this.appCore.getStateManager()
        );
        
        // Initialize Animation Timeline Editor
        await animationEditor.initialize();
        
        console.log('🎬 Animation Timeline Editor created and initialized with stage integration');
        return animationEditor;
    }

    setupUnifiedAuthoringControls() {
        console.log('🎭 Setting up unified authoring controls...');
        // Move authoring controls into the stage area
        const stagePanel = document.getElementById('performance-stage');
        if (stagePanel) {
            // const authoringControls = document.createElement('div');
            // authoringControls.id = 'authoring-controls';
            // authoringControls.style.cssText = `
            //     padding: 15px;
            //     background: rgba(255, 255, 255, 0.95);
            //     border-bottom: 1px solid #ddd;
            //     display: flex;
            //     gap: 10px;
            //     align-items: center;
            //     justify-content: center;
            // `;
            // authoringControls.innerHTML = `
            //     <h4 style="margin: 0; color: #333;">🎨 Unified Stage Authoring</h4>
            //     <button id="start-character-drawing" style="padding: 10px 20px; background: #007acc; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
            //         Start Drawing on Stage
            //     </button>
            //     <button id="stop-character-drawing" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;" disabled>
            //         Exit Drawing Mode
            //     </button>
            //     <button id="start-animation-timeline" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
            //         🎬 Animation Timeline
            //     </button>
            //     <button id="stop-animation-timeline" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;" disabled>
            //         Exit Timeline
            //     </button>
            // `;
            // stagePanel.insertBefore(authoringControls, stagePanel.firstChild);
            console.log('🎭 [INFO] Unified Stage Authoring controls UI creation has been disabled.');
            // if (startCharDrawingBtn) {
            //     startCharDrawingBtn.addEventListener('click', () => {
            //         this.startCharacterDrawing();
            //         if(startCharDrawingBtn) startCharDrawingBtn.disabled = true;
            //         if(stopCharDrawingBtn) stopCharDrawingBtn.disabled = false;
            //         if(startAnimTimelineBtn) startAnimTimelineBtn.disabled = true;
            //         if(stopAnimTimelineBtn) stopAnimTimelineBtn.disabled = true;
            //     });
            // }
            // if (stopCharDrawingBtn) {
            //     stopCharDrawingBtn.addEventListener('click', () => {
            //         this.stopCharacterDrawing();
            //         if(startCharDrawingBtn) startCharDrawingBtn.disabled = false;
            //         if(stopCharDrawingBtn) stopCharDrawingBtn.disabled = true;
            //         if(startAnimTimelineBtn) startAnimTimelineBtn.disabled = false;
            //         // stopAnimTimelineBtn state depends on whether animation was running
            //     });
            // }
        } 
        console.log('🎭 Unified authoring controls set up');
    }

    startCharacterDrawing() {
        console.log('🎨 Attempted to call startCharacterDrawing() - This functionality is being deprecated.');
        // console.log('🎨 Starting character drawing on stage...');
        // if (this.editors.stage && typeof this.editors.stage.setAuthoringMode === 'function') {
        //     this.editors.stage.setAuthoringMode('character');
        //     this.showNotification('Character drawing mode activated!', 'info');
        //     console.log('[SpunkiApp] SUCCESS: 🎨 Character drawing mode activated on stage!');
            
        //     // Additional logic for character drawing mode if needed
        //     // e.g., show specific tools, hide others
        //     document.body.classList.add('character-drawing-active');
        //     this.appCore.getEventBus().emit('character_editor:drawing_started');

        // } else {
        //     console.error('[SpunkiApp] ERROR: PerformanceStage not available or setAuthoringMode is not a function.');
        //     this.showErrorMessage('Could not activate character drawing mode.');
        // }
    }

    stopCharacterDrawing() {
        console.log('🎨 Attempted to call stopCharacterDrawing() - This functionality is being deprecated.');
        // console.log('🎨 Stopping character drawing...');
        // if (this.editors.stage && typeof this.editors.stage.setAuthoringMode === 'function') {
        //     this.editors.stage.setAuthoringMode('default');
        //     this.showNotification('Character drawing mode deactivated', 'info');
        //     console.log('[SpunkiApp] SUCCESS: 🎨 Character drawing mode deactivated on stage!');
            
        //     // Additional logic for character drawing mode if needed
        //     // e.g., hide specific tools, show others
        //     document.body.classList.remove('character-drawing-active');
        //     this.appCore.getEventBus().emit('character_editor:drawing_stopped');

        // } else {
        //     console.error('[SpunkiApp] ERROR: PerformanceStage not available or setAuthoringMode is not a function.');
        //     this.showErrorMessage('Could not deactivate character drawing mode.');
        // }
        // Stop character editing mode
        if (this.editors.character && this.editors.character.stopCharacterEditing) {
            this.editors.character.stopCharacterEditing();
        }
        
        // Update button states
        document.getElementById('start-character-drawing').disabled = false;
        document.getElementById('stop-character-drawing').disabled = true;
        
        this.showNotification('🎨 Character drawing mode deactivated', 'info');
    }

    startAnimationTimeline() {
        console.log('🎬 Starting animation timeline on stage...');
        
        // Switch to stage view if not already there
        if (this.currentView !== 'stage') {
            this.switchView('stage');
        }
        
        // Start animation timeline mode
        if (this.editors.animation && this.editors.animation.startTimelineEditing) {
            this.editors.animation.startTimelineEditing();
        }
        
        // Update button states
        document.getElementById('start-animation-timeline').disabled = true;
        document.getElementById('stop-animation-timeline').disabled = false;
        
        this.showNotification('🎬 Animation timeline activated on stage!', 'success');
    }

    stopAnimationTimeline() {
        console.log('🎬 Stopping animation timeline...');
        
        // Stop animation timeline mode
        if (this.editors.animation && this.editors.animation.stopTimelineEditing) {
            this.editors.animation.stopTimelineEditing();
        }
        
        // Update button states
        document.getElementById('start-animation-timeline').disabled = false;
        document.getElementById('stop-animation-timeline').disabled = true;
        
        this.showNotification('🎬 Animation timeline deactivated', 'info');
    } // End of stopAnimationTimeline

    addTestData() {
        console.log('🧪 Adding test data for Performance Stage demonstration...');
        
        const stateManager = this.appCore.getStateManager(); // Assuming this.appCore is accessible
        const eventBus = this.appCore.getEventBus(); // Assuming this.appCore is accessible
        
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
        stateManager.set('projectData.characters', testCharacters);
        
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
        
        stateManager.set('projectData.stages.main', stageLayout);
        
        // Add stage controls
        this.addStageControls();
        
        console.log('🧪 Test data added - 3 Sprunki characters placed on stage!');
        eventBus.emit('test:data-loaded');
    } // End of addTestData

    setupDeveloperMode() {
        // Remove floating gear logic (no-op)
        // Setup unified settings panel logic
        const settingsBtn = document.getElementById('settings');
        const settingsPanel = document.getElementById('settings-panel');
        const closeSettingsBtn = document.getElementById('close-settings-panel');
        
        // Show/hide settings panel
        if (settingsBtn && settingsPanel) {
            settingsBtn.addEventListener('click', () => {
                settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'flex' : 'none';
            });
        }
        if (closeSettingsBtn && settingsPanel) {
            closeSettingsBtn.addEventListener('click', () => {
                settingsPanel.style.display = 'none';
            });
        }
        // Wire up toggles
        const devModeToggle = document.getElementById('toggle-developer-mode');
        const debugModeToggle = document.getElementById('toggle-debug-mode');
        const consoleLoggerToggle = document.getElementById('toggle-console-logger');
        const testsPanelToggle = document.getElementById('toggle-tests-panel');
        // Restore toggle states from localStorage
        devModeToggle.checked = localStorage.getItem('sprunki-developer-mode') === 'true';
        debugModeToggle.checked = localStorage.getItem('sprunki-debug-mode') === 'true';
        consoleLoggerToggle.checked = localStorage.getItem('sprunki-console-logger') === 'true';
        testsPanelToggle.checked = localStorage.getItem('sprunki-tests-panel') === 'true';
        // Developer Mode
        devModeToggle.addEventListener('change', (e) => {
            this.setDeveloperMode(e.target.checked);
        });
        // Debug Mode
        debugModeToggle.addEventListener('change', (e) => {
            this.setDebugMode(e.target.checked);
        });
        // Console Logger
        consoleLoggerToggle.addEventListener('change', (e) => {
            this.toggleConsoleLogger(e.target.checked);
            localStorage.setItem('sprunki-console-logger', e.target.checked ? 'true' : 'false');
        });
        // Tests Panel
        testsPanelToggle.addEventListener('change', (e) => {
            this.toggleTestsButton(e.target.checked);
            localStorage.setItem('sprunki-tests-panel', e.target.checked ? 'true' : 'false');
        });
        // Initial state
        this.setDeveloperMode(devModeToggle.checked);
        this.setDebugMode(debugModeToggle.checked);
        this.toggleConsoleLogger(consoleLoggerToggle.checked);
        this.toggleTestsButton(testsPanelToggle.checked);
    }

    toggleDeveloperMode() {
        this.setDeveloperMode(!this.developerModeEnabled);
    }

    setDeveloperMode(enabled) {
        this.developerModeEnabled = enabled;
        
        // Update toggle button appearance
        this.updateDeveloperModeToggle(enabled);
        
        // Show/hide developer tools
        this.toggleDeveloperTools(enabled);
        
        console.log(`⚙️ Developer Mode: ${enabled ? 'ENABLED' : 'DISABLED'}`);
        
        // Store preference in localStorage
        localStorage.setItem('sprunki-developer-mode', enabled ? 'true' : 'false');
    }
    
    updateDeveloperModeToggle(enabled) {
        const toggle = document.getElementById('developer-mode-toggle');
        if (toggle) {
            if (enabled) {
                toggle.classList.add('active');
                toggle.style.background = '#4CAF50';
                toggle.title = 'Developer Mode: ON (click to hide developer tools)';
            } else {
                toggle.classList.remove('active');
                toggle.style.background = '';
                toggle.title = 'Developer Mode: OFF (click to show developer tools)';
            }
        }
    }
    
    toggleDeveloperTools(enabled) {
        // Show/hide Console Logger button
        this.toggleConsoleLogger(enabled);
        
        // Show/hide Tests button
        this.toggleTestsButton(enabled);
        
        // Show/hide debug checkbox
        this.toggleDebugCheckbox(enabled);
    }
    
    toggleConsoleLogger(enabled) {
        // Try to access through global reference first
        if (window.consoleLogger && window.consoleLogger.toggleButton) {
            window.consoleLogger.toggleButton.style.display = enabled ? 'block' : 'none';
            return;
        }
        
        // Fallback: find by text content
        const allButtons = document.querySelectorAll('button');
        for (const btn of allButtons) {
            if (btn.textContent.includes('📋 Console') && btn.style.position === 'fixed') {
                btn.style.display = enabled ? 'block' : 'none';
                break;
            }
        }
    }
    
    toggleTestsButton(enabled) {
        // Try to access through TestFramework reference
        if (this.testFramework && this.testFramework.toggleButton) {
            this.testFramework.toggleButton.style.display = enabled ? 'block' : 'none';
            return;
        }
        
        // Fallback: find by text content
        const allButtons = document.querySelectorAll('button');
        for (const btn of allButtons) {
            if (btn.textContent.includes('🧪 Tests') && btn.style.position === 'fixed') {
                btn.style.display = enabled ? 'block' : 'none';
                break;
            }
        }
    }
    
    toggleDebugCheckbox(enabled) {
        const debugCheckbox = document.getElementById('debug-mode');
        if (debugCheckbox) {
            const debugLabel = debugCheckbox.parentElement;
            if (debugLabel) {
                debugLabel.style.display = enabled ? 'inline-block' : 'none';
            }
        }
    }

    setDebugMode(enabled) {
        // Set debug mode on the EventBus
        if (this.appCore) {
            this.appCore.getEventBus().setDebugMode(enabled);
        }
        
        // Update debug checkbox state
        const debugCheckbox = document.getElementById('debug-mode');
        if (debugCheckbox) {
            debugCheckbox.checked = enabled;
        }
        
        console.log(`🐛 Debug Mode: ${enabled ? 'ENABLED' : 'DISABLED'}`);
        
        // Store preference in localStorage
        localStorage.setItem('sprunki-debug-mode', enabled ? 'true' : 'false');
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
            this.appCore.getStateManager().set('ui.debugMode', e.target.checked);
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
        const currentCharacters = this.appCore.getStateManager().get('projectData.characters') || [];
        currentCharacters.push(newCharacter);
        this.appCore.getStateManager().set('projectData.characters', currentCharacters);
        
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
                
                // Safely update metrics with fallback values
                const currentTime = metrics.currentTime || 0;
                const fps = metrics.fps || 0;
                
                document.getElementById('stage-time').textContent = `${currentTime.toFixed(2)}s`;
                document.getElementById('stage-fps').textContent = `${fps.toFixed(1)}`;
            }
        }, 100);
    }

    setupNavigation() {
        // Setup main navigation buttons
        const navButtons = document.querySelectorAll('.nav-btn[data-mode]');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const viewName = e.currentTarget.getAttribute('data-mode');
                this.switchView(viewName);
                
                // Update active state
                navButtons.forEach(btn => btn.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // Emit navigation event
                this.appCore.getEventBus().emit('nav:tab-clicked', viewName);
            });
        });

        // Setup character editor launch button
        const launchCharacterEditor = document.getElementById('launch-character-editor');
        if (launchCharacterEditor) {
            launchCharacterEditor.addEventListener('click', () => {
                this.launchCharacterCreator();
            });
        }
    }

    switchView(viewName) {
        console.log(`[SpunkiApp] Switching to view: ${viewName}`);

        // Hide all panels
        document.querySelectorAll('.editor-panel').forEach(panel => {
            panel.classList.add('hidden');
            panel.classList.remove('active');
        });

        // Show selected panel - handle both new and old naming
        let targetPanel;
        if (viewName === 'stage') {
            targetPanel = document.getElementById('performance-stage');
        } else {
            targetPanel = document.getElementById(`${viewName}-editor`);
        }
        
        if (targetPanel) {
            targetPanel.classList.remove('hidden');
            targetPanel.classList.add('active');
        } else {
            console.warn(`[SpunkiApp] Could not find panel for view: ${viewName}`);
        }

        this.currentView = viewName;

        // Notify the editor that it's now active
        if (this.editors[viewName] && this.editors[viewName].onActivate) {
            this.editors[viewName].onActivate();
        }

        // Update state
        this.appCore.getStateManager().setActiveView(viewName);
    }

    launchCharacterCreator() {
        console.log('🎨 Launching standalone character creator...');
        
        // Open character creator in new window/tab
        const characterCreatorUrl = './character/drawing-window-demo.html';
        const newWindow = window.open(
            characterCreatorUrl, 
            'character-creator',
            'width=1200,height=800,scrollbars=yes,resizable=yes'
        );
        
        if (newWindow) {
            newWindow.focus();
            this.showNotification('🎨 Character creator opened in new window', 'success');
        } else {
            // Fallback: try to open in same tab
            window.location.href = characterCreatorUrl;
        }
        
        // Track character creator usage
        this.appCore.getEventBus().emit('character:creator-launched');
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

    async initializeTestFramework() {
        console.log('🧪 Initializing Test Framework...');
        
        // Initialize development utilities
        if (this.developmentMode) {
            console.log('🔍 Development mode detected - initializing utilities...');
            PathValidator.logAvailablePaths();
            LLMContextHelper.logContext();
        }

        // Create and configure test framework instance
        this.testFramework = new TestFramework();
        
        // Initialize core tests
        const coreTests = new CoreTests(this.testFramework);
        await coreTests.init();
        
        // Initialize integration tests
        const integrationTests = new IntegrationTests();
        await integrationTests.init();
        
        // Run all tests
        const results = await this.testFramework.runAll();
        
        console.log('🧪 Test Framework initialized and tests completed:', results);
    }

    isDevelopmentMode() {
        // Check for development indicators
        return (
            // URL contains localhost or development indicators
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.port !== '' ||
            // URL parameters to force development mode
            new URLSearchParams(window.location.search).has('dev') ||
            new URLSearchParams(window.location.search).has('test') ||
            // Console flag for development
            window.SPRUNKI_DEV_MODE === true
        );
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
