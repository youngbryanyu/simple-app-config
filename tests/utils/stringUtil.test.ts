/* Tests for String utility functions */
import StringUtil from '../../src/utils/stringUtil';

/* String Util Tests */
describe('StringUtil tests', () => {
  /* trimStringFromEnd tests */
  describe('trimStringFromEnd tests', () => {
    /* Test successful trim */
    it('Should successfully trim all of a pattern from the end of a string', () => {
      const result = StringUtil.trimStringFromEnd('/this/is/a/path////', '/');
      expect(result).toBe('/this/is/a/path');
    });
  });
});
