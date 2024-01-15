# simple-app-config
A simple configuration manager for different environments. I created this libary so that you can just import it anywhere in your application code and have it ✨JUST WORK✨.

## Navigation
* [Features](#features)
* [Installation](#installation)
* [Usage](#usage)
* [Command Line Arguments](#command-line-arguments)
* [Environment Variables](#environment-variables)
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


## Command Line Arguments
Command line arguments can be specified to override and set custom settings:

### --env

### --env-path

### ---config-path

### --env-names

## Environment Variables

### NODE_ENV

### ENV_PATH

### CONFIG_PATH

### ENV_NAMES

## API
### configure
`configure` is run immediately when it is imported so you shouldn't need to run it. Configure sets up

### get
...

### getStringFromEnv



