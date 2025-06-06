/**
 * Lightweight testing framework for vanilla JavaScript
 * Designed to work in browser environment without external dependencies
 * 
 * @fileoverview Browser-based testing framework for Open Sprunk Framework
 * @module TestFramework
 */

import { EVENTS, SELECTORS } from '../utils/types.js';

/**
 * Test Framework - Lightweight browser-based testing
 * Provides test registration, execution, and reporting without external dependencies
 * 
 * @class TestFramework
 */
export class TestFramework {
  /**
   * Create a TestFramework instance
   * @param {EventBus} eventBus - Application event bus
   * @param {ConsoleLogger} logger - Console logger instance
   */
  constructor(eventBus, logger) {
    this.eventBus = eventBus;
    this.logger = logger;
    this.tests = new Map();
    this.suites = new Map();
    this.results = [];
    this.isRunning = false;
    this.currentSuite = null;
    
    this._setupTestUI();
  }

  /**
   * Register a test suite
   * @param {string} suiteName - Name of test suite
   * @param {function} testFunction - Function containing test definitions
   */
  describe(suiteName, testFunction) {
    this.currentSuite = suiteName;
    if (!this.suites.has(suiteName)) {
      this.suites.set(suiteName, []);
    }
    
    // Execute the test function to register individual tests
    testFunction();
    this.currentSuite = null;
  }

  /**
   * Register individual test
   * @param {string} testName - Name of the test
   * @param {function} testFunction - Test implementation
   */
  it(testName, testFunction) {
    const fullTestName = this.currentSuite ? `${this.currentSuite}: ${testName}` : testName;
    this.tests.set(fullTestName, {
      name: fullTestName,
      suite: this.currentSuite,
      testFunction,
      timeout: 5000 // Default 5 second timeout
    });
    
    if (this.currentSuite) {
      this.suites.get(this.currentSuite).push(fullTestName);
    }
  }

  /**
   * Run all registered tests
   * @returns {Promise<Object>} Test results summary
   */
  async runAll() {
    if (this.isRunning) {
      throw new Error('Tests are already running');
    }

    this.isRunning = true;
    this.results = [];
    const startTime = performance.now();    console.log(`🧪 Running ${this.tests.size} tests...`);
    this._updateTestUI('running', `Running ${this.tests.size} tests...`);
    
    // Clear previous results and disable copy button while tests are running
    const resultsElement = document.getElementById('test-results');
    if (resultsElement) {
      resultsElement.innerHTML = '';
    }
    const copyButton = document.getElementById('copy-results');
    if (copyButton) {
      copyButton.disabled = true;
      copyButton.title = 'Run tests first to copy results';
    }
    
    // Disable run button while tests are running
    const runButton = document.getElementById('run-tests');
    if (runButton) {
      runButton.disabled = true;
      runButton.style.opacity = '0.6';
      runButton.innerHTML = 'Running...';
    }

    for (const [testName, testInfo] of this.tests) {
      const result = await this._runSingleTest(testInfo);
      this.results.push(result);
      this._updateTestProgress(result);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.length - passed;

    const summary = {
      total: this.results.length,
      passed,
      failed,
      duration: Math.round(duration),
      results: this.results
    };

    this.isRunning = false;
    this._displayResults(summary);
    
    return summary;
  }

  /**
   * Run a single test with timeout and error handling
   * @private
   * @param {Object} testInfo - Test information object
   * @returns {Promise<Object>} Test result
   */
  async _runSingleTest(testInfo) {
    const startTime = performance.now();
    
    try {
      // Create test context with assert methods
      const testContext = this._createTestContext();
      
      // Run test with timeout
      await Promise.race([
        testInfo.testFunction.call(testContext),
        this._timeout(testInfo.timeout)
      ]);
      
      const duration = Math.round(performance.now() - startTime);
      return {
        testName: testInfo.name,
        passed: true,
        duration,
        suite: testInfo.suite
      };
      
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      return {
        testName: testInfo.name,
        passed: false,
        error: error.message,
        duration,
        suite: testInfo.suite
      };
    }
  }

  /**
   * Create test context with assertion methods
   * @private
   * @returns {Object} Test context object
   */
  _createTestContext() {
    return {
      assert: this.assert,
      eventBus: this.eventBus,
      logger: this.logger,
      
      // Helper methods for common test scenarios
      waitForEvent: (eventName, timeout = 1000) => {
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            reject(new Error(`Event '${eventName}' not received within ${timeout}ms`));
          }, timeout);
          
          this.eventBus.on(eventName, (data) => {
            clearTimeout(timer);
            resolve(data);
          });
        });
      },
      
      waitForElement: (selector, timeout = 1000) => {
        return new Promise((resolve, reject) => {
          const element = document.querySelector(selector);
          if (element) {
            resolve(element);
            return;
          }
          
          const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
              observer.disconnect();
              resolve(element);
            }
          });
          
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
          
          setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element '${selector}' not found within ${timeout}ms`));
          }, timeout);
        });
      },
      
      simulateClick: (selector) => {
        const element = document.querySelector(selector);
        if (!element) {
          throw new Error(`Element '${selector}' not found for click simulation`);
        }
        element.click();
      },
      
      simulateKeypress: (selector, key) => {
        const element = document.querySelector(selector);
        if (!element) {
          throw new Error(`Element '${selector}' not found for keypress simulation`);
        }
        const event = new KeyboardEvent('keydown', { key });
        element.dispatchEvent(event);
      }
    };
  }

  /**
   * Promise that rejects after specified timeout
   * @private
   * @param {number} ms - Timeout in milliseconds
   * @returns {Promise} Promise that rejects on timeout
   */
  _timeout(ms) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Test timed out after ${ms}ms`)), ms);
    });
  }

  /**
   * Set up test UI panel
   * @private
   */
  _setupTestUI() {
    const testPanel = document.createElement('div');
    testPanel.id = 'test-panel';
    testPanel.style.cssText = `
      position: fixed;
      bottom: 10px;
      left: 10px;
      width: 300px;
      max-height: 400px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 5px;
      z-index: 9999;
      overflow-y: auto;
      display: none;
    `;
      testPanel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <strong>🧪 Test Framework</strong>
        <div>
          <button id="run-tests" style="background: #4CAF50; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer;">Run Tests</button>
          <button id="copy-results" style="background: #2196F3; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; margin-left: 5px;" disabled title="Copy test results">📋</button>
          <button id="close-tests" style="background: #f44336; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; margin-left: 5px;">✕</button>
        </div>
      </div>
      <div id="test-status">Ready to run tests</div>
      <div id="test-results"></div>
    `;
    
    document.body.appendChild(testPanel);
    
    // Toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.innerHTML = '🧪 Tests';
    toggleBtn.style.cssText = `
      position: fixed;
      bottom: 10px;
      left: 10px;
      background: #333;
      color: white;
      border: none;
      padding: 8px 12px;
      cursor: pointer;
      border-radius: 5px;
      z-index: 10000;
      font-size: 12px;
    `;
    
    toggleBtn.onclick = () => {
      const isVisible = testPanel.style.display !== 'none';
      testPanel.style.display = isVisible ? 'none' : 'block';
      toggleBtn.style.display = isVisible ? 'block' : 'none';
    };
    
    document.body.appendChild(toggleBtn);    // Event handlers
    document.getElementById('run-tests').onclick = async () => {
      try {
        await this.runAll();
      } catch (error) {
        if (error.message === 'Tests are already running') {
          console.warn('🧪 Tests are already running, please wait...');
        } else {
          console.error('🧪 Test run failed:', error);
        }
      }
    };
    document.getElementById('copy-results').onclick = () => this._copyResults();
    document.getElementById('close-tests').onclick = () => {
      testPanel.style.display = 'none';
      toggleBtn.style.display = 'block';
    };
  }

  /**
   * Update test UI with current status
   * @private
   * @param {string} status - Current status
   * @param {string} message - Status message
   */
  _updateTestUI(status, message) {
    const statusElement = document.getElementById('test-status');
    if (statusElement) {
      statusElement.innerHTML = `<div style="color: ${status === 'running' ? '#FFA500' : status === 'complete' ? '#4CAF50' : '#f44336'}">${message}</div>`;
    }
  }

  /**
   * Update test progress in UI
   * @private
   * @param {Object} result - Test result
   */
  _updateTestProgress(result) {
    const color = result.passed ? '#4CAF50' : '#f44336';
    const symbol = result.passed ? '✓' : '✗';
    const message = `${symbol} ${result.testName} (${result.duration}ms)`;
    
    const resultsElement = document.getElementById('test-results');
    if (resultsElement) {
      resultsElement.innerHTML += `<div style="color: ${color}; margin: 2px 0;">${message}</div>`;
    }
  }
  /**
   * Display final test results
   * @private
   * @param {Object} summary - Test results summary
   */  _displayResults(summary) {
    const status = summary.failed === 0 ? 'complete' : 'failed';
    const message = `Tests complete: ${summary.passed}/${summary.total} passed (${summary.duration}ms)`;
    this._updateTestUI(status, message);
    
    // Re-enable run button after tests complete
    const runButton = document.getElementById('run-tests');
    if (runButton) {
      runButton.disabled = false;
      runButton.style.opacity = '1';
      runButton.innerHTML = 'Run Tests';
    }
    
    // Enable copy button after tests complete
    const copyButton = document.getElementById('copy-results');
    if (copyButton) {
      copyButton.disabled = false;
      copyButton.title = 'Copy test results to clipboard';
    }
    
    console.log(`🧪 Test Results: ${summary.passed}/${summary.total} passed in ${summary.duration}ms`);
    if (summary.failed > 0) {
      console.error(`❌ ${summary.failed} tests failed`);
    }
  }

  /**
   * Copy test results to clipboard
   * @private
   */
  async _copyResults() {
    if (this.results.length === 0) {
      this._showCopyFeedback('No test results available', 'error');
      return;
    }

    try {
      const formattedResults = this._formatResultsForCopy();
      await navigator.clipboard.writeText(formattedResults);
      this._showCopyFeedback('Test results copied to clipboard!', 'success');
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      try {
        this._fallbackCopy(this._formatResultsForCopy());
        this._showCopyFeedback('Test results copied to clipboard!', 'success');
      } catch (fallbackError) {
        console.error('Failed to copy results:', fallbackError);
        this._showCopyFeedback('Failed to copy results', 'error');
      }
    }
  }

  /**
   * Format test results for copying
   * @private
   * @returns {string} Formatted test results
   */
  _formatResultsForCopy() {
    const timestamp = new Date().toISOString();
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.length - passed;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    let output = `# Open Sprunk Framework - Test Results\n`;
    output += `**Timestamp:** ${timestamp}\n`;
    output += `**Summary:** ${passed}/${this.results.length} tests passed\n`;
    output += `**Total Duration:** ${totalDuration}ms\n\n`;

    if (failed > 0) {
      output += `## ❌ Failed Tests (${failed})\n`;
      this.results.filter(r => !r.passed).forEach(result => {
        output += `- **${result.testName}** (${result.duration}ms)\n`;
        if (result.error) {
          output += `  - Error: ${result.error}\n`;
        }
      });
      output += `\n`;
    }

    output += `## ✅ Passed Tests (${passed})\n`;
    this.results.filter(r => r.passed).forEach(result => {
      output += `- **${result.testName}** (${result.duration}ms)\n`;
    });

    // Group by suite if available
    const suiteMap = new Map();
    this.results.forEach(result => {
      if (result.suite) {
        if (!suiteMap.has(result.suite)) {
          suiteMap.set(result.suite, { passed: 0, failed: 0, tests: [] });
        }
        const suite = suiteMap.get(result.suite);
        if (result.passed) {
          suite.passed++;
        } else {
          suite.failed++;
        }
        suite.tests.push(result);
      }
    });

    if (suiteMap.size > 0) {
      output += `\n## 📊 Results by Test Suite\n`;
      for (const [suiteName, suiteData] of suiteMap) {
        output += `### ${suiteName}\n`;
        output += `- Passed: ${suiteData.passed}/${suiteData.tests.length}\n`;
        if (suiteData.failed > 0) {
          output += `- Failed: ${suiteData.failed}\n`;
        }
      }
    }

    return output;
  }

  /**
   * Fallback copy method for browsers without clipboard API
   * @private
   * @param {string} text - Text to copy
   */
  _fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }

  /**
   * Show copy feedback to user
   * @private
   * @param {string} message - Feedback message
   * @param {string} type - Type of feedback ('success' or 'error')
   */
  _showCopyFeedback(message, type) {
    const copyButton = document.getElementById('copy-results');
    if (!copyButton) return;

    const originalText = copyButton.innerHTML;
    const originalColor = copyButton.style.backgroundColor;
    
    copyButton.innerHTML = type === 'success' ? '✓' : '✗';
    copyButton.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
    copyButton.title = message;
    
    setTimeout(() => {
      copyButton.innerHTML = originalText;
      copyButton.style.backgroundColor = originalColor;
      copyButton.title = 'Copy test results to clipboard';
    }, 2000);
  }

  /**
   * Assertion methods for common test patterns
   */
  assert = {
    /**
     * Assert two values are equal
     * @param {*} actual - Actual value
     * @param {*} expected - Expected value
     * @param {string} message - Optional error message
     */
    equals: (actual, expected, message = '') => {
      if (actual !== expected) {
        throw new Error(`${message} Expected '${expected}', got '${actual}'`);
      }
    },

    /**
     * Assert two values are not equal
     * @param {*} actual - Actual value
     * @param {*} expected - Expected value
     * @param {string} message - Optional error message
     */
    notEquals: (actual, expected, message = '') => {
      if (actual === expected) {
        throw new Error(`${message} Expected values to be different, both were '${actual}'`);
      }
    },

    /**
     * Assert value is truthy
     * @param {*} value - Value to test
     * @param {string} message - Optional error message
     */
    isTrue: (value, message = '') => {
      if (!value) {
        throw new Error(`${message} Expected truthy value, got '${value}'`);
      }
    },

    /**
     * Assert value is falsy
     * @param {*} value - Value to test
     * @param {string} message - Optional error message
     */
    isFalse: (value, message = '') => {
      if (value) {
        throw new Error(`${message} Expected falsy value, got '${value}'`);
      }
    },

    /**
     * Assert value exists (not null/undefined)
     * @param {*} value - Value to test
     * @param {string} message - Optional error message
     */
    exists: (value, message = '') => {
      if (value == null) {
        throw new Error(`${message} Expected value to exist, got '${value}'`);
      }
    },

    /**
     * Assert DOM element exists
     * @param {string} selector - CSS selector
     * @param {string} message - Optional error message
     */
    elementExists: (selector, message = '') => {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`${message} Element '${selector}' not found in DOM`);
      }
    },

    /**
     * Assert element has specific text content
     * @param {string} selector - CSS selector
     * @param {string} expectedText - Expected text content
     * @param {string} message - Optional error message
     */
    elementHasText: (selector, expectedText, message = '') => {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`${message} Element '${selector}' not found in DOM`);
      }
      if (element.textContent.trim() !== expectedText) {
        throw new Error(`${message} Element '${selector}' has text '${element.textContent.trim()}', expected '${expectedText}'`);
      }
    },

    /**
     * Assert element is visible
     * @param {string} selector - CSS selector
     * @param {string} message - Optional error message
     */
    elementVisible: (selector, message = '') => {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`${message} Element '${selector}' not found in DOM`);
      }
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        throw new Error(`${message} Element '${selector}' is not visible`);
      }
    }
  };
}
