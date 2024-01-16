/* String util functions */

/**
 * Trims all instances of an input pattern off of the end of a string
 * @param s The main string to trim down.
 * @param pattern The patterns appearing 0+ times to trim from the end of the string
 * @returns The trimmed string
 */
function trimStringFromEnd(s: string, pattern: string): string {
  /* Escape special characters */
  const escapedStringToTrim = pattern.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

  /* Create regex to match the end */
  const regexp = new RegExp(`${escapedStringToTrim}+$`);

  /* Replace the  matched part with empty character*/
  return s.replace(regexp, '');
}

/* Wrap and export util functions */
export const StringUtil = {
  trimStringFromEnd
};

/* Set default export */
export default StringUtil;
