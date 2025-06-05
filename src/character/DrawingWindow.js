// MDMD Source: docs/Specification/Implementations/character/drawing-window-class.mdmd

import { PartLibraryManager } from './PartLibraryManager.js';
import { StylePaletteManager } from './StylePaletteManager.js';

/**
 * Scratch-style drawing window for Sprunki character parts
 * Features: Visual part library, checkered canvas, real-time preview
 * Optimized with extracted component architecture
 */
export class DrawingWindow {
  constructor(containerElement, eventBus, options = {}) {
    this.container = containerElement;
    this.eventBus = eventBus;
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
    
    // Drawing state
    this.fabricCanvas = null;
    this.partGeometry = new Map(); // Part ID -> Fabric objects
    this.undoStack = [];
    this.redoStack = [];
    this.currentDrawingColor = '#000000'; // Default drawing color
    this.currentBrushWidth = 5; // Default brush width
    this.currentBrushOpacity = 1; // Default brush opacity
    this.currentBrushOpacity = 1; // Default brush opacity
    
    // Component managers
    this.partLibraryManager = null;
    this.stylePaletteManager = null;

    // Pre-bind event handlers for shape drawing to ensure they can be removed
    this.boundOnShapeMouseDown = this.onShapeMouseDown.bind(this);
    this.boundOnShapeMouseMove = this.onShapeMouseMove.bind(this);
    this.boundOnShapeMouseUp = this.onShapeMouseUp.bind(this);
    
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
    if (this.partLibraryManager.init) {
      this.partLibraryManager.init();
    }

    this.stylePaletteManager = new StylePaletteManager(stylePaletteContainer, this.eventBus);
    if (this.stylePaletteManager.init) {
      this.stylePaletteManager.init();
    }
    
    // Set up component event listeners
    this.setupComponentEventListeners();
  }
  
  /**
   * Set up event listeners for extracted components
   */
  setupComponentEventListeners() {
    console.log('[DrawingWindow] Entering setupComponentEventListeners. Attaching EventBus listeners.'); // Debug log added
    console.log('[DrawingWindow] Entering setupComponentEventListeners'); // Debug log added
    // Listen for part selection events from PartLibraryManager
    this.eventBus.on('partLibrary:partSelected', (partData) => {
      this.handlePartSelection(partData);
    });
    
    // Listen for style changes from StylePaletteManager
    // This now listens to property changes (e.g., fill, stroke) for a selected object
    this.eventBus.on('stylePalette:propertyChanged', (eventPayload) => {
      this.handleStyleApplication(eventPayload);
    });
    
    // Listen for tool changes from StylePaletteManager
    this.eventBus.on('stylePalette:toolSelected', (toolData) => {
      this.handleToolChange(toolData);
    });

    // Listen for color changes from StylePaletteManager
    this.eventBus.on('stylePalette:colorSelected', (colorData) => {
    console.log('[DrawingWindow] DEBUG: stylePalette:colorSelected event received. Current handleStyleApplication might make this redundant for property panel changes.', colorData);
      this.handleColorSelection(colorData);
    });

    // Initialize Fabric.js event listeners
    if (this.fabricCanvas) {
      console.log('[DrawingWindow] Setting up Fabric.js canvas event listeners.');

      this.fabricCanvas.on('object:selected', (e) => {
        if (e.target) {
          if (e.target.sprunkiPartId) {
            this.selectedPart = e.target.sprunkiPartId;
            console.log(`[DrawingWindow] Fabric object selected (via object:selected): ${this.selectedPart}`, e.target);
            this.eventBus.emit('drawingWindow:partSelectedOnCanvas', { partId: this.selectedPart, fabricObject: e.target });
          } else {
            const tempId = e.target.id || `fabric-object-${Date.now()}`;
            e.target.id = tempId;
            this.selectedPart = tempId;
            console.log(`[DrawingWindow] Generic Fabric object selected (via object:selected): ${this.selectedPart}`, e.target);
            this.eventBus.emit('drawingWindow:genericObjectSelectedOnCanvas', { objectId: this.selectedPart, fabricObject: e.target });
          }
        } else {
          console.warn('[DrawingWindow] object:selected event fired with no target.');
        }
      });

      this.fabricCanvas.on('selection:cleared', (e) => {
        console.log('[DrawingWindow] Fabric selection:cleared event. Current selectedPart before clearing:', this.selectedPart, 'Event details:', e);
        this.selectedPart = null;
        console.log('[DrawingWindow] Fabric selection cleared. this.selectedPart is now null.');
        this.eventBus.emit('drawingWindow:selectionClearedOnCanvas');
      });

      this.fabricCanvas.on('path:created', (e) => { // Anonymous listener in setupComponentEventListeners
        console.log('[DrawingWindow AnnListener] Fabric path:created event:', e);
        if (e.path) {
          const pathId = `path-${Date.now()}`;
          e.path.sprunkiPartId = pathId; // Assign a unique ID

          // Ensure this.currentBrushOpacity has a default if undefined or null
          const brushOpacity = (this.currentBrushOpacity !== undefined && this.currentBrushOpacity !== null) 
                               ? parseFloat(this.currentBrushOpacity) 
                               : 1;
          // Ensure brushWidth has a default if undefined or null from the Fabric brush
          const brushWidth = (this.fabricCanvas.freeDrawingBrush.width !== undefined && this.fabricCanvas.freeDrawingBrush.width !== null)
                               ? parseFloat(this.fabricCanvas.freeDrawingBrush.width)
                               : (this.currentBrushWidth !== undefined && this.currentBrushWidth !== null ? parseFloat(this.currentBrushWidth) : 1); // Fallback to this.currentBrushWidth if brush itself is not set
          const brushColor = this.fabricCanvas.freeDrawingBrush.color || this.currentDrawingColor || '#000000';

          e.path.set({
            fill: 'lime', // Debug fill
            stroke: brushColor,
            strokeWidth: brushWidth,
            opacity: brushOpacity,
            visible: true,
            objectCaching: false // Attempt to force style refresh and prevent caching issues
          });

          console.log(`[DrawingWindow AnnListener] Path properties AFTER SET, BEFORE RENDER. ID: ${pathId}. Opacity: ${e.path.opacity}, Stroke: ${e.path.stroke}, Fill: ${e.path.fill}, StrokeWidth: ${e.path.strokeWidth}, Visible: ${e.path.visible}, ObjectCaching: ${e.path.objectCaching}`);
          // For more detailed inspection if needed:
          // console.log('[DrawingWindow AnnListener] Full path object after set:', e.path.toJSON(['sprunkiPartId', 'fill', 'stroke', 'strokeWidth', 'opacity', 'visible', 'objectCaching']));

          this.recordAction('path-created', { partId: pathId, pathData: e.path.toJSON(['sprunkiPartId']) });
          this.fabricCanvas.requestRenderAll();
          console.log(`[DrawingWindow AnnListener] requestRenderAll called. Canvas objects: ${this.fabricCanvas.getObjects().length}`);
        } else {
          console.error('[DrawingWindow AnnListener] path:created event fired without e.path');
        }
      });
      console.log('[DrawingWindow] Fabric.js canvas event listeners configured.');
    } else {
      console.error('[DrawingWindow] setupComponentEventListeners: fabricCanvas is NOT initialized. Fabric event listeners NOT attached. This is a problem!');
    }
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
      const activeObject = this.fabricCanvas.getActiveObject();
      this.stylePaletteManager.updatePropertyControls(activeObject);
    }
  }
  
  /**
   * Handle style application from style palette
   */
  handleStyleApplication(eventPayload) {
    console.log('[DrawingWindow] handleStyleApplication - Received eventPayload:', JSON.parse(JSON.stringify(eventPayload)));
    console.log(`[DrawingWindow] handleStyleApplication - Current tool: ${this.currentTool}, Selected part: ${this.selectedPart}, Brush width: ${this.currentBrushWidth}`);

    const { property, value } = eventPayload;

    // 1. Apply styles to the brush if the current tool is 'brush' or 'pen'
    if (this.currentTool === 'brush' || this.currentTool === 'pen') {
      if (this.fabricCanvas && this.fabricCanvas.freeDrawingBrush) {
        if (property === 'strokeWidth') {
          const newWidth = parseFloat(value);
          if (!isNaN(newWidth) && newWidth > 0) {
            this.currentBrushWidth = newWidth;
            this.fabricCanvas.freeDrawingBrush.width = this.currentBrushWidth;
            console.log(`[DrawingWindow] Brush strokeWidth set to: ${this.fabricCanvas.freeDrawingBrush.width}`);
          } else {
            console.warn(`[DrawingWindow] Invalid strokeWidth value for brush: ${value}`);
          }
        } else if (property === 'stroke') { // 'stroke' is used for brush color
          this.fabricCanvas.freeDrawingBrush.color = value;
          console.log(`[DrawingWindow] Brush stroke color set to: ${this.fabricCanvas.freeDrawingBrush.color}`);
        } else if (eventPayload.property === 'opacity') { // Corrected to use eventPayload.property
          this.currentBrushOpacity = parseFloat(eventPayload.value);
          // Opacity for freeDrawingBrush itself is not a direct property.
          // It will be applied to paths upon creation.
          console.log(`[DrawingWindow] Current brush opacity set to: ${this.currentBrushOpacity}`);
        }
      } else {
        console.warn('[DrawingWindow] Brush tool active, but fabricCanvas or freeDrawingBrush is not available.');
      }
    }

    // 2. Apply styles to the selected Fabric object (if one is active)
    const activeObject = this.fabricCanvas.getActiveObject();
    if (activeObject) {
      // If this.selectedPart is set, only style if activeObject matches.
      // If this.selectedPart is NOT set, style the activeObject directly (e.g. a newly drawn path that became active).
      if (this.selectedPart && activeObject.sprunkiPartId !== this.selectedPart && activeObject.id !== this.selectedPart) {
        console.warn(`[DrawingWindow] Active object (${activeObject.sprunkiPartId || activeObject.id}) does not match selectedPart (${this.selectedPart}). Style NOT applied to this active object.`);
      } else {
        console.log(`[DrawingWindow] Applying style to active object: ${activeObject.sprunkiPartId || activeObject.id || 'unknown ID'}, Property: ${property}, Value: ${value}`);
        activeObject.set(property, value);
        
        // Special handling for fill/stroke on complex objects like path-groups if needed
        // Example: if (property === 'fill' && activeObject.type === 'group') { ... }

        this.fabricCanvas.requestRenderAll();
        const styleUpdate = { [property]: value };
        this.recordAction('style-change', { part: activeObject.sprunkiPartId || activeObject.id || 'activeObject', style: styleUpdate });
        console.log(`[DrawingWindow] Style applied to ${activeObject.sprunkiPartId || activeObject.id}. Object after set:`, activeObject.toJSON(['sprunkiPartId', 'id']));
      }
    } else if (this.selectedPart) {
      // this.selectedPart is set, but no Fabric object is active on canvas.
      // This could happen if selection is managed externally and not reflected on canvas, or if the object was removed.
      console.warn(`[DrawingWindow] A part (${this.selectedPart}) is selected (this.selectedPart), but no Fabric object is currently active on canvas. Style not applied.`);
    } else {
      // No selectedPart and no active object. Nothing to style for objects.
      // console.log('[DrawingWindow] No selected part and no active object. Style application skipped for objects.');
    }
  }
  
  /**
   * Handle tool change from style palette
   */
  handleToolChange(toolData) {
    console.log('[DrawingWindow] handleToolChange received toolData:', toolData);
    this.currentTool = toolData.tool;
    console.log('[DrawingWindow] this.currentTool set to:', this.currentTool);
    this.updateCanvasMode();
  }

  /**
   * Handle color selection from style palette
   */
  handleColorSelection(colorData) {
    console.log('[DrawingWindow] handleColorSelection received colorData:', colorData);
    if (colorData && colorData.color) {
      this.currentDrawingColor = colorData.color;
      console.log('[DrawingWindow] handleColorSelection - currentDrawingColor set to:', this.currentDrawingColor);
      // If a drawing tool is active, update its brush color immediately
      if (this.fabricCanvas && this.fabricCanvas.isDrawingMode) {
        console.log(`[DrawingWindow] handleColorSelection - Attempting to set freeDrawingBrush.color to: ${this.currentDrawingColor}`);
        this.fabricCanvas.freeDrawingBrush.color = this.currentDrawingColor;
        console.log(`[DrawingWindow] handleColorSelection - freeDrawingBrush.color is now: ${this.fabricCanvas.freeDrawingBrush.color}`);
      }
    }
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
              <div class="part-category" data-category="primary">
                <!-- Primary parts will go here -->
              </div>
              <div class="part-category head-subparts" data-category="head-subparts" style="display: none;">
                <!-- Head sub-parts will go here -->
              </div>
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
              <div data-category="drawing"></div>
              <div data-category="colors"></div>
              <div data-category="properties"></div>
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
  async loadPartIntoCanvas(partId, partDefinition = null) {
    console.log(`[DrawingWindow LPICT] Before operations for ${partId}. Objects on canvas: ${this.fabricCanvas.getObjects().length}`);
    if (!this.fabricCanvas) {
      console.warn('Cannot load part into canvas - no fabric canvas');
      return;
    }
    
    console.log(`Loading part into canvas: ${partId}`);
    
    // Clear canvas (Temporarily disabled for debugging visibility)
    // this.fabricCanvas.clear();
    // this.addCheckeredBackground();
    
    // Load existing part geometry if available
    if (this.characterData && this.characterData.parts[partId]) {
      const partData = this.characterData.parts[partId];
      console.log(`Found existing part data for ${partId}:`, partData);
      // TODO: Convert part data to Fabric objects and add to canvas
    } else {
      console.log(`No existing data for ${partId}, creating default geometry`);
      console.log(`[DrawingWindow LPICT] Before createDefaultPartGeometry for ${partId}. Objects on canvas: ${this.fabricCanvas.getObjects().length}`);
      await this.createDefaultPartGeometry(partId);
      console.log(`[DrawingWindow LPICT] After createDefaultPartGeometry for ${partId}. Objects on canvas: ${this.fabricCanvas.getObjects().length}`);
    }
  }
  
  /**
   * Create default geometry for a part
   */
  async createDefaultPartGeometry(partId) {
    if (!this.fabricCanvas) return;
    
    const centerX = this.fabricCanvas.width / 2;
    const centerY = this.fabricCanvas.height / 2;
    
    let shape;
    
    switch (partId) {
      case 'head':
        shape = new fabric.Circle({
          radius: 60,
          fill: 'rgba(255, 0, 0, 0.7)', // DIAGNOSTIC: Bright Red Fill
          stroke: '#FFFF00', // DIAGNOSTIC: Bright Yellow Stroke
          strokeWidth: 5, // DIAGNOSTIC: Thick Stroke
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
          fill: 'rgba(255, 0, 0, 0.7)', // DIAGNOSTIC: Bright Red Fill
          stroke: '#FFFF00', // DIAGNOSTIC: Bright Yellow Stroke
          strokeWidth: 5 // DIAGNOSTIC: Thick Stroke
        });
        break;
        
      case 'hands':
        // Create left hand
        const leftHand = new fabric.Circle({
          radius: 25,
          fill: 'rgba(255, 0, 0, 0.7)', // DIAGNOSTIC: Bright Red Fill
          stroke: '#FFFF00', // DIAGNOSTIC: Bright Yellow Stroke
          strokeWidth: 5, // DIAGNOSTIC: Thick Stroke
          left: centerX - 100,
          top: centerY - 25
        });
        
        // Create right hand
        const rightHand = new fabric.Circle({
          radius: 25,
          fill: 'rgba(255, 0, 0, 0.7)', // DIAGNOSTIC: Bright Red Fill
          stroke: '#FFFF00', // DIAGNOSTIC: Bright Yellow Stroke
          strokeWidth: 5, // DIAGNOSTIC: Thick Stroke
          left: centerX + 75,
          top: centerY - 25
        });
        
        this.fabricCanvas.add(leftHand, rightHand);
        console.log('[DrawingWindow] Hands added. Objects on canvas:', this.fabricCanvas.getObjects().length);
        leftHand.visible = true;
        leftHand.opacity = 1;
        leftHand.objectCaching = false;
        this.fabricCanvas.bringToFront(leftHand);
        console.log(`[DrawingWindow] Left Hand properties AFTER explicit settings & BEFORE render:`, {
          fill: leftHand.fill, stroke: leftHand.stroke, strokeWidth: leftHand.strokeWidth,
          width: leftHand.width, height: leftHand.height, left: leftHand.left, top: leftHand.top,
          visible: leftHand.visible, opacity: leftHand.opacity, dirty: leftHand.dirty
        });
        rightHand.visible = true;
        rightHand.opacity = 1;
        rightHand.objectCaching = false;
        this.fabricCanvas.bringToFront(rightHand);
        console.log(`[DrawingWindow] Right Hand properties AFTER explicit settings & BEFORE render:`, {
          fill: rightHand.fill, stroke: rightHand.stroke, strokeWidth: rightHand.strokeWidth,
          width: rightHand.width, height: rightHand.height, left: rightHand.left, top: rightHand.top,
          visible: rightHand.visible, opacity: rightHand.opacity, dirty: rightHand.dirty
        });
        leftHand.dirty = true;
        rightHand.dirty = true;
        // For now, set leftHand as active. This might need refinement for multi-part objects.
        this.fabricCanvas.setActiveObject(leftHand);
        this.fabricCanvas.requestRenderAll();
        console.log('[DrawingWindow] Hands - requestRenderAll() called.');
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
      console.log('[DrawingWindow] Shape added to canvas. Objects on canvas:', this.fabricCanvas.getObjects().length);
      shape.visible = true;
      shape.opacity = 1;
      shape.objectCaching = false;
      this.fabricCanvas.bringToFront(shape);
      console.log(`[DrawingWindow] Shape properties AFTER explicit settings & BEFORE render:`, {
        fill: shape.fill, stroke: shape.stroke, strokeWidth: shape.strokeWidth,
        width: shape.width, height: shape.height, left: shape.left, top: shape.top,
        visible: shape.visible, opacity: shape.opacity, dirty: shape.dirty
      });
      shape.dirty = true;
      this.fabricCanvas.setActiveObject(shape);
      this.fabricCanvas.requestRenderAll();
      console.log('[DrawingWindow] Shape - requestRenderAll() called.');
    }
  }
  
  /**
   * Update canvas mode based on current tool
   */
  updateCanvasMode() {
    console.log('[DrawingWindow] updateCanvasMode called. Current tool:', this.currentTool);
    if (!this.fabricCanvas) {
      console.warn('[DrawingWindow] updateCanvasMode: fabricCanvas is not available!');
      return;
    }

    // Reset canvas modes before applying tool-specific settings
    this.fabricCanvas.isDrawingMode = false;
    this.fabricCanvas.selection = true; // Default to selection enabled
    // Make sure to turn off shape drawing listeners if they were on
    this.disableShapeDrawingListeners(); 

    switch (this.currentTool) {
      case 'select':
        this.fabricCanvas.selection = true;
        this.fabricCanvas.isDrawingMode = false;
        break;
      case 'pen':
      case 'brush':
        this.fabricCanvas.isDrawingMode = true;
        this.fabricCanvas.selection = false; // Disable object selection when drawing
        if (this.fabricCanvas.freeDrawingBrush) {
          this.fabricCanvas.freeDrawingBrush.width = this.currentBrushWidth || 5; // Use stored or default width
          this.fabricCanvas.freeDrawingBrush.color = this.currentDrawingColor || '#000000'; // Use stored or default color
          console.log(`[DrawingWindow] updateCanvasMode (pen/brush) - Brush width: ${this.fabricCanvas.freeDrawingBrush.width}, color: ${this.fabricCanvas.freeDrawingBrush.color}`);
        } else {
          console.warn('[DrawingWindow] updateCanvasMode: freeDrawingBrush not available to set properties.');
        }
        break;
      case 'circle':
      case 'rectangle':
        this.fabricCanvas.isDrawingMode = false; // Ensure free drawing mode is off for shapes
        this.fabricCanvas.selection = false; // Shape drawing tools typically don't allow simultaneous selection
        this.enableShapeDrawing(this.currentTool); // This will set up specific listeners for shape drawing
        break;
      default:
        console.log(`[DrawingWindow] updateCanvasMode: Tool '${this.currentTool}' not explicitly handled, defaulting to selection mode.`);
        this.fabricCanvas.selection = true;
        this.fabricCanvas.isDrawingMode = false;
        break;
    }
    console.log('[DrawingWindow] updateCanvasMode finished. isDrawingMode:', this.fabricCanvas.isDrawingMode, 'selection:', this.fabricCanvas.selection);
  }

  /**
   * Enable shape drawing mode
   */
  disableShapeDrawingListeners() {
    if (this.fabricCanvas) {
      console.log('[DrawingWindow] Disabling shape drawing listeners.');
      this.fabricCanvas.off('mouse:down', this.boundOnShapeMouseDown);
      this.fabricCanvas.off('mouse:move', this.boundOnShapeMouseMove);
      this.fabricCanvas.off('mouse:up', this.boundOnShapeMouseUp);
    } else {
      console.warn('[DrawingWindow] disableShapeDrawingListeners: fabricCanvas not available.');
    }
  }

  /**
   * Enable shape drawing mode
   */
  enableShapeDrawing(shapeType) {
    this.fabricCanvas.isDrawingMode = false;
    this.fabricCanvas.selection = false;
    this.currentShapeType = shapeType;
    
    // Add shape drawing listeners using pre-bound handlers
    this.fabricCanvas.on('mouse:down', this.boundOnShapeMouseDown);
    this.fabricCanvas.on('mouse:move', this.boundOnShapeMouseMove);
    this.fabricCanvas.on('mouse:up', this.boundOnShapeMouseUp);
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
    if (!e || !e.path) {
      console.error('[DrawingWindow] onPathCreated called without a path.', e);
      return;
    }
    // Ensure the path is visible
    e.path.visible = true;
    this.recordAction('path-created', { path: e.path.toObject() });
    
    if (this.fabricCanvas) {
      e.path.dirty = true;
      this.fabricCanvas.requestRenderAll();
      console.log('[DrawingWindow] Path created, requestRenderAll() called. Objects on canvas:', this.fabricCanvas.getObjects().length);
    }
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
        if (this.fabricCanvas.getActiveObject()) {
          this.fabricCanvas.viewportCenterObject();
        } else {
          console.warn('[DrawingWindow] Center action: No object selected to center.');
          // Optionally, notify the user: this.eventBus.emit('notification', { message: 'Please select an object to center.', type: 'info' });
        }
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
