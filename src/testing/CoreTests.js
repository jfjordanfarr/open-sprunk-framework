/**
 * Core module tests for Open Sprunk Framework
 * Tests EventBus, StateManager, and AppCore functionality
 * 
 * @fileoverview Test suite for core application modules
 */

import { TestFramework } from './TestFramework.js';
import { EventBus } from '../core/EventBus.js';
import { StateManager } from '../core/StateManager.js';
import { AppCore } from '../core/AppCore.js';
import { EVENTS, SELECTORS, ValidationHelpers } from '../utils/types.js';

/**
 * Core Tests class for Open Sprunk Framework
 * Tests EventBus, StateManager, and AppCore functionality
 */
export class CoreTests {
    constructor(testFramework) {
        this.testFramework = testFramework;
        this.testSuite = {
            name: 'Core Functionality',
            tests: []
        };
    }    async init() {
        console.log('[CoreTests] Initializing core tests...');
        this.registerTests();
        this.registerIntegrationTests();
    }

    registerTests() {
        const testFramework = this.testFramework;
  
        // EventBus Tests
        testFramework.describe('EventBus', () => {
    
    testFramework.it('should create EventBus instance', async function() {
      const eventBus = new EventBus();
      this.assert.exists(eventBus, 'EventBus should be created');
      this.assert.exists(eventBus.events, 'EventBus should have events Map');
    });
    
    testFramework.it('should emit and receive events', async function() {
      const eventBus = new EventBus();
      let received = false;
      let receivedData = null;
      
      eventBus.on('test:event', (data) => {
        received = true;
        receivedData = data;
      });
      
      eventBus.emit('test:event', { test: 'data' });
      
      // Wait a bit for async event handling
      await new Promise(resolve => setTimeout(resolve, 10));
      
      this.assert.isTrue(received, 'Event should be received');
      this.assert.exists(receivedData, 'Event data should be received');
      this.assert.equals(receivedData.test, 'data', 'Event data should match');
    });
    
    testFramework.it('should handle wildcard events', async function() {
      const eventBus = new EventBus();
      let wildcardReceived = false;
      
      eventBus.on('test:*', () => {
        wildcardReceived = true;
      });
      
      eventBus.emit('test:wildcard-event');
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      this.assert.isTrue(wildcardReceived, 'Wildcard event should be received');
    });
    
  });
  
  // StateManager Tests
  testFramework.describe('StateManager', () => {
    
    testFramework.it('should initialize StateManager with EventBus', async function() {
      const eventBus = new EventBus();
      const stateManager = new StateManager(eventBus);
      
      this.assert.exists(stateManager, 'StateManager should be created');
      this.assert.exists(stateManager.state, 'StateManager should have state object');
      this.assert.equals(stateManager.eventBus, eventBus, 'StateManager should store EventBus reference');
    });
    
    testFramework.it('should get and set state values', async function() {
      const eventBus = new EventBus();
      const stateManager = new StateManager(eventBus);
      await stateManager.init();
      
      // Test setting a value
      stateManager.set('test.value', 'hello');
      const retrieved = stateManager.get('test.value');
      
      this.assert.equals(retrieved, 'hello', 'State value should be retrieved correctly');
    });
    
    testFramework.it('should emit events on state changes', async function() {
      const eventBus = new EventBus();
      const stateManager = new StateManager(eventBus);
      await stateManager.init();
      
      let eventFired = false;
      eventBus.on('state:changed', () => {
        eventFired = true;
      });
      
      stateManager.set('test.change', 'new value');
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      this.assert.isTrue(eventFired, 'State change event should be emitted');
    });
    
  });
  
  // AppCore Tests
  testFramework.describe('AppCore', () => {
    
    testFramework.it('should initialize AppCore', async function() {
      const appCore = new AppCore();
      
      this.assert.exists(appCore, 'AppCore should be created');
      this.assert.isFalse(appCore.initialized, 'AppCore should not be initialized initially');
      
      await appCore.init();
      
      this.assert.isTrue(appCore.initialized, 'AppCore should be initialized after init()');
      this.assert.exists(appCore.eventBus, 'AppCore should have EventBus');
      this.assert.exists(appCore.stateManager, 'AppCore should have StateManager');
    });
    
    testFramework.it('should register and retrieve modules', async function() {
      const appCore = new AppCore();
      await appCore.init();
      
      const testModule = { name: 'test-module', initialized: true };
      appCore.registerModule('test', testModule);
      
      const retrieved = appCore.getModule('test');
      this.assert.equals(retrieved, testModule, 'Module should be retrieved correctly');
    });
    
    testFramework.it('should provide access to core services', async function() {
      const appCore = new AppCore();
      await appCore.init();
      
      const eventBus = appCore.getEventBus();
      const stateManager = appCore.getStateManager();
      
      this.assert.exists(eventBus, 'EventBus should be accessible');
      this.assert.exists(stateManager, 'StateManager should be accessible');
      this.assert.equals(eventBus, appCore.eventBus, 'EventBus reference should match');
      this.assert.equals(stateManager, appCore.stateManager, 'StateManager reference should match');
    });
    
  });
  
  // Validation Helper Tests
  testFramework.describe('ValidationHelpers', () => {
    
    testFramework.it('should validate character data structure', async function() {
      const validCharacter = {
        id: 'test-char-1',
        name: 'Test Character',
        color: '#ff0000',
        size: 100,
        shape: 'humanoid'
      };
      
      const invalidCharacter = {
        id: 123, // Invalid: should be string
        name: 'Test',
        color: '#ff0000'
        // Missing required fields
      };
      
      this.assert.isTrue(
        ValidationHelpers.isValidCharacter(validCharacter),
        'Valid character should pass validation'
      );
      
      this.assert.isFalse(
        ValidationHelpers.isValidCharacter(invalidCharacter),
        'Invalid character should fail validation'
      );
    });
    
    testFramework.it('should validate event payload structure', async function() {
      const validPayload = {
        type: 'test:event',
        timestamp: Date.now(),
        data: { test: 'data' }
      };
      
      const invalidPayload = {
        type: 123, // Invalid: should be string
        data: 'test'
        // Missing timestamp
      };
      
      this.assert.isTrue(
        ValidationHelpers.isValidEventPayload(validPayload),
        'Valid payload should pass validation'
      );
        this.assert.isFalse(
        ValidationHelpers.isValidEventPayload(invalidPayload),
        'Invalid payload should fail validation'
      );
    });        
    
        });
        
        // Register UI tests as well
        this.registerUITests();
    }

    /**
     * Register UI interaction tests
     */
    registerUITests() {
        const testFramework = this.testFramework;
  
        testFramework.describe('UI Components', () => {
    
    testFramework.it('should find main application container', async function() {
      this.assert.elementExists(SELECTORS.APP_CONTAINER, 'App container should exist');
    });
    
    testFramework.it('should have navigation buttons', async function() {
      const navButtons = document.querySelectorAll(SELECTORS.NAV_BUTTONS);
      this.assert.isTrue(navButtons.length > 0, 'Navigation buttons should exist');
    });
    
    testFramework.it('should have stage container', async function() {
      this.assert.elementExists(SELECTORS.STAGE_CONTAINER, 'Stage container should exist');
    });
    
    testFramework.it('should show stage controls when on stage view', async function() {
      // Switch to stage view first
      const stageTab = document.querySelector('[data-mode="stage"]');
      if (stageTab) {
        this.simulateClick('[data-mode="stage"]');
        
        // Wait for view to switch
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if stage controls are visible
        const stageControls = document.querySelector(SELECTORS.STAGE_CONTROLS);
        if (stageControls) {
          this.assert.elementVisible(SELECTORS.STAGE_CONTROLS, 'Stage controls should be visible on stage view');
        }
      }
    });
    
  });
  testFramework.describe('Character Creator Integration', () => {
    
    testFramework.it('should have character creator launch button', async function() {
      // First navigate to character view to make the button visible
      const characterNavButton = document.querySelector('[data-mode="character"]');
      this.assert.exists(characterNavButton, 'Character navigation button should exist');
      
      // Click to navigate to character view
      this.simulateClick('[data-mode="character"]');
      
      // Wait a moment for view to change, then check if element is now accessible
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Now check that the button exists and is visible
      this.assert.elementExists(SELECTORS.LAUNCH_CHARACTER_EDITOR, 'Character creator launch button should exist after navigating to character view');
      this.assert.elementVisible(SELECTORS.LAUNCH_CHARACTER_EDITOR, 'Character creator launch button should be visible');
    });
    
    testFramework.it('should open character creator when clicked', async function() {
      // Ensure we're on character view first  
      this.simulateClick('[data-mode="character"]');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock window.open to test the call
      let windowOpenCalled = false;
      let windowOpenUrl = '';
      const originalOpen = window.open;
      window.open = (url, name, features) => {
        windowOpenCalled = true;
        windowOpenUrl = url;
        return { focus: () => {} }; // Mock window object
      };
      
      // Click the launch button
      this.simulateClick(SELECTORS.LAUNCH_CHARACTER_EDITOR);
      
      // Restore original window.open
      window.open = originalOpen;
      
      this.assert.isTrue(windowOpenCalled, 'window.open should be called when launching character creator');
      this.assert.isTrue(windowOpenUrl.includes('drawing-window-demo.html'), 'Should open character creator URL');
    });
      });
}

/**
 * Register integration tests that test component interactions
 */
registerIntegrationTests() {
  const testFramework = this.testFramework;
  
  testFramework.describe('Component Integration', () => {
      testFramework.it('should emit navigation events when switching views', async function() {
      let navEventReceived = false;
      
      // Listen for navigation event
      if (window.spunkiApp && window.spunkiApp.appCore) {
        window.spunkiApp.appCore.getEventBus().on(EVENTS.NAV_TAB_CLICKED, () => {
          navEventReceived = true;
        });
        
        // Click a navigation button
        const musicTab = document.querySelector('[data-mode="music"]');
        this.assert.exists(musicTab, 'Music navigation button should exist');
        
        this.simulateClick('[data-mode="music"]');
        
        // Wait for event to be emitted with proper timeout
        await this.waitForEvent(EVENTS.NAV_TAB_CLICKED, 2000).catch(() => {
          // If waitForEvent fails, check if the flag was set directly
          return Promise.resolve();
        });
        
        this.assert.isTrue(navEventReceived, 'Navigation event should be emitted when switching views');
      } else {
        throw new Error('SpunkiApp or AppCore not available for testing');
      }
    });
    
    testFramework.it('should add characters to stage when Add Character is clicked', async function() {
      const addButton = document.querySelector(SELECTORS.ADD_CHARACTER);
      if (addButton && window.spunkiApp) {
        // Get initial character count from state
        const stateManager = window.spunkiApp.appCore.getStateManager();
        const initialCharacters = stateManager.get('projectData.characters') || [];
        const initialCount = initialCharacters.length;
        
        // Click Add Character button
        this.simulateClick(SELECTORS.ADD_CHARACTER);
        
        // Wait for character to be added
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if character count increased
        const updatedCharacters = stateManager.get('projectData.characters') || [];
        const newCount = updatedCharacters.length;
          this.assert.isTrue(newCount > initialCount, 'Character count should increase when Add Character is clicked');
      }
    });
    
  });
}
}
