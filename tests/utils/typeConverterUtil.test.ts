/* Unit tests for the type converter util */
import { TypeConversionError } from '../../src/errors/typeConversionError';
import TypeConverterUtil from '../../src/utils/typeConverterUtil';

/* Type converter util tests */
describe('Type Converter Util Tests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  /* Convert to number tests */
  describe('Convert To Number Tests', () => {
    /* Test when converting to a number is possible */
    it('Should successfully convert the input to a number if possible.', () => {
      /* Spy on the function under test */
      jest.spyOn(TypeConverterUtil, 'convertToNumber');

      /* Set up and call function */
      const value = "5";
      const result = TypeConverterUtil.convertToNumber(value);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToNumber).toHaveBeenCalled();
      expect(result).toBe(5);
      expect(typeof result ).toBe('number');
    });

    /* Test when converting to a number isn't possible */
    it('Should successfully convert the input to a number if possible.', () => {
      /* Spy on the function under test */
      const spy = jest.spyOn(TypeConverterUtil, 'convertToNumber');

      /* Set up and call function */
      const value = "100ABC";
      expect(TypeConverterUtil.convertToNumber(value)).toThrow(TypeConversionError);

      /* Compare against expected */
      expect(TypeConverterUtil.convertToNumber).toHaveBeenCalled();
    });
  });
});