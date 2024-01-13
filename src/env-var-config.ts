/* Environment variable configuration loader. */
import dotenv from 'dotenv';
import fs from 'fs';
import { UndefinedEnvVarError } from './errors/undefinedEnvVarError';
import TypeConverterUtil from './utils/typeConverterUtil';
import { NestableDataTypes, NonNestableDataTypes } from './enums';
import { UnsupportedTypeError } from './errors/unSupportedTypeError';
import { InvalidEnvError } from './errors/invalidEnvError';
import { MissingConfigFileError } from './errors/missingDefaultConfigFileError';
import { UndefinedConfigValueError } from './errors/undefinedConfigValueError';

// TODO: run configure at top-level module so things build upon import
export class EnvVarConfig {

  /**
   * Command line arguments that can be specified with the application starts
   */
  private static readonly COMMAND_LINE_ARGS = {
    ENVIRONMENT: '--environment=',    /* The environment */
    ENV_PATH: '--env-path=',          /* The path to the .env file */
    CONFIG_PATH: '--config-path='     /* The path to the config file */
  }

  /**
   * Special environment variables that can be set to change configurations.
   */
  private static readonly ENV_VAR_ARGS = {
    ENV_PATH: 'ENV_PATH',
    CONFIG_PATH: 'CONFIG_PATH'
  }

  /**
   * The default file path to the JSON config file
   */
  private static readonly DEFAULT_CONFIG_PATH = 'config/default.json';

  /**
    * The default environment if no environment is found from NODE_ENV.
    */
  private static readonly DEFAULT_ENV = 'development';

  /**
    * Mappings of common NODE_ENV environment names to common file paths for their corresponding .env files.
    */
  private static readonly ENV_MAPPINGS: { [key: string]: { NAME: string; ENV_PATH: string, CONFIG_PATH: string } } = {
    DEV: {
      NAME: 'development',
      ENV_PATH: '.env.development',
      CONFIG_PATH: 'config/development.json'
    },
    TEST: {
      NAME: 'testing',
      ENV_PATH: '.env.testing',
      CONFIG_PATH: 'config/testing.json'
    },
    STAGE: {
      NAME: 'staging',
      ENV_PATH: '.env.staging',
      CONFIG_PATH: 'config/staging.json',
    },
    PROD: {
      NAME: 'production',
      ENV_PATH: '.env.production',
      CONFIG_PATH: 'config/production.json'
    }
  }

  /**
   * Cache for environment variables to speed up retrieval due to system calls being slower than retrieving from memory.
   */
  private static envCache: Map<string, string | undefined> = new Map();

  /**
   * Map containing converted values from the config file
   */
  private static configMap: Map<string, unknown> = new Map();


  /**
   * Configures
   */
  public static configure() {
    /* Determine environment from NODE_ENV */
    const environment = EnvVarConfig.determineEnvironment();

    /* Throw error if environment is invalid */
    if (!EnvVarConfig.isValidEnvironment(environment)) {
      throw new InvalidEnvError(environment);
    }

    /* Load .env file */
    EnvVarConfig.loadEnvFile(environment);

    /* Load config.json */
    EnvVarConfig.loadConfigFile(environment);

    /* Load default.json file */
    EnvVarConfig.loadDefaultConfigFile();

    /* Load all environment variables into cache */
    EnvVarConfig.refreshEnvCache();
  }

  /**
   * Determines the environment from the following in order of precedence from highest priority to lowest:
   * - Command line arguments
   * - NODE_ENV environment variable
   * - Assumes the environment to be 'development' if nothing is set.
   */
  private static determineEnvironment(): string {
    /* Check if the environment is set as a command line arguments */
    for (const arg of process.argv) {
      if (arg.startsWith(EnvVarConfig.COMMAND_LINE_ARGS.ENVIRONMENT)) {
        return arg.split('=')[1];
      }
    }

    /* Check if the environment is set as an environment variable */
    const environment = process.env.NODE_ENV;
    if (environment !== undefined) {
      return environment;
    }

    /* If no environment is set, use 'development'*/
    return EnvVarConfig.DEFAULT_ENV;
  }

  /**
   * Determines whether the environment being set is valid
   */
  private static isValidEnvironment(environment: string): boolean {
    for (const envType in EnvVarConfig.ENV_MAPPINGS) {
      const { NAME } = EnvVarConfig.ENV_MAPPINGS[envType];
      if (environment.toLowerCase() === NAME) {
        return true;
      }
    }
    return false;
  }

  /**
   * Loads a .env file
   * @returns The file path to use when loading a .env file.
   */
  private static loadEnvFile(environment: string): void {
    /* Load path specified by command line argument if it exists */
    for (const arg of process.argv) {
      if (arg.startsWith(EnvVarConfig.COMMAND_LINE_ARGS.ENV_PATH)) {
        const path = arg.split('=')[1];
        if (fs.existsSync(path)) {
          dotenv.config({ path: path });
          return;
        }
      }
    }

    /* Load path specified by environment variable argument if it exists */
    const path = process.env[EnvVarConfig.ENV_VAR_ARGS.ENV_PATH];
    if (path !== undefined && fs.existsSync(path)) {
      dotenv.config({ path: path });
      return;
    }

    /* Load path corresponding to the environment if it exists */
    for (const envType in EnvVarConfig.ENV_MAPPINGS) {
      const { NAME, ENV_PATH } = EnvVarConfig.ENV_MAPPINGS[envType];
      if (environment.toLowerCase() === NAME && fs.existsSync(ENV_PATH)) {
        dotenv.config({ path: ENV_PATH });
        return;
      }
    }
  }

  /**
   * Loads a config file
   */
  private static loadConfigFile(environment: string) {
    /* Load path specified by command line argument if specified and if path exists */
    for (const arg of process.argv) {
      if (arg.startsWith(EnvVarConfig.COMMAND_LINE_ARGS.CONFIG_PATH)) {
        const path = arg.split('=')[1];
        if (fs.existsSync(path)) {
          EnvVarConfig.loadConfig(path);
          return;
        }
      }

      /* Load path specified by environment variable argument if it exists */
      const path = process.env[EnvVarConfig.ENV_VAR_ARGS.CONFIG_PATH];
      if (path !== undefined && fs.existsSync(path)) {
        dotenv.config({ path: path });
        return;
      }

      /* Load path corresponding to the environment if it exists */
      for (const envType in EnvVarConfig.ENV_MAPPINGS) {
        const { NAME, CONFIG_PATH } = EnvVarConfig.ENV_MAPPINGS[envType];
        if (environment.toLowerCase() === NAME && fs.existsSync(CONFIG_PATH)) {
          EnvVarConfig.loadConfig(CONFIG_PATH);
          return;
        }
      }
    }
  }

  /**
   * Loads a config file
   */
  private static loadDefaultConfigFile() {
    /* Throw error if default config path doesn't exist */
    if (!fs.existsSync(EnvVarConfig.DEFAULT_CONFIG_PATH)) {
      throw new MissingConfigFileError(EnvVarConfig.DEFAULT_CONFIG_PATH);
    }

    /* Load the default.json config */
    EnvVarConfig.loadConfig(EnvVarConfig.DEFAULT_CONFIG_PATH);
  }

  /**
   * Clears the existing cache and refreshes the cache with the most up-to-date environment variables in process.env.
   */
  public static refreshEnvCache() {
    /* Clear the cache */
    EnvVarConfig.envCache.clear();

    /* Load all existing environment variables in the cache */
    for (const key in process.env) {
      EnvVarConfig.envCache.set(key, process.env[key]);
    }
  }

  /**
   * Sets a new value to an environment variable and writes-through the value to the cache.
   * @param key Key or name of the environment variable.
   * @param value The name value to set the environment variable to.
   */
  public static setEnvValue(key: string, value: string) {
    /* Update value in process.env */
    process.env[key] = value;

    /* Write-through to cache */
    EnvVarConfig.envCache.set(key, value);
  }

  /**
   * Deletes an environment variable and removes it from the cache.
   * @param key Key or name of the environment variable.
   */
  public static deleteEnvValue(key: string) {
    /* Update value in process.env */
    delete process.env[key];

    /* Delete from cache */
    EnvVarConfig.envCache.delete(key);
  }

  /**
   * Returns the value corresponding the to environment variable with name {@link key} in the environment variables. 
   * Checks the {@link envCache} first and then process.env if there is a cache miss. Will lazy load the value into
   * the in-memory cache if there is a miss. Caches undefined environment variables as well.
   * @param key Key or name name of the environment variable.
   * @returns the value corresponding the to environment variable with name {@link key} in the environment variables.
   */
  private static getValueFromEnv(key: string): string | undefined {
    /* Check if cache contains the environment variable */
    if (EnvVarConfig.envCache.has(key)) {
      return EnvVarConfig.envCache.get(key);
    }

    /* Lazy load value from process.env into cache */
    const value = process.env[key];
    EnvVarConfig.envCache.set(key, value);

    /* Return the value */
    return value;
  }

  /**
   * Gets the specified environment variable and returns it as a plain string with no type conversions.
   * @param key The name of the environment variable.
   * @returns The value of the environment variable.
   * @throws {UndefinedEnvVarError} Error thrown if the environment variable is not defined.
   */
  public static getStringFromEnv(key: string): string {
    /* Check if value is undefined */
    const value = EnvVarConfig.getValueFromEnv(key);
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
  public static getNumberFromEnv(key: string): number {
    /* Get environment variable value as string */
    const value = EnvVarConfig.getStringFromEnv(key);

    /* Convert value to number and return it */
    return TypeConverterUtil.convertToNumber(value);
  }

  /**
   * Gets the specified environment variable and returns it as a boolean.
   * @param key The name of the environment variable.
   * @returns The value of the environment variable as a boolean.
   */
  public static getBooleanFromEnv(key: string): boolean {
    /* Get environment variable value as string */
    const value = EnvVarConfig.getStringFromEnv(key);

    /* Convert value to boolean and return it */
    return TypeConverterUtil.convertToBoolean(value);
  }

  /**
   * Gets the specified environment variable and returns it as a date.
   * @param key The name of the environment variable.
   * @returns The value of the environment variable as a date.
   */
  public static getDateFromEnv(key: string): Date {
    /* Get environment variable value as string */
    const value = EnvVarConfig.getStringFromEnv(key);

    /* Convert value to date and return it */
    return TypeConverterUtil.convertToDate(value);
  }

  /**
   * Gets the specified environment variable and returns it as a RegExp.
   * @param key The name of the environment variable.
   * @returns The value of the environment variable as a RegExp.
   */
  public static getRegExpFromEnv(key: string): RegExp {
    /* Get environment variable value as string */
    const value = EnvVarConfig.getStringFromEnv(key);

    /* Convert value to date and return it */
    return TypeConverterUtil.convertToRegExp(value);
  }

  /**
   * Gets the specified environment variable and returns it as an object.
   * @param key The name of the environment variable.
   * @returns The value of the environment variable as an object.
   */
  public static getObjectFromEnv(key: string): object {
    /* Get environment variable value as string */
    const value = EnvVarConfig.getStringFromEnv(key);

    /* Convert value to date and return it */
    return TypeConverterUtil.convertToObject(value);
  }

  /**
   * Gets the specified environment variable and returns it as an Array.
   * If the type is ommitted each element will default to type string when conversion occurs.
   * @param key The name of the environment variable.
   * @returns The value of the environment variable as an Array.
   */
  public static getArrayFromEnv<T>(key: string, type?: string): Array<T> {
    /* Get environment variable value as string */
    const value = EnvVarConfig.getStringFromEnv(key);

    /* Convert value to array and return it */
    return TypeConverterUtil.convertToArray(value, type);
  }

  /**
   * Gets the specified environment variable and returns it as a Set.
   * If the type is ommitted each element will default to string when conversion occurs.
   * @param key The name of the environment variable.
   * @returns The value of the environment variable as a Set.
   */
  public static getSetFromEnv<T>(key: string, type?: string): Set<T> {
    /* Get environment variable value as string */
    const value = EnvVarConfig.getStringFromEnv(key);

    /* Convert value to array and return it */
    return TypeConverterUtil.convertToSet(value, type);
  }

  /**
   * Gets the specified environment variable and returns it as a Map. 
   * If the keyType and valueType are ommitted the keys and will default to type string when conversion occurs.
   * @param key The name of the environment variable.
   * @returns The value of the environment variable as a Map.
   */
  public static getMapFromEnv<K, V>(key: string, keyType?: string, valueType?: string): Map<K, V> {
    /* Get environment variable value as string */
    const value = EnvVarConfig.getStringFromEnv(key);

    /* Convert value to array and return it */
    return TypeConverterUtil.convertToMap(value, keyType, valueType);
  }

  /**
   * Helper method
   * @param path Path to load the config file from.
   * @returns 
   */
  public static loadConfig(path: string): void {
    /* Returns if path doesn't exist */
    if (!fs.existsSync(path)) {
      return;
    }

    /* Read the config file and parse it as JSON */
    const configFile = fs.readFileSync(path, 'utf8');
    const config = JSON.parse(configFile);

    /* Process the config object into a map */
    const map: Map<string, unknown> = EnvVarConfig.processConfig(config);

    /* Set the value in the global config map if is hasn't been set yet. This is so that default values loaded afterwards won't override values with higher priority */
    for (const key of map.keys()) {
      if (!EnvVarConfig.configMap.has(key)) {
        EnvVarConfig.configMap.set(key, map.get(key));
      }
    }
  }

  /**
   * Processes a config object into a map
   * @param config 
   * @returns 
   */
  private static processConfig<T>(config: T): T {
    /* Check if input is an array */
    if (Array.isArray(config)) {
      return config.map(item => EnvVarConfig.processConfig(item)) as T;
    }

    /* Recursively process each key-value pair in the JSON object. Strings should be expanded and interposed. */
    const processedConfig: Map<string, T> = new Map();
    Object.entries(config as Record<string, T>).forEach(([key, value]) => {
      if (typeof value === 'string') {
        processedConfig.set(key, EnvVarConfig.expandEnvVar(value));
      } else {
        processedConfig.set(key, EnvVarConfig.processConfig(value));
      }
    });
    return processedConfig as T;
  }

  /**
   * Expands an environment variable
   * 
   * Fields starting with $ will be treated as a special case and matched as $VAR::TYPE:SUBTYPE1:SUBTYPE2, and will be converted 
   * to the type TYPE with SUBTYPE1 and SUBTYPE2 if it is a nested structure like an Array, Set, or Map.
   * 
   * Fields that are string containing ${...} will be matched as ${VAR::TYPE:SUBTYPE1:SUBTYPE2}, and will be treated as a string 
   * regardless of the types specified and expanded as a string.
   * @param input 
   * @returns 
   */
  private static expandEnvVar<T>(input: string): T {
    /* Check if the input starts with $ indicating special variable expansion and type conversion */
    if (input.startsWith('$')) {
      /* Match all strings of $VAR_NAME::TYPE:subType1:subType2 */
      const regex = /^\$([A-Z0-9_]+)(?:::(\w+))?(?::(\w+))?(?::(\w+))?$/;
      const match = input.match(regex);
      if (match) {
        const [, varName, type = 'string', subtype1, subtype2] = match;
        // Handle different types
        switch (type.toLowerCase()) {
          case NestableDataTypes.String.toLowerCase():
            return EnvVarConfig.getStringFromEnv(varName) as T;
          case NestableDataTypes.Number.toLowerCase():
            return EnvVarConfig.getNumberFromEnv(varName) as T;
          case NestableDataTypes.Boolean.toLowerCase():
            return EnvVarConfig.getBooleanFromEnv(varName) as T;
          case NestableDataTypes.Date.toLowerCase():
            return EnvVarConfig.getDateFromEnv(varName) as T;
          case NestableDataTypes.RegExp.toLowerCase():
            return EnvVarConfig.getRegExpFromEnv(varName) as T;
          case NestableDataTypes.Object.toLowerCase():
            return EnvVarConfig.getObjectFromEnv(varName) as T;
          case NonNestableDataTypes.Array.toLowerCase():
            return EnvVarConfig.getArrayFromEnv(varName, subtype1) as T;
          case NonNestableDataTypes.Set.toLowerCase():
            return EnvVarConfig.getSetFromEnv(varName, subtype1) as T;
          case NonNestableDataTypes.Map.toLowerCase():
            return EnvVarConfig.getMapFromEnv(varName, subtype1, subtype2) as T;
          default:
            /* Throw error if target conversion type is not supported */
            throw new UnsupportedTypeError(type);
        }
      }
    }

    /* Expand environment variable as a string */
    return input.replace(/\$\{([A-Z0-9_]+)(?:::\w+)?(?::\w+)?(?::\w+)?\}/gi, (match, varName) => EnvVarConfig.getStringFromEnv(varName)) as T;
  }

  /**
   * Get a field from the config file
   * @param key 
   * @returns 
   */
  static get<T>(key: string): T {
    if (EnvVarConfig.configMap.has(key)) {
      return EnvVarConfig.configMap.get(key) as T;
    }
    throw new UndefinedConfigValueError(key)
  }
}






