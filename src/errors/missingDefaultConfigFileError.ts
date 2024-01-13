import { EnvVarConfigError } from "./envVarConfigError";

/**
 * An error extending {@link EnvVarConfigError} that should be thrown when a config file is missing.
 */
export class MissingConfigFileError extends EnvVarConfigError {
  /**
   * Constructor for {@link MissingConfigFileError}.
   * @param path The path of the missing config file.
   */
  constructor(path: string) {
    super(`The default config file with path '${path}' is missing.`);
    this.name = "MissingConfigFileError";
    Object.setPrototypeOf(this, MissingConfigFileError.prototype);
  }
}