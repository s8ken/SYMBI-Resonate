/**
 * Structured Logging Service
 * Provides consistent logging across the application
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = 'info';
  private sessionId: string;
  private userId?: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Set log level
   */
  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  /**
   * Set user ID for logging
   */
  setUserId(userId: string | undefined) {
    this.userId = userId;
  }

  /**
   * Debug log
   */
  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  /**
   * Info log
   */
  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  /**
   * Warning log
   */
  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  /**
   * Error log
   */
  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log('error', message, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    });
  }

  /**
   * Critical log
   */
  critical(message: string, error?: Error, context?: Record<string, any>) {
    this.log('critical', message, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    });
  }

  /**
   * Log with timing
   */
  time(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.info(`Timer: ${label}`, { duration: `${duration.toFixed(2)}ms` });
    };
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: this.userId,
      sessionId: this.sessionId,
    };

    // Console output with colors
    const color = this.getLogColor(level);
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;
    
    console.log(
      `%c${prefix}%c ${message}`,
      `color: ${color}; font-weight: bold`,
      'color: inherit',
      context || ''
    );

    // In production, send to logging service
    this.sendToLoggingService(entry);
  }

  /**
   * Check if should log based on level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'critical'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Get color for log level
   */
  private getLogColor(level: LogLevel): string {
    const colors: Record<LogLevel, string> = {
      debug: '#6b7280',
      info: '#0ea5e9',
      warn: '#f59e0b',
      error: '#ef4444',
      critical: '#dc2626',
    };
    return colors[level];
  }

  /**
   * Send log to external service
   */
  private sendToLoggingService(entry: LogEntry) {
    // In production, send to logging service (e.g., Datadog, LogRocket)
    // For now, just store in localStorage for debugging
    if (entry.level === 'error' || entry.level === 'critical') {
      try {
        const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
        logs.push(entry);
        // Keep only last 100 error logs
        if (logs.length > 100) {
          logs.shift();
        }
        localStorage.setItem('error_logs', JSON.stringify(logs));
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get error logs from localStorage
   */
  getErrorLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('error_logs') || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * Clear error logs
   */
  clearErrorLogs() {
    localStorage.removeItem('error_logs');
  }
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();

  /**
   * Mark start of operation
   */
  static mark(name: string) {
    this.marks.set(name, performance.now());
  }

  /**
   * Measure operation duration
   */
  static measure(name: string): number | null {
    const start = this.marks.get(name);
    if (!start) {
      return null;
    }

    const duration = performance.now() - start;
    this.marks.delete(name);

    logger.info(`Performance: ${name}`, { duration: `${duration.toFixed(2)}ms` });
    return duration;
  }

  /**
   * Measure async operation
   */
  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.mark(name);
    try {
      const result = await fn();
      this.measure(name);
      return result;
    } catch (error) {
      this.measure(name);
      throw error;
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();