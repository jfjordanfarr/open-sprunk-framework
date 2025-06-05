/**
 * TimelinePlaybackManager Class
 * 
 * Manages unified playback control for synchronized music and animation.
 * Coordinates between audio engine and animation systems to maintain
 * precise temporal synchronization.
 */

export class TimelinePlaybackManager {
    constructor(eventBus, audioEngine) {
        this.eventBus = eventBus;
        this.audioEngine = audioEngine;
        
        // Playback state
        this.isPlaying = false;
        this.isLooping = false;
        this.currentTime = 0;
        this.duration = 10; // Default 10 seconds
        this.lastUpdateTime = 0;
        this.animationFrameId = null;
        
        // Synchronization settings
        this.syncPrecision = 0.01; // 10ms tolerance
        
        console.log('▶️ TimelinePlaybackManager: Initialized for unified playback control');
        
        this.setupEventHandlers();
    }

    /**
     * PLAYBACK CONTROL
     * Unified play/pause/stop controls for music and animation
     */
    async play() {
        if (this.isPlaying) return;
        
        console.log(`▶️ TimelinePlaybackManager: Starting playback from ${this.currentTime}s`);
        
        this.isPlaying = true;
        this.lastUpdateTime = performance.now();
        
        // Start audio engine
        try {
            await this.audioEngine.startPlayback(this.currentTime);
        } catch (error) {
            console.warn('▶️ TimelinePlaybackManager: Audio engine failed to start, continuing with visual timeline only:', error);
        }
        
        // Start animation loop
        this.animationFrameId = requestAnimationFrame(() => this.updateLoop());
        
        this.eventBus.emit('timeline:playback_started', {
            currentTime: this.currentTime
        });
    }
    
    pause() {
        if (!this.isPlaying) return;
        
        console.log(`⏸️ TimelinePlaybackManager: Pausing playback at ${this.currentTime}s`);
        
        this.isPlaying = false;
        
        // Stop audio engine
        this.audioEngine.pausePlayback();
        
        // Stop animation loop
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        this.eventBus.emit('timeline:playback_paused', {
            currentTime: this.currentTime
        });
    }
    
    stop() {
        this.pause();
        this.setCurrentTime(0);
        
        console.log('⏹️ TimelinePlaybackManager: Playback stopped');
        
        this.eventBus.emit('timeline:playback_stopped');
    }

    /**
     * TIME NAVIGATION
     * Seeking and scrubbing through timeline
     */
    setCurrentTime(time) {
        this.currentTime = Math.max(0, Math.min(time, this.duration));
        
        // Update audio engine if playing
        if (this.isPlaying) {
            this.audioEngine.stopPlayback();
            this.audioEngine.startPlayback(this.currentTime);
        }
        
        this.eventBus.emit('timeline:time_changed', {
            currentTime: this.currentTime
        });
    }
    
    seekToTime(time) {
        this.setCurrentTime(time);
        console.log(`🎯 TimelinePlaybackManager: Seeked to ${this.currentTime}s`);
    }

    /**
     * PLAYBACK LOOP
     * High-precision animation frame loop for smooth playback
     */
    updateLoop() {
        if (!this.isPlaying) return;
        
        const now = performance.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;
        
        // Update current time
        this.currentTime += deltaTime;
        
        // Handle looping
        if (this.isLooping && this.currentTime >= this.duration) {
            this.currentTime = 0;
            
            // Restart audio for seamless loop
            this.audioEngine.stopPlayback();
            this.audioEngine.startPlayback(this.currentTime);
        } else if (this.currentTime >= this.duration) {
            this.stop();
            return;
        }
        
        // Emit time update for synchronization
        this.eventBus.emit('timeline:time_update', {
            currentTime: this.currentTime,
            deltaTime: deltaTime
        });
        
        // Continue loop
        this.animationFrameId = requestAnimationFrame(() => this.updateLoop());
    }

    /**
     * CONFIGURATION
     */
    setDuration(duration) {
        this.duration = duration;
        
        // Ensure current time doesn't exceed new duration
        if (this.currentTime > this.duration) {
            this.setCurrentTime(this.duration);
        }
        
        console.log(`⏱️ TimelinePlaybackManager: Duration set to ${duration}s`);
        
        this.eventBus.emit('timeline:duration_changed', {
            duration: this.duration
        });
    }
    
    setLooping(enabled) {
        this.isLooping = enabled;
        console.log(`🔄 TimelinePlaybackManager: Looping ${enabled ? 'enabled' : 'disabled'}`);
        
        this.eventBus.emit('timeline:looping_changed', {
            isLooping: this.isLooping
        });
    }
    
    setSyncPrecision(precision) {
        this.syncPrecision = precision;
        console.log(`🎯 TimelinePlaybackManager: Sync precision set to ${precision}s`);
    }

    /**
     * STATE ACCESS
     */
    getPlaybackState() {
        return {
            isPlaying: this.isPlaying,
            isLooping: this.isLooping,
            currentTime: this.currentTime,
            duration: this.duration,
            syncPrecision: this.syncPrecision
        };
    }
    
    getCurrentTime() {
        return this.currentTime;
    }
    
    getDuration() {
        return this.duration;
    }
    
    isCurrentlyPlaying() {
        return this.isPlaying;
    }

    /**
     * EVENT HANDLERS
     */
    setupEventHandlers() {
        // Handle external timeline control events
        this.eventBus.on('timeline:play', () => this.play());
        this.eventBus.on('timeline:pause', () => this.pause());
        this.eventBus.on('timeline:stop', () => this.stop());
        this.eventBus.on('timeline:seek', (data) => this.seekToTime(data.time));
        this.eventBus.on('timeline:set_looping', (data) => this.setLooping(data.enabled));
    }

    /**
     * CLEANUP
     */
    destroy() {
        this.stop();
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // Clean up event handlers
        this.eventBus.off('timeline:play');
        this.eventBus.off('timeline:pause');
        this.eventBus.off('timeline:stop');
        this.eventBus.off('timeline:seek');
        this.eventBus.off('timeline:set_looping');
        
        console.log('▶️ TimelinePlaybackManager: Destroyed');
    }
}
