/**
 * Enums for data types that can be nested in Arrays, Sets, and Maps during type conversion form environment variables.
 * - string, number, boolean, and object are the string literal values when `typeof` is ran against variables of those types.
 * - Date and RegExp are classes
 */
export enum NestableDataTypes {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Date = 'Date',
  RegExp = 'RegExp',
  Object = 'object'
}

/**
 * Enums for data types that cannot be nested in Arrays, Sets, and Maps during type conversion form environment variables.
 * - Array, Set, and Map are classes
 */
export enum NonNestableDataTypes {
  Array = 'Array',
  Set = 'Set',
  Map = 'Map'
}
