import { EnvVarConfigError } from "./envVarConfigError";

/**
 * An error extending {@link EnvVarConfigError} that should be thrown when a string is being converted to a nonexistent type.
 */
export class UnsupportedTypeError extends EnvVarConfigError {

  /**
   * The conversion type that is unsupported.
   */
  type = "";

  /**
   * Constructor for {@link UndefinedEnvVarError}.
   * @param value The string value of the environment variable being converted.
   * @param targetType The target that the input value is being converted to.
   */
  constructor(type: string) {
    super(`Converting to type '${type}' is not supported.`);
    this.name = "UnsupportedTypeError";
    this.type = type;
    Object.setPrototypeOf(this, UnsupportedTypeError.prototype);
  }

  /**
   * Gets the type that caused the error
   * @returns The type that is nonexistent.
   */
  getType() {
    return this.type;
  }
}