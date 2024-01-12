/* Class representing a logger interface to attach a logger. */

/**
 * Represents a generic logger that could be a simple console .
 */
export interface Logger {
  info(message?: string, ...optionalParams: unknown[]): void;
}

/**
 * The implementation of the logger interface to use.
 * @default console
 */
let logger: Logger = console;

/**
 * Whether or not to enable logs.
 * @default true
 */
let enableLogs: boolean = true;

/**
 * Sets the implementation of the logger to use.
 * @param logger The logger implementation to use.
 */
function setLogger(loggerImplementation: Logger): void {
  logger = loggerImplementation;
}

/**
 * Sets the flag indicating whether or not to perform logging.
 * @param enabled Whether or not logging is enabled. 
 */
function setLoggingEnabled(enabled: boolean): void {
  enableLogs = enabled;
}

/**
 * Performs logging of verbose level 'info' if logging is enabled.
 * @param message Message to log.
 */
function info(message: string): void {
  if (enableLogs) {
    logger.info(message);
  }
}

/* Export the logger util */
export const LoggerUtil = {
  setLogger,
  setLoggingEnabled,
  info
}
