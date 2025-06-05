/**
 * Character Renderer Class
 * 
 * Han    render(ctx, currentTime, stageTransform = null) {
        // Get current project characters from state
        const projectData = this.stateManager.get('project');
        if (!projectData || !projectData.characters) {
            return;
        }

        // Get stage layout information
        const stageData = this.stateManager.get('project.stages.main') || {
            characters: []
        };

        // Render each character placed on the stage
        for (const placement of stageData.characters) {
            const character = projectData.characters.find(c => c.id === placement.characterId);
            if (character) {
                this.renderCharacter(ctx, character, placement, currentTime, stageTransform);
            }
        }
    }aracters on the stage with support for animations,
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
        
        // Rendering settings - sized for ~8 characters on 800px stage width
        this.defaultSize = 40; // Reduced from 60 to allow ~8 characters across stage (800px / 8 = 100px per character slot)
        this.enableAnimations = true;
        this.enablePhases = true;
        
        // Store characters in relative coordinates (0-1) for viewport independence
        this.useRelativeCoordinates = true;
        
        console.log('🎨 CharacterRenderer: Constructor initialized with relative coordinates');
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
        const projectData = this.stateManager.get('project');
        if (!projectData || !projectData.characters) {
            return;
        }

        // Get stage layout information
        const stageData = this.stateManager.get('project.stages.main') || {
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

    renderCharacter(ctx, character, placement, currentTime, stageTransform) {
        ctx.save();
        
        try {
            // Convert stage coordinates to canvas coordinates accounting for letterboxing
            const stageX = placement.x || 400; // Default to stage center
            const stageY = placement.y || 300;
            
            // Apply stage-to-canvas transformation if provided
            let canvasX, canvasY;
            if (stageTransform) {
                // Transform stage coordinates (0-800, 0-600) to canvas coordinates
                canvasX = stageTransform.renderX + (stageX / 800) * stageTransform.renderWidth;
                canvasY = stageTransform.renderY + (stageY / 600) * stageTransform.renderHeight;
            } else {
                // Fallback to direct positioning
                canvasX = stageX;
                canvasY = stageY;
            }
            
            // Apply transformations in canvas space
            ctx.translate(canvasX, canvasY);
            ctx.scale(placement.scale || 1, placement.scale || 1);
            ctx.rotate((placement.rotation || 0) * Math.PI / 180);
            
            // Get character appearance for current phase/time
            const appearance = this.getCharacterAppearance(character, currentTime);
            
            // Scale character size based on stage scale if using stage transform
            if (stageTransform) {
                const stageScale = Math.min(stageTransform.renderWidth / 800, stageTransform.renderHeight / 600);
                appearance.size = (appearance.size || this.defaultSize) * stageScale;
            }
            
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
        // Basic Sprunki: trapezoid body, circle head, two circle hands
        const bodyWidthTop = appearance.size * 0.6;
        const bodyWidthBottom = appearance.size * 1.0;
        const bodyHeight = appearance.size * 1.2;
        const headRadius = appearance.size * 0.28;
        const handRadius = appearance.size * 0.16;
        const bodyColor = appearance.color || '#ff6b6b';
        const headColor = '#fff';
        const handColor = '#fff';

        // Draw trapezoid body
        ctx.beginPath();
        ctx.moveTo(-bodyWidthTop/2, -bodyHeight/2); // top left
        ctx.lineTo(bodyWidthTop/2, -bodyHeight/2); // top right
        ctx.lineTo(bodyWidthBottom/2, bodyHeight/2); // bottom right
        ctx.lineTo(-bodyWidthBottom/2, bodyHeight/2); // bottom left
        ctx.closePath();
        ctx.fillStyle = bodyColor;
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw head (circle)
        ctx.beginPath();
        ctx.arc(0, -bodyHeight/2 - headRadius, headRadius, 0, 2 * Math.PI);
        ctx.fillStyle = headColor;
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw left hand (circle)
        ctx.beginPath();
        ctx.arc(-bodyWidthBottom/2 - handRadius * 0.7, bodyHeight/2 - handRadius, handRadius, 0, 2 * Math.PI);
        ctx.fillStyle = handColor;
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw right hand (circle)
        ctx.beginPath();
        ctx.arc(bodyWidthBottom/2 + handRadius * 0.7, bodyHeight/2 - handRadius, handRadius, 0, 2 * Math.PI);
        ctx.fillStyle = handColor;
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.stroke();
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
        const currentStage = this.stateManager.get('project.stages.main') || { characters: [] };
        
        // Check if character is already placed
        const existingIndex = currentStage.characters.findIndex(p => p.characterId === data.characterId);
        
        // If no position specified, use optimal grid position
        let position = { x: data.x, y: data.y };
        if (!data.x || !data.y) {
            const optimalPos = this.getNextAvailablePosition();
            position = { x: optimalPos.x, y: optimalPos.y };
            console.log('🎨 CharacterRenderer: Using optimal grid position:', position);
        }
        
        if (existingIndex >= 0) {
            // Update existing placement
            currentStage.characters[existingIndex] = {
                ...currentStage.characters[existingIndex],
                ...data,
                x: position.x,
                y: position.y
            };
        } else {
            // Add new placement
            currentStage.characters.push({
                characterId: data.characterId,
                x: position.x,
                y: position.y,
                scale: data.scale || 1,
                rotation: data.rotation || 0
            });
        }
        
        this.stateManager.set('project.stages.main', currentStage);
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
     * CHARACTER POSITIONING UTILITIES
     */

    getOptimalCharacterPosition(characterIndex, totalCharacters = 8) {
        // Calculate optimal grid layout for characters on 800x600 stage
        const stageWidth = 800;
        const stageHeight = 600;
        const margin = 60; // Leave margins on edges
        
        // For 8 characters, use 4x2 grid or horizontal line depending on preference
        const useGrid = totalCharacters > 6;
        
        if (useGrid) {
            // Grid layout (4x2 for 8 characters)
            const cols = Math.ceil(Math.sqrt(totalCharacters));
            const rows = Math.ceil(totalCharacters / cols);
            
            const usableWidth = stageWidth - (margin * 2);
            const usableHeight = stageHeight - (margin * 2);
            
            const cellWidth = usableWidth / cols;
            const cellHeight = usableHeight / rows;
            
            const col = characterIndex % cols;
            const row = Math.floor(characterIndex / cols);
            
            return {
                x: margin + (cellWidth * col) + (cellWidth / 2),
                y: margin + (cellHeight * row) + (cellHeight / 2)
            };
        } else {
            // Horizontal line layout
            const usableWidth = stageWidth - (margin * 2);
            const spacing = usableWidth / (totalCharacters - 1);
            
            return {
                x: margin + (spacing * characterIndex),
                y: stageHeight / 2 // Center vertically
            };
        }
    }
    
    getNextAvailablePosition() {
        // Find next optimal position for a new character
        const stageData = this.stateManager.get('project.stages.main') || { characters: [] };
        const existingCount = stageData.characters.length;
        
        return this.getOptimalCharacterPosition(existingCount);
    }

    /**
     * VIEWPORT MANAGEMENT
     */

    onViewportResize() {
        console.log('🎨 CharacterRenderer: Viewport resize detected');
        
        // Clear texture cache to force re-rendering at new scale
        this.clearTextureCache();
        
        // Emit event to notify other components of viewport change
        this.eventBus.emit('character_renderer:viewport_resized', {
            timestamp: Date.now(),
            useRelativeCoordinates: this.useRelativeCoordinates
        });
        
        console.log('🎨 CharacterRenderer: Viewport resize handling complete');
    }

    /**
     * UTILITY METHODS
     */

    getCharacterAtPosition(x, y) {
        // Hit testing for character selection
        const stageData = this.stateManager.get('project.stages.main');
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
        const stageData = this.stateManager.get('project.stages.main');
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
