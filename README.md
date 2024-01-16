# simple-app-config
A simple configuration manager for Node.js applications. I created this libary so that you can just import it anywhere in your application code and have it ✨JUST WORK✨.

## Navigation
* [Features](#features)
* [Installation](#installation)
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
```
npm install simple-app-config
```

If you're using yarn run `yarn add simple-app-config` instead. If you're using pnpm, run `pnpm install simple-app-config` instead.

## Usage
### Setup
Create a `/config` directory in the base directory of your project. The base directory is determined from the current working directory, which should be where your `package.json` file resides if you are running your application using scripts. Populate the `/config` directory with the following JSON config files:
- `development.json`
- `testing.json`
- `staging.json`
- `production.json`
- `default.json` - populate this with optional default values to use if not specified in the main config file

Create the following .env files in the base directory of your project:
- `.env.development`
- `.env.testing`
- `.env.staging`
- `.env.production`

Import simple-app-config whenever you need to retrieve configuration values by using:
```
import Config from 'simple-app-config'
```
See the [API](#API) section for how to use the APIs.

### ❗Things to keep in mind
- The naming of the files and directories matter, so make sure you name them like specified in the setup instructions. If you need more flexibility with the setup, see the [command line arguments](#command-line-arguments) and [environment variables](#environment-variables) that can be set to customize your setup.
- You don't need to have all of the environments above, and thus won't necessarily need to create files for all of the environments, but we highly recommend it.
- You don't necessarily need a .env file for the config file of the same environment, but if you reference any environment variables in your config file, you will need to set them elsewhere (e.g. through your Docker container).

## Environment Variable Conversion and Expansion
Arrays and sets should be represented like they would in JSON. Maps should be represented as nested JSON structures.

## Command Line Arguments
Command line arguments are optional and can be specified to override and set custom settings.

❗ Note: command line arguments take precedence over environment variables. As an example. if the `--env` command line arg which sets the environment is set to `production`, but the `NODE_ENV` environment variable is set to `development`, the environment determined will be `production`. If neither a command line argument or environment varirable is set to override a specific field, the module will fall back to the default.

### ---config-dir
The `--config-dir` command line argument can be set to specify a custom path to the `/config` directory. This will override any custom path set by the `CONFIG_DIR` environment variable. This can be either an absolute path or a relative path. If it is a relative path, it will be relative to the current working directory.

If the path specified by `--config-dir` doesn't exist, the module will try to load any path set by `CONFIG_DIR`. If the path specified by `CONFIG_DIR` doesn't or isn't set then the default path to the directory containing the `/config` directory will remain the current working directory.

```
node dist/index.js --config-dir=test/configFiles
```

### ---config-path
The `--config-path` command line argument can be set to specify a custom path to the config file to use. This will override the custom path set by the `CONFIG_PATH` environment variable. This can be either an absolute path or a relative path. This path is not affected by a directory set by the `--config-dir` command line argument or `CONFIG_DIR` environment variable, so any relative path will always be relative to the current working directory.

If the path specified by `--config-path` doesn't exist, the module will try to load any path set by `CONFIG_PATH`. If `CONFIG_PATH` is invalid or isn't set, the module will attempt to search the config directory to find the config file matching the environment.
```
node dist/index.js --config-path=test/config.json
```

### --env
The `--env` command line argument can be set to override the environment determined by the module. This will override the environment set by the `NODE_ENV` environment variable.

```
node dist/index.js --env=production
```

### --env-names
The `--env-names` command line argument can be used to specify custom environment names that your application uses for different environments (e.g. alpha, beta, etc). This will override the environment set by the `ENV_NAMES` environment variable. If you specify custom environment names, your  `.env` files must follow the following naming convention of `.env.<custom-environment-name>`, and your config files must follow the naming convention of `<custom-environment-name>.json`.
```
node dist/index.js --env-names='alpha,beta,gamma,prod'
```

### ---env-dir
The `--env-dir` command line argument can be set to specify a custom path to the `.env` file. This will override any custom path set by the `ENV_DIR` environment variable. This can be either an absolute path or a relative path. If it is a relative path, it will be relative to the current working directory.

If the path specified by `--env-path` doesn't exist, the module will try to load any path set by `ENV_PATH`. If the path specified by `ENV_PATH` doesn't or isn't set then the default path to the directory containing the .env files will remain the current working directory.

```
node dist/index.js --env-dir=test/envFiles
```

### ---env-path
The `--env-path` command line argument can be set to specify a custom path to the `.env` file to use. This will override the custom path set by the `ENV_PATH` environment variable. This can be either an absolute path or a relative path. This path is not affected by a directory set by the `--env-dir` command line argument or `ENV_DIR` environment variable, so any relative path will always be relative to the current working directory.

If the path specified by `--env-path` doesn't exist, the module will try to load any path set by `ENV_PATH`. If `ENV_PATH` is invalid or isn't set, the module will attempt to search the `.env` directory to find the `.env` file matching the environment.
```
node dist/index.js --env-path=test/.env.development
```

## Special environment Variables
These special environment variables are optional and can be specified to override and set custom settings, similar to command line arguments.

❗ Note: special environment variables take precedence over defaults set by the module, but will be overriden if the corresponding command line argument that affects the same field is set.

### CONFIG_DIR
The `CONFIG_DIR` environment variable can be set to specify a custom path to the `/config` directory. This can be either an absolute path or a relative path. If it is a relative path, it will be relative to the current working directory. If the path specified by `CONFIG_DIR` is invalid, then the default path to the directory containing the `/config` directory will remain the current working directory.

### CONFIG_PATH
The `CONFIG_PATH` environment variable can be set to specify a custom path to the config file to use. This can be either an absolute path or a relative path. This path is not affected by a directory set by the `--config-dir` command line argument or `CONFIG_DIR` environment variable, so any relative path will always be relative to the current working directory.

If the path specified by `CONFIG_PATH` is invalid, the module will attempt to search the config directory to find the config file matching the environment.

### NODE_ENV
The `NODE_ENV` environment variable is standard and used to set the current environment of the application. This will override the default environment which is set to `development`.

### ENV_NAMES
The `ENV_NAMES` environment variable can be used to specify custom environment names that your application uses for different environments (e.g. alpha, beta, etc). If you specify custom environment names, your  `.env` files must follow the following naming convention of `.env.<custom-environment-name>`, and your config files must follow the naming convention of `<custom-environment-name>.json`.

### ENV_DIR
The `ENV_DIR` environment variable can be set to specify a custom path to the `.env` file. This can be either an absolute path or a relative path. If it is a relative path, it will be relative to the current working directory.

If the path specified by `ENV_DIR` doesn't exist, then the default path to the directory containing the .env files will remain the current working directory.

### ENV_PATH
The `ENV_PATH` environment variable can be set to specify a custom path to the `.env` file to use. This can be either an absolute path or a relative path. This path is not affected by a directory set by the `--env-dir` command line argument or `ENV_DIR` environment variable, so any relative path will always be relative to the current working directory.

If the path specified by `environment variable` is invalid, the module will attempt to search the `.env` directory to find the `.env` file matching the environment.

## API

### Config.configure(configOptions?: ConfigOptions): void
`configure()` sets up the module, which involves the following steps :
1. Sets any custom environment names that can be specified by command line arg `--env-names` or environment variable `ENV_NAMES`.
2. Determines the environment of the application.
3. Sets the target directory for the `.env` files and `/config` directory.
4. Determines the possible paths to the `.env` and config files for each environment.
5. Attempts to find and load a `.env` file.
6. Loads al the environment variables into an in-memory cache.
7. Attempts to find and load a config file into an in-memory map structure.
8. Loads the default config file if it exists.

#### Parameters
- `configOptions?`: An optional configuration object
  - `force?`: optional `boolean` indicating whether or not to force simple-app-config to re-configure

#### Example
```
import Config from 'simple-app-config';   // will automatically perfor all configuration setup upon the first import

/* Does nothing since .configure() was already called upon import */
Config.configure();

/* Resets the state and performs configuration setup again since the `force` flag was set */
Config.configure({ force: true });      
```

This function will only run a single time upon importing the dependency when running the application, and if called again will not re-configure unless the `force` flag is set to `true` when calling it again.

### Config.get\<T\>(key: string): T
`get()` retrieves a value loaded from the configuration file and returns it as the desired type that it was set to.


#### Parameters
- `key`: The key of the config variable to retrieve

#### Example
Assume the .env file to be:
```
BOOLEAN = FALSE
MAP = '{"cat": "test", "bat": "test"}'
SET = '[1, 2, 3]'
```

Assume the default.json default config file to be:
```
{
  "bool": $boolean::boolean
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

The below code demonstrates how to retrieve config values. You can retrieve a nested value within your configuration file by using `.` as a delimiter like shown in the example. If you really want to have dots in the names of your keys, you can escape them with a backslash.
```
import Config from 'simple-app-config';  

/* Retrieve boolean value */
const bool: boolean = Config.get('bool');

/* Retrieve nested map */
const map: Map<string, string> = Config.get('var1.var2.map');

/* Retrieve nested map but its string literal value is expanded */
const mapString: string = Config.get('var1.var2.mapString');

/* Escape dots in the key name by escaping with backslash */
const set: Set<numner> = Config.get('escaped\\\.field.inside');
```

### get
...

### getString
...


