/* Unit tests for env-var-config */
import { COMMAND_LINE_ARGS, ENV_ARGS } from '../src/constants';
import { UndefinedConfigValueError } from '../src/errors/undefinedConfigValueError';
import Config, { EnvParser } from '../src/index';
import sinon from 'ts-sinon';

/* simple-app-config tests */
describe('simple-app-config Tests', () => {
  /* Setup before each test */
  beforeEach(() => {
    /* Restore all mocks */
    jest.restoreAllMocks();

    /* Set the default path and dir of the config and files for tests */
    process.env[ENV_ARGS.CONFIG_PATH] = `${__dirname}/config/testing.json`;
    process.env[ENV_ARGS.ENV_PATH] = `${__dirname}/.env.testing`;
    process.env[ENV_ARGS.CONFIG_DIR] = `${__dirname}`;
    process.env[ENV_ARGS.ENV_DIR] = `${__dirname}`;
    Config.configure({ force: true });

    /* Restore sinon stubs */
    sinon.restore()

    /* Reset all environment variables */
    for (const key in process.env) {
      if (process.env.hasOwnProperty(key)) {
        delete process.env[key];
      }
    }
  });

  /* Tests for the get function */
  describe('get tests', () => {
    /* Test getting any value from config file */
    it('should get a value successfully from the config file if it exists', () => {
      /* Set up spies */
      jest.spyOn(Config, 'get');

      /* Set up */
      const key = 'ENV';
      const result = Config.get(key);

      /* Compare against expected */
      expect(Config.get).toHaveBeenCalled();
      expect(result).toBe('TESTING');
    });

    /* Test when the config value doesn't exist */
    it('should throw an error if the config value doesn\'t exist', () => {
      /* Set up spies */
      jest.spyOn(Config, 'get');

      /* Set up */
      const invalidKey = 'NOT A VALUE'

      /* Compare against expected */
      expect(() => Config.get(invalidKey)).toThrow(UndefinedConfigValueError);
      expect(Config.get).toHaveBeenCalled();
    });

    /* Test parsing a nested value  */
    it('should be able to retrieve a nested config value where the value has been converted to the desired type', () => {
      /* Set up spies */
      jest.spyOn(Config, 'get');

      /* Set up */
      const key = 'var1.var2.map';
      const result: Map<string, unknown> = Config.get(key);

      /* Compare against expected */
      expect(result instanceof Map).toBeTruthy();
      expect(result.has('cat')).toBe(true);
      expect(result.get('cat')).toBe('test');
      expect(result.has('bat')).toBe(true);
      expect(result.get('bat')).toBe('test');
      expect(Config.get).toHaveBeenCalled();

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
      expect(Config.get).toHaveBeenCalled();
    });

    /* Test parsing an expanded string value  */
    it('should be able to retrieve a nested config value where the string value has been expanded', () => {
      /* Set up spies */
      jest.spyOn(Config, 'get');

      /* Set up */
      const key = 'var1.var2.mapString';
      const result: string = Config.get(key);

      /* Compare against expected */
      expect(typeof result).toBe('string');
      expect(result).toBe('This is a map: {"cat": "test", "bat": "test"}')
      expect(Config.get).toHaveBeenCalled();
    });

    /* Test parsing all types */
    it('should be able to parse and convert values of all types', () => {
      /* Set up spies */
      jest.spyOn(Config, 'get');

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
      expect(Config.get).toHaveBeenCalled();
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
      expect(JSON.stringify(dateVal)).toBe("\"1970-01-01T00:00:10.000Z\"");

      /* Check regexp against expected */
      expect(regexpVal instanceof RegExp).toBeTruthy;
      expect((regexpVal as RegExp).test('8')).toBe(true);

      /* Check object against expected */
      expect(objectVal instanceof Object).toBeTruthy();
      expect(Object.keys(objectVal as Object)[0]).toBe('bat');
      expect(Object.values(objectVal as Object)[0]).toBe(5);

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
  });

  /* Tests for the configure function */
  describe('configure tests', () => {
    /* Test normal configuration */
    it('should be able to configure the application and set the configuration and environment variables', () => {
      /* Set up spy */
      jest.spyOn(Config, 'configure');

      /* Set up */
      process.env[ENV_ARGS.CONFIG_PATH] = `${__dirname}/config/testing.json`;
      process.env[ENV_ARGS.ENV_PATH] = `${__dirname}/.env.testing`;
      Config.configure({ force: true });

      /* Compare against expected */
      expect(Config.configure).toHaveBeenCalled();
      const env = Config.get('ENV');  /* Check if a value was loaded properly from the config file */
      expect(env).toBe('TESTING');
      const numberVal = EnvParser.getNumber('NUMBER'); /* Check if a value was loaded properly from the .env file */
      expect(numberVal).toBe(3);
    });

    /* Test configuring twice without forcing */
    it('should do nothing if configure is called a second time.', () => {
      /* Set up spies */
      jest.spyOn(Config, 'configure');
      jest.spyOn(EnvParser, 'refreshCache')

      /* Set up */
      process.env[ENV_ARGS.CONFIG_PATH] = `${__dirname}/config/testing.json`;
      process.env[ENV_ARGS.ENV_PATH] = `${__dirname}/.env.testing`;
      Config.configure({ force: true });
      Config.configure();

      /* Compare against expected */
      expect(Config.configure).toHaveBeenCalled();
      expect(EnvParser.refreshCache).toHaveBeenCalledTimes(1);
    });

    /* Test setting custom environment names with environment variables */
    it('should be able to set custom environment names with environment variables.', () => {
      /* Set up spies */
      jest.spyOn(Config, 'configure');

      /* Set up */
      process.env[ENV_ARGS.ENV] = 'beta';
      process.env[ENV_ARGS.ENV_NAMES] = 'beta,prod';
      process.env[ENV_ARGS.CONFIG_DIR] = `${__dirname}`;
      process.env[ENV_ARGS.ENV_DIR] = `${__dirname}`;
      Config.configure({ force: true });

      /* Compare against expected */
      expect(Config.configure).toHaveBeenCalled();
      expect(Config.get('ENV')).toBe('BETA');
    });

    /* Test setting custom environment names with command line args */
    it('should be able to set custom environment names with command line args and override lesser priority values.', () => {
      /* Set up spies */
      jest.spyOn(Config, 'configure');

      /* Set up */
      // process.argv.push(`${COMMAND_LINE_ARGS.ENV}beta`);
      // process.argv.push(`${COMMAND_LINE_ARGS.ENV_NAMES}beta,prod`);
      // process.argv.push(`${COMMAND_LINE_ARGS.CONFIG_DIR}${__dirname}`);
      // process.argv.push(`${COMMAND_LINE_ARGS.ENV_DIR}${__dirname}`);
      sinon.stub(process, 'argv').value([
        `${COMMAND_LINE_ARGS.ENV}beta`, 
        `${COMMAND_LINE_ARGS.ENV_NAMES}beta,prod`, 
        `${COMMAND_LINE_ARGS.CONFIG_DIR}${__dirname}`,
        `${COMMAND_LINE_ARGS.ENV_DIR}${__dirname}`
      ]);
      process.env[ENV_ARGS.ENV] = 'prod';
      process.env[ENV_ARGS.ENV_NAMES] = 'alpha,gamma';
      process.env[ENV_ARGS.CONFIG_DIR] = '../..';
      process.env[ENV_ARGS.ENV_DIR] = '../..';
      Config.configure({ force: true });

      /* Compare against expected */
      expect(Config.configure).toHaveBeenCalled();
      expect(Config.get('ENV')).toBe('BETA');
    });

    /* Test setting environment with NODE_ENV */
    it('should be able to set the environment with the NODE_ENV environment variable.', () => {
      // /* Set up spies */
      // jest.spyOn(Config, 'configure');

      // /* Set up */
      // process.argv.push(`${COMMAND_LINE_ARGS.ENV}beta`);
      // process.argv.push(`${COMMAND_LINE_ARGS.ENV_NAMES}beta,prod`);
      // process.argv.push(`${COMMAND_LINE_ARGS.CONFIG_DIR}${__dirname}`);
      // process.argv.push(`${COMMAND_LINE_ARGS.ENV_DIR}${__dirname}`);
      // process.env[ENV_ARGS.ENV] = 'prod';
      // process.env[ENV_ARGS.ENV_NAMES] = 'alpha,gamma';
      // process.env[ENV_ARGS.CONFIG_DIR] = '../..';
      // process.env[ENV_ARGS.ENV_DIR] = '../..';
      // Config.configure({ force: true });

      // /* Compare against expected */
      // expect(Config.configure).toHaveBeenCalled();
      // expect(Config.get('ENV')).toBe('BETA');

      // TODO
    });

    /* Test setting environment with command line args */
    it('should be able to set the environment with command line args and override lesser priority values.', () => {
      // /* Set up spies */
      // jest.spyOn(Config, 'configure');

      // /* Set up */
      // process.argv.push(`${COMMAND_LINE_ARGS.ENV}beta`);
      // process.argv.push(`${COMMAND_LINE_ARGS.ENV_NAMES}beta,prod`);
      // process.argv.push(`${COMMAND_LINE_ARGS.CONFIG_DIR}${__dirname}`);
      // process.argv.push(`${COMMAND_LINE_ARGS.ENV_DIR}${__dirname}`);
      // process.env[ENV_ARGS.ENV] = 'prod';
      // process.env[ENV_ARGS.ENV_NAMES] = 'alpha,gamma';
      // process.env[ENV_ARGS.CONFIG_DIR] = '../..';
      // process.env[ENV_ARGS.ENV_DIR] = '../..';
      // Config.configure({ force: true });

      // /* Compare against expected */
      // expect(Config.configure).toHaveBeenCalled();
      // expect(Config.get('ENV')).toBe('BETA');

      // TODO
    });

    // check at end:
    // TODO: test default value being used
    // TODO: test default value overriden
    // TODO: test empty file  -> shoulnd't throw anything
    // TODO: cascading priority of findConfigFile
    // TODO: cascading priority of findEnvFile
  });
});