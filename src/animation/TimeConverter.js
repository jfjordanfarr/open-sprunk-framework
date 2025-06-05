
/**
 * Time Converter
 * 
 * Provides temporal unit conversion utilities for the unified timeline system.
 * Converts between seconds, beats, measures, and provides quantization support.
 * 
 * @class TimeConverter
 * @description Handles all time unit conversions required by the unified timeline
 *              for synchronization between musical time (beats/measures) and
 *              linear time (seconds) used by animation systems.
 */

export class TimeConverter {
    constructor(tempo = 120, timeSignature = { numerator: 4, denominator: 4 }) {
        this.tempo = tempo; // BPM (beats per minute)
        this.timeSignature = timeSignature;
        
        console.log('⏱️ TimeConverter: Initialized with tempo', tempo, 'BPM and time signature', timeSignature);
    }

    /**
     * CORE TIME CONVERSION METHODS
     * Implements unified temporal reference system
     */
    
    // Convert beats to seconds
    beatsToSeconds(beats) {
        return (beats * 60) / this.tempo;
    }
    
    // Convert seconds to beats
    secondsToBeats(seconds) {
        return (seconds * this.tempo) / 60;
    }
    
    // Convert measure to seconds
    measureToSeconds(measure) {
        const beatsPerMeasure = this.timeSignature.numerator;
        return this.beatsToSeconds(measure * beatsPerMeasure);
    }
    
    // Convert seconds to measure
    secondsToMeasure(seconds) {
        const beatsPerMeasure = this.timeSignature.numerator;
        return this.secondsToBeats(seconds) / beatsPerMeasure;
    }

    /**
     * QUANTIZATION AND GRID ALIGNMENT
     */
    
    // Quantize time to beat grid for alignment
    quantizeToGrid(time, subdivision = 0.25) {
        const beats = this.secondsToBeats(time);
        const quantizedBeats = Math.round(beats / subdivision) * subdivision;
        return this.beatsToSeconds(quantizedBeats);
    }
    
    // Get nearest beat boundary
    getNearestBeat(time) {
        const beats = this.secondsToBeats(time);
        const nearestBeat = Math.round(beats);
        return this.beatsToSeconds(nearestBeat);
    }
    
    // Get nearest measure boundary
    getNearestMeasure(time) {
        const measures = this.secondsToMeasure(time);
        const nearestMeasure = Math.round(measures);
        return this.measureToSeconds(nearestMeasure);
    }
    
    // Get grid subdivision options
    getGridSubdivisions() {
        return [
            { name: 'Whole', value: this.timeSignature.numerator, display: '1' },
            { name: 'Half', value: this.timeSignature.numerator / 2, display: '1/2' },
            { name: 'Quarter', value: 1, display: '1/4' },
            { name: 'Eighth', value: 0.5, display: '1/8' },
            { name: 'Sixteenth', value: 0.25, display: '1/16' },
            { name: 'Thirty-second', value: 0.125, display: '1/32' }
        ];
    }

    /**
     * TEMPO AND TIME SIGNATURE MANAGEMENT
     */
    
    // Update tempo and return ratio for existing content adjustment
    setTempo(newTempo) {
        const oldTempo = this.tempo;
        this.tempo = newTempo;
        const ratio = oldTempo / newTempo;
        
        console.log(`⏱️ TimeConverter: Tempo changed from ${oldTempo} to ${newTempo} BPM (ratio: ${ratio})`);
        
        return {
            oldTempo,
            newTempo,
            ratio
        };
    }
    
    // Update time signature
    setTimeSignature(numerator, denominator) {
        const oldSignature = { ...this.timeSignature };
        this.timeSignature = { numerator, denominator };
        
        console.log(`⏱️ TimeConverter: Time signature changed from ${oldSignature.numerator}/${oldSignature.denominator} to ${numerator}/${denominator}`);
        
        return {
            oldSignature,
            newSignature: this.timeSignature
        };
    }

    /**
     * TIME FORMATTING AND DISPLAY
     */
    
    // Format time as MM:SS.mmm
    formatTimeDisplay(seconds) {
        const totalMs = Math.floor(seconds * 1000);
        const minutes = Math.floor(totalMs / 60000);
        const secs = Math.floor((totalMs % 60000) / 1000);
        const ms = totalMs % 1000;
        
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }
    
    // Format time as beats (measure.beat.subdivision)
    formatBeatsDisplay(seconds) {
        const totalBeats = this.secondsToBeats(seconds);
        const measure = Math.floor(totalBeats / this.timeSignature.numerator) + 1; // 1-based
        const beat = Math.floor(totalBeats % this.timeSignature.numerator) + 1; // 1-based
        const subdivision = ((totalBeats % 1) * 1000).toFixed(0); // Subdivision as milliseconds
        
        return `${measure}.${beat}.${subdivision.padStart(3, '0')}`;
    }

    /**
     * VALIDATION AND UTILITIES
     */
    
    // Validate time value
    isValidTime(time) {
        return typeof time === 'number' && !isNaN(time) && isFinite(time) && time >= 0;
    }
    
    // Get time signature properties
    getTimeSignatureInfo() {
        return {
            numerator: this.timeSignature.numerator,
            denominator: this.timeSignature.denominator,
            beatsPerMeasure: this.timeSignature.numerator,
            noteValue: this.timeSignature.denominator,
            measureDuration: this.measureToSeconds(1)
        };
    }
    
    // Get tempo properties
    getTempoInfo() {
        return {
            bpm: this.tempo,
            beatDuration: this.beatsToSeconds(1),
            beatsPerSecond: this.tempo / 60,
            millisecondsPerBeat: (60 / this.tempo) * 1000
        };
    }
    
    // Calculate timing boundaries for a given duration
    getTimingBoundaries(duration) {
        const totalBeats = this.secondsToBeats(duration);
        const totalMeasures = this.secondsToMeasure(duration);
        
        return {
            duration,
            totalBeats,
            totalMeasures,
            lastBeat: this.beatsToSeconds(Math.floor(totalBeats)),
            lastMeasure: this.measureToSeconds(Math.floor(totalMeasures))
        };
    }
}
