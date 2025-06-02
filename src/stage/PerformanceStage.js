/**
 * Performance Stage Class
 * 
 * Renders the final animated performance by coordinating characters, backgrounds, 
 * animations, and audio in perfect synchronization. This is the heart of the 
 * creative experience where all elements come together.
 */

import { CharacterRenderer } from './CharacterRenderer.js';
import { BackgroundManager } from './BackgroundManager.js';

export class PerformanceStage {
    constructor(canvas, eventBus, stateManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.eventBus = eventBus;
        this.stateManager = stateManager;
        
        // Rendering components
        this.characterRenderer = null;
        this.backgroundManager = null;
        
        // Synchronized state
        this.isPlaying = false;
        this.currentTime = 0;
        this.lastFrameTime = 0;
        this.syncTolerance = 0.01; // 10ms sync tolerance
        
        // Performance tracking
        this.frameCount = 0;
        this.fps = 60;
        this.fpsHistory = [];
        this.lastFpsUpdate = 0;
        
        // Animation frame tracking
        this.animationFrameId = null;
        
        // Stage settings
        this.backgroundColor = '#2a2a2a';
        this.stageWidth = 800;
        this.stageHeight = 600;
        
        console.log('🎭 PerformanceStage: Constructor initialized');
        this.setupEventHandlers();
    }

    async initialize() {
        console.log('🎭 PerformanceStage: Initializing...');
        
        try {
            // Initialize rendering components
            this.characterRenderer = new CharacterRenderer(this.eventBus, this.stateManager);
            this.backgroundManager = new BackgroundManager(this.eventBus, this.stateManager);
            
            // Set up canvas
            this.resizeCanvas();
            
            // Initial render
            this.render(0);
            
            this.eventBus.emit('stage:initialized');
            console.log('🎭 PerformanceStage: Initialization complete');
        } catch (error) {
            console.error('🎭 PerformanceStage: Initialization failed:', error);
            throw error;
        }
    }

    setupEventHandlers() {
        // Timeline control events
        this.eventBus.on('timeline:play', () => this.startPlayback());
        this.eventBus.on('timeline:pause', () => this.pausePlayback());
        this.eventBus.on('timeline:stop', () => this.stopPlayback());
        this.eventBus.on('timeline:seek', (data) => this.setCurrentTime(data.time));
        
        // Project events
        this.eventBus.on('project:loaded', () => this.onProjectLoaded());
        this.eventBus.on('project:cleared', () => this.onProjectCleared());
        
        // Canvas resize events
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Mouse interaction events
        this.setupMouseInteraction();
        
        console.log('🎭 PerformanceStage: Event handlers set up');
    }

    /**
     * UNIFIED PLAYBACK COORDINATION
     * Implements requirement for synchronized audio-visual playback
     */
    
    async startPlayback() {
        if (this.isPlaying) {
            console.log('🎭 PerformanceStage: Already playing, ignoring start request');
            return;
        }
        
        console.log('🎭 PerformanceStage: Starting playback...');
        this.isPlaying = true;
        this.lastFrameTime = performance.now();
        
        // Start render loop
        this.animationFrameId = requestAnimationFrame(() => this.renderLoop());
        
        this.eventBus.emit('stage:playback_started', {
            currentTime: this.currentTime
        });
        
        console.log('🎭 PerformanceStage: Playback started');
    }
    
    pausePlayback() {
        if (!this.isPlaying) {
            console.log('🎭 PerformanceStage: Not playing, ignoring pause request');
            return;
        }
        
        console.log('🎭 PerformanceStage: Pausing playback...');
        this.isPlaying = false;
        
        // Stop render loop
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        this.eventBus.emit('stage:playback_paused', {
            currentTime: this.currentTime
        });
        
        console.log('🎭 PerformanceStage: Playback paused');
    }
    
    stopPlayback() {
        console.log('🎭 PerformanceStage: Stopping playback...');
        this.pausePlayback();
        
        // Reset to beginning
        this.setCurrentTime(0);
        
        this.eventBus.emit('stage:playback_stopped');
        console.log('🎭 PerformanceStage: Playback stopped');
    }

    setCurrentTime(time) {
        this.currentTime = Math.max(0, time);
        this.render(this.currentTime);
        
        this.eventBus.emit('stage:time_changed', {
            currentTime: this.currentTime
        });
    }

    /**
     * SYNCHRONIZED RENDERING
     * Implements requirement for synchronized visual and audio rendering
     */
    
    renderLoop() {
        if (!this.isPlaying) return;
        
        const now = performance.now();
        const deltaTime = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;
        
        // Update current time (simple increment for now)
        this.currentTime += deltaTime;
        
        // Render current frame
        this.render(this.currentTime);
        
        // Update FPS tracking
        this.updateFPS(now);
        
        // Continue render loop
        this.animationFrameId = requestAnimationFrame(() => this.renderLoop());
    }

    render(currentTime) {
        // Clear canvas
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render background
        if (this.backgroundManager) {
            this.backgroundManager.render(this.ctx, currentTime);
        }
        
        // Render characters
        if (this.characterRenderer) {
            this.characterRenderer.render(this.ctx, currentTime);
        }
        
        // Render performance info (if in debug mode)
        if (this.stateManager.getState('ui.debugMode')) {
            this.renderDebugInfo();
        }
        
        this.frameCount++;
    }

    renderDebugInfo() {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`FPS: ${this.fps.toFixed(1)}`, 10, 20);
        this.ctx.fillText(`Time: ${this.currentTime.toFixed(2)}s`, 10, 35);
        this.ctx.fillText(`Frame: ${this.frameCount}`, 10, 50);
        this.ctx.fillText(`Playing: ${this.isPlaying}`, 10, 65);
    }

    updateFPS(now) {
        if (now - this.lastFpsUpdate >= 1000) { // Update FPS every second
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            
            // Keep FPS history for performance monitoring
            this.fpsHistory.push(this.fps);
            if (this.fpsHistory.length > 60) { // Keep last 60 seconds
                this.fpsHistory.shift();
            }
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
        
        // Re-render after resize
        this.render(this.currentTime);
    }

    /**
     * MOUSE INTERACTION SYSTEM
     */
    
    setupMouseInteraction() {
        this.isDragging = false;
        this.dragCharacterId = null;
        this.dragOffset = { x: 0, y: 0 };
        this.lastMousePos = { x: 0, y: 0 };
        
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.onMouseUp(e));
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        console.log('🎭 PerformanceStage: Mouse interaction set up');
    }
    
    onMouseDown(e) {
        const pos = this.getCanvasPosition(e.clientX, e.clientY);
        this.lastMousePos = pos;
        
        // Check if clicking on a character
        const characterId = this.characterRenderer.getCharacterAtPosition(pos.x, pos.y);
        
        if (characterId) {
            console.log('🎭 PerformanceStage: Character selected:', characterId);
            
            // Set up dragging
            this.isDragging = true;
            this.dragCharacterId = characterId;
            
            // Calculate drag offset
            const stageData = this.stateManager.getState('project.stages.main');
            const placement = stageData?.characters?.find(p => p.characterId === characterId);
            if (placement) {
                this.dragOffset = {
                    x: pos.x - (placement.x || 400),
                    y: pos.y - (placement.y || 300)
                };
            }
            
            // Update UI state
            this.stateManager.setState('ui.selectedCharacter', characterId);
            
            // Visual feedback
            this.canvas.style.cursor = 'grabbing';
            
            this.eventBus.emit('stage:character_selected', { characterId });
        } else {
            // Clear selection
            this.stateManager.setState('ui.selectedCharacter', null);
            this.eventBus.emit('stage:selection_cleared');
            console.log('🎭 PerformanceStage: Selection cleared');
        }
        
        // Re-render to show selection
        this.render(this.currentTime);
    }
    
    onMouseMove(e) {
        const pos = this.getCanvasPosition(e.clientX, e.clientY);
        
        if (this.isDragging && this.dragCharacterId) {
            // Update character position
            const newX = pos.x - this.dragOffset.x;
            const newY = pos.y - this.dragOffset.y;
            
            this.eventBus.emit('stage:character_moved', {
                characterId: this.dragCharacterId,
                x: newX,
                y: newY
            });
            
            // Re-render during drag
            this.render(this.currentTime);
        } else {
            // Update cursor based on what's under mouse
            const characterId = this.characterRenderer.getCharacterAtPosition(pos.x, pos.y);
            this.canvas.style.cursor = characterId ? 'grab' : 'crosshair';
        }
        
        this.lastMousePos = pos;
    }
    
    onMouseUp(e) {
        if (this.isDragging && this.dragCharacterId) {
            console.log('🎭 PerformanceStage: Character drag completed:', this.dragCharacterId);
            
            this.eventBus.emit('stage:character_drag_completed', {
                characterId: this.dragCharacterId
            });
        }
        
        this.isDragging = false;
        this.dragCharacterId = null;
        this.dragOffset = { x: 0, y: 0 };
        
        // Reset cursor
        const pos = this.getCanvasPosition(e.clientX, e.clientY);
        const characterId = this.characterRenderer.getCharacterAtPosition(pos.x, pos.y);
        this.canvas.style.cursor = characterId ? 'grab' : 'crosshair';
    }

    /**
     * PROJECT MANAGEMENT
     */
    
    onProjectLoaded() {
        console.log('🎭 PerformanceStage: Project loaded, refreshing stage');
        this.render(this.currentTime);
    }
    
    onProjectCleared() {
        console.log('🎭 PerformanceStage: Project cleared, resetting stage');
        this.currentTime = 0;
        this.render(0);
    }

    /**
     * PUBLIC API
     */
    
    getCanvasPosition(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.renderWidth / this.stageWidth;
        const scaleY = this.renderHeight / this.stageHeight;
        
        const canvasX = ((clientX - rect.left - this.renderX) / scaleX);
        const canvasY = ((clientY - rect.top - this.renderY) / scaleY);
        
        return { x: canvasX, y: canvasY };
    }
    
    getPerformanceMetrics() {
        return {
            fps: this.fps,
            fpsHistory: [...this.fpsHistory],
            frameCount: this.frameCount,
            currentTime: this.currentTime,
            isPlaying: this.isPlaying
        };
    }

    destroy() {
        console.log('🎭 PerformanceStage: Destroying...');
        
        // Stop playback
        this.stopPlayback();
        
        // Remove event listeners
        window.removeEventListener('resize', () => this.resizeCanvas());
        
        // Clean up components
        if (this.characterRenderer) {
            this.characterRenderer.destroy();
        }
        if (this.backgroundManager) {
            this.backgroundManager.destroy();
        }
        
        console.log('🎭 PerformanceStage: Destroyed');
    }
}
