import { getAxiosErrorMessage } from './http/axiosErrorMessage';
import { publicApi } from './http/publicApi';
import { serviceEnquiryPath } from '../config/env';

export type SubmitServiceEnquiryPayload = {
  name: string;
  email: string;
  phone: string;
  message: string;
  service_topic?: string;
};

export type SubmitServiceEnquiryResponse = {
  ok: boolean;
  id: number;
};

/**
 * **POST** `/api/public/service-enquiries/` — no auth.
 * Body: name, email, phone (5–50 chars on API; UI sends 10-digit mobile), message (3–5000), optional service_topic (max 255).
 * **201** `{ ok: true, id }`.
 */
export async function submitPublicServiceEnquiry(
  payload: SubmitServiceEnquiryPayload
): Promise<SubmitServiceEnquiryResponse> {
  try {
    const { data } = await publicApi.post<SubmitServiceEnquiryResponse>(serviceEnquiryPath, {
      name: payload.name.trim().slice(0, 200),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      message: payload.message.trim(),
      ...(payload.service_topic?.trim() ?
        { service_topic: payload.service_topic.trim().slice(0, 255) }
      : {}),
    });
    return data;
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Could not send your enquiry. Try again later.'));
  }
}
