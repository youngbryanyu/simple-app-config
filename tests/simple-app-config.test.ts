/* Unit tests for env-var-config */
import { DataTypes, Config } from '../src/index';
import fs from 'fs';
import dotenv from 'dotenv';
import { UndefinedEnvVarError } from '../src/errors/undefinedEnvVarError';

/* simple-app-config tests */
describe('simple-app-config Tests', () => {
  /* Setup before each test */
  beforeEach(() => {
    /* Delete all environment variables */
    for (const key in process.env) {
      if (process.env.hasOwnProperty(key)) {
        delete process.env[key];
      }
    }

    /* Restore all mocks */
    jest.restoreAllMocks();
  });

  /* Tests for refreshEnvCache*/
  describe('refreshEnvCache Tests', () => {
    /* Test clearing the cache */
    it('Should clear the cache', () => {
      /* Set up spies and mocks */
      jest.spyOn(Config, 'refreshEnvCache');
      Config.setEnvValue('PORT', '8000');
      jest.spyOn(Map.prototype, 'clear');
      jest.spyOn(Map.prototype, 'set');

      /* Call function */
      Config.refreshEnvCache();

      /* Compare against expected */
      expect(Config.refreshEnvCache).toHaveBeenCalled();
      expect(Map.prototype.clear).toHaveBeenCalled();
      expect(Map.prototype.set).toHaveBeenCalled();
    });
  });

  /* Tests for setEnvValue */
  describe('setEnvValue Tests', () => {
    /* Test setting a value */
    it('Should set a value', () => {
      /* Set up spies and mocks */
      jest.spyOn(Config, 'setEnvValue');
      jest.spyOn(Map.prototype, 'set');

      /* Call function */
      Config.setEnvValue('PORT', '8000');

      /* Compare against expected */
      expect(Config.setEnvValue).toHaveBeenCalled();
      expect(Map.prototype.set).toHaveBeenCalled();
      expect(Config.getStringFromEnv('PORT')).toBe('8000');
    });
  });

  /* Tests for deleteEnvValue */
  describe('deleteEnvValue Tests', () => {
    /* Test deleting a value */
    it('Should delete a value', () => {
      /* Set up spies and mocks */
      jest.spyOn(Config, 'setEnvValue');
      jest.spyOn(Map.prototype, 'delete');

      /* Call function */
      Config.setEnvValue('PORT', '8000');
      Config.deleteEnvValue('PORT');

      /* Compare against expected */
      expect(() => Config.getStringFromEnv('PORT')).toThrow(UndefinedEnvVarError);
      expect(Config.setEnvValue).toHaveBeenCalled();
      expect(Map.prototype.delete).toHaveBeenCalled();
    });
  });

  /* Tests for getStringFromEnv */
  describe('getStringFromEnv Tests', () => {
    /* Test getting a string value and its in cache */
    it('Should get a string value and should get it from the cache ', () => {
      /* Set up */
      Config.setEnvValue('PORT', '8000');
      Config.configure();
      jest.spyOn(Config, 'getStringFromEnv');
      jest.spyOn(Map.prototype, 'get');

      /* Call function */
      const result = Config.getStringFromEnv('PORT');

      /* Compare against expected */
      expect(Config.getStringFromEnv).toHaveBeenCalled();
      expect(Map.prototype.get).toHaveBeenCalled();
      expect(typeof result).toBe('string');
      expect(result).toBe('8000');
    });

    /* Test getting a string value and its not in cache */
    it('Should get a string value when its not in the cache', () => {
      /* Set up */
      process.env['PORT'] = '8000';
      Config.configure();
      jest.spyOn(Config, 'getStringFromEnv');
      jest.spyOn(Map.prototype, 'get');

      /* Call function */
      const result = Config.getStringFromEnv('PORT');

      /* Compare against expected */
      expect(Config.getStringFromEnv).toHaveBeenCalled();
      expect(Map.prototype.get).toHaveBeenCalled();
      expect(typeof result).toBe('string');
      expect(result).toBe('8000');
    });

    /* Test getting a string value and its undefined */
    it('Should throw and error when the environment variable is undefined ', () => {
      /* Set up */
      Config.configure();
      jest.spyOn(Config, 'getStringFromEnv');

      /* Call function and Compare against expected */
      expect(() => Config.getStringFromEnv('PORT')).toThrow(UndefinedEnvVarError);
      expect(Config.getStringFromEnv).toHaveBeenCalled();
    });
  });

  /* Tests for getNumberFromEnv */
  describe('getNumberFromEnv Tests', () => {
    /* Test getting a number value */
    it('Should get a number value', () => {
      /* Set up */
      Config.setEnvValue('PORT', '8000');
      Config.configure();
      jest.spyOn(Config, 'getNumberFromEnv');

      /* Call function */
      const result = Config.getNumberFromEnv('PORT');

      /* Compare against expected */
      expect(Config.getNumberFromEnv).toHaveBeenCalled();
      expect(typeof result).toBe('number');
      expect(result).toBe(8000);
    });
  });

  /* Tests for getBooleanFromEnv */
  describe('getBooleanFromEnv Tests', () => {
    /* Test getting a boolean value */
    it('Should get a boolean value', () => {
      /* Set up */
      Config.setEnvValue('FLAG', 'F');
      Config.configure();
      jest.spyOn(Config, 'getBooleanFromEnv');

      /* Call function */
      const result = Config.getBooleanFromEnv('FLAG');

      /* Compare against expected */
      expect(Config.getBooleanFromEnv).toHaveBeenCalled();
      expect(typeof result).toBe('boolean');
      expect(result).toBe(false);
    });
  });

  /* Tests for getDateFromEnv */
  describe('getDateFromEnv Tests', () => {
    /* Test getting a date value */
    it('Should get a Date value', () => {
      /* Set up */
      Config.setEnvValue('DATE', 'Wed Dec 31 1969');
      Config.configure();
      jest.spyOn(Config, 'getDateFromEnv');

      /* Call function */
      const result = Config.getDateFromEnv('DATE');

      /* Compare against expected */
      expect(Config.getDateFromEnv).toHaveBeenCalled();
      expect(result instanceof Date).toBeTruthy();
      expect(result.toJSON()).toBe('1969-12-31T08:00:00.000Z');
    });
  });

  /* Tests for getRegExpFromEnv */
  describe('getRegExpFromEnv Tests', () => {
    /* Test getting a RegExp value */
    it('Should get a RegExp value', () => {
      /* Set up */
      Config.setEnvValue('REGEXP', '[0-9]');
      Config.configure();
      jest.spyOn(Config, 'getRegExpFromEnv');

      /* Call function */
      const result = Config.getRegExpFromEnv('REGEXP');

      /* Compare against expected */
      expect(Config.getRegExpFromEnv).toHaveBeenCalled();
      expect(result instanceof RegExp).toBeTruthy();
      expect(result.test('8')).toBeTruthy();
    });
  });

  /* Tests for getObjectFromEnv */
  describe('getObjectFromEnv Tests', () => {
    /* Test getting an object value */
    it('Should get an object value', () => {
      /* Set up */
      Config.setEnvValue('OBJECT', '{"cat": "dog"}');
      Config.configure();
      jest.spyOn(Config, 'getObjectFromEnv');

      /* Call function */
      const result = Config.getObjectFromEnv('OBJECT');

      /* Compare against expected */
      expect(Config.getObjectFromEnv).toHaveBeenCalled();
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
      Config.setEnvValue('ARRAY', '[1, 2, 3]');
      Config.configure();
      jest.spyOn(Config, 'getArrayFromEnv');

      /* Call function */
      const result = Config.getArrayFromEnv('ARRAY', DataTypes.Number);

      /* Compare against expected */
      expect(Config.getArrayFromEnv).toHaveBeenCalled();
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
      Config.setEnvValue('SET', '[1, 2, 3]');
      Config.configure();
      jest.spyOn(Config, 'getSetFromEnv');

      /* Call function */
      const result = Config.getSetFromEnv('SET', DataTypes.Number);

      /* Compare against expected */
      expect(Config.getSetFromEnv).toHaveBeenCalled();
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
      Config.setEnvValue('MAP', '{"cat": "5", "dog": "3"}');
      Config.configure();
      jest.spyOn(Config, 'getMapFromEnv');

      /* Call function */
      const result = Config.getMapFromEnv('MAP', DataTypes.String, DataTypes.Number);

      /* Compare against expected */
      expect(Config.getMapFromEnv).toHaveBeenCalled();
      expect(result instanceof Map).toBeTruthy();
      expect(result.get('cat')).toBe(5);
      expect(result.get('dog')).toBe(3);
    });
  });

  /* Tests for get */
  describe('get Tests', () => {
    /* Test getting a Map value */
    it('Should get a Map value', () => {
      /* Set up */
      Config.configure();
      jest.spyOn(Config, 'get');

      /* Call function */
      const result = Config.get('MAP');

      /* Compare against expected */
      expect(Config.get).toHaveBeenCalled()
    });
  });
});