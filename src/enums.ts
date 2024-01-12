/**
 * Enums for data types that can be nested in Arrays, Sets, and Maps during type conversion form environment variables.
 */
export enum NestableDataTypes {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Date = 'Date',
  RegExp = 'RegExp',
  Object = 'object',
}

/**
 * Enums for data types that cannot be nested in Arrays, Sets, and Maps during type conversion form environment variables.
 */
export enum NonNestableDataTypes {
  Array = 'Array',
  Map = 'Map',
  Set = 'Set'
}
