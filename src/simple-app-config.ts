/* Environment variable configuration loader. */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { UndefinedEnvVarError } from './errors/undefinedEnvVarError';
import TypeConverterUtil from './utils/typeConverterUtil';
import { NestableDataTypes, NonNestableDataTypes } from './enums';
import { UnsupportedTypeError } from './errors/unsupportedTypeError';
import { UndefinedConfigValueError } from './errors/undefinedConfigValueError';

/**
 * SimpleAppConfig class
 */
export class SimpleAppConfig {

  /**
   * Command line arguments that can be specified with the application starts
   */
  private static readonly COMMAND_LINE_ARGS = {
    ENVIRONMENT: '--environment=',    /* The environment */
    ENV_PATH: '--env-path=',          /* The path to the .env file */
    CONFIG_PATH: '--config-path='     /* The path to the config file */
  }

  /**
   * Environment variables that can be set to change configurations
   */
  private static readonly ENV_VAR_ARGS = {
    ENV_PATH: 'ENV_PATH',             /* The path to the .env file */
    CONFIG_PATH: 'CONFIG_PATH'        /* The path to the config file */
  }

  /**
   * The default file path to the JSON config file
   */
  private static readonly DEFAULT_CONFIG_PATH = 'config/default.json';

  /**
   * The default environment if no environment is specified.
   */
  private static readonly DEFAULT_ENV = 'development';

  /**
   * The set of config file types that are supported
   */
  private static readonly supportedConfigFileTypes = new Set(['.json']);

  /**
   * Mappings of environment names to paths for .env and config files.
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
   * Map containing converted (expanded) values from the config file
   */
  private static configMap: Map<string, unknown> = new Map();

  /**
   * Flag indicating whether configuration has already been performed
   */
  private static alreadyConfigured: boolean = false;

  /**
   * Configures the module:
   * - Returns if the module has already been configured
   * - Determines the environment.
   * - Loads the .env file
   * - Loads environment variables into the cache
   * - Loads the config file
   * - Loads the default config file
   * - Sets already configured flag to true.
   */
  public static configure(): void {
    /* Check if the application is already configured */
    if (SimpleAppConfig.alreadyConfigured === true) {
      return;
    }

    /* Determine environment */
    const environment = SimpleAppConfig.determineEnvironment();

    /* Load .env file */
    SimpleAppConfig.loadEnvFile(environment);

    /* Load all environment variables into cache */
    SimpleAppConfig.refreshEnvCache();

    /* Load config file */
    SimpleAppConfig.loadConfigFile(environment);

    /* Load default config file */
    SimpleAppConfig.loadDefaultConfigFile();

    /* Set the alrady configured flag to true */
    SimpleAppConfig.alreadyConfigured = true;
  }

  /**
   * Determines the environment from the following in order of precedence from highest priority to lowest:
   * - Command line arguments
   * - NODE_ENV environment variable
   * - Assumes the environment to be 'development' if nothing is set
   */
  private static determineEnvironment(): string {
    /* Check if the environment is set as a command line arguments */
    for (const arg of process.argv) {
      if (arg.startsWith(SimpleAppConfig.COMMAND_LINE_ARGS.ENVIRONMENT)) {
        return arg.split('=')[1];
      }
    }

    /* Check if the environment is set as an environment variable */
    const environment = process.env.NODE_ENV;
    if (environment !== undefined) {
      return environment;
    }

    /* If no environment is set, use 'development'*/
    return SimpleAppConfig.DEFAULT_ENV;
  }

  /**
   * Loads a .env file in the following order of precedence from highest priority to lowest:
   * - Loads the path specified in command line args if the path is valid
   * - Loads the path specified in environment variables if the path is valid
   * - Loads the path corresponding to the environment if the path is valid
   * @param environment The environment of the application.
   */
  private static loadEnvFile(environment: string): void {
    /* Load path specified by command line argument if it exists */
    for (const arg of process.argv) {
      
      if (arg.startsWith(SimpleAppConfig.COMMAND_LINE_ARGS.ENV_PATH)) {
        const path = arg.split('=')[1];
        console.log(path)
        if (fs.existsSync(path)) {
          
          dotenv.config({ path: path });
          return;
        }
      }
    }

    /* Load path specified by environment variable argument if it exists */
    const path = process.env[SimpleAppConfig.ENV_VAR_ARGS.ENV_PATH];
    if (path !== undefined && fs.existsSync(path)) {
      dotenv.config({ path: path });
      return;
    }

    /* Load path corresponding to the environment if it exists */
    for (const envType in SimpleAppConfig.ENV_MAPPINGS) {
      const { NAME, ENV_PATH } = SimpleAppConfig.ENV_MAPPINGS[envType];
      if (environment.toLowerCase() === NAME && fs.existsSync(ENV_PATH)) {
        dotenv.config({ path: ENV_PATH });
        return;
      }
    }
  }

  /**
   * Loads a config file in the following order of precedence from highest priority to lowest:
   * - Loads the path specified in command line args if the path is valid
   * - Loads the path specified in environment variables if the path is valid
   * - Loads the path corresponding to the environment if the path is valid
   * @param environment The environment of the application.
   */
  private static loadConfigFile(environment: string): void {
    /* Load path specified by command line argument if specified and if path exists */
    for (const arg of process.argv) {
      if (arg.startsWith(SimpleAppConfig.COMMAND_LINE_ARGS.CONFIG_PATH)) {
        const path = arg.split('=')[1];
        if (fs.existsSync(path)) {
          SimpleAppConfig.loadConfig(path);
          return;
        }
      }
    }

    /* Load path specified by environment variable argument if it exists */
    const path = process.env[SimpleAppConfig.ENV_VAR_ARGS.CONFIG_PATH];
    if (path !== undefined && fs.existsSync(path)) {
      SimpleAppConfig.loadConfig(path);
      return;
    }

    /* Load path corresponding to the environment if it exists */
    for (const envType in SimpleAppConfig.ENV_MAPPINGS) {
      const { NAME, CONFIG_PATH } = SimpleAppConfig.ENV_MAPPINGS[envType];
      if (environment.toLowerCase() === NAME && fs.existsSync(CONFIG_PATH)) {
        SimpleAppConfig.loadConfig(CONFIG_PATH);
        return;
      }
    }

  }

  /**
   * Checks if a config file is valid. A config file is valid if all the below are true:
   * - It isn't a directory
   * - It matches a valid file extension
   * @param filePath The path of the config file to check.
   * @returns A boolean indicating whether the config file is valid.
   */
  private static isValidConfigFile(filePath: string): boolean {
    /* Check that the path isn't a directory */
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      return false;
    }

    /* Check if the file type is supported */
    const extension = path.extname(filePath);
    if (!SimpleAppConfig.supportedConfigFileTypes.has(extension)) {
      return false;
    }

    /* Return true by default */
    return true;
  }

  /**
   * Loads the default config file, and updates config values that have not yet been set.
   */
  private static loadDefaultConfigFile(): void {
    /* Return if default config path doesn't exist */
    if (!fs.existsSync(SimpleAppConfig.DEFAULT_CONFIG_PATH)) {
      return;
    }

    /* Load the default.json config */
    SimpleAppConfig.loadConfig(SimpleAppConfig.DEFAULT_CONFIG_PATH);
  }

  /**
   * Clears the cache and refreshes the cache with the most up-to-date environment variables in process.env.
   */
  public static refreshEnvCache() {
    /* Clear the cache */
    SimpleAppConfig.envCache.clear();

    /* Load all existing environment variables in the cache */
    for (const key in process.env) {
      SimpleAppConfig.envCache.set(key, process.env[key]);
    }
  }

  /**
   * Sets a new value to an environment variable and writes-through the value to the cache.
   * @param key Key of the environment variable.
   * @param value The value to set the environment variable to.
   */
  public static setEnvValue(key: string, value: string) {
    /* Update value in process.env */
    process.env[key] = value;

    /* Write-through to cache */
    SimpleAppConfig.envCache.set(key, value);
  }

  /**
   * Deletes an environment variable and removes it from the cache.
   * @param key Key or name of the environment variable.
   */
  public static deleteEnvValue(key: string) {
    /* Update value in process.env */
    delete process.env[key];

    /* Delete from cache */
    SimpleAppConfig.envCache.delete(key);
  }

  /**
   * Returns the value corresponding the to environment variable with name {@link key} in the environment variables. 
   * Checks the {@link envCache} first and then process.env if there is a cache miss. Will lazy load the value into
   * the in-memory cache if there is a miss. Caches undefined environment variables as well.
   * @param key Key of the environment variable.
   * @returns The value corresponding the to environment variable with name {@link key} in the environment variables.
   */
  private static getValueFromEnv(key: string): string | undefined {
    /* Check if cache contains the environment variable */
    if (SimpleAppConfig.envCache.has(key)) {
      return SimpleAppConfig.envCache.get(key);
    }

    /* Lazy load value from process.env into cache */
    const value = process.env[key];
    SimpleAppConfig.envCache.set(key, value);

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
    const value = SimpleAppConfig.getValueFromEnv(key);
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
    const value = SimpleAppConfig.getStringFromEnv(key);

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
    const value = SimpleAppConfig.getStringFromEnv(key);

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
    const value = SimpleAppConfig.getStringFromEnv(key);

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
    const value = SimpleAppConfig.getStringFromEnv(key);

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
    const value = SimpleAppConfig.getStringFromEnv(key);

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
    const value = SimpleAppConfig.getStringFromEnv(key);

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
    const value = SimpleAppConfig.getStringFromEnv(key);

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
    const value = SimpleAppConfig.getStringFromEnv(key);

    /* Convert value to array and return it */
    return TypeConverterUtil.convertToMap(value, keyType, valueType);
  }

  /**
   * Helper method to load a config file given a path. Performs the following in the listed order:
   * - Returns if the path doesn't exist or the file type is unsupported
   * - Reads the config file and parses it as a JSON object
   * - Processes the object into a Map. Nested configurations will be recursively parsed into nested maps.
   * - Updates the global config map with values that haven't been set yet. This is so that default config values don't override 
   * ones with higher priority.
   * @param path Path to load the config file from.
   */
  public static loadConfig(path: string): void {
    /* Returns if path doesn't exist or if file type is unsupported */
    if (!fs.existsSync(path) || !SimpleAppConfig.isValidConfigFile(path)) {
      return;
    }

    /* Read the config file and parse it as JSON */
    const configFile = fs.readFileSync(path, 'utf8');
    const config = JSON.parse(configFile);

    /* Process the config object into a map */
    const map: Map<string, unknown> = SimpleAppConfig.processConfig(config);

    /* Set the value in the global config map if is hasn't been set yet. This is so that default values loaded afterwards won't override values with higher priority */
    for (const key of map.keys()) {
      if (!SimpleAppConfig.configMap.has(key)) {
        SimpleAppConfig.configMap.set(key, map.get(key));
      }
    }
  }

  /**
   * Processes a config object into a Map. Performs the following in the listed order recursively:
   * - Converts the input to an array if it is an array
   * - Process each in the JSON object. If it is a string it expands any environment variables within the string. If it is an 
   * object it will recursively process the object and treat it like a nested map of configurations
   * @param config The configuration object to process.
   * @returns 
   */
  private static processConfig<T>(config: unknown): T {
    /* Check if input is an array */
    if (Array.isArray(config)) {
      return config.map(item => SimpleAppConfig.processConfig(item)) as T;
    }

    /* Recursively process each key-value pair in the JSON object. Strings should be expanded. */
    const processedConfig: Map<string, T> = new Map();
    Object.entries(config as Record<string, T>).forEach(([key, value]) => {
      if (typeof value === 'string') {
        processedConfig.set(key, SimpleAppConfig.expandEnvVar(value));
      } else {
        processedConfig.set(key, SimpleAppConfig.processConfig(value));
      }
    });
    return processedConfig as T;
  }

  /**
   * Expands an environment variable, and performs type conversions if it is not nested in a string.
   * 
   * Fields starting with $ will be treated as a special case and matched as $VAR::TYPE:SUBTYPE1:SUBTYPE2. They will be converted 
   * to the type TYPE with SUBTYPE1 and SUBTYPE2 if it is a nested structure like an Array, Set, or Map.
   * 
   * Fields that are string containing ${...} will be matched as ${VAR::TYPE:SUBTYPE1:SUBTYPE2}, and will be treated as a string 
   * regardless of the types specified and expanded as a string.
   * @param input The input string to expand
   * @returns The expanded or converted form of the input.
   */
  private static expandEnvVar<T>(input: string): T {
    /* Check if the input starts with $ indicating special variable expansion and type conversion */
    if (input.startsWith('$')) {
      /* Match all strings of $VAR_NAME::TYPE:subType1:subType2 */
      const regex = /^\$([A-Z0-9_]+)(?:::(\w+))?(?::(\w+))?(?::(\w+))?$/;
      const match = input.match(regex);
      if (match) {
        const [, varName, type = 'string', subtype1, subtype2] = match;

        /* Perform type conversion to the desired type */
        switch (type.toLowerCase()) {
          case NestableDataTypes.String.toLowerCase():
            return SimpleAppConfig.getStringFromEnv(varName) as T;
          case NestableDataTypes.Number.toLowerCase():
            return SimpleAppConfig.getNumberFromEnv(varName) as T;
          case NestableDataTypes.Boolean.toLowerCase():
            return SimpleAppConfig.getBooleanFromEnv(varName) as T;
          case NestableDataTypes.Date.toLowerCase():
            return SimpleAppConfig.getDateFromEnv(varName) as T;
          case NestableDataTypes.RegExp.toLowerCase():
            return SimpleAppConfig.getRegExpFromEnv(varName) as T;
          case NestableDataTypes.Object.toLowerCase():
            return SimpleAppConfig.getObjectFromEnv(varName) as T;
          case NonNestableDataTypes.Array.toLowerCase():
            return SimpleAppConfig.getArrayFromEnv(varName, subtype1) as T;
          case NonNestableDataTypes.Set.toLowerCase():
            return SimpleAppConfig.getSetFromEnv(varName, subtype1) as T;
          case NonNestableDataTypes.Map.toLowerCase():
            return SimpleAppConfig.getMapFromEnv(varName, subtype1, subtype2) as T;
          default:
            /* Throw error if target conversion type is not supported */
            throw new UnsupportedTypeError(type);
        }
      }
    }
    /* Expand environment variable as a string */
    return input.replace(/\$\{([A-Z0-9_]+)(?:::\w+)?(?::\w+)?(?::\w+)?\}/gi, (match, varName) => SimpleAppConfig.getStringFromEnv(varName)) as T;
  }

  /**
   * Get a field from the config map containing processed fields from the config files.
   * @param key The name of the field in the config file.
   * @returns The expanded and converted value in the config file.
   */
  public static get<T>(key: string): T {
    /* Throw error if the config value doesn't exist */
    if (!SimpleAppConfig.configMap.has(key)) {
      throw new UndefinedConfigValueError(key);
    }

    /* Get the config value from the config map and return it*/
    return SimpleAppConfig.configMap.get(key) as T;
  }

  /**
   * Private constructor
   */
  private constructor() { }
}

/* Configure module immediately upon import from dependent module */
SimpleAppConfig.configure();


