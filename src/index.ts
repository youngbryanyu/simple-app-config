import { Config } from "./simple-app-config";
import { NestableDataTypes } from "./constants";
import EnvParser from "./utils/envParser";

/* Set exports  */
export { Config, NestableDataTypes as DataTypes, EnvParser };

/* Set Config to be the default export */
export default Config;
