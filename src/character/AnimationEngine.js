/**
 * Animation Engine for Sprunki Expression System
 * Handles animation queuing, easing, and interpolation
 */
export class AnimationEngine {
  constructor(options = {}) {
    this.options = {
      defaultTransitionDuration: 0.3,
      easing: 'easeInOut',
      smoothTransitions: true,
      ...options
    };
    
    // Animation state
    this.animationQueue = [];
    this.activeAnimations = new Map();
    this.isProcessing = false;
  }

  /**
   * Create transition animations for expression changes
   */
  createTransitionAnimations(targetState, options) {
    const {
      duration = this.options.defaultTransitionDuration,
      easing = this.options.easing,
      stagger = 0
    } = options;

    const animations = [];
    let delay = 0;

    for (const [elementName, targetElementState] of Object.entries(targetState)) {
      const animation = this.createElementAnimation(elementName, targetElementState, {
        duration,
        easing,
        delay
      });
      
      if (animation) {
        animations.push(animation);
        delay += stagger;
      }
    }

    return animations;
  }

  /**
   * Create animation for individual element
   */
  createElementAnimation(elementName, targetState, options) {
    const currentTransform = this.getCurrentElementTransform(elementName);
    
    if (!currentTransform) {
      console.warn(`No current transform found for element: ${elementName}`);
      return null;
    }

    const {
      duration = this.options.defaultTransitionDuration,
      easing = this.options.easing,
      delay = 0
    } = options;

    return {
      elementName,
      startTime: Date.now() + (delay * 1000),
      duration: duration * 1000, // Convert to milliseconds
      easing,
      startState: { ...currentTransform },
      endState: { ...targetState.transform },
      type: targetState.spriteSwap ? 'sprite-swap' : 'transform',
      spriteData: targetState.spriteSwap || null,
      onComplete: options.onComplete || null
    };
  }

  /**
   * Process animation queue
   */
  processAnimationQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const currentTime = Date.now();
    const completedAnimations = [];

    for (const [animationId, animation] of this.activeAnimations) {
      if (currentTime < animation.startTime) continue;

      const elapsed = currentTime - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);
      const easedProgress = this.applyEasing(progress, animation.easing);

      if (animation.type === 'transform') {
        const interpolatedTransform = this.interpolateTransform(
          animation.startState,
          animation.endState,
          easedProgress
        );
        
        this.applyTransformImmediate(animation.elementName, interpolatedTransform);
      } else if (animation.type === 'sprite-swap' && progress >= 1) {
        this.applySpriteSwap(animation.elementName, animation.spriteData);
      }

      if (progress >= 1) {
        completedAnimations.push(animationId);
        if (animation.onComplete) {
          animation.onComplete(animation);
        }
      }
    }

    // Remove completed animations
    completedAnimations.forEach(id => this.activeAnimations.delete(id));

    this.isProcessing = false;

    // Continue processing if there are more animations
    if (this.activeAnimations.size > 0) {
      requestAnimationFrame(() => this.processAnimationQueue());
    }
  }

  /**
   * Apply easing function to progress value
   */
  applyEasing(progress, easingType) {
    switch (easingType) {
      case 'linear':
        return progress;
      case 'easeIn':
        return progress * progress;
      case 'easeOut':
        return 1 - Math.pow(1 - progress, 2);
      case 'easeInOut':
        return progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      case 'bounce':
        if (progress < 0.5) {
          return 2 * progress * progress;
        } else {
          return 1 - Math.pow(-2 * progress + 2, 2) / 2;
        }
      default:
        return progress;
    }
  }

  /**
   * Interpolate between transform states
   */
  interpolateTransform(start, end, progress) {
    return {
      x: start.x + (end.x - start.x) * progress,
      y: start.y + (end.y - start.y) * progress,
      scaleX: start.scaleX + (end.scaleX - start.scaleX) * progress,
      scaleY: start.scaleY + (end.scaleY - start.scaleY) * progress,
      rotation: start.rotation + (end.rotation - start.rotation) * progress,
      opacity: start.opacity + (end.opacity - start.opacity) * progress
    };
  }

  /**
   * Start animation
   */
  startAnimation(animation) {
    const animationId = `${animation.elementName}_${Date.now()}`;
    this.activeAnimations.set(animationId, animation);
    
    if (!this.isProcessing) {
      requestAnimationFrame(() => this.processAnimationQueue());
    }
    
    return animationId;
  }

  /**
   * Stop animation
   */
  stopAnimation(animationId) {
    return this.activeAnimations.delete(animationId);
  }

  /**
   * Stop all animations for element
   */
  stopElementAnimations(elementName) {
    const toRemove = [];
    for (const [id, animation] of this.activeAnimations) {
      if (animation.elementName === elementName) {
        toRemove.push(id);
      }
    }
    toRemove.forEach(id => this.activeAnimations.delete(id));
    return toRemove.length;
  }

  /**
   * Clear all animations
   */
  clearAllAnimations() {
    this.activeAnimations.clear();
    this.animationQueue.length = 0;
  }

  // Placeholder methods to be implemented by integration layer
  getCurrentElementTransform(elementName) {
    throw new Error('getCurrentElementTransform must be implemented by parent system');
  }

  applyTransformImmediate(elementName, transform) {
    throw new Error('applyTransformImmediate must be implemented by parent system');
  }

  applySpriteSwap(elementName, spriteData) {
    throw new Error('applySpriteSwap must be implemented by parent system');
  }
}
