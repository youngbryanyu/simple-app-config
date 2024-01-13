import { EnvVarConfigError } from "./envVarConfigError";

/**
 * An error extending {@link EnvVarConfigError} that should be thrown when the environment being set during module configuration *
 * is invalid. 
 */
export class InvalidEnvError extends EnvVarConfigError {
  /**
   * Constructor for {@link InvalidEnvError}.
   * @param environment The invalid environment.
   */
  constructor(environment: string) {
    super(`'${environment}' is not a valid environment.`);
    this.name = "InvalidEnvError";
    Object.setPrototypeOf(this, InvalidEnvError.prototype);
  }
}