/* Class representing a logger interface to attach a logger. */

/**
 * Represents a generic logger that could be a simple console .
 */
export interface Logger {
  info(message?: string, ...optionalParams: unknown[]): void;
}

/**
 * The logger util class.
 */
export class LoggerUtil {
  /**
   * The implementation of the logger interface to use.
   * @default console
   */
  private static logger: Logger = console;

  /**
   * Whether or not to enable logs.
   * @default true
   */
  private static enableLogs: boolean = true;

  /**
   * Sets the implementation of the logger to use.
   * @param logger The logger implementation to use.
   */
  public static setLogger(logger: Logger): void {
    LoggerUtil.logger = logger;
  }

  /**
   * Sets the flag indicating whether or not to perform logging.
   * @param enabled Whether or not logging is enabled. 
   */
  public static setLoggingEnabled(enabled: boolean): void {
    LoggerUtil.enableLogs = enabled;
  }

  /**
   * Performs logging of verbose level 'info' if logging is enabled.
   * @param message Message to log.
   */
  public static info(message: string): void {
    if (LoggerUtil.enableLogs) {
      LoggerUtil.logger.info(message);
    }
  }
}
