// Integration tests for new testability and LLM assistance features

import { PathValidator } from '../utils/pathValidator.js';
import { LLMContextHelper } from '../utils/llmContextHelper.js';
import { ValidationHelpers } from '../utils/types.js';

/**
 * Integration Tests for Testability and LLM Assistance Features
 * Tests the new utilities added to improve development experience
 */
export class IntegrationTests {
    constructor() {
        this.testSuite = {
            name: 'Integration Tests',
            tests: []
        };
    }

    async init() {
        console.log('[IntegrationTests] Initializing integration tests...');
        this.registerTests();
    }

    registerTests() {
        // Path Validator tests
        this.testSuite.tests.push({
            name: 'PathValidator can validate existing paths',
            test: () => {
                const validPath = 'src/core/AppCore.js';
                const isValid = PathValidator.validatePath(validPath);
                return isValid === true;
            }
        });

        this.testSuite.tests.push({
            name: 'PathValidator suggests corrections for invalid paths',
            test: () => {
                const invalidPath = 'src/core/AppCor.js'; // Missing 'e'
                const suggestions = PathValidator.getSuggestions(invalidPath);
                return suggestions.length > 0 && 
                       suggestions.some(s => s.includes('AppCore.js'));
            }
        });

        this.testSuite.tests.push({
            name: 'PathValidator provides comprehensive feedback',
            test: () => {
                const result = PathValidator.validateWithFeedback('src/core/EventBus.js');
                return result.isValid === true && 
                       result.message.includes('✅');
            }
        });

        // LLM Context Helper tests
        this.testSuite.tests.push({
            name: 'LLMContextHelper provides full context',
            test: () => {
                const context = LLMContextHelper.getFullContext();
                return context.projectInfo && 
                       context.architecture && 
                       context.filePaths && 
                       context.constants;
            }
        });

        this.testSuite.tests.push({
            name: 'LLMContextHelper validates assumptions correctly',
            test: () => {
                const assumptions = {
                    filePath: 'src/core/StateManager.js',
                    eventName: 'state:changed'
                };
                const validation = LLMContextHelper.validateAssumptions(assumptions);
                return validation.valid.length > 0;
            }
        });

        this.testSuite.tests.push({
            name: 'LLMContextHelper generates context summary',
            test: () => {
                const summary = LLMContextHelper.generateContextSummary(['projectInfo']);
                return typeof summary === 'string' && 
                       summary.includes('Open Sprunk Framework');
            }
        });

        // Validation Helpers tests
        this.testSuite.tests.push({
            name: 'ValidationHelpers validates objects correctly',
            test: () => {
                const validObj = { id: 'test', name: 'Test Object' };
                const isValid = ValidationHelpers.isValidObject(validObj);
                return isValid === true;
            }
        });

        this.testSuite.tests.push({
            name: 'ValidationHelpers validates arrays',
            test: () => {
                const validArray = [1, 2, 3];
                const isValid = ValidationHelpers.isValidArray(validArray);
                return isValid === true;
            }
        });

        this.testSuite.tests.push({
            name: 'ValidationHelpers validates strings',
            test: () => {
                const validString = 'test string';
                const isValid = ValidationHelpers.isValidString(validString);
                return isValid === true;
            }
        });

        // Constants availability tests
        this.testSuite.tests.push({
            name: 'FILE_PATHS constants are available',
            test: () => {
                const paths = PathValidator.getAllPaths();
                return paths && 
                       paths.CORE && 
                       paths.CORE.includes('src/core/AppCore.js');
            }
        });

        // Development mode integration tests
        this.testSuite.tests.push({
            name: 'Development utilities are globally available',
            test: () => {
                return typeof window !== 'undefined' && 
                       typeof window.PathValidator !== 'undefined' &&
                       typeof window.LLMContextHelper !== 'undefined';
            }
        });

        // Context coherence tests
        this.testSuite.tests.push({
            name: 'Context information is coherent across utilities',
            test: () => {
                const context = LLMContextHelper.getFullContext();
                const paths = PathValidator.getAllPaths();
                
                // Check that context mentions the same paths as PathValidator
                return context.projectInfo.mainEntry === 'src/main.js' &&
                       paths.CORE.includes('src/main.js');
            }
        });
    }

    async runTests() {
        console.group('[IntegrationTests] Running integration tests...');
        
        const results = {
            passed: 0,
            failed: 0,
            total: this.testSuite.tests.length,
            failures: []
        };

        for (const testCase of this.testSuite.tests) {
            try {
                const result = await testCase.test();
                if (result === true) {
                    results.passed++;
                    console.log(`✅ ${testCase.name}`);
                } else {
                    results.failed++;
                    results.failures.push(testCase.name);
                    console.log(`❌ ${testCase.name} - Test returned false`);
                }
            } catch (error) {
                results.failed++;
                results.failures.push(testCase.name);
                console.log(`❌ ${testCase.name} - Error: ${error.message}`);
            }
        }

        console.groupEnd();
        
        console.log(`[IntegrationTests] Results: ${results.passed}/${results.total} passed`);
        if (results.failures.length > 0) {
            console.log('[IntegrationTests] Failed tests:', results.failures);
        }

        return results;
    }

    getTestSuite() {
        return this.testSuite;
    }
}
