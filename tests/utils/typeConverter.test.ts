/* Unit tests for the type converter util */
import { NestableDataTypes } from '../../src/constants';
import { TypeConversionError } from '../../src/errors/typeConversionError';
import { UnsupportedTypeError } from '../../src/errors/unsupportedTypeError';
import TypeConverter from '../../src/utils/typeConverter';

/* Type converter util tests */
describe('Type Converter Util Tests', () => {
  /* Setup before each test */
  beforeEach(() => {
    jest.restoreAllMocks(); /* Restore all mocks to their default implementation and clear all states */
  });

  /* Convert to nestable value tests */
  describe('Convert to Nestable Value Tests', () => {
    /* Test when converting to a number is possible */
    it('Should successfully convert a value to a nestable type.', () => {
      /* Set up and call function */
      const type = 'number';
      const value = '5';
      const result = TypeConverter.convertToNestableType(type, value);

      /* Compare against expected */
      expect(typeof result).toBe('number');
      expect(result).toBe(5);
    });

    /* Test when converting to a type is not supported */
    it('Should throw an error if the type to be converted to is not supported.', () => {
      /* Set up */
      const type = 'NOT A TYPE';
      const value = 'test';

      /* Call function and compare against expected */
      expect(() => TypeConverter.convertToNestableType(type, value)).toThrow(UnsupportedTypeError);
    });
  });

  /* Convert to number tests */
  describe('Convert To Number Tests', () => {
    /* Test when converting to a number is possible */
    it('Should successfully convert the input to a number if possible.', () => {
      /* Set up and call function */
      const value = '5';
      const result = TypeConverter.convertToNumber(value);

      /* Compare against expected */
      expect(typeof result).toBe('number');
      expect(result).toBe(5);
    });

    /* Test when converting to a number isn't possible */
    it('Should throw an error if the input cannot be converted to a number.', () => {
      /* Set up */
      const value = '100ABC';

      /* Call function and compare against expected */
      expect(() => TypeConverter.convertToNumber(value)).toThrow(TypeConversionError);
    });
  });

  /* Convert to boolean tests */
  describe('Convert To Boolean Tests', () => {
    /* Test when converting to a truthy boolean is possible */
    it('Should successfully convert the input to a truthy boolean if possible.', () => {
      /* Set up and call function */
      const value = 'TRUE';
      const result = TypeConverter.convertToBoolean(value);

      /* Compare against expected */
      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);
    });

    /* Test when converting to a falsy boolean is possible */
    it('Should successfully convert the input to a falsy boolean if possible.', () => {
      /* Set up and call function */
      const value = 'FALSE';
      const result = TypeConverter.convertToBoolean(value);

      /* Compare against expected */
      expect(typeof result).toBe('boolean');
      expect(result).toBe(false);
    });

    /* Test when converting to a boolean isn't possible */
    it('Should throw an error if the input cannot be converted to a number.', () => {
      /* Set up */
      const value = 'NOT_A_BOOLEAN';

      /* Call function and compare against expected */
      expect(() => TypeConverter.convertToBoolean(value)).toThrow(TypeConversionError);
    });
  });

  /* Convert to Date tests */
  describe('Convert To Date Tests', () => {
    /* Test when converting to a date is possible as a unix timestamp */
    it('Should successfully convert a unix timestamp to a Date.', () => {
      /* Set up and call function */
      const value = '1000';
      const result = TypeConverter.convertToDate(value);

      /* Compare against expected */
      expect(result instanceof Date).toBeTruthy();
      expect(result.toJSON()).toBe('1970-01-01T00:00:01.000Z');
    });

    /* Test when converting to a Date is possible as a valid date string */
    it('Should successfully convert a date string to a Date.', () => {
      /* Set up and call function */
      const value = 'Wed Dec 31 1969';
      const result = TypeConverter.convertToDate(value);

      /* Compare against expected */
      expect(result instanceof Date).toBeTruthy();
      expect(result.getUTCFullYear()).toBe(1969);
      expect(result.getUTCMonth()).toBe(11); // Note: Months are 0-indexed in JavaScript Dates
      expect(result.getUTCDate()).toBe(31)});

    /* Test when converting to a Date is not possible */
    it('Should throw an error if the input cannot be converted to a Date.', () => {
      /* Set up  */
      const value = 'not a date';

      /* Call function and compare against expected */
      expect(() => TypeConverter.convertToDate(value)).toThrow(TypeConversionError);
    });
  });

  /* Convert to RegExp tests */
  describe('Convert To RegExp Tests', () => {
    /* Test when converting to a RegExp is possible */
    it('Should successfully convert the input to a RegExp.', () => {
      /* Set up and call function */
      const value = '[0-9]';
      const regex = TypeConverter.convertToRegExp(value);

      /* Compare against expected */
      expect(regex.test('9')).toBeTruthy();
    });

    /* Test when converting to a RegExp is not possible */
    it('Should throw an error if the input cannot be converted to a RegExp.', () => {
      /* Set up */
      const value = '\\';

      /* Call function and compare against expected */
      expect(() => TypeConverter.convertToRegExp(value)).toThrow(TypeConversionError);
    });
  });

  /* Convert to object tests */
  describe('Convert To object Tests', () => {
    /* Test when converting to a regexp is possible */
    it('Should successfully convert the input to an object.', () => {
      /* Set up and call function */
      const value = '{"key1" :   "value1", "key2": [1, 2, 3]}';
      const result = TypeConverter.convertToObject(value);

      /* Compare against expected */
      expect(Object.keys(result)[0]).toBe('key1');
      expect(Object.keys(result)[1]).toBe('key2');
      expect(Object.values(result)[0]).toBe('value1');
      expect(JSON.stringify(Object.values(result)[1])).toBe('[1,2,3]');
    });

    /* Test when converting to an object is not possible */
    it('Should throw an error if the input cannot be converted to an object .', () => {
      /* Set up */
      const value = '\\';

      /* Call function and compare against expected */
      expect(() => TypeConverter.convertToObject(value)).toThrow(TypeConversionError);
    });
  });

  /* Convert to Array tests */
  describe('Convert To Array Tests', () => {
    /* Test when converting to a string Array is possible */
    it('Should successfully convert the input to a string Array.', () => {
      /* Set up and call function with type set explicitely to string */
      const value = '["1", "2", "3"]';
      const result = TypeConverter.convertToArray(value);

      /* Compare against expected */
      expect(typeof result[0]).toBe('string');
      expect(typeof result[1]).toBe('string');
      expect(typeof result[2]).toBe('string');
      expect(result[0]).toBe('1');
      expect(result[1]).toBe('2');
      expect(result[2]).toBe('3');

      /* Set up and call function with type string being implied as the default */
      const value2 = '["1", "2", "3"]';
      const result2 = TypeConverter.convertToArray(value2, NestableDataTypes.String);

      /* Compare against expected */
      expect(typeof result2[0]).toBe('string');
      expect(typeof result2[1]).toBe('string');
      expect(typeof result2[2]).toBe('string');
      expect(result2[0]).toBe('1');
      expect(result2[1]).toBe('2');
      expect(result2[2]).toBe('3');
    });

    /* Test when converting to a number Array is possible */
    it('Should successfully convert the input to a number Array.', () => {
      /* Set up and call function */
      const value = '[1, 2, 3]';
      const result = TypeConverter.convertToArray(value, NestableDataTypes.Number);

      /* Compare against expected */
      expect(typeof result[0]).toBe('number');
      expect(typeof result[1]).toBe('number');
      expect(typeof result[2]).toBe('number');
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(2);
      expect(result[2]).toBe(3);
    });

    /* Test when converting to a boolean Array is possible */
    it('Should successfully convert the input to a boolean Array.', () => {
      /* Set up and call function */
      const value = '["t", "FALSE", "true"]';
      const result = TypeConverter.convertToArray(value, NestableDataTypes.Boolean);

      /* Compare against expected */
      expect(typeof result[0]).toBe('boolean');
      expect(typeof result[1]).toBe('boolean');
      expect(typeof result[2]).toBe('boolean');
      expect(result[0]).toBe(true);
      expect(result[1]).toBe(false);
      expect(result[2]).toBe(true);
    });

    /* Test when converting to a Date Array is possible */
    it('Should successfully convert the input to a Date Array.', () => {
      /* Set up and call function */
      const value = '["100", "Wed Dec 31 1969", "100000"]';
      const result: Array<Date> = TypeConverter.convertToArray(value, NestableDataTypes.Date);

      /* Compare against expected */
      expect(result[0] instanceof Date).toBeTruthy();
      expect(result[1] instanceof Date).toBeTruthy();
      expect(result[2] instanceof Date).toBeTruthy();
      expect(result[0].toJSON()).toBe('1970-01-01T00:00:00.100Z');
      expect(result[1].getUTCFullYear()).toBe(1969);
      expect(result[1].getUTCMonth()).toBe(11); // Note: Months are 0-indexed in JavaScript Dates
      expect(result[1].getUTCDate()).toBe(31);
      expect(result[2].toJSON()).toBe('1970-01-01T00:01:40.000Z');
    });

    /* Test when converting to a RegExp Array is possible */
    it('Should successfully convert the input to a RegExp Array.', () => {
      /* Set up and call function */
      const value = '["[0-9]", "[a-z]", "a.b"]';
      const result: Array<RegExp> = TypeConverter.convertToArray(value, NestableDataTypes.RegExp);

      /* Compare against expected */
      expect(result[0] instanceof RegExp).toBeTruthy();
      expect(result[1] instanceof RegExp).toBeTruthy();
      expect(result[2] instanceof RegExp).toBeTruthy();
      expect(result[0].test('7')).toBeTruthy();
      expect(result[1].test('b')).toBeTruthy();
      expect(result[2].test('aab')).toBeTruthy();
    });

    /* Test when converting to an object Array is possible */
    it('Should successfully convert the input to an object Array.', () => {
      /* Set up and call function */
      const value = '[{"k1": "v1"}, {"k2": "v2"}, {"k3": "v3"}]';
      const result: Array<object> = TypeConverter.convertToArray(value, NestableDataTypes.Object);

      /* Compare against expected */
      expect(result[0] instanceof Object).toBeTruthy();
      expect(result[1] instanceof Object).toBeTruthy();
      expect(result[2] instanceof Object).toBeTruthy();
      expect(Object.keys(result[0]).toString()).toBe('k1');
      expect(Object.values(result[0]).toString()).toBe('v1');
      expect(Object.keys(result[1]).toString()).toBe('k2');
      expect(Object.values(result[1]).toString()).toBe('v2');
      expect(Object.keys(result[2]).toString()).toBe('k3');
      expect(Object.values(result[2]).toString()).toBe('v3');
    });

    /* Test when converting to an Array is not possible */
    it('Should throw an error if the input cannot be converted to a Set.', () => {
      const value = '{"k1": "v1"}';
      expect(() => TypeConverter.convertToArray(value, NestableDataTypes.Object)).toThrow(
        TypeConversionError
      );
    });

    /* Test when the target subtype doesn't exist */
    it("Should throw an error if the target subtype doesn't exist.", () => {
      const value = '[1, 2, 3]';
      const invalidType = 'invalid type';
      expect(() => TypeConverter.convertToArray(value, invalidType)).toThrow(UnsupportedTypeError);
    });
  });

  /* Convert to Set tests */
  describe('Convert To Set Tests', () => {
    /* Test when converting to a string Set is possible */
    it('Should successfully convert the input to a string Set.', () => {
      /* Set up and call function with type set explicitely to string */
      const value = '["1", "2", "3"]';
      const result = TypeConverter.convertToSet(value);

      /* Compare against expected */
      expect(result.has('1')).toBe(true);
      expect(result.has('2')).toBe(true);
      expect(result.has('3')).toBe(true);
      for (const item of result) {
        expect(typeof item).toBe('string');
      }

      /* Set up and call function with type string being implied as the default */
      const value2 = '["1", "2", "3"]';
      const result2 = TypeConverter.convertToSet(value2, NestableDataTypes.String);

      /* Compare against expected */
      expect(result2.has('1')).toBe(true);
      expect(result2.has('2')).toBe(true);
      expect(result2.has('3')).toBe(true);
      for (const item of result2) {
        expect(typeof item).toBe('string');
      }
    });

    /* Test when converting to a number Set is possible */
    it('Should successfully convert the input to a number Set.', () => {
      /* Set up and call function */
      const value = '[1, 2, 3]';
      const result = TypeConverter.convertToSet(value, NestableDataTypes.Number);

      /* Compare against expected */
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
      expect(result.has(3)).toBe(true);
      for (const item of result) {
        expect(typeof item).toBe('number');
      }
    });

    /* Test when converting to a boolean Set is possible */
    it('Should successfully convert the input to a boolean Set.', () => {
      /* Set up and call function */
      const value = '["t", "FALSE", "true"]';
      const result = TypeConverter.convertToSet(value, NestableDataTypes.Boolean);

      /* Compare against expected */
      expect(result.has(true)).toBe(true);
      expect(result.has(false)).toBe(true);
      for (const item of result) {
        expect(typeof item).toBe('boolean');
      }
    });

    /* Test when converting to a Date Set is possible */
    it('Should successfully convert the input to a Date Set.', () => {
      /* Set up and call function */
      const value = '["100", "Wed Dec 31 1969", "1970-01-01T00:01:40.000Z"]';
      const result = TypeConverter.convertToSet(value, NestableDataTypes.Date);

      /* Compare against expected */
      for (const item of result) {
        expect(item instanceof Date).toBeTruthy();
      }
    });

    /* Test when converting to a RegExp Set is possible */
    it('Should successfully convert the input to a RegExp Set.', () => {
      /* Set up and call function */
      const value = '["[0-9]", "[a-z]", "a.b"]';
      const result = TypeConverter.convertToSet(value, NestableDataTypes.RegExp);

      /* Compare against expected */
      for (const item of result) {
        expect(item instanceof RegExp).toBeTruthy();
      }
    });

    /* Test when converting to an object Set is possible */
    it('Should successfully convert the input to an object Set.', () => {
      /* Set up and call function */
      const value = '[{"k1": "v1"}, {"k2": "v2"}, {"k3": "v3"}]';
      const result = TypeConverter.convertToSet(value, NestableDataTypes.Object);

      /* Compare against expected */
      for (const item of result) {
        expect(item instanceof Object).toBeTruthy();
      }
    });

    /* Test when converting to an Set is not possible */
    it('Should throw an error if the input cannot be converted to a Set.', () => {
      const value = '{"k1": "v1"}';
      expect(() => TypeConverter.convertToSet(value, NestableDataTypes.Object)).toThrow(
        TypeConversionError
      );
    });

    /* Test when the target subtype doesn't exist */
    it("Should throw an error if the target subtype doesn't exist.", () => {
      const value = '[1, 2, 3]';
      const invalidType = 'invalid type';
      expect(() => TypeConverter.convertToSet(value, invalidType)).toThrow(UnsupportedTypeError);
    });
  });

  /* Convert to Map tests */
  describe('Convert To Map Tests', () => {
    /* Test when converting to a Map with string keys and string values is possible */
    it('Should successfully convert the input to Map with string keys and string values.', () => {
      /* Set up and call function with type set explicitely to string */
      const value = '{"k1": "v1", "k2": "v2"}';
      const result = TypeConverter.convertToMap(value);

      /* Compare against expected */
      expect(result.has('k1')).toBe(true);
      expect(result.has('k2')).toBe(true);
      expect(result.get('k1')).toBe('v1');
      expect(result.get('k2')).toBe('v2');
      for (const item of result.keys()) {
        expect(typeof item).toBe('string');
      }
      for (const item of result.values()) {
        expect(typeof item).toBe('string');
      }

      /* Set up and call function with type string being implied as the default */
      const value2 = '{"k1": "v1", "k2": "v2"}';
      const result2 = TypeConverter.convertToMap(
        value2,
        NestableDataTypes.String,
        NestableDataTypes.String
      );

      /* Compare against expected */
      expect(result2.has('k1')).toBe(true);
      expect(result2.has('k2')).toBe(true);
      expect(result2.get('k1')).toBe('v1');
      expect(result2.get('k2')).toBe('v2');
      for (const item of result2.keys()) {
        expect(typeof item).toBe('string');
      }
      for (const item of result2.values()) {
        expect(typeof item).toBe('string');
      }
    });

    /* Test when converting to a Map with number keys and number values is possible */
    it('Should successfully convert the input to Map with number keys and number values.', () => {
      /* Set up and call function */
      const value = '{"1": "2", "3": "4"}';
      const result = TypeConverter.convertToMap(
        value,
        NestableDataTypes.Number,
        NestableDataTypes.Number
      );

      /* Compare against expected */
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
      /* Set up and call function */
      const value = '{"true": "FALSE", "f": "T"}';
      const result = TypeConverter.convertToMap(
        value,
        NestableDataTypes.Boolean,
        NestableDataTypes.Boolean
      );

      /* Compare against expected */
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
      /* Set up and call function */
      const value =
        '{"100": "Wed Dec 31 1969", "1970-01-01T00:01:40.000Z": "1970-01-01T00:01:40.000Z"}';
      const result = TypeConverter.convertToMap(
        value,
        NestableDataTypes.Date,
        NestableDataTypes.Date
      );

      /* Compare against expected */
      for (const item of result.keys()) {
        expect(item instanceof Date).toBe(true);
      }
      for (const item of result.values()) {
        expect(item instanceof Date).toBe(true);
      }
    });

    /* Test when converting to a Map with RegExp keys and RegExp values is possible */
    it('Should successfully convert the input to Map with RegExp keys and RegExp values.', () => {
      /* Set up and call function */
      const value = '{"[0-9]": "[a-z]", "a.b": "[A-Z]"}';
      const result = TypeConverter.convertToMap(
        value,
        NestableDataTypes.RegExp,
        NestableDataTypes.RegExp
      );

      /* Compare against expected */
      for (const item of result.keys()) {
        expect(item instanceof RegExp).toBe(true);
      }
      for (const item of result.values()) {
        expect(item instanceof RegExp).toBe(true);
      }
    });

    /* Test when converting to a Map with object keys and object values is possible */
    it('Should successfully convert the input to Map with object keys and object values.', () => {
      /* Set up and call function */
      const value = '{"{\\"key1\\": \\"value1\\"}" : "{\\"key2\\": \\"value2\\"}"}';
      const result = TypeConverter.convertToMap(
        value,
        NestableDataTypes.Object,
        NestableDataTypes.Object
      );

      /* Compare against expected */
      for (const item of result.keys()) {
        expect(item instanceof Object).toBe(true);
      }
      for (const item of result.values()) {
        expect(item instanceof Object).toBe(true);
      }
    });

    /* Test when converting to a Map is not possible */
    it('Should throw an error if the input cannot be converted to a Map.', () => {
      const value = '[a, b, c]';
      expect(() =>
        TypeConverter.convertToMap(value, NestableDataTypes.Object, NestableDataTypes.Object)
      ).toThrow(TypeConversionError);
    });

    /* Test when the key's target subtype doesn't exist */
    it("Should throw an error if the key's target subtype doesn't exist.", () => {
      const value = '{"test": "test"}';
      const invalidType = 'invalid type';
      expect(() =>
        TypeConverter.convertToMap(value, invalidType, NestableDataTypes.String)
      ).toThrow(UnsupportedTypeError);
    });

    /* Test when the value's target subtype doesn't exist */
    it("Should throw an error if the key's target subtype doesn't exist.", () => {
      const value = '{"test": "test"}';
      const invalidType = 'invalid type';
      expect(() =>
        TypeConverter.convertToMap(value, NestableDataTypes.String, invalidType)
      ).toThrow(UnsupportedTypeError);
    });
  });
});
