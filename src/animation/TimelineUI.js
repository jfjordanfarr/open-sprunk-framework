/**
 * Timeline UI Component
 * 
 * Orchestrates the visual interface for the Timeline system using
 * specialized component managers for controls, rendering, interaction, and display.
 */

import { TimelineControlsManager } from './TimelineControlsManager.js';
import { TimelineCanvasRenderer } from './TimelineCanvasRenderer.js';
import { TimelineInteractionHandler } from './TimelineInteractionHandler.js';
import { TimelineDisplayManager } from './TimelineDisplayManager.js';

export class TimelineUI {
    constructor(container, timeline, eventBus) {
        this.container = container;
        this.timeline = timeline;
        this.eventBus = eventBus;
        
        // Component managers
        this.controlsManager = null;
        this.canvasRenderer = null;
        this.interactionHandler = null;
        this.displayManager = null;
        
        // Display state
        this.viewportWidth = 800;
        this.viewportHeight = 300;
        
        // Visual styling
        this.colors = {
            background: '#2a2a2a',
            grid: '#444444',
            beat: '#666666',
            measure: '#888888',
            playhead: '#ff4444',
            keyframe: '#4CAF50',
            musicNote: '#2196F3',
            track: '#333333',
            trackBorder: '#555555',
            text: '#ffffff'
        };
        
        console.log('🎨 TimelineUI: Initialized with component architecture');
        
        this.initializeComponents();
        this.createUI();
        this.setupEventHandlers();
    }

    /**
     * Initialize all component managers
     */
    initializeComponents() {
        // Initialize display manager first (needed by others)
        this.displayManager = new TimelineDisplayManager(this.timeline, this.eventBus);
        
        // Initialize controls manager
        this.controlsManager = new TimelineControlsManager(this.timeline, this.eventBus, this.colors);
        
        // Initialize canvas renderer
        this.canvasRenderer = new TimelineCanvasRenderer(this.timeline, this.eventBus, this.colors);
        
        // Initialize interaction handler
        this.interactionHandler = new TimelineInteractionHandler(
            this.timeline, 
            this.canvasRenderer, 
            this.eventBus
        );
        
        console.log('🎨 TimelineUI: All components initialized');
    }

    /**
     * Create the main UI structure
     */
    createUI() {
        // Clear container
        this.container.innerHTML = '';
        
        // Create main timeline container
        const timelineContainer = document.createElement('div');
        timelineContainer.style.cssText = `
            width: 100%;
            height: 400px;
            background: ${this.colors.background};
            border: 1px solid ${this.colors.trackBorder};
            border-radius: 4px;
            overflow: hidden;
            position: relative;
            display: flex;
            flex-direction: column;
        `;
        
        // Add controls panel
        const controlsElement = this.controlsManager.createControls();
        timelineContainer.appendChild(controlsElement);
        
        // Add canvas
        const canvas = this.canvasRenderer.createCanvas(timelineContainer);
        this.interactionHandler.setupInteraction(canvas);
        
        this.container.appendChild(timelineContainer);
        
        // Initial render
        this.render();
        
        console.log('🎨 TimelineUI: UI structure created');
    }

    /**
     * Setup event handlers for component coordination
     */
    setupEventHandlers() {
        // Display manager events
        this.eventBus.on('timeline-display:update', (data) => {
            this.controlsManager.updateTimeDisplay(data.currentTime);
            this.canvasRenderer.render();
        });
        
        this.eventBus.on('timeline-display:partial_update', (data) => {
            switch (data.type) {
                case 'time':
                    this.controlsManager.updateTimeDisplay(this.timeline.currentTime);
                    break;
                case 'tempo':
                    this.controlsManager.updateTempo(data.data?.tempo || this.timeline.tempo);
                    break;
                case 'tracks':
                case 'beats':
                case 'zoom':
                    this.canvasRenderer.render();
                    break;
            }
        });
        
        // Timeline events
        this.eventBus.on('timeline:time_update', () => {
            this.controlsManager.updateTimeDisplay(this.timeline.currentTime);
            this.canvasRenderer.render();
        });
        
        this.eventBus.on('timeline:tempo_changed', () => {
            this.controlsManager.updateTempo(this.timeline.tempo);
            this.canvasRenderer.render();
        });
        
        this.eventBus.on('timeline:beat_markers_updated', () => {
            this.canvasRenderer.render();
        });
        
        this.eventBus.on('timeline:keyframe_added', () => {
            this.canvasRenderer.render();
        });
        
        this.eventBus.on('timeline:note_added', () => {
            this.canvasRenderer.render();
        });
        
        this.eventBus.on('timeline:zoom_changed', () => {
            this.canvasRenderer.render();
        });
        
        // UI interaction events
        this.eventBus.on('timeline-ui:canvas_clicked', (data) => {
            console.log('🎨 TimelineUI: Canvas clicked at time', data.time);
        });
        
        this.eventBus.on('timeline-ui:time_seeked', (data) => {
            console.log('🎨 TimelineUI: Seeked to time', data.time);
        });
        
        this.eventBus.on('timeline-ui:keyframe_added', (data) => {
            console.log('🎨 TimelineUI: Keyframe added', data);
        });
        
        this.eventBus.on('timeline-ui:music_note_added', (data) => {
            console.log('🎨 TimelineUI: Music note added', data);
        });
        
        console.log('🎨 TimelineUI: Event handlers setup complete');
    }

    /**
     * Main render method - delegates to canvas renderer
     */
    render() {
        if (this.canvasRenderer) {
            this.canvasRenderer.render();
        }
    }

    /**
     * PUBLIC API
     */
    
    refresh() {
        this.render();
    }
    
    centerOnTime(time) {
        if (this.canvasRenderer) {
            this.canvasRenderer.centerOnTime(time);
        }
    }
    
    setInteractive(enabled) {
        if (this.interactionHandler) {
            this.interactionHandler.setEnabled(enabled);
        }
        if (this.controlsManager) {
            this.controlsManager.setEnabled(enabled);
        }
        console.log(`🎨 TimelineUI: Interactive mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Get timeline statistics for display
     */
    getStats() {
        return this.displayManager ? this.displayManager.getTimelineStats() : {};
    }

    /**
     * Set update frequency for display manager
     */
    setUpdateFrequency(fps) {
        if (this.displayManager) {
            this.displayManager.setUpdateFrequency(fps);
        }
    }

    /**
     * Get current scroll position
     */
    getScrollPosition() {
        return this.canvasRenderer ? this.canvasRenderer.getScrollPosition() : 0;
    }

    /**
     * Set scroll position
     */
    setScrollPosition(position) {
        if (this.canvasRenderer) {
            this.canvasRenderer.setScrollPosition(position);
        }
    }

    /**
     * CLEANUP
     */
    
    destroy() {
        // Destroy all component managers
        if (this.displayManager) {
            this.displayManager.destroy();
            this.displayManager = null;
        }
        
        if (this.interactionHandler) {
            this.interactionHandler.destroy();
            this.interactionHandler = null;
        }
        
        if (this.canvasRenderer) {
            this.canvasRenderer.destroy();
            this.canvasRenderer = null;
        }
        
        if (this.controlsManager) {
            this.controlsManager.destroy();
            this.controlsManager = null;
        }
        
        // Remove event listeners
        this.eventBus.off('timeline-display:update');
        this.eventBus.off('timeline-display:partial_update');
        this.eventBus.off('timeline:time_update');
        this.eventBus.off('timeline:tempo_changed');
        this.eventBus.off('timeline:beat_markers_updated');
        this.eventBus.off('timeline:keyframe_added');
        this.eventBus.off('timeline:note_added');
        this.eventBus.off('timeline:zoom_changed');
        this.eventBus.off('timeline-ui:canvas_clicked');
        this.eventBus.off('timeline-ui:time_seeked');
        this.eventBus.off('timeline-ui:keyframe_added');
        this.eventBus.off('timeline-ui:music_note_added');
        
        // Clean up UI
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        console.log('🎨 TimelineUI: Destroyed with all components');
    }

    /**
     * Legacy compatibility - redirects to component-based createUI
     */
    createTimelineUI() {
        this.createUI();
    }
    
    createControls(parent) {
        this.controlsContainer = document.createElement('div');
        this.controlsContainer.style.cssText = `
            height: 50px;
            background: #1e1e1e;
            border-bottom: 1px solid ${this.colors.trackBorder};
            padding: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        // Play/Pause/Stop buttons
        const playBtn = this.createButton('▶️', 'Play', () => this.timeline.play());
        const pauseBtn = this.createButton('⏸️', 'Pause', () => this.timeline.pause());
        const stopBtn = this.createButton('⏹️', 'Stop', () => this.timeline.stop());
        
        // Time display
        const timeDisplay = document.createElement('span');
        timeDisplay.id = 'timeline-time-display';
        timeDisplay.style.cssText = `
            color: ${this.colors.text};
            font-family: monospace;
            font-size: 14px;
            margin-left: 20px;
        `;
        timeDisplay.textContent = '00:00.00';
        
        // Tempo control
        const tempoLabel = document.createElement('label');
        tempoLabel.style.cssText = `
            color: ${this.colors.text};
            font-size: 12px;
            margin-left: 20px;
        `;
        tempoLabel.textContent = 'BPM:';
        
        const tempoInput = document.createElement('input');
        tempoInput.type = 'number';
        tempoInput.value = this.timeline.tempo;
        tempoInput.min = 60;
        tempoInput.max = 200;
        tempoInput.style.cssText = `
            width: 60px;
            margin-left: 5px;
            padding: 2px 4px;
            border: 1px solid ${this.colors.trackBorder};
            background: ${this.colors.track};
            color: ${this.colors.text};
            border-radius: 2px;
        `;
        tempoInput.addEventListener('change', (e) => {
            this.timeline.setTempo(parseInt(e.target.value));
        });
        
        // Snap to grid toggle
        const snapLabel = document.createElement('label');
        snapLabel.style.cssText = `
            color: ${this.colors.text};
            font-size: 12px;
            margin-left: 20px;
            cursor: pointer;
        `;
        
        const snapCheckbox = document.createElement('input');
        snapCheckbox.type = 'checkbox';
        snapCheckbox.checked = this.timeline.snapToGrid;
        snapCheckbox.addEventListener('change', (e) => {
            this.timeline.setSnapToGrid(e.target.checked);
        });
        
        snapLabel.appendChild(snapCheckbox);
        snapLabel.appendChild(document.createTextNode(' Snap to Grid'));
        
        // Add all controls
        this.controlsContainer.appendChild(playBtn);
        this.controlsContainer.appendChild(pauseBtn);
        this.controlsContainer.appendChild(stopBtn);
        this.controlsContainer.appendChild(timeDisplay);
        this.controlsContainer.appendChild(tempoLabel);
        this.controlsContainer.appendChild(tempoInput);
        this.controlsContainer.appendChild(snapLabel);
        
        parent.appendChild(this.controlsContainer);
    }
    
    createButton(text, title, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.title = title;
        button.style.cssText = `
            padding: 6px 12px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `;
        button.addEventListener('click', onClick);
        
        button.addEventListener('mouseenter', () => {
            button.style.background = '#5CBF60';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.background = '#4CAF50';
        });
        
        return button;
    }
    
    createCanvas(parent) {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            flex: 1;
            display: block;
            cursor: crosshair;
        `;
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set up canvas interaction
        this.canvas.addEventListener('click', (e) => this.onCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e));
        this.canvas.addEventListener('wheel', (e) => this.onCanvasWheel(e));
        
        parent.appendChild(this.canvas);
        
        // Handle canvas resize
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * RENDERING
     */
    
    render() {
        if (!this.canvas || !this.ctx) return;
        
        const { width, height } = this.canvas;
        
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, width, height);
        
        // Draw timeline elements
        this.drawGrid();
        this.drawTracks();
        this.drawPlayhead();
        this.drawTimeRuler();
    }
    
    drawGrid() {
        const { width, height } = this.canvas;
        const visibleTimeRange = this.timeline.getVisibleTimeRange(width, this.scrollPosition);
        
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        
        // Draw vertical grid lines for beats
        this.timeline.beatMarkers.forEach(marker => {
            if (marker.time >= visibleTimeRange.startTime && marker.time <= visibleTimeRange.endTime) {
                const x = this.timeToCanvasX(marker.time);
                
                if (marker.isMeasureStart) {
                    this.ctx.strokeStyle = this.colors.measure;
                    this.ctx.lineWidth = 2;
                } else if (marker.isBeatStart) {
                    this.ctx.strokeStyle = this.colors.beat;
                    this.ctx.lineWidth = 1;
                } else {
                    this.ctx.strokeStyle = this.colors.grid;
                    this.ctx.lineWidth = 0.5;
                }
                
                this.ctx.beginPath();
                this.ctx.moveTo(x, this.headerHeight);
                this.ctx.lineTo(x, height);
                this.ctx.stroke();
            }
        });
    }
    
    drawTracks() {
        let trackY = this.headerHeight;
        
        // Draw animation tracks
        this.timeline.animationTracks.forEach((track, trackId) => {
            this.drawTrack(trackId, trackY, 'animation', track);
            trackY += this.trackHeight;
        });
        
        // Draw music tracks
        this.timeline.musicTracks.forEach((track, trackId) => {
            this.drawTrack(trackId, trackY, 'music', track);
            trackY += this.trackHeight;
        });
        
        // If no tracks exist, show a hint
        if (this.timeline.animationTracks.size === 0 && this.timeline.musicTracks.size === 0) {
            this.drawEmptyState();
        }
    }
    
    drawTrack(trackId, y, type, events) {
        const { width } = this.canvas;
        
        // Draw track background
        this.ctx.fillStyle = this.colors.track;
        this.ctx.fillRect(0, y, width, this.trackHeight);
        
        // Draw track border
        this.ctx.strokeStyle = this.colors.trackBorder;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(0, y, width, this.trackHeight);
        
        // Draw track label
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`${type}: ${trackId}`, 8, y + 16);
        
        // Draw events
        const visibleTimeRange = this.timeline.getVisibleTimeRange(width, this.scrollPosition);
        const eventColor = type === 'animation' ? this.colors.keyframe : this.colors.musicNote;
        
        events.forEach(event => {
            if (event.time >= visibleTimeRange.startTime && event.time <= visibleTimeRange.endTime) {
                const x = this.timeToCanvasX(event.time);
                
                this.ctx.fillStyle = eventColor;
                this.ctx.fillRect(x - 3, y + 5, 6, this.trackHeight - 10);
                
                // Draw event border
                this.ctx.strokeStyle = this.colors.text;
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x - 3, y + 5, 6, this.trackHeight - 10);
            }
        });
    }
    
    drawPlayhead() {
        const x = this.timeToCanvasX(this.timeline.currentTime);
        const { height } = this.canvas;
        
        this.ctx.strokeStyle = this.colors.playhead;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, height);
        this.ctx.stroke();
        
        // Draw playhead triangle
        this.ctx.fillStyle = this.colors.playhead;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 6, 0);
        this.ctx.lineTo(x + 6, 0);
        this.ctx.lineTo(x, 12);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawTimeRuler() {
        const { width } = this.canvas;
        const visibleTimeRange = this.timeline.getVisibleTimeRange(width, this.scrollPosition);
        
        // Draw ruler background
        this.ctx.fillStyle = '#1e1e1e';
        this.ctx.fillRect(0, 0, width, this.headerHeight);
        
        // Draw time markers
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '10px Arial';
        
        // Show measures and beats
        this.timeline.beatMarkers.forEach(marker => {
            if (marker.time >= visibleTimeRange.startTime && marker.time <= visibleTimeRange.endTime) {
                const x = this.timeToCanvasX(marker.time);
                
                if (marker.isMeasureStart) {
                    // Draw measure number
                    this.ctx.fillText(`${marker.measure + 1}`, x + 2, 12);
                    
                    // Draw tick
                    this.ctx.strokeStyle = this.colors.measure;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, 15);
                    this.ctx.lineTo(x, this.headerHeight - 5);
                    this.ctx.stroke();
                } else if (marker.isBeatStart) {
                    // Draw beat tick
                    this.ctx.strokeStyle = this.colors.beat;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, this.headerHeight - 15);
                    this.ctx.lineTo(x, this.headerHeight - 5);
                    this.ctx.stroke();
                }
            }
        });
        
        // Draw time display
        const currentTimeText = this.formatTime(this.timeline.currentTime);
        this.ctx.fillStyle = this.colors.playhead;
        this.ctx.font = 'bold 12px monospace';
        this.ctx.fillText(currentTimeText, 8, this.headerHeight - 8);
    }
    
    drawEmptyState() {
        const { width, height } = this.canvas;
        
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Click to add animation keyframes or music notes', width / 2, height / 2);
        this.ctx.fillText('Use the controls above to play, pause, and adjust tempo', width / 2, height / 2 + 20);
        this.ctx.textAlign = 'left';
    }

    /**
     * INTERACTION HANDLERS
     */
    
    onCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const time = this.canvasXToTime(x);
        
        if (y < this.headerHeight) {
            // Clicked in header - seek to time
            this.timeline.seekToTime(time);
        } else {
            // Clicked in tracks area - add keyframe/note
            const trackIndex = Math.floor((y - this.headerHeight) / this.trackHeight);
            
            if (e.shiftKey) {
                // Add music note
                const trackId = `music_${trackIndex}`;
                this.timeline.createTrack(trackId, 'music');
                this.timeline.addMusicNote(trackId, time, { pitch: 60, velocity: 80 });
            } else {
                // Add animation keyframe
                const trackId = `anim_${trackIndex}`;
                this.timeline.createTrack(trackId, 'animation');
                this.timeline.addAnimationKeyframe(trackId, time, { x: 0, y: 0, rotation: 0 });
            }
        }
        
        this.render();
    }
    
    onCanvasMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = this.canvasXToTime(x);
        
        // Update cursor based on position
        if (e.clientY - rect.top < this.headerHeight) {
            this.canvas.style.cursor = 'pointer';
        } else {
            this.canvas.style.cursor = e.shiftKey ? 'crosshair' : 'crosshair';
        }
        
        // Show time tooltip (optional)
        this.canvas.title = `Time: ${this.formatTime(time)}`;
    }
    
    onCanvasWheel(e) {
        e.preventDefault();
        
        if (e.ctrlKey) {
            // Zoom
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const newPixelsPerSecond = this.timeline.pixelsPerSecond * zoomFactor;
            this.timeline.setZoom(Math.max(50, Math.min(400, newPixelsPerSecond)));
        } else {
            // Scroll
            this.scrollPosition += e.deltaY;
            this.scrollPosition = Math.max(0, this.scrollPosition);
        }
        
        this.render();
    }

    /**
     * EVENT HANDLERS
     */
    
    setupEventHandlers() {
        // Timeline events
        this.eventBus.on('timeline:time_update', () => {
            this.updateTimeDisplay();
            this.render();
        });
        
        this.eventBus.on('timeline:tempo_changed', () => {
            this.render();
        });
        
        this.eventBus.on('timeline:beat_markers_updated', () => {
            this.render();
        });
        
        this.eventBus.on('timeline:keyframe_added', () => {
            this.render();
        });
        
        this.eventBus.on('timeline:note_added', () => {
            this.render();
        });
        
        this.eventBus.on('timeline:zoom_changed', () => {
            this.render();
        });
    }

    /**
     * UTILITY METHODS
     */
    
    resizeCanvas() {
        const rect = this.container.getBoundingClientRect();
        this.viewportWidth = rect.width - 2; // Account for border
        this.viewportHeight = 350; // Fixed height for timeline
        
        this.canvas.width = this.viewportWidth;
        this.canvas.height = this.viewportHeight;
        
        this.render();
    }
    
    timeToCanvasX(time) {
        return this.timeline.timeToPixels(time) - this.scrollPosition;
    }
    
    canvasXToTime(x) {
        return this.timeline.pixelsToTime(x + this.scrollPosition);
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toFixed(2).padStart(5, '0')}`;
    }
    
    updateTimeDisplay() {
        const timeDisplay = document.getElementById('timeline-time-display');
        if (timeDisplay) {
            timeDisplay.textContent = this.formatTime(this.timeline.currentTime);
        }
    }

    /**
     * PUBLIC API
     */
    
    refresh() {
        this.render();
    }
    
    centerOnTime(time) {
        const centerX = this.timeToCanvasX(time);
        this.scrollPosition = Math.max(0, centerX - this.viewportWidth / 2);
        this.render();
    }
    
    setInteractive(enabled) {
        if (this.canvas) {
            this.canvas.style.pointerEvents = enabled ? 'auto' : 'none';
        }
        if (this.controlsContainer) {
            this.controlsContainer.style.pointerEvents = enabled ? 'auto' : 'none';
        }
        console.log(`🎨 TimelineUI: Interactive mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * CLEANUP
     */
    
    destroy() {
        // Remove event listeners
        this.eventBus.off('timeline:time_update');
        this.eventBus.off('timeline:tempo_changed');
        this.eventBus.off('timeline:beat_markers_updated');
        this.eventBus.off('timeline:keyframe_added');
        this.eventBus.off('timeline:note_added');
        this.eventBus.off('timeline:zoom_changed');
        
        // Clean up UI
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        console.log('🎨 TimelineUI: Destroyed');
    }
}
