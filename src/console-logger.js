// Console Logger for GitHub Copilot debugging
// This module captures console output in a format easy to copy/paste

class ConsoleLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 100;
        this.setupInterception();
        this.createUI();
    }

    setupInterception() {
        // Store original console methods
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;

        // Intercept console methods
        console.log = (...args) => {
            this.addLog('LOG', args);
            originalLog.apply(console, args);
        };

        console.error = (...args) => {
            this.addLog('ERROR', args);
            originalError.apply(console, args);
        };

        console.warn = (...args) => {
            this.addLog('WARN', args);
            originalWarn.apply(console, args);
        };

        console.info = (...args) => {
            this.addLog('INFO', args);
            originalInfo.apply(console, args);
        };

        // Capture uncaught errors
        window.addEventListener('error', (event) => {
            this.addLog('UNCAUGHT_ERROR', [`${event.error?.name || 'Error'}: ${event.error?.message || event.message}`, `at ${event.filename}:${event.lineno}:${event.colno}`]);
        });

        // Capture unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.addLog('UNHANDLED_REJECTION', [`Unhandled Promise Rejection: ${event.reason}`]);
        });
    }

    addLog(level, args) {
        const timestamp = new Date().toISOString();
        const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        
        this.logs.push({ timestamp, level, message });
        
        // Keep only recent logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        this.updateUI();
    }

    createUI() {
        // Create floating debug panel
        const panel = document.createElement('div');
        panel.id = 'console-logger-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 350px;
            max-width: 25vw;
            max-height: 300px;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff00;
            font-family: monospace;
            font-size: 11px;
            padding: 8px;
            border-radius: 5px;
            z-index: 10000;
            overflow: hidden;
            display: none;
        `;

        const header = document.createElement('div');
        header.innerHTML = `
            <strong>Console Logger</strong>
            <button id="toggle-logger" style="float: right; background: #333; color: white; border: none; padding: 2px 6px; cursor: pointer;">Hide</button>
            <button id="copy-logs" style="float: right; margin-right: 5px; background: #333; color: white; border: none; padding: 2px 6px; cursor: pointer;">Copy</button>
            <button id="clear-logs" style="float: right; margin-right: 5px; background: #333; color: white; border: none; padding: 2px 6px; cursor: pointer;">Clear</button>
        `;

        const content = document.createElement('div');
        content.id = 'console-logger-content';
        content.style.cssText = `
            max-height: 250px;
            overflow-y: auto;
            margin-top: 10px;
            white-space: pre-wrap;
        `;

        panel.appendChild(header);
        panel.appendChild(content);
        document.body.appendChild(panel);

        // Add toggle button to show/hide
        const toggleBtn = document.createElement('button');
        toggleBtn.innerHTML = '📋 Console';
        toggleBtn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #333;
            color: white;
            border: none;
            padding: 8px 12px;
            cursor: pointer;
            border-radius: 5px;
            z-index: 10001;
            font-size: 12px;
        `;
        toggleBtn.onclick = () => {
            const isVisible = panel.style.display !== 'none';
            panel.style.display = isVisible ? 'none' : 'block';
            toggleBtn.style.display = isVisible ? 'block' : 'none';
        };
        
        // Store reference for Developer Mode control
        this.toggleButton = toggleBtn;
        
        document.body.appendChild(toggleBtn);

        // Event handlers
        document.getElementById('toggle-logger').onclick = () => {
            panel.style.display = 'none';
            toggleBtn.style.display = 'block';
        };

        document.getElementById('copy-logs').onclick = () => {
            const logText = this.getFormattedLogs();
            navigator.clipboard.writeText(logText).then(() => {
                alert('Console logs copied to clipboard!');
            });
        };

        document.getElementById('clear-logs').onclick = () => {
            this.logs = [];
            this.updateUI();
        };

        this.panel = panel;
        this.content = content;
    }

    updateUI() {
        if (this.content) {
            this.content.textContent = this.getFormattedLogs();
            this.content.scrollTop = this.content.scrollHeight;
        }
    }

    getFormattedLogs() {
        return this.logs.map(log => 
            `[${log.timestamp.split('T')[1].split('.')[0]}] ${log.level}: ${log.message}`
        ).join('\n');
    }

    // Method to get logs for GitHub Copilot
    getLogsForCopilot() {
        console.log('\n=== CONSOLE LOGS FOR GITHUB COPILOT ===');
        console.log(this.getFormattedLogs());
        console.log('=== END CONSOLE LOGS ===\n');
        return this.getFormattedLogs();
    }
}

// Auto-initialize when script loads
window.consoleLogger = new ConsoleLogger();

// Add helper function to window for easy access
window.getLogsForCopilot = () => window.consoleLogger.getLogsForCopilot();

console.log('🚀 Console Logger initialized! Use getLogsForCopilot() or click the 📋 Console button to capture logs.');
