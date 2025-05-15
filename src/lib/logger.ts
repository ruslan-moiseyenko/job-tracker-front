/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * A centralized logger that handles different environments appropriately
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LoggerOptions {
  // Allow sending logs to an external service in production
  sendToService?: boolean;
  // Additional metadata to include with logs
  meta?: Record<string, any>;
}

class Logger {
  /**
   * Debug level logging - only shown in development
   */
  debug(message: string, ...args: any[]): void {
    this.log("debug", message, ...args);
  }

  /**
   * Info level logging - only shown in development
   */
  info(message: string, ...args: any[]): void {
    this.log("info", message, ...args);
  }

  /**
   * Warning level logging
   */
  warn(message: string, ...args: any[]): void {
    this.log("warn", message, ...args);
  }

  /**
   * Error level logging
   */
  error(message: string, ...args: any[]): void {
    this.log("error", message, ...args);
  }

  /**
   * Internal logging method that handles environment differences
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    // In production, we could:
    // 1. Filter out low-severity logs
    // 2. Send to an error tracking service
    // 3. Sanitize sensitive data
    const isProd = import.meta.env.PROD;

    // In production, only show warnings and errors
    if (isProd && (level === "debug" || level === "info")) {
      return;
    }

    // In production, we might want to send errors to a monitoring service
    if (isProd && level === "error") {
      // Here you would integrate with services like Sentry, LogRocket, etc.
      // this.sendToErrorService(message, args);
    }

    // In development, use console with proper log level
    if (!isProd) {
      switch (level) {
        case "debug":
          console.debug(`[DEBUG] ${message}`, ...args);
          break;
        case "info":
          console.info(`[INFO] ${message}`, ...args);
          break;
        case "warn":
          console.warn(`[WARN] ${message}`, ...args);
          break;
        case "error":
          console.error(`[ERROR] ${message}`, ...args);
          break;
      }
    }
  }

  /**
   * Example method to send logs to an external service
   * (implement this when you add an error monitoring service)
   */
  private sendToErrorService(
    message: string,
    args: any[],
    options?: LoggerOptions
  ): void {
    // Integration point for services like Sentry, LogRocket, etc.
    // Example with Sentry:
    // Sentry.captureException(new Error(message), {
    //   extra: {
    //     data: args,
    //     ...options?.meta
    //   }
    // });
  }
}

// Export a singleton instance
export const logger = new Logger();
