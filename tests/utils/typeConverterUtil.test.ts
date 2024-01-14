/* Unit tests for the type converter util */
import { NestableDataTypes } from '../../src/constants';
import { TypeConversionError } from '../../src/errors/typeConversionError';
import TypeConverterUtil from '../../src/utils/typeConverterUtil';

/* Type converter util tests */
describe('Type Converter Util Tests', () => {
  /* Setup before each test */
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  /* Convert to number tests */
  describe('Convert To Number Tests', () => {
    /* Test when converting to a number is possible */
    it('Should successfully convert the input to a number if possible.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToNumber');

      /* Set up and call function */
      const value = '5';
      const result = TypeConverterUtil.convertToNumber(value);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToNumber).toHaveBeenCalled();
      expect(typeof result).toBe('number');
      expect(result).toBe(5);
    });

    /* Test when converting to a number isn't possible */
    it('Should throw an error if the input cannot be converted to a number.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToNumber');

      /* Set up */
      const value = '100ABC';

      /* Call function and compare against expected */
      expect(() => TypeConverterUtil.convertToNumber(value)).toThrow(TypeConversionError);
      expect(TypeConverterUtil.convertToNumber).toHaveBeenCalled();
    });
  });

  /* Convert to boolean tests */
  describe('Convert To Boolean Tests', () => {
    /* Test when converting to a truthy boolean is possible */
    it('Should successfully convert the input to a truthy boolean if possible.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToBoolean');

      /* Set up and call function */
      const value = 'TRUE';
      const result = TypeConverterUtil.convertToBoolean(value);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToBoolean).toHaveBeenCalled();
      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);
    });

    /* Test when converting to a falsy boolean is possible */
    it('Should successfully convert the input to a falsy boolean if possible.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToBoolean');

      /* Set up and call function */
      const value = 'FALSE';
      const result = TypeConverterUtil.convertToBoolean(value);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToBoolean).toHaveBeenCalled();
      expect(typeof result).toBe('boolean');
      expect(result).toBe(false);
    });

    /* Test when converting to a boolean isn't possible */
    it('Should throw an error if the input cannot be converted to a number.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToBoolean');

      /* Set up */
      const value = 'NOT_A_BOOLEAN';

      /* Call function and compare against expected */
      expect(() => TypeConverterUtil.convertToBoolean(value)).toThrow(TypeConversionError);
      expect(TypeConverterUtil.convertToBoolean).toHaveBeenCalled();
    });
  });

  /* Convert to Date tests */
  describe('Convert To Date Tests', () => {
    /* Test when converting to a date is possible as a unix timestamp */
    it('Should successfully convert a unix timestamp to a Date.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToDate');

      /* Set up and call function */
      const value = '1000';
      const result = TypeConverterUtil.convertToDate(value);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToDate).toHaveBeenCalled();
      expect(result instanceof Date).toBeTruthy();
      expect(result.toJSON()).toBe('1970-01-01T00:00:01.000Z');
    });

    /* Test when converting to a Date is possible as a valid date string */
    it('Should successfully convert a date string to a Date.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToDate');

      /* Set up and call function */
      const value = 'Wed Dec 31 1969';
      const result = TypeConverterUtil.convertToDate(value);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToDate).toHaveBeenCalled();
      expect(result instanceof Date).toBeTruthy();
      expect(result.toJSON()).toBe('1969-12-31T08:00:00.000Z');
    });

    /* Test when converting to a Date is not possible */
    it('Should throw an error if the input cannot be converted to a Date.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToDate');

      /* Set up  */
      const value = 'not a date';

      /* Call function and compare against expected */
      expect(() => TypeConverterUtil.convertToDate(value)).toThrow(TypeConversionError);
      expect(TypeConverterUtil.convertToDate).toHaveBeenCalled();
    });
  });

  /* Convert to RegExp tests */
  describe('Convert To RegExp Tests', () => {
    /* Test when converting to a RegExp is possible */
    it('Should successfully convert the input to a RegExp.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToRegExp');

      /* Set up and call function */
      const value = '[0-9]';
      const regex = TypeConverterUtil.convertToRegExp(value);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToRegExp).toHaveBeenCalled();
      expect(regex.test('9')).toBeTruthy();
    });

    /* Test when converting to a RegExp is not possible */
    it('Should throw an error if the input cannot be converted to a RegExp.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToRegExp');

      /* Set up */
      const value = '\\';

      /* Call function and compare against expected */
      expect(() => TypeConverterUtil.convertToRegExp(value)).toThrow(TypeConversionError);
      expect(TypeConverterUtil.convertToRegExp).toHaveBeenCalled()
    });
  });

  /* Convert to object tests */
  describe('Convert To object Tests', () => {
    /* Test when converting to a regexp is possible */
    it('Should successfully convert the input to an object.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToObject');

      /* Set up and call function */
      const value = '{"key1" :   "value1", "key2": [1, 2, 3]}';
      const result = TypeConverterUtil.convertToObject(value);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToObject).toHaveBeenCalled();
      expect(Object.keys(result)[0]).toBe("key1");
      expect(Object.keys(result)[1]).toBe("key2");
      expect(Object.values(result)[0]).toBe("value1");
      expect(JSON.stringify(Object.values(result)[1])).toBe('[1,2,3]');
    });

    /* Test when converting to an object is not possible */
    it('Should throw an error if the input cannot be converted to an object .', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToObject');

      /* Set up */
      const value = '\\';

      /* Call function and compare against expected */
      expect(() => TypeConverterUtil.convertToObject(value)).toThrow(TypeConversionError);
      expect(TypeConverterUtil.convertToObject).toHaveBeenCalled()
    });
  });

  /* Convert to Array tests */
  describe('Convert To Array Tests', () => {
    /* Test when converting to a string Array is possible */
    it('Should successfully convert the input to a string Array.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToArray');

      /* Set up and call function with type set explicitely to string */
      const value = '["1", "2", "3"]';
      const result = TypeConverterUtil.convertToArray(value);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToArray).toHaveBeenCalled();
      expect(typeof result[0]).toBe('string');
      expect(typeof result[1]).toBe('string');
      expect(typeof result[2]).toBe('string');
      expect(result[0]).toBe("1");
      expect(result[1]).toBe("2");
      expect(result[2]).toBe("3");

      /* Set up and call function with type string being implied as the default */
      const value2 = '["1", "2", "3"]';
      const result2 = TypeConverterUtil.convertToArray(value2, NestableDataTypes.String);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToArray).toHaveBeenCalled();
      expect(typeof result2[0]).toBe('string');
      expect(typeof result2[1]).toBe('string');
      expect(typeof result2[2]).toBe('string');
      expect(result2[0]).toBe("1");
      expect(result2[1]).toBe("2");
      expect(result2[2]).toBe("3");
    });

    /* Test when converting to a number Array is possible */
    it('Should successfully convert the input to a number Array.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToArray');

      /* Set up and call function */
      const value = '[1, 2, 3]';
      const result = TypeConverterUtil.convertToArray(value, NestableDataTypes.Number);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToArray).toHaveBeenCalled();
      expect(typeof result[0]).toBe('number');
      expect(typeof result[1]).toBe('number');
      expect(typeof result[2]).toBe('number');
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(2);
      expect(result[2]).toBe(3);
    });

    /* Test when converting to a boolean Array is possible */
    it('Should successfully convert the input to a boolean Array.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToArray');

      /* Set up and call function */
      const value = '["t", "FALSE", "true"]';
      const result = TypeConverterUtil.convertToArray(value, NestableDataTypes.Boolean);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToArray).toHaveBeenCalled();
      expect(typeof result[0]).toBe('boolean');
      expect(typeof result[1]).toBe('boolean');
      expect(typeof result[2]).toBe('boolean');
      expect(result[0]).toBe(true);
      expect(result[1]).toBe(false);
      expect(result[2]).toBe(true);
    });

    /* Test when converting to a Date Array is possible */
    it('Should successfully convert the input to a Date Array.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToArray');

      /* Set up and call function */
      const value = '["100", "Wed Dec 31 1969", "100000"]';
      const result: Array<Date> = TypeConverterUtil.convertToArray(value, NestableDataTypes.Date);
      
      /* Compare against expected */
      expect(TypeConverterUtil.convertToArray).toHaveBeenCalled();
      expect(result[0] instanceof Date).toBeTruthy();
      expect(result[1] instanceof Date).toBeTruthy();
      expect(result[2] instanceof Date).toBeTruthy();
      expect(result[0].toJSON()).toBe('1970-01-01T00:00:00.100Z');
      expect(result[1].toJSON()).toBe('1969-12-31T08:00:00.000Z');
      expect(result[2].toJSON()).toBe('1970-01-01T00:01:40.000Z');
    });

    /* Test when converting to a RegExp Array is possible */
    it('Should successfully convert the input to a RegExp Array.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToArray');

      /* Set up and call function */
      const value = '["[0-9]", "[a-z]", "a.b"]';
      const result: Array<RegExp> = TypeConverterUtil.convertToArray(value, NestableDataTypes.RegExp);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToArray).toHaveBeenCalled();
      expect(result[0] instanceof RegExp).toBeTruthy();
      expect(result[1] instanceof RegExp).toBeTruthy();
      expect(result[2] instanceof RegExp).toBeTruthy();
      expect(result[0].test('7')).toBeTruthy();
      expect(result[1].test('b')).toBeTruthy();
      expect(result[2].test('aab')).toBeTruthy();
    });

    /* Test when converting to an object Array is possible */
    it('Should successfully convert the input to an object Array.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToArray');

      /* Set up and call function */
      const value = '[{"k1": "v1"}, {"k2": "v2"}, {"k3": "v3"}]';
      const result: Array<Object> = TypeConverterUtil.convertToArray(value, NestableDataTypes.Object);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToArray).toHaveBeenCalled();
      expect(result[0] instanceof Object).toBeTruthy();
      expect(result[1] instanceof Object).toBeTruthy();
      expect(result[2] instanceof Object).toBeTruthy();
      expect(Object.keys(result[0]).toString()).toBe("k1");
      expect(Object.values(result[0]).toString()).toBe("v1");
      expect(Object.keys(result[1]).toString()).toBe("k2");
      expect(Object.values(result[1]).toString()).toBe("v2");
      expect(Object.keys(result[2]).toString()).toBe("k3");
      expect(Object.values(result[2]).toString()).toBe("v3");
    });

     /* Test when converting to an Array is not possible */
     it('Should throw an error if the input cannot be converted to a Set.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToArray');

      /* Set up */
      const value = '{"k1": "v1"}';
      expect(() => TypeConverterUtil.convertToArray(value, NestableDataTypes.Object)).toThrow(TypeConversionError);

      /* Call function and Compare against expected */
      expect(TypeConverterUtil.convertToArray).toHaveBeenCalled();
    });
  });

  /* Convert to Set tests */
  describe('Convert To Set Tests', () => {
    /* Test when converting to a string Set is possible */
    it('Should successfully convert the input to a string Set.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToSet');

      /* Set up and call function with type set explicitely to string */
      const value = '["1", "2", "3"]';
      const result = TypeConverterUtil.convertToSet(value);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToSet).toHaveBeenCalled();
      expect(result.has("1")).toBe(true);
      expect(result.has("2")).toBe(true);
      expect(result.has("3")).toBe(true);
      for (const item of result) {
        expect(typeof item).toBe('string');
      }

      /* Set up and call function with type string being implied as the default */
      const value2 = '["1", "2", "3"]';
      const result2 = TypeConverterUtil.convertToSet(value2, NestableDataTypes.String);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToSet).toHaveBeenCalled();
      expect(result2.has("1")).toBe(true);
      expect(result2.has("2")).toBe(true);
      expect(result2.has("3")).toBe(true);
      for (const item of result2) {
        expect(typeof item).toBe('string');
      }
    });

    /* Test when converting to a number Set is possible */
    it('Should successfully convert the input to a number Set.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToSet');

      /* Set up and call function */
      const value = '[1, 2, 3]';
      const result = TypeConverterUtil.convertToSet(value, NestableDataTypes.Number);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToSet).toHaveBeenCalled();
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
      expect(result.has(3)).toBe(true);
      for (const item of result) {
        expect(typeof item).toBe('number');
      }
    });

    /* Test when converting to a boolean Set is possible */
    it('Should successfully convert the input to a boolean Set.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToSet');

      /* Set up and call function */
      const value = '["t", "FALSE", "true"]';
      const result = TypeConverterUtil.convertToSet(value, NestableDataTypes.Boolean);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToSet).toHaveBeenCalled();
      expect(result.has(true)).toBe(true);
      expect(result.has(false)).toBe(true);
      for (const item of result) {
        expect(typeof item).toBe('boolean');
      }
    });

    /* Test when converting to a Date Set is possible */
    it('Should successfully convert the input to a Date Set.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToSet');

      /* Set up and call function */
      const value = '["100", "Wed Dec 31 1969", "1970-01-01T00:01:40.000Z"]';
      const result = TypeConverterUtil.convertToSet(value, NestableDataTypes.Date);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToSet).toHaveBeenCalled();
      for (const item of result) {
        expect(item instanceof Date).toBeTruthy();
      }
    });

    /* Test when converting to a RegExp Set is possible */
    it('Should successfully convert the input to a RegExp Set.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToSet');

      /* Set up and call function */
      const value = '["[0-9]", "[a-z]", "a.b"]';
      const result = TypeConverterUtil.convertToSet(value, NestableDataTypes.RegExp);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToSet).toHaveBeenCalled();
      for (const item of result) {
        expect(item instanceof RegExp).toBeTruthy();
      }
    });

    /* Test when converting to an object Set is possible */
    it('Should successfully convert the input to an object Set.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToSet');

      /* Set up and call function */
      const value = '[{"k1": "v1"}, {"k2": "v2"}, {"k3": "v3"}]';
      const result = TypeConverterUtil.convertToSet(value, NestableDataTypes.Object);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToSet).toHaveBeenCalled();
      for (const item of result) {
        expect(item instanceof Object).toBeTruthy();
      }
    });

     /* Test when converting to an Set is not possible */
     it('Should throw an error if the input cannot be converted to a Set.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToSet');

      /* Set up */
      const value = '{"k1": "v1"}';
      expect(() => TypeConverterUtil.convertToSet(value, NestableDataTypes.Object)).toThrow(TypeConversionError);

      /* Call function and Compare against expected */
      expect(TypeConverterUtil.convertToSet).toHaveBeenCalled();
    });
  });

  /* Convert to Map tests */
  describe('Convert To Map Tests', () => {
    /* Test when converting to a Map with string keys and string values is possible */
    it('Should successfully convert the input to Map with string keys and string values.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToMap');

      /* Set up and call function with type set explicitely to string */
      const value = '{"k1": "v1", "k2": "v2"}';
      const result = TypeConverterUtil.convertToMap(value);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToMap).toHaveBeenCalled();
      expect(result.has("k1")).toBe(true);
      expect(result.has("k2")).toBe(true);
      expect(result.get("k1")).toBe("v1");
      expect(result.get("k2")).toBe("v2");
      for (const item of result.keys()) {
        expect(typeof item).toBe('string');
      }
      for (const item of result.values()) {
        expect(typeof item).toBe('string');
      }

      /* Set up and call function with type string being implied as the default */
      const value2 = '{"k1": "v1", "k2": "v2"}';
      const result2 = TypeConverterUtil.convertToMap(value2, NestableDataTypes.String, NestableDataTypes.String);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToMap).toHaveBeenCalled();
      expect(result2.has("k1")).toBe(true);
      expect(result2.has("k2")).toBe(true);
      expect(result2.get("k1")).toBe("v1");
      expect(result2.get("k2")).toBe("v2");
      for (const item of result2.keys()) {
        expect(typeof item).toBe('string');
      }
      for (const item of result2.values()) {
        expect(typeof item).toBe('string');
      }
    });

    /* Test when converting to a Map with number keys and number values is possible */
    it('Should successfully convert the input to Map with number keys and number values.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToMap');

      /* Set up and call function */
      const value = '{"1": "2", "3": "4"}';
      const result = TypeConverterUtil.convertToMap(value, NestableDataTypes.Number, NestableDataTypes.Number);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToMap).toHaveBeenCalled();
      expect(result.has(1)).toBe(true);
      expect(result.has(3)).toBe(true);
      expect(result.get(1)).toBe(2);
      expect(result.get(3)).toBe(4);
      for (const item of result.keys()) {
        expect(typeof item).toBe('number');
      }
      for (const item of result.values()) {
        expect(typeof item).toBe('number');
      }
    });

    /* Test when converting to a Map with boolean keys and boolean values is possible */
    it('Should successfully convert the input to Map with boolean keys and boolean values.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToMap');

      /* Set up and call function */
      const value = '{"true": "FALSE", "f": "T"}';
      const result = TypeConverterUtil.convertToMap(value, NestableDataTypes.Boolean, NestableDataTypes.Boolean);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToMap).toHaveBeenCalled();
      expect(result.has(true)).toBe(true);
      expect(result.has(false)).toBe(true);
      expect(result.get(true)).toBe(false);
      expect(result.get(false)).toBe(true);
      for (const item of result.keys()) {
        expect(typeof item).toBe('boolean');
      }
      for (const item of result.values()) {
        expect(typeof item).toBe('boolean');
      }
    });

    /* Test when converting to a Map with Date keys and Date values is possible */
    it('Should successfully convert the input to Map with Date keys and Date values.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToMap');

      /* Set up and call function */
      const value = '{"100": "Wed Dec 31 1969", "1970-01-01T00:01:40.000Z": "1970-01-01T00:01:40.000Z"}';
      const result = TypeConverterUtil.convertToMap(value, NestableDataTypes.Date, NestableDataTypes.Date);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToMap).toHaveBeenCalled();
      for (const item of result.keys()) {
        expect(item instanceof Date).toBe(true);
      }
      for (const item of result.values()) {
        expect(item instanceof Date).toBe(true);
      }
    });

    /* Test when converting to a Map with RegExp keys and RegExp values is possible */
    it('Should successfully convert the input to Map with RegExp keys and RegExp values.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToMap');

      /* Set up and call function */
      const value = '{"[0-9]": "[a-z]", "a.b": "[A-Z]"}';
      const result = TypeConverterUtil.convertToMap(value, NestableDataTypes.RegExp, NestableDataTypes.RegExp);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToMap).toHaveBeenCalled();
      for (const item of result.keys()) {
        expect(item instanceof RegExp).toBe(true);
      }
      for (const item of result.values()) {
        expect(item instanceof RegExp).toBe(true);
      }
    });

    /* Test when converting to a Map with object keys and object values is possible */
    it('Should successfully convert the input to Map with object keys and object values.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToMap');

      /* Set up and call function */
      const value = '{"{\\"key1\\": \\"value1\\"}" : "{\\"key2\\": \\"value2\\"}"}';
      const result = TypeConverterUtil.convertToMap(value, NestableDataTypes.Object, NestableDataTypes.Object);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToMap).toHaveBeenCalled();
      for (const item of result.keys()) {
        expect(item instanceof Object).toBe(true);
      }
      for (const item of result.values()) {
        expect(item instanceof Object).toBe(true);
      }
    });

     /* Test when converting to a Map is not possible */
     it('Should throw an error if the input cannot be converted to a Map.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToMap');

      /* Set up */
      const value = '[a, b, c]';
      expect(() => TypeConverterUtil.convertToMap(value, NestableDataTypes.Object, NestableDataTypes.Object)).toThrow(TypeConversionError);

      /* Call function and Compare against expected */
      expect(TypeConverterUtil.convertToMap).toHaveBeenCalled();
    });
  });
});