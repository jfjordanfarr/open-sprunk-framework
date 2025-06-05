// MDMD Source: docs/Specification/Implementations/character/character-editor-class.mdmd

/**
 * Character Editor Class
 * 
 * Stage-integrated character editor providing drawing tools as overlay on Performance Stage.
 * Implements unified authoring experience with immediate visual feedback in performance context.
 * 
 * @class CharacterEditor
 * @description Provides character creation and editing capabilities directly on the Performance Stage
 *              through context-aware UI overlays, ensuring proper scale/positioning and immediate
 *              visual feedback during authoring.
 */

import { DrawingCanvas } from './DrawingCanvas.js';

export class CharacterEditor {
    constructor(performanceStage, eventBus, stateManager) {
        this.performanceStage = performanceStage; // Reference to Performance Stage instance
        this.eventBus = eventBus;
        this.stateManager = stateManager;
        this.drawingCanvas = null;
        
        // Current editing state
        this.characterData = {}; // Current character being edited
        this.activeCharacterId = null;
        this.isEditMode = false;
        
        // Stage integration components
        this.editOverlay = null;
        this.toolsPanel = null;
        this.characterPreview = null;
        
        console.log('🎨 CharacterEditor: Constructor initialized with stage integration');
    }

    async initialize() {
        console.log('🎨 CharacterEditor: Initializing stage-integrated character editor...');
        try {
            // Wait for stage canvas to exist and be initialized
            if (!this.stageCanvas || !this.stageCanvas.parentElement) {
                // Try to get the canvas from performanceStage
                this.stageCanvas = this.performanceStage.canvas;
            }
            if (!this.stageCanvas || !this.stageCanvas.parentElement) {
                throw new Error('CharacterEditor: Stage canvas is not available or not attached to DOM.');
            }
            // Create stage integration overlay
            this.createStageIntegrationOverlay();
            
            // Initialize drawing canvas with stage coordination
            await this.initializeDrawingCanvas();
            
            // Create drawing tools UI
            this.createDrawingToolsUI();
            
            // Register with Performance Stage
            this.performanceStage.registerAuthoringOverlay('character', this.editOverlay);
            
            // Set up event handlers
            this.setupEventHandlers();
            
            console.log('🎨 CharacterEditor: Initialization complete');
        } catch (error) {
            console.error('🎨 CharacterEditor: Initialization failed:', error);
            throw error;
        }
    }

    createStageIntegrationOverlay() {
        // Extra safety: check for stageCanvas and parentElement
        if (!this.stageCanvas || !this.stageCanvas.parentElement) {
            console.error('CharacterEditor: Cannot create overlay, stageCanvas or parentElement missing.');
            return;
        }
        // Create main edit overlay that integrates with stage
        this.editOverlay = document.createElement('div');
        this.editOverlay.id = 'character-edit-overlay';
        this.editOverlay.className = 'stage-authoring-overlay';
        // Insert overlay into stage container
        const stageContainer = this.stageCanvas.parentElement;
        stageContainer.style.position = 'relative';
        stageContainer.appendChild(this.editOverlay);
        // Ensure overlay always matches stage canvas size
        this.syncOverlaySize = () => {
            const rect = this.stageCanvas.getBoundingClientRect();
            this.editOverlay.style.width = this.stageCanvas.offsetWidth + 'px';
            this.editOverlay.style.height = this.stageCanvas.offsetHeight + 'px';
            this.editOverlay.style.left = this.stageCanvas.offsetLeft + 'px';
            this.editOverlay.style.top = this.stageCanvas.offsetTop + 'px';
        };
        window.addEventListener('resize', this.syncOverlaySize);
        this.syncOverlaySize();
        
        console.log('🎨 CharacterEditor: Stage integration overlay created');
    }

    async initializeDrawingCanvas() {
        // Get stage coordinate system
        const coordinateSystem = this.performanceStage.getCoordinateSystem();
        
        // Create drawing canvas container within the overlay
        const canvasContainer = document.createElement('div');
        canvasContainer.id = 'character-drawing-container';
        canvasContainer.className = 'character-drawing-container';
        
        this.editOverlay.appendChild(canvasContainer);
        
        // Initialize Fabric.js drawing canvas
        this.drawingCanvas = new DrawingCanvas(canvasContainer, this.eventBus, {
            stageIntegrated: true,
            coordinateSystem: coordinateSystem,
            transparentBackground: true
        });
        
        await this.drawingCanvas.initialize();
        
        console.log('🎨 CharacterEditor: Drawing canvas initialized with stage coordination');
    }

    createDrawingToolsUI() {
        // Create floating tools panel positioned to not overlap drawing area
        this.toolsPanel = document.createElement('div');
        this.toolsPanel.id = 'character-drawing-tools';
        this.toolsPanel.className = 'character-drawing-tools';
        
        this.toolsPanel.innerHTML = `
            <h3>Character Drawing</h3>
            
            <div class="tool-section">
                <label>Tools</label>
                <div class="tool-buttons">
                    <button data-tool="brush" class="tool-btn active">Brush</button>
                    <button data-tool="eraser" class="tool-btn">Eraser</button>
                    <button data-tool="shape" class="tool-btn">Shapes</button>
                </div>
            </div>
            
            <div class="tool-section">
                <label>Brush Size</label>
                <input type="range" id="brush-size" min="1" max="50" value="5">
                <span id="brush-size-display">5px</span>
            </div>
            
            <div class="tool-section">
                <label>Color</label>
                <input type="color" id="brush-color" value="#000000">
            </div>
            
            <div class="action-buttons">
                <button id="clear-canvas">Clear</button>
                <button id="save-character">Save</button>
            </div>
        `;
        
        this.editOverlay.appendChild(this.toolsPanel);
        
        // Set up tool interactions
        this.setupToolsInteraction();
        
        console.log('🎨 CharacterEditor: Drawing tools UI created');
    }

    setupToolsInteraction() {
        // Tool selection
        this.toolsPanel.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active tool
                this.toolsPanel.querySelectorAll('.tool-btn').forEach(b => {
                    b.classList.remove('active');
                });
                
                e.target.classList.add('active');
                
                const tool = e.target.dataset.tool;
                this.setActiveTool(tool);
            });
        });
        
        // Brush size
        const brushSize = this.toolsPanel.querySelector('#brush-size');
        const brushSizeDisplay = this.toolsPanel.querySelector('#brush-size-display');
        brushSize.addEventListener('input', (e) => {
            const size = e.target.value;
            brushSizeDisplay.textContent = `${size}px`;
            this.setBrushSize(parseInt(size));
        });
        
        // Color picker
        const colorPicker = this.toolsPanel.querySelector('#brush-color');
        colorPicker.addEventListener('input', (e) => {
            this.setBrushColor(e.target.value);
        });
        
        // Action buttons
        this.toolsPanel.querySelector('#clear-canvas').addEventListener('click', () => {
            this.clearCanvas();
        });
        
        this.toolsPanel.querySelector('#save-character').addEventListener('click', () => {
            this.saveCharacter();
        });
    }

    setupEventHandlers() {
        // Stage authoring mode events
        this.eventBus.on('stage:authoring_mode_changed', (data) => {
            if (data.currentMode === 'character') {
                this.onCharacterModeEntered();
            } else {
                this.onCharacterModeExited();
            }
        });
        
        // Character selection events
        this.eventBus.on('stage:character_selected', (data) => {
            this.loadCharacterForEditing(data.characterId);
        });
        
        // Drawing canvas events
        this.eventBus.on('canvas:drawing_completed', (data) => {
            this.onDrawingCompleted(data);
        });
        
        this.eventBus.on('stage:edit_mode_entered', () => this.enterDrawingMode());
        this.eventBus.on('stage:edit_mode_exited', () => this.exitDrawingMode());
        
        console.log('🎨 CharacterEditor: Event handlers set up');
    }

    // PUBLIC API METHODS

    startCharacterEditing(characterId = null) {
        console.log('🎨 CharacterEditor: Starting character editing...', characterId);
        
        // Set authoring mode to character
        this.performanceStage.setAuthoringMode('character');
        this.performanceStage.enterEditMode();
        
        // Load character if specified
        if (characterId) {
            this.loadCharacterForEditing(characterId);
        } else {
            this.createNewCharacter();
        }
        
        this.isEditMode = true;
        
        this.eventBus.emit('character_editor:started', {
            characterId: this.activeCharacterId
        });
    }

    stopCharacterEditing() {
        console.log('🎨 CharacterEditor: Stopping character editing...');
        
        this.performanceStage.exitEditMode();
        this.isEditMode = false;
        this.activeCharacterId = null;
        
        this.eventBus.emit('character_editor:stopped');
    }

    // TOOL METHODS

    setActiveTool(tool) {
        if (this.drawingCanvas) {
            this.drawingCanvas.setActiveTool(tool);
        }
        console.log('🎨 CharacterEditor: Active tool set to:', tool);
    }

    setBrushSize(size) {
        if (this.drawingCanvas) {
            this.drawingCanvas.setBrushSize(size);
        }
    }

    setBrushColor(color) {
        if (this.drawingCanvas) {
            this.drawingCanvas.setBrushColor(color);
        }
    }

    clearCanvas() {
        if (this.drawingCanvas) {
            this.drawingCanvas.clear();
        }
        console.log('🎨 CharacterEditor: Canvas cleared');
    }

    saveCharacter() {
        if (!this.drawingCanvas) return;
        
        const characterData = this.drawingCanvas.exportCharacterData();
        
        // Save to state manager
        this.stateManager.set(`characters.${this.activeCharacterId}`, characterData);
        
        // Emit save event
        this.eventBus.emit('character:saved', {
            characterId: this.activeCharacterId,
            data: characterData
        });
        
        console.log('🎨 CharacterEditor: Character saved:', this.activeCharacterId);
    }

    // PRIVATE METHODS

    onCharacterModeEntered() {
        console.log('🎨 CharacterEditor: Character authoring mode entered');
        // Additional setup when character mode is activated
    }

    onCharacterModeExited() {
        console.log('🎨 CharacterEditor: Character authoring mode exited');
        // Cleanup when leaving character mode
    }

    loadCharacterForEditing(characterId) {
        this.activeCharacterId = characterId;
        
        // Load character data from state manager
        const characterData = this.stateManager.get(`characters.${characterId}`);
        
        if (characterData && this.drawingCanvas) {
            this.drawingCanvas.loadCharacterData(characterData);
        }
        
        console.log('🎨 CharacterEditor: Character loaded for editing:', characterId);
    }

    createNewCharacter() {
        this.activeCharacterId = `character_${Date.now()}`;
        this.characterData = {
            id: this.activeCharacterId,
            name: `Character ${this.activeCharacterId}`,
            created: new Date().toISOString()
        };
        
        console.log('🎨 CharacterEditor: New character created:', this.activeCharacterId);
    }

    onDrawingCompleted(data) {
        // Auto-save when drawing is completed
        this.saveCharacter();
    }

    enterDrawingMode() {
        // Show overlay and enable interactions
        if (this.editOverlay) {
            this.editOverlay.style.display = 'block';
            this.editOverlay.style.pointerEvents = 'none'; // Keep transparent for non-UI areas
        }
        console.log('🎨 CharacterEditor: Drawing mode entered - UI controls should remain interactive');
    }

    exitDrawingMode() {
        // Hide overlay and disable interactions
        if (this.editOverlay) {
            this.editOverlay.style.display = 'none';
        }
        console.log('🎨 CharacterEditor: Drawing mode exited');
    }

    destroy() {
        console.log('🎨 CharacterEditor: Destroying...');
        
        // Clean up drawing canvas
        if (this.drawingCanvas) {
            this.drawingCanvas.destroy();
        }
        
        // Remove overlay elements
        if (this.editOverlay && this.editOverlay.parentNode) {
            this.editOverlay.parentNode.removeChild(this.editOverlay);
        }
        
        console.log('🎨 CharacterEditor: Destroyed');
    }
}
