/**
 * Timeline Controls Manager
 * 
 * Manages the timeline control panel including playback controls,
 * tempo settings, and timeline options.
 */

export class TimelineControlsManager {
    constructor(timeline, eventBus, colors) {
        this.timeline = timeline;
        this.eventBus = eventBus;
        this.colors = colors;
        
        // UI elements
        this.controlsContainer = null;
        this.timeDisplay = null;
        this.tempoInput = null;
        this.snapCheckbox = null;
        
        console.log('🎛️ TimelineControlsManager: Initialized');
    }

    /**
     * Create the controls panel
     */
    createControls() {
        this.controlsContainer = document.createElement('div');
        this.controlsContainer.style.cssText = `
            height: 50px;
            background: #1e1e1e;
            border-bottom: 1px solid ${this.colors.trackBorder};
            padding: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        // Create control groups
        this.createPlaybackControls();
        this.createTimeDisplay();
        this.createTempoControl();
        this.createSnapControl();
        
        return this.controlsContainer;
    }

    /**
     * Create playback control buttons
     */
    createPlaybackControls() {
        const playBtn = this.createButton('▶️', 'Play', () => {
            this.timeline.play();
            this.eventBus.emit('timeline-ui:playback_started');
        });
        
        const pauseBtn = this.createButton('⏸️', 'Pause', () => {
            this.timeline.pause();
            this.eventBus.emit('timeline-ui:playback_paused');
        });
        
        const stopBtn = this.createButton('⏹️', 'Stop', () => {
            this.timeline.stop();
            this.eventBus.emit('timeline-ui:playback_stopped');
        });
        
        this.controlsContainer.appendChild(playBtn);
        this.controlsContainer.appendChild(pauseBtn);
        this.controlsContainer.appendChild(stopBtn);
    }

    /**
     * Create time display
     */
    createTimeDisplay() {
        this.timeDisplay = document.createElement('span');
        this.timeDisplay.id = 'timeline-time-display';
        this.timeDisplay.style.cssText = `
            color: ${this.colors.text};
            font-family: monospace;
            font-size: 14px;
            margin-left: 20px;
            min-width: 80px;
        `;
        this.timeDisplay.textContent = '00:00.00';
        
        this.controlsContainer.appendChild(this.timeDisplay);
    }

    /**
     * Create tempo control
     */
    createTempoControl() {
        const tempoLabel = document.createElement('label');
        tempoLabel.style.cssText = `
            color: ${this.colors.text};
            font-size: 12px;
            margin-left: 20px;
        `;
        tempoLabel.textContent = 'BPM:';
        
        this.tempoInput = document.createElement('input');
        this.tempoInput.type = 'number';
        this.tempoInput.value = this.timeline.tempo;
        this.tempoInput.min = 60;
        this.tempoInput.max = 200;
        this.tempoInput.style.cssText = `
            width: 60px;
            margin-left: 5px;
            padding: 2px 4px;
            border: 1px solid ${this.colors.trackBorder};
            background: ${this.colors.track};
            color: ${this.colors.text};
            border-radius: 2px;
        `;
        
        this.tempoInput.addEventListener('change', (e) => {
            const newTempo = parseInt(e.target.value);
            this.timeline.setTempo(newTempo);
            this.eventBus.emit('timeline-ui:tempo_changed', { tempo: newTempo });
        });
        
        this.controlsContainer.appendChild(tempoLabel);
        this.controlsContainer.appendChild(this.tempoInput);
    }

    /**
     * Create snap to grid control
     */
    createSnapControl() {
        const snapLabel = document.createElement('label');
        snapLabel.style.cssText = `
            color: ${this.colors.text};
            font-size: 12px;
            margin-left: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 5px;
        `;
        
        this.snapCheckbox = document.createElement('input');
        this.snapCheckbox.type = 'checkbox';
        this.snapCheckbox.checked = this.timeline.snapToGrid;
        this.snapCheckbox.addEventListener('change', (e) => {
            this.timeline.setSnapToGrid(e.target.checked);
            this.eventBus.emit('timeline-ui:snap_changed', { enabled: e.target.checked });
        });
        
        const snapText = document.createElement('span');
        snapText.textContent = 'Snap to Grid';
        
        snapLabel.appendChild(this.snapCheckbox);
        snapLabel.appendChild(snapText);
        
        this.controlsContainer.appendChild(snapLabel);
    }

    /**
     * Create a styled button
     */
    createButton(text, title, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.title = title;
        button.style.cssText = `
            padding: 6px 12px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: background-color 0.2s;
        `;
        
        button.addEventListener('click', onClick);
        
        button.addEventListener('mouseenter', () => {
            button.style.background = '#5CBF60';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.background = '#4CAF50';
        });
        
        return button;
    }

    /**
     * Update time display
     */
    updateTimeDisplay(currentTime) {
        if (this.timeDisplay) {
            this.timeDisplay.textContent = this.formatTime(currentTime);
        }
    }

    /**
     * Update tempo display
     */
    updateTempo(tempo) {
        if (this.tempoInput) {
            this.tempoInput.value = tempo;
        }
    }

    /**
     * Update snap to grid setting
     */
    updateSnapToGrid(enabled) {
        if (this.snapCheckbox) {
            this.snapCheckbox.checked = enabled;
        }
    }

    /**
     * Format time for display
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toFixed(2).padStart(5, '0')}`;
    }

    /**
     * Enable or disable all controls
     */
    setEnabled(enabled) {
        if (this.controlsContainer) {
            this.controlsContainer.style.pointerEvents = enabled ? 'auto' : 'none';
            this.controlsContainer.style.opacity = enabled ? '1' : '0.5';
        }
    }

    /**
     * Get the controls container element
     */
    getElement() {
        return this.controlsContainer;
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.controlsContainer && this.controlsContainer.parentNode) {
            this.controlsContainer.parentNode.removeChild(this.controlsContainer);
        }
        
        this.controlsContainer = null;
        this.timeDisplay = null;
        this.tempoInput = null;
        this.snapCheckbox = null;
        
        console.log('🎛️ TimelineControlsManager: Destroyed');
    }
}
