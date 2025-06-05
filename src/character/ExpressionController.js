/**
 * Expression Controller for Sprunki Character Expressions
 * Handles expression state management and validation
 */
export class ExpressionController {
  constructor(characterData, options = {}) {
    this.characterData = characterData;
    this.options = {
      preloadExpressions: true,
      ...options
    };
    
    // Current state
    this.currentExpression = 'idle';
    this.expressionCache = new Map();
    
    this.init();
  }

  /**
   * Initialize expression controller
   */
  init() {
    this.validateExpressionData();
    this.setupDefaultExpressions();
    if (this.options.preloadExpressions) {
      this.preloadExpressionStates();
    }
  }

  /**
   * Validate character expression data structure
   */
  validateExpressionData() {
    const { expressions } = this.characterData;
    
    if (!expressions) {
      throw new Error('Character data missing expressions object');
    }

    // Validate each expression
    for (const [name, config] of Object.entries(expressions)) {
      this.validateExpressionConfig(name, config);
    }

    console.log(`Expression data validated: ${Object.keys(expressions).length} expressions`);
  }

  /**
   * Validate individual expression configuration
   */
  validateExpressionConfig(name, config) {
    if (!config) {
      throw new Error(`Expression '${name}' is null or undefined`);
    }

    if (typeof config !== 'object') {
      throw new Error(`Expression '${name}' must be an object, got ${typeof config}`);
    }

    // Check required fields
    const requiredFields = ['elements'];
    for (const field of requiredFields) {
      if (!(field in config)) {
        console.warn(`Expression '${name}' missing recommended field: ${field}`);
      }
    }

    // Validate elements if present
    if (config.elements) {
      if (typeof config.elements !== 'object') {
        throw new Error(`Expression '${name}' elements must be an object`);
      }

      for (const [elementName, elementConfig] of Object.entries(config.elements)) {
        this.validateElementConfig(name, elementName, elementConfig);
      }
    }
  }

  /**
   * Validate element configuration within expression
   */
  validateElementConfig(expressionName, elementName, elementConfig) {
    if (!elementConfig) return;

    if (elementConfig.transform) {
      const { transform } = elementConfig;
      const validKeys = ['x', 'y', 'scaleX', 'scaleY', 'rotation', 'opacity'];
      
      for (const [key, value] of Object.entries(transform)) {
        if (!validKeys.includes(key)) {
          console.warn(`Unknown transform property '${key}' in ${expressionName}.${elementName}`);
        }
        if (typeof value !== 'number') {
          console.warn(`Transform property '${key}' should be a number in ${expressionName}.${elementName}`);
        }
      }
    }
  }

  /**
   * Create default expression for missing expressions
   */
  createDefaultExpression(expressionName) {
    const defaultElements = {};
    
    // Create basic default state for common elements
    const commonElements = ['head', 'eyes', 'mouth', 'body', 'leftHand', 'rightHand'];
    
    commonElements.forEach(elementName => {
      defaultElements[elementName] = {
        transform: {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          opacity: 1
        }
      };
    });

    return {
      name: expressionName,
      elements: defaultElements,
      duration: 0.3,
      easing: 'easeInOut'
    };
  }

  /**
   * Setup default expressions
   */
  setupDefaultExpressions() {
    const defaultExpressions = ['idle', 'happy', 'sad', 'surprised', 'angry'];
    
    defaultExpressions.forEach(expressionName => {
      if (!this.characterData.expressions[expressionName]) {
        console.log(`Creating default expression: ${expressionName}`);
        this.characterData.expressions[expressionName] = this.createDefaultExpression(expressionName);
      }
    });
  }

  /**
   * Preload and compile expression states
   */
  preloadExpressionStates() {
    for (const [name, config] of Object.entries(this.characterData.expressions)) {
      const compiledState = this.compileExpressionState(config);
      this.expressionCache.set(name, compiledState);
    }
    
    console.log(`Preloaded ${this.expressionCache.size} expression states`);
  }

  /**
   * Compile expression configuration into runtime state
   */
  compileExpressionState(expressionConfig) {
    if (!expressionConfig || !expressionConfig.elements) {
      return this.createFallbackExpressionState(expressionConfig);
    }

    const compiledState = {};
    
    for (const [elementName, elementConfig] of Object.entries(expressionConfig.elements)) {
      compiledState[elementName] = this.compileElementState(elementConfig, elementName);
    }

    return compiledState;
  }

  /**
   * Create fallback expression state for invalid configs
   */
  createFallbackExpressionState(expressionConfig) {
    console.warn('Creating fallback expression state', expressionConfig);
    return {
      head: { transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 } }
    };
  }

  /**
   * Compile individual element state
   */
  compileElementState(element, stateName) {
    const compiled = {};

    // Handle transform state
    if (element.transform) {
      compiled.transform = {
        x: element.transform.x || 0,
        y: element.transform.y || 0,
        scaleX: element.transform.scaleX || 1,
        scaleY: element.transform.scaleY || 1,
        rotation: element.transform.rotation || 0,
        opacity: element.transform.opacity !== undefined ? element.transform.opacity : 1
      };
    } else {
      // Default transform state
      compiled.transform = {
        x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1
      };
    }

    // Handle sprite swap
    if (element.spriteSwap) {
      compiled.spriteSwap = {
        type: element.spriteSwap.type || 'replace',
        geometry: element.spriteSwap.geometry || null,
        properties: element.spriteSwap.properties || {}
      };
    }

    return compiled;
  }

  /**
   * Get expression state (from cache or compile on demand)
   */
  getExpressionState(expressionName) {
    if (this.expressionCache.has(expressionName)) {
      return this.expressionCache.get(expressionName);
    }

    const expressionConfig = this.characterData.expressions[expressionName];
    if (!expressionConfig) {
      console.warn(`Expression '${expressionName}' not found, using default`);
      return this.getExpressionState('idle');
    }

    const compiledState = this.compileExpressionState(expressionConfig);
    this.expressionCache.set(expressionName, compiledState);
    return compiledState;
  }

  /**
   * Set current expression
   */
  setCurrentExpression(expressionName) {
    if (this.characterData.expressions[expressionName]) {
      this.currentExpression = expressionName;
      return true;
    }
    console.warn(`Cannot set unknown expression: ${expressionName}`);
    return false;
  }

  /**
   * Get current expression name
   */
  getCurrentExpression() {
    return this.currentExpression;
  }

  /**
   * Get all available expression names
   */
  getAvailableExpressions() {
    return Object.keys(this.characterData.expressions);
  }

  /**
   * Add new expression
   */
  addExpression(name, config) {
    this.validateExpressionConfig(name, config);
    this.characterData.expressions[name] = config;
    
    const compiledState = this.compileExpressionState(config);
    this.expressionCache.set(name, compiledState);
    
    return true;
  }

  /**
   * Remove expression
   */
  removeExpression(name) {
    if (name === 'idle') {
      console.warn('Cannot remove default idle expression');
      return false;
    }
    
    delete this.characterData.expressions[name];
    this.expressionCache.delete(name);
    
    if (this.currentExpression === name) {
      this.currentExpression = 'idle';
    }
    
    return true;
  }

  /**
   * Clear expression cache
   */
  clearCache() {
    this.expressionCache.clear();
  }

  /**
   * Export expression data
   */
  exportExpressionData() {
    return {
      expressions: this.characterData.expressions,
      currentExpression: this.currentExpression,
      version: '1.0',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Import expression data
   */
  importExpressionData(data) {
    if (data.expressions) {
      this.characterData.expressions = data.expressions;
      this.expressionCache.clear();
      this.preloadExpressionStates();
      return true;
    }
    return false;
  }
}
