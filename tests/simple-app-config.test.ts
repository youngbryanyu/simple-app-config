/* Unit tests for env-var-config */
import { CommandLineArgs, EnvArgs } from '../src/constants';
import { UndefinedConfigValueError } from '../src/errors/undefinedConfigValueError';
import { UndefinedEnvVarError } from '../src/errors/undefinedEnvVarError';
import { UnsupportedTypeError } from '../src/errors/unsupportedTypeError';
import Config, { EnvParser } from '../src/index';
import sinon from 'ts-sinon';

/* simple-app-config tests */
describe('simple-app-config Tests', () => {
  /* Setup before each test */
  beforeEach(() => {
    /* Restore all mocks */
    jest.restoreAllMocks();

    /* Restore sinon stubs */
    sinon.restore();

    /* Set the default path and dir of the config and files for tests */
    process.env[EnvArgs.ConfigPath] = `${__dirname}/config/testing.json`;
    process.env[EnvArgs.EnvPath] = `${__dirname}/.env.testing`;
    process.env[EnvArgs.ConfigDir] = `${__dirname}`;
    process.env[EnvArgs.EnvDir] = `${__dirname}`;
    process.env[EnvArgs.EnvNames] = 'development,testing,staging,production';
    Config.configure({ force: true });

    /* Reset all environment variables */
    for (const key in process.env) {
      delete process.env[key];
    }
  });

  /* Tests for the get function */
  describe('get tests', () => {
    /* Test getting any value from config file */
    it('should get a value successfully from the config file if it exists', () => {
      /* Set up */
      const key = 'ENV';
      const result = Config.get(key);

      /* Compare against expected */
      expect(result).toBe('TESTING');
    });

    /* Test when the config value doesn't exist */
    it("should throw an error if the config value doesn't exist", () => {
      /* Set up */
      const invalidKey = 'NOT A VALUE';

      /* Compare against expected */
      expect(() => Config.get(invalidKey)).toThrow(UndefinedConfigValueError);
    });

    /* Test parsing a nested value  */
    it('should be able to retrieve a nested config value where the value has been converted to the desired type', () => {
      /* Set up */
      const key = 'var1.var2.map';
      const result: Map<string, unknown> = Config.get(key);

      /* Compare against expected */
      expect(result instanceof Map).toBeTruthy();
      expect(result.has('cat')).toBe(true);
      expect(result.get('cat')).toBe('test');
      expect(result.has('bat')).toBe(true);
      expect(result.get('bat')).toBe('test');

      /* Set up deep nested array + map structure */
      const key2 = 'nested.array';
      const result2: Array<unknown> = Config.get(key2);

      /* Compare against expected */
      expect(result2 instanceof Array).toBeTruthy();
      expect(result2[0]).toBe('TESTING hi');
      expect(result2[1]).toBe(true);
      const nestedMap: Map<string, unknown> = result2[2] as Map<string, unknown>;
      expect(nestedMap instanceof Map).toBeTruthy();
      expect(nestedMap.has('test')).toBeTruthy();
      const doubleNestedMap: Map<string, unknown> = nestedMap.get('test') as Map<string, unknown>;
      expect(doubleNestedMap instanceof Map).toBeTruthy();
      expect(doubleNestedMap.has('cat')).toBeTruthy();
      expect(doubleNestedMap.get('cat')).toBe('test');
      expect(doubleNestedMap.has('bat')).toBeTruthy();
      expect(doubleNestedMap.get('bat')).toBe('test');
    });

    /* Test parsing an expanded string value  */
    it('should be able to retrieve a nested config value where the string value has been expanded', () => {
      /* Set up */
      const key = 'var1.var2.mapString';
      const result: string = Config.get(key);

      /* Compare against expected */
      expect(typeof result).toBe('string');
      expect(result).toBe('This is a map: {"cat": "test", "bat": "test"}');
    });

    /* Test parsing all types */
    it('should be able to parse and convert values of all types', () => {
      /* Set up */
      const stringVal = Config.get('string');
      const numberVal = Config.get('number');
      const booleanVal = Config.get('boolean');
      const dateVal = Config.get('date');
      const regexpVal = Config.get('regexp');
      const objectVal = Config.get('object');
      const arrayVal = Config.get('array');
      const setVal = Config.get('set');
      const mapVal = Config.get('map');

      /* Check string against expected */
      expect(typeof stringVal).toBe('string');
      expect(stringVal).toBe('STRING');

      /* Check number against expected */
      expect(typeof numberVal).toBe('number');
      expect(numberVal).toBe(3);

      /* Check boolean against expected */
      expect(typeof booleanVal).toBe('boolean');
      expect(booleanVal).toBe(false);

      /* Check date against expected */
      expect(dateVal instanceof Date).toBeTruthy;
      expect(JSON.stringify(dateVal)).toBe('"1970-01-01T00:00:10.000Z"');

      /* Check regexp against expected */
      expect(regexpVal instanceof RegExp).toBeTruthy;
      expect((regexpVal as RegExp).test('8')).toBe(true);

      /* Check object against expected */
      expect(objectVal instanceof Object).toBeTruthy();
      expect(Object.keys(objectVal as object)[0]).toBe('bat');
      expect(Object.values(objectVal as object)[0]).toBe(5);

      /* Check array against expected */
      expect(arrayVal instanceof Array).toBeTruthy();
      const array = arrayVal as Array<number>;
      expect(array[0]).toBe(1);
      expect(array[1]).toBe(2);
      expect(array[2]).toBe(3);

      /* Check set against expected */
      expect(setVal instanceof Set).toBeTruthy();
      const set = setVal as Set<number>;
      expect(set.has(1)).toBeTruthy();
      expect(set.has(2)).toBeTruthy();
      expect(set.has(3)).toBeTruthy();

      /* Check map against expected */
      expect(mapVal instanceof Map).toBeTruthy();
      const map = mapVal as Map<string, string>;
      expect(map.has('cat')).toBeTruthy();
      expect(map.has('bat')).toBeTruthy();
      expect(map.get('cat')).toBe('test');
      expect(map.get('bat')).toBe('test');
    });

    /* Test getting an invalid type */
    it('should throw an error if attempting to convert to an unsupported type.', () => {
      process.env[EnvArgs.ConfigPath] = `${__dirname}/config/invalid.json`;
      expect(() => Config.configure({ force: true })).toThrow(UnsupportedTypeError);
    });
  });

  /* Tests for the configure function */
  describe('configure tests', () => {
    /* Test normal configuration */
    it('should be able to configure the application and set the configuration and environment variables', () => {
      /* Set up */
      process.env[EnvArgs.ConfigPath] = `${__dirname}/config/testing.json`;
      process.env[EnvArgs.EnvPath] = `${__dirname}/.env.testing`;
      Config.configure({ force: true });

      /* Compare against expected */
      const env = Config.get('ENV'); /* Check if a value was loaded properly from the config file */
      expect(env).toBe('TESTING');
      const numberVal =
        EnvParser.getNumber('NUMBER'); /* Check if a value was loaded properly from the .env file */
      expect(numberVal).toBe(3);
    });

    /* Test configuring twice without forcing */
    it('should do nothing if configure is called a second time.', () => {
      /* Set up spies */
      jest.spyOn(EnvParser, 'refreshCache');

      /* Set up */
      process.env[EnvArgs.ConfigPath] = `${__dirname}/config/testing.json`;
      process.env[EnvArgs.EnvPath] = `${__dirname}/.env.testing`;
      Config.configure({ force: true });
      Config.configure();

      /* Compare against expected */
      expect(EnvParser.refreshCache).toHaveBeenCalledTimes(1);
    });

    /* Test setting custom environment names with environment variables */
    it('should be able to set custom environment names with environment variables.', () => {
      /* Set up */
      process.env[EnvArgs.Env] = 'beta';
      process.env[EnvArgs.EnvNames] = 'beta,prod';
      process.env[EnvArgs.ConfigDir] = `${__dirname}`;
      process.env[EnvArgs.EnvDir] = `${__dirname}`;
      Config.configure({ force: true });

      /* Compare against expected */
      expect(Config.get('ENV')).toBe('BETA');
    });

    /* Test setting custom environment names with command line args */
    it('should be able to set custom environment names with command line args and override lesser priority values.', () => {
      /* Set up */
      sinon
        .stub(process, 'argv')
        .value([
          `${CommandLineArgs.Env}beta`,
          `${CommandLineArgs.EnvNames}beta,prod`,
          `${CommandLineArgs.ConfigDir}${__dirname}`,
          `${CommandLineArgs.EnvDir}${__dirname}`
        ]);
      process.env[EnvArgs.Env] = 'prod';
      process.env[EnvArgs.EnvNames] = 'alpha,gamma';
      process.env[EnvArgs.ConfigDir] = '../..';
      process.env[EnvArgs.EnvDir] = '../..';
      Config.configure({ force: true });

      /* Compare against expected */
      expect(Config.get('ENV')).toBe('BETA');
    });

    /* Test setting environment with NODE_ENV */
    it('should be able to set the environment with the NODE_ENV environment variable.', () => {
      process.env[EnvArgs.Env] = 'production';
      process.env[EnvArgs.ConfigDir] = `${__dirname}`;
      process.env[EnvArgs.EnvDir] = `${__dirname}`; // TODO: changed
      Config.configure({ force: true });
      expect(Config.get('ENV')).toBe('PRODUCTION');
    });

    /* Test setting environment with command line args */
    it('should be able to set the environment with command line args and override lesser priority values.', () => {
      sinon.stub(process, 'argv').value([`${CommandLineArgs.Env}development`]);
      process.env[EnvArgs.Env] = 'production';
      Config.configure({ force: true });
      expect(Config.get('ENV')).toBe('DEVELOPMENT');
    });

    /* Test setting .env path with environment variable */
    it('should be able to set the .env path with environment variables.', () => {
      process.env[EnvArgs.EnvPath] = `${__dirname}/.env.production`;
      console.log(`${__dirname}/.env.production`)
      console.log(Config.environments);
      console.log(Config.envPaths);
      console.log(Config.configPaths);
      console.log(process.cwd())
      Config.configure({ force: true });
      expect(Config.get('ENV')).toBe('PRODUCTION');
    });

    /* Test setting .env path with command line argument */
    it('should be able to set the .env path with command line arguments, and have it override lower priority values', () => {
      sinon.stub(process, 'argv').value([`${CommandLineArgs.EnvPath}.env.production`]);
      // process.env[EnvArgs.ConfigPath] = `${__dirname}/config/beta.json`;
      process.env[EnvArgs.EnvPath] = `${__dirname}/.env.development`;
      Config.configure({ force: true });
      expect(Config.get('ENV')).toBe('PRODUCTION');
    });

    /* Test setting a .env path that is not found */
    it('should not load a .env file if no valid ones were found.', () => {
      sinon
        .stub(process, 'argv')
        .value([
          `${CommandLineArgs.Env}INVALID_ENV`,
          `${CommandLineArgs.ConfigPath}config/development.json`
        ]);
      expect(() => Config.configure({ force: true })).toThrow(UndefinedEnvVarError);
    });

    /* Test setting config path with environment variable */
    it('should be able to set the config path with environment variables.', () => {
      process.env[EnvArgs.ConfigPath] = `${__dirname}/config/other.json`;
      Config.configure({ force: true });
      expect(Config.get('ENV')).toBe('other');
    });

    /* Test setting config path with comand line argument */
    it('should be able to set the config path with command line arguments, and have it override lower priority values', () => {
      sinon
        .stub(process, 'argv')
        .value([`${CommandLineArgs.ConfigPath}${__dirname}/config/other.json`]);
      process.env[EnvArgs.ConfigPath] = `${__dirname}/config/development.json`;
      Config.configure({ force: true });
      expect(Config.get('ENV')).toBe('other');
    });

    /* Test setting config path that is not found */
    it("should not load a config file if no valid ones were found, and if the attempted ones don't exist", () => {
      sinon.stub(process, 'argv').value([`${CommandLineArgs.Env}INVALID_ENV`]);
      Config.configure({ force: true });
      expect(Config.get('ENV')).toBe('default');
    });

    /* Test setting a config path that is a directory */
    it('should not load a config file if it is a directory.', () => {
      sinon
        .stub(process, 'argv')
        .value([
          `${CommandLineArgs.Env}INVALID_ENV`,
          `${CommandLineArgs.ConfigPath}${__dirname}/config`
        ]);
      Config.configure({ force: true });
      expect(Config.get('ENV')).toBe('default');
    });

    /* Test setting a config path that isn't a supported file type */
    it("should not load a config file if it isn't a supported file type.", () => {
      sinon
        .stub(process, 'argv')
        .value([
          `${CommandLineArgs.Env}INVALID_ENV`,
          `${CommandLineArgs.ConfigPath}${__dirname}/config/unsupported.txt`
        ]);
      Config.configure({ force: true });
      expect(Config.get('ENV')).toBe('default');
    });

    /* Test loading an empty config file */
    it('should not load a config file if it is empty.', () => {
      sinon
        .stub(process, 'argv')
        .value([
          `${CommandLineArgs.Env}INVALID_ENV`,
          `${CommandLineArgs.ConfigPath}${__dirname}/config/empty.json`
        ]);
      Config.configure({ force: true });
      expect(Config.get('ENV')).toBe('default');
    });
  });
});
