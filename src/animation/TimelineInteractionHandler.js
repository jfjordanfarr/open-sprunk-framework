/**
 * Timeline Interaction Handler
 * 
 * Manages mouse and keyboard interactions with the timeline canvas,
 * including clicking to add events, dragging, scrolling, and zooming.
 */

export class TimelineInteractionHandler {
    constructor(timeline, canvasRenderer, eventBus) {
        this.timeline = timeline;
        this.canvasRenderer = canvasRenderer;
        this.eventBus = eventBus;
        
        // Interaction state
        this.isEnabled = true;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Cached elements
        this.canvas = null;
        
        console.log('🖱️ TimelineInteractionHandler: Initialized');
    }

    /**
     * Setup interaction handlers for canvas
     */
    setupInteraction(canvas) {
        this.canvas = canvas;
        
        if (!this.canvas) return;
        
        // Mouse events
        this.canvas.addEventListener('click', (e) => this.onCanvasClick(e));
        this.canvas.addEventListener('mousedown', (e) => this.onCanvasMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onCanvasMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.onCanvasWheel(e));
        
        // Mouse leave to handle dragging outside canvas
        this.canvas.addEventListener('mouseleave', (e) => this.onCanvasMouseLeave(e));
        
        // Keyboard events (when canvas is focused)
        this.canvas.addEventListener('keydown', (e) => this.onCanvasKeyDown(e));
        
        // Make canvas focusable
        this.canvas.tabIndex = 0;
        
        console.log('🖱️ TimelineInteractionHandler: Interaction setup complete');
    }

    /**
     * Handle canvas click events
     */
    onCanvasClick(e) {
        if (!this.isEnabled) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const time = this.canvasRenderer.canvasXToTime(x);
        const headerHeight = this.canvasRenderer.headerHeight;
        const trackHeight = this.canvasRenderer.trackHeight;
        
        if (y < headerHeight) {
            // Clicked in header - seek to time
            this.seekToTime(time);
        } else {
            // Clicked in tracks area - add keyframe/note
            const trackIndex = Math.floor((y - headerHeight) / trackHeight);
            this.addTimelineEvent(trackIndex, time, e.shiftKey);
        }
        
        this.eventBus.emit('timeline-ui:canvas_clicked', {
            time,
            trackIndex: Math.floor((y - headerHeight) / trackHeight),
            x, y,
            isHeader: y < headerHeight,
            modifiers: {
                shift: e.shiftKey,
                ctrl: e.ctrlKey,
                alt: e.altKey
            }
        });
    }

    /**
     * Handle mouse down events
     */
    onCanvasMouseDown(e) {
        if (!this.isEnabled) return;
        
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        
        // Focus canvas for keyboard events
        this.canvas.focus();
        
        e.preventDefault();
    }

    /**
     * Handle mouse move events
     */
    onCanvasMouseMove(e) {
        if (!this.isEnabled) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const time = this.canvasRenderer.canvasXToTime(x);
        const headerHeight = this.canvasRenderer.headerHeight;
        
        // Update cursor based on position and modifiers
        this.updateCursor(y < headerHeight, e.shiftKey);
        
        // Show time tooltip
        this.canvas.title = `Time: ${this.formatTime(time)}`;
        
        // Handle dragging for panning
        if (this.isDragging && !e.shiftKey) {
            const deltaX = e.clientX - this.lastMouseX;
            const currentScroll = this.canvasRenderer.getScrollPosition();
            this.canvasRenderer.setScrollPosition(currentScroll - deltaX);
            
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        }
        
        this.eventBus.emit('timeline-ui:mouse_move', {
            x, y, time,
            isHeader: y < headerHeight,
            isDragging: this.isDragging
        });
    }

    /**
     * Handle mouse up events
     */
    onCanvasMouseUp(e) {
        if (!this.isEnabled) return;
        
        this.isDragging = false;
        
        this.eventBus.emit('timeline-ui:mouse_up', {
            x: e.clientX,
            y: e.clientY
        });
    }

    /**
     * Handle mouse leave events
     */
    onCanvasMouseLeave(e) {
        this.isDragging = false;
        this.canvas.style.cursor = 'default';
    }

    /**
     * Handle wheel events for zooming and scrolling
     */
    onCanvasWheel(e) {
        if (!this.isEnabled) return;
        
        e.preventDefault();
        
        if (e.ctrlKey || e.metaKey) {
            // Zoom
            this.handleZoom(e.deltaY, e.clientX);
        } else {
            // Scroll
            this.handleScroll(e.deltaY, e.shiftKey);
        }
    }

    /**
     * Handle keyboard events
     */
    onCanvasKeyDown(e) {
        if (!this.isEnabled) return;
        
        switch (e.key) {
            case ' ':
                // Spacebar - toggle play/pause
                e.preventDefault();
                this.timeline.isPlaying ? this.timeline.pause() : this.timeline.play();
                break;
                
            case 'Home':
                // Go to beginning
                e.preventDefault();
                this.seekToTime(0);
                break;
                
            case 'Delete':
            case 'Backspace':
                // Delete selected events (future enhancement)
                e.preventDefault();
                this.eventBus.emit('timeline-ui:delete_requested');
                break;
                
            case 'ArrowLeft':
                // Previous beat/measure
                e.preventDefault();
                this.navigateTime(-1, e.shiftKey);
                break;
                
            case 'ArrowRight':
                // Next beat/measure
                e.preventDefault();
                this.navigateTime(1, e.shiftKey);
                break;
        }
    }

    /**
     * Handle zoom operation
     */
    handleZoom(deltaY, mouseX) {
        const zoomFactor = deltaY > 0 ? 0.9 : 1.1;
        const newPixelsPerSecond = this.timeline.pixelsPerSecond * zoomFactor;
        const clampedZoom = Math.max(50, Math.min(400, newPixelsPerSecond));
        
        // Get mouse position in timeline before zoom
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = mouseX - rect.left;
        const timeAtMouse = this.canvasRenderer.canvasXToTime(canvasX);
        
        // Apply zoom
        this.timeline.setZoom(clampedZoom);
        
        // Adjust scroll to keep mouse position stable
        const newCanvasX = this.canvasRenderer.timeToCanvasX(timeAtMouse);
        const scrollAdjustment = newCanvasX - canvasX;
        const currentScroll = this.canvasRenderer.getScrollPosition();
        this.canvasRenderer.setScrollPosition(currentScroll + scrollAdjustment);
        
        this.eventBus.emit('timeline-ui:zoom_changed', {
            pixelsPerSecond: clampedZoom,
            focusTime: timeAtMouse
        });
    }

    /**
     * Handle scroll operation
     */
    handleScroll(deltaY, isHorizontal) {
        if (isHorizontal) {
            // Horizontal scroll
            const currentScroll = this.canvasRenderer.getScrollPosition();
            this.canvasRenderer.setScrollPosition(currentScroll + deltaY);
        } else {
            // Vertical scroll (future: track scrolling)
            this.eventBus.emit('timeline-ui:vertical_scroll', { delta: deltaY });
        }
    }

    /**
     * Navigate by beat or measure
     */
    navigateTime(direction, byMeasure = false) {
        const currentTime = this.timeline.currentTime;
        const beatDuration = 60 / this.timeline.tempo;
        const step = byMeasure ? beatDuration * 4 : beatDuration; // Assume 4/4 time
        
        const newTime = Math.max(0, currentTime + (direction * step));
        this.seekToTime(newTime);
    }

    /**
     * Seek to specific time
     */
    seekToTime(time) {
        this.timeline.seekToTime(time);
        this.canvasRenderer.render();
        
        this.eventBus.emit('timeline-ui:time_seeked', { time });
    }

    /**
     * Add timeline event (keyframe or music note)
     */
    addTimelineEvent(trackIndex, time, isMusic = false) {
        if (isMusic) {
            // Add music note
            const trackId = `music_${trackIndex}`;
            this.timeline.createTrack(trackId, 'music');
            this.timeline.addMusicNote(trackId, time, { pitch: 60, velocity: 80 });
            
            this.eventBus.emit('timeline-ui:music_note_added', {
                trackId, time, trackIndex
            });
        } else {
            // Add animation keyframe
            const trackId = `anim_${trackIndex}`;
            this.timeline.createTrack(trackId, 'animation');
            this.timeline.addAnimationKeyframe(trackId, time, { x: 0, y: 0, rotation: 0 });
            
            this.eventBus.emit('timeline-ui:keyframe_added', {
                trackId, time, trackIndex
            });
        }
        
        this.canvasRenderer.render();
    }

    /**
     * Update cursor based on context
     */
    updateCursor(isHeader, isShiftHeld) {
        if (!this.canvas) return;
        
        if (isHeader) {
            this.canvas.style.cursor = 'pointer';
        } else if (isShiftHeld) {
            this.canvas.style.cursor = 'crosshair'; // Music note mode
        } else {
            this.canvas.style.cursor = 'crosshair'; // Animation keyframe mode
        }
    }

    /**
     * Format time for display
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toFixed(2).padStart(5, '0')}`;
    }

    /**
     * Enable or disable interactions
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        
        if (this.canvas) {
            this.canvas.style.pointerEvents = enabled ? 'auto' : 'none';
            this.canvas.style.opacity = enabled ? '1' : '0.7';
        }
        
        console.log(`🖱️ TimelineInteractionHandler: ${enabled ? 'Enabled' : 'Disabled'}`);
    }

    /**
     * Check if interactions are enabled
     */
    isInteractionEnabled() {
        return this.isEnabled;
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.canvas) {
            // Remove all event listeners
            this.canvas.removeEventListener('click', this.onCanvasClick);
            this.canvas.removeEventListener('mousedown', this.onCanvasMouseDown);
            this.canvas.removeEventListener('mousemove', this.onCanvasMouseMove);
            this.canvas.removeEventListener('mouseup', this.onCanvasMouseUp);
            this.canvas.removeEventListener('wheel', this.onCanvasWheel);
            this.canvas.removeEventListener('mouseleave', this.onCanvasMouseLeave);
            this.canvas.removeEventListener('keydown', this.onCanvasKeyDown);
        }
        
        this.canvas = null;
        this.isDragging = false;
        
        console.log('🖱️ TimelineInteractionHandler: Destroyed');
    }
}
