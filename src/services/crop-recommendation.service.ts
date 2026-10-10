import { api } from './api/axiosInstance';
import { API_ENDPOINTS } from './api/endpoints';

export interface CropRecommendationInput {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export const cropRecommendationService = {
  async recommend(input: CropRecommendationInput): Promise<unknown> {
    const { data } = await api.post<unknown>(API_ENDPOINTS.cropRecommendation.recommend, input);
    if (typeof data === 'object' && data !== null && !Array.isArray(data) && 'data' in data) {
      return data.data;
    }
    return data;
  },
};