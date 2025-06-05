/**
 * Animation Timeline Editor - Integrated Timeline for Stage Authoring
 * 
 * Integrates the Timeline and TimelineUI components with the PerformanceStage
 * authoring overlay system to provide seamless musical sequencing within
 * the unified stage environment.
 */

import { Timeline } from './Timeline.js';
import { TimelineUI } from './TimelineUI.js';
import { AudioEngine } from '../music/AudioEngine.js';

export class AnimationTimelineEditor {
    constructor(performanceStage, eventBus, stateManager) {
        this.performanceStage = performanceStage;
        this.eventBus = eventBus;
        this.stateManager = stateManager;
        
        // Timeline system components
        this.audioEngine = null;
        this.timeline = null;
        this.timelineUI = null;
        
        // Stage integration state
        this.isEditMode = false;
        this.editOverlay = null;
        this.timelineContainer = null;
        
        console.log('🎬 AnimationTimelineEditor: Initialized for stage integration');
    }

    async initialize() {
        console.log('🎬 AnimationTimelineEditor: Setting up timeline system...');
        
        // Initialize audio engine
        this.audioEngine = new AudioEngine(this.eventBus);
        await this.audioEngine.initialize();
        
        // Initialize timeline with audio engine
        this.timeline = new Timeline(this.eventBus, this.audioEngine);
        
        // Create stage integration UI
        this._createStageIntegration();
        
        // Set up event handlers
        this._setupEventHandlers();
        
        console.log('🎬 AnimationTimelineEditor: Initialized with stage integration');
    }

    _createStageIntegration() {
        // Create timeline edit overlay that integrates with the stage
        this.editOverlay = document.createElement('div');
        this.editOverlay.id = 'timeline-edit-overlay';
        this.editOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 15;
            display: none;
        `;
        
        // Create timeline container within the overlay
        this.timelineContainer = document.createElement('div');
        this.timelineContainer.id = 'timeline-container';
        this.timelineContainer.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            height: 300px;
            background: rgba(42, 42, 42, 0.95);
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            pointer-events: auto;
            backdrop-filter: blur(10px);
        `;
        
        this.editOverlay.appendChild(this.timelineContainer);
        
        // Register with PerformanceStage authoring overlay system
        this.performanceStage.registerAuthoringOverlay('animation', this.editOverlay);
        this.performanceStage.registerAuthoringOverlay('music', this.editOverlay);
        
        console.log('🎬 AnimationTimelineEditor: Timeline overlay registered with PerformanceStage');
    }

    _setupEventHandlers() {
        // Timeline control events (from stage controls)
        this.eventBus.on('timeline:play', () => this.timeline.play());
        this.eventBus.on('timeline:pause', () => this.timeline.pause());
        this.eventBus.on('timeline:stop', () => this.timeline.stop());
        
        // Stage authoring mode events
        this.eventBus.on('stage:authoring_mode_changed', (data) => {
            this.onAuthoringModeChanged(data.currentMode);
        });
        
        // Stage edit mode events
        this.eventBus.on('stage:edit_mode_entered', () => this.enterEditMode());
        this.eventBus.on('stage:edit_mode_exited', () => this.exitEditMode());
        
        // Timeline-to-stage synchronization
        this.eventBus.on('timeline:time_update', (data) => {
            // Update stage rendering to current timeline time
            if (this.performanceStage && this.performanceStage.render) {
                this.performanceStage.render(data.currentTime);
            }
        });
        
        // Animation keyframe events (sync with stage)
        this.eventBus.on('timeline:keyframe_added', (data) => {
            if (data.type === 'animation') {
                // Trigger stage to update character positions/animations
                this.eventBus.emit('stage:animation_keyframe_added', data);
            }
        });
    }

    onAuthoringModeChanged(mode) {
        if (mode === 'animation' || mode === 'music') {
            this.prepareTimelineForMode(mode);
        }
    }

    prepareTimelineForMode(mode) {
        console.log(`🎬 AnimationTimelineEditor: Preparing timeline for ${mode} mode`);
        
        // If timeline UI hasn't been created yet, create it now
        if (!this.timelineUI && this.timelineContainer) {
            this.timelineUI = new TimelineUI(this.timelineContainer, this.timeline, this.eventBus);
            this.timelineUI.createUI();
        }
        
        // Configure timeline for specific mode
        if (mode === 'animation') {
            // Focus on animation tracks and keyframe editing
            this.timeline.setDefaultTrackType('animation');
        } else if (mode === 'music') {
            // Focus on music tracks and note editing
            this.timeline.setDefaultTrackType('music');
        }
    }

    enterEditMode() {
        console.log('🎬 AnimationTimelineEditor: Entering edit mode');
        this.isEditMode = true;
        
        // Timeline overlay is shown/hidden by PerformanceStage based on authoring mode
        // We just need to ensure timeline is ready for interaction
        if (this.timelineUI) {
            this.timelineUI.setInteractive(true);
        }
        
        this.eventBus.emit('animation_timeline:edit_mode_entered');
    }

    exitEditMode() {
        console.log('🎬 AnimationTimelineEditor: Exiting edit mode');
        this.isEditMode = false;
        
        // Disable timeline interaction when not in edit mode
        if (this.timelineUI) {
            this.timelineUI.setInteractive(false);
        }
        
        this.eventBus.emit('animation_timeline:edit_mode_exited');
    }

    // PUBLIC API METHODS (for editor interface compatibility)
    
    onActivate() {
        console.log('🎬 AnimationTimelineEditor: Activated');
        
        // Check if should enter edit mode immediately
        const authoringMode = this.stateManager.get('ui.authoringMode');
        if (authoringMode === 'animation' || authoringMode === 'music') {
            this.prepareTimelineForMode(authoringMode);
        }
        
        this.eventBus.emit('animation_timeline:activated');
    }

    // PIANO ROLL IMPLEMENTATION (for music mode)
    
    createPianoRoll() {
        // This will be implemented as an enhancement to TimelineUI
        // For now, music notes are added via Shift+Click in the timeline
        console.log('🎹 Piano Roll: Enhanced music editing coming in next iteration');
        return this.timelineUI; // Return timeline UI which supports music note editing
    }

    // INTEGRATION WITH STAGE CONTROLS
    
    // These methods allow the stage controls to interact with the timeline
    startTimelineEditing() {
        console.log('🎬 AnimationTimelineEditor: Starting timeline editing mode');
        
        // Set authoring mode to animation
        this.performanceStage.setAuthoringMode('animation');
        
        // Enter edit mode to show overlays
        this.performanceStage.enterEditMode();
        
        // Prepare timeline for animation mode
        this.prepareTimelineForMode('animation');
        
        // Activate the editor
        this.onActivate();
        
        this.eventBus.emit('animation_timeline:editing_started');
    }
    
    stopTimelineEditing() {
        console.log('🎬 AnimationTimelineEditor: Stopping timeline editing mode');
        
        // Exit edit mode to hide overlays
        this.performanceStage.exitEditMode();
        
        // Return to performance mode
        this.performanceStage.setAuthoringMode('performance');
        
        this.eventBus.emit('animation_timeline:editing_stopped');
    }
    
    // These methods allow the stage controls to interact with the timeline
    play() {
        return this.timeline.play();
    }
    
    pause() {
        return this.timeline.pause();
    }
    
    stop() {
        return this.timeline.stop();
    }
    
    getCurrentTime() {
        return this.timeline.currentTime;
    }
    
    setTempo(tempo) {
        return this.timeline.setTempo(tempo);
    }

    // CLEANUP
    
    dispose() {
        console.log('🎬 AnimationTimelineEditor: Disposing...');
        
        // Clean up timeline UI
        if (this.timelineUI) {
            this.timelineUI.destroy();
        }
        
        // Clean up audio engine
        if (this.audioEngine) {
            this.audioEngine.destroy();
        }
        
        // Remove overlay from stage
        if (this.editOverlay && this.editOverlay.parentElement) {
            this.editOverlay.parentElement.removeChild(this.editOverlay);
        }
        
        // Remove event listeners
        this.eventBus.off('timeline:play');
        this.eventBus.off('timeline:pause');
        this.eventBus.off('timeline:stop');
        this.eventBus.off('stage:authoring_mode_changed');
        this.eventBus.off('stage:edit_mode_entered');
        this.eventBus.off('stage:edit_mode_exited');
        this.eventBus.off('timeline:time_update');
        this.eventBus.off('timeline:keyframe_added');
        
        console.log('🎬 AnimationTimelineEditor: Disposed');
    }
}
