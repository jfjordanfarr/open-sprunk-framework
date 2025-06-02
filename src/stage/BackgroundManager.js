/**
 * Background Manager Class
 * 
 * Manages stage backgrounds including loading, caching, and displaying 
 * background images. Supports phase-aware backgrounds that can change
 * during performance based on the current scene state.
 */

export class BackgroundManager {
    constructor(eventBus, stateManager) {
        this.eventBus = eventBus;
        this.stateManager = stateManager;
        
        // Background cache
        this.backgroundImages = new Map(); // background ID -> Image object
        this.backgroundTextures = new Map(); // background ID -> canvas texture cache
        
        // Loading state
        this.loadingBackgrounds = new Set();
        this.failedBackgrounds = new Set();
        
        // Background settings
        this.defaultBackground = '#1a1a2e'; // Dark blue default
        this.enablePhases = true;
        
        console.log('🌅 BackgroundManager: Constructor initialized');
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Background management events
        this.eventBus.on('background:added', (data) => this.onBackgroundAdded(data));
        this.eventBus.on('background:removed', (data) => this.onBackgroundRemoved(data));
        this.eventBus.on('background:updated', (data) => this.onBackgroundUpdated(data));
        
        // Stage background events
        this.eventBus.on('stage:background_changed', (data) => this.onBackgroundChanged(data));
        
        // Phase system events (for future phase-aware backgrounds)
        this.eventBus.on('phase:changed', (data) => this.onPhaseChanged(data));
        
        console.log('🌅 BackgroundManager: Event handlers set up');
    }

    render(ctx, currentTime) {
        // Get current background from stage state
        const stageData = this.stateManager.getState('project.stages.main') || {};
        const backgroundId = stageData.backgroundId || 'default';
        
        if (backgroundId === 'default') {
            this.renderDefaultBackground(ctx);
        } else {
            this.renderBackground(ctx, backgroundId, currentTime);
        }
    }

    renderDefaultBackground(ctx) {
        // Render default gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f0f23');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Add some subtle patterns
        this.renderBackgroundPattern(ctx);
    }

    renderBackgroundPattern(ctx) {
        // Render subtle dot pattern
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        const spacing = 20;
        
        for (let x = 0; x < ctx.canvas.width; x += spacing) {
            for (let y = 0; y < ctx.canvas.height; y += spacing) {
                if ((x + y) % (spacing * 2) === 0) {
                    ctx.beginPath();
                    ctx.arc(x, y, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    renderBackground(ctx, backgroundId, currentTime) {
        const image = this.backgroundImages.get(backgroundId);
        
        if (!image) {
            // Background not loaded, try to load it
            this.loadBackground(backgroundId);
            this.renderDefaultBackground(ctx);
            return;
        }
        
        if (this.failedBackgrounds.has(backgroundId)) {
            // Background failed to load, render error state
            this.renderErrorBackground(ctx, backgroundId);
            return;
        }
        
        if (this.loadingBackgrounds.has(backgroundId)) {
            // Background is loading, render loading state
            this.renderLoadingBackground(ctx, backgroundId);
            return;
        }
        
        // Render the background image
        this.renderBackgroundImage(ctx, image);
    }

    renderBackgroundImage(ctx, image) {
        // Calculate scaling to fill canvas while maintaining aspect ratio
        const canvasAspect = ctx.canvas.width / ctx.canvas.height;
        const imageAspect = image.width / image.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (canvasAspect > imageAspect) {
            // Canvas is wider - scale to fill width
            drawWidth = ctx.canvas.width;
            drawHeight = drawWidth / imageAspect;
            drawX = 0;
            drawY = (ctx.canvas.height - drawHeight) / 2;
        } else {
            // Canvas is taller - scale to fill height
            drawHeight = ctx.canvas.height;
            drawWidth = drawHeight * imageAspect;
            drawX = (ctx.canvas.width - drawWidth) / 2;
            drawY = 0;
        }
        
        ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    }

    renderErrorBackground(ctx, backgroundId) {
        // Render error state with dark background and error message
        this.renderDefaultBackground(ctx);
        
        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            `Failed to load background: ${backgroundId}`, 
            ctx.canvas.width / 2, 
            ctx.canvas.height / 2
        );
    }

    renderLoadingBackground(ctx, backgroundId) {
        // Render loading state
        this.renderDefaultBackground(ctx);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            `Loading background: ${backgroundId}...`, 
            ctx.canvas.width / 2, 
            ctx.canvas.height / 2
        );
        
        // Animate loading dots
        const dots = '.'.repeat((Math.floor(Date.now() / 500) % 4));
        ctx.fillText(dots, ctx.canvas.width / 2, ctx.canvas.height / 2 + 25);
    }

    /**
     * BACKGROUND LOADING
     */

    async loadBackground(backgroundId) {
        if (this.loadingBackgrounds.has(backgroundId) || 
            this.backgroundImages.has(backgroundId)) {
            return;
        }
        
        console.log('🌅 BackgroundManager: Loading background:', backgroundId);
        this.loadingBackgrounds.add(backgroundId);
        this.failedBackgrounds.delete(backgroundId);
        
        try {
            // Get background data from project
            const projectData = this.stateManager.getState('project');
            const background = projectData?.backgrounds?.find(b => b.id === backgroundId);
            
            if (!background) {
                throw new Error(`Background ${backgroundId} not found in project`);
            }
            
            const image = await this.loadImageFromBackground(background);
            
            this.backgroundImages.set(backgroundId, image);
            this.loadingBackgrounds.delete(backgroundId);
            
            console.log('🌅 BackgroundManager: Background loaded successfully:', backgroundId);
            this.eventBus.emit('background:loaded', { backgroundId });
            
        } catch (error) {
            console.error('🌅 BackgroundManager: Failed to load background:', backgroundId, error);
            this.loadingBackgrounds.delete(backgroundId);
            this.failedBackgrounds.add(backgroundId);
            
            this.eventBus.emit('background:load_failed', { 
                backgroundId, 
                error: error.message 
            });
        }
    }

    async loadImageFromBackground(background) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            
            image.onload = () => {
                resolve(image);
            };
            
            image.onerror = () => {
                reject(new Error(`Failed to load image from ${background.source}`));
            };
            
            // Set source based on background type
            if (background.type === 'url') {
                image.src = background.source;
            } else if (background.type === 'data') {
                image.src = background.source; // data URL
            } else if (background.type === 'file') {
                // TODO: Handle file-based backgrounds
                reject(new Error('File-based backgrounds not yet implemented'));
            } else {
                reject(new Error(`Unknown background type: ${background.type}`));
            }
        });
    }

    /**
     * BACKGROUND MANAGEMENT
     */

    onBackgroundAdded(data) {
        console.log('🌅 BackgroundManager: Background added:', data.background.id);
        // Background will be loaded on demand when requested
    }

    onBackgroundRemoved(data) {
        console.log('🌅 BackgroundManager: Background removed:', data.backgroundId);
        
        // Clean up cached resources
        this.backgroundImages.delete(data.backgroundId);
        this.backgroundTextures.delete(data.backgroundId);
        this.loadingBackgrounds.delete(data.backgroundId);
        this.failedBackgrounds.delete(data.backgroundId);
    }

    onBackgroundUpdated(data) {
        console.log('🌅 BackgroundManager: Background updated:', data.background.id);
        
        // Clear cached resources to force reload
        this.backgroundImages.delete(data.background.id);
        this.backgroundTextures.delete(data.background.id);
        this.failedBackgrounds.delete(data.background.id);
    }

    onBackgroundChanged(data) {
        console.log('🌅 BackgroundManager: Stage background changed to:', data.backgroundId);
        
        // Update stage background in state
        const currentStage = this.stateManager.getState('project.stages.main') || {};
        currentStage.backgroundId = data.backgroundId;
        this.stateManager.setState('project.stages.main', currentStage);
        
        // Preload new background
        if (data.backgroundId !== 'default') {
            this.loadBackground(data.backgroundId);
        }
    }

    onPhaseChanged(data) {
        // Handle phase-aware background changes
        // This will be expanded when phase system is fully implemented
        console.log('🌅 BackgroundManager: Phase changed, checking for background updates');
    }

    /**
     * PUBLIC API
     */

    setBackgroundColor(color) {
        this.defaultBackground = color;
        console.log('🌅 BackgroundManager: Default background color set to:', color);
    }

    preloadBackground(backgroundId) {
        console.log('🌅 BackgroundManager: Preloading background:', backgroundId);
        this.loadBackground(backgroundId);
    }

    getLoadedBackgrounds() {
        return Array.from(this.backgroundImages.keys());
    }

    getBackgroundStatus(backgroundId) {
        if (this.backgroundImages.has(backgroundId)) {
            return 'loaded';
        } else if (this.loadingBackgrounds.has(backgroundId)) {
            return 'loading';
        } else if (this.failedBackgrounds.has(backgroundId)) {
            return 'failed';
        } else {
            return 'not_loaded';
        }
    }

    clearCache() {
        console.log('🌅 BackgroundManager: Clearing background cache');
        this.backgroundImages.clear();
        this.backgroundTextures.clear();
        this.failedBackgrounds.clear();
    }

    destroy() {
        console.log('🌅 BackgroundManager: Destroying...');
        
        // Clear all caches
        this.clearCache();
        this.loadingBackgrounds.clear();
        
        console.log('🌅 BackgroundManager: Destroyed');
    }
}
