import { api } from './api/axiosInstance';
import { API_ENDPOINTS } from './api/endpoints';

function unwrap(data: unknown): unknown {
  if (typeof data === 'object' && data !== null && !Array.isArray(data) && 'data' in data) {
    return data.data;
  }
  return data;
}

export const weatherService = {
  async current(location: string): Promise<unknown> {
    const { data } = await api.get<unknown>(API_ENDPOINTS.weather.current, { params: { location } });
    return unwrap(data);
  },

  async forecast(location: string): Promise<unknown> {
    const { data } = await api.get<unknown>(API_ENDPOINTS.weather.forecast, { params: { location } });
    return unwrap(data);
  },
};