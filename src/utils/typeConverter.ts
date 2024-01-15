/* Functions for converting string values into other data types */
import { NestableDataTypes, NonNestableDataTypes } from "../constants";
import { TypeConversionError } from "../errors/typeConversionError";
import { UnsupportedTypeError } from "../errors/unsupportedTypeError";

/**
 * Conversion functions of types that can be nested within Arrays, Sets, and Maps.
 */
const nestableConversionFunctions = {
  [NestableDataTypes.String as string]: (val: unknown) => String(val),
  [NestableDataTypes.Number as string]: convertToNumber,
  [NestableDataTypes.Boolean as string]: convertToBoolean,
  [NestableDataTypes.Date as string]: convertToDate,
  [NestableDataTypes.RegExp as string]: convertToRegExp,
  [NestableDataTypes.Object as string]: convertToObject,
}

/**
 * Converts a value to the target nestable type.
 * @param type The type that {@link value} should be converted to.
 * @param value The value to be converted.
 * @returns The value after being converted to the target type.
 * @throws {UnsupportedTypeError} Error thrown if the target type isn't one of the nestable types.
 */
function convertToNestableType<T>(type: string, value: string): T {
  if (type in nestableConversionFunctions) {
    return nestableConversionFunctions[type](value) as T;
  } else {
    throw new UnsupportedTypeError(type);
  }
}

/**
 * Converts a string into a number.
 * @param value The input value to convert into a number.
 * @returns The value after being converted to a number.
 * @throws {TypeConversionError} Error thrown if the environment variable's value cannot be converted to the target type (number in this case).
 */
function convertToNumber(value: string): number {
  const num = Number(value);
  if (isNaN(num)) {
    throw new TypeConversionError(value, NestableDataTypes.Number);
  }
  return num;
}

/**
 * Converts a string into a boolean.
 * @param value The input value to convert into a boolean.
 * @returns The value after being converted to a boolean.
 * @throws {TypeConversionError} Error thrown if the environment variable's value cannot be converted to the target type (boolean in this case).
 */
function convertToBoolean(value: string): boolean {
  /* Possible truthy and falsy values */
  const truthyValues = ['t', 'true', 'y', 'yes', 'on'];
  const falsyValues = ['f', 'false', 'n', 'no', 'off'];

  /* Check if input value is truthy or falsy, ignoring case */
  const lowercaseVal = value.toLowerCase();
  if (truthyValues.includes(lowercaseVal)) {
    return true;
  } else if (falsyValues.includes(lowercaseVal)) {
    return false;
  }

  /* Throw error if value isn't truthy or falsy */
  throw new TypeConversionError(value, NestableDataTypes.Boolean);
}

/**
 * Converts a string into a Date.
 * @param value The input value to convert into a Date.
 * @returns The value after being converted to a Date.
 * @throws {TypeConversionError} Error thrown if the environment variable's value cannot be converted to the target type (Date in this case).
 */
function convertToDate(value: string): Date {
  /* Check if input value is a number (for Unix timestamps) */
  const num = Number(value);
  if (!isNaN(num)) {
    return new Date(num);
  }

  /* Check if input value can be converted to a date */
  const date = new Date(value);
  if (date.toJSON() !== null) {
    return date;
  }

  /* Throw error if value cannot be converted to a date */
  throw new TypeConversionError(value, NestableDataTypes.Date);
}

/**
 * Converts a string into a RegExp.
 * @param value The input value to convert into a RegExp.
 * @returns The value after being converted to a RegExp.
 * @throws {TypeConversionError} Error thrown if the environment variable's value cannot be converted to the target type (RegExp in this case).
 */
function convertToRegExp(value: string): RegExp {
  try {
    return new RegExp(value);
  } catch (error) {
    throw new TypeConversionError(value, NestableDataTypes.RegExp);
  }
}

/**
 * Converts a JSON string into an object.
 * @param value The input value to convert into an object.
 * @returns The value after being converted to an object.
 * @throws {TypeConversionError} Error thrown if the environment variable's value cannot be converted to the target type (object in this case).
 */
function convertToObject(value: string): object {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new TypeConversionError(value, NestableDataTypes.Object);
  }
}
/**
 * Converts a string into an Array. If {@type} is not set, it will default to string.
 * @param value The input value to convert into an Array.
 * @param type The type that each element in the Array will be converted to. 
 * @returns The value after being converted to an Array.
 * @throws {TypeConversionError} Error thrown if the environment variable's value cannot be converted to the target type (Array in this case).
 */
function convertToArray<T>(value: string, type: string = NestableDataTypes.String): Array<T> {
  try {
    /* Parse the input into a JSON object array */
    const array = JSON.parse(value);

    /* Check if parsed value is an array */
    if (!Array.isArray(array)) {
      throw new TypeConversionError(value, NonNestableDataTypes.Array);
    }

    /* Set each element to the desired type and return */
    for (const idx in array) {
      /* Check if the element is already the desired type from JSON.parse  */
      const item = array[idx];
      if (typeof item === type) {
        continue;
      }

      /* Set the element to its converted type */
      array[idx] = convertToNestableType(type, item);
    }

    return array;
  } catch (error) {
    if (error instanceof UnsupportedTypeError) {
      throw new UnsupportedTypeError(error.getType()); /* This is thrown if user types invalid subtype in config file */
    } else {
      throw new TypeConversionError(value, `${NonNestableDataTypes.Array}<${type}>`);
    }
  }
}

/**
 * Converts a string into an Set. If {@type} is not set, it will default to string.
 * @param value The input value to convert into a Set.
 * @param type: The type that each element in the Set will be converted to. 
 * @returns The value after being converted to an Set.
 * @throws {TypeConversionError} Error thrown if the environment variable's value cannot be converted to the target type (Set in this case).
 */
function convertToSet<T>(value: string, type: string = NestableDataTypes.String): Set<T> {
  try {
    /* Convert the input to an array */
    const array: Array<T> = convertToArray(value, type);

    /* Create a set with the array */
    return new Set(array);
  } catch (error) {
    if (error instanceof UnsupportedTypeError) {
      throw new UnsupportedTypeError(error.getType()); /* This is thrown if user types invalid subtype in config file */
    } else {
      throw new TypeConversionError(value, `${NonNestableDataTypes.Set}<${type}>`);
    }
  }
}

/**
 * Converts a string into a Map. If {@link keyType} or {@link valueType} are not set, they will default to string.
 * @param value The input value to convert into a Map.
 * @param keyType: The type that each key in the Map will be converted to. 
 * @param valueType: The type that each value in the Map will be converted to. 
 * @returns The value after being converted to an Map.
 * @throws {TypeConversionError} Error thrown if the environment variable's value cannot be converted to the target type (Map in this case).
 */
function convertToMap<K, V>(value: string, keyType: string = NestableDataTypes.String, valueType: string = NestableDataTypes.String): Map<K, V> {
  try {
    /* Parse the input into a JSON object */
    const object = JSON.parse(value);

    /* Loop through each key value pair and convert to the desired datatypes */
    const map = new Map();
    Object.entries(object).forEach(([key, val]) => {
      /* Convert the key to its target type. We don't need to check if key from the previous JSON.parse is already an object
      since keys must be strings in JSON. */
      const convertedKey = convertToNestableType(keyType, key);

      /* Converted the value to its target type if its not already the desired type from JSON.parse */
      let convertedVal = val;
      if (typeof val !== valueType) {
        convertedVal = convertToNestableType(valueType, String(val));
      }

      /* Set the key-value mapping in the map */
      map.set(convertedKey, convertedVal);
    });

    return map;
  } catch (error) {
    if (error instanceof UnsupportedTypeError) {
      throw new UnsupportedTypeError(error.getType()); /* This is thrown if user types invalid subtypes in config file */
    } else {
      throw new TypeConversionError(value, `${NonNestableDataTypes.Map}<${keyType}, ${valueType}>`);
    }
  }
}

/* Wrap the util functions and export them */
export const TypeConverter = {
  convertToNumber,
  convertToBoolean,
  convertToDate,
  convertToRegExp,
  convertToObject,
  convertToArray,
  convertToSet,
  convertToMap,
  convertToNestableType
}

/* Set the default export */
export default TypeConverter;

