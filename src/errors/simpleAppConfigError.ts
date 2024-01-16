/**
 * A generic error when using using the simple-app-config.
 */
export class SimpleAppConfigError extends Error {
  /**
   * Constructor for {@link SimpleAppConfigError}.
   * @param message A custom error message.
   */
  public constructor(message: string) {
    super(message);
    this.name = 'SimpleAppConfigError';
    Object.setPrototypeOf(this, SimpleAppConfigError.prototype);
  }
}
