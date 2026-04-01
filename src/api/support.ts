import { protectedApi } from './http/protectedApi';
import { getAxiosErrorMessage } from './http/axiosErrorMessage';

const SUPPORT_PATH = '/support/';

export type ClientSupportMessageKind = 'support' | 'feedback';

export type ClientSupportMessage = {
  id: number;
  kind: ClientSupportMessageKind;
  subject: string;
  message: string;
  created_at: string;
};

export type PostClientSupportPayload = {
  kind: ClientSupportMessageKind;
  /** Optional; max 200 chars on the server. */
  subject?: string;
  /** Trimmed; min 3, max 5000 on the server. */
  message: string;
};

/**
 * **GET** `/support/` — last 100 items for the authenticated customer, newest first.
 */
export async function listClientSupportMessages(): Promise<ClientSupportMessage[]> {
  try {
    const { data } = await protectedApi.get<{ results?: ClientSupportMessage[] }>(SUPPORT_PATH);
    const results = data?.results;
    return Array.isArray(results) ? results : [];
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Could not load your messages.'));
  }
}

/**
 * **POST** `/support/` — creates a support or feedback row; team receives email.
 */
export async function postClientSupportMessage(
  payload: PostClientSupportPayload
): Promise<ClientSupportMessage> {
  const subjectTrimmed = payload.subject?.trim() ?? '';
  const body: Record<string, unknown> = {
    kind: payload.kind,
    message: payload.message.trim(),
  };
  if (subjectTrimmed) {
    body.subject = subjectTrimmed.slice(0, 200);
  }
  try {
    const { data } = await protectedApi.post<ClientSupportMessage>(SUPPORT_PATH, body);
    return data;
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Could not send your message. Try again later.'));
  }
}
