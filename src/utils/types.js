/**
 * Type definitions and constants for Open Sprunk Framework
 * Provides LLM-friendly type information and path constants
 * 
 * @fileoverview Core type definitions and constants to prevent LLM hallucinations
 * @module Types
 */

/**
 * @typedef {Object} SpunkiCharacter
 * @property {string} id - Unique character identifier
 * @property {string} name - Character display name
 * @property {string} color - Hex color code (#rrggbb)
 * @property {number} size - Character size (pixels)
 * @property {string} shape - Character shape type ('humanoid', 'geometric')
 * @property {Object} position - Character position {x: number, y: number}
 * @property {number} rotation - Rotation in degrees
 * @property {number} scale - Scale factor (1.0 = normal)
 */

/**
 * @typedef {Object} EventPayload
 * @property {string} type - Event type identifier
 * @property {*} data - Event-specific data
 * @property {number} timestamp - Event timestamp
 * @property {string} source - Module that emitted the event
 */

/**
 * @typedef {Object} StateSnapshot
 * @property {string} currentProject - Active project ID
 * @property {Object} projectData - Complete project data
 * @property {string} activeView - Current editor view
 * @property {boolean} unsavedChanges - Has unsaved changes
 */

/**
 * @typedef {Object} TestResult
 * @property {string} testName - Name of the test
 * @property {boolean} passed - Whether test passed
 * @property {string} [error] - Error message if test failed
 * @property {number} duration - Test execution time in ms
 */

/**
 * File path constants to prevent LLM hallucinations
 * @readonly
 * @enum {string}
 */
export const FILE_PATHS = {
  // Core modules
  APP_CORE: './core/AppCore.js',
  EVENT_BUS: './core/EventBus.js',
  STATE_MANAGER: './core/StateManager.js',
  
  // Stage modules
  PERFORMANCE_STAGE: './stage/PerformanceStage.js',
  CHARACTER_RENDERER: './stage/CharacterRenderer.js',
  BACKGROUND_MANAGER: './stage/BackgroundManager.js',
  AUTHORING_OVERLAY_MANAGER: './stage/AuthoringOverlayManager.js',
  MOUSE_INTERACTION_HANDLER: './stage/MouseInteractionHandler.js',
  PERFORMANCE_METRICS: './stage/PerformanceMetrics.js',
  PLAYBACK_CONTROLLER: './stage/PlaybackController.js',
  
  // Character modules
  DRAWING_WINDOW: './character/DrawingWindow.js',
  DRAWING_CANVAS: './character/DrawingCanvas.js',
  EXPRESSION_SYSTEM: './character/ExpressionSystem.js',
  EXPRESSION_CONTROLLER: './character/ExpressionController.js',
  ANIMATION_ENGINE: './character/AnimationEngine.js',
  PART_LIBRARY_MANAGER: './character/PartLibraryManager.js',
  STYLE_PALETTE_MANAGER: './character/StylePaletteManager.js',
  
  // Animation modules
  TIMELINE: './animation/Timeline.js',
  ANIMATION_TIMELINE_EDITOR: './animation/AnimationTimelineEditor.js',
  TEMPORAL_COORDINATOR: './animation/TemporalCoordinator.js',
  TIME_CONVERTER: './animation/TimeConverter.js',
  BEAT_MARKER_GENERATOR: './animation/BeatMarkerGenerator.js',
  TIMELINE_PLAYBACK_MANAGER: './animation/TimelinePlaybackManager.js',
  TRACK_MANAGER: './animation/TrackManager.js',
  TIMELINE_UI: './animation/TimelineUI.js',
  
  // Music modules
  AUDIO_ENGINE: './music/AudioEngine.js',
  
  // Utility modules
  CONSOLE_LOGGER: './console-logger.js'
};

/**
 * CSS selector constants to prevent selector hallucinations
 * @readonly
 * @enum {string}
 */
export const SELECTORS = {
  // Main containers
  APP_CONTAINER: '#app',
  STAGE_CONTAINER: '#stage-canvas-container',
  CHARACTER_EDITOR: '#character-editor',
  PERFORMANCE_STAGE: '#performance-stage',
  
  // Navigation
  NAV_BUTTONS: '.nav-btn[data-mode]',
  EDITOR_PANELS: '.editor-panel',
  
  // Stage controls
  STAGE_CONTROLS: '#stage-controls',
  STAGE_PLAY: '#stage-play',
  STAGE_PAUSE: '#stage-pause',
  STAGE_STOP: '#stage-stop',
  ADD_CHARACTER: '#add-character',
  STAGE_TIME: '#stage-time',
  STAGE_FPS: '#stage-fps',
  
  // Character editor
  DRAWING_CANVAS: '#drawing-canvas',
  PART_LIBRARY: '.part-library-panel',
  STYLE_PALETTE: '.style-palette-panel',
  DRAWING_WINDOW: '.drawing-window',
  CANVAS_CONTAINER: '.canvas-container',
  
  // Project controls
  SAVE_PROJECT: '#save-project',
  LOAD_PROJECT: '#load-project',
  EXPORT_PROJECT: '#export-project',
  LAUNCH_CHARACTER_EDITOR: '#launch-character-editor'
};

/**
 * Event name constants to prevent event name hallucinations
 * @readonly
 * @enum {string}
 */
export const EVENTS = {
  // Application lifecycle
  APP_INITIALIZED: 'app:initialized',
  APP_SHUTDOWN: 'app:shutdown',
  
  // Navigation
  VIEW_CHANGE: 'view:change',
  NAV_TAB_CLICKED: 'nav:tab-clicked',
  
  // State management
  STATE_INITIALIZED: 'state:initialized',
  STATE_VIEW_CHANGED: 'state:view-changed',
  
  // Project events
  PROJECT_SAVE: 'project:save',
  PROJECT_SAVED: 'project:saved',
  PROJECT_LOAD: 'project:load',
  PROJECT_LOADED: 'project:loaded',
  PROJECT_EXPORT: 'project:export',
  PROJECT_EXPORTED: 'project:exported',
  
  // Timeline events
  TIMELINE_PLAY: 'timeline:play',
  TIMELINE_PAUSE: 'timeline:pause',
  TIMELINE_STOP: 'timeline:stop',
  
  // Stage events
  STAGE_ACTIVATED: 'stage:activated',
  STAGE_MOUSE_MOVE: 'stage:mouse_move',
  
  // Character events
  CHARACTER_SELECTED: 'character:selected',
  CHARACTER_CREATOR_LAUNCHED: 'character:creator-launched',
  
  // Error events
  ERROR_GENERIC: '*:error'
};

/**
 * Module registration names to prevent naming inconsistencies
 * @readonly
 * @enum {string}
 */
export const MODULES = {
  STAGE: 'stage',
  CHARACTER: 'character',
  MUSIC: 'music',
  ANIMATION: 'animation'
};

/**
 * Validation helpers for common patterns
 */
export class ValidationHelpers {
  /**
   * Validate character data structure
   * @param {Object} character - Character object to validate
   * @returns {boolean} True if valid character
   */
  static isValidCharacter(character) {
    return character &&
           typeof character.id === 'string' &&
           typeof character.name === 'string' &&
           typeof character.color === 'string' &&
           typeof character.size === 'number' &&
           typeof character.shape === 'string';
  }
  
  /**
   * Validate event payload structure
   * @param {Object} payload - Event payload to validate
   * @returns {boolean} True if valid payload
   */
  static isValidEventPayload(payload) {
    return payload &&
           typeof payload.type === 'string' &&
           typeof payload.timestamp === 'number';
  }
  
  /**
   * Validate CSS selector
   * @param {string} selector - CSS selector to validate
   * @returns {boolean} True if selector exists in DOM
   */
  static isValidSelector(selector) {
    try {
      return document.querySelector(selector) !== null;
    } catch (e) {
      return false;
    }
  }
}
