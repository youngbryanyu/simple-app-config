# simple-app-config
A simple configuration manager for different environments.

This module solves the following things that are kind of a pain:
- Loading the appropriate configuration based on the environment
- Automatically converting configuration variables to their desired types when retrieving them
- Direct access of environment variables and conversion to common types

## Navigation
* [Installation](#installation)
* [Usage](#usage)
* [Command Line Arguments](#command-line-arguments)
* [Environment Variables](#environment-variables)
* [APIs](#apis)
* [Changelog](./CHANGELOG.md)

## Installation
```
npm install simple-app-config
```

If you're using yarn run `yarn add simple-app-config` instead. If you're using pnpm, run `pnpm install simple-app-config` instead.

## Usage
### Setup
Create a `/config` directory in the base directory of your project. The base directory is determined from the current working directory, which should be where your `package.json` file resides if you are running your application using scripts. Populate the directory with the following JSON config files:
- `development.json`
- `testing.json`
- `staging.json`
- `production.json`

Create the following .env files in the base directory of your project:
- `.env.development`
- `.env.testing`
- `.env.staging`
- `.env.production`

The naming of the files and directories matter, so make sure you name them like specified in the setup instructions.


Import simple-app-config whenever you need to retrieve configuration values by using:
```
import Config from 'simple-app-config'
```

See the [APIs](#APIs) section for how to use the API.

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

## APIs
### Configure
`configure` is run immediately when it is imported so you shouldn't need to run it. Configure sets up

## 

