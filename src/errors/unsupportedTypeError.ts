import { SimpleAppConfigError } from './simpleAppConfigError';

/**
 * An error extending {@link SimpleAppConfigError} that should be thrown when a string is being converted to a nonexistent type.
 */
export class UnsupportedTypeError extends SimpleAppConfigError {
  /**
   * The conversion type that is unsupported.
   */
  private type = '';

  /**
   * Constructor for {@link UnsupportedTypeError}.
   * @param type The type that the input value is being converted to.
   */
  public constructor(type: string) {
    super(`Converting to type '${type}' is not supported..`);
    this.name = 'UnsupportedTypeError';
    this.type = type;
    Object.setPrototypeOf(this, UnsupportedTypeError.prototype);
  }

  /**
   * Gets the type that caused the error
   * @returns The type that is nonexistent.
   */
  public getType() {
    return this.type;
  }
}
