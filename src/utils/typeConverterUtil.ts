/* Class for converting strings from environment variable values into other data types */
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
    throw new TypeConversionError(value, "number");
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
  throw new TypeConversionError(value, "boolean");
}

/* Export functions */
const TypeConverterUtil = { 
  convertToNumber, 
  convertToBoolean 
}
export = TypeConverterUtil;