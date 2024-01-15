/**
 * Enums for data types that can be nested in Arrays, Sets, and Maps during type conversion from environment variables.
 * - string, number, boolean, and object are the string literal values when `typeof` is ran against variables of those types.
 * - Date and RegExp are classes that instances can be instantiated of.
 */
export enum NestableDataTypes {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Date = 'Date',
  RegExp = 'RegExp',
  Object = 'object'
}

/**
 * Enums for data types that cannot be nested in Arrays, Sets, and Maps during type conversion form environment variables.
 * - Array, Set, and Map are classes that instances can be instantiated of.
 */
export enum NonNestableDataTypes {
  Array = 'Array',
  Set = 'Set',
  Map = 'Map'
}

/**
 * Supported file extensions for config files
 */
export enum FileTypes {
  JSON = '.json'
}

/**
 * The default environments 
 */
export enum Environments {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  STAGING = 'staging',
  PRODUCTION = 'production'
}

/**
 * Command line arguments that can be specified when the application starts
 */
export enum COMMAND_LINE_ARGS {
  ENV = '--env=',                     /* The environment */
  ENV_PATH = '--env-path=',           /* The path to the .env file */
  ENV_DIR = '--env-dir=',             /* The path to the .env dir */
  ENV_NAMES = '--env-names=',         /* Custom environment names */
  CONFIG_PATH = '--config-path=',     /* The path to the config file */
  CONFIG_DIR = '--config-dir='        /* The path to the config dir */
}

/**
 * Environment variables that can be set to change configurations
 */
export enum ENV_ARGS {
  ENV = 'NODE_ENV',                  /* The environment */
  ENV_PATH = 'ENV_PATH',             /* The path to the .env file */
  ENV_DIR = 'ENV_DIR',               /* The path to the .env dir */
  ENV_NAMES = 'ENV_NAMES',           /* Custom environments */
  CONFIG_PATH = 'CONFIG_PATH',       /* The path to the config file */
  CONFIG_DIR = 'CONFIG_DIR'          /* The path to the config dir */
}