/* Class representing a logger interface to attach a logger. */
import { Logger } from 'ts-log';

/**
 * The logger util class.
 */
class LoggerUtil {
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
   * Performs logging of verbose level error if logging is enabled.
   * @param message Message to log.
   */
  public static trace(message: string): void {
    if (LoggerUtil.enableLogs) {
      LoggerUtil.logger.trace(message);
    }
  }

  /**
   * Performs logging of verbose level 'debug' if logging is enabled.
   * @param message Message to log.
   */
  public static debug(message: string): void {
    if (LoggerUtil.enableLogs) {
      LoggerUtil.logger.debug(message);
    }
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

  /**
   * Performs logging of verbose level 'warn' if logging is enabled.
   * @param message Message to log.
   */
  public static warn(message: string): void {
    if (LoggerUtil.enableLogs) {
      LoggerUtil.logger.warn(message);
    }
  }

  /**
   * Performs logging of verbose level 'warn' if logging is enabled.
   * @param message 
   */
  public static error(message: string): void {
    if (LoggerUtil.enableLogs) {
      LoggerUtil.logger.error(message);
    }
  }
}

export default LoggerUtil;