import { SimpleAppConfigError } from './SimpleAppConfigError';

/**
 * An error extending {@link SimpleAppConfigError} that should be thrown when accessing an environment variable that is undefined.
 */
export class UndefinedEnvVarError extends SimpleAppConfigError {
  /**
   * Constructor for {@link UndefinedEnvVarError}.
   * @param key The key of the environment variable that is undefined.
   */
  public constructor(key: string) {
    super(`The environment variable '${key}' is undefined.`);
    this.name = 'UndefinedEnvVarError';
    Object.setPrototypeOf(this, UndefinedEnvVarError.prototype);
  }
}
