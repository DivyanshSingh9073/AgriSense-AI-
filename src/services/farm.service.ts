import { api } from './api/axiosInstance';
import { API_ENDPOINTS } from './api/endpoints';
import type { Farm, FarmInput } from '@/types';

/** Farm routes return resources directly, without an ApiResponse envelope. */

export const farmService = {
  async list(): Promise<Farm[]> {
    const { data } = await api.get<Farm[]>(API_ENDPOINTS.farms.list);
    return data;
  },

  async create(input: FarmInput): Promise<Farm> {
    const { data } = await api.post<Farm>(API_ENDPOINTS.farms.create, input);
    return data;
  },

  async update(farmId: number, input: FarmInput): Promise<Farm> {
    const { data } = await api.put<Farm>(API_ENDPOINTS.farms.detail(farmId), input);
    return data;
  },

  async remove(farmId: number): Promise<void> {
    await api.delete(API_ENDPOINTS.farms.detail(farmId));
  },
};
