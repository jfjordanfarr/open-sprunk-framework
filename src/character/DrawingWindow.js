// MDMD Source: docs/Specification/Implementations/character/drawing-window-class.mdmd

import { PartLibraryManager } from './PartLibraryManager.js';
import { StylePaletteManager } from './StylePaletteManager.js';

/**
 * Scratch-style drawing window for Sprunki character parts
 * Features: Visual part library, checkered canvas, real-time preview
 * Optimized with extracted component architecture
 */
class DrawingWindow {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      canvasWidth: 800,
      canvasHeight: 600,
      checkeredBackground: true,
      realTimeSync: true,
      accessibility: {
        highContrast: false,
        largeTouchTargets: true,
        auditoryFeedback: false
      },
      ...options
    };
    
    this.characterData = null;
    this.selectedPart = null;
    this.selectedSubPart = null;
    this.currentTool = 'select';
    this.drawingMode = false;
    
    // Event system for cross-window coordination
    this.eventBus = null;
    
    // Drawing state
    this.fabricCanvas = null;
    this.partGeometry = new Map(); // Part ID -> Fabric objects
    this.undoStack = [];
    this.redoStack = [];
    
    // Component managers
    this.partLibraryManager = null;
    this.stylePaletteManager = null;
    
    this.init();
  }
  
  /**
   * Initialize the complete drawing interface
   */
  init() {
    this.createLayout();
    this.setupCanvas();
    this.initializeComponents();
    this.createTimeline();
    this.setupEventListeners();
    this.setupAccessibilityFeatures();
  }
  
  /**
   * Initialize component managers
   */
  initializeComponents() {
    const partLibraryContainer = this.container.querySelector('.part-library-content');
    const stylePaletteContainer = this.container.querySelector('.style-palette-content');
    
    this.partLibraryManager = new PartLibraryManager(partLibraryContainer, this.eventBus);
    this.stylePaletteManager = new StylePaletteManager(stylePaletteContainer, this.eventBus);
    
    // Set up component event listeners
    this.setupComponentEventListeners();
  }
  
  /**
   * Set up event listeners for extracted components
   */
  setupComponentEventListeners() {
    // Listen for part selection events from PartLibraryManager
    document.addEventListener('part-selected', (event) => {
      this.handlePartSelection(event.detail);
    });
    
    // Listen for style changes from StylePaletteManager
    document.addEventListener('style-applied', (event) => {
      this.handleStyleApplication(event.detail);
    });
    
    // Listen for tool changes from StylePaletteManager
    document.addEventListener('tool-changed', (event) => {
      this.handleToolChange(event.detail);
    });
  }
  
  /**
   * Handle part selection from the part library
   */
  handlePartSelection(partData) {
    this.selectedPart = partData.partId;
    this.selectedSubPart = partData.subPartId || null;
    
    // Update canvas selection
    this.updateCanvasSelection();
    
    // Update style palette for selected part
    if (this.stylePaletteManager) {
      this.stylePaletteManager.updateForPart(partData);
    }
  }
  
  /**
   * Handle style application from style palette
   */
  handleStyleApplication(styleData) {
    if (!this.selectedPart) return;
    
    this.applyStyleToPart(this.selectedPart, styleData);
    this.recordAction('style-change', { part: this.selectedPart, style: styleData });
  }
  
  /**
   * Handle tool change from style palette
   */
  handleToolChange(toolData) {
    this.currentTool = toolData.tool;
    this.updateCanvasMode();
  }
  
  /**
   * Create the main layout structure following Scratch patterns
   */
  createLayout() {
    this.container.innerHTML = `
      <div class="drawing-window" data-mode="drawing">
        <!-- Header with mode indicator and controls -->
        <header class="drawing-header">
          <div class="mode-indicator">
            <span class="icon">🎨</span>
            <span class="title">Sprunki Character Creator</span>
          </div>
          <div class="header-controls">
            <button class="control-btn" data-action="settings" aria-label="Settings">
              <span class="icon">⚙️</span>
            </button>
            <button class="control-btn" data-action="save" aria-label="Save Character">
              <span class="icon">💾</span>
            </button>
          </div>
        </header>
        
        <!-- Main content area with 3-panel layout -->
        <main class="drawing-main">
          <!-- Left: Part Library Panel -->
          <aside class="part-library-panel">
            <div class="panel-header">
              <h2 class="panel-title">Parts</h2>
            </div>
            <div class="part-library-content">
              <!-- Content will be populated by PartLibraryManager -->
            </div>
          </aside>
          
          <!-- Center: Drawing Canvas -->
          <section class="drawing-canvas-section">
            <div class="canvas-header">
              <div class="selected-part-indicator">
                <span class="current-part">Select a part to edit</span>
              </div>
              <div class="canvas-controls">
                <button class="canvas-btn" data-action="zoom-in" aria-label="Zoom In">
                  <span class="icon">🔍+</span>
                </button>
                <button class="canvas-btn" data-action="zoom-out" aria-label="Zoom Out">
                  <span class="icon">🔍-</span>
                </button>
                <button class="canvas-btn" data-action="center" aria-label="Center View">
                  <span class="icon">🎯</span>
                </button>
              </div>
            </div>
            <div class="canvas-container">
              <canvas id="drawing-canvas" class="drawing-canvas"></canvas>
              <div class="canvas-overlay">
                <!-- Selection handles, guides, etc. -->
              </div>
            </div>
          </section>
          
          <!-- Right: Style Palette Panel -->
          <aside class="style-palette-panel">
            <div class="panel-header">
              <h2 class="panel-title">Style</h2>
            </div>
            <div class="style-palette-content">
              <!-- Content will be populated by StylePaletteManager -->
            </div>
          </aside>
        </main>
        
        <!-- Bottom: Timeline Integration -->
        <footer class="timeline-footer">
          <div class="timeline-container">
            <div class="timeline-header">
              <span class="timeline-title">🎬 Timeline: Currently Editing Expression</span>
              <div class="timeline-controls">
                <button class="timeline-btn" data-action="play" aria-label="Play">▶️</button>
                <button class="timeline-btn" data-action="loop" aria-label="Loop">🔄</button>
                <button class="timeline-btn" data-action="stop" aria-label="Stop">⏹️</button>
              </div>
            </div>
            <div class="timeline-track">
              <!-- Timeline keyframes will be rendered here -->
            </div>
          </div>
        </footer>
      </div>
    `;
  }
  
  /**
   * Set up the main drawing canvas with Fabric.js
   */
  setupCanvas() {
    const canvasElement = this.container.querySelector('#drawing-canvas');
    
    // Check if Fabric.js is available
    if (typeof fabric === 'undefined') {
      console.warn('Fabric.js not found. Canvas functionality will be limited.');
      return;
    }
    
    this.fabricCanvas = new fabric.Canvas(canvasElement, {
      width: this.options.canvasWidth,
      height: this.options.canvasHeight,
      backgroundColor: 'transparent',
      selection: true,
      preserveObjectStacking: true
    });
    
    // Add checkered background pattern if enabled
    if (this.options.checkeredBackground) {
      this.addCheckeredBackground();
    }
    
    // Configure canvas for part editing
    this.fabricCanvas.on({
      'object:modified': this.onObjectModified.bind(this),
      'path:created': this.onPathCreated.bind(this),
      'selection:created': this.onSelectionCreated.bind(this),
      'selection:cleared': this.onSelectionCleared.bind(this)
    });
  }
  
  /**
   * Add checkered background pattern to canvas
   */
  addCheckeredBackground() {
    const patternCanvas = document.createElement('canvas');
    const patternCtx = patternCanvas.getContext('2d');
    const squareSize = 20;
    
    patternCanvas.width = squareSize * 2;
    patternCanvas.height = squareSize * 2;
    
    // Draw checkered pattern
    patternCtx.fillStyle = '#f8f9fa';
    patternCtx.fillRect(0, 0, squareSize * 2, squareSize * 2);
    
    patternCtx.fillStyle = '#e9ecef';
    patternCtx.fillRect(0, 0, squareSize, squareSize);
    patternCtx.fillRect(squareSize, squareSize, squareSize, squareSize);
    
    // Create pattern and set as canvas background
    const pattern = new fabric.Pattern({
      source: patternCanvas,
      repeat: 'repeat'
    });
    
    this.fabricCanvas.setBackgroundColor(pattern, this.fabricCanvas.renderAll.bind(this.fabricCanvas));
  }
  
  /**
   * Create timeline integration interface
   */
  createTimeline() {
    // Timeline will be populated based on current part and expression states
    // This integrates with the ExpressionSystem for keyframe management
  }
  
  /**
   * Set up comprehensive event listeners
   */
  setupEventListeners() {
    // Canvas control interactions
    this.container.addEventListener('click', (e) => {
      const controlBtn = e.target.closest('.control-btn');
      if (controlBtn) {
        this.handleControlAction(controlBtn.dataset.action);
        return;
      }
      
      const canvasBtn = e.target.closest('.canvas-btn');
      if (canvasBtn) {
        this.handleCanvasAction(canvasBtn.dataset.action);
        return;
      }
    });
    
    // Keyboard navigation
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const focusedElement = e.target;
        if (focusedElement.getAttribute('role') === 'button') {
          focusedElement.click();
          e.preventDefault();
        }
      }
    });
  }
  
  /**
   * Set up accessibility features
   */
  setupAccessibilityFeatures() {
    // Announce part selection changes
    this.ariaLiveRegion = document.createElement('div');
    this.ariaLiveRegion.setAttribute('aria-live', 'polite');
    this.ariaLiveRegion.setAttribute('aria-hidden', 'true');
    this.ariaLiveRegion.style.position = 'absolute';
    this.ariaLiveRegion.style.left = '-10000px';
    this.container.appendChild(this.ariaLiveRegion);
    
    // High contrast mode support
    if (this.options.accessibility.highContrast) {
      this.container.classList.add('high-contrast');
    }
    
    // Large touch targets
    if (this.options.accessibility.largeTouchTargets) {
      this.container.classList.add('large-touch-targets');
    }
  }
  
  /**
   * Update canvas selection based on part selection
   */
  updateCanvasSelection() {
    if (!this.selectedPart) return;
    
    // Load part geometry into canvas
    this.loadPartIntoCanvas(this.selectedPart);
    
    // Update part indicator
    const indicator = this.container.querySelector('.current-part');
    if (indicator) {
      indicator.textContent = `Editing: ${this.selectedPart}`;
    }
    
    // Announce to screen readers
    this.announceToScreenReader(`Selected ${this.selectedPart} for editing`);
    
    // Emit event for cross-window coordination
    this.emitEvent('part-selected', { partId: this.selectedPart });
  }
  
  /**
   * Load character part geometry into canvas
   */
  loadPartIntoCanvas(partId) {
    if (!this.fabricCanvas) {
      console.warn('Cannot load part into canvas - no fabric canvas');
      return;
    }
    
    console.log(`Loading part into canvas: ${partId}`);
    
    // Clear canvas
    this.fabricCanvas.clear();
    this.addCheckeredBackground();
    
    // Load existing part geometry if available
    if (this.characterData && this.characterData.parts[partId]) {
      const partData = this.characterData.parts[partId];
      console.log(`Found existing part data for ${partId}:`, partData);
      // TODO: Convert part data to Fabric objects and add to canvas
    } else {
      console.log(`No existing data for ${partId}, creating default geometry`);
      // Create default geometry for new parts
      this.createDefaultPartGeometry(partId);
    }
  }
  
  /**
   * Create default geometry for a part
   */
  createDefaultPartGeometry(partId) {
    if (!this.fabricCanvas) return;
    
    const centerX = this.fabricCanvas.width / 2;
    const centerY = this.fabricCanvas.height / 2;
    
    let shape;
    
    switch (partId) {
      case 'head':
        shape = new fabric.Circle({
          radius: 60,
          fill: '#FFE4B5',
          stroke: '#DDD',
          strokeWidth: 2,
          left: centerX - 60,
          top: centerY - 60
        });
        break;
        
      case 'body':
        const points = [
          { x: centerX - 30, y: centerY - 40 },
          { x: centerX + 30, y: centerY - 40 },
          { x: centerX + 50, y: centerY + 40 },
          { x: centerX - 50, y: centerY + 40 }
        ];
        shape = new fabric.Polygon(points, {
          fill: '#87CEEB',
          stroke: '#DDD',
          strokeWidth: 2
        });
        break;
        
      case 'hands':
        // Create left hand
        const leftHand = new fabric.Circle({
          radius: 25,
          fill: '#FFB6C1',
          stroke: '#DDD',
          strokeWidth: 2,
          left: centerX - 100,
          top: centerY - 25
        });
        
        // Create right hand
        const rightHand = new fabric.Circle({
          radius: 25,
          fill: '#FFB6C1',
          stroke: '#DDD',
          strokeWidth: 2,
          left: centerX + 75,
          top: centerY - 25
        });
        
        this.fabricCanvas.add(leftHand, rightHand);
        this.fabricCanvas.renderAll();
        return; // Early return for hands since we added both shapes
        
      default:
        shape = new fabric.Circle({
          radius: 30,
          fill: '#CCCCCC',
          stroke: '#999',
          strokeWidth: 2,
          left: centerX - 30,
          top: centerY - 30
        });
    }
    
    if (shape) {
      this.fabricCanvas.add(shape);
      this.fabricCanvas.renderAll();
    }
  }
  
  /**
   * Update canvas mode based on current tool
   */
  updateCanvasMode() {
    if (!this.fabricCanvas) return;
    
    // Reset canvas modes
    this.fabricCanvas.isDrawingMode = false;
    this.fabricCanvas.selection = true;
    
    switch (this.currentTool) {
      case 'select':
        this.fabricCanvas.selection = true;
        break;
        
      case 'pen':
      case 'brush':
        this.fabricCanvas.isDrawingMode = true;
        this.fabricCanvas.freeDrawingBrush.width = 5;
        this.fabricCanvas.freeDrawingBrush.color = '#000000';
        break;
        
      case 'circle':
      case 'rectangle':
        this.enableShapeDrawing(this.currentTool);
        break;
    }
  }
  
  /**
   * Enable shape drawing mode
   */
  enableShapeDrawing(shapeType) {
    this.fabricCanvas.isDrawingMode = false;
    this.fabricCanvas.selection = false;
    this.currentShapeType = shapeType;
    
    // Add shape drawing listeners
    this.fabricCanvas.on('mouse:down', this.onShapeMouseDown.bind(this));
    this.fabricCanvas.on('mouse:move', this.onShapeMouseMove.bind(this));
    this.fabricCanvas.on('mouse:up', this.onShapeMouseUp.bind(this));
  }
  
  /**
   * Apply style to selected part
   */
  applyStyleToPart(partId, styleData) {
    const activeObject = this.fabricCanvas?.getActiveObject();
    
    if (activeObject) {
      if (styleData.fill) activeObject.set('fill', styleData.fill);
      if (styleData.stroke) activeObject.set('stroke', styleData.stroke);
      if (styleData.strokeWidth !== undefined) activeObject.set('strokeWidth', styleData.strokeWidth);
      if (styleData.opacity !== undefined) activeObject.set('opacity', styleData.opacity);
      
      this.fabricCanvas.renderAll();
    }
  }
  
  /**
   * Record action for undo/redo functionality
   */
  recordAction(actionType, actionData) {
    // Save current canvas state to undo stack
    if (this.fabricCanvas) {
      const state = JSON.stringify(this.fabricCanvas.toJSON());
      this.undoStack.push(state);
      
      // Limit undo stack size
      if (this.undoStack.length > 50) {
        this.undoStack.shift();
      }
      
      // Clear redo stack
      this.redoStack = [];
    }
  }
  
  /**
   * Handle canvas object events
   */
  onObjectModified(e) {
    this.recordAction('object-modified', { object: e.target });
    this.emitEvent('part-modified', { 
      partId: this.selectedPart,
      object: e.target 
    });
  }
  
  onPathCreated(e) {
    this.recordAction('path-created', { path: e.path });
  }
  
  onSelectionCreated(e) {
    // Update property controls when object is selected
  }
  
  onSelectionCleared(e) {
    // Clear property controls when selection is cleared
  }
  
  /**
   * Shape drawing event handlers
   */
  onShapeMouseDown(options) {
    if (!this.currentShapeType) return;
    
    this.isDrawingShape = true;
    const pointer = this.fabricCanvas.getPointer(options.e);
    this.shapeStartX = pointer.x;
    this.shapeStartY = pointer.y;
  }
  
  onShapeMouseMove(options) {
    if (!this.isDrawingShape) return;
    // Handle shape preview during drawing
  }
  
  onShapeMouseUp(options) {
    if (!this.isDrawingShape) return;
    
    this.isDrawingShape = false;
    // Finalize shape creation
    this.recordAction('shape-created', { shapeType: this.currentShapeType });
  }
  
  /**
   * Handle control button actions
   */
  handleControlAction(action) {
    switch (action) {
      case 'settings':
        this.openSettings();
        break;
      case 'save':
        this.saveCharacter();
        break;
    }
  }
  
  /**
   * Handle canvas control actions
   */
  handleCanvasAction(action) {
    if (!this.fabricCanvas) return;
    
    switch (action) {
      case 'zoom-in':
        this.fabricCanvas.setZoom(this.fabricCanvas.getZoom() * 1.1);
        break;
      case 'zoom-out':
        this.fabricCanvas.setZoom(this.fabricCanvas.getZoom() * 0.9);
        break;
      case 'center':
        this.fabricCanvas.viewportCenterObject();
        break;
    }
  }
  
  /**
   * Announce message to screen readers
   */
  announceToScreenReader(message) {
    if (this.ariaLiveRegion) {
      this.ariaLiveRegion.textContent = message;
      setTimeout(() => {
        this.ariaLiveRegion.textContent = '';
      }, 1000);
    }
  }
  
  /**
   * Emit event for cross-window coordination
   */
  emitEvent(eventType, data) {
    if (this.eventBus) {
      this.eventBus.emit(eventType, data);
    }
  }
  
  /**
   * Set character data
   */
  setCharacterData(characterData) {
    this.characterData = characterData;
  }
  
  /**
   * Set event bus for cross-window communication
   */
  setEventBus(eventBus) {
    this.eventBus = eventBus;
  }
  
  /**
   * Get current canvas state as character part data
   */
  getPartData() {
    if (!this.fabricCanvas) return null;
    
    return {
      partId: this.selectedPart,
      geometry: this.fabricCanvas.toJSON(),
      metadata: {
        lastModified: new Date().toISOString(),
        version: '1.0'
      }
    };
  }
  
  /**
   * Open settings dialog
   */
  openSettings() {
    console.log('Opening settings...');
  }
  
  /**
   * Save character to storage
   */
  saveCharacter() {
    const partData = this.getPartData();
    if (partData) {
      this.emitEvent('character-saved', partData);
      this.announceToScreenReader('Character saved successfully');
    }
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DrawingWindow;
}
