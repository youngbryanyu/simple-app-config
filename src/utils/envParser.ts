import { UndefinedEnvVarError } from "../errors/undefinedEnvVarError";
import TypeConverter from "./typeConverter";

/* Util for retrieving and parsing environment variables into their desired types */
export class EnvParser {

  /**
 * Cache Map for environment variables to speed up retrieval due to system calls being slower than retrieving from memory.
 * Populated in the following scenarios:
 * - When {@link Config.refreshEnvCache} is called
 * - When {@link Config.setEnvValue} is called
 */
  private static envCache: Map<string, string | undefined> = new Map();

  /**
   * Clears the environment variable cache and updates the cache with the most up-to-date environment variables
   */
  public static refreshEnvCache(): void {
    /* Clear the cache */
    EnvParser.clearCache();

    /* Load all existing environment variables in the cache */
    for (const key in process.env) {
      EnvParser.envCache.set(key, process.env[key]);
    }
  }

  /**
   * Removes all elements from the cache.
   */
  public static clearCache(): void {
    EnvParser.envCache.clear();
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
    EnvParser.envCache.set(key, value);
  }

  /**
   * Deletes an environment variable and removes it from the cache.
   * @param key Key or name of the environment variable.
   */
  public static deleteEnvValue(key: string): void {
    /* Update value in process.env */
    delete process.env[key];

    /* Delete from cache */
    EnvParser.envCache.delete(key);
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
    if (EnvParser.envCache.has(key)) {
      return EnvParser.envCache.get(key);
    }

    /* Lazy load value from process.env into cache */
    const value = process.env[key];
    EnvParser.envCache.set(key, value);
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
    const value = EnvParser.getValueFromEnv(key);
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
    const value = EnvParser.getStringFromEnv(key);

    /* Convert value to number and return it */
    return TypeConverter.convertToNumber(value);
  }

  /**
   * Gets the specified environment variable and returns it as a boolean.
   * @param key The name of the environment variable.
   * @returns The value of the environment variable as a boolean.
   */
  public static getBooleanFromEnv(key: string): boolean {
    /* Get environment variable value as string */
    const value = EnvParser.getStringFromEnv(key);

    /* Convert value to boolean and return it */
    return TypeConverter.convertToBoolean(value);
  }

  /**
   * Gets the specified environment variable and returns it as a date.
   * @param key The name of the environment variable.
   * @returns The value of the environment variable as a date.
   */
  public static getDateFromEnv(key: string): Date {
    /* Get environment variable value as string */
    const value = EnvParser.getStringFromEnv(key);

    /* Convert value to date and return it */
    return TypeConverter.convertToDate(value);
  }

  /**
   * Gets the specified environment variable and returns it as a RegExp.
   * @param key The name of the environment variable.
   * @returns The value of the environment variable as a RegExp.
   */
  public static getRegExpFromEnv(key: string): RegExp {
    /* Get environment variable value as string */
    const value = EnvParser.getStringFromEnv(key);

    /* Convert value to date and return it */
    return TypeConverter.convertToRegExp(value);
  }

  /**
   * Gets the specified environment variable and returns it as an object.
   * @param key The name of the environment variable.
   * @returns The value of the environment variable as an object.
   */
  public static getObjectFromEnv(key: string): object {
    /* Get environment variable value as string */
    const value = EnvParser.getStringFromEnv(key);

    /* Convert value to date and return it */
    return TypeConverter.convertToObject(value);
  }

  /**
   * Gets the specified environment variable and returns it as an Array.
   * If the type is ommitted each element will default to type string when conversion occurs.
   * @param key The name of the environment variable.
   * @returns The value of the environment variable as an Array.
   */
  public static getArrayFromEnv<T>(key: string, type?: string): Array<T> {
    /* Get environment variable value as string */
    const value = EnvParser.getStringFromEnv(key);

    /* Convert value to array and return it */
    return TypeConverter.convertToArray(value, type);
  }

  /**
   * Gets the specified environment variable and returns it as a Set.
   * If the type is ommitted each element will default to string when conversion occurs.
   * @param key The name of the environment variable.
   * @returns The value of the environment variable as a Set.
   */
  public static getSetFromEnv<T>(key: string, type?: string): Set<T> {
    /* Get environment variable value as string */
    const value = EnvParser.getStringFromEnv(key);

    /* Convert value to array and return it */
    return TypeConverter.convertToSet(value, type);
  }

  /**
   * Gets the specified environment variable and returns it as a Map. 
   * If the keyType and valueType are ommitted the keys and will default to type string when conversion occurs.
   * @param key The name of the environment variable.
   * @returns The value of the environment variable as a Map.
   */
  public static getMapFromEnv<K, V>(key: string, keyType?: string, valueType?: string): Map<K, V> {
    /* Get environment variable value as string */
    const value = EnvParser.getStringFromEnv(key);

    /* Convert value to array and return it */
    return TypeConverter.convertToMap(value, keyType, valueType);
  }
}

/* Set the default export */
export default EnvParser;