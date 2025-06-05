
/**
 * Performance Metrics
 * 
 * Tracks and provides performance monitoring for the Performance Stage including
 * FPS tracking, frame counting, and debug information display.
 * 
 * @class PerformanceMetrics
 * @description Monitors stage performance with frame rate tracking, debug rendering,
 *              and performance history for optimization insights.
 */

export class PerformanceMetrics {
    constructor(eventBus, stateManager) {
        this.eventBus = eventBus;
        this.stateManager = stateManager;
        
        // Performance tracking
        this.frameCount = 0;
        this.fps = 60;
        this.fpsHistory = [];
        this.lastFpsUpdate = 0;
        
        // Timing metrics
        this.renderTimes = [];
        this.lastRenderTime = 0;
        this.averageRenderTime = 0;
        
        console.log('📊 PerformanceMetrics: Initialized');
    }

    /**
     * Update FPS tracking - call this every frame
     */
    updateFPS(now) {
        this.frameCount++;
        
        if (now - this.lastFpsUpdate >= 1000) { // Update FPS every second
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            
            // Keep FPS history for performance monitoring
            this.fpsHistory.push(this.fps);
            if (this.fpsHistory.length > 60) { // Keep last 60 seconds
                this.fpsHistory.shift();
            }
            
            // Emit FPS update event
            this.eventBus.emit('stage:fps_updated', {
                fps: this.fps,
                averageFps: this.getAverageFPS()
            });
        }
    }

    /**
     * Track render time for performance analysis
     */
    trackRenderTime(startTime, endTime) {
        const renderTime = endTime - startTime;
        this.lastRenderTime = renderTime;
        
        // Keep rolling average of last 30 frames
        this.renderTimes.push(renderTime);
        if (this.renderTimes.length > 30) {
            this.renderTimes.shift();
        }
        
        // Calculate average render time
        this.averageRenderTime = this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length;
    }

    /**
     * Render debug information on canvas
     */
    renderDebugInfo(ctx, currentTime) {
        if (!this.stateManager.get('ui.debugMode')) {
            return;
        }

        // Save canvas state
        ctx.save();
        
        // Debug info styling
        ctx.fillStyle = '#00ff00';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // Background for better readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(5, 5, 200, 100);
        
        // Debug text
        ctx.fillStyle = '#00ff00';
        ctx.fillText(`FPS: ${this.fps.toFixed(1)}`, 10, 20);
        ctx.fillText(`Avg FPS: ${this.getAverageFPS().toFixed(1)}`, 10, 35);
        ctx.fillText(`Time: ${currentTime.toFixed(2)}s`, 10, 50);
        ctx.fillText(`Render: ${this.lastRenderTime.toFixed(2)}ms`, 10, 65);
        ctx.fillText(`Avg Render: ${this.averageRenderTime.toFixed(2)}ms`, 10, 80);
        ctx.fillText(`Total Frames: ${this.getTotalFrameCount()}`, 10, 95);
        
        // Restore canvas state
        ctx.restore();
    }

    /**
     * Get average FPS from history
     */
    getAverageFPS() {
        if (this.fpsHistory.length === 0) return this.fps;
        
        const sum = this.fpsHistory.reduce((total, fps) => total + fps, 0);
        return sum / this.fpsHistory.length;
    }

    /**
     * Get minimum FPS from history
     */
    getMinFPS() {
        if (this.fpsHistory.length === 0) return this.fps;
        return Math.min(...this.fpsHistory);
    }

    /**
     * Get maximum FPS from history
     */
    getMaxFPS() {
        if (this.fpsHistory.length === 0) return this.fps;
        return Math.max(...this.fpsHistory);
    }

    /**
     * Get total frame count since initialization
     */
    getTotalFrameCount() {
        // Sum of all completed FPS measurements plus current partial count
        const completedFrames = this.fpsHistory.reduce((total, fps) => total + fps, 0);
        return completedFrames + this.frameCount;
    }

    /**
     * Get comprehensive performance metrics
     */
    getPerformanceMetrics() {
        return {
            fps: this.fps,
            averageFps: this.getAverageFPS(),
            minFps: this.getMinFPS(),
            maxFps: this.getMaxFPS(),
            fpsHistory: [...this.fpsHistory],
            totalFrames: this.getTotalFrameCount(),
            lastRenderTime: this.lastRenderTime,
            averageRenderTime: this.averageRenderTime,
            renderTimeHistory: [...this.renderTimes]
        };
    }

    /**
     * Check for performance issues
     */
    getPerformanceWarnings() {
        const warnings = [];
        
        // Check for low FPS
        if (this.fps < 30) {
            warnings.push(`Low FPS: ${this.fps.toFixed(1)} (target: 60)`);
        }
        
        // Check for high render times
        if (this.averageRenderTime > 16) { // 16ms = 60fps budget
            warnings.push(`High render time: ${this.averageRenderTime.toFixed(2)}ms (target: <16ms)`);
        }
        
        // Check for FPS drops
        const recentFps = this.fpsHistory.slice(-5); // Last 5 seconds
        if (recentFps.length >= 5) {
            const recentAvg = recentFps.reduce((sum, fps) => sum + fps, 0) / recentFps.length;
            const overallAvg = this.getAverageFPS();
            
            if (recentAvg < overallAvg * 0.8) { // 20% drop
                warnings.push(`Recent FPS drop: ${recentAvg.toFixed(1)} vs ${overallAvg.toFixed(1)} average`);
            }
        }
        
        return warnings;
    }

    /**
     * Reset all metrics
     */
    reset() {
        this.frameCount = 0;
        this.fps = 60;
        this.fpsHistory = [];
        this.lastFpsUpdate = 0;
        this.renderTimes = [];
        this.lastRenderTime = 0;
        this.averageRenderTime = 0;
        
        console.log('📊 PerformanceMetrics: Metrics reset');
    }

    destroy() {
        console.log('📊 PerformanceMetrics: Destroying...');
        this.reset();
        console.log('📊 PerformanceMetrics: Destroyed');
    }
}
