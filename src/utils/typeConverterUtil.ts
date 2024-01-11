/* Class for converting strings from environment variable values into other data types */
import { DataTypes } from "../enums";
import { TypeConversionError } from "../errors/typeConversionError";

/**
 * Conversion functions of types that can be nested within Arrays, Sets, and Maps
 */
const nestableConversionFunctions = {
  [DataTypes.String as string]: (val: unknown) => String(val),
  [DataTypes.Number as string]: convertToNumber,
  [DataTypes.Boolean as string]: convertToBoolean,
  [DataTypes.Date as string]: convertToDate,
  [DataTypes.RegExp as string]: convertToRegex,
  [DataTypes.Object as string]: convertToObject
}

/**
 * Converts an input string into a number.
 * @param value The input value to convert into a number.
 * @returns The value after being converted to a number.
 * @throws {TypeConversionError} Error thrown if the environment variable's value cannot be converted to the target type (number in this case).
 */
function convertToNumber(value: string): number {
  /* Check if value can be strictly converted to an number */
  const num = Number(value);
  if (isNaN(num)) {
    throw new TypeConversionError(value, DataTypes.Number);
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

  /* Check the lowercase version of the input value is contained within any of the truthy or falsy values */
  const lowercaseVal = value.toLowerCase();
  if (truthyValues.includes(lowercaseVal)) {
    return true;
  } else if (falsyValues.includes(lowercaseVal)) {
    return false;
  }

  /* Throw error if value isn't truthy or falsy */
  throw new TypeConversionError(value, DataTypes.Boolean);
}

/**
 * Converts a string into a date.
 * @param value The input value to convert into a date.
 * @returns The value after being converted to a date.
 * @throws {TypeConversionError} Error thrown if the environment variable's value cannot be converted to the target type (Date in this case).
 */
function convertToDate(value: string): Date {
  /* Check if input value is a number (for Unix timestamps) */
  const num = Number(value);
  if (!isNaN(num)) {
    return new Date(num);
  }

  /* Check if input value itself can be converted to a date */
  const date = new Date(value);
  if (date.toJSON() !== null) {
    return date;
  }

  /* Throw error if value cannot be converted to a date */
  throw new TypeConversionError(value, DataTypes.Date);
}

/**
 * Converts a string into a regex.
 * @param value The input value to convert into a regex.
 * @returns The value after being converted to a regex.
 * @throws {TypeConversionError} Error thrown if the environment variable's value cannot be converted to the target type (RegExp in this case).
 */
function convertToRegex(value: string): RegExp {
  /* Try to convert value to regex */
  try {
    return new RegExp(value);
  } catch (error) {
    /* Throw error if value cannot be converted to a date */
    throw new TypeConversionError(value, DataTypes.RegExp);
  }
}

/**
 * Converts a JSON string into an object.
 * @param value The input value to convert into an object.
 * @returns The value after being converted to an object.
 * @throws {TypeConversionError} Error thrown if the environment variable's value cannot be converted to the target type (RegExp in this case).
 */
function convertToObject(value: string): object {
  /* Try to convert value to an Object */
  try {
    return JSON.parse(value);
  } catch (error) {
    /* Throw error if value cannot be converted to an Object */
    throw new TypeConversionError(value, DataTypes.Object);
  }
}
/**
 * Converts a string into an array.
 * @param value The input value to convert into an array.
 * @param type: The type for each element in the array. 
 * @returns The value after being converted to an object.
 * @throws {TypeConversionError} Error thrown if the environment variable's value cannot be converted to the target type (Array in this case).
 */
function convertToArray<T>(value: string, type: string = DataTypes.String): Array<T> {
  try {
    /* Parse the input into a JSON object array */
    const array = JSON.parse(value);

    /* Check if parsed value is an array */
    if (!Array.isArray(array)) {
      throw new TypeConversionError(value, DataTypes.Array);
    }

    /* Set each element to the desired type and return */
    for (const idx in array) {
      /* Check if the element is already an object and trying to convert to object */
      const item = array[idx];
      if (type === DataTypes.Object && typeof item === 'object') {
        continue;
      }

      /* Set the element to its converted type */
      array[idx] = (nestableConversionFunctions[type](item));
    }
    return array;
  } catch (error) {
    throw new TypeConversionError(value, `${DataTypes.Array}<${type}>`);
  }
}

/**
 * Converts a string into an set.
 * @param value The input value to convert into a set.
 * @param type: The type for each element in the set. 
 * @returns The value after being converted to an object.
 * @throws {TypeConversionError} Error thrown if the environment variable's value cannot be converted to the target type (Set in this case).
 */
function convertToSet<T>(value: string, type: string = DataTypes.String): Set<T> {
  try {
    /* Convert the input to an array */
    const array: Array<T> = convertToArray(value, type);

    /* Initialize a new set with the array */
    return new Set(array);
  } catch (error) {
    /* Throw error if value cannot be converted to an Object */
    throw new TypeConversionError(value, `${DataTypes.Set}<${type}>`);
  }
}

/**
 * Converts a string into a map.
 * @param value The input value to convert into a map.
 * @param type: The type for each element in the map. 
 * @returns The value after being converted to an object.
 * @throws {TypeConversionError} Error thrown if the environment variable's value cannot be converted to the target type (Map in this case).
 */
function convertToMap<K, V>(value: string, keyType: string = DataTypes.String, valueType: string = DataTypes.String): Map<K, V> {
  try {
    /* Parse the input into a JSON object */
    const object = JSON.parse(value);
    const map = new Map();

    /* Loop through each key value pair and convert to the desired datatypes */
    Object.entries(object).forEach(([key, val]) => {
      /* Convert the key to its target type, but skip converting objects to objects */
      let convertedKey;
      if (keyType === DataTypes.Object && typeof key === 'object') {
        convertedKey = key;
      } else {
        convertedKey = nestableConversionFunctions[keyType](key);
      }

      /* Convert the value to its target type, but skip converting objects to objects */
      let convertedVal;
      if (valueType === DataTypes.Object && typeof val === 'object') {
        convertedVal = val;
      } else {
        convertedVal = nestableConversionFunctions[valueType](String(val));
      }

      /* Set the values in the map */
      map.set(convertedKey, convertedVal);
    });

    return map;
  } catch (error) {
    /* Throw error if value cannot be converted to an Object */
    throw new TypeConversionError(value, `${DataTypes.Map}<${keyType}, ${valueType}>`);
  }
}

/* Export module */
const TypeConverterUtil = {
  convertToNumber,
  convertToBoolean,
  convertToDate,
  convertToRegex,
  convertToObject,
  convertToArray,
  convertToSet,
  convertToMap
}
export = TypeConverterUtil;
