/**
 * Timeline Canvas Renderer
 * 
 * Handles all canvas rendering operations for the timeline including
 * grid, tracks, playhead, time ruler, and visual elements.
 */

export class TimelineCanvasRenderer {
    constructor(timeline, eventBus, colors) {
        this.timeline = timeline;
        this.eventBus = eventBus;
        this.colors = colors;
        
        // Canvas elements
        this.canvas = null;
        this.ctx = null;
        
        // Display settings
        this.trackHeight = 40;
        this.headerHeight = 60;
        this.scrollPosition = 0;
        
        console.log('🎨 TimelineCanvasRenderer: Initialized');
    }

    /**
     * Create and setup canvas
     */
    createCanvas(parent) {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            flex: 1;
            display: block;
            cursor: crosshair;
        `;
        
        this.ctx = this.canvas.getContext('2d');
        parent.appendChild(this.canvas);
        
        // Handle canvas resize
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        return this.canvas;
    }

    /**
     * Main render method
     */
    render() {
        if (!this.canvas || !this.ctx) return;
        
        const { width, height } = this.canvas;
        
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, width, height);
        
        // Draw timeline elements in order
        this.drawGrid();
        this.drawTracks();
        this.drawPlayhead();
        this.drawTimeRuler();
    }

    /**
     * Draw the timeline grid
     */
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

    /**
     * Draw all tracks
     */
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

    /**
     * Draw a single track
     */
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

    /**
     * Draw the playhead
     */
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

    /**
     * Draw the time ruler
     */
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
        
        // Draw current time display
        const currentTimeText = this.formatTime(this.timeline.currentTime);
        this.ctx.fillStyle = this.colors.playhead;
        this.ctx.font = 'bold 12px monospace';
        this.ctx.fillText(currentTimeText, 8, this.headerHeight - 8);
    }

    /**
     * Draw empty state message
     */
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
     * Handle canvas resize
     */
    resizeCanvas() {
        if (!this.canvas || !this.canvas.parentElement) return;
        
        const parent = this.canvas.parentElement;
        const rect = parent.getBoundingClientRect();
        
        this.canvas.width = rect.width - 2; // Account for border
        this.canvas.height = 350; // Fixed height for timeline
        
        this.render();
    }

    /**
     * Convert time to canvas x coordinate
     */
    timeToCanvasX(time) {
        return this.timeline.timeToPixels(time) - this.scrollPosition;
    }

    /**
     * Convert canvas x coordinate to time
     */
    canvasXToTime(x) {
        return this.timeline.pixelsToTime(x + this.scrollPosition);
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
     * Update scroll position
     */
    setScrollPosition(position) {
        this.scrollPosition = Math.max(0, position);
        this.render();
    }

    /**
     * Get current scroll position
     */
    getScrollPosition() {
        return this.scrollPosition;
    }

    /**
     * Center view on specific time
     */
    centerOnTime(time) {
        const centerX = this.timeToCanvasX(time);
        const viewportWidth = this.canvas ? this.canvas.width : 800;
        this.scrollPosition = Math.max(0, centerX - viewportWidth / 2);
        this.render();
    }

    /**
     * Get canvas element
     */
    getCanvas() {
        return this.canvas;
    }

    /**
     * Get canvas context
     */
    getContext() {
        return this.ctx;
    }

    /**
     * Cleanup
     */
    destroy() {
        window.removeEventListener('resize', () => this.resizeCanvas());
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        this.canvas = null;
        this.ctx = null;
        
        console.log('🎨 TimelineCanvasRenderer: Destroyed');
    }
}
