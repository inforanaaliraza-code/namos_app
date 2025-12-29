/**
 * Error Logger Service
 * Centralized error logging and tracking
 */

type ErrorLevel = 'error' | 'warning' | 'info';

interface ErrorLog {
    level: ErrorLevel;
    message: string;
    error?: Error | any;
    context?: Record<string, any>;
    timestamp: number;
    userId?: string;
}

class ErrorLoggerService {
    private logs: ErrorLog[] = [];
    private maxLogs = 100; // Keep last 100 logs in memory

    /**
     * Log an error
     */
    logError(message: string, error?: Error | any, context?: Record<string, any>): void {
        const log: ErrorLog = {
            level: 'error',
            message,
            error: this.sanitizeError(error),
            context: this.sanitizeContext(context),
            timestamp: Date.now(),
        };

        this.addLog(log);
        this.consoleError(message, error, context);
    }

    /**
     * Log a warning
     */
    logWarning(message: string, error?: Error | any, context?: Record<string, any>): void {
        const log: ErrorLog = {
            level: 'warning',
            message,
            error: this.sanitizeError(error),
            context: this.sanitizeContext(context),
            timestamp: Date.now(),
        };

        this.addLog(log);
        this.consoleWarn(message, error, context);
    }

    /**
     * Log info
     */
    logInfo(message: string, context?: Record<string, any>): void {
        const log: ErrorLog = {
            level: 'info',
            message,
            context: this.sanitizeContext(context),
            timestamp: Date.now(),
        };

        this.addLog(log);
        if (__DEV__) {
            console.log(`[ErrorLogger] ${message}`, context);
        }
    }

    /**
     * Get recent error logs
     */
    getRecentLogs(level?: ErrorLevel, limit: number = 50): ErrorLog[] {
        let filtered = this.logs;
        
        if (level) {
            filtered = this.logs.filter(log => log.level === level);
        }

        return filtered
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    /**
     * Clear all logs
     */
    clearLogs(): void {
        this.logs = [];
    }

    /**
     * Add log to array (with size limit)
     */
    private addLog(log: ErrorLog): void {
        this.logs.push(log);
        
        // Keep only last maxLogs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
    }

    /**
     * Sanitize error object to remove sensitive data
     */
    private sanitizeError(error?: Error | any): any {
        if (!error) return undefined;

        try {
            // Extract safe error information
            const sanitized: any = {
                name: error.name,
                message: error.message,
            };

            // Add stack trace only in dev mode
            if (__DEV__ && error.stack) {
                sanitized.stack = error.stack;
            }

            // Add response data if it's an Axios error (but sanitize it)
            if (error.response) {
                sanitized.response = {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    // Don't include full response data to avoid sensitive info
                };
            }

            return sanitized;
        } catch {
            return { message: String(error) };
        }
    }

    /**
     * Sanitize context to remove sensitive data
     */
    private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
        if (!context) return undefined;

        try {
            const sanitized: Record<string, any> = {};
            const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization', 'auth'];

            for (const [key, value] of Object.entries(context)) {
                const lowerKey = key.toLowerCase();
                if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
                    sanitized[key] = '[REDACTED]';
                } else {
                    sanitized[key] = value;
                }
            }

            return sanitized;
        } catch {
            return {};
        }
    }

    /**
     * Console error logging
     */
    private consoleError(message: string, error?: Error | any, context?: Record<string, any>): void {
        if (__DEV__) {
            console.error(`[ErrorLogger] ${message}`, {
                error,
                context,
            });
        }
    }

    /**
     * Console warning logging
     */
    private consoleWarn(message: string, error?: Error | any, context?: Record<string, any>): void {
        if (__DEV__) {
            console.warn(`[ErrorLogger] ${message}`, {
                error,
                context,
            });
        }
    }
}

export const errorLogger = new ErrorLoggerService();

