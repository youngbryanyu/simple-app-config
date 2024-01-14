/* Environment variable configuration loader. */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { UndefinedEnvVarError } from './errors/undefinedEnvVarError';
import TypeConverterUtil from './utils/typeConverterUtil';
import { COMMAND_LINE_ARGS, ENV_ARGS, Environments, FileTypes, NestableDataTypes, NonNestableDataTypes } from './constants';
import { UnsupportedTypeError } from './errors/unsupportedTypeError';
import { UndefinedConfigValueError } from './errors/undefinedConfigValueError';

/**
 * The class encapsulating all the logic for simple-app-config
 */
export class Config {
  /**
   * The set of config file types that are supported.
   */
  private static readonly configFileTypes: Set<string> = new Set(Object.values(FileTypes));

  /**
   * The current environment. Defaults to development.
   */
  private static environment: string = Environments.DEVELOPMENT;

  /**
   * The environments of the application. 
   * Defaults to development, testing, staging, production.
   * Populated with custom values when {@link Config.setPaths} is called.
   */
  private static environments: Set<string> = new Set(Object.values(Environments));

  /**
   * The set of possible paths of the default config file. 
   * Populated when {@link Config.setPaths} is called.
   */
  private static defaultConfigPaths: Set<string> = new Set();

  /**
   * The Map of environments to .env paths.
   * Populated when {@link Config.setPaths} is called.
   */
  private static envPaths: Map<string, string> = new Map();

  /**
   * The Map of environments to a set of possible paths for the config file.
   * Populated when {@link Config.setPaths} is called.
   */
  private static configPaths: Map<string, Set<string>> = new Map();

  /**
   * Cache Map for environment variables to speed up retrieval due to system calls being slower than retrieving from memory.
   * Populated in the following scenarios:
   * - When {@link Config.refreshEnvCache} is called
   * - When {@link Config.setEnvValue} is called
   */
  private static envCache: Map<string, string | undefined> = new Map();

  /**
   * Map containing converted and expanded values from the loaded config file.
   * Populated when {@link Config.loadConfigAndPopulate} is called.
   */
  private static configMap: Map<string, unknown> = new Map();

  /**
   * Flag indicating whether configuration has already been performed.
   * This is set to true after {@link Config.configure} is finished running.
   */
  private static alreadyConfigured: boolean = false;

  /**
   * The entry point to all of the configuration functions. Configures the module in the following order:
   * - Returns if the module has already been configured and the force flag isn't set
   * - Sets the environment names
   * - Sets the paths to the .env and possible config files based on the environment names
   * - Determines the environment
   * - Loads the .env file
   * - Loads environment variables into the cache
   * - Loads the config file
   * - Loads the default config file
   * - Sets already configured flag to true.
   * @param force Whether to force the module to re-configure, even if it has already been configured.
   */
  public static configure(force?: boolean): void {
    /* Return if the application is already configured and the force isn't set  */
    if (Config.alreadyConfigured === true && force === false) {
      return;
    }

    Config.setEnvironmentNames();         /* Set the names of the environment */
    Config.determineEnvironment();        /* Determine environment */
    Config.setPaths();                    /* Set the .env and possible config paths */
    Config.loadEnvFile();                 /* Load .env file */
    Config.refreshEnvCache();             /* Load all environment variables into cache */
    Config.loadConfigFile();              /* Load config file */
    Config.loadDefaultConfigFile();       /* Load default config file */
    Config.alreadyConfigured = true;      /* Set the alrady configured flag to true */
  }

  /**
   * Sets environment names if they are specified in either of the following from highest priority to lowest, where higher 
   * priority values will override lower priority values:
   * - Command line arguments
   * - Environment variables
   * 
   * The environment names default to 'development', 'testing', 'staging', and 'production'.
   */
  private static setEnvironmentNames(): void {
    /* Check if environment names are set in command line arguments */
    for (const arg of process.argv) {
      if (arg.startsWith(COMMAND_LINE_ARGS.ENV_NAMES)) {
        Config.environments.clear(); /* Clear default environment names */
        const envNames = arg.split('=')[1].split(',');
        for (const envName of envNames) {
          Config.environments.add(envName);
        }
        return;
      }
    }

    /* Check if environment names are set in environment variables */
    const arg = process.env[ENV_ARGS.ENV_NAMES];
    if (arg !== undefined) {
      Config.environments.clear();  /* Clear default environment names */
      const envNames = arg.split(',');
      for (const envName of envNames) {
        Config.environments.add(envName);
      }
      return;
    }
  }

  /**
   * Populates the following:
   * - The paths of the .env files based on the environments
   * - The possible paths of the config files based on the environments
   * - The default config file
   */
  private static setPaths() {
    /* Loop over each environments */
    for (const environment of Config.environments) {
      /* Set the .env paths */
      Config.envPaths.set(environment, `.env.${environment}`);

      /* Set the possible config paths in the ./config directory */
      Config.configPaths.set(environment, new Set());
      for (const fileType of Config.configFileTypes) {
        (Config.configPaths.get(environment) as Set<string>).add(`config/${environment}${fileType}`)
      }
    }

    /* Set default config paths in the ./config directory */
    for (const fileType of Config.configFileTypes) {
      Config.defaultConfigPaths.add(`config/default${fileType}`);
    }
  }

  /**
   * Determines the environment from the following from highest priority to lowest, where higher priority values will override 
   * lower priority values:
   * - Command line arguments
   * - NODE_ENV environment variable
   * 
   * The environment defaults to 'development'.
   */
  private static determineEnvironment(): void {
    /* Check if the environment is set as a command line argument */
    for (const arg of process.argv) {
      if (arg.startsWith(COMMAND_LINE_ARGS.ENV)) {
        Config.environment = arg.split('=')[1].toLowerCase();
        return;
      }
    }

    /* Check if the environment is set as an environment variable */
    const environment = process.env[ENV_ARGS.ENV];
    if (environment !== undefined) {
      Config.environment = environment.toLowerCase();
      return;
    }
  }

  /**
   * Loads a .env file from the following in the following order from highest priority to lowest, where higher priority values 
   * will override lower priority values:
   * - Command line args
   * - Environment variables
   * - The path corresponding to the environment
   * 
   * If the path specified in each of the above doesn't exist, it will try the next highest priority value.
   */
  private static loadEnvFile(): void {
    /* Load path specified by command line argument if it exists */
    for (const arg of process.argv) {
      if (arg.startsWith(COMMAND_LINE_ARGS.ENV_PATH)) {
        const path = arg.split('=')[1];
        if (Config.isValidEnvFile(path)) {
          dotenv.config({ path: path });
          return;
        }
      }
    }

    /* Load path specified by environment variable argument if it exists */
    const path = process.env[ENV_ARGS.ENV_PATH];
    if (path !== undefined && Config.isValidEnvFile(path)) {
      dotenv.config({ path: path });
      return;
    }

    /* Load path corresponding to the environment if it exists */
    if (Config.envPaths.has(Config.environment)) {
      const path = Config.envPaths.get(Config.environment) as string;
      if (Config.isValidEnvFile(path)) {
        dotenv.config({ path: path });
        return;
      }
    }
  }

  /**
   * Checks if a .env file is valid. A .env file is valid if all the below are true:
   * - It exists
   * @param path The path of the .env file to check.
   * @returns A boolean indicating whether the .env file is valid.
   */
  private static isValidEnvFile(path: string): boolean {
    return fs.existsSync(path);
  }

  /**
   * Loads a config file from the folloowing in the following order from highest priority to lowest, where higher priority values 
   * will override lower priority values::
   * - Command line arguments
   * - Environment variables
   * - The path corresponding to the environment
   * 
   * If the path specified in each of the above doesn't exist, it will try the next highest priority value.
   */
  private static loadConfigFile(): void {
    /* Load path specified by command line argument if specified and if path exists */
    for (const arg of process.argv) {
      if (arg.startsWith(COMMAND_LINE_ARGS.CONFIG_PATH)) {
        const path = arg.split('=')[1];
        if (Config.isValidConfigFile(path)) {
          Config.loadConfigAndPopulate(path);
          return;
        }
      }
    }

    /* Load path specified by environment variable argument if it exists */
    const path = process.env[ENV_ARGS.CONFIG_PATH];
    if (path !== undefined && Config.isValidConfigFile(path)) {
      Config.loadConfigAndPopulate(path);
      return;
    }

    /* Load path corresponding to the environment if it exists */
    if (Config.configPaths.has(Config.environment)) {
      for (const path of (Config.configPaths.get(Config.environment) as Set<string>)) {
        if (Config.isValidConfigFile(path)) {
          Config.loadConfigAndPopulate(path);
          return;
        }
      }
    }
  }

  /**
   * Checks if a config file is valid. A config file is valid if all the below are true:
   * - It exists
   * - It isn't a directory
   * - It matches a valid file extension
   * @param filePath The path of the config file to check.
   * @returns A boolean indicating whether the config file is valid.
   */
  private static isValidConfigFile(filePath: string): boolean {
    /* Return false if the path doesn't exist */
    if (!fs.existsSync(filePath)) {
      return false;
    }

    /* Return false if the path is a directory */
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      return false;
    }

    /* Return false if the file type is not supported */
    const extension = path.extname(filePath);
    if (!Config.configFileTypes.has(extension)) {
      return false;
    }

    /* Return false if config file is empty */
    const file = fs.readFileSync(filePath, 'utf8').trim();
    if (file === '') {
      return false;
    }

    /* Return true by default */
    return true;
  }

  /**
   * Loads the default config file, and updates config values that have not yet been set.
   */
  private static loadDefaultConfigFile(): void {
    for (const path of Config.defaultConfigPaths) {
      if (Config.isValidConfigFile(path)) {
        Config.loadConfigAndPopulate(path)
        return;
      }
    }
  }

  /**
   * Helper method to load a config file given a path. Performs the following in the listed order:
   * - Reads the config file 
   * - Parses the read file depending on the type of the config file. Processes the object into a Map. Nested configurations will 
   * be recursively parsed into nested maps.
   * - Updates the global config map with values that haven't been set yet. This is so that default config values don't override 
   * ones with higher priority.
   * 
   * This function assumes that the file path is valid since it should be called from {@link Config.loadConfigFile} and 
   * {@link Config.loadDefaultConfigFile}, and file validation is performed there.
   * 
   * @param filePath Path to load the config file from.
   */
  private static loadConfigAndPopulate(filePath: string): void {
    /* Read file */
    const file = fs.readFileSync(filePath, 'utf8').trim();

    /* Determine the extension of the config file and parse it accordingly */
    const fileType = path.extname(filePath);
    let map: Map<string, unknown>;
    switch (fileType) {
      case FileTypes.JSON:
        map = Config.parseJSON(file);
        break;
      default:
        map = Config.parseJSON(file);
        break;
    }

    /* Set the value in the global config map if is hasn't been set yet. This is so that default values loaded afterwards won't override values with higher priority */
    for (const key of map.keys()) {
      if (!Config.configMap.has(key)) {
        Config.configMap.set(key, map.get(key));
      }
    }
  }

  /**
   * Parses the text read from a JSON file and returns it as a Map.
   * @param file The text representing the JSON file after reading it.
   * @returns A Map of the key-value pairs in the JSON file. 
   */
  private static parseJSON<T>(file: string): Map<string, T> {
    /* Parse the file as JSON */
    const config = JSON.parse(file);

    /* Process the config object into a map */
    return Config.convertJSONToMap(config);
  }

  /**
   * Converts a JSON object into a Map. Performs the following in the listed order recursively:
   * - Converts the input to an array if it is an array
   * - Process each in the JSON object. If it is a string it expands any environment variables within the string. If it is an 
   * object it will recursively process the object and treat it like a nested map of configurations
   * @param config The configuration object to process.
   * @returns a Map of the key-value pairs in the JSON file.
   */
  private static convertJSONToMap<T>(config: unknown): T {
    /* Recursively convert each element of an array */
    if (Array.isArray(config)) {
      return config.map(item => Config.convertJSONToMap(item)) as T;
    }

    /* Handle primitive data types */
    if (typeof config !== 'object' || config === null) {
      if (typeof config === 'string') {
        return Config.expandEnvVar(config) as T;
      } else {
        return config as T;
      }
    }

    /* Recursively process each key-value pair in the JSON object. Strings should be expanded. */
    const processedConfig: Map<string, T> = new Map();
    Object.entries(config as Record<string, T>).forEach(([key, value]) => {
      if (typeof value === 'string') {
        processedConfig.set(key, Config.expandEnvVar(value));
       } else {
        processedConfig.set(key, Config.convertJSONToMap(value));
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
            return Config.getStringFromEnv(varName) as T;
          case NestableDataTypes.Number.toLowerCase():
            return Config.getNumberFromEnv(varName) as T;
          case NestableDataTypes.Boolean.toLowerCase():
            return Config.getBooleanFromEnv(varName) as T;
          case NestableDataTypes.Date.toLowerCase():
            return Config.getDateFromEnv(varName) as T;
          case NestableDataTypes.RegExp.toLowerCase():
            return Config.getRegExpFromEnv(varName) as T;
          case NestableDataTypes.Object.toLowerCase():
            return Config.getObjectFromEnv(varName) as T;
          case NonNestableDataTypes.Array.toLowerCase():
            return Config.getArrayFromEnv(varName, subtype1) as T;
          case NonNestableDataTypes.Set.toLowerCase():
            return Config.getSetFromEnv(varName, subtype1) as T;
          case NonNestableDataTypes.Map.toLowerCase():
            return Config.getMapFromEnv(varName, subtype1, subtype2) as T;
          default:
            /* Throw error if target conversion type is not supported */
            throw new UnsupportedTypeError(type);
        }
      }
    }
    /* Expand environment variable as a string */
    return input.replace(/\$\{([A-Z0-9_]+)\}/g, (match, varName) => Config.getStringFromEnv(varName)) as T;
  }

  /**
   * Get a field from the config map containing processed fields from the config files. Iteratively searches for nested 
   * configuration values. Each level of the configuration key must be separated with a '.'
   * @param key The name of the field in the config file.
   * @returns The expanded and converted value in the config file.
   */
  public static get<T>(key: string): T {
    /* Iteratively search for nested configuration values */
    let currentConfig: unknown = Config.configMap;
    for (const part of key.split('.')) {
      if (currentConfig instanceof Map && currentConfig.has(part)) {
        currentConfig = currentConfig.get(part);
      } else {
        throw new UndefinedConfigValueError(key);
      }
    }

    /* Return the final nested config value */
    return currentConfig as T;
  }

  /**
   * Clears the environment variable cache and updates the cache with the most up-to-date environment variables
   */
  public static refreshEnvCache(): void {
    /* Clear the cache */
    Config.envCache.clear();

    /* Load all existing environment variables in the cache */
    for (const key in process.env) {
      Config.envCache.set(key, process.env[key]);
    }
  }

  /**
   * Sets a new value to an environment variable and writes-through the value to the cache.
   * @param key Key of the environment variable.
   * @param value The value to set the environment variable to.
   */
  public static setEnvValue(key: string, value: string): void {
    /* Update value in process.env */
    process.env[key] = value;

    /* Write-through to cache */
    Config.envCache.set(key, value);
  }

  /**
   * Deletes an environment variable and removes it from the cache.
   * @param key Key or name of the environment variable.
   */
  public static deleteEnvValue(key: string): void {
    /* Update value in process.env */
    delete process.env[key];

    /* Delete from cache */
    Config.envCache.delete(key);
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
    if (Config.envCache.has(key)) {
      return Config.envCache.get(key);
    }

    /* Lazy load value from process.env into cache */
    const value = process.env[key];
    Config.envCache.set(key, value);
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
    const value = Config.getValueFromEnv(key);
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
    const value = Config.getStringFromEnv(key);

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
    const value = Config.getStringFromEnv(key);

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
    const value = Config.getStringFromEnv(key);

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
    const value = Config.getStringFromEnv(key);

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
    const value = Config.getStringFromEnv(key);

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
    const value = Config.getStringFromEnv(key);

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
    const value = Config.getStringFromEnv(key);

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
    const value = Config.getStringFromEnv(key);

    /* Convert value to array and return it */
    return TypeConverterUtil.convertToMap(value, keyType, valueType);
  }

  /**
   * Private constructor
   */
  private constructor() { }
}

/* Configure module immediately upon import from dependent module */
Config.configure();
