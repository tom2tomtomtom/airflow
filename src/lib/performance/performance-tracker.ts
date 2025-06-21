/**
 * Simple Performance Tracker
 * Provides basic performance monitoring for development and debugging
 */

export class SimplePerformanceTracker {
  private static instance: SimplePerformanceTracker;
  private timers: Map<string, number> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): SimplePerformanceTracker {
    if (!SimplePerformanceTracker.instance) {
      SimplePerformanceTracker.instance = new SimplePerformanceTracker();
    }
    return SimplePerformanceTracker.instance;
  }

  /**
   * Start timing an operation
   */
  public start(operationName: string): void {
    this.timers.set(operationName, Date.now());
  }

  /**
   * End timing an operation and log the result
   */
  public end(operationName: string): void {
    const startTime = this.timers.get(operationName);
    
    if (startTime === undefined) {
      console.warn(`[Performance] No start time found for: ${operationName}`);
      return;
    }

    const duration = Date.now() - startTime;
    console.log(`[Performance] ${operationName}: ${duration}ms`);
    
    // Clean up the timer
    this.timers.delete(operationName);
  }

  /**
   * Measure a function execution time
   */
  public async measure<T>(operationName: string, fn: () => Promise<T>): Promise<T> {
    this.start(operationName);
    try {
      const result = await fn();
      this.end(operationName);
      return result;
    } catch (error) {
      this.end(operationName);
      throw error;
    }
  }

  /**
   * Measure a synchronous function execution time
   */
  public measureSync<T>(operationName: string, fn: () => T): T {
    this.start(operationName);
    try {
      const result = fn();
      this.end(operationName);
      return result;
    } catch (error) {
      this.end(operationName);
      throw error;
    }
  }

  /**
   * Clear all active timers
   */
  public clear(): void {
    this.timers.clear();
  }

  /**
   * Get all active timer names
   */
  public getActiveTimers(): string[] {
    return Array.from(this.timers.keys());
  }
}

// Export singleton instance for convenience
export const performanceTracker = SimplePerformanceTracker.getInstance();
