// LLM Context Helper - Provides structured context for AI assistants

import { FILE_PATHS, SELECTORS, EVENTS, MODULES } from './types.js';
import { PathValidator } from './pathValidator.js';

/**
 * LLM Context Helper
 * Provides structured information to help AI assistants understand the codebase
 * and prevent common hallucinations about file paths, module names, and APIs
 * 
 * @class LLMContextHelper
 */
export class LLMContextHelper {
    /**
     * Get a comprehensive context summary for LLM consumption
     * @returns {Object} Structured context information
     */
    static getFullContext() {
        return {
            projectInfo: this.getProjectInfo(),
            architecture: this.getArchitectureInfo(),
            filePaths: this.getFilePathsInfo(),
            constants: this.getConstantsInfo(),
            conventions: this.getCodingConventions(),
            commonPatterns: this.getCommonPatterns(),
            troubleshooting: this.getTroubleshootingInfo()
        };
    }

    /**
     * Get basic project information
     * @returns {Object} Project information
     */
    static getProjectInfo() {
        return {
            name: "Open Sprunk Framework",
            type: "Vanilla JavaScript Creative Game Framework",
            architecture: "Client-side, event-driven, modular",
            dependencies: "None (pure vanilla JS)",
            testingFramework: "Custom browser-based framework",
            documentation: "MDMD (Membrane Design MarkDown)",
            mainEntry: "src/main.js",
            htmlEntry: "src/index.html"
        };
    }

    /**
     * Get architecture overview
     * @returns {Object} Architecture information
     */
    static getArchitectureInfo() {
        return {
            coreModules: [
                "AppCore - Application coordinator",
                "EventBus - Event communication system", 
                "StateManager - Global state management"
            ],
            moduleCategories: {
                core: "Application foundation (AppCore, EventBus, StateManager)",
                character: "Character creation and editing tools",
                animation: "Timeline and animation systems",
                stage: "Performance stage and rendering",
                music: "Audio engine and composition tools",
                utils: "Utilities and type definitions",
                testing: "Test framework and test suites"
            },
            communicationPattern: "Event-driven with EventBus",
            statePattern: "Centralized with StateManager",
            renderingPattern: "Canvas-based with manual rendering loops"
        };
    }

    /**
     * Get file paths information with validation
     * @returns {Object} File paths categorized by type
     */
    static getFilePathsInfo() {
        return {
            paths: FILE_PATHS,
            validation: {
                howToValidate: "Use PathValidator.validatePath(path) to check if a path exists",
                getSuggestions: "Use PathValidator.getSuggestions(invalidPath) for alternatives",
                commonMistakes: [
                    "Using wrong case in file names",
                    "Missing .js extension",
                    "Incorrect directory structure",
                    "Using Node.js paths instead of browser paths"
                ]
            }
        };
    }

    /**
     * Get constants information
     * @returns {Object} Available constants
     */
    static getConstantsInfo() {
        return {
            EVENTS: {
                description: "Event name constants to prevent typos",
                usage: "Use EVENTS.STATE_CHANGED instead of 'state:changed'",
                categories: Object.keys(EVENTS)
            },
            SELECTORS: {
                description: "DOM selector constants",
                usage: "Use SELECTORS.STAGE_CANVAS instead of '#stage-canvas'",
                available: Object.keys(SELECTORS)
            },
            MODULES: {
                description: "Module name constants",
                usage: "Use MODULES.CHARACTER_EDITOR instead of 'character'",
                available: Object.keys(MODULES)
            },
            FILE_PATHS: {
                description: "File path constants organized by category",
                usage: "Use FILE_PATHS.CORE.APP_CORE instead of hardcoded paths",
                categories: Object.keys(FILE_PATHS)
            }
        };
    }

    /**
     * Get coding conventions
     * @returns {Object} Coding standards and conventions
     */
    static getCodingConventions() {
        return {
            fileNaming: {
                classes: "PascalCase (e.g., EventBus.js, StateManager.js)",
                utilities: "camelCase (e.g., pathValidator.js, types.js)",
                tests: "PascalCase with 'Tests' suffix (e.g., CoreTests.js)",
                html: "kebab-case (e.g., drawing-window-demo.html)"
            },
            classNaming: {
                classes: "PascalCase (e.g., class EventBus)",
                methods: "camelCase (e.g., emit(), setState())",
                constants: "SCREAMING_SNAKE_CASE (e.g., FILE_PATHS, EVENTS)"
            },
            imports: {
                pattern: "ES6 modules with .js extension",
                example: "import { EventBus } from './core/EventBus.js'",
                noNodeJS: "No require() or Node.js specific imports"
            },
            documentation: {
                standard: "JSDoc with type annotations",
                types: "Use @typedef imports from types.js",
                examples: "Include @example blocks for complex methods"
            }
        };
    }

    /**
     * Get common code patterns used in the project
     * @returns {Object} Common patterns and their usage
     */
    static getCommonPatterns() {
        return {
            eventEmission: {
                pattern: "eventBus.emit('event:name', data)",
                listening: "eventBus.on('event:name', callback)",
                wildcards: "eventBus.on('module:*', callback) for all module events"
            },
            stateManagement: {
                get: "stateManager.get('path.to.property')",
                set: "stateManager.set('path.to.property', value)",
                listen: "eventBus.on('state:changed', callback)"
            },
            moduleLinking: {
                registration: "appCore.registerModule(name, moduleInstance)",
                communication: "Modules communicate through EventBus",
                initialization: "async init() method pattern"
            },
            canvasRendering: {
                pattern: "Manual render loops with requestAnimationFrame",
                clearing: "ctx.clearRect(0, 0, width, height)",
                coordination: "Use TemporalCoordinator for timing"
            },
            errorHandling: {
                pattern: "try/catch with console logging",
                userFeedback: "showNotification() for user-visible errors",
                validation: "Use ValidationHelpers for common checks"
            }
        };
    }

    /**
     * Get troubleshooting information
     * @returns {Object} Common issues and solutions
     */
    static getTroubleshootingInfo() {
        return {
            commonIssues: {
                "Module not found": {
                    cause: "Incorrect import path",
                    solution: "Validate path with PathValidator, check FILE_PATHS constants"
                },
                "Event not firing": {
                    cause: "Typo in event name or listener not registered",
                    solution: "Use EVENTS constants, check EventBus registration"
                },
                "State not updating": {
                    cause: "Direct state mutation instead of using StateManager",
                    solution: "Use stateManager.set() instead of direct assignment"
                },
                "Canvas not rendering": {
                    cause: "Missing render loop or incorrect canvas context",
                    solution: "Check canvas initialization and render loop setup"
                },
                "Tests not running": {
                    cause: "TestFramework not initialized or tests not registered",
                    solution: "Check development mode detection and test registration"
                }
            },
            debuggingTools: {
                console: "All modules log to console with [ModuleName] prefix",
                state: "Use stateManager.getState() to inspect current state",
                events: "EventBus logs all emissions in development mode",
                paths: "Use PathValidator.logAvailablePaths() to see all paths",
                tests: "TestFramework provides detailed test results in browser"
            }
        };
    }

    /**
     * Generate a context summary string for LLM consumption
     * @param {string[]} sections - Sections to include in summary
     * @returns {string} Formatted context summary
     */
    static generateContextSummary(sections = ['projectInfo', 'filePaths', 'constants', 'commonPatterns']) {
        const context = this.getFullContext();
        let summary = "# Open Sprunk Framework - LLM Context\n\n";
        
        sections.forEach(section => {
            if (context[section]) {
                summary += `## ${section.charAt(0).toUpperCase() + section.slice(1)}\n`;
                summary += this.formatObjectAsMarkdown(context[section], 2);
                summary += "\n";
            }
        });
        
        return summary;
    }

    /**
     * Format an object as markdown
     * @param {Object} obj - Object to format
     * @param {number} depth - Current depth for indentation
     * @returns {string} Formatted markdown
     */
    static formatObjectAsMarkdown(obj, depth = 0) {
        let result = "";
        const indent = "  ".repeat(depth);
        
        Object.entries(obj).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                result += `${indent}- **${key}**:\n`;
                result += this.formatObjectAsMarkdown(value, depth + 1);
            } else if (Array.isArray(value)) {
                result += `${indent}- **${key}**: ${value.join(', ')}\n`;
            } else {
                result += `${indent}- **${key}**: ${value}\n`;
            }
        });
        
        return result;
    }

    /**
     * Log context to console for debugging
     */
    static logContext() {
        console.group('🤖 LLM Context Helper');
        const context = this.getFullContext();
        Object.entries(context).forEach(([section, data]) => {
            console.group(`📋 ${section}`);
            console.log(data);
            console.groupEnd();
        });
        console.groupEnd();
    }

    /**
     * Validate common LLM assumptions and provide corrections
     * @param {Object} assumptions - Object containing assumed values
     * @returns {Object} Validation results with corrections
     */
    static validateAssumptions(assumptions) {
        const results = {
            valid: [],
            invalid: [],
            corrections: {}
        };

        Object.entries(assumptions).forEach(([key, value]) => {
            switch (key) {
                case 'filePath':
                    const pathValidation = PathValidator.validateWithFeedback(value);
                    if (pathValidation.isValid) {
                        results.valid.push(`${key}: ${value}`);
                    } else {
                        results.invalid.push(`${key}: ${value}`);
                        results.corrections[key] = pathValidation.suggestions;
                    }
                    break;
                case 'eventName':
                    const allEvents = Object.values(EVENTS).flat();
                    if (allEvents.includes(value)) {
                        results.valid.push(`${key}: ${value}`);
                    } else {
                        results.invalid.push(`${key}: ${value}`);
                        results.corrections[key] = allEvents.filter(e => 
                            e.toLowerCase().includes(value.toLowerCase())
                        );
                    }
                    break;
                case 'selector':
                    const allSelectors = Object.values(SELECTORS);
                    if (allSelectors.includes(value)) {
                        results.valid.push(`${key}: ${value}`);
                    } else {
                        results.invalid.push(`${key}: ${value}`);
                        results.corrections[key] = allSelectors.filter(s => 
                            s.toLowerCase().includes(value.toLowerCase())
                        );
                    }
                    break;
                default:
                    results.valid.push(`${key}: ${value} (not validated)`);
            }
        });

        return results;
    }
}

// Development mode helpers
if (typeof window !== 'undefined') {
    // Make LLMContextHelper available globally in development
    window.LLMContextHelper = LLMContextHelper;
    
    // Add development shortcuts
    window.showContext = LLMContextHelper.logContext.bind(LLMContextHelper);
    window.validateAssumptions = LLMContextHelper.validateAssumptions.bind(LLMContextHelper);
    window.getContext = LLMContextHelper.getFullContext.bind(LLMContextHelper);
}
