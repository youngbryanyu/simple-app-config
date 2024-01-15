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
  Json = '.json'
}

/**
 * The default environments 
 */
export enum Environments {
  Development = 'development',
  Testing = 'testing',
  Staging = 'staging',
  Production = 'production'
}

/**
 * Command line arguments that can be specified when the application starts
 */
export enum CommandLineArgs {
  Env = '--env=',                    /* The environment */
  EnvPath = '--env-path=',           /* The path to the .env file */
  EnvDir = '--env-dir=',             /* The path to the .env dir */
  EnvNames = '--env-names=',         /* Custom environment names */
  ConfigPath = '--config-path=',     /* The path to the config file */
  ConfigDir = '--config-dir='        /* The path to the config dir */
}

/**
 * Environment variables that can be set to change configurations
 */
export enum EnvArgs {
  Env = 'NODE_ENV',                 /* The environment */
  EnvPath = 'ENV_PATH',             /* The path to the .env file */
  EnvDir = 'ENV_DIR',               /* The path to the .env dir */
  EnvNames = 'ENV_NAMES',           /* Custom environments */
  ConfigPath = 'CONFIG_PATH',       /* The path to the config file */
  ConfigDir = 'CONFIG_DIR'          /* The path to the config dir */
}