/** Indian mobile-style entry: digits only, exactly this length when provided. */
export const PHONE_DIGIT_LENGTH = 10;

export function digitsOnlyPhone(value: string): string {
  return value.replace(/\D/g, '');
}

/** Controlled input value: strip non-digits, optional leading 91 (India), cap length. */
export function clampPhoneDigitsInput(value: string, maxLen = PHONE_DIGIT_LENGTH): string {
  let d = digitsOnlyPhone(value);
  if (d.length > maxLen && d.startsWith('91')) d = d.slice(2);
  return d.slice(0, maxLen);
}

export function isTenDigitPhone(digits: string): boolean {
  return digits.length === PHONE_DIGIT_LENGTH && /^\d+$/.test(digits);
}
