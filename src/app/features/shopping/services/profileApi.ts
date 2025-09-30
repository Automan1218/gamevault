// src/features/auth/services/profileApi.ts
import { apiClient } from '@/lib/api/client';

export interface ProfileDTO {
  uid: number; // 和后端保持一致
  username: string;
  email: string;
  avatar?: string;
}


export const profileApi = {
  async getProfile(): Promise<ProfileDTO> {
    return apiClient.get<ProfileDTO>('/profile/me');
  },
};
