// Type declaration for the env-var-config module

declare module 'env-var-config' {
    
  interface EnvConfigOptions {
      envFilePaths?: { [envName: string]: string };
      customFilePath?: string;
  }

  class EnvConfig {
      private constructor(options?: EnvConfigOptions);

      static getInstance(options?: EnvConfigOptions): EnvConfig;

      getString(key: string): string;
      getNumber(key: string): number;
      getBoolean(key: string): boolean;
  }

  export default EnvConfig;
}
