/**
 * EventBus - Decoupled communication system for application modules
 * Supports both specific events and wildcard pattern matching
 */
export class EventBus {
    constructor() {
        this.events = new Map();
        this.wildcardListeners = new Map();
        this.debugMode = false;
    }

    /**
     * Subscribe to events
     * @param {string} eventName - Event name or pattern (supports wildcards like 'data:*')
     * @param {function} callback - Function to call when event is emitted
     */
    on(eventName, callback) {
        if (eventName.includes('*')) {
            // Handle wildcard events (e.g., 'data:*', 'error:*')
            const pattern = eventName.replace('*', '.*');
            const regex = new RegExp(`^${pattern}$`);
            
            if (!this.wildcardListeners.has(regex.source)) {
                this.wildcardListeners.set(regex.source, { regex, callbacks: [] });
            }
            this.wildcardListeners.get(regex.source).callbacks.push(callback);
        } else {
            // Handle specific events
            if (!this.events.has(eventName)) {
                this.events.set(eventName, []);
            }
            this.events.get(eventName).push(callback);
        }

        if (this.debugMode) {
            console.log(`[EventBus] Registered listener for: ${eventName}`);
        }
    }

    /**
     * Unsubscribe from events
     * @param {string} eventName - Event name or pattern
     * @param {function} callback - Function to remove
     */
    off(eventName, callback) {
        if (eventName.includes('*')) {
            const pattern = eventName.replace('*', '.*');
            const wildcard = this.wildcardListeners.get(pattern);
            if (wildcard) {
                const index = wildcard.callbacks.indexOf(callback);
                if (index > -1) {
                    wildcard.callbacks.splice(index, 1);
                }
            }
        } else {
            const listeners = this.events.get(eventName);
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        }
    }

    /**
     * Emit an event to all subscribers
     * @param {string} eventName - Event name
     * @param {...any} args - Arguments to pass to listeners
     */
    emit(eventName, ...args) {
        if (this.debugMode) {
            console.log(`[EventBus] Emitting: ${eventName}`, args);
        }

        // Call specific event listeners
        const listeners = this.events.get(eventName);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`[EventBus] Error in listener for ${eventName}:`, error);
                }
            });
        }

        // Call wildcard listeners that match
        this.wildcardListeners.forEach(({ regex, callbacks }) => {
            if (regex.test(eventName)) {
                callbacks.forEach(callback => {
                    try {
                        callback(...args);
                    } catch (error) {
                        console.error(`[EventBus] Error in wildcard listener for ${eventName}:`, error);
                    }
                });
            }
        });
    }

    /**
     * Subscribe to an event for one-time execution
     * @param {string} eventName - Event name
     * @param {function} callback - Function to call once
     */
    once(eventName, callback) {
        const onceWrapper = (...args) => {
            this.off(eventName, onceWrapper);
            callback(...args);
        };
        this.on(eventName, onceWrapper);
    }

    /**
     * Enable or disable debug logging
     * @param {boolean} enabled - Whether to enable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[EventBus] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Get all registered event names (for debugging)
     * @returns {Array<string>} Array of event names
     */
    getRegisteredEvents() {
        const specific = Array.from(this.events.keys());
        const wildcards = Array.from(this.wildcardListeners.keys());
        return { specific, wildcards };
    }

    /**
     * Clear all event listeners
     */
    clear() {
        this.events.clear();
        this.wildcardListeners.clear();
        if (this.debugMode) {
            console.log('[EventBus] All listeners cleared');
        }
    }
}
