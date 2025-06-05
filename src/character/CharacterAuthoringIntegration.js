/**
 * Integration demo showing DrawingWindow and ExpressionSystem working together
 * This demonstrates the complete character authoring workflow
 */

// Sample character data with full Sprunki anatomy
const sampleCharacterData = {
  id: 'demo-sprunki',
  name: 'Demo Sprunki Character',
  version: '1.0',
  parts: {
    head: {
      geometry: {
        type: 'circle',
        radius: 60,
        fill: '#FFE4B5',
        stroke: '#DDD',
        strokeWidth: 2
      },
      position: { x: 400, y: 200 },
      transform: { 
        position: { x: 400, y: 200 }, 
        rotation: 0, 
        scale: { x: 1, y: 1 } 
      },
      eyes: {
        left: {
          geometry: {
            type: 'ellipse',
            rx: 12,
            ry: 8,
            fill: '#000000'
          },
          position: { x: 380, y: 190 },
          transform: { 
            position: { x: 380, y: 190 }, 
            rotation: 0, 
            scale: { x: 1, y: 1 } 
          },
          expressionStates: {
            default: { 
              geometry: {
                type: 'ellipse',
                rx: 12,
                ry: 8,
                fill: '#000000'
              }
            },
            wide: { 
              geometry: {
                type: 'ellipse',
                rx: 16,
                ry: 12,
                fill: '#000000'
              }
            },
            closed: { 
              geometry: {
                type: 'line',
                stroke: '#000000',
                strokeWidth: 3
              }
            }
          }
        },
        right: {
          geometry: {
            type: 'ellipse',
            rx: 12,
            ry: 8,
            fill: '#000000'
          },
          position: { x: 420, y: 190 },
          transform: { 
            position: { x: 420, y: 190 }, 
            rotation: 0, 
            scale: { x: 1, y: 1 } 
          },
          expressionStates: {
            default: { 
              geometry: {
                type: 'ellipse',
                rx: 12,
                ry: 8,
                fill: '#000000'
              }
            },
            wide: { 
              geometry: {
                type: 'ellipse',
                rx: 16,
                ry: 12,
                fill: '#000000'
              }
            },
            closed: { 
              geometry: {
                type: 'line',
                stroke: '#000000',
                strokeWidth: 3
              }
            }
          }
        }
      },
      mouth: {
        geometry: {
          type: 'arc',
          radius: 15,
          startAngle: 0,
          endAngle: Math.PI,
          stroke: '#FF6B6B',
          strokeWidth: 3,
          fill: 'none'
        },
        position: { x: 400, y: 220 },
        transform: { 
          position: { x: 400, y: 220 }, 
          rotation: 0, 
          scale: { x: 1, y: 1 } 
        },
        expressionStates: {
          default: { 
            geometry: {
              type: 'arc',
              radius: 15,
              startAngle: 0,
              endAngle: Math.PI,
              stroke: '#FF6B6B',
              strokeWidth: 3,
              fill: 'none'
            }
          },
          open: { 
            geometry: {
              type: 'ellipse',
              rx: 8,
              ry: 12,
              fill: '#8B0000',
              stroke: '#FF6B6B',
              strokeWidth: 2
            }
          },
          smile: { 
            geometry: {
              type: 'arc',
              radius: 20,
              startAngle: 0,
              endAngle: Math.PI,
              stroke: '#FF6B6B',
              strokeWidth: 3,
              fill: 'none'
            }
          }
        }
      }
    },
    body: {
      geometry: {
        type: 'polygon',
        points: [
          { x: 370, y: 260 },
          { x: 430, y: 260 },
          { x: 450, y: 380 },
          { x: 350, y: 380 }
        ],
        fill: '#87CEEB',
        stroke: '#DDD',
        strokeWidth: 2
      },
      position: { x: 400, y: 320 },
      transform: { 
        position: { x: 400, y: 320 }, 
        rotation: 0, 
        scale: { x: 1, y: 1 } 
      }
    },
    hands: {
      left: {
        geometry: {
          type: 'circle',
          radius: 25,
          fill: '#FFB6C1',
          stroke: '#DDD',
          strokeWidth: 2
        },
        position: { x: 300, y: 300 },
        transform: { 
          position: { x: 300, y: 300 }, 
          rotation: 0, 
          scale: { x: 1, y: 1 } 
        }
      },
      right: {
        geometry: {
          type: 'circle',
          radius: 25,
          fill: '#FFB6C1',
          stroke: '#DDD',
          strokeWidth: 2
        },
        position: { x: 500, y: 300 },
        transform: { 
          position: { x: 500, y: 300 }, 
          rotation: 0, 
          scale: { x: 1, y: 1 } 
        }
      }
    }
  },
  expressions: {
    idle: {
      eyes: { left: 'default', right: 'default' },
      mouth: 'default',
      duration: 0.3
    },
    singing: {
      eyes: { left: 'default', right: 'default' },
      mouth: 'open',
      duration: 0.2
    },
    surprised: {
      eyes: { left: 'wide', right: 'wide' },
      mouth: 'open',
      duration: 0.1
    },
    happy: {
      eyes: { left: 'default', right: 'default' },
      mouth: 'smile',
      duration: 0.25
    },
    sleepy: {
      eyes: { left: 'closed', right: 'closed' },
      mouth: 'default',
      duration: 0.4
    }
  }
};

// Integration manager class
class CharacterAuthoringIntegration {
  constructor(containerId) {
    this.containerId = containerId;
    this.eventBus = null;
    this.drawingWindow = null;
    this.expressionSystem = null;
    this.characterData = JSON.parse(JSON.stringify(sampleCharacterData)); // Deep copy
    
    this.init();
  }
  
  init() {
    this.setupEventBus();
    this.setupDrawingWindow();
    this.setupExpressionSystem();
    this.setupIntegrationEvents();
    this.setupDemoControls();
  }
  
  setupEventBus() {
    // Import and create EventBus (simplified for demo)
    this.eventBus = new EventBus();
    this.eventBus.setDebugMode(true);
  }
  
  setupDrawingWindow() {
    this.drawingWindow = new DrawingWindow(this.containerId, {
      canvasWidth: 800,
      canvasHeight: 600,
      checkeredBackground: true,
      realTimeSync: true,
      accessibility: {
        highContrast: false,
        largeTouchTargets: false,
        auditoryFeedback: false
      }
    });
    
    this.drawingWindow.setEventBus(this.eventBus);
    this.drawingWindow.setCharacterData(this.characterData);
  }
  
  setupExpressionSystem() {
    this.expressionSystem = new ExpressionSystem(this.characterData, {
      defaultTransitionDuration: 0.3,
      easing: 'easeInOut',
      preloadExpressions: true,
      smoothTransitions: true
    });
    
    this.expressionSystem.setEventBus(this.eventBus);
  }
  
  setupIntegrationEvents() {
    // Drawing window events
    this.eventBus.on('part-selected', (data) => {
      console.log(`[Integration] Part selected: ${data.partId}`);
      this.updateExpressionPreview();
    });
    
    this.eventBus.on('part-modified', (data) => {
      console.log(`[Integration] Part modified: ${data.partId}`);
      // Update character data with modifications
      this.updateCharacterPart(data);
      this.updateExpressionPreview();
    });
    
    this.eventBus.on('character-saved', (data) => {
      console.log(`[Integration] Character saved:`, data);
      this.showNotification('Character saved successfully!', 'success');
    });
    
    // Expression system events
    this.eventBus.on('expressionChanged', (data) => {
      console.log(`[Integration] Expression changed: ${data.expressionName}`);
      this.updateDrawingWindowExpression(data.expressionName);
    });
    
    this.eventBus.on('elementGeometryChanged', (data) => {
      console.log(`[Integration] Element geometry changed: ${data.elementName}`);
      this.updateDrawingWindowGeometry(data);
    });
    
    this.eventBus.on('elementTransformChanged', (data) => {
      console.log(`[Integration] Element transform changed: ${data.elementName}`);
      this.updateDrawingWindowTransform(data);
    });
  }
  
  setupDemoControls() {
    // Add expression demo controls
    const headerControls = document.querySelector('.header-controls');
    if (headerControls) {
      const expressionSelect = document.createElement('select');
      expressionSelect.className = 'control-btn';
      expressionSelect.style.marginLeft = '10px';
      
      // Add expression options
      Object.keys(this.characterData.expressions).forEach(expr => {
        const option = document.createElement('option');
        option.value = expr;
        option.textContent = expr.charAt(0).toUpperCase() + expr.slice(1);
        expressionSelect.appendChild(option);
      });
      
      expressionSelect.addEventListener('change', (e) => {
        this.expressionSystem.setExpression(e.target.value);
      });
      
      headerControls.appendChild(expressionSelect);
      
      // Add animation control
      const animateBtn = document.createElement('button');
      animateBtn.className = 'control-btn';
      animateBtn.textContent = '🎭 Demo Expressions';
      animateBtn.addEventListener('click', () => {
        this.demoExpressionSequence();
      });
      
      headerControls.appendChild(animateBtn);
    }
  }
  
  updateCharacterPart(partData) {
    // Update character data with new part information
    if (partData.partId && this.characterData.parts[partData.partId]) {
      // Update the part data based on drawing window changes
      // This would typically involve converting Fabric.js objects back to our data format
      console.log(`Updating character part: ${partData.partId}`);
    }
  }
  
  updateExpressionPreview() {
    // Update expression system with current character state
    if (this.expressionSystem) {
      this.expressionSystem.setExpression(this.expressionSystem.currentExpression, { force: true });
    }
  }
  
  updateDrawingWindowExpression(expressionName) {
    // Update drawing window to show the expression state
    // This would involve updating the canvas to reflect expression changes
    console.log(`Updating drawing window for expression: ${expressionName}`);
  }
  
  updateDrawingWindowGeometry(data) {
    // Update drawing window canvas with new geometry
    console.log(`Updating canvas geometry for: ${data.elementName}`);
  }
  
  updateDrawingWindowTransform(data) {
    // Update drawing window canvas with new transform
    console.log(`Updating canvas transform for: ${data.elementName}`, data.transform);
  }
  
  async demoExpressionSequence() {
    const expressions = ['idle', 'happy', 'surprised', 'singing', 'sleepy', 'idle'];
    
    for (const expr of expressions) {
      await this.expressionSystem.setExpression(expr);
      await this.delay(1000); // Wait 1 second between expressions
    }
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      transition: all 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
  
  // Public API methods
  getCharacterData() {
    return this.characterData;
  }
  
  setCharacterData(data) {
    this.characterData = data;
    this.drawingWindow.setCharacterData(data);
    
    // Recreate expression system with new data
    this.expressionSystem = new ExpressionSystem(this.characterData);
    this.expressionSystem.setEventBus(this.eventBus);
  }
  
  exportCharacter() {
    const exportData = {
      character: this.characterData,
      drawingState: this.drawingWindow.getPartData(),
      expressions: this.expressionSystem.exportExpressionData(),
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    return exportData;
  }
  
  importCharacter(data) {
    if (data.character) {
      this.setCharacterData(data.character);
    }
    
    if (data.expressions) {
      this.expressionSystem.importExpressionData(data.expressions);
    }
    
    this.showNotification('Character imported successfully!', 'success');
  }
}

// Export for use in demo
if (typeof window !== 'undefined') {
  window.CharacterAuthoringIntegration = CharacterAuthoringIntegration;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CharacterAuthoringIntegration;
}
