/**
 * Expression system for Sprunki characters
 * Handles hybrid animation: transforms + sprite swaps
 * Uses extracted AnimationEngine and ExpressionController for better modularity
 */
import { AnimationEngine } from './AnimationEngine.js';
import { ExpressionController } from './ExpressionController.js';

class ExpressionSystem {
  constructor(characterData, options = {}) {
    this.characterData = characterData;
    this.options = {
      enableAnimations: true,
      smoothTransitions: true,
      transitionDuration: 0.3,
      ...options
    };
    
    // Initialize extracted components
    this.animationEngine = new AnimationEngine({
      defaultTransitionDuration: this.options.transitionDuration,
      smoothTransitions: this.options.smoothTransitions
    });
    
    this.expressionController = new ExpressionController(characterData, {
      preloadExpressions: true
    });
    
    // Event system for coordination
    this.eventBus = null;
    this.listeners = new Map();
    
    // Current state
    this.isTransitioning = false;
    
    this.init();
  }
  
  /**
   * Initialize expression system
   */
  init() {
    this.setupEventBusListeners();
    this.emitEvent('expressionSystemInitialized', { 
      timestamp: Date.now() 
    });
  }
  
  /**
   * Set character expression with smooth transition
   */
  async setExpression(expressionName, options = {}) {
    if (this.getCurrentExpression() === expressionName && !options.force) {
      return; // Already in this expression
    }
    
    if (this.isTransitioning && !options.interrupt) {
      // Queue the expression change in animation engine
      return this.animationEngine.queueAnimation({
        type: 'expression-change',
        expressionName,
        options
      });
    }
    
    const transitionOptions = {
      duration: options.duration,
      easing: options.easing,
      immediate: options.immediate || false,
      ...options
    };
    
    try {
      this.isTransitioning = true;
      
      // Validate expression exists
      if (!this.expressionController.getExpression(expressionName)) {
        throw new Error(`Expression '${expressionName}' not found`);
      }
      
      // Check if transition is valid
      if (!this.expressionController.canTransitionTo(expressionName)) {
        console.warn(`Invalid transition to '${expressionName}' from current state`);
      }
      
      const previousExpression = this.getCurrentExpression();
      
      // Execute transition
      await this.executeExpressionTransition(expressionName, transitionOptions);
      
      // Update expression controller state
      this.expressionController.setExpression(expressionName, transitionOptions);
      
      this.emitEvent('expressionChanged', { 
        expressionName, 
        previousExpression,
        timestamp: Date.now() 
      });
      
    } catch (error) {
      console.error('Expression transition failed:', error);
      this.emitEvent('expressionError', { expressionName, error });
    } finally {
      this.isTransitioning = false;
      this.animationEngine.processAnimationQueue();
    }
  }
  
  /**
   * Execute expression transition using animation engine
   */
  async executeExpressionTransition(expressionName, options) {
    const targetState = this.expressionController.getExpression(expressionName);
    
    if (options.immediate) {
      // Apply changes immediately without animation
      this.applyExpressionStateImmediate(targetState);
      return;
    }
    
    // Create transition animations using animation engine
    const animations = this.animationEngine.createTransitionAnimations(targetState, options);
    await this.animationEngine.executeAnimations(animations);
  }
  
  /**
   * Apply expression state immediately without animation
   */
  applyExpressionStateImmediate(targetState) {
    // Emit events for immediate state changes
    this.emitEvent('expressionStateChanged', {
      targetState,
      immediate: true,
      timestamp: Date.now()
    });
  }
  
  /**
   * Get current expression name
   */
  getCurrentExpression() {
    return this.expressionController.currentExpression;
  }
  
  /**
   * Get current expression state with details
   */
  getCurrentExpressionState() {
    return {
      name: this.getCurrentExpression(),
      isTransitioning: this.isTransitioning,
      queuedAnimations: this.animationEngine.getQueueLength(),
      activeAnimations: this.animationEngine.getActiveAnimationsCount(),
      expressionHistory: this.expressionController.getExpressionHistory()
    };
  }
  
  /**
   * Add custom expression to character
   */
  addCustomExpression(name, config) {
    this.expressionController.validateExpression(config);
    this.expressionController.addExpression(name, config);
    
    this.emitEvent('customExpressionAdded', { name, config });
  }
  
  /**
   * Remove custom expression
   */
  removeCustomExpression(name) {
    this.expressionController.removeExpression(name);
    
    // If currently active, switch to idle
    if (this.getCurrentExpression() === name) {
      this.setExpression('idle');
    }
    
    this.emitEvent('customExpressionRemoved', { name });
  }
  
  /**
   * Get list of available expressions
   */
  getAvailableExpressions() {
    return this.expressionController.getAvailableExpressions();
  }
  
  /**
   * Stop all animations and clear queue
   */
  stopAllAnimations() {
    this.animationEngine.clearAllAnimations();
    this.isTransitioning = false;
    
    this.emitEvent('animationsStopped', { timestamp: Date.now() });
  }
  
  /**
   * Set event bus for cross-system communication
   */
  setEventBus(eventBus) {
    this.eventBus = eventBus;
    this.setupEventBusListeners();
    
    // Pass event bus to child components
    if (this.animationEngine.setEventBus) {
      this.animationEngine.setEventBus(eventBus);
    }
    if (this.expressionController.setEventBus) {
      this.expressionController.setEventBus(eventBus);
    }
  }
  
  /**
   * Setup event bus listeners
   */
  setupEventBusListeners() {
    if (!this.eventBus) return;
    
    // Listen for timeline events
    this.eventBus.on('timeline-play', () => {
      // Handle timeline playback
      this.emitEvent('timelinePlaybackStarted', { timestamp: Date.now() });
    });
    
    this.eventBus.on('timeline-stop', () => {
      this.stopAllAnimations();
    });
    
    // Listen for character data updates
    this.eventBus.on('character-data-updated', (data) => {
      this.updateCharacterData(data);
    });
  }
  
  /**
   * Update character data and refresh components
   */
  updateCharacterData(newData) {
    this.characterData = newData;
    
    // Update expression controller with new data
    this.expressionController.updateCharacterData(newData);
    
    this.emitEvent('characterDataUpdated', { 
      timestamp: Date.now(),
      expressionCount: this.getAvailableExpressions().length
    });
  }
  
  /**
   * Emit event through event bus and local listeners
   */
  emitEvent(eventType, data) {
    // Emit through event bus if available
    if (this.eventBus) {
      this.eventBus.emit(eventType, data);
    }
    
    // Emit to local listeners
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in expression system listener for ${eventType}:`, error);
        }
      });
    }
  }
  
  /**
   * Add local event listener
   */
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }
  
  /**
   * Remove local event listener
   */
  off(eventType, callback) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  /**
   * Get performance metrics from all components
   */
  getPerformanceMetrics() {
    return {
      expressionSystem: {
        currentExpression: this.getCurrentExpression(),
        isTransitioning: this.isTransitioning,
        availableExpressions: this.getAvailableExpressions().length
      },
      animationEngine: this.animationEngine.getPerformanceMetrics?.() || {},
      expressionController: this.expressionController.getPerformanceMetrics?.() || {}
    };
  }
  
  /**
   * Export expression data for saving
   */
  exportExpressionData() {
    return {
      expressions: this.expressionController.exportExpressionData(),
      currentExpression: this.getCurrentExpression(),
      animationSettings: this.animationEngine.exportSettings?.() || {},
      version: '2.0',
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Import expression data
   */
  importExpressionData(data) {
    if (data.expressions) {
      this.expressionController.importExpressionData(data.expressions);
    }
    
    if (data.animationSettings && this.animationEngine.importSettings) {
      this.animationEngine.importSettings(data.animationSettings);
    }
    
    this.emitEvent('expressionDataImported', { 
      version: data.version,
      timestamp: Date.now() 
    });
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    this.stopAllAnimations();
    this.listeners.clear();
    
    if (this.animationEngine.destroy) {
      this.animationEngine.destroy();
    }
    
    if (this.expressionController.destroy) {
      this.expressionController.destroy();
    }
    
    this.emitEvent('expressionSystemDestroyed', { timestamp: Date.now() });
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExpressionSystem;
}

export { ExpressionSystem };
