import { SimpleAppConfig } from "./simple-app-config";
import { NestableDataTypes } from "./enums";

/* Export EnvVarConfig and Nestable Data Types */
export { SimpleAppConfig as Config, NestableDataTypes as DataTypes };

/* Run configuration upon import from dependent module */
// SimpleAppConfig.configure();
process.env.CONFIG_PATH = 'test2.json'
// SimpleAppConfig.configure();
// const map: Map<string, Map<unknown, unknown>> = SimpleAppConfig.get('var2');
// console.log(map.get('test'));

console.log(SimpleAppConfig.get('var3'));