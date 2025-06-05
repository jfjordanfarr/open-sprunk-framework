
/**
 * Playback Controller
 * 
 * Manages playback state, timing, and synchronization for the Performance Stage.
 * Handles start, pause, stop, seek operations and animation frame coordination.
 * 
 * @class PlaybackController
 * @description Controls temporal state and playback coordination for synchronized
 *              audio-visual performance playback with frame-accurate timing.
 */

export class PlaybackController {
    constructor(eventBus, stateManager, renderCallback) {
        this.eventBus = eventBus;
        this.stateManager = stateManager;
        this.renderCallback = renderCallback; // Function to call for rendering frames
        
        // Synchronized state
        this.isPlaying = false;
        this.currentTime = 0;
        this.lastFrameTime = 0;
        this.syncTolerance = 0.01; // 10ms sync tolerance
        
        // Animation frame tracking
        this.animationFrameId = null;
        
        console.log('⏯️ PlaybackController: Initialized');
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Timeline control events
        this.eventBus.on('timeline:play', () => this.startPlayback());
        this.eventBus.on('timeline:pause', () => this.pausePlayback());
        this.eventBus.on('timeline:stop', () => this.stopPlayback());
        this.eventBus.on('timeline:seek', (data) => this.setCurrentTime(data.time));
        
        console.log('⏯️ PlaybackController: Event handlers set up');
    }

    /**
     * Start playback and begin the render loop
     */
    async startPlayback() {
        if (this.isPlaying) {
            console.log('⏯️ PlaybackController: Already playing, ignoring start request');
            return;
        }

        console.log('⏯️ PlaybackController: Starting playback...');
        this.isPlaying = true;
        this.lastFrameTime = performance.now();
        
        // Start render loop
        this.animationFrameId = requestAnimationFrame(() => this.renderLoop());
        
        this.eventBus.emit('stage:playback_started', {
            currentTime: this.currentTime
        });
        
        console.log('⏯️ PlaybackController: Playback started');
    }
    
    /**
     * Pause playback and stop the render loop
     */
    pausePlayback() {
        if (!this.isPlaying) {
            console.log('⏯️ PlaybackController: Not playing, ignoring pause request');
            return;
        }
        
        console.log('⏯️ PlaybackController: Pausing playback...');
        this.isPlaying = false;
        
        // Stop render loop
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        this.eventBus.emit('stage:playback_paused', {
            currentTime: this.currentTime
        });
        
        console.log('⏯️ PlaybackController: Playback paused');
    }
    
    /**
     * Stop playback and reset to beginning
     */
    stopPlayback() {
        console.log('⏯️ PlaybackController: Stopping playback...');
        this.pausePlayback();
        
        // Reset to beginning
        this.setCurrentTime(0);
        
        this.eventBus.emit('stage:playback_stopped');
        console.log('⏯️ PlaybackController: Playback stopped');
    }

    /**
     * Set current playback time and trigger a render
     */
    setCurrentTime(time) {
        this.currentTime = Math.max(0, time);
        
        // Trigger immediate render for the new time
        if (this.renderCallback) {
            this.renderCallback(this.currentTime);
        }
        
        this.eventBus.emit('stage:time_changed', {
            currentTime: this.currentTime
        });
    }

    /**
     * Main render loop for playback
     */
    renderLoop() {
        if (!this.isPlaying) return;
        
        const now = performance.now();
        const deltaTime = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;
        
        // Update current time (simple increment for now)
        this.currentTime += deltaTime;
        
        // Render current frame
        if (this.renderCallback) {
            this.renderCallback(this.currentTime);
        }
        
        // Continue render loop
        this.animationFrameId = requestAnimationFrame(() => this.renderLoop());
    }

    /**
     * Get current playback state
     */
    getPlaybackState() {
        return {
            isPlaying: this.isPlaying,
            currentTime: this.currentTime,
            syncTolerance: this.syncTolerance
        };
    }

    /**
     * Check if playback is synchronized within tolerance
     */
    isSynchronized(targetTime) {
        return Math.abs(this.currentTime - targetTime) <= this.syncTolerance;
    }

    /**
     * Synchronize to a specific time (for external sync requirements)
     */
    synchronizeTo(targetTime) {
        const timeDiff = Math.abs(this.currentTime - targetTime);
        
        if (timeDiff > this.syncTolerance) {
            console.log(`⏯️ PlaybackController: Synchronizing from ${this.currentTime.toFixed(3)}s to ${targetTime.toFixed(3)}s`);
            this.setCurrentTime(targetTime);
            
            this.eventBus.emit('stage:playback_synchronized', {
                previousTime: this.currentTime,
                newTime: targetTime,
                timeDiff
            });
        }
    }

    destroy() {
        console.log('⏯️ PlaybackController: Destroying...');
        
        // Stop playback if running
        if (this.isPlaying) {
            this.pausePlayback();
        }
        
        console.log('⏯️ PlaybackController: Destroyed');
    }
}
