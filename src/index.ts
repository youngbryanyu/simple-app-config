import { 
  config,
  getString, 
  getNumber, 
  getBoolean, 
  getDate, 
  getRegExp, 
  getObject, 
  getArray, 
  getSet, 
  getMap, 
  refreshCache,
  setValue,
  deleteValue
} from "./env-var-config";
import { NestableDataTypes } from "./enums";

/* Wrap functions to export in EnvVarConfig namespace */
const EnvVarConfig = {
  config,
  getString,
  getNumber,
  getBoolean,
  getDate,
  getRegExp,
  getObject,
  getArray,
  getSet,
  getMap,
  refreshCache,
  setValue,
  deleteValue
}

/* Export EnvVarConfig and Nestable Data Types */
export { EnvVarConfig, NestableDataTypes as DataTypes };
