/**
 * Character Renderer Class
 * 
 * Handles rendering of characters on the stage with support for animations,
 * transformations, and phase-aware display. This is a foundational component
 * for bringing characters to life on the performance stage.
 */

export class CharacterRenderer {
    constructor(eventBus, stateManager) {
        this.eventBus = eventBus;
        this.stateManager = stateManager;
        
        // Character rendering state
        this.characters = new Map(); // character ID -> character data
        this.characterTextures = new Map(); // character ID -> rendered texture cache
        
        // Rendering settings
        this.defaultSize = 100; // Default character size in pixels
        this.enableAnimations = true;
        this.enablePhases = true;
        
        console.log('🎨 CharacterRenderer: Constructor initialized');
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Character management events
        this.eventBus.on('character:added', (data) => this.onCharacterAdded(data));
        this.eventBus.on('character:removed', (data) => this.onCharacterRemoved(data));
        this.eventBus.on('character:updated', (data) => this.onCharacterUpdated(data));
        
        // Stage placement events
        this.eventBus.on('stage:character_placed', (data) => this.onCharacterPlaced(data));
        this.eventBus.on('stage:character_moved', (data) => this.onCharacterMoved(data));
        
        // Animation events
        this.eventBus.on('animation:character_frame', (data) => this.onAnimationFrame(data));
        
        console.log('🎨 CharacterRenderer: Event handlers set up');
    }

    render(ctx, currentTime) {
        // Get current project characters from state
        const projectData = this.stateManager.getState('project');
        if (!projectData || !projectData.characters) {
            return;
        }

        // Get stage layout information
        const stageData = this.stateManager.getState('project.stages.main') || {
            characters: []
        };

        // Render each character placed on the stage
        for (const placement of stageData.characters) {
            const character = projectData.characters.find(c => c.id === placement.characterId);
            if (character) {
                this.renderCharacter(ctx, character, placement, currentTime);
            }
        }
    }

    renderCharacter(ctx, character, placement, currentTime) {
        ctx.save();
        
        try {
            // Apply transformations
            ctx.translate(placement.x || 400, placement.y || 300); // Default to center
            ctx.scale(placement.scale || 1, placement.scale || 1);
            ctx.rotate((placement.rotation || 0) * Math.PI / 180);
            
            // Get character appearance for current phase/time
            const appearance = this.getCharacterAppearance(character, currentTime);
            
            // Render character based on current implementation state
            this.renderCharacterPlaceholder(ctx, character, appearance);
            
        } catch (error) {
            console.error('🎨 CharacterRenderer: Error rendering character', character.id, error);
            
            // Render error placeholder
            this.renderErrorPlaceholder(ctx, character);
            
        } finally {
            ctx.restore();
        }
    }

    getCharacterAppearance(character, currentTime) {
        // For now, return basic appearance
        // TODO: Implement phase-aware appearance selection
        return {
            color: character.color || '#ff6b6b',
            size: character.size || this.defaultSize,
            shape: character.shape || 'humanoid'
        };
    }

    renderCharacterPlaceholder(ctx, character, appearance) {
        // Render a simple humanoid placeholder
        // This will be replaced with actual character rendering later
        
        const size = appearance.size;
        const color = appearance.color;
        
        // Character body (rectangle for now)
        ctx.fillStyle = color;
        ctx.fillRect(-size/4, -size/2, size/2, size);
        
        // Character head (circle)
        ctx.beginPath();
        ctx.arc(0, -size/2 - size/8, size/8, 0, Math.PI * 2);
        ctx.fill();
        
        // Character label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(character.name || character.id, 0, size/2 + 20);
        
        // Selection indicator if character is selected
        const selectedCharacterId = this.stateManager.getState('ui.selectedCharacter');
        if (selectedCharacterId === character.id) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(-size/4 - 5, -size/2 - size/8 - 5, size/2 + 10, size + size/4 + 10);
        }
    }

    renderErrorPlaceholder(ctx, character) {
        // Render error state
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(-25, -25, 50, 50);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('!', 0, 5);
        
        ctx.font = '10px Arial';
        ctx.fillText('Error', 0, 35);
    }

    /**
     * CHARACTER MANAGEMENT
     */

    onCharacterAdded(data) {
        console.log('🎨 CharacterRenderer: Character added:', data.character.id);
        this.characters.set(data.character.id, data.character);
        
        // Clear texture cache for this character
        this.characterTextures.delete(data.character.id);
    }

    onCharacterRemoved(data) {
        console.log('🎨 CharacterRenderer: Character removed:', data.characterId);
        this.characters.delete(data.characterId);
        this.characterTextures.delete(data.characterId);
    }

    onCharacterUpdated(data) {
        console.log('🎨 CharacterRenderer: Character updated:', data.character.id);
        this.characters.set(data.character.id, data.character);
        
        // Clear texture cache to force re-render
        this.characterTextures.delete(data.character.id);
    }

    /**
     * STAGE PLACEMENT
     */

    onCharacterPlaced(data) {
        console.log('🎨 CharacterRenderer: Character placed on stage:', data);
        
        // Update stage data in state manager
        const currentStage = this.stateManager.getState('project.stages.main') || { characters: [] };
        
        // Check if character is already placed
        const existingIndex = currentStage.characters.findIndex(p => p.characterId === data.characterId);
        
        if (existingIndex >= 0) {
            // Update existing placement
            currentStage.characters[existingIndex] = {
                ...currentStage.characters[existingIndex],
                ...data
            };
        } else {
            // Add new placement
            currentStage.characters.push({
                characterId: data.characterId,
                x: data.x || 400,
                y: data.y || 300,
                scale: data.scale || 1,
                rotation: data.rotation || 0
            });
        }
        
        this.stateManager.setState('project.stages.main', currentStage);
    }

    onCharacterMoved(data) {
        console.log('🎨 CharacterRenderer: Character moved:', data);
        this.onCharacterPlaced(data); // Same logic for now
    }

    /**
     * ANIMATION SUPPORT
     */

    onAnimationFrame(data) {
        // Handle character animation frame updates
        // This will be expanded when animation system is implemented
        console.log('🎨 CharacterRenderer: Animation frame for character:', data.characterId);
    }

    /**
     * UTILITY METHODS
     */

    getCharacterAtPosition(x, y) {
        // Hit testing for character selection
        const stageData = this.stateManager.getState('project.stages.main');
        if (!stageData || !stageData.characters) return null;
        
        // Check each character placement (in reverse order for top-most first)
        for (let i = stageData.characters.length - 1; i >= 0; i--) {
            const placement = stageData.characters[i];
            const size = this.defaultSize; // TODO: Get actual character size
            
            const charX = placement.x || 400;
            const charY = placement.y || 300;
            
            // Simple bounding box check
            if (x >= charX - size/4 && x <= charX + size/4 &&
                y >= charY - size/2 - size/8 && y <= charY + size/2) {
                return placement.characterId;
            }
        }
        
        return null;
    }

    clearTextureCache() {
        console.log('🎨 CharacterRenderer: Clearing texture cache');
        this.characterTextures.clear();
    }

    getCharacterBounds(characterId) {
        const stageData = this.stateManager.getState('project.stages.main');
        if (!stageData || !stageData.characters) return null;
        
        const placement = stageData.characters.find(p => p.characterId === characterId);
        if (!placement) return null;
        
        const size = this.defaultSize; // TODO: Get actual character size
        const x = placement.x || 400;
        const y = placement.y || 300;
        
        return {
            x: x - size/4,
            y: y - size/2 - size/8,
            width: size/2,
            height: size + size/4
        };
    }

    destroy() {
        console.log('🎨 CharacterRenderer: Destroying...');
        
        // Clear caches
        this.characters.clear();
        this.characterTextures.clear();
        
        console.log('🎨 CharacterRenderer: Destroyed');
    }
}
