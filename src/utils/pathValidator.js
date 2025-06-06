// Path validation utilities to prevent LLM hallucinations

import { FILE_PATHS } from './types.js';

/**
 * Path validation and autocomplete utilities
 * Helps prevent common path-related errors and provides development-time validation
 * 
 * @class PathValidator
 */
export class PathValidator {
    /**
     * Validate that a file path exists in the project structure
     * @param {string} filePath - The file path to validate
     * @returns {boolean} True if path exists in FILE_PATHS constants
     */
    static validatePath(filePath) {
        // Normalize the path for comparison
        const normalizedPath = filePath.replace(/\\/g, '/');
        
        // Check against known paths
        const allPaths = Object.values(FILE_PATHS).flat();
        return allPaths.some(path => 
            path.replace(/\\/g, '/').includes(normalizedPath) ||
            normalizedPath.includes(path.replace(/\\/g, '/'))
        );
    }

    /**
     * Get suggestions for similar paths when validation fails
     * @param {string} filePath - The invalid file path
     * @returns {string[]} Array of suggested paths
     */
    static getSuggestions(filePath) {
        const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();
        const allPaths = Object.values(FILE_PATHS).flat();
        
        return allPaths
            .filter(path => {
                const normalizedKnownPath = path.replace(/\\/g, '/').toLowerCase();
                return this.calculateSimilarity(normalizedPath, normalizedKnownPath) > 0.3;
            })
            .sort((a, b) => {
                const simA = this.calculateSimilarity(normalizedPath, a.replace(/\\/g, '/').toLowerCase());
                const simB = this.calculateSimilarity(normalizedPath, b.replace(/\\/g, '/').toLowerCase());
                return simB - simA;
            })
            .slice(0, 5);
    }

    /**
     * Calculate similarity between two strings using Levenshtein distance
     * @param {string} str1 - First string
     * @param {string} str2 - Second string
     * @returns {number} Similarity score between 0 and 1
     */
    static calculateSimilarity(str1, str2) {
        const maxLength = Math.max(str1.length, str2.length);
        if (maxLength === 0) return 1;
        
        const distance = this.levenshteinDistance(str1, str2);
        return (maxLength - distance) / maxLength;
    }

    /**
     * Calculate Levenshtein distance between two strings
     * @param {string} str1 - First string
     * @param {string} str2 - Second string
     * @returns {number} Edit distance
     */
    static levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    /**
     * Get all available paths categorized by type
     * @returns {Object} Object with categorized paths
     */
    static getAllPaths() {
        return FILE_PATHS;
    }

    /**
     * Validate and provide feedback for a file path
     * @param {string} filePath - The file path to validate
     * @returns {Object} Validation result with isValid, suggestions, and message
     */
    static validateWithFeedback(filePath) {
        const isValid = this.validatePath(filePath);
        
        if (isValid) {
            return {
                isValid: true,
                message: `✅ Path validated: ${filePath}`,
                suggestions: []
            };
        } else {
            const suggestions = this.getSuggestions(filePath);
            return {
                isValid: false,
                message: `❌ Path not found: ${filePath}`,
                suggestions: suggestions.length > 0 ? suggestions : ['No similar paths found']
            };
        }
    }    /**
     * Development helper: Log all available paths to console
     * Useful for LLMs to understand the project structure
     */
    static logAvailablePaths() {
        console.group('📁 Available File Paths');
        
        // Group paths by module type for better organization
        const pathsByCategory = {};
        Object.entries(FILE_PATHS).forEach(([key, path]) => {
            const category = key.split('_')[0]; // Get first part (APP, EVENT, STATE, etc.)
            if (!pathsByCategory[category]) {
                pathsByCategory[category] = [];
            }
            pathsByCategory[category].push(`${key}: ${path}`);
        });
        
        // Log organized by category
        Object.entries(pathsByCategory).forEach(([category, paths]) => {
            console.group(`${category}:`);
            paths.forEach(path => console.log(`  ${path}`));
            console.groupEnd();
        });
        
        console.groupEnd();
    }

    /**
     * Development helper: Validate a batch of paths
     * @param {string[]} paths - Array of paths to validate
     * @returns {Object} Validation results
     */
    static validateBatch(paths) {
        const results = {
            valid: [],
            invalid: [],
            suggestions: {}
        };
        
        paths.forEach(path => {
            const result = this.validateWithFeedback(path);
            if (result.isValid) {
                results.valid.push(path);
            } else {
                results.invalid.push(path);
                results.suggestions[path] = result.suggestions;
            }
        });
        
        return results;
    }
}

// Development mode helpers
if (typeof window !== 'undefined') {
    // Make PathValidator available globally in development
    window.PathValidator = PathValidator;
    
    // Add development shortcuts
    window.validatePath = PathValidator.validatePath.bind(PathValidator);
    window.suggestPaths = PathValidator.getSuggestions.bind(PathValidator);
    window.showPaths = PathValidator.logAvailablePaths.bind(PathValidator);
}
