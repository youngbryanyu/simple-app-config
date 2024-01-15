/* Unit tests for env-var-config */
import { DataTypes, Config } from '../src/index';
import fs from 'fs';
import dotenv from 'dotenv';
import { UndefinedEnvVarError } from '../src/errors/undefinedEnvVarError';

/* simple-app-config tests */
describe('simple-app-config Tests', () => {
  /* Setup before each test */
  beforeEach(() => {
    /* Delete all environment variables */
    for (const key in process.env) {
      if (process.env.hasOwnProperty(key)) {
        delete process.env[key];
      }
    }

    /* Restore all mocks */
    jest.restoreAllMocks();
  });

  it('', () => {
    
  })
});