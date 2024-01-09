import { EnvConfigError } from "./envConfigError";

/**
 * An error extending {@link EnvConfigError} that should be thrown when an environment variable is undefined, but is being accessed.
 */
export class UndefinedEnvVarError extends EnvConfigError {
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