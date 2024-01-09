/**
 * A generic env-config error.
 */
export class EnvConfigError extends Error {
  /**
   * Constructor for {@link EnvConfigError}.
   * @param message A custom error message.
   */
  constructor(message: string) {
    super(message);
    this.name = "EnvConfigError";
    Object.setPrototypeOf(this, EnvConfigError.prototype);
  }
}