/**
 * Pre-filled WhatsApp message for public gym site visitors (wa.me text=).
 * Wording is neutral and professional; gym name is inserted when available.
 */
export function gymClientWhatsAppPrefillMessage(gymName: string): string {
  const name = gymName.trim() || 'your gym';
  return `Hi, I found you on your website and I’d like to learn more about joining ${name}. Could you please share membership options and how to get started? Thanks!`;
}

/** Digits only for wa.me (no +); 10-digit numbers default to India 91. */
export function normalizePhoneForWhatsApp(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function buildGymClientWhatsAppHref(phoneDisplay: string, gymName: string): string | null {
  const waPhone = normalizePhoneForWhatsApp(phoneDisplay);
  if (!waPhone) return null;
  const text = gymClientWhatsAppPrefillMessage(gymName);
  return `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`;
}

/** wa.me with visitor-written text (e.g. footer enquiry). */
export function buildGymClientWhatsAppHrefWithCustomText(phoneDisplay: string, message: string): string | null {
  const waPhone = normalizePhoneForWhatsApp(phoneDisplay);
  if (!waPhone) return null;
  return `https://wa.me/${waPhone}?text=${encodeURIComponent(message.trim())}`;
}
