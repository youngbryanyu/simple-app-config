/* Global jest setup file for all tests */

/* Remove all console print statements - uncomment for debugging, but leave commented when pushing to git */
global.console = {
  log: jest.fn(), // Mock console.log
  error: jest.fn(), // Mock console.error
  warn: jest.fn(), // Mock console.warn
  info: jest.fn(), // Mock console.info
  debug: jest.fn(), // Mock console.debug
}

/* Set the NODE_ENV to test */
process.env.NODE_ENV = 'test';
