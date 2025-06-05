/**
 * TemporalCoordinator Class
 * 
 * Manages tempo changes, time signature adjustments, and temporal synchronization
 * across music and animation systems. Ensures consistent timing relationships
 * when musical parameters change.
 */

export class TemporalCoordinator {
    constructor(eventBus, audioEngine) {
        this.eventBus = eventBus;
        this.audioEngine = audioEngine;
        
        // Temporal settings
        this.tempo = 120; // BPM (beats per minute)
        this.timeSignature = { numerator: 4, denominator: 4 };
        
        console.log('⏱️ TemporalCoordinator: Initialized for tempo and timing coordination');
        
        this.setupEventHandlers();
    }

    /**
     * TEMPO MANAGEMENT
     * Handles tempo changes and proportional time adjustments
     */
    setTempo(newTempo, trackManager = null) {
        const oldTempo = this.tempo;
        this.tempo = newTempo;
        
        // Calculate proportional adjustment ratio
        const ratio = oldTempo / newTempo;
        
        // Proportionally adjust all animation timing if trackManager provided
        if (trackManager) {
            this.adjustAnimationTiming(trackManager, ratio);
        }
        
        // Update audio engine tempo
        this.audioEngine.setTempo(newTempo);
        
        console.log(`⏱️ TemporalCoordinator: Tempo changed from ${oldTempo} to ${newTempo} BPM (ratio: ${ratio})`);
        
        this.eventBus.emit('timeline:tempo_changed', {
            oldTempo, newTempo, ratio
        });
        
        return ratio;
    }
    
    adjustAnimationTiming(trackManager, ratio) {
        const allTracks = trackManager.getAllTracks();
        
        // Adjust animation tracks
        allTracks.animation.forEach(([trackId, track]) => {
            track.forEach(keyframe => {
                keyframe.time *= ratio;
            });
            trackManager.sortTrackByTime(track);
        });
        
        console.log(`⏱️ TemporalCoordinator: Adjusted animation timing by ratio ${ratio}`);
    }

    /**
     * TIME SIGNATURE MANAGEMENT
     */
    setTimeSignature(numerator, denominator) {
        this.timeSignature = { numerator, denominator };
        
        // Update audio engine
        this.audioEngine.setTimeSignature(numerator, denominator);
        
        console.log(`⏱️ TemporalCoordinator: Time signature set to ${numerator}/${denominator}`);
        
        this.eventBus.emit('timeline:time_signature_changed', {
            timeSignature: this.timeSignature
        });
    }

    /**
     * BEAT-BASED SEEKING
     * Provides musical navigation through the timeline
     */
    seekToMeasure(measure, playbackManager) {
        const time = this.measureToSeconds(measure);
        playbackManager.seekToTime(time);
        
        console.log(`⏱️ TemporalCoordinator: Seeked to measure ${measure} (${time}s)`);
    }
    
    seekToBeat(beat, playbackManager) {
        const time = this.beatsToSeconds(beat);
        playbackManager.seekToTime(time);
        
        console.log(`⏱️ TemporalCoordinator: Seeked to beat ${beat} (${time}s)`);
    }

    /**
     * TIME CONVERSION UTILITIES
     */
    beatsToSeconds(beats) {
        return (beats * 60) / this.tempo;
    }
    
    secondsToBeats(seconds) {
        return (seconds * this.tempo) / 60;
    }
    
    measureToSeconds(measure) {
        const beatsPerMeasure = this.timeSignature.numerator;
        return this.beatsToSeconds(measure * beatsPerMeasure);
    }
    
    secondsToMeasure(seconds) {
        const beatsPerMeasure = this.timeSignature.numerator;
        return this.secondsToBeats(seconds) / beatsPerMeasure;
    }

    /**
     * MUSICAL TIME CALCULATIONS
     */
    getBeatsPerMeasure() {
        return this.timeSignature.numerator;
    }
    
    getBeatDuration() {
        return 60 / this.tempo; // Duration of one beat in seconds
    }
    
    getMeasureDuration() {
        return this.getBeatDuration() * this.getBeatsPerMeasure();
    }
    
    getCurrentBeat(currentTime) {
        return this.secondsToBeats(currentTime);
    }
    
    getCurrentMeasure(currentTime) {
        return this.secondsToMeasure(currentTime);
    }

    /**
     * RHYTHM ANALYSIS
     */
    getPositionInMeasure(currentTime) {
        const measure = this.getCurrentMeasure(currentTime);
        const wholeMeasures = Math.floor(measure);
        const positionInMeasure = measure - wholeMeasures;
        
        return {
            measure: wholeMeasures,
            beat: positionInMeasure * this.getBeatsPerMeasure(),
            normalizedPosition: positionInMeasure // 0.0 to 1.0 within measure
        };
    }
    
    getNextBeatTime(currentTime) {
        const currentBeat = this.getCurrentBeat(currentTime);
        const nextBeat = Math.ceil(currentBeat);
        return this.beatsToSeconds(nextBeat);
    }
    
    getNextMeasureTime(currentTime) {
        const currentMeasure = this.getCurrentMeasure(currentTime);
        const nextMeasure = Math.ceil(currentMeasure);
        return this.measureToSeconds(nextMeasure);
    }

    /**
     * SYNCHRONIZATION UTILITIES
     */
    calculateSyncOffset(targetTime, referenceTime) {
        return targetTime - referenceTime;
    }
    
    isWithinSyncTolerance(time1, time2, tolerance = 0.01) {
        return Math.abs(time1 - time2) <= tolerance;
    }
    
    alignToNearestBeat(time) {
        const beat = this.secondsToBeats(time);
        const nearestBeat = Math.round(beat);
        return this.beatsToSeconds(nearestBeat);
    }
    
    alignToNearestMeasure(time) {
        const measure = this.secondsToMeasure(time);
        const nearestMeasure = Math.round(measure);
        return this.measureToSeconds(nearestMeasure);
    }

    /**
     * STATE ACCESS
     */
    getTempo() {
        return this.tempo;
    }
    
    getTimeSignature() {
        return { ...this.timeSignature };
    }
    
    getTemporalState() {
        return {
            tempo: this.tempo,
            timeSignature: { ...this.timeSignature },
            beatDuration: this.getBeatDuration(),
            measureDuration: this.getMeasureDuration()
        };
    }

    /**
     * EVENT HANDLERS
     */
    setupEventHandlers() {
        // Handle tempo changes
        this.eventBus.on('timeline:set_tempo', (data) => this.setTempo(data.tempo, data.trackManager));
        this.eventBus.on('timeline:set_time_signature', (data) => 
            this.setTimeSignature(data.numerator, data.denominator));
        
        // Handle musical navigation
        this.eventBus.on('timeline:seek_to_measure', (data) => 
            this.seekToMeasure(data.measure, data.playbackManager));
        this.eventBus.on('timeline:seek_to_beat', (data) => 
            this.seekToBeat(data.beat, data.playbackManager));
    }

    /**
     * CLEANUP
     */
    destroy() {
        // Clean up event handlers
        this.eventBus.off('timeline:set_tempo');
        this.eventBus.off('timeline:set_time_signature');
        this.eventBus.off('timeline:seek_to_measure');
        this.eventBus.off('timeline:seek_to_beat');
        
        console.log('⏱️ TemporalCoordinator: Destroyed');
    }
}
