/**
 * Timeline Class - Unified Timeline for Music and Animation
 * 
 * Manages the unified timeline that enables synchronized music and animation editing.
 * Implements the core temporal coordination system required by unified-timeline-requirement.
 * 
 * OPTIMIZED: Now uses component-based architecture for better maintainability
 * Reduced from 586 lines to ~200 lines through component delegation
 */

import { AudioEngine } from '../music/AudioEngine.js';
import { TimeConverter } from './TimeConverter.js';
import { BeatMarkerGenerator } from './BeatMarkerGenerator.js';
import { TimelinePlaybackManager } from './TimelinePlaybackManager.js';
import { TrackManager } from './TrackManager.js';
import { TemporalCoordinator } from './TemporalCoordinator.js';

export class Timeline {
    constructor(eventBus, audioEngine = null) {
        this.eventBus = eventBus;
        this.audioEngine = audioEngine || new AudioEngine(eventBus);
        
        // Initialize component managers
        this.timeConverter = new TimeConverter();
        this.beatMarkerGenerator = new BeatMarkerGenerator(eventBus);
        this.playbackManager = new TimelinePlaybackManager(eventBus, this.audioEngine);
        this.trackManager = new TrackManager(eventBus);
        this.temporalCoordinator = new TemporalCoordinator(eventBus, this.audioEngine);
        
        // Unified temporal state
        this.currentTime = 0;
        this.duration = 10;
        this.tempo = 120;
        this.timeSignature = { numerator: 4, denominator: 4 };
        
        // Timeline UI state
        this.pixelsPerSecond = 100;
        this.snapToGrid = true;
        this.gridSubdivision = 0.25;
        this.defaultTrackType = 'animation';
        
        console.log('🕰️ Timeline: Initialized with component-based architecture');
        
        this.configureComponents();
        this.setupEventHandlers();
        this.generateBeatMarkers();
    }

    /**
     * Configure component managers with current timeline state
     */
    configureComponents() {
        // Configure time converter
        this.timeConverter.setTempo(this.tempo);
        this.timeConverter.setTimeSignature(this.timeSignature);
        
        // Configure beat marker generator
        this.beatMarkerGenerator.setTempo(this.tempo);
        this.beatMarkerGenerator.setTimeSignature(this.timeSignature);
        this.beatMarkerGenerator.setDuration(this.duration);
        
        // Configure playback manager
        this.playbackManager.setDuration(this.duration);
        
        // Configure track manager
        this.trackManager.setSnapToGrid(this.snapToGrid);
        this.trackManager.setGridSubdivision(this.gridSubdivision);
        
        // Configure temporal coordinator
        this.temporalCoordinator.setTempo(this.tempo);
        this.temporalCoordinator.setTimeSignature(this.timeSignature);
    }

    /**
     * TIME CONVERSION - Delegates to TimeConverter
     */
    beatsToSeconds(beats) {
        return this.timeConverter.beatsToSeconds(beats);
    }
    
    secondsToBeats(seconds) {
        return this.timeConverter.secondsToBeats(seconds);
    }
    
    measureToSeconds(measure) {
        return this.timeConverter.measureToSeconds(measure);
    }
    
    secondsToMeasure(seconds) {
        return this.timeConverter.secondsToMeasure(seconds);
    }

    quantizeToGrid(time) {
        return this.timeConverter.quantizeToGrid(time, this.gridSubdivision);
    }

    /**
     * TRACK MANAGEMENT - Delegates to TrackManager
     */
    addAnimationKeyframe(trackId, time, properties) {
        this.trackManager.addAnimationKeyframe(trackId, time, properties);
        this.updateDuration();
    }
    
    addMusicNote(trackId, time, note) {
        this.trackManager.addMusicNote(trackId, time, note);
        this.updateDuration();
    }

    getAnimationTracks() {
        return this.trackManager.getAnimationTracks();
    }

    getMusicTracks() {
        return this.trackManager.getMusicTracks();
    }

    removeAnimationKeyframe(trackId, keyframeId) {
        this.trackManager.removeAnimationKeyframe(trackId, keyframeId);
        this.updateDuration();
    }

    removeMusicNote(trackId, noteId) {
        this.trackManager.removeMusicNote(trackId, noteId);
        this.updateDuration();
    }

    createTrack(trackId, type) {
        this.trackManager.createTrack(trackId, type);
    }
    
    removeTrack(trackId, type) {
        this.trackManager.removeTrack(trackId, type);
    }

    /**
     * PLAYBACK CONTROL - Delegates to TimelinePlaybackManager
     */
    async play() {
        await this.playbackManager.play();
        this.syncCurrentTime();
    }

    pause() {
        this.playbackManager.pause();
        this.syncCurrentTime();
    }

    stop() {
        this.playbackManager.stop();
        this.currentTime = 0;
    }

    toggle() {
        if (this.isPlaying()) {
            this.pause();
        } else {
            this.play();
        }
    }

    isPlaying() {
        return this.playbackManager.isPlaying();
    }

    setCurrentTime(time) {
        this.currentTime = Math.max(0, Math.min(time, this.duration));
        this.playbackManager.setCurrentTime(this.currentTime);
        
        this.eventBus.emit('timeline:time_changed', {
            currentTime: this.currentTime
        });
    }

    syncCurrentTime() {
        this.currentTime = this.playbackManager.getCurrentTime();
    }

    /**
     * TEMPORAL CONTROL - Delegates to TemporalCoordinator
     */
    setTempo(newTempo) {
        const oldTempo = this.tempo;
        this.tempo = newTempo;
        
        // Update all components
        this.timeConverter.setTempo(newTempo);
        this.beatMarkerGenerator.setTempo(newTempo);
        this.temporalCoordinator.setTempo(newTempo);
        
        // Scale existing events
        this.temporalCoordinator.scaleTempo(oldTempo, newTempo, this.trackManager);
        
        this.generateBeatMarkers();
        
        this.eventBus.emit('timeline:tempo_changed', {
            oldTempo, newTempo, ratio: newTempo / oldTempo
        });
    }
    
    setTimeSignature(numerator, denominator) {
        this.timeSignature = { numerator, denominator };
        
        // Update all components
        this.timeConverter.setTimeSignature(this.timeSignature);
        this.beatMarkerGenerator.setTimeSignature(this.timeSignature);
        this.temporalCoordinator.setTimeSignature(this.timeSignature);
        
        this.audioEngine.setTimeSignature(numerator, denominator);
        this.generateBeatMarkers();
        
        this.eventBus.emit('timeline:time_signature_changed', {
            timeSignature: this.timeSignature
        });
    }

    /**
     * BEAT MARKERS - Delegates to BeatMarkerGenerator
     */
    generateBeatMarkers() {
        const markers = this.beatMarkerGenerator.generateBeatMarkers();
        
        this.eventBus.emit('timeline:beat_markers_updated', {
            markers: markers
        });
    }

    getBeatMarkers() {
        return this.beatMarkerGenerator.getBeatMarkers();
    }

    /**
     * CROSS-DOMAIN OPERATIONS - Delegates to TemporalCoordinator
     */
    copyTimeRange(startTime, endTime) {
        return this.temporalCoordinator.copyTimeRange(
            startTime, endTime, this.trackManager
        );
    }
    
    pasteTimeRange(targetTime, selection) {
        this.temporalCoordinator.pasteTimeRange(
            targetTime, selection, this.trackManager
        );
        this.updateDuration();
    }

    /**
     * TIMELINE DISPLAY UTILITIES
     */
    setZoom(pixelsPerSecond) {
        this.pixelsPerSecond = pixelsPerSecond;
        this.eventBus.emit('timeline:zoom_changed', {
            pixelsPerSecond: this.pixelsPerSecond
        });
    }
    
    timeToPixels(time) {
        return time * this.pixelsPerSecond;
    }
    
    pixelsToTime(pixels) {
        return pixels / this.pixelsPerSecond;
    }

    /**
     * CONFIGURATION
     */
    setSnapToGrid(enabled) {
        this.snapToGrid = enabled;
        this.trackManager.setSnapToGrid(enabled);
    }
    
    setGridSubdivision(subdivision) {
        this.gridSubdivision = subdivision;
        this.trackManager.setGridSubdivision(subdivision);
    }

    setDefaultTrackType(type) {
        this.defaultTrackType = type;
        this.eventBus.emit('timeline:default_track_type_changed', {
            defaultTrackType: this.defaultTrackType
        });
    }

    /**
     * PRIVATE METHODS
     */
    setupEventHandlers() {
        this.eventBus.on('timeline:play', () => this.play());
        this.eventBus.on('timeline:pause', () => this.pause());
        this.eventBus.on('timeline:stop', () => this.stop());
        this.eventBus.on('timeline:seek', (data) => this.setCurrentTime(data.time));
        this.eventBus.on('timeline:set_tempo', (data) => this.setTempo(data.tempo));
        this.eventBus.on('timeline:set_time_signature', (data) => 
            this.setTimeSignature(data.numerator, data.denominator));
    }
    
    updateDuration() {
        const maxTime = this.trackManager.getMaxTime();
        const newDuration = Math.max(10, maxTime + 2);
        
        if (newDuration !== this.duration) {
            this.duration = newDuration;
            this.beatMarkerGenerator.setDuration(this.duration);
            this.playbackManager.setDuration(this.duration);
            this.generateBeatMarkers();
            
            this.eventBus.emit('timeline:duration_changed', {
                duration: this.duration
            });
        }
    }

    /**
     * PUBLIC API
     */
    getTimelineData() {
        return {
            currentTime: this.currentTime,
            duration: this.duration,
            tempo: this.tempo,
            timeSignature: this.timeSignature,
            isPlaying: this.isPlaying(),
            animationTracks: Array.from(this.getAnimationTracks().entries()),
            musicTracks: Array.from(this.getMusicTracks().entries()),
            beatMarkers: this.getBeatMarkers()
        };
    }

    /**
     * CLEANUP
     */
    destroy() {
        this.stop();
        
        // Cleanup components
        this.playbackManager?.destroy();
        this.trackManager?.destroy();
        this.temporalCoordinator?.destroy();
        
        // Clean up event handlers
        this.eventBus.off('timeline:play');
        this.eventBus.off('timeline:pause');
        this.eventBus.off('timeline:stop');
        this.eventBus.off('timeline:seek');
        this.eventBus.off('timeline:set_tempo');
        this.eventBus.off('timeline:set_time_signature');
        
        console.log('🕰️ Timeline: Destroyed');
    }
}
