import { apiRequest } from './api';

export interface MailingListEntry {
  id: string;
  email: string;
  name: string | null;
}

export const mailingListService = {
  async getAll() {
    return apiRequest<MailingListEntry[]>('/mailing-list');
  },

  async getCcEmails(): Promise<string[]> {
    const res = await apiRequest<MailingListEntry[]>('/mailing-list');
    if (res?.data && Array.isArray(res.data)) {
      return res.data.map((e) => e.email).filter(Boolean);
    }
    return [];
  },
};