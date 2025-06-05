/**
 * Timeline Display Manager
 * 
 * Manages display state, view updates, and time formatting
 * for the timeline UI components.
 */

export class TimelineDisplayManager {
    constructor(timeline, eventBus) {
        this.timeline = timeline;
        this.eventBus = eventBus;
        
        // Display state
        this.updateInterval = null;
        this.isUpdating = false;
        this.lastUpdateTime = 0;
        
        // Performance settings
        this.targetFPS = 60;
        this.minUpdateInterval = 1000 / this.targetFPS;
        
        console.log('📊 TimelineDisplayManager: Initialized');
        
        this.setupUpdateLoop();
        this.setupEventHandlers();
    }

    /**
     * Setup the display update loop
     */
    setupUpdateLoop() {
        this.updateInterval = setInterval(() => {
            this.updateDisplay();
        }, this.minUpdateInterval);
    }

    /**
     * Setup event handlers for timeline events
     */
    setupEventHandlers() {
        // Timeline state changes
        this.eventBus.on('timeline:time_update', () => {
            this.requestUpdate('time');
        });
        
        this.eventBus.on('timeline:tempo_changed', (data) => {
            this.requestUpdate('tempo', data);
        });
        
        this.eventBus.on('timeline:beat_markers_updated', () => {
            this.requestUpdate('beats');
        });
        
        this.eventBus.on('timeline:keyframe_added', () => {
            this.requestUpdate('tracks');
        });
        
        this.eventBus.on('timeline:note_added', () => {
            this.requestUpdate('tracks');
        });
        
        this.eventBus.on('timeline:zoom_changed', () => {
            this.requestUpdate('zoom');
        });
        
        this.eventBus.on('timeline:tracks_changed', () => {
            this.requestUpdate('tracks');
        });
        
        // Playback state changes
        this.eventBus.on('timeline:play_started', () => {
            this.startContinuousUpdate();
        });
        
        this.eventBus.on('timeline:play_stopped', () => {
            this.stopContinuousUpdate();
        });
        
        this.eventBus.on('timeline:play_paused', () => {
            this.stopContinuousUpdate();
        });
    }

    /**
     * Main display update method
     */
    updateDisplay() {
        if (!this.isUpdating) return;
        
        const now = performance.now();
        
        // Throttle updates based on performance
        if (now - this.lastUpdateTime < this.minUpdateInterval) {
            return;
        }
        
        this.lastUpdateTime = now;
        
        // Emit update event for UI components
        this.eventBus.emit('timeline-display:update', {
            currentTime: this.timeline.currentTime,
            isPlaying: this.timeline.isPlaying,
            tempo: this.timeline.tempo,
            pixelsPerSecond: this.timeline.pixelsPerSecond,
            timestamp: now
        });
    }

    /**
     * Request a specific type of update
     */
    requestUpdate(updateType, data = null) {
        this.eventBus.emit('timeline-display:partial_update', {
            type: updateType,
            data,
            timestamp: performance.now()
        });
    }

    /**
     * Start continuous updates (during playback)
     */
    startContinuousUpdate() {
        this.isUpdating = true;
        console.log('📊 TimelineDisplayManager: Started continuous updates');
    }

    /**
     * Stop continuous updates
     */
    stopContinuousUpdate() {
        this.isUpdating = false;
        console.log('📊 TimelineDisplayManager: Stopped continuous updates');
    }

    /**
     * Format time for display in various formats
     */
    formatTime(seconds, format = 'mm:ss.ff') {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const frames = Math.floor((secs % 1) * 100); // Assuming 100 fps for frames
        
        switch (format) {
            case 'mm:ss.ff':
                return `${minutes.toString().padStart(2, '0')}:${Math.floor(secs).toString().padStart(2, '0')}.${frames.toString().padStart(2, '0')}`;
                
            case 'mm:ss':
                return `${minutes.toString().padStart(2, '0')}:${Math.floor(secs).toString().padStart(2, '0')}`;
                
            case 'seconds':
                return seconds.toFixed(2);
                
            case 'beats':
                const beatDuration = 60 / this.timeline.tempo;
                const totalBeats = seconds / beatDuration;
                const measure = Math.floor(totalBeats / 4) + 1;
                const beat = Math.floor(totalBeats % 4) + 1;
                const subBeat = Math.floor((totalBeats % 1) * 4) + 1;
                return `${measure}.${beat}.${subBeat}`;
                
            default:
                return this.formatTime(seconds, 'mm:ss.ff');
        }
    }

    /**
     * Format duration for display
     */
    formatDuration(seconds) {
        if (seconds < 60) {
            return `${seconds.toFixed(1)}s`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours}:${minutes.toString().padStart(2, '0')}:00`;
        }
    }

    /**
     * Calculate visible time range for a given viewport
     */
    calculateVisibleTimeRange(viewportWidth, scrollPosition = 0) {
        const pixelsPerSecond = this.timeline.pixelsPerSecond || 100;
        const startTime = scrollPosition / pixelsPerSecond;
        const endTime = (scrollPosition + viewportWidth) / pixelsPerSecond;
        
        return {
            startTime,
            endTime,
            duration: endTime - startTime,
            pixelsPerSecond
        };
    }

    /**
     * Get timeline statistics for display
     */
    getTimelineStats() {
        const stats = {
            duration: this.timeline.duration || 0,
            trackCount: (this.timeline.animationTracks?.size || 0) + (this.timeline.musicTracks?.size || 0),
            animationTrackCount: this.timeline.animationTracks?.size || 0,
            musicTrackCount: this.timeline.musicTracks?.size || 0,
            keyframeCount: 0,
            noteCount: 0,
            tempo: this.timeline.tempo,
            isPlaying: this.timeline.isPlaying,
            currentTime: this.timeline.currentTime
        };
        
        // Count keyframes and notes
        if (this.timeline.animationTracks) {
            this.timeline.animationTracks.forEach(track => {
                stats.keyframeCount += track.length;
            });
        }
        
        if (this.timeline.musicTracks) {
            this.timeline.musicTracks.forEach(track => {
                stats.noteCount += track.length;
            });
        }
        
        return stats;
    }

    /**
     * Set update frequency (FPS)
     */
    setUpdateFrequency(fps) {
        this.targetFPS = Math.max(1, Math.min(120, fps));
        this.minUpdateInterval = 1000 / this.targetFPS;
        
        // Restart update loop with new interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.setupUpdateLoop();
        }
        
        console.log(`📊 TimelineDisplayManager: Update frequency set to ${this.targetFPS} FPS`);
    }

    /**
     * Enable or disable display updates
     */
    setEnabled(enabled) {
        if (enabled && !this.updateInterval) {
            this.setupUpdateLoop();
        } else if (!enabled && this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log(`📊 TimelineDisplayManager: ${enabled ? 'Enabled' : 'Disabled'}`);
    }

    /**
     * Force immediate update
     */
    forceUpdate() {
        this.updateDisplay();
    }

    /**
     * Get current display state
     */
    getDisplayState() {
        return {
            isUpdating: this.isUpdating,
            targetFPS: this.targetFPS,
            lastUpdateTime: this.lastUpdateTime,
            stats: this.getTimelineStats()
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        // Clear update interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        // Remove event listeners
        this.eventBus.off('timeline:time_update');
        this.eventBus.off('timeline:tempo_changed');
        this.eventBus.off('timeline:beat_markers_updated');
        this.eventBus.off('timeline:keyframe_added');
        this.eventBus.off('timeline:note_added');
        this.eventBus.off('timeline:zoom_changed');
        this.eventBus.off('timeline:tracks_changed');
        this.eventBus.off('timeline:play_started');
        this.eventBus.off('timeline:play_stopped');
        this.eventBus.off('timeline:play_paused');
        
        this.isUpdating = false;
        
        console.log('📊 TimelineDisplayManager: Destroyed');
    }
}
