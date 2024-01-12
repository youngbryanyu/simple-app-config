import { EnvVarConfigError } from "./envConfigError";

/**
 * An error extending {@link EnvVarConfigError} that should be thrown when an environment variable is undefined, but is being 
 * accessed.
 */
export class UndefinedEnvVarError extends EnvVarConfigError {
  /**
   * Constructor for {@link UndefinedEnvVarError}.
   * @param message A custom error message.
   */
  constructor(key: string) {
    super(`The environment variable ${key} is undefined.`);
    this.name = "UndefinedEnvVarError";
    Object.setPrototypeOf(this, UndefinedEnvVarError.prototype);
  }
}