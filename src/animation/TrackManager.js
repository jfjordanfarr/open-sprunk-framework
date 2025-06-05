/**
 * TrackManager Class
 * 
 * Manages timeline tracks for both animation and music content.
 * Handles track creation, data management, and temporal operations
 * like copy/paste across music and animation domains.
 */

export class TrackManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        
        // Track storage
        this.animationTracks = new Map(); // Animation keyframe tracks
        this.musicTracks = new Map(); // Music note tracks
        
        // Default configuration
        this.defaultTrackType = 'animation';
        this.snapToGrid = true;
        this.gridSubdivision = 0.25; // 16th notes by default
        
        console.log('🎼 TrackManager: Initialized for unified track management');
    }

    /**
     * TRACK CREATION AND MANAGEMENT
     */
    createTrack(trackId, type) {
        if (type === 'animation') {
            if (!this.animationTracks.has(trackId)) {
                this.animationTracks.set(trackId, []);
                console.log(`🎼 TrackManager: Created animation track ${trackId}`);
            }
        } else if (type === 'music') {
            if (!this.musicTracks.has(trackId)) {
                this.musicTracks.set(trackId, []);
                console.log(`🎼 TrackManager: Created music track ${trackId}`);
            }
        } else {
            console.warn(`🎼 TrackManager: Invalid track type ${type}. Must be 'animation' or 'music'`);
            return;
        }
        
        this.eventBus.emit('timeline:track_created', {
            trackId, type
        });
    }
    
    removeTrack(trackId, type) {
        let removed = false;
        
        if (type === 'animation') {
            removed = this.animationTracks.delete(trackId);
        } else if (type === 'music') {
            removed = this.musicTracks.delete(trackId);
        }
        
        if (removed) {
            console.log(`🎼 TrackManager: Removed ${type} track ${trackId}`);
            
            this.eventBus.emit('timeline:track_removed', {
                trackId, type
            });
        }
    }

    /**
     * ANIMATION KEYFRAME MANAGEMENT
     */
    addAnimationKeyframe(trackId, time, properties, snapToGrid = false, beatMarkerGenerator = null) {
        if (!this.animationTracks.has(trackId)) {
            this.animationTracks.set(trackId, []);
        }
        
        let finalTime = time;
        if (snapToGrid && beatMarkerGenerator) {
            finalTime = beatMarkerGenerator.quantizeToGrid(time);
        }
        
        const keyframe = {
            time: finalTime,
            properties: properties,
            id: `anim_${Date.now()}_${Math.random()}`
        };
        
        const track = this.animationTracks.get(trackId);
        track.push(keyframe);
        this.sortTrackByTime(track);
        
        console.log(`🎼 TrackManager: Added animation keyframe at ${keyframe.time}s for track ${trackId}`);
        
        this.eventBus.emit('timeline:keyframe_added', {
            trackId, keyframe, type: 'animation'
        });
        
        return keyframe;
    }
    
    removeAnimationKeyframe(trackId, keyframeId) {
        const track = this.animationTracks.get(trackId);
        if (!track) return false;
        
        const index = track.findIndex(kf => kf.id === keyframeId);
        if (index !== -1) {
            const removed = track.splice(index, 1)[0];
            
            console.log(`🎼 TrackManager: Removed animation keyframe ${keyframeId} from track ${trackId}`);
            
            this.eventBus.emit('timeline:keyframe_removed', {
                trackId, keyframe: removed, type: 'animation'
            });
            
            return true;
        }
        
        return false;
    }

    /**
     * MUSIC NOTE MANAGEMENT
     */
    addMusicNote(trackId, time, note, snapToGrid = false, beatMarkerGenerator = null) {
        if (!this.musicTracks.has(trackId)) {
            this.musicTracks.set(trackId, []);
        }
        
        let finalTime = time;
        if (snapToGrid && beatMarkerGenerator) {
            finalTime = beatMarkerGenerator.quantizeToGrid(time);
        }
        
        const musicEvent = {
            time: finalTime,
            note: note,
            id: `music_${Date.now()}_${Math.random()}`
        };
        
        const track = this.musicTracks.get(trackId);
        track.push(musicEvent);
        this.sortTrackByTime(track);
        
        console.log(`🎼 TrackManager: Added music note at ${musicEvent.time}s for track ${trackId}`);
        
        this.eventBus.emit('timeline:note_added', {
            trackId, musicEvent, type: 'music'
        });
        
        return musicEvent;
    }
    
    removeMusicNote(trackId, eventId) {
        const track = this.musicTracks.get(trackId);
        if (!track) return false;
        
        const index = track.findIndex(evt => evt.id === eventId);
        if (index !== -1) {
            const removed = track.splice(index, 1)[0];
            
            console.log(`🎼 TrackManager: Removed music note ${eventId} from track ${trackId}`);
            
            this.eventBus.emit('timeline:note_removed', {
                trackId, musicEvent: removed, type: 'music'
            });
            
            return true;
        }
        
        return false;
    }

    /**
     * CROSS-DOMAIN COPY/PASTE OPERATIONS
     */
    copyTimeRange(startTime, endTime) {
        const selection = {
            startTime,
            endTime,
            animationData: new Map(),
            musicData: new Map()
        };
        
        // Copy animation keyframes in range
        this.animationTracks.forEach((track, trackId) => {
            const keyframesInRange = track.filter(kf => 
                kf.time >= startTime && kf.time <= endTime
            );
            if (keyframesInRange.length > 0) {
                selection.animationData.set(trackId, keyframesInRange);
            }
        });
        
        // Copy music events in range
        this.musicTracks.forEach((track, trackId) => {
            const eventsInRange = track.filter(evt => 
                evt.time >= startTime && evt.time <= endTime
            );
            if (eventsInRange.length > 0) {
                selection.musicData.set(trackId, eventsInRange);
            }
        });
        
        console.log(`🎼 TrackManager: Copied time range ${startTime}-${endTime}s`);
        
        this.eventBus.emit('timeline:selection_copied', selection);
        
        return selection;
    }
    
    pasteTimeRange(targetTime, selection) {
        const timeOffset = targetTime - selection.startTime;
        
        // Paste animation keyframes
        selection.animationData.forEach((keyframes, trackId) => {
            keyframes.forEach(kf => {
                const newKeyframe = {
                    ...kf,
                    time: kf.time + timeOffset,
                    id: `anim_${Date.now()}_${Math.random()}`
                };
                this.addAnimationKeyframe(trackId, newKeyframe.time, newKeyframe.properties);
            });
        });
        
        // Paste music events
        selection.musicData.forEach((events, trackId) => {
            events.forEach(evt => {
                const newEvent = {
                    ...evt,
                    time: evt.time + timeOffset,
                    id: `music_${Date.now()}_${Math.random()}`
                };
                this.addMusicNote(trackId, newEvent.time, newEvent.note);
            });
        });
        
        console.log(`🎼 TrackManager: Pasted selection at ${targetTime}s`);
        
        this.eventBus.emit('timeline:selection_pasted', {
            targetTime, selection, timeOffset
        });
    }

    /**
     * TRACK QUERIES AND UTILITIES
     */
    getTrackData(trackId, type) {
        if (type === 'animation') {
            return this.animationTracks.get(trackId) || [];
        } else if (type === 'music') {
            return this.musicTracks.get(trackId) || [];
        }
        return [];
    }
    
    getAllTracks() {
        return {
            animation: Array.from(this.animationTracks.entries()),
            music: Array.from(this.musicTracks.entries())
        };
    }
    
    getMaxTime() {
        let maxTime = 0;
        
        // Check animation tracks
        this.animationTracks.forEach(track => {
            track.forEach(keyframe => {
                maxTime = Math.max(maxTime, keyframe.time);
            });
        });
        
        // Check music tracks
        this.musicTracks.forEach(track => {
            track.forEach(event => {
                maxTime = Math.max(maxTime, event.time);
            });
        });
        
        return maxTime;
    }

    /**
     * CONFIGURATION
     */
    setDefaultTrackType(type) {
        if (type === 'animation' || type === 'music') {
            this.defaultTrackType = type;
            console.log(`🎼 TrackManager: Default track type set to ${type}`);
            
            this.eventBus.emit('timeline:default_track_type_changed', {
                defaultTrackType: this.defaultTrackType
            });
        } else {
            console.warn(`🎼 TrackManager: Invalid track type ${type}. Must be 'animation' or 'music'`);
        }
    }

    /**
     * CONFIGURATION METHODS
     * Methods for updating track behavior settings
     */
    setSnapToGrid(snapToGrid) {
        this.snapToGrid = snapToGrid;
        console.log(`🎼 TrackManager: Snap to grid set to ${snapToGrid}`);
    }
    
    setGridSubdivision(gridSubdivision) {
        this.gridSubdivision = gridSubdivision;
        console.log(`🎼 TrackManager: Grid subdivision set to ${gridSubdivision}`);
    }

    /**
     * UTILITIES
     */
    sortTrackByTime(track) {
        track.sort((a, b) => a.time - b.time);
    }
    
    clearAllTracks() {
        this.animationTracks.clear();
        this.musicTracks.clear();
        
        console.log('🎼 TrackManager: Cleared all tracks');
        
        this.eventBus.emit('timeline:all_tracks_cleared');
    }

    /**
     * CLEANUP
     */
    destroy() {
        this.clearAllTracks();
        console.log('🎼 TrackManager: Destroyed');
    }
}
