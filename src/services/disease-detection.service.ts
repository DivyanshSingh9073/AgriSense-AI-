/* eslint-disable no-undef */
import { api } from './api/axiosInstance';
import { API_ENDPOINTS } from './api/endpoints';
import type { DiseaseDetectionResult } from '@/types';

function isObject(value: unknown): value is DiseaseDetectionResult {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Sends a crop image to the existing disease detection endpoint. */
export const diseaseDetectionService = {
  async analyze(image: File): Promise<DiseaseDetectionResult> {
    const formData = new FormData();
    formData.append('image', image);

    const { data } = await api.post<unknown>(API_ENDPOINTS.diseaseDetection.analyze, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!isObject(data)) return {};
    if (isObject(data.data)) return data.data;
    if (isObject(data.result)) return data.result;
    return data;
  },
};