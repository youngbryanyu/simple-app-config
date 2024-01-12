/* Unit tests for the logger util */
import {LoggerUtil} from '../../src/utils/loggerUtil'


/* Logger util tests */
describe('Logger util tests', () => {

  /**
   * Setup before all tests
   */
  beforeAll(() => {

  });

  /* Setup before each test */
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  /* Test setting the logger implementation */
  it('Should be able to set the logger implementation', () => {
    /* Spy on the function */
    jest.spyOn(LoggerUtil, 'setLogger');

    /* Call the function  */
    LoggerUtil.setLogger(console);

    /* Compare against expected */
    expect(LoggerUtil.setLogger).toHaveBeenCalled();
  });

  /* Test outputting to the console with 'info' verbose level */
  it('Should be able log with verbose level \'info\'', () => {
    /* Spy on the function */
    jest.spyOn(LoggerUtil, 'info');

    /* Spy on the console (logger implementation) */
    jest.spyOn(console, 'info');

    /* Call the function  */
    LoggerUtil.setLogger(console);
    LoggerUtil.info('test');

    /* Compare against expected */
    expect(LoggerUtil.info).toHaveBeenCalled();
    expect(console.info).toHaveBeenCalled()
  });

   /* Test setting the flag to enable or disable logs */
   it('Should be able to set the flag to enable or disable logs', () => {
    /* Spy on the function */
    jest.spyOn(LoggerUtil, 'setLoggingEnabled');

    /* Call the function  */
    LoggerUtil.setLoggingEnabled(true);

    /* Compare against expected */
    expect(LoggerUtil.setLoggingEnabled).toHaveBeenCalled();
  });
});