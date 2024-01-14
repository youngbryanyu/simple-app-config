import { Config } from "./simple-app-config";
import { NestableDataTypes } from "./constants";

/* Export EnvVarConfig and Nestable Data Types */
export { Config as Config, NestableDataTypes as DataTypes };

/* Run configuration upon import from dependent module */
// SimpleAppConfig.configure();
// process.env.CONFIG_PATH = 'test2.json'
// SimpleAppConfig.configure();
// const map: Map<string, Map<unknown, unknown>> = Config.get('var2');
// console.log(map.get('test'));
// console.log(Config.get('var2.test.test2'));
// console.log(Config.get('var2'));