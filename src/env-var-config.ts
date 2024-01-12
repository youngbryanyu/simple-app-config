/* Environment variable configuration loader. */
import dotenv from 'dotenv';
import fs from 'fs';
import { UndefinedEnvVarError } from './errors/undefinedEnvVarError';
import TypeConverterUtil from './utils/typeConverterUtil';
import { LoggerUtil, Logger } from './utils/loggerUtil';
import { NestableDataTypes } from './enums';

/**
 * Interface representing the optional configuration options for {@link EnvVarConfig}.
 */
interface ConfigOptions {
  /**
   * Specify a custom mappings for NODE_ENV environments to their corresponding .env file paths.
   */
  envFilePathMappings?: { [envName: string]: string };

  /**
   * Specify a logger to attach.
   */
  logger?: Logger;

  /**
   * Specify whether or not to perform logging.
   */
  enableLogs?: boolean;
}

/**
 * The default file path to the .env file.
 */
const DEFAULT_ENV_FILE_PATH = '.env';

/**
  * The default environment if no environment is found from NODE_ENV.
  */
const DEFAULT_ENV = 'dev';

/**
 * The name of the environment variable specifying the file path to the .env file to use 
 */
const ENV_FILE_ROOT = 'ENV_FILE_ROOT';

/**
  * Mappings of common NODE_ENV environment names to common file paths for their corresponding .env files.
  */
const COMMON_ENV_MAPPINGS: { [key: string]: { NAMES: string[]; FILE_PATHS: string[] } } = {
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
 * Cache for environment variables to speed up retrieval due to system calls being slower than retrieving from memory.
 */
const cache: Map<string, string | undefined> = new Map();

/**
 * Configures the module based on the optional configuration options and defaults:
 * - Attaches a logger if specified or falls back to console.
 * - Disables logging if specified.
 * - Determines the location of a .env file to read and attempts to load the environment variables from it if it exists.
 * - Reads all the environment variables into the cache.
 * @param configOptions Optional configuration options when configuring {@link EnvVarConfig}.
 */
export function config(configOptions: ConfigOptions = {}) {
  /* Attach a logger if specified */
  if (configOptions.logger) {
    LoggerUtil.setLogger(configOptions.logger);
  }

  /* Disable logs if specified */
  if (configOptions.enableLogs === false) {
    LoggerUtil.setLoggingEnabled(false);
  }

  /* Determine the file path of a .env file and load it if it exists */
  const filePath = determineFilePath(configOptions);
  if (fs.existsSync(filePath)) {
    LoggerUtil.info(`Loading .env file from file path: ${filePath}`);
    dotenv.config({ path: filePath });
  } else {
    LoggerUtil.info('Couldn\'t find a .env file to load.');
  }

  /* Load all environment variables into cache */
  refreshCache();
}

/**
 * Determines the file path of a .env file to load. Performs the following in the specified order:
 * 1. Load .env from a custom file path if the environment variable ENV_FILE_ROOT is set.
 * 2. If NODE_ENV is undefined, set the environment to {@link DEFAULT_ENV}.
 * 3. Attempts to find a file path mapping to the NODE_ENV based on the mapping specified in {@link ConfigOptions}.
 * 4. Attempts to find a file path matching common mappings of NODE_ENV names to file paths.
 * 5. Falls back to {@link DEFAULT_ENV_FILE_PATH}.
 * @returns The file path to use when loading a .env file.
 */
function determineFilePath(configOptions: ConfigOptions): string {
  /* Get the environment from NODE_ENV */
  let env = process.env.NODE_ENV;

  /* Use a custom file path if specified by ENV_FILE_ROOT  */
  const customFilePath = process.env[ENV_FILE_ROOT];
  if (customFilePath && fs.existsSync(customFilePath)) {
    return customFilePath;
  }

  /* If no environment variable is specified set it to the default */
  if (env === undefined) {
    env = DEFAULT_ENV;
  }

  /* Find a file path mapping to the NODE_ENV based on specified custom mappings */
  if (configOptions.envFilePathMappings) {
    const customMappingFilePath = configOptions.envFilePathMappings[env];
    if (customMappingFilePath && fs.existsSync(customMappingFilePath)) {
      return customMappingFilePath;
    }
  }

  /* Find a file path mapping to the NODE_ENV based on common mappings */
  for (const envType in COMMON_ENV_MAPPINGS) {
    const { NAMES, FILE_PATHS } = COMMON_ENV_MAPPINGS[envType];
    if (NAMES.includes(env)) {
      for (const filePath of FILE_PATHS) {
        if (fs.existsSync(filePath)) {
          return filePath;
        }
      }
    }
  }

  /* Fall back to the default file path */
  return DEFAULT_ENV_FILE_PATH;
}

/**
 * Clears the existing cache and refreshes the cache with the most up-to-date environment variables in process.env.
 */
export function refreshCache() {
  /* Clear the cache */
  cache.clear();

  /* Load all existing environment variables in the cache */
  for (const key in process.env) {
    cache.set(key, process.env[key]);
  }
}

/**
 * Sets a new value to an environment variable and writes-through the value to the cache.
 * @param key Key or name of the environment variable.
 * @param value The name value to set the environment variable to.
 */
export function setValue(key: string, value: string) {
  /* Update value in process.env */
  process.env[key] = value;

  /* Write-through to cache */
  cache.set(key, value);
}

/**
 * Deletes an environment variable and removes it from the cache.
 * @param key Key or name of the environment variable.
 */
export function deleteValue(key: string) {
  /* Update value in process.env */
  delete process.env[key];

  /* Delete from cache */
  cache.delete(key);
}

/**
 * Returns the value corresponding the to environment variable with name {@link key} in the environment variables. 
 * Checks the {@link cache} first and then process.env if there is a cache miss. Will lazy load the value into
 * the in-memory cache if there is a miss. Caches undefined environment variables as well.
 * @param key Key or name name of the environment variable.
 * @returns the value corresponding the to environment variable with name {@link key} in the environment variables.
 */
export function getValue(key: string): string | undefined {
  /* Check if cache contains the environment variable */
  if (cache.has(key)) {
    return cache.get(key);
  }

  /* Lazy load value from process.env into cache */
  const value = process.env[key];
  cache.set(key, value);

  /* Return the value */
  return value;
}

/**
 * Gets the specified environment variable and returns it as a plain string with no type conversions.
 * @param key The name of the environment variable.
 * @returns The value of the environment variable.
 * @throws {UndefinedEnvVarError} Error thrown if the environment variable is not defined.
 */
export function getString(key: string): string {
  /* Check if value is undefined */
  const value = getValue(key);
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
 */
export function getNumber(key: string): number {
  /* Get environment variable value as string */
  const value = getString(key);

  /* Convert value to number and return it */
  return TypeConverterUtil.convertToNumber(value);
}

/**
 * Gets the specified environment variable and returns it as a boolean.
 * @param key The name of the environment variable.
 * @returns The value of the environment variable as a boolean.
 */
export function getBoolean(key: string): boolean {
  /* Get environment variable value as string */
  const value = getString(key);

  /* Convert value to boolean and return it */
  return TypeConverterUtil.convertToBoolean(value);
}

/**
 * Gets the specified environment variable and returns it as a date.
 * @param key The name of the environment variable.
 * @returns The value of the environment variable as a date.
 */
export function getDate(key: string): Date {
  /* Get environment variable value as string */
  const value = getString(key);

  /* Convert value to date and return it */
  return TypeConverterUtil.convertToDate(value);
}

/**
 * Gets the specified environment variable and returns it as a RegExp.
 * @param key The name of the environment variable.
 * @returns The value of the environment variable as a RegExp.
 */
export function getRegex(key: string): RegExp {
  /* Get environment variable value as string */
  const value = getString(key);

  /* Convert value to date and return it */
  return TypeConverterUtil.convertToRegExp(value);
}

/**
 * Gets the specified environment variable and returns it as an object.
 * @param key The name of the environment variable.
 * @returns The value of the environment variable as an object.
 */
export function getObject(key: string): object {
  /* Get environment variable value as string */
  const value = getString(key);

  /* Convert value to date and return it */
  return TypeConverterUtil.convertToObject(value);
}

/**
 * Gets the specified environment variable and returns it as an Array.
 * If the type is ommitted each element will default to type string when conversion occurs.
 * @param key The name of the environment variable.
 * @returns The value of the environment variable as an Array.
 */
export function getArray<T>(key: string, type?: NestableDataTypes): Array<T> {
  /* Get environment variable value as string */
  const value = getString(key);

  /* Convert value to array and return it */
  return TypeConverterUtil.convertToArray(value, type);
}

/**
 * Gets the specified environment variable and returns it as a Set.
 * If the type is ommitted each element will default to string when conversion occurs.
 * @param key The name of the environment variable.
 * @returns The value of the environment variable as a Set.
 */
export function getSet<T>(key: string, type?: NestableDataTypes): Set<T> {
  /* Get environment variable value as string */
  const value = getString(key);

  /* Convert value to array and return it */
  return TypeConverterUtil.convertToSet(value, type);
}

/**
 * Gets the specified environment variable and returns it as a Map. 
 * If the keyType and valueType are ommitted the keys and values will default to type string when conversion occurs.
 * @param key The name of the environment variable.
 * @returns The value of the environment variable as a Map.
 */
export function getMap<K, V>(key: string, keyType?: NestableDataTypes, valueType?: NestableDataTypes): Map<K, V> {
  /* Get environment variable value as string */
  const value = getString(key);

  /* Convert value to array and return it */
  return TypeConverterUtil.convertToMap(value, keyType, valueType);
}
