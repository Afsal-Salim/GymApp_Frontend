import { getAxiosErrorMessage } from './http/axiosErrorMessage';
import { publicApi } from './http/publicApi';
import { marketingEnquiryPath } from '@/config/env';

export type SubmitMarketingEnquiryPayload = {
  name: string;
  email: string;
  message: string;
};

/**
 * Public marketing enquiry (homepage).
 * **POST** `public/enquiries/` under `API_BASE_URL` (e.g. `/api/public/enquiries/` full path).
 * Body: `{ name, email, message }`. Success **201** `{ ok: true, id }`. **400** = serializer field errors.
 */
export async function submitMarketingEnquiry(payload: SubmitMarketingEnquiryPayload): Promise<void> {
  try {
    await publicApi.post(marketingEnquiryPath, {
      name: payload.name.trim(),
      email: payload.email.trim(),
      message: payload.message.trim(),
    });
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Could not send your enquiry. Try again later.'));
  }
}
