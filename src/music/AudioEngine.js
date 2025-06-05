/**
 * Basic Audio Engine for Timeline Synchronization
 * 
 * Provides basic audio playback capabilities and timing synchronization
 * for the Timeline system. This is a minimal implementation focused on
 * timeline coordination rather than full music editing features.
 */

export class AudioEngine {
    constructor(eventBus) {
        this.eventBus = eventBus;
        
        // Audio context setup
        this.audioContext = null;
        this.isInitialized = false;
        
        // Playback state
        this.isPlaying = false;
        this.currentTime = 0;
        this.startTime = 0;
        this.pauseTime = 0;
        
        // Tempo and timing
        this.tempo = 120; // BPM
        this.timeSignature = { numerator: 4, denominator: 4 };
        
        // Audio sources (simple for now)
        this.audioBuffers = new Map();
        this.playingSources = new Map();
        
        console.log('🎵 AudioEngine: Initialized for timeline synchronization');
    }

    /**
     * Initialize Web Audio API
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume context if suspended (browser autoplay policy)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.isInitialized = true;
            console.log('🎵 AudioEngine: Web Audio API initialized');
            
            this.eventBus.emit('audio_engine:initialized');
        } catch (error) {
            console.error('🎵 AudioEngine: Failed to initialize Web Audio API:', error);
            throw error;
        }
    }

    /**
     * PLAYBACK CONTROL METHODS
     * Basic play/pause/stop functionality for timeline synchronization
     */
    
    async startPlayback(fromTime = 0) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.currentTime = fromTime;
        this.startTime = this.audioContext.currentTime - fromTime;
        
        console.log(`🎵 AudioEngine: Starting playback from ${fromTime}s`);
        
        this.eventBus.emit('audio_engine:playback_started', {
            currentTime: this.currentTime,
            audioContextTime: this.audioContext.currentTime
        });
        
        // Start timing loop
        this._startTimingLoop();
    }
    
    pausePlayback() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        this.pauseTime = this.audioContext.currentTime;
        
        // Stop all playing sources
        this.playingSources.forEach(source => {
            try {
                source.stop();
            } catch (e) {
                // Source may already be stopped
            }
        });
        this.playingSources.clear();
        
        console.log(`🎵 AudioEngine: Playback paused at ${this.currentTime}s`);
        
        this.eventBus.emit('audio_engine:playback_paused', {
            currentTime: this.currentTime
        });
    }
    
    stopPlayback() {
        this.pausePlayback();
        this.currentTime = 0;
        this.startTime = 0;
        this.pauseTime = 0;
        
        console.log('🎵 AudioEngine: Playback stopped');
        
        this.eventBus.emit('audio_engine:playback_stopped');
    }

    /**
     * TEMPO AND TIMING METHODS
     */
    
    setTempo(newTempo) {
        const oldTempo = this.tempo;
        this.tempo = newTempo;
        
        console.log(`🎵 AudioEngine: Tempo changed from ${oldTempo} to ${newTempo} BPM`);
        
        this.eventBus.emit('audio_engine:tempo_changed', {
            oldTempo,
            newTempo: this.tempo
        });
    }
    
    setTimeSignature(numerator, denominator) {
        this.timeSignature = { numerator, denominator };
        
        console.log(`🎵 AudioEngine: Time signature set to ${numerator}/${denominator}`);
        
        this.eventBus.emit('audio_engine:time_signature_changed', {
            timeSignature: this.timeSignature
        });
    }

    /**
     * TIMING UTILITIES
     */
    
    beatsToSeconds(beats) {
        return (beats * 60) / this.tempo;
    }
    
    secondsToBeats(seconds) {
        return (seconds * this.tempo) / 60;
    }
    
    getCurrentTime() {
        if (!this.isPlaying || !this.audioContext) {
            return this.currentTime;
        }
        
        return this.audioContext.currentTime - this.startTime;
    }

    /**
     * BASIC AUDIO PLAYBACK
     * Simple audio playback for testing timeline functionality
     */
    
    async loadAudioBuffer(url, name) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.audioBuffers.set(name, audioBuffer);
            console.log(`🎵 AudioEngine: Loaded audio buffer: ${name}`);
            
            return audioBuffer;
        } catch (error) {
            console.error(`🎵 AudioEngine: Failed to load audio buffer ${name}:`, error);
            throw error;
        }
    }
    
    playSound(name, when = 0, duration = null) {
        if (!this.isInitialized || !this.audioBuffers.has(name)) {
            console.warn(`🎵 AudioEngine: Cannot play sound ${name} - not loaded or not initialized`);
            return;
        }
        
        const buffer = this.audioBuffers.get(name);
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        
        const startTime = this.audioContext.currentTime + when;
        
        if (duration) {
            source.start(startTime, 0, duration);
        } else {
            source.start(startTime);
        }
        
        // Track playing source
        const sourceId = `${name}_${Date.now()}`;
        this.playingSources.set(sourceId, source);
        
        // Clean up when finished
        source.onended = () => {
            this.playingSources.delete(sourceId);
        };
        
        return source;
    }

    /**
     * METRONOME FUNCTIONALITY
     * Simple metronome for beat synchronization testing
     */
    
    createMetronome() {
        if (!this.isInitialized) return null;
        
        // Create a simple click sound
        const clickBuffer = this.audioContext.createBuffer(1, 0.1 * this.audioContext.sampleRate, this.audioContext.sampleRate);
        const channelData = clickBuffer.getChannelData(0);
        
        // Generate a short click sound
        for (let i = 0; i < channelData.length; i++) {
            channelData[i] = Math.sin(2 * Math.PI * 800 * i / this.audioContext.sampleRate) * 
                           Math.exp(-i / (this.audioContext.sampleRate * 0.01));
        }
        
        this.audioBuffers.set('metronome_click', clickBuffer);
        console.log('🎵 AudioEngine: Metronome click sound created');
        
        return 'metronome_click';
    }

    /**
     * PRIVATE METHODS
     */
    
    _startTimingLoop() {
        if (!this.isPlaying) return;
        
        // Update current time
        this.currentTime = this.getCurrentTime();
        
        // Emit timing update
        this.eventBus.emit('audio_engine:time_update', {
            currentTime: this.currentTime,
            audioContextTime: this.audioContext.currentTime
        });
        
        // Continue loop
        requestAnimationFrame(() => this._startTimingLoop());
    }

    /**
     * CLEANUP
     */
    
    destroy() {
        this.stopPlayback();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.audioBuffers.clear();
        this.playingSources.clear();
        
        console.log('🎵 AudioEngine: Destroyed');
    }
}
