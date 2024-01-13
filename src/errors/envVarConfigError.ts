/**
 * A generic error when using env-var-config.
 */
export class EnvVarConfigError extends Error {
  /**
   * Constructor for {@link EnvVarConfigError}.
   * @param message A custom error message.
   */
  constructor(message: string) {
    super(message);
    this.name = "EnvVarConfigError";
    Object.setPrototypeOf(this, EnvVarConfigError.prototype);
  }
}