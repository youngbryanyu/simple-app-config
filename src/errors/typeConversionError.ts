import { EnvVarConfigError } from "./envConfigError";

/**
 * An error extending {@link EnvVarConfigError} that should be thrown when an environment variable's value of type string is 
 * being converted to a different data type, but the conversion failed.
 */
export class TypeConversionError extends EnvVarConfigError {
  /**
   * Constructor for {@link UndefinedEnvVarError}.
   * @param value The string value of the environment variable being converted.
   * @param targetType The target that the input value is being converted to.
   */
  constructor(value: string, targetType: string ) {
    super(`The string with value ${value} cannot be converted to type ${targetType}.`);
    this.name = "TypeConversionError";
    Object.setPrototypeOf(this, TypeConversionError.prototype);
  }
}