import { EnvVarConfigError } from "./envVarConfigError";

/**
 * An error extending {@link EnvVarConfigError} that should be thrown when attempting to access a value from a configuration file, 
 * but the value is undefined
 */
export class UndefinedConfigValueError extends EnvVarConfigError {
  /**
   * Constructor for {@link UndefinedConfigValueError}.
   * @param key The configuration value that is undefined.
   */
  constructor(key: string) {
    super(`The configuration value '${key}' is undefined.`);
    this.name = "UndefinedConfigValueError";
    Object.setPrototypeOf(this, UndefinedConfigValueError.prototype);
  }
}