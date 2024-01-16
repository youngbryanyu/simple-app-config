/* Unit tests for env-var-config */
import { DataTypes, EnvParser } from '../../src/index';
import { UndefinedEnvVarError } from '../../src/errors/undefinedEnvVarError';

/* simple-app-config tests */
describe('envParser Tests', () => {
  /* Setup before each test */
  beforeEach(() => {
    /* Restore all mocks */
    jest.restoreAllMocks();

    /* Clear the env config cache */
    EnvParser.clearCache();

    /* Delete all environment variables */
    for (const key in process.env) {
      delete process.env[key];
    }
  });

  /* Tests for refreshEnvCache*/
  describe('refreshCache Tests', () => {
    /* Test clearing the cache */
    it('Should clear the cache', () => {
      /* Set up spies and mocks */
      EnvParser.setValue('PORT', '8000');
      jest.spyOn(Map.prototype, 'clear');
      jest.spyOn(Map.prototype, 'set');

      /* Call function */
      EnvParser.refreshCache();

      /* Compare against expected */
      expect(Map.prototype.clear).toHaveBeenCalled();
      expect(Map.prototype.set).toHaveBeenCalled();
    });
  });

  /* Tests for setEnvValue */
  describe('setValue Tests', () => {
    /* Test setting a value */
    it('Should set a value', () => {
      /* Set up spies and mocks */
      jest.spyOn(Map.prototype, 'set');

      /* Call function */
      EnvParser.setValue('PORT', '8000');

      /* Compare against expected */
      expect(Map.prototype.set).toHaveBeenCalled();
      expect(EnvParser.getString('PORT')).toBe('8000');
    });
  });

  /* Tests for deleteEnvValue */
  describe('deleteEnvValue Tests', () => {
    /* Test deleting a value */
    it('Should delete a value', () => {
      /* Set up spies and mocks */
      jest.spyOn(Map.prototype, 'delete');

      /* Call function */
      EnvParser.setValue('PORT', '8000');
      EnvParser.deleteValue('PORT');

      /* Compare against expected */
      expect(() => EnvParser.getString('PORT')).toThrow(UndefinedEnvVarError);
      expect(Map.prototype.delete).toHaveBeenCalled();
    });
  });

  /* Tests for getStringFromEnv */
  describe('getString Tests', () => {
    /* Test getting a string value and its in cache */
    it('Should get a string value and should get it from the cache ', () => {
      /* Set up */
      EnvParser.setValue('PORT', '8000');
      jest.spyOn(Map.prototype, 'get');

      /* Call function */
      const result = EnvParser.getString('PORT');

      /* Compare against expected */
      expect(Map.prototype.get).toHaveBeenCalled();
      expect(typeof result).toBe('string');
      expect(result).toBe('8000');
    });

    /* Test getting a string value and its not in cache */
    it('Should get a string value when its not in the cache', () => {
      /* Set up */
      process.env['PORT'] = '8000';
      jest.spyOn(Map.prototype, 'get');

      /* Call function */
      const result = EnvParser.getString('PORT');

      /* Compare against expected */
      expect(Map.prototype.get).not.toHaveBeenCalled();
      expect(typeof result).toBe('string');
      expect(result).toBe('8000');
    });

    /* Test getting a string value and its undefined */
    it('Should throw an error when the environment variable is undefined ', () => {
      /* Set up */
      EnvParser.deleteValue('PORT');

      /* Call function and Compare against expected */
      expect(() => EnvParser.getString('PORT')).toThrow(UndefinedEnvVarError);
    });
  });

  /* Tests for getNumberFromEnv */
  describe('getNumber Tests', () => {
    /* Test getting a number value */
    it('Should get a number value', () => {
      /* Set up */
      EnvParser.setValue('PORT', '8000');

      /* Call function */
      const result = EnvParser.getNumber('PORT');

      /* Compare against expected */
      expect(typeof result).toBe('number');
      expect(result).toBe(8000);
    });
  });

  /* Tests for getBooleanFromEnv */
  describe('getBoolean Tests', () => {
    /* Test getting a boolean value */
    it('Should get a boolean value', () => {
      /* Set up */
      EnvParser.setValue('FLAG', 'F');

      /* Call function */
      const result = EnvParser.getBoolean('FLAG');

      /* Compare against expected */
      expect(typeof result).toBe('boolean');
      expect(result).toBe(false);
    });
  });

  /* Tests for getDateFromEnv */
  describe('getDate Tests', () => {
    /* Test getting a date value */
    it('Should get a Date value', () => {
      /* Set up */
      EnvParser.setValue('DATE', 'Wed Dec 31 1969');

      /* Call function */
      const result = EnvParser.getDate('DATE');

      /* Compare against expected */
      expect(result instanceof Date).toBeTruthy();
      expect(result.getUTCFullYear()).toBe(1969);
      expect(result.getUTCMonth()).toBe(11); // Note: Months are 0-indexed in JavaScript Dates
      expect(result.getUTCDate()).toBe(31);
    });
  });

  /* Tests for getRegExpFromEnv */
  describe('getRegExp Tests', () => {
    /* Test getting a RegExp value */
    it('Should get a RegExp value', () => {
      /* Set up */
      EnvParser.setValue('REGEXP', '[0-9]');

      /* Call function */
      const result = EnvParser.getRegExp('REGEXP');

      /* Compare against expected */
      expect(result instanceof RegExp).toBeTruthy();
      expect(result.test('8')).toBeTruthy();
    });
  });

  /* Tests for getObjectFromEnv */
  describe('getObject Tests', () => {
    /* Test getting an object value */
    it('Should get an object value', () => {
      /* Set up */
      EnvParser.setValue('OBJECT', '{"cat": "dog"}');

      /* Call function */
      const result = EnvParser.getObject('OBJECT');

      /* Compare against expected */
      expect(result instanceof Object).toBeTruthy();
      expect(Object.keys(result)[0]).toBe('cat');
      expect(Object.values(result)[0]).toBe('dog');
    });
  });

  /* Tests for getArrayFromEnv */
  describe('getArray Tests', () => {
    /* Test getting an Array value */
    it('Should get an Array value', () => {
      /* Set up */
      EnvParser.setValue('ARRAY', '[1, 2, 3]');

      /* Call function */
      const result = EnvParser.getArray('ARRAY', DataTypes.Number);

      /* Compare against expected */
      expect(result instanceof Array).toBeTruthy();
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(2);
      expect(result[2]).toBe(3);
    });
  });

  /* Tests for getSetFromEnv */
  describe('getSet Tests', () => {
    /* Test getting an Set value */
    it('Should get a Set value', () => {
      /* Set up */
      EnvParser.setValue('SET', '[1, 2, 3]');

      /* Call function */
      const result = EnvParser.getSet('SET', DataTypes.Number);

      /* Compare against expected */
      expect(result instanceof Set).toBeTruthy();
      expect(result.has(1)).toBeTruthy();
      expect(result.has(2)).toBeTruthy();
      expect(result.has(3)).toBeTruthy();
    });
  });

  /* Tests for getMapFromEnv */
  describe('getMap Tests', () => {
    /* Test getting a Map value */
    it('Should get a Map value', () => {
      /* Set up */
      EnvParser.setValue('MAP', '{"cat": "5", "dog": "3"}');

      /* Call function */
      const result = EnvParser.getMap('MAP', DataTypes.String, DataTypes.Number);

      /* Compare against expected */
      expect(result instanceof Map).toBeTruthy();
      expect(result.get('cat')).toBe(5);
      expect(result.get('dog')).toBe(3);
    });
  });
});
