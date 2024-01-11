import { EnvConfigError } from "./envConfigError";

/**
 * An error extending {@link EnvConfigError} that should be thrown when an environment variable with string value is being converted to a
 * different data type, but the conversion failed.
 */
export class TypeConversionError extends EnvConfigError {
  /**
   * Constructor for {@link UndefinedEnvVarError}.
   * @param value The value of the environment variable being converted.
   * @param targetType The target type being converted to.
   */
  constructor(value: string, targetType: string ) {
    super(`The string with value ${value} cannot be converted to type ${targetType}.`);
    this.name = "TypeConversionError";
    Object.setPrototypeOf(this, TypeConversionError.prototype);
  }
}