
/**
 * Authoring Overlay Manager
 * 
 * Manages the unified authoring experience with context-aware UI overlays for
 * different authoring modes (character, animation, music) on the Performance Stage.
 * 
 * @class AuthoringOverlayManager
 * @description Provides overlay management, mode switching, and coordinate system
 *              integration for stage-integrated authoring workflows.
 */

export class AuthoringOverlayManager {
    constructor(canvas, eventBus, stateManager) {
        this.canvas = canvas;
        this.eventBus = eventBus;
        this.stateManager = stateManager;
        
        // Overlay system state
        this.authoringMode = 'performance'; // performance, character, animation, music
        this.overlayContainer = null;
        this.authoringOverlays = new Map(); // Store overlay elements by mode
        this.isAuthoringMode = false;
        
        // Stage coordinate reference
        this.stageWidth = 800;
        this.stageHeight = 600;
        this.renderX = 0;
        this.renderY = 0;
        this.renderWidth = 800;
        this.renderHeight = 600;
        
        console.log('📐 AuthoringOverlayManager: Initialized');
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Mode switching events
        this.eventBus.on('stage:set_authoring_mode', (data) => this.setAuthoringMode(data.mode));
        this.eventBus.on('stage:enter_edit_mode', () => this.enterEditMode());
        this.eventBus.on('stage:exit_edit_mode', () => this.exitEditMode());
        
        console.log('📐 AuthoringOverlayManager: Event handlers set up');
    }

    /**
     * Initialize the overlay system by creating the main overlay container
     */
    initialize() {
        this.setupAuthoringOverlays();
        console.log('📐 AuthoringOverlayManager: Overlay system initialized');
    }

    setupAuthoringOverlays() {
        // Create main overlay container
        this.overlayContainer = document.createElement('div');
        this.overlayContainer.id = 'stage-authoring-overlay';
        this.overlayContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10;
            display: none;
        `;
        
        // Insert overlay into stage container
        const stageContainer = this.canvas.parentElement;
        if (stageContainer) {
            stageContainer.style.position = 'relative';
            stageContainer.appendChild(this.overlayContainer);
            console.log('📐 AuthoringOverlayManager: Overlay container created');
        }
    }
    
    setAuthoringMode(mode) {
        const validModes = ['performance', 'character', 'animation', 'music'];
        if (!validModes.includes(mode)) {
            console.warn('📐 AuthoringOverlayManager: Invalid authoring mode:', mode);
            return;
        }
        
        const previousMode = this.authoringMode;
        this.authoringMode = mode;
        
        // Update UI state
        this.stateManager.set('ui.authoringMode', mode);
        
        // Show/hide appropriate overlays
        this.updateOverlayVisibility();
        
        // Emit mode change event
        this.eventBus.emit('stage:authoring_mode_changed', {
            previousMode,
            currentMode: mode
        });
        
        console.log(`📐 AuthoringOverlayManager: Authoring mode changed to: ${mode}`);
    }
    
    enterEditMode() {
        this.isAuthoringMode = true;
        
        // Show overlay container
        if (this.overlayContainer) {
            this.overlayContainer.style.display = 'block';
        }
        
        // Update mouse cursor for edit context
        this.canvas.style.cursor = 'crosshair';
        
        // Emit edit mode entered
        this.eventBus.emit('stage:edit_mode_entered', {
            authoringMode: this.authoringMode
        });
        
        console.log('📐 AuthoringOverlayManager: Edit mode entered');
    }
    
    exitEditMode() {
        this.isAuthoringMode = false;
        
        // Hide overlay container
        if (this.overlayContainer) {
            this.overlayContainer.style.display = 'none';
        }
        
        // Reset mouse cursor
        this.canvas.style.cursor = 'default';
        
        // Emit edit mode exited
        this.eventBus.emit('stage:edit_mode_exited', {
            authoringMode: this.authoringMode
        });
        
        console.log('📐 AuthoringOverlayManager: Edit mode exited');
    }
    
    updateOverlayVisibility() {
        // Hide all overlays first
        this.authoringOverlays.forEach((overlay, mode) => {
            overlay.style.display = 'none';
        });
        
        // Show overlay for current authoring mode (if in edit mode)
        if (this.isAuthoringMode && this.authoringOverlays.has(this.authoringMode)) {
            const currentOverlay = this.authoringOverlays.get(this.authoringMode);
            currentOverlay.style.display = 'block';
        }
    }
    
    registerAuthoringOverlay(mode, overlayElement) {
        this.authoringOverlays.set(mode, overlayElement);
        
        // Append to overlay container
        if (this.overlayContainer) {
            this.overlayContainer.appendChild(overlayElement);
        }
        
        // Initial visibility state
        overlayElement.style.display = 'none';
        
        console.log(`📐 AuthoringOverlayManager: Overlay registered for mode: ${mode}`);
    }

    /**
     * Update coordinate system references for stage transformations
     */
    updateCoordinateSystem(renderX, renderY, renderWidth, renderHeight) {
        this.renderX = renderX;
        this.renderY = renderY;
        this.renderWidth = renderWidth;
        this.renderHeight = renderHeight;
    }
    
    getCoordinateSystem() {
        return {
            stageWidth: this.stageWidth,
            stageHeight: this.stageHeight,
            renderWidth: this.renderWidth,
            renderHeight: this.renderHeight,
            renderX: this.renderX,
            renderY: this.renderY
        };
    }

    /**
     * Get current authoring state
     */
    getAuthoringState() {
        return {
            mode: this.authoringMode,
            isEditMode: this.isAuthoringMode,
            overlaysCount: this.authoringOverlays.size
        };
    }

    destroy() {
        console.log('📐 AuthoringOverlayManager: Destroying...');
        
        // Remove overlay container
        if (this.overlayContainer && this.overlayContainer.parentElement) {
            this.overlayContainer.parentElement.removeChild(this.overlayContainer);
        }
        
        // Clear overlay references
        this.authoringOverlays.clear();
        
        console.log('📐 AuthoringOverlayManager: Destroyed');
    }
}
