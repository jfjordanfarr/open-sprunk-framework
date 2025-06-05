/**
 * Part Library Manager for DrawingWindow
 * Handles the visual part library with Sprunki anatomy structure
 */
export class PartLibraryManager {
  constructor(container, eventBus) {
    this.container = container;
    this.eventBus = eventBus;
    this.selectedPart = null;
    this.selectedSubPart = null;
  }

  /**
   * Initialize the part library
   */
  init() {
    this.createPartLibrary();
    this.setupEventListeners();
  }

  /**
   * Create visual part library with Sprunki anatomy structure
   */
  createPartLibrary() {
    const primaryPartsGrid = this.container.querySelector('[data-category="primary"]');
    const headSubpartsGrid = this.container.querySelector('[data-category="head-subparts"]');
    
    // Primary parts based on Sprunki anatomy
    const primaryParts = [
      {
        id: 'head',
        name: 'Head',
        icon: '👤',
        description: 'Main head shape',
        preview: this.generatePartPreview('head')
      },
      {
        id: 'body',
        name: 'Body', 
        icon: '🫱',
        description: 'Trapezoid body',
        preview: this.generatePartPreview('body')
      },
      {
        id: 'hands',
        name: 'Hands',
        icon: '👏',
        description: 'Floating circle hands',
        preview: this.generatePartPreview('hands')
      }
    ];
    
    // Head sub-parts for detailed editing
    const headSubparts = [
      {
        id: 'eyes',
        name: 'Eyes',
        icon: '👁️',
        description: 'Eye elements with expressions',
        preview: this.generatePartPreview('eyes')
      },
      {
        id: 'mouth',
        name: 'Mouth',
        icon: '👄',
        description: 'Mouth with expression states',
        preview: this.generatePartPreview('mouth')
      },
      {
        id: 'appendages',
        name: 'Extras',
        icon: '🦄',
        description: 'Custom head appendages',
        preview: this.generatePartPreview('appendages')
      }
    ];
    
    // Render primary parts
    primaryParts.forEach(part => {
      const partElement = this.createPartLibraryItem(part);
      primaryPartsGrid.appendChild(partElement);
    });
    
    // Render head sub-parts
    headSubparts.forEach(part => {
      const partElement = this.createPartLibraryItem(part);
      headSubpartsGrid.appendChild(partElement);
    });
  }
  
  /**
   * Create individual part library item with visual preview
   */
  createPartLibraryItem(partConfig) {
    const item = document.createElement('div');
    item.className = 'part-library-item';
    item.dataset.partId = partConfig.id;
    item.setAttribute('aria-label', `${partConfig.name}: ${partConfig.description}`);
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    
    item.innerHTML = `
      <div class="part-preview">
        <canvas class="part-preview-canvas" width="80" height="80"></canvas>
        <div class="part-icon" aria-hidden="true">${partConfig.icon}</div>
      </div>
      <div class="part-label">
        <span class="part-name">${partConfig.name}</span>
      </div>
    `;
    
    // Render preview of current part state
    this.renderPartPreview(item.querySelector('.part-preview-canvas'), partConfig);
    
    return item;
  }
  
  /**
   * Generate preview for a character part
   */
  generatePartPreview(partType) {
    // Return basic geometric representations for now
    const previews = {
      head: { shape: 'circle', color: '#FFE4B5' },
      body: { shape: 'trapezoid', color: '#87CEEB' },
      hands: { shape: 'circle', color: '#FFB6C1' },
      eyes: { shape: 'oval', color: '#000000' },
      mouth: { shape: 'arc', color: '#FF6B6B' },
      appendages: { shape: 'polygon', color: '#DDA0DD' }
    };
    
    return previews[partType] || { shape: 'circle', color: '#CCCCCC' };
  }
  
  /**
   * Render preview of part in small canvas
   */
  renderPartPreview(canvas, partConfig) {
    const ctx = canvas.getContext('2d');
    const preview = partConfig.preview;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = preview.color;
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    switch (preview.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'trapezoid':
        ctx.beginPath();
        ctx.moveTo(centerX - 15, centerY - 20);
        ctx.lineTo(centerX + 15, centerY - 20);
        ctx.lineTo(centerX + 25, centerY + 20);
        ctx.lineTo(centerX - 25, centerY + 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'oval':
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 20, 15, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'arc':
        ctx.beginPath();
        ctx.arc(centerX, centerY - 5, 15, 0, Math.PI);
        ctx.stroke();
        break;
        
      default:
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 20, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
  }

  /**
   * Setup event listeners for part selection
   */
  setupEventListeners() {
    // Part selection events
    this.container.addEventListener('click', (e) => {
      const partItem = e.target.closest('.part-library-item');
      if (partItem) {
        const partId = partItem.dataset.partId;
        this.selectPart(partId);
      }
    });

    // Keyboard navigation for accessibility
    this.container.addEventListener('keydown', (e) => {
      const partItem = e.target.closest('.part-library-item');
      if (partItem && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        const partId = partItem.dataset.partId;
        this.selectPart(partId);
      }
    });
  }

  /**
   * Select a character part for editing
   */
  selectPart(partId) {
    console.log('PartLibraryManager: Selecting part:', partId);
    
    // Update visual selection state
    this.container.querySelectorAll('.part-library-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    const selectedItem = this.container.querySelector(`[data-part-id="${partId}"]`);
    if (selectedItem) {
      selectedItem.classList.add('selected');
    }
    
    // Update selected part state
    this.selectedPart = partId;
    
    // Show/hide sub-parts based on selection
    this.updateSubPartsVisibility(partId);
    
    // Emit selection event
    this.eventBus?.emit('partLibrary:partSelected', {
      partId: partId,
      timestamp: Date.now()
    });
    
    // Update part indicator in header
    this.updatePartIndicator(partId);
  }

  /**
   * Update sub-parts visibility based on main part selection
   */
  updateSubPartsVisibility(partId) {
    const headSubpartsSection = this.container.querySelector('.head-subparts');
    
    if (partId === 'head') {
      headSubpartsSection.style.display = 'block';
    } else {
      headSubpartsSection.style.display = 'none';
      this.selectedSubPart = null;
    }
  }

  /**
   * Update the part indicator in the canvas header
   */
  updatePartIndicator(partId) {
    const indicator = this.container.querySelector('.current-part');
    if (indicator) {
      const partNames = {
        head: 'Head',
        body: 'Body', 
        hands: 'Hands',
        eyes: 'Eyes',
        mouth: 'Mouth',
        appendages: 'Extras'
      };
      
      indicator.textContent = `Editing: ${partNames[partId] || partId}`;
    }
  }

  /**
   * Get the currently selected part
   */
  getSelectedPart() {
    return this.selectedPart;
  }

  /**
   * Get the currently selected sub-part
   */
  getSelectedSubPart() {
    return this.selectedSubPart;
  }

  /**
   * Update part preview (called when part geometry changes)
   */
  updatePartPreview(partId, canvasData) {
    const partItem = this.container.querySelector(`[data-part-id="${partId}"]`);
    if (partItem) {
      const previewCanvas = partItem.querySelector('.part-preview-canvas');
      if (previewCanvas && canvasData) {
        // Render updated preview from canvas data
        this.renderPreviewFromCanvasData(previewCanvas, canvasData);
      }
    }
  }

  /**
   * Render preview from canvas JSON data
   */
  renderPreviewFromCanvasData(canvas, canvasData) {
    // This would render a simplified version of the Fabric.js canvas
    // For now, we'll keep the geometric preview
    // TODO: Implement preview from actual canvas geometry
    console.log('PartLibraryManager: Update preview from canvas data', canvasData);
  }

  /**
   * Reset selection state
   */
  resetSelection() {
    this.selectedPart = null;
    this.selectedSubPart = null;
    
    this.container.querySelectorAll('.part-library-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    const indicator = this.container.querySelector('.current-part');
    if (indicator) {
      indicator.textContent = 'Select a part to edit';
    }
    
    // Hide sub-parts
    const headSubpartsSection = this.container.querySelector('.head-subparts');
    if (headSubpartsSection) {
      headSubpartsSection.style.display = 'none';
    }
  }

  /**
   * Destroy the part library manager
   */
  destroy() {
    // Remove event listeners and clean up
    this.selectedPart = null;
    this.selectedSubPart = null;
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PartLibraryManager };
}
