// MDMD Source: docs/Specification/Implementations/character/drawing-canvas-class.mdmd

/**
 * Drawing Canvas Class
 * 
 * Fabric.js canvas wrapper for character drawing and editing with stage integration support.
 * Provides vector graphics capabilities with coordinate system awareness for Performance Stage.
 * 
 * @class DrawingCanvas
 * @description Encapsulates Fabric.js canvas providing drawing, editing, and character graphics
 *              management with support for stage-integrated authoring workflows.
 */

export class DrawingCanvas {
    constructor(containerElement, eventBus, options = {}) {
        this.container = containerElement;
        this.eventBus = eventBus;
        this.options = {
            stageIntegrated: false,
            coordinateSystem: null,
            transparentBackground: false,
            ...options
        };
        
        this.canvas = null;
        this.canvasElement = null;
        this.activeTool = 'brush';
        this.brushSize = 5;
        this.brushColor = '#000000';
        
        // Drawing state
        this.isDrawing = false;
        this.drawingPath = null;
        
        console.log('✏️ DrawingCanvas: Constructor initialized', this.options);
    }

    async initialize() {
        console.log('✏️ DrawingCanvas: Initializing Fabric.js canvas...');
        
        try {
            // Check if Fabric.js is available
            if (typeof fabric === 'undefined') {
                console.error('✏️ DrawingCanvas: Fabric.js is not loaded!');
                await this.loadFabricJS();
            }
            
            // Create canvas element
            this.createCanvasElement();
            
            // Initialize Fabric.js canvas
            this.initializeFabricCanvas();
            
            // Set initial tool mode (brush for drawing)
            this.setActiveTool('brush');
            
            // Initial resize
            this.resize();
            
            console.log('✏️ DrawingCanvas: Initialization complete');
        } catch (error) {
            console.error('✏️ DrawingCanvas: Initialization failed:', error);
            throw error;
        }
    }

    async loadFabricJS() {
        // For now, assume Fabric.js is loaded via CDN in HTML
        // In production, this could dynamically load the library
        console.log('✏️ DrawingCanvas: Fabric.js should be loaded via CDN');
        
        // Check again after a brief delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (typeof fabric === 'undefined') {
            throw new Error('Fabric.js is required but not available');
        }
    }

    createCanvasElement() {
        this.canvasElement = document.createElement('canvas');
        this.canvasElement.id = `drawing-canvas-${Date.now()}`;
        this.canvasElement.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
        `;
        
        this.container.appendChild(this.canvasElement);
        
        console.log('✏️ DrawingCanvas: Canvas element created');
    }

    initializeFabricCanvas() {
        const canvasOptions = {
            width: this.container.clientWidth || 800,
            height: this.container.clientHeight || 600,
            backgroundColor: this.options.transparentBackground ? null : '#f0f0f0',
            selection: true,
            preserveObjectStacking: true
        };
        this.canvas = new fabric.Canvas(this.canvasElement, canvasOptions);
        // Configure for character drawing
        this.canvas.freeDrawingBrush.width = this.brushSize;
        this.canvas.freeDrawingBrush.color = this.brushColor;
        // Draw Sprunki primitives as background
        this.drawSprunkiPrimitives();
        console.log('✏️ DrawingCanvas: Fabric.js canvas initialized');
    }

    drawSprunkiPrimitives() {
        // Remove any previous primitives
        if (this.sprunkiPrimitiveGroup) {
            this.canvas.remove(this.sprunkiPrimitiveGroup);
        }
        // Get canvas size
        const w = this.canvas.getWidth();
        const h = this.canvas.getHeight();
        // Sprunki body (trapezoid)
        const bodyTop = w/2 - w*0.12;
        const bodyBottom = w/2 + w*0.12;
        const bodyY0 = h*0.45;
        const bodyY1 = h*0.75;
        const body = new fabric.Polygon([
            {x: w/2 - w*0.08, y: bodyY0}, // top left
            {x: w/2 + w*0.08, y: bodyY0}, // top right
            {x: w/2 + w*0.18, y: bodyY1}, // bottom right
            {x: w/2 - w*0.18, y: bodyY1}  // bottom left
        ], {
            fill: '#ffb347',
            selectable: false,
            evented: false,
            excludeFromExport: true,
            excludeFromErase: true // Protect from eraser tool
        });
        // Head (circle)
        const head = new fabric.Circle({
            left: w/2 - w*0.07,
            top: h*0.28,
            radius: w*0.07,
            fill: '#fff',
            selectable: false,
            evented: false,
            excludeFromExport: true,
            excludeFromErase: true // Protect from eraser tool
        });
        // Left hand (circle)
        const leftHand = new fabric.Circle({
            left: w/2 - w*0.18 - w*0.04,
            top: h*0.7,
            radius: w*0.04,
            fill: '#fff',
            selectable: false,
            evented: false,
            excludeFromExport: true,
            excludeFromErase: true // Protect from eraser tool
        });
        // Right hand (circle)
        const rightHand = new fabric.Circle({
            left: w/2 + w*0.18 - w*0.04,
            top: h*0.7,
            radius: w*0.04,
            fill: '#fff',
            selectable: false,
            evented: false,
            excludeFromExport: true,
            excludeFromErase: true // Protect from eraser tool
        });
        // Group primitives
        this.sprunkiPrimitiveGroup = new fabric.Group([body, head, leftHand, rightHand], {
            selectable: false,
            evented: false,
            excludeFromExport: true
        });
        this.canvas.add(this.sprunkiPrimitiveGroup);
        this.sprunkiPrimitiveGroup.sendToBack();
    }

    resize() {
        if (this.canvas && this.container) {
            // Always match container size
            const width = this.container.offsetWidth || 800;
            const height = this.container.offsetHeight || 600;
            this.canvas.setWidth(width);
            this.canvas.setHeight(height);
            this.canvas.renderAll();
            console.log('✏️ DrawingCanvas: Resized to', width, 'x', height);
        }
    }

    // PUBLIC API - TOOL METHODS

    setActiveTool(tool) {
        this.activeTool = tool;
        
        switch (tool) {
            case 'brush':
                this.canvas.isDrawingMode = true;
                this.canvas.selection = false;
                this.canvas.defaultCursor = 'crosshair';
                this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
                this.canvas.freeDrawingBrush.color = this.brushColor;
                this.canvas.freeDrawingBrush.width = this.brushSize;
                break;
                
            case 'eraser':
                this.canvas.isDrawingMode = true;
                this.canvas.selection = false;
                // Create custom eraser brush that only affects user-drawn content
                this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
                this.canvas.freeDrawingBrush.color = 'rgba(255,255,255,1)';
                this.canvas.freeDrawingBrush.width = this.brushSize;
                // Use destination-out to erase, but we'll protect background elements
                this.canvas.freeDrawingBrush.globalCompositeOperation = 'destination-out';
                
                // Override the brush's _render method to only erase non-protected objects
                const originalRender = this.canvas.freeDrawingBrush._render;
                this.canvas.freeDrawingBrush._render = function() {
                    // Temporarily hide protected background elements during erasing
                    const protectedObjects = [];
                    this.canvas.getObjects().forEach(obj => {
                        if (obj.excludeFromErase || obj.excludeFromExport) {
                            obj.visible = false;
                            protectedObjects.push(obj);
                        }
                    });
                    
                    // Perform the erase operation
                    originalRender.call(this);
                    
                    // Restore protected objects
                    protectedObjects.forEach(obj => {
                        obj.visible = true;
                    });
                    
                    this.canvas.renderAll();
                }.bind(this);
                break;
                
            case 'shape':
                this.canvas.isDrawingMode = false;
                this.canvas.selection = true;
                this.canvas.defaultCursor = 'default';
                break;
                
            case 'select':
                this.canvas.isDrawingMode = false;
                this.canvas.selection = true;
                this.canvas.defaultCursor = 'default';
                break;
                
            default:
                console.warn('✏️ DrawingCanvas: Unknown tool:', tool);
        }
        
        console.log('✏️ DrawingCanvas: Active tool set to:', tool);
    }

    setBrushSize(size) {
        this.brushSize = size;
        this.canvas.freeDrawingBrush.width = size;
        console.log('✏️ DrawingCanvas: Brush size set to:', size);
    }

    setBrushColor(color) {
        this.brushColor = color;
        this.canvas.freeDrawingBrush.color = color;
        console.log('✏️ DrawingCanvas: Brush color set to:', color);
    }

    // SHAPE CREATION METHODS

    addRectangle(options = {}) {
        const rect = new fabric.Rect({
            left: options.x || 100,
            top: options.y || 100,
            width: options.width || 100,
            height: options.height || 80,
            fill: options.fill || this.brushColor,
            stroke: options.stroke || '#000',
            strokeWidth: options.strokeWidth || 2,
            ...options
        });
        
        this.canvas.add(rect);
        this.canvas.setActiveObject(rect);
        this.canvas.renderAll();
        
        return rect;
    }

    addCircle(options = {}) {
        const circle = new fabric.Circle({
            left: options.x || 100,
            top: options.y || 100,
            radius: options.radius || 50,
            fill: options.fill || this.brushColor,
            stroke: options.stroke || '#000',
            strokeWidth: options.strokeWidth || 2,
            ...options
        });
        
        this.canvas.add(circle);
        this.canvas.setActiveObject(circle);
        this.canvas.renderAll();
        
        return circle;
    }

    addText(text = 'Text', options = {}) {
        const textObject = new fabric.Text(text, {
            left: options.x || 100,
            top: options.y || 100,
            fontSize: options.fontSize || 24,
            fill: options.fill || this.brushColor,
            fontFamily: options.fontFamily || 'Arial',
            ...options
        });
        
        this.canvas.add(textObject);
        this.canvas.setActiveObject(textObject);
        this.canvas.renderAll();
        
        return textObject;
    }

    // CANVAS MANAGEMENT METHODS

    clear() {
        this.canvas.clear();
        if (!this.options.transparentBackground) {
            this.canvas.backgroundColor = '#f0f0f0';
        }
        this.drawSprunkiPrimitives();
        this.canvas.renderAll();
        
        this.eventBus.emit('canvas:cleared');
        console.log('✏️ DrawingCanvas: Canvas cleared');
    }

    removeActiveObject() {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            this.canvas.remove(activeObject);
            this.canvas.renderAll();
        }
    }

    // DATA EXPORT/IMPORT METHODS

    exportCharacterData() {
        const canvasData = this.canvas.toJSON();
        
        const characterData = {
            id: `character_${Date.now()}`,
            canvasData: canvasData,
            metadata: {
                width: this.canvas.width,
                height: this.canvas.height,
                created: new Date().toISOString(),
                version: '1.0'
            }
        };
        
        console.log('✏️ DrawingCanvas: Character data exported');
        return characterData;
    }

    loadCharacterData(characterData) {
        if (!characterData || !characterData.canvasData) {
            console.warn('✏️ DrawingCanvas: Invalid character data provided');
            return;
        }
        
        this.canvas.loadFromJSON(characterData.canvasData, () => {
            this.canvas.renderAll();
            console.log('✏️ DrawingCanvas: Character data loaded');
            
            this.eventBus.emit('canvas:character_loaded', characterData);
        });
    }

    exportAsPNG() {
        return this.canvas.toDataURL('image/png');
    }

    exportAsSVG() {
        return this.canvas.toSVG();
    }

    // EVENT HANDLERS

    onObjectModified(e) {
        this.eventBus.emit('canvas:object:modified', {
            object: e.target.toJSON(),
            objectId: e.target.id
        });
    }

    onObjectAdded(e) {
        this.eventBus.emit('canvas:object:added', {
            object: e.target.toJSON(),
            objectId: e.target.id
        });
    }

    onObjectRemoved(e) {
        this.eventBus.emit('canvas:object:removed', {
            objectId: e.target.id
        });
    }

    onSelectionCreated(e) {
        this.eventBus.emit('canvas:selection:created', {
            selected: e.selected.map(obj => obj.toJSON())
        });
    }

    onSelectionUpdated(e) {
        this.eventBus.emit('canvas:selection:updated', {
            selected: e.selected.map(obj => obj.toJSON())
        });
    }

    onSelectionCleared(e) {
        this.eventBus.emit('canvas:selection:cleared', {
            deselected: e.deselected ? e.deselected.map(obj => obj.toJSON()) : []
        });
    }

    onPathCreated(e) {
        this.eventBus.emit('canvas:drawing_completed', {
            path: e.path.toJSON()
        });
    }

    onMouseDown(e) {
        if (this.activeTool === 'shape') {
            // Handle shape creation on mouse down
            const pointer = this.canvas.getPointer(e.e);
            this.startShapeCreation(pointer);
        }
    }

    onMouseMove(e) {
        if (this.isDrawing && this.activeTool === 'shape') {
            const pointer = this.canvas.getPointer(e.e);
            this.updateShapeCreation(pointer);
        }
    }

    onMouseUp(e) {
        if (this.isDrawing && this.activeTool === 'shape') {
            this.finishShapeCreation();
        }
    }

    // SHAPE CREATION HELPERS

    startShapeCreation(pointer) {
        // This could be expanded to create different shapes based on sub-tool selection
        this.isDrawing = true;
        this.shapeStartPoint = pointer;
    }

    updateShapeCreation(pointer) {
        // Update shape size during drag (implementation depends on shape type)
    }

    finishShapeCreation() {
        this.isDrawing = false;
        this.shapeStartPoint = null;
    }

    // COORDINATE SYSTEM INTEGRATION

    getStageCoordinates(canvasX, canvasY) {
        if (this.options.coordinateSystem && this.options.coordinateSystem.getStagePosition) {
            return this.options.coordinateSystem.getStagePosition(canvasX, canvasY);
        }
        return { x: canvasX, y: canvasY };
    }

    getCanvasCoordinates(stageX, stageY) {
        // Convert stage coordinates back to canvas coordinates
        // Implementation depends on coordinate system mapping
        return { x: stageX, y: stageY };
    }

    // CLEANUP

    destroy() {
        console.log('✏️ DrawingCanvas: Destroying...');
        
        // Remove event listeners
        window.removeEventListener('resize', this.resize);
        
        // Dispose of Fabric.js canvas
        if (this.canvas) {
            this.canvas.dispose();
            this.canvas = null;
        }
        
        // Remove canvas element
        if (this.canvasElement && this.canvasElement.parentNode) {
            this.canvasElement.parentNode.removeChild(this.canvasElement);
        }
        
        console.log('✏️ DrawingCanvas: Destroyed');
    }
}
