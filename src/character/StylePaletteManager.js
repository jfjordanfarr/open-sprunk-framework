/**
 * Style Palette Manager for DrawingWindow
 * Handles drawing tools, color palette, and property controls
 */
export class StylePaletteManager {
  constructor(container, eventBus) {
    this.container = container;
    this.eventBus = eventBus;
    this.currentTool = 'select';
    this.currentColor = '#4A90E2';
    this.selectedObject = null;
  }

  /**
   * Initialize the style palette
   */
  init() {
    this.createStylePalette();
    this.setupEventListeners();
  }

  /**
   * Create style palette with drawing tools and color options
   */
  createStylePalette() {
    const drawingToolsGrid = this.container.querySelector('[data-category="drawing"]');
    const colorsGrid = this.container.querySelector('[data-category="colors"]');
    const propertiesContainer = this.container.querySelector('[data-category="properties"]');
    
    // Drawing tools optimized for part creation
    const drawingTools = [
      { id: 'select', name: 'Select', icon: '👆', description: 'Select and move objects' },
      { id: 'pen', name: 'Pen', icon: '✏️', description: 'Draw freehand paths' },
      { id: 'brush', name: 'Brush', icon: '🖌️', description: 'Paint with brush' },
      { id: 'circle', name: 'Circle', icon: '⭕', description: 'Draw circles' },
      { id: 'rectangle', name: 'Rectangle', icon: '⬜', description: 'Draw rectangles' },
      { id: 'fill', name: 'Fill', icon: '🪣', description: 'Fill shapes with color' },
      { id: 'eraser', name: 'Eraser', icon: '🧽', description: 'Erase parts of drawing' }
    ];
    
    // Sprunki-inspired color palette
    const colorPalette = [
      '#4A90E2', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#FFB347', '#87CEEB', '#F0E68C', '#000000', '#FFFFFF'
    ];
    
    // Render drawing tools
    drawingTools.forEach(tool => {
      const toolElement = this.createToolItem(tool);
      drawingToolsGrid.appendChild(toolElement);
    });
    
    // Render color palette
    colorPalette.forEach(color => {
      const colorElement = this.createColorItem(color);
      colorsGrid.appendChild(colorElement);
    });
    
    // Render property controls
    this.createPropertyControls(propertiesContainer);
  }
  
  /**
   * Create tool item element
   */
  createToolItem(tool) {
    const item = document.createElement('div');
    item.className = 'tool-item';
    item.dataset.toolId = tool.id;
    item.setAttribute('aria-label', `${tool.name}: ${tool.description}`);
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    
    if (tool.id === this.currentTool) {
      item.classList.add('active');
    }
    
    item.innerHTML = `
      <div class="tool-icon">${tool.icon}</div>
      <div class="tool-name">${tool.name}</div>
    `;
    
    return item;
  }
  
  /**
   * Create color item element
   */
  createColorItem(color) {
    const item = document.createElement('div');
    item.className = 'color-item';
    item.dataset.color = color;
    item.setAttribute('aria-label', `Color: ${color}`);
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.style.backgroundColor = color;
    
    return item;
  }
  
  /**
   * Create property control interface for selected objects
   */
  createPropertyControls(container) {
    container.innerHTML = `
      <div class="property-group">
        <label class="property-label">Fill Color</label>
        <input type="color" class="property-input" data-property="fill" value="#4A90E2">
      </div>
      
      <div class="property-group">
        <label class="property-label">Stroke Color</label>
        <input type="color" class="property-input" data-property="stroke" value="#2E5A8A">
      </div>
      
      <div class="property-group">
        <label class="property-label">Stroke Width</label>
        <input type="range" class="property-slider" data-property="strokeWidth" 
               min="0" max="10" step="0.5" value="2">
        <span class="property-value">2px</span>
      </div>
      
      <div class="property-group">
        <label class="property-label">Opacity</label>
        <input type="range" class="property-slider" data-property="opacity"
               min="0" max="1" step="0.1" value="1">
        <span class="property-value">100%</span>
      </div>
    `;
  }

  /**
   * Setup event listeners for tool and color selection
   */
  setupEventListeners() {
    // Tool selection
    this.container.addEventListener('click', (e) => {
      const toolItem = e.target.closest('.tool-item');
      if (toolItem) {
        this.selectTool(toolItem.dataset.toolId);
        return;
      }
      
      const colorItem = e.target.closest('.color-item');
      if (colorItem) {
        this.selectColor(colorItem.dataset.color);
        return;
      }
    });
    
    // Property control changes
    this.container.addEventListener('input', (e) => {
      if (e.target.classList.contains('property-input') || e.target.classList.contains('property-slider')) {
        this.updateSelectedObjectProperty(e.target.dataset.property, e.target.value);
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
   * Select a drawing tool
   */
  selectTool(toolId) {
    console.log('StylePaletteManager: Selecting tool:', toolId);
    
    this.currentTool = toolId;
    
    // Update UI to reflect selection
    this.container.querySelectorAll('.tool-item').forEach(item => {
      item.classList.toggle('active', item.dataset.toolId === toolId);
    });
    
    // Emit tool selection event
    this.eventBus?.emit('stylePalette:toolSelected', {
      toolId: toolId,
      timestamp: Date.now()
    });
  }

  /**
   * Select a color
   */
  selectColor(color) {
    console.log('StylePaletteManager: Selecting color:', color);
    
    this.currentColor = color;
    
    // Update UI to reflect selection
    this.container.querySelectorAll('.color-item').forEach(item => {
      item.classList.toggle('active', item.dataset.color === color);
    });
    
    // Update property controls with new color
    const fillInput = this.container.querySelector('[data-property="fill"]');
    if (fillInput) {
      fillInput.value = color;
    }
    
    // Emit color selection event
    this.eventBus?.emit('stylePalette:colorSelected', {
      color: color,
      timestamp: Date.now()
    });
  }

  /**
   * Update property controls based on selection
   */
  updatePropertyControls(activeObject) {
    this.selectedObject = activeObject;
    
    if (activeObject) {
      const fillInput = this.container.querySelector('[data-property="fill"]');
      const strokeInput = this.container.querySelector('[data-property="stroke"]');
      const strokeWidthInput = this.container.querySelector('[data-property="strokeWidth"]');
      const opacityInput = this.container.querySelector('[data-property="opacity"]');
      
      if (fillInput) fillInput.value = activeObject.fill || '#000000';
      if (strokeInput) strokeInput.value = activeObject.stroke || '#000000';
      if (strokeWidthInput) strokeWidthInput.value = activeObject.strokeWidth || 0;
      if (opacityInput) opacityInput.value = activeObject.opacity || 1;
      
      // Update value displays
      this.updateValueDisplays();
    }
  }

  /**
   * Update property of selected object
   */
  updateSelectedObjectProperty(property, value) {
    if (!this.selectedObject) return;
    
    // Emit property change event
    this.eventBus?.emit('stylePalette:propertyChanged', {
      property: property,
      value: value,
      object: this.selectedObject,
      timestamp: Date.now()
    });
    
    // Update displayed value for sliders
    this.updateValueDisplays();
  }

  /**
   * Update value displays for slider controls
   */
  updateValueDisplays() {
    const strokeWidthInput = this.container.querySelector('[data-property="strokeWidth"]');
    const opacityInput = this.container.querySelector('[data-property="opacity"]');
    
    if (strokeWidthInput) {
      const valueDisplay = this.container.querySelector('[data-property="strokeWidth"] + .property-value');
      if (valueDisplay) {
        valueDisplay.textContent = `${strokeWidthInput.value}px`;
      }
    }
    
    if (opacityInput) {
      const valueDisplay = this.container.querySelector('[data-property="opacity"] + .property-value');
      if (valueDisplay) {
        valueDisplay.textContent = `${Math.round(opacityInput.value * 100)}%`;
      }
    }
  }

  /**
   * Get current tool
   */
  getCurrentTool() {
    return this.currentTool;
  }

  /**
   * Get current color
   */
  getCurrentColor() {
    return this.currentColor;
  }

  /**
   * Set current tool programmatically
   */
  setCurrentTool(toolId) {
    this.selectTool(toolId);
  }

  /**
   * Set current color programmatically
   */
  setCurrentColor(color) {
    this.selectColor(color);
  }

  /**
   * Reset tool and color selection
   */
  reset() {
    this.selectTool('select');
    this.selectColor('#4A90E2');
    this.selectedObject = null;
  }

  /**
   * Apply accessibility features
   */
  applyAccessibilityFeatures(options) {
    // High contrast mode support
    if (options.highContrast) {
      this.container.classList.add('high-contrast');
    } else {
      this.container.classList.remove('high-contrast');
    }
    
    // Large touch targets
    if (options.largeTouchTargets) {
      this.container.classList.add('large-touch-targets');
    } else {
      this.container.classList.remove('large-touch-targets');
    }
  }

  /**
   * Get tool configuration for external use
   */
  getToolConfig(toolId) {
    const toolConfigs = {
      select: { cursor: 'default', drawingMode: false },
      pen: { cursor: 'crosshair', drawingMode: true },
      brush: { cursor: 'crosshair', drawingMode: true },
      circle: { cursor: 'crosshair', drawingMode: true },
      rectangle: { cursor: 'crosshair', drawingMode: true },
      fill: { cursor: 'crosshair', drawingMode: false },
      eraser: { cursor: 'crosshair', drawingMode: true }
    };
    
    return toolConfigs[toolId] || toolConfigs.select;
  }

  /**
   * Destroy the style palette manager
   */
  destroy() {
    this.selectedObject = null;
    this.currentTool = 'select';
    this.currentColor = '#4A90E2';
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StylePaletteManager };
}
