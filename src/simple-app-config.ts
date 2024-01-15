/* Environment variable configuration loader. */
import dotenv, { DotenvParseOutput } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { COMMAND_LINE_ARGS, ENV_ARGS, Environments, FileTypes, NestableDataTypes, NonNestableDataTypes } from './constants';
import { UnsupportedTypeError } from './errors/unsupportedTypeError';
import { UndefinedConfigValueError } from './errors/undefinedConfigValueError';
import EnvParser from './utils/envParser';
import StringUtil from './utils/stringUtil';

/**
 * Customization options when running configure
 */
interface ConfigOptions {
  force?: boolean
}

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
   * Set when {@link Config.determineEnvironment} is called.
   */
  private static environment: string = Environments.DEVELOPMENT;

  /**
   * The environments of the application. 
   * Defaults to development, testing, staging, production.
   * Populated with custom values when {@link Config.setEnvironmentNames} is called.
   */
  private static environments: Set<string> = new Set(Object.values(Environments));

  /**
   * The set of possible paths of the default config file. 
   * Populated when {@link Config.setPaths} is called.
   */
  private static defaultConfigPaths: Set<string> = new Set();

  /**
   * The directory of where the .env files reside. This can be relative or absolute. Defaults to "".
   * Set when {@link Config.setDirs} is called.
   */
  private static envDir: string = '';

  /**
   * The directory of where the config directory resides. This can be relative or absolute. Defaults to "".
   * Set when {@link Config.setDirs} is called.
   */
  private static configDir: string = '';

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
   * Map containing converted and expanded values from the loaded config file.
   * Populated when {@link Config.parseConfigIntoMap} is called.
   */
  private static configMap: Map<string, unknown> = new Map();

  /**
   * Flag indicating whether configuration has already been performed.
   * This is set to true after {@link Config.configure} is finished running.
   */
  private static alreadyConfigured: boolean = false;

  /**
   * The previously set environment variables by dotenv.config
   * Populated when {@link Config.loadEnvFile} is called.
   */
  private static prevDotenvValues: unknown;

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
  public static configure(configOptions: ConfigOptions = {}): void {
    /* Return if the application is already configured and the force isn't set  */
    if ((Config.alreadyConfigured === true) && (configOptions.force !== true)) {
      return;
    }

    Config.setEnvironmentNames();                     /* Set the names of the environment */
    Config.determineEnvironment();                    /* Determine environment */
    Config.setEnvDir();                               /* Set the dir for the .env files */
    Config.setConfigDir();                            /* Set the dir for the config files */
    Config.setPaths();                                /* Set the .env and possible config paths */
    Config.loadEnvFile(Config.findEnvFile());         /* Find and load .env file */
    EnvParser.refreshCache();                         /* Load all environment variables into cache */
    Config.loadConfigFile(Config.findConfigFile());   /* Find and load config file */
    Config.loadDefaultConfigFile();                   /* Load default config file */
    Config.alreadyConfigured = true;                  /* Set the alrady configured flag to true */
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
        Config.environments.clear();  /* Clear default environment names, and any previously set */
        const envNames = arg.split('=')[1].split(',');
        for (const envName of envNames) {
          Config.environments.add(envName.toLowerCase());
        }
        return;
      }
    }

    /* Check if environment names are set in environment variables */
    const arg = process.env[ENV_ARGS.ENV_NAMES];
    if (arg !== undefined) {
      Config.environments.clear();  /* Clear default environment names, and any previously set */
      const envNames = arg.split(',');
      for (const envName of envNames) {
        Config.environments.add(envName.toLowerCase());
      }
      return;
    }
  }

  /**
   * Sets the directory of the .env files
   */
  private static setEnvDir(): void {
    /* Reset any previously set env dir */
    Config.envDir = '';

    /* Check if the env dir is set in command line args */
    for (const arg of process.argv) {
      if (arg.startsWith(COMMAND_LINE_ARGS.ENV_DIR)) {
        Config.envDir = StringUtil.trimStringFromEnd(arg.split('=')[1], '/');
        return;
      }
    }

    /* Check if the env dir is set as an environment variable */
    const dir = process.env[ENV_ARGS.ENV_DIR];
    if (dir !== undefined) {
      Config.envDir = StringUtil.trimStringFromEnd(dir, '/');
      return;
    }
  }

  /**
   * Sets the directory of the config directory.
   */
  private static setConfigDir(): void {
    /* Reset any previously set config dir */
    Config.configDir = '';

    /* Check if the env dir is set in command line args */
    for (const arg of process.argv) {
      if (arg.startsWith(COMMAND_LINE_ARGS.CONFIG_DIR)) {
        Config.configDir = StringUtil.trimStringFromEnd(arg.split('=')[1], '/');
        return;
      }
    }

    /* Check if the env dir is set as an environment variable */
    const dir = process.env[ENV_ARGS.CONFIG_DIR];
    if (dir !== undefined) {
      Config.configDir = StringUtil.trimStringFromEnd(dir, '/');
      return;
    }
  }

  /**
   * Populates the following:
   * - The paths of the .env files based on the environments and directory prefix
   * - The possible paths of the config files based on the environments and directory prefix
   * - The default config file
   */
  private static setPaths() {
    /* Clear any previously set paths other than defaults */
    Config.envPaths.clear();
    Config.configPaths.clear();

    /* Loop over each environments */
    for (const environment of Config.environments) {
      /* Set the .env paths */
      Config.envPaths.set(environment, `${Config.envDir}/.env.${environment}`);

      /* Set the possible config paths in the ./config directory */
      Config.configPaths.set(environment, new Set());
      for (const fileType of Config.configFileTypes) {
        (Config.configPaths.get(environment) as Set<string>).add(`${Config.configDir}/config/${environment}${fileType}`)
      }
    }

    /* Set default config paths in the ./config directory */
    for (const fileType of Config.configFileTypes) {
      Config.defaultConfigPaths.add(`${Config.configDir}/config/default${fileType}`);
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
  private static findEnvFile(): string | undefined {
    /* Reset previously set dotenv values */
    Config.resetDotEnv();

    /* Load path specified by command line argument if it exists */
    for (const arg of process.argv) {
      if (arg.startsWith(COMMAND_LINE_ARGS.ENV_PATH)) {
        const path = StringUtil.trimStringFromEnd(arg.split('=')[1], '/');
        if (Config.isValidEnvFile(path)) {
          return path;
        }
      }
    }

    /* Load path specified by environment variable argument if it exists */
    let path = process.env[ENV_ARGS.ENV_PATH];
    if (path !== undefined) {
      path = StringUtil.trimStringFromEnd(path, '/');
      if (Config.isValidEnvFile(path)) {
        return path;
      }
    }

    /* Load path corresponding to the environment if it exists */
    if (Config.envPaths.has(Config.environment)) {
      const path = StringUtil.trimStringFromEnd(Config.envPaths.get(Config.environment) as string, '/');
      if (Config.isValidEnvFile(path)) {
        return path;
      }
    }

    /* Default return undefined indicating no path found */
    return undefined;
  }

  /**
   * Loads the .env file if it has been found and set.
   */
  private static loadEnvFile(path: string | undefined): void {
    if (path !== undefined) {
      dotenv.config({ path: path });
      Config.prevDotenvValues = dotenv.parse(fs.readFileSync(path)); /* Set prev dotenv values */
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
   * Resets and values set previously by dotenv to undefined from the previous call of dotenv.config
   * @param Path to the .env file.
   */
  private static resetDotEnv(): void {
    /* Iterate over the keys and delete the environment variables */
    for (const key in (Config.prevDotenvValues as DotenvParseOutput)) {
      delete process.env[key];
    }
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
  private static findConfigFile(): string | undefined {
    /* Reset any previous values in the config file */
    Config.configMap.clear();

    /* Load path specified by command line argument if specified and if path exists */
    for (const arg of process.argv) {
      if (arg.startsWith(COMMAND_LINE_ARGS.CONFIG_PATH)) {
        const path = StringUtil.trimStringFromEnd(arg.split('=')[1], '/');
        if (Config.isValidConfigFile(path)) {
          return path;
        }
      }
    }

    /* Load path specified by environment variable argument if it exists */
    let path = process.env[ENV_ARGS.CONFIG_PATH];
    if (path !== undefined) {
      path = StringUtil.trimStringFromEnd(path, '/');
      if (Config.isValidConfigFile(path)) {
        return path;
      }
    }

    /* Load path corresponding to the environment if it exists */
    if (Config.configPaths.has(Config.environment)) {
      for (let path of (Config.configPaths.get(Config.environment) as Set<string>)) {
        path = StringUtil.trimStringFromEnd(path, '/');
        if (Config.isValidConfigFile(path)) {
          return path;
        }
      }
    }

    /* Return undefined to indicate no config file found */
    return undefined;
  }

  /**
   * Loads the config file if it has been found and set.
   */
  private static loadConfigFile(path: string | undefined): void {
    if (path !== undefined) {
      Config.parseConfigIntoMap(path);
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
        Config.parseConfigIntoMap(path)
        return;
      }
    }
  }

  /**
   * Helper method to parse a config file given a path and load it into {@link Config.configMap}. Performs the following in the listed order:
   * - Reads the config file 
   * - Parses the read file depending on the type of the config file. Processes the object into a Map. Nested configurations will 
   * be recursively parsed into nested maps.
   * - Updates the global config map with values that haven't been set yet. This is so that default config values don't override 
   * ones with higher priority.
   * 
   * This function assumes that the file path is valid since it should be called from {@link Config.findConfigFile} and 
   * {@link Config.loadDefaultConfigFile}, and file validation is performed there.
   * 
   * @param filePath Path to load the config file from.
   */
  private static parseConfigIntoMap(filePath: string): void {
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
   * @param jsonObj The JSON object to process.
   * @returns a Map of the key-value pairs in the JSON file.
   */
  private static convertJSONToMap<T>(jsonObj: unknown): T {
    /* If config is an array, recursively convert each element of an array */
    if (Array.isArray(jsonObj)) {
      return jsonObj.map(item => Config.convertJSONToMap(item)) as T;
    }

    /* Handle primitive data types. Strings should be expanded. */
    if (typeof jsonObj !== 'object' || jsonObj === null) {
      if (typeof jsonObj === 'string') {
        return Config.expandEnvVar(jsonObj) as T;
      } else {
        return jsonObj as T;
      }
    }

    /* Recursively process each key-value pair in the JSON object into a map. Strings should be expanded. */
    const configMap: Map<string, T> = new Map();
    Object.entries(jsonObj as Record<string, T>).forEach(([key, value]) => {
      if (typeof value === 'string') {
        configMap.set(key, Config.expandEnvVar(value));
      } else {
        configMap.set(key, Config.convertJSONToMap(value));
      }
    });
    return configMap as T;
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
            return EnvParser.getString(varName) as T;
          case NestableDataTypes.Number.toLowerCase():
            return EnvParser.getNumber(varName) as T;
          case NestableDataTypes.Boolean.toLowerCase():
            return EnvParser.getBoolean(varName) as T;
          case NestableDataTypes.Date.toLowerCase():
            return EnvParser.getDate(varName) as T;
          case NestableDataTypes.RegExp.toLowerCase():
            return EnvParser.getRegExp(varName) as T;
          case NestableDataTypes.Object.toLowerCase():
            return EnvParser.getObject(varName) as T;
          case NonNestableDataTypes.Array.toLowerCase():
            return EnvParser.getArray(varName, subtype1) as T;
          case NonNestableDataTypes.Set.toLowerCase():
            return EnvParser.getSet(varName, subtype1) as T;
          case NonNestableDataTypes.Map.toLowerCase():
            return EnvParser.getMap(varName, subtype1, subtype2) as T;
          default:
            /* Throw error if primary target conversion type is not supported */
            throw new UnsupportedTypeError(type);
        }
      }
    }
    /* Expand environment variable as a string */
    return input.replace(/\$\{([A-Z0-9_]+)\}/g, (match, varName) => EnvParser.getString(varName)) as T;
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
   * Private constructor
   */
  private constructor() { }
}

/* Configure module immediately upon import from dependent module */
Config.configure();
