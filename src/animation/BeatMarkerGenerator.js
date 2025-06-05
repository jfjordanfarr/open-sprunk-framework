/**
 * BeatMarkerGenerator Class
 * 
 * Handles beat marker generation, grid quantization, and temporal visualization
 * for the unified timeline system. Provides the visual rhythm structure that
 * enables precise audio-visual synchronization.
 */

export class BeatMarkerGenerator {
    constructor(eventBus) {
        this.eventBus = eventBus;
        
        // Beat marker configuration
        this.beatMarkers = [];
        this.snapToGrid = true;
        this.gridSubdivision = 0.25; // 16th notes by default
        
        // Store current configuration
        this.tempo = 120; // Default BPM
        this.timeSignature = { numerator: 4, denominator: 4 }; // Default 4/4
        this.duration = 30; // Default 30 seconds
        
        console.log('🎵 BeatMarkerGenerator: Initialized for timeline grid management');
    }

    /**
     * CONFIGURATION METHODS
     * Methods for updating tempo, time signature, and duration
     */
    setTempo(tempo) {
        this.tempo = tempo;
        console.log(`🎵 BeatMarkerGenerator: Tempo set to ${tempo} BPM`);
        this.regenerateMarkers();
    }
    
    setTimeSignature(timeSignature) {
        this.timeSignature = timeSignature;
        console.log(`🎵 BeatMarkerGenerator: Time signature set to ${timeSignature.numerator}/${timeSignature.denominator}`);
        this.regenerateMarkers();
    }
    
    setDuration(duration) {
        this.duration = duration;
        console.log(`🎵 BeatMarkerGenerator: Duration set to ${duration} seconds`);
        this.regenerateMarkers();
    }
    
    /**
     * INTERNAL HELPER
     * Regenerates markers when configuration changes
     */
    regenerateMarkers() {
        if (this.tempo && this.timeSignature && this.duration) {
            this.generateBeatMarkers(this.duration, this.tempo, this.timeSignature);
        }
    }

    /**
     * BEAT MARKER GENERATION
     * Creates visual beat indicators for the timeline
     */
    generateBeatMarkers(duration, tempo, timeSignature) {
        this.beatMarkers = [];
        const totalBeats = this.secondsToBeats(duration, tempo);
        
        for (let beat = 0; beat <= totalBeats; beat += 0.25) {
            const time = this.beatsToSeconds(beat, tempo);
            const isMeasureStart = (beat % timeSignature.numerator) === 0;
            const isBeatStart = (beat % 1) === 0;
            
            this.beatMarkers.push({
                time: time,
                beat: beat,
                isMeasureStart: isMeasureStart,
                isBeatStart: isBeatStart,
                measure: Math.floor(beat / timeSignature.numerator),
                subdivision: beat % 1
            });
        }
        
        console.log(`🎵 BeatMarkerGenerator: Generated ${this.beatMarkers.length} beat markers`);
        
        this.eventBus.emit('timeline:beat_markers_updated', {
            markers: this.beatMarkers
        });
        
        return this.beatMarkers;
    }

    /**
     * GRID QUANTIZATION
     * Provides precise timing alignment to musical beats
     */
    quantizeToGrid(time, tempo, subdivision = null) {
        if (!this.snapToGrid) return time;
        
        const actualSubdivision = subdivision || this.gridSubdivision;
        const beats = this.secondsToBeats(time, tempo);
        const quantizedBeats = Math.round(beats / actualSubdivision) * actualSubdivision;
        return this.beatsToSeconds(quantizedBeats, tempo);
    }

    /**
     * TIME CONVERSION UTILITIES
     * Core timing functions for beat-based calculations
     */
    beatsToSeconds(beats, tempo) {
        return (beats * 60) / tempo;
    }
    
    secondsToBeats(seconds, tempo) {
        return (seconds * tempo) / 60;
    }
    
    measureToSeconds(measure, tempo, timeSignature) {
        const beatsPerMeasure = timeSignature.numerator;
        return this.beatsToSeconds(measure * beatsPerMeasure, tempo);
    }
    
    secondsToMeasure(seconds, tempo, timeSignature) {
        const beatsPerMeasure = timeSignature.numerator;
        return this.secondsToBeats(seconds, tempo) / beatsPerMeasure;
    }

    /**
     * GRID CONFIGURATION
     */
    setSnapToGrid(enabled) {
        this.snapToGrid = enabled;
        console.log(`🎵 BeatMarkerGenerator: Snap to grid ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    setGridSubdivision(subdivision) {
        this.gridSubdivision = subdivision;
        console.log(`🎵 BeatMarkerGenerator: Grid subdivision set to ${subdivision} beats`);
    }

    /**
     * MARKER QUERIES
     */
    getBeatMarkersInRange(startTime, endTime) {
        return this.beatMarkers.filter(marker => 
            marker.time >= startTime && marker.time <= endTime
        );
    }
    
    getMarkerAtTime(time, tolerance = 0.01) {
        return this.beatMarkers.find(marker => 
            Math.abs(marker.time - time) <= tolerance
        );
    }
    
    getNearestMarker(time) {
        if (this.beatMarkers.length === 0) return null;
        
        return this.beatMarkers.reduce((nearest, marker) => {
            const nearestDistance = Math.abs(nearest.time - time);
            const markerDistance = Math.abs(marker.time - time);
            return markerDistance < nearestDistance ? marker : nearest;
        });
    }

    /**
     * VISUAL HELPERS
     */
    getMarkerType(marker) {
        if (marker.isMeasureStart) return 'measure';
        if (marker.isBeatStart) return 'beat';
        return 'subdivision';
    }
    
    getMarkerWeight(marker) {
        if (marker.isMeasureStart) return 3; // Strongest
        if (marker.isBeatStart) return 2;    // Medium
        return 1;                            // Lightest
    }

    /**
     * DATA ACCESS
     */
    getBeatMarkers() {
        return this.beatMarkers;
    }
    
    getGridConfiguration() {
        return {
            snapToGrid: this.snapToGrid,
            gridSubdivision: this.gridSubdivision
        };
    }

    /**
     * CLEANUP
     */
    destroy() {
        this.beatMarkers = [];
        console.log('🎵 BeatMarkerGenerator: Destroyed');
    }
}
