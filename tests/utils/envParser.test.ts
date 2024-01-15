/* Unit tests for env-var-config */
import { DataTypes, EnvParser } from '../../src/index';
import { UndefinedEnvVarError } from '../../src/errors/undefinedEnvVarError';

/* simple-app-config tests */
describe('envParser Tests', () => {
  /* Setup before each test */
  beforeEach(() => {
    /* Restore all mocks */
    jest.restoreAllMocks();

    EnvParser.clearCache();

    /* Delete all environment variables */
    for (const key in process.env) {
      if (process.env.hasOwnProperty(key)) {
        delete process.env[key];
      }
    }
  });

  /* Tests for refreshEnvCache*/
  describe('refreshEnvCache Tests', () => {
    /* Test clearing the cache */
    it('Should clear the cache', () => {
      /* Set up spies and mocks */
      jest.spyOn(EnvParser, 'refreshEnvCache');
      EnvParser.setEnvValue('PORT', '8000');
      jest.spyOn(Map.prototype, 'clear');
      jest.spyOn(Map.prototype, 'set');

      /* Call function */
      EnvParser.refreshEnvCache();

      /* Compare against expected */
      expect(EnvParser.refreshEnvCache).toHaveBeenCalled();
      expect(Map.prototype.clear).toHaveBeenCalled();
      expect(Map.prototype.set).toHaveBeenCalled();
    });
  });

  /* Tests for setEnvValue */
  describe('setEnvValue Tests', () => {
    /* Test setting a value */
    it('Should set a value', () => {
      /* Set up spies and mocks */
      jest.spyOn(EnvParser, 'setEnvValue');
      jest.spyOn(Map.prototype, 'set');

      /* Call function */
      EnvParser.setEnvValue('PORT', '8000');

      /* Compare against expected */
      expect(EnvParser.setEnvValue).toHaveBeenCalled();
      expect(Map.prototype.set).toHaveBeenCalled();
      expect(EnvParser.getStringFromEnv('PORT')).toBe('8000');
    });
  });

  /* Tests for deleteEnvValue */
  describe('deleteEnvValue Tests', () => {
    /* Test deleting a value */
    it('Should delete a value', () => {
      /* Set up spies and mocks */
      jest.spyOn(EnvParser, 'setEnvValue');
      jest.spyOn(Map.prototype, 'delete');

      /* Call function */
      EnvParser.setEnvValue('PORT', '8000');
      EnvParser.deleteEnvValue('PORT');

      /* Compare against expected */
      expect(() => EnvParser.getStringFromEnv('PORT')).toThrow(UndefinedEnvVarError);
      expect(EnvParser.setEnvValue).toHaveBeenCalled();
      expect(Map.prototype.delete).toHaveBeenCalled();
    });
  });

  /* Tests for getStringFromEnv */
  describe('getStringFromEnv Tests', () => {
    /* Test getting a string value and its in cache */
    it('Should get a string value and should get it from the cache ', () => {
      /* Set up */
      EnvParser.setEnvValue('PORT', '8000');
      jest.spyOn(EnvParser, 'getStringFromEnv');
      jest.spyOn(Map.prototype, 'get');

      /* Call function */
      const result = EnvParser.getStringFromEnv('PORT');

      /* Compare against expected */
      expect(EnvParser.getStringFromEnv).toHaveBeenCalled();
      expect(Map.prototype.get).toHaveBeenCalled();
      expect(typeof result).toBe('string');
      expect(result).toBe('8000');
    });

    /* Test getting a string value and its not in cache */
    it('Should get a string value when its not in the cache', () => {
      /* Set up */
      process.env['PORT'] = '8000';
      jest.spyOn(EnvParser, 'getStringFromEnv');
      jest.spyOn(Map.prototype, 'get');

      /* Call function */
      const result = EnvParser.getStringFromEnv('PORT');

      /* Compare against expected */
      expect(EnvParser.getStringFromEnv).toHaveBeenCalled();
      expect(Map.prototype.get).not.toHaveBeenCalled();
      expect(typeof result).toBe('string');
      expect(result).toBe('8000');
    });

    /* Test getting a string value and its undefined */
    it('Should throw an error when the environment variable is undefined ', () => {
      /* Set up */
      jest.spyOn(EnvParser, 'getStringFromEnv');

      /* Call function and Compare against expected */
      expect(() => EnvParser.getStringFromEnv('PORT')).toThrow(UndefinedEnvVarError);
      expect(EnvParser.getStringFromEnv).toHaveBeenCalled();
    });
  });

  /* Tests for getNumberFromEnv */
  describe('getNumberFromEnv Tests', () => {
    /* Test getting a number value */
    it('Should get a number value', () => {
      /* Set up */
      EnvParser.setEnvValue('PORT', '8000');
      jest.spyOn(EnvParser, 'getNumberFromEnv');

      /* Call function */
      const result = EnvParser.getNumberFromEnv('PORT');

      /* Compare against expected */
      expect(EnvParser.getNumberFromEnv).toHaveBeenCalled();
      expect(typeof result).toBe('number');
      expect(result).toBe(8000);
    });
  });

  /* Tests for getBooleanFromEnv */
  describe('getBooleanFromEnv Tests', () => {
    /* Test getting a boolean value */
    it('Should get a boolean value', () => {
      /* Set up */
      EnvParser.setEnvValue('FLAG', 'F');
      jest.spyOn(EnvParser, 'getBooleanFromEnv');

      /* Call function */
      const result = EnvParser.getBooleanFromEnv('FLAG');

      /* Compare against expected */
      expect(EnvParser.getBooleanFromEnv).toHaveBeenCalled();
      expect(typeof result).toBe('boolean');
      expect(result).toBe(false);
    });
  });

  /* Tests for getDateFromEnv */
  describe('getDateFromEnv Tests', () => {
    /* Test getting a date value */
    it('Should get a Date value', () => {
      /* Set up */
      EnvParser.setEnvValue('DATE', 'Wed Dec 31 1969');
      jest.spyOn(EnvParser, 'getDateFromEnv');

      /* Call function */
      const result = EnvParser.getDateFromEnv('DATE');

      /* Compare against expected */
      expect(EnvParser.getDateFromEnv).toHaveBeenCalled();
      expect(result instanceof Date).toBeTruthy();
      expect(result.toJSON()).toBe('1969-12-31T08:00:00.000Z');
    });
  });

  /* Tests for getRegExpFromEnv */
  describe('getRegExpFromEnv Tests', () => {
    /* Test getting a RegExp value */
    it('Should get a RegExp value', () => {
      /* Set up */
      EnvParser.setEnvValue('REGEXP', '[0-9]');
      jest.spyOn(EnvParser, 'getRegExpFromEnv');

      /* Call function */
      const result = EnvParser.getRegExpFromEnv('REGEXP');

      /* Compare against expected */
      expect(EnvParser.getRegExpFromEnv).toHaveBeenCalled();
      expect(result instanceof RegExp).toBeTruthy();
      expect(result.test('8')).toBeTruthy();
    });
  });

  /* Tests for getObjectFromEnv */
  describe('getObjectFromEnv Tests', () => {
    /* Test getting an object value */
    it('Should get an object value', () => {
      /* Set up */
      EnvParser.setEnvValue('OBJECT', '{"cat": "dog"}');
      jest.spyOn(EnvParser, 'getObjectFromEnv');

      /* Call function */
      const result = EnvParser.getObjectFromEnv('OBJECT');

      /* Compare against expected */
      expect(EnvParser.getObjectFromEnv).toHaveBeenCalled();
      expect(result instanceof Object).toBeTruthy();
      expect(Object.keys(result)[0]).toBe("cat");
      expect(Object.values(result)[0]).toBe("dog");
    });
  });

  /* Tests for getArrayFromEnv */
  describe('getArrayFromEnv Tests', () => {
    /* Test getting an Array value */
    it('Should get an Array value', () => {
      /* Set up */
      EnvParser.setEnvValue('ARRAY', '[1, 2, 3]');
      jest.spyOn(EnvParser, 'getArrayFromEnv');

      /* Call function */
      const result = EnvParser.getArrayFromEnv('ARRAY', DataTypes.Number);

      /* Compare against expected */
      expect(EnvParser.getArrayFromEnv).toHaveBeenCalled();
      expect(result instanceof Array).toBeTruthy();
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(2);
      expect(result[2]).toBe(3);
    });
  });

  /* Tests for getSetFromEnv */
  describe('getSetFromEnv Tests', () => {
    /* Test getting an Set value */
    it('Should get an Set value', () => {
      /* Set up */
      EnvParser.setEnvValue('SET', '[1, 2, 3]');
      jest.spyOn(EnvParser, 'getSetFromEnv');

      /* Call function */
      const result = EnvParser.getSetFromEnv('SET', DataTypes.Number);

      /* Compare against expected */
      expect(EnvParser.getSetFromEnv).toHaveBeenCalled();
      expect(result instanceof Set).toBeTruthy();
      expect(result.has(1)).toBeTruthy();
      expect(result.has(2)).toBeTruthy();
      expect(result.has(3)).toBeTruthy();
    });
  });

  /* Tests for getMapFromEnv */
  describe('getMapFromEnv Tests', () => {
    /* Test getting a Map value */
    it('Should get a Map value', () => {
      /* Set up */
      EnvParser.setEnvValue('MAP', '{"cat": "5", "dog": "3"}');
      jest.spyOn(EnvParser, 'getMapFromEnv');

      /* Call function */
      const result = EnvParser.getMapFromEnv('MAP', DataTypes.String, DataTypes.Number);

      /* Compare against expected */
      expect(EnvParser.getMapFromEnv).toHaveBeenCalled();
      expect(result instanceof Map).toBeTruthy();
      expect(result.get('cat')).toBe(5);
      expect(result.get('dog')).toBe(3);
    });
  });
});