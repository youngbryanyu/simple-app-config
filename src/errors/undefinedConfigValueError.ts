import { SimpleAppConfigError } from "./SimpleAppConfigError";

/**
 * An error extending {@link SimpleAppConfigError} that should be thrown when attempting to access a value from a configuration 
 * file when the value is undefined.
 */
export class UndefinedConfigValueError extends SimpleAppConfigError {
  /**
   * Constructor for {@link UndefinedConfigValueError}.
   * @param key The configuration value that is undefined.
   */
  public constructor(key: string) {
    super(`The configuration value '${key}' is undefined.`);
    this.name = "UndefinedConfigValueError";
    Object.setPrototypeOf(this, UndefinedConfigValueError.prototype);
  }
}