import { SimpleAppConfigError } from './simpleAppConfigError';

/**
 * An error extending {@link SimpleAppConfigError} that should be thrown when type conversion failed to the target
 * type.
 */
export class TypeConversionError extends SimpleAppConfigError {
  /**
   * Constructor for {@link TypeConversionError}.
   * @param value The string value of the environment variable being converted.
   * @param targetType The type that the input value is being converted to.
   */
  public constructor(value: string, targetType: string) {
    super(`The string with value '${value}' cannot be converted to type '${targetType}'`);
    this.name = 'TypeConversionError';
    Object.setPrototypeOf(this, TypeConversionError.prototype);
  }
}
