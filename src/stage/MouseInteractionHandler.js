
/**
 * Mouse Interaction Handler
 * 
 * Manages mouse interactions for the Performance Stage including character
 * selection, dragging, and coordinate transformations between canvas and stage space.
 * 
 * @class MouseInteractionHandler
 * @description Provides mouse event handling, character interaction, and coordinate
 *              conversion for stage-based character manipulation and selection.
 */

export class MouseInteractionHandler {
    constructor(canvas, eventBus, stateManager, characterRenderer) {
        this.canvas = canvas;
        this.eventBus = eventBus;
        this.stateManager = stateManager;
        this.characterRenderer = characterRenderer;
        
        // Stage coordinate system
        this.stageWidth = 800;
        this.stageHeight = 600;
        this.renderX = 0;
        this.renderY = 0;
        this.renderWidth = 800;
        this.renderHeight = 600;
        
        // Mouse interaction state
        this.isDragging = false;
        this.dragCharacterId = null;
        this.dragOffset = { x: 0, y: 0 };
        this.lastMousePos = { x: 0, y: 0 };
        
        console.log('🖱️ MouseInteractionHandler: Initialized');
        this.setupMouseEvents();
    }

    /**
     * Set up mouse event listeners
     */
    setupMouseEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.onMouseUp(e));
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        console.log('🖱️ MouseInteractionHandler: Mouse events set up');
    }

    /**
     * Update coordinate system for proper mouse-to-stage coordinate conversion
     */
    updateCoordinateSystem(renderX, renderY, renderWidth, renderHeight) {
        this.renderX = renderX;
        this.renderY = renderY;
        this.renderWidth = renderWidth;
        this.renderHeight = renderHeight;
    }
    
    /**
     * Handle mouse down events - character selection and drag start
     */
    onMouseDown(e) {
        const pos = this.getCanvasPosition(e.clientX, e.clientY);
        this.lastMousePos = pos;
        
        // Check if clicking on a character
        const characterId = this.characterRenderer.getCharacterAtPosition(pos.x, pos.y);
        
        if (characterId) {
            console.log('🖱️ MouseInteractionHandler: Character selected:', characterId);
            
            // Set up dragging
            this.isDragging = true;
            this.dragCharacterId = characterId;
            
            // Calculate drag offset
            const stageData = this.stateManager.get('project.stages.main');
            const placement = stageData?.characters?.find(p => p.characterId === characterId);
            if (placement) {
                this.dragOffset = {
                    x: pos.x - (placement.x || 400),
                    y: pos.y - (placement.y || 300)
                };
            }
            
            // Update UI state
            this.stateManager.set('ui.selectedCharacter', characterId);
            
            // Visual feedback
            this.canvas.style.cursor = 'grabbing';
            
            this.eventBus.emit('stage:character_selected', { characterId });
        } else {
            // Clear selection
            this.stateManager.set('ui.selectedCharacter', null);
            this.eventBus.emit('stage:selection_cleared');
            console.log('🖱️ MouseInteractionHandler: Selection cleared');
        }
        
        // Emit mouse down event for other systems
        this.eventBus.emit('stage:mouse_down', { 
            position: pos,
            characterId: characterId || null
        });
    }
    
    /**
     * Handle mouse move events - character dragging and cursor updates
     */
    onMouseMove(e) {
        const pos = this.getCanvasPosition(e.clientX, e.clientY);
        
        if (this.isDragging && this.dragCharacterId) {
            // Update character position during drag
            const newX = pos.x - this.dragOffset.x;
            const newY = pos.y - this.dragOffset.y;
            
            this.eventBus.emit('stage:character_moved', {
                characterId: this.dragCharacterId,
                x: newX,
                y: newY
            });
        } else {
            // Update cursor based on what's under mouse
            const characterId = this.characterRenderer.getCharacterAtPosition(pos.x, pos.y);
            this.canvas.style.cursor = characterId ? 'grab' : 'crosshair';
        }
        
        this.lastMousePos = pos;
        
        // Emit mouse move event for other systems
        this.eventBus.emit('stage:mouse_move', { 
            position: pos,
            isDragging: this.isDragging,
            dragCharacterId: this.dragCharacterId
        });
    }
    
    /**
     * Handle mouse up events - end dragging operations
     */
    onMouseUp(e) {
        if (this.isDragging && this.dragCharacterId) {
            console.log('🖱️ MouseInteractionHandler: Character drag completed:', this.dragCharacterId);
            
            this.eventBus.emit('stage:character_drag_completed', {
                characterId: this.dragCharacterId
            });
        }
        
        // Reset drag state
        this.isDragging = false;
        this.dragCharacterId = null;
        this.dragOffset = { x: 0, y: 0 };
        
        // Reset cursor based on current mouse position
        const pos = this.getCanvasPosition(e.clientX, e.clientY);
        const characterId = this.characterRenderer.getCharacterAtPosition(pos.x, pos.y);
        this.canvas.style.cursor = characterId ? 'grab' : 'crosshair';
        
        // Emit mouse up event for other systems
        this.eventBus.emit('stage:mouse_up', { 
            position: pos,
            wasCharacterDrag: this.dragCharacterId !== null
        });
    }

    /**
     * Convert client coordinates to stage coordinates
     */
    getCanvasPosition(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        
        // Get raw canvas coordinates
        const canvasX = clientX - rect.left;
        const canvasY = clientY - rect.top;
        
        // Convert to stage coordinates (0-800, 0-600) accounting for letterboxing
        const stageX = ((canvasX - this.renderX) / this.renderWidth) * this.stageWidth;
        const stageY = ((canvasY - this.renderY) / this.renderHeight) * this.stageHeight;
        
        return { x: stageX, y: stageY };
    }

    /**
     * Convert stage coordinates to canvas coordinates
     */
    getCanvasFromStagePosition(stageX, stageY) {
        const canvasX = this.renderX + (stageX / this.stageWidth) * this.renderWidth;
        const canvasY = this.renderY + (stageY / this.stageHeight) * this.renderHeight;
        
        return { x: canvasX, y: canvasY };
    }

    /**
     * Get current interaction state
     */
    getInteractionState() {
        return {
            isDragging: this.isDragging,
            dragCharacterId: this.dragCharacterId,
            lastMousePos: { ...this.lastMousePos },
            dragOffset: { ...this.dragOffset }
        };
    }

    /**
     * Check if a point is within the stage render area
     */
    isPointInStage(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = clientX - rect.left;
        const canvasY = clientY - rect.top;
        
        return canvasX >= this.renderX && 
               canvasX <= this.renderX + this.renderWidth &&
               canvasY >= this.renderY && 
               canvasY <= this.renderY + this.renderHeight;
    }

    destroy() {
        console.log('🖱️ MouseInteractionHandler: Destroying...');
        
        // Remove event listeners
        this.canvas.removeEventListener('mousedown', this.onMouseDown);
        this.canvas.removeEventListener('mousemove', this.onMouseMove);
        this.canvas.removeEventListener('mouseup', this.onMouseUp);
        this.canvas.removeEventListener('mouseleave', this.onMouseUp);
        this.canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
        
        console.log('🖱️ MouseInteractionHandler: Destroyed');
    }
}
