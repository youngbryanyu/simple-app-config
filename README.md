# simple-app-config
A simple configuration manager for different environments.

This module solves the following things that are kind of a pain:
- Loading the appropriate configuration based on the environment
- Automatically converting configuration variables to their desired types when retrieving them

Direct access of environment variables and conversion to common types is also supported.

## Installation
```
npm install simple-app-config
```

If you're using yarn run `yarn add simple-app-config` instead. If you're using pnpm, run `pnpm install simple-app-config` instead.

## Usage
### Setup
Create a `/config` directory in the base directory of your project (determined from `process.cwd()`), and populate it with the following JSON config files:
- `development.json`
- `testing.json`
- `staging.json`
- `production.json`

Create the following .env files in the base directory of your project:
- `.env.development`
- `.env.testing`
- `.env.staging`
- `.env.production`

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

