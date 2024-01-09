/* Environment variable config loader */
import dotenv from 'dotenv';
import { UndefinedEnvVarError } from './errors/undefinedEnvVarError';
import typeConverter from './utils/typeConverter';

/**
 * Interface representing the setup options for {@link EnvConfig}
 */
interface EnvConfigOptions {
  /**
   * Custom mappings for NODE_ENV environments to .env file paths.
   */
  envFilePaths?: { [envName: string]: string };
  /**
   * Custom file path to use for the .env file.
   */
  customFilePath?: string
}

/**
 * Class representing the environment variable config loader
 */
class EnvConfig {
  /**
   * Instance of the env config module.
   */
  private static instance: EnvConfig | null = null;

  /**
   * The default .env file path
   */
  private static defaultEnvFilePath: string = '.env';

  /**
   * Standard env file paths
   */
  private static standardEnvFilePaths: { [key: string]: string } = {
    'development': '.env.development',
    'production': '.env.production',
    'testing': '.env.testing',
    'dev': '.env.dev',
    'prod': '.env.prod',
    'test': '.env.test',
  };

  /**
 * Configuration options for the env config module.
 */
  private options: EnvConfigOptions;

  /**
   * Constructor for {@link EnvConfig}
   */
  private constructor(options: EnvConfigOptions = {}) {
    /* Set configuration options */
    this.options = options;

    /* Try to find the file path of .env */
    const envFilePath = this.determineEnvFilePath();

    /* Load environment variables from .env file */
    dotenv.config({ path: envFilePath })

  }

  /**
   * Returns a single instance of {@link EnvConfig}. Initializes the instance if it hasn't been initialized yet.
   * @param envConfigOptions Optional parameter specifying configurations for the module.
   * @returns a single instance of {@link EnvConfig}.
   */
  public static getInstance(envConfigOptions?: EnvConfigOptions): EnvConfig {
    if (!EnvConfig.instance) {
      EnvConfig.instance = new EnvConfig(envConfigOptions);
    }
    return EnvConfig.instance;
  }

  private determineEnvFilePath(): string {
    const env = process.env.NODE_ENV;

    /* Check if any custom file path was specified */
    if (this.options.customFilePath) {
      return this.options.customFilePath
    }

    if (env) {
      /* Try to find any custom paths */
      if (this.options.envFilePaths) {
        const customPath = this.options.envFilePaths[env];
        if (customPath) {
          return customPath;
        }
      }

      /* Try to find standard file paths */
      const standardEnvPath = EnvConfig.standardEnvFilePaths[env];
      if (standardEnvPath) {
        return standardEnvPath;
      }
    }

    /* Fall back to default path */
    return EnvConfig.defaultEnvFilePath;
  }

  /**
   * Returns the value corresponding the to environment variable with name {@link key} in the environment variables.
   * @param key Name of the target environment variable.
   * @returns the value corresponding the to environment variable with name {@link key} in the environment variables.
   */
  public getValue(key: string): string | undefined {
    return process.env[key];
  }

  /**
   * Gets the specified environment variable and returns it as a string.
   * @param key The name of the environment variable.
   * @returns The value of the environment variable as a string.
   * @throws {UndefinedEnvVarError} Error thrown if the environment variable is not defined.
   */
  public getString(key: string): string {
    /* Check if value is undefined */
    const value = this.getValue(key);
    if (value === undefined) {
      throw new UndefinedEnvVarError(key);
    }

    return String(value);
  }

  /**
   * Gets the specified environment variable and returns it as a number.
   * @param key The name of the environment variable.
   * @returns The value of the environment variable as a number.
   * @throws {UndefinedEnvVarError} Error thrown if the environment variable is not defined.
   */
  public getNumber(key: string): number {
    /* Check if value is undefined */
    const value = this.getValue(key);
    if (value === undefined) {
      throw new UndefinedEnvVarError(key);
    }

    /* Convert value to number and return */
    return typeConverter.convertToNumber(value);
  }

  public getBoolean(key: string): boolean {
    /* Check if value is undefined */
    const value = this.getValue(key);
    if (value === undefined) {
      throw new UndefinedEnvVarError(key);
    }

    /* Convert value to boolean and return */
    return typeConverter.convertToBoolean(value);
  }
}

export default EnvConfig;