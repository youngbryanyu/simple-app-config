/* Class for converting strings from environment variable values into other data types */
import { ObjectTypes, PrimitiveTypes } from "../env-var-config";
import { TypeConversionError } from "../errors/typeConversionError";

/**
 * Converts an input string into a number.
 * @param value The input value to convert into a number.
 * @returns The value after being converted to a number.
 * @throws {TypeConversionError} Error thrown if the environment variable's value cannot be converted to the target type (number in this case).
 */
const convertToNumber = (value: string): number => {
  /* Check if value can be strictly converted to an number */
  const num = Number(value);
  if (isNaN(num)) {
    throw new TypeConversionError(value, PrimitiveTypes.Number);
  }

  return num;
}

/**
 * Converts a string into a boolean.
 * @param value The input value to convert into a boolean.
 * @returns The value after being converted to a boolean.
 * @throws {TypeConversionError} Error thrown if the environment variable's value cannot be converted to the target type (boolean in this case).
 */
const convertToBoolean = (value: string): boolean => {
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
  throw new TypeConversionError(value, PrimitiveTypes.Boolean);
}

/**
 * Converts a string into a date.
 * @param value The input value to convert into a date.
 * @returns The value after being converted to a date.
 * @throws {TypeConversionError} Error thrown if the environment variable's value cannot be converted to the target type (Date in this case).
 */
const convertToDate = (value: string): Date => {
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
  throw new TypeConversionError(value, ObjectTypes.Date);
}

/**
 * Converts a string into a regex.
 * @param value The input value to convert into a regex.
 * @returns The value after being converted to a regex.
 * @throws {TypeConversionError} Error thrown if the environment variable's value cannot be converted to the target type (RegExp in this case).
 */
const convertToRegex = (value: string): RegExp => {
  /* Try to convert value to regex */
  try {
    return new RegExp(value);
  } catch (error) {
    /* Throw error if value cannot be converted to a date */
    throw new TypeConversionError(value, ObjectTypes.RegExp);
  }
}

/* Export functions */
const TypeConverterUtil = { 
  convertToNumber, 
  convertToBoolean,
  convertToDate,
  convertToRegex,
}
export = TypeConverterUtil;