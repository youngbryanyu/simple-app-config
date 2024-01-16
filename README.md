# simple-app-config
A simple configuration manager for Node.js applications. I created this libary so that you can just import it anywhere in your application code and have it ✨JUST WORK✨.

## Navigation
* [Features](#features)
* [Installation](#installation)
* [Setup](#setup)
* [Usage](#usage)
* [Command Line Arguments](#command-line-arguments)
* [Special Environment Variables](#special-environment-variables)
* [API](#api)
* [Changelog](./CHANGELOG.md)
* [Contributing](./CONTRIBUTING.md)

## Features
This module comes with the following key features:
- Loading the appropriate configuration file based on the environment
- Automatically converting configuration fields to the desired types
- Referencing environment variables in configuration files and expanding them (or converting them to the desired type)

## Installation
```bash
npm install simple-app-config
```

If you're using yarn run `yarn add simple-app-config` instead. If you're using pnpm, run `pnpm install simple-app-config` instead.

## Setup
Create a `/config` directory in the base directory of your project. The base directory is determined from the current working directory, which should be where your `package.json` file resides if you are running your application using scripts. Populate the `/config` directory with the following JSON configuration files:
- `development.json`
- `testing.json`
- `staging.json`
- `production.json`
- `default.json` - populate this with optional default values to use if not specified in the main configuration file

Create the following .env files in the base directory of your project:
- `.env.development`
- `.env.testing`
- `.env.staging`
- `.env.production`

Import simple-app-config whenever you need to retrieve configuration values by using:
```typescript
import Config from 'simple-app-config';
```

If you're using CommonJS module instead of ES modules, you can import use the `require` keyword:
```javascript
const Config = require('simple-app-config`);
```

See the [API](#API) section for how to use the APIs.

> :warning: The naming of the files and directories matter, so make sure you name them like specified in the setup instructions. If you need more flexibility with the setup, see the [command line arguments](#command-line-arguments) and [environment variables](#special-environment-variables) that can be set to customize your setup. You don't need to have all of the environments above, and thus won't necessarily need to create files for all of the environments, but we highly recommend it. You don't necessarily need a .env file for the configuration file of the same environment, but if you reference any environment variables in your configuration file, you will need to set them elsewhere (e.g. through your Docker container).

## Usage
### Environment Variables and .env Files
Within environment variables, everything is represented as a string. However, this module provides the ability to convert those strings directly to common datatypes either directly into your configuration files, or in your code through the [API](#api). You should be aware of how to represent common data types within your environment variables:
- The datatypes `string`, `number`, `boolean`, `Date`, and `RegExp` should be represented normally as strings. 
- Nested datatypes like `object`, `Array`, `Set`, and `Map`  should be represented as JSON strings. Maps and JSON objects are both represented the same way with curly braces as nested JSON structures, but distinction between the two is specified during type conversion. Square brackets are used to represent both sets and arrays, but the distinction is specified during type conversion.

Below is an example of how to represent common data types in your environment variables or `.env` files.
```dosini
STRING = 'this is a string'
NUMBER = 5
BOOLEAN = false
DATE = '1970-01-01T00:00:10.000Z'
REGEXP = '[0-9]'
OBJECT = {"dog": "bark", "cat": "meow"}
ARRAY = '[1, 2, 3]'
SET = '["one", "two", "three"]'
MAP = '{"dog": "bark", "cat": "meow"}'
```

Nested data types within the `.env` file also only support nesting of the types `string`, `number`, `boolean`, `Date`, `RegExp`, and `object`. See the [API](#api) section for how to directly retrieve environment variables without the need of a configuration file.

### JSON Config Files
Configurations can be stored inside JSON files. The values within your JSON files can reference your environment variables and either expand them as strings or convert them to the desired data types. Environment variable expansion and type conversion is supported only for values within the JSON file, and not the keys. You can specify whether to expand an environment variable as a string or convert it to a target type using the following notations:
- `${<environment-variable-name>}`: expands an environment variable as a string if it's valid.
- `$<environment-variable-name>::<primary-type>:<sub-type-1>:<sub-type-2>`: converts an environment variable to the target primary type. Types like `Array`, `Set`, and `Map` will need secondary subtypes specified or else the subtypes will default to `string`. If a subtype is specified but unnecessary to convert to the target type it will be ignored (e.g. `string` has no subtype).

> :warning: If your configuration file references an invalid environment variable, an `UndefinedEnvVarError` will be thrown. If you attempt to convert an environment variable referenced in your configuration file to a non-supported type (not a type mentioned), an `UnsupportedTypeError` will be thrown. If you attempt converting an environment variable that is formatted badly and/or cannot be converted to the desired target type, a `TypeConversionError` will be thrown. 

If you want to use `.` in the key of your configuration variables, your should escape them using a backslash since the module uses `.` as the delimiter when specifying nested configuration values. The supported conversion types are the following which are non-case-sensitive:
- string
- number
- boolean
- date
- regexp
- object
- array
- set
- map

Below is an example of how to reference environment variables in your JSON configuration file, based on the `.env` file also shown below:

**JSON Configuration File**
```JSON
{
  "STRING": "$STRING",
  "STRING_EXPANSION": "Hello. ${STRING}",
  "ESCAPED\\.DOT": "This is escaped",
  "NUMBER": "$NUMBER::number",
  "BOOLEAN": "$BOOLEAN::boolean",
  "DATE": "$DATE::date",
  "REGEXP": "$REGEXP::regexp",
  "OBJECT": "$OBJECT::object",
  "ARRAY": "$ARRAY::array:number",
  "SET": "$SET::set:string",
  "MAP": "$MAP::map:string:number",
  "NESTED": {
    "VAL": "$ARRAY::array:number"
  }
}
```

**.env File**
```dosini
STRING = 'this is a string'
NUMBER = 5
BOOLEAN = false
DATE = '1970-01-01T00:00:10.000Z'
REGEXP = '[0-9]'
OBJECT = {"dog": "bark", "cat": "meow"}
ARRAY = '[1, 2, 3]'
SET = '["one", "two", "three"]'
MAP = '{"dog": "3", "cat": "4"}'
```

See the [API](#api) section for how to retrieve values from the configuration files.

## Command Line Arguments
Command line arguments are optional and can be specified to override and set custom settings.

> :warning: Command line arguments take precedence over environment variables. As an example. if the `--env` command line arg which sets the environment is set to `production`, but the `NODE_ENV` environment variable is set to `development`, the environment determined will be `production`. If neither a command line argument or environment varirable is set to override a specific field, the module will fall back to the default.

### ---config-dir
The `--config-dir` command line argument can be set to specify a custom path to the `/config` directory. This will override any custom path set by the `CONFIG_DIR` environment variable. This can be either an absolute path or a relative path. If it is a relative path, it will be relative to the current working directory.

If the path specified by `--config-dir` is invalid, the module will try to load any path set by `CONFIG_DIR`. If the path specified by `CONFIG_DIR` doesn't or isn't set then the default path to the directory containing the `/config` directory will remain the current working directory.

```bash
node dist/index.js --config-dir=test/configFiles
```

### ---config-path
The `--config-path` command line argument can be set to specify a custom path to the configuration file to use. This will override the custom path set by the `CONFIG_PATH` environment variable. This can be either an absolute path or a relative path. This path is not affected by a directory set by the `--config-dir` command line argument or `CONFIG_DIR` environment variable, so any relative path will always be relative to the current working directory.

If the path specified by `--config-path` is invalid, the module will try to load any path set by `CONFIG_PATH`. If `CONFIG_PATH` is invalid or isn't set, the module will attempt to search the config directory to find the config file matching the environment.
```bash
node dist/index.js --config-path=test/config.json
```

### --env
The `--env` command line argument can be set to override the environment determined by the module. This will override the environment set by the `NODE_ENV` environment variable.

```bash
node dist/index.js --env=production
```

### --env-names
The `--env-names` command line argument can be used to specify custom environment names that your application uses for different environments (e.g. alpha, beta, etc). This will override the environment set by the `ENV_NAMES` environment variable. If you specify custom environment names, your  `.env` files must follow the following naming convention of `.env.<custom-environment-name>`, and your config files must follow the naming convention of `<custom-environment-name>.json`.
```bash
node dist/index.js --env-names='alpha,beta,gamma,prod'
```

### ---env-dir
The `--env-dir` command line argument can be set to specify a custom path to the `.env` file. This will override any custom path set by the `ENV_DIR` environment variable. This can be either an absolute path or a relative path. If it is a relative path, it will be relative to the current working directory.

If the path specified by `--env-path` is invalid, the module will try to load any path set by `ENV_PATH`. If the path specified by `ENV_PATH` is invalid or isn't set then the default path to the directory containing the .env files will remain the current working directory.

```bash
node dist/index.js --env-dir=test/envFiles
```

### ---env-path
The `--env-path` command line argument can be set to specify a custom path to the `.env` file to use. This will override the custom path set by the `ENV_PATH` environment variable. This can be either an absolute path or a relative path. This path is not affected by a directory set by the `--env-dir` command line argument or `ENV_DIR` environment variable, so any relative path will always be relative to the current working directory.

If the path specified by `--env-path` is invalid, the module will try to load any path set by `ENV_PATH`. If `ENV_PATH` is invalid or isn't set, the module will attempt to search the `.env` directory to find the `.env` file matching the environment.
```bash
node dist/index.js --env-path=test/.env.development
```

## Special Environment Variables
These special environment variables are optional and can be specified to override and set custom settings, similar to command line arguments.

> :warning: Special environment variables take precedence over defaults set by the module, but will be overriden if the corresponding command line argument that affects the same field is set.

### CONFIG_DIR
The `CONFIG_DIR` environment variable can be set to specify a custom path to the `/config` directory. This can be either an absolute path or a relative path. If it is a relative path, it will be relative to the current working directory. If the path specified by `CONFIG_DIR` is invalid, then the default path to the directory containing the `/config` directory will remain the current working directory.

### CONFIG_PATH
The `CONFIG_PATH` environment variable can be set to specify a custom path to the configuration file to use. This can be either an absolute path or a relative path. This path is not affected by a directory set by the `--config-dir` command line argument or `CONFIG_DIR` environment variable, so any relative path will always be relative to the current working directory.

If the path specified by `CONFIG_PATH` is invalid, the module will attempt to search the `/config` directory to find the configuration file matching the environment.

### NODE_ENV
The `NODE_ENV` environment variable is standard and used to set the current environment of the application. This will override the default environment which is set to `development`.

### ENV_NAMES
The `ENV_NAMES` environment variable can be used to specify custom environment names that your application uses for different environments (e.g. alpha, beta, etc). If you specify custom environment names, your  `.env` files must follow the following naming convention of `.env.<custom-environment-name>`, and your configuration files must follow the naming convention of `<custom-environment-name>.json`.

### ENV_DIR
The `ENV_DIR` environment variable can be set to specify a custom path to the `.env` file. This can be either an absolute path or a relative path. If it is a relative path, it will be relative to the current working directory.

If the path specified by `ENV_DIR` is invalid, then the default path to the directory containing the .env files will remain the current working directory.

### ENV_PATH
The `ENV_PATH` environment variable can be set to specify a custom path to the `.env` file to use. This can be either an absolute path or a relative path. This path is not affected by a directory set by the `--env-dir` command line argument or `ENV_DIR` environment variable, so any relative path will always be relative to the current working directory.

If the path specified by `environment variable` is invalid, the module will attempt to search the `.env` directory to find the `.env` file matching the environment.

## API

### Config.configure(configOptions?: ConfigOptions): void
`configure()` sets up the module, which involves the following steps :
1. Sets any custom environment names that can be specified by command line arg `--env-names` or environment variable `ENV_NAMES`.
2. Determines the environment of the application.
3. Sets the target directory for the `.env` files and `/config` directory.
4. Determines the possible paths to the `.env` and configuration files for each environment.
5. Attempts to find and load a `.env` file.
6. Loads al the environment variables into an in-memory cache.
7. Attempts to find and load a configuration file into an in-memory map structure.
8. Loads the default configuration file if it exists.

#### Parameters
- `configOptions?`: An optional configuration object
  - `force?`: optional `boolean` indicating whether or not to force simple-app-config to re-configure

#### Return Value
This function does not return a value

#### Errors Thrown
- `UndefinedEnvVarError`: Thrown if your configuration file references an invalid environment variable.
- `UnsupportedTypeError`: Thrown if you attempt to convert an environment variable referenced in your configuration file to a non-supported type (not a type mentioned).
- `TypeConversionError`: Thrown if if you attempt converting an environment variable that is formatted badly and/or cannot be converted to the desired target type.

#### Example
```typescript
import Config from 'simple-app-config';   // will automatically perform all configuration setup upon the first import

/* Does nothing since .configure() was already called upon import */
Config.configure();

/* Resets the state and performs configuration setup again since the `force` flag was set */
Config.configure({ force: true });      
```

> :warning: This function will only run a single time upon importing the dependency when running the application, and if called again will not re-configure unless the `force` flag is set to `true` when calling it again.

### Config.get\<T\>(key: string): T
`get()` retrieves a value loaded from the configuration file and returns it as the desired type that it was set to.

#### Parameters
- `key`: The key of the configuration variable to retrieve

#### Return Value
Returns a value of generic type `T` that is determined by what type the value was converted to when the configuration file was loaded.

#### Errors Thrown
- `UndefinedConfigValueError`: Thrown if the input `key` is invalid (the configuration value doesn't exist).

#### Example
Assume the .env file to be:
```dosini
BOOLEAN = FALSE
MAP = '{"cat": "test", "bat": "test"}'
SET = '[1, 2, 3]'
```

Assume the default.json default configuration file to be:
```json
{
  "bool": "$boolean::boolean",
  "var1": {
    "var2": {
      "map": "$MAP::map:string:string",
      "mapString": "This is a map: ${MAP}"
    }
  },
  "escaped\\.field": {
    "inside": "$set::number"
  }
}
```

The below code demonstrates how to retrieve configuration values. You can retrieve a nested value within your configuration file by using `.` as a delimiter like shown in the example. If you really want to have dots in the names of your keys, you can escape them with a backslash.
```typescript
import Config from 'simple-app-config';  

/* Retrieve boolean value */
const bool: boolean = Config.get('bool');

/* Retrieve nested map */
const map: Map<string, string> = Config.get('var1.var2.map');

/* Retrieve nested map but its string literal value is expanded */
const mapString: string = Config.get('var1.var2.mapString');

/* Escape dots in the key name by escaping with backslash */
const set: Set<number> = Config.get('escaped\\\.field.inside');
```

### EnvParser.getString(key: string): string
...


