/* Environment variable configuration loader. */
import dotenv from 'dotenv';
import { UndefinedEnvVarError } from './errors/undefinedEnvVarError';
import typeConverter from './utils/typeConverterUtil';
import { Logger } from 'ts-log';
import fs from 'fs';
import LoggerUtil from './utils/loggerUtil';

/**
 * Interface representing the optional configuration options for {@link EnvVarConfig}.
 */
interface ConfigOptions {
  /**
   * Specify the specific file path of the .env file.
   */
  filePath?: string;

  /**
   * Specify a custom mappings for NODE_ENV environments to their corresponding .env file paths.
   */
  envToFilePathMappings?: { [envName: string]: string };

  /**
   * Specify a logger to attach.
   */
  logger?: Logger;

  /**
   * Specify whether or not to perform logging.
   */
  disableLogs?: boolean;
}

/**
 * Class representing the environment variable config loader.
 */
class EnvVarConfig {
  /**
   * The default file path to the .env file.
   */
  private static readonly DEFAULT_FILE_PATH: string = '.env';

  /**
   * The default environment if no environment is found from NODE_ENV.
   */
  private static readonly DEFAULT_ENV: string = 'dev';

  /**
   * Mappings of common NODE_ENV environment names to common file paths for their corresponding .env files.
   */
  private static readonly COMMON_ENV_MAPPINGS: { [key: string]: { NAMES: string[]; FILE_PATHS: string[] } } = {
    DEV: {
      NAMES: ['dev', 'development'],
      FILE_PATHS: ['.env.dev', '.env.development']
    },
    TEST: {
      NAMES: ['test', 'testing'],
      FILE_PATHS: ['.env.test', '.env.testing']
    },
    STAGE: {
      NAMES: ['stage', 'staging'],
      FILE_PATHS: ['.env.stage', '.env.staging']
    },
    PROD: {
      NAMES: ['prod', 'production'],
      FILE_PATHS: ['.env.prod', '.env.production']
    }
  }

  /**
   * Configuration options when setting up {@link EnvVarConfig}.
   * @default {}
   */
  private static configOptions: ConfigOptions;

  /**
   * Private constructor for {@link EnvVarConfig}.
   */
  private constructor() { }

  /**
   * Configures the module based on the optional configuration options and defaults:
   * - Attaches a logger if specified or falls back to console.
   * - Determines the location of a .env file to read and attempts to load the environment variables from it if it exists.
   * @param configOptions Optional configuration options when configuring {@link EnvVarConfig}.
   */
  public static config(configOptions: ConfigOptions = {}) {
    /* Save the configuration options */
    EnvVarConfig.configOptions = configOptions;

    /* Attach a logger if specified */
    if (configOptions.logger) {
      LoggerUtil.setLogger(configOptions.logger);
    }

    /* Determine the file path of a .env file and load it if it exists */
    const filePath = EnvVarConfig.determineFilePath();
    if (fs.existsSync(filePath)) {
      LoggerUtil.info(`Loading .env file from file path: ${filePath}`);
      dotenv.config({ path: filePath });
    } else {
      LoggerUtil.info('Couldn\'t find a .env file to load.');
    }
  }

  /**
   * Determines the file path of a .env file to load. Performs the following in the specified order:
   * 1. Load .env from a custom file path if specified in {@link ConfigOptions}.
   * 2. If NODE_ENV is undefined, set the environment to {@link DEFAULT_ENV}.
   * 3. Attempts to find a file path mapping to the NODE_ENV based on the mapping specified in {@link ConfigOptions}.
   * 4. Attempts to find a file path matching common mappings of NODE_ENV names to file paths.
   * 5. Falls back to {@link DEFAULT_FILE_PATH}.
   * @returns The file path to use when loading a .env file.
   */
  private static determineFilePath(): string {
    LoggerUtil.info(`Determining file path to use for .env...`);

    /* Get the environment from NODE_ENV */
    let env = process.env.NODE_ENV;
    LoggerUtil.info(`Environment retrieved from NODE_ENV is: ${env}`);

    /* Use a custom file path if specified and it exists */
    const customFilePath = EnvVarConfig.configOptions.filePath;
    if (customFilePath && fs.existsSync(customFilePath)) {
      LoggerUtil.info(`Using custom file path of .env file: ${customFilePath}`);
      return customFilePath;
    }

    /* If no environment variable is specified set it to the default */
    if (env === undefined) {
      LoggerUtil.info(`NODE_ENV is undefined. Assuming default environment of: ${EnvVarConfig.DEFAULT_ENV}`);
      env = this.DEFAULT_ENV;
    }

    /* Find a file path mapping to the NODE_ENV based on specified custom mappings */
    if (EnvVarConfig.configOptions.envToFilePathMappings) {
      const customFilePath = EnvVarConfig.configOptions.envToFilePathMappings[env];
      if (customFilePath && fs.existsSync(customFilePath)) {
        LoggerUtil.info(`Using file path of .env found in custom mappings: ${customFilePath}`);
        return customFilePath;
      }
    }

    /* Find a file path mapping to the NODE_ENV based on common mappings */
    for (const envType in EnvVarConfig.COMMON_ENV_MAPPINGS) {
      const { NAMES, FILE_PATHS } = EnvVarConfig.COMMON_ENV_MAPPINGS[envType];
      if (NAMES.includes(env)) {
        for (const filePath of FILE_PATHS) {
          if (fs.existsSync(filePath)) {
            LoggerUtil.info(`Using file path of .env found in common mappings: ${customFilePath}`);
            return filePath;
          }
        }
      }
    }

    /* Fall back to the default file path */
    LoggerUtil.info(`Falling back to default file path of .env: ${EnvVarConfig.DEFAULT_FILE_PATH}`);
    return EnvVarConfig.DEFAULT_FILE_PATH;
  }

  /**
   * Returns the value corresponding the to environment variable with name {@link key} in the environment variables.
   * @param key Name of the target environment variable.
   * @returns the value corresponding the to environment variable with name {@link key} in the environment variables.
   */
  public static getValue(key: string): string | undefined {
    return process.env[key];
  }

  /**
   * Gets the specified environment variable and returns it as a string.
   * @param key The name of the environment variable.
   * @returns The value of the environment variable as a string.
   * @throws {UndefinedEnvVarError} Error thrown if the environment variable is not defined.
   */
  public static getString(key: string): string {
    /* Check if value is undefined */
    const value = EnvVarConfig.getValue(key);
    if (value === undefined) {
      throw new UndefinedEnvVarError(key);
    }

    /* Convert value to string and return it */
    return String(value);
  }

  /**
   * Gets the specified environment variable and returns it as a number.
   * @param key The name of the environment variable.
   * @returns The value of the environment variable as a number.
   * @throws {UndefinedEnvVarError} Error thrown if the environment variable is not defined.
   */
  public static getNumber(key: string): number {
    /* Check if value is undefined */
    const value = EnvVarConfig.getValue(key);
    if (value === undefined) {
      throw new UndefinedEnvVarError(key);
    }

    /* Convert value to number and return it */
    return typeConverter.convertToNumber(value);
  }

  /**
   * Gets the specified environment variable and returns it as a boolean.
   * @param key The name of the environment variable.
   * @returns The value of the environment variable as a boolean.
   * @throws {UndefinedEnvVarError} Error thrown if the environment variable is not defined.
   */
  public static getBoolean(key: string): boolean {
    /* Check if value is undefined */
    const value = EnvVarConfig.getValue(key);
    if (value === undefined) {
      throw new UndefinedEnvVarError(key);
    }

    /* Convert value to boolean and return it */
    return typeConverter.convertToBoolean(value);
  }
}

export default EnvVarConfig;