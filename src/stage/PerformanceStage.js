// filepath: /workspaces/open-sprunk-framework/src/stage/PerformanceStage.js
// MDMD Source: docs/Specification/Implementations/stage/performance-stage-class.mdmd

/**
 * Performance Stage Class
 * 
 * Renders the final animated performance by coordinating characters, backgrounds, 
 * animations, and audio in perfect synchronization. This is the heart of the 
 * creative experience where all elements come together.
 * 
 * @class PerformanceStage
 * @description Main rendering engine that coordinates all visual and audio elements
 *              for live performance playback. Handles canvas management, character
 *              positioning, animation synchronization, and user interaction.
 */

import { CharacterRenderer } from './CharacterRenderer.js';
import { BackgroundManager } from './BackgroundManager.js';
import { AuthoringOverlayManager } from './AuthoringOverlayManager.js';
import { PlaybackController } from './PlaybackController.js';
import { MouseInteractionHandler } from './MouseInteractionHandler.js';
import { PerformanceMetrics } from './PerformanceMetrics.js';

export class PerformanceStage {
    constructor(canvas, eventBus, stateManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.eventBus = eventBus;
        this.stateManager = stateManager;
        
        // Rendering components
        this.characterRenderer = null;
        this.backgroundManager = null;
        
        // Stage management components
        this.authoringOverlayManager = null;
        this.playbackController = null;
        this.mouseInteractionHandler = null;
        this.performanceMetrics = null;
        
        // Stage settings
        this.backgroundColor = '#2a2a2a';
        this.stageWidth = 800;
        this.stageHeight = 600;
        
        // Rendering viewport (letterboxed coordinates)
        this.renderX = 0;
        this.renderY = 0;
        this.renderWidth = 800;
        this.renderHeight = 600;
        
        console.log('🎭 PerformanceStage: Constructor initialized with component architecture');
        this.setupEventHandlers();
    }

    async initialize() {
        console.log('🎭 PerformanceStage: Initializing...');
        
        try {
            // Initialize rendering components
            this.characterRenderer = new CharacterRenderer(this.eventBus, this.stateManager);
            this.backgroundManager = new BackgroundManager(this.eventBus, this.stateManager);
            
            // Initialize management components
            this.authoringOverlayManager = new AuthoringOverlayManager(this.canvas, this.eventBus, this.stateManager);
            this.playbackController = new PlaybackController(this.eventBus, this.stateManager, (time) => this.render(time));
            this.performanceMetrics = new PerformanceMetrics(this.eventBus, this.stateManager);
            this.mouseInteractionHandler = new MouseInteractionHandler(this.canvas, this.eventBus, this.stateManager, this.characterRenderer);
            
            // Initialize authoring overlay system
            this.authoringOverlayManager.initialize();
            
            // Set up canvas
            this.resizeCanvas();
            
            // Initial render
            this.render(0);
            
            this.eventBus.emit('stage:initialized');
            console.log('🎭 PerformanceStage: Initialization complete with component architecture');
        } catch (error) {
            console.error('🎭 PerformanceStage: Initialization failed:', error);
            throw error;
        }
    }

    setupEventHandlers() {
        // Project events
        this.eventBus.on('project:loaded', () => this.onProjectLoaded());
        this.eventBus.on('project:cleared', () => this.onProjectCleared());
        
        // Canvas resize events
        window.addEventListener('resize', () => this.resizeCanvas());
        
        console.log('🎭 PerformanceStage: Event handlers set up');
    }

    /**
     * SYNCHRONIZED RENDERING
     * Main render method called by playback controller and for static frames
     */
    render(currentTime) {
        const renderStart = performance.now();
        
        // Clear canvas
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Create stage coordinate transform for letterboxed rendering
        const stageTransform = {
            renderX: this.renderX,
            renderY: this.renderY,
            renderWidth: this.renderWidth,
            renderHeight: this.renderHeight
        };
        
        // Set up clipping for stage content area
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(this.renderX, this.renderY, this.renderWidth, this.renderHeight);
        this.ctx.clip();
        
        // Render background
        if (this.backgroundManager) {
            this.backgroundManager.render(this.ctx, currentTime);
        }
        
        // Render characters with proper coordinate transformation
        if (this.characterRenderer) {
            this.characterRenderer.render(this.ctx, currentTime, stageTransform);
        }
        
        this.ctx.restore();
        
        // Render performance info (if in debug mode) - outside stage area
        if (this.performanceMetrics) {
            this.performanceMetrics.renderDebugInfo(this.ctx, currentTime);
        }
        
        // Track performance metrics
        const renderEnd = performance.now();
        if (this.performanceMetrics) {
            this.performanceMetrics.trackRenderTime(renderStart, renderEnd);
            this.performanceMetrics.updateFPS(renderEnd);
        }
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Maintain aspect ratio for stage content
        const aspectRatio = this.stageWidth / this.stageHeight;
        const canvasAspect = this.canvas.width / this.canvas.height;
        
        if (canvasAspect > aspectRatio) {
            // Canvas is wider - letterbox sides
            this.renderHeight = this.canvas.height;
            this.renderWidth = this.renderHeight * aspectRatio;
            this.renderX = (this.canvas.width - this.renderWidth) / 2;
            this.renderY = 0;
        } else {
            // Canvas is taller - letterbox top/bottom
            this.renderWidth = this.canvas.width;
            this.renderHeight = this.renderWidth / aspectRatio;
            this.renderX = 0;
            this.renderY = (this.canvas.height - this.renderHeight) / 2;
        }
        
        console.log('🎭 PerformanceStage: Canvas resized to', this.canvas.width, 'x', this.canvas.height);
        console.log('🎭 PerformanceStage: Render area:', this.renderX, this.renderY, this.renderWidth, this.renderHeight);
        
        // Update coordinate systems in all components
        if (this.authoringOverlayManager) {
            this.authoringOverlayManager.updateCoordinateSystem(this.renderX, this.renderY, this.renderWidth, this.renderHeight);
        }
        if (this.mouseInteractionHandler) {
            this.mouseInteractionHandler.updateCoordinateSystem(this.renderX, this.renderY, this.renderWidth, this.renderHeight);
        }
        
        // Notify character renderer about viewport change so it can maintain relative positions
        if (this.characterRenderer) {
            this.characterRenderer.onViewportResize();
        }
        
        // Re-render after resize
        this.render(this.playbackController ? this.playbackController.currentTime : 0);
    }

    /**
     * PROJECT MANAGEMENT
     */
    onProjectLoaded() {
        console.log('🎭 PerformanceStage: Project loaded, refreshing stage');
        this.render(this.playbackController ? this.playbackController.currentTime : 0);
    }
    
    onProjectCleared() {
        console.log('🎭 PerformanceStage: Project cleared, resetting stage');
        if (this.playbackController) {
            this.playbackController.setCurrentTime(0);
        } else {
            this.render(0);
        }
    }

    /**
     * PUBLIC API - Delegate to appropriate components
     */
    
    // Authoring system API
    setAuthoringMode(mode) {
        if (this.authoringOverlayManager) {
            this.authoringOverlayManager.setAuthoringMode(mode);
        }
    }
    
    enterEditMode() {
        if (this.authoringOverlayManager) {
            this.authoringOverlayManager.enterEditMode();
        }
    }
    
    exitEditMode() {
        if (this.authoringOverlayManager) {
            this.authoringOverlayManager.exitEditMode();
        }
    }
    
    registerAuthoringOverlay(mode, overlayElement) {
        if (this.authoringOverlayManager) {
            this.authoringOverlayManager.registerAuthoringOverlay(mode, overlayElement);
        }
    }
    
    getCoordinateSystem() {
        if (this.authoringOverlayManager) {
            return this.authoringOverlayManager.getCoordinateSystem();
        }
        return {
            stageWidth: this.stageWidth,
            stageHeight: this.stageHeight,
            renderWidth: this.renderWidth,
            renderHeight: this.renderHeight,
            renderX: this.renderX,
            renderY: this.renderY
        };
    }
    
    // Playback control API
    startPlayback() {
        if (this.playbackController) {
            this.playbackController.startPlayback();
        }
    }
    
    pausePlayback() {
        if (this.playbackController) {
            this.playbackController.pausePlayback();
        }
    }
    
    stopPlayback() {
        if (this.playbackController) {
            this.playbackController.stopPlayback();
        }
    }
    
    setCurrentTime(time) {
        if (this.playbackController) {
            this.playbackController.setCurrentTime(time);
        } else {
            this.render(time);
        }
    }
    
    // Coordinate conversion API
    getCanvasPosition(clientX, clientY) {
        if (this.mouseInteractionHandler) {
            return this.mouseInteractionHandler.getCanvasPosition(clientX, clientY);
        }
        
        // Fallback implementation
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = clientX - rect.left;
        const canvasY = clientY - rect.top;
        const stageX = ((canvasX - this.renderX) / this.renderWidth) * this.stageWidth;
        const stageY = ((canvasY - this.renderY) / this.renderHeight) * this.stageHeight;
        return { x: stageX, y: stageY };
    }
    
    // Performance metrics API
    getPerformanceMetrics() {
        const currentTime = this.playbackController ? this.playbackController.currentTime : 0;
        const isPlaying = this.playbackController ? this.playbackController.isPlaying : false;
        
        if (this.performanceMetrics) {
            const metrics = this.performanceMetrics.getPerformanceMetrics();
            return {
                ...metrics,
                currentTime: currentTime,
                isPlaying: isPlaying
            };
        }
        
        return {
            fps: 0,
            averageFps: 0,
            frameCount: 0,
            currentTime: currentTime,
            isPlaying: isPlaying
        };
    }

    destroy() {
        console.log('🎭 PerformanceStage: Destroying...');
        
        // Destroy all components
        if (this.playbackController) {
            this.playbackController.destroy();
        }
        if (this.authoringOverlayManager) {
            this.authoringOverlayManager.destroy();
        }
        if (this.mouseInteractionHandler) {
            this.mouseInteractionHandler.destroy();
        }
        if (this.performanceMetrics) {
            this.performanceMetrics.destroy();
        }
        if (this.characterRenderer) {
            this.characterRenderer.destroy();
        }
        if (this.backgroundManager) {
            this.backgroundManager.destroy();
        }
        
        // Remove event listeners
        window.removeEventListener('resize', () => this.resizeCanvas());
        
        console.log('🎭 PerformanceStage: Destroyed');
    }
}
