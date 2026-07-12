import { api } from './api/axiosInstance';
import { API_ENDPOINTS } from './api/endpoints';
import type { Farm, FarmInput } from '@/types';

/**
 * Farm routes (`/farms`) return the resource directly — no `ApiResponse<T>`
 * envelope like the auth routes use.
 */

const DEMO_STORAGE_KEY = 'agrisense.demoFarms';

function readDemoFarms(): Farm[] {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Farm[];
  } catch {
    // fall through to seed data
  }
  const seeded: Farm[] = [
    {
      id: -1,
      user_id: -1,
      farm_name: 'North Field',
      location: 'Meerut, Uttar Pradesh',
      soil_type: 'Loamy',
      farm_size: 4.5,
      water_source: 'Canal irrigation',
    },
    {
      id: -2,
      user_id: -1,
      farm_name: 'Riverside Plot',
      location: 'Karnal, Haryana',
      soil_type: 'Clay',
      farm_size: 2.2,
      water_source: 'Borewell',
    },
  ];
  writeDemoFarms(seeded);
  return seeded;
}

function writeDemoFarms(farms: Farm[]): void {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(farms));
}

/** True once a live backend call has failed, so subsequent calls this session skip straight to demo mode. */
let demoMode = false;

export const farmService = {
  /** Whether the last request fell back to local demo data instead of the live API. */
  isDemoMode(): boolean {
    return demoMode;
  },

  async list(): Promise<Farm[]> {
    if (demoMode) return readDemoFarms();
    try {
      const { data } = await api.get<Farm[]>(API_ENDPOINTS.farms.list);
      return data;
    } catch {
      demoMode = true;
      return readDemoFarms();
    }
  },

  async create(input: FarmInput): Promise<Farm> {
    if (demoMode) {
      const farms = readDemoFarms();
      const created: Farm = { id: -(farms.length + 1), user_id: -1, ...input };
      writeDemoFarms([created, ...farms]);
      return created;
    }
    try {
      const { data } = await api.post<Farm>(API_ENDPOINTS.farms.create, input);
      return data;
    } catch {
      demoMode = true;
      return this.create(input);
    }
  },

  async update(farmId: number, input: FarmInput): Promise<Farm> {
    if (demoMode || farmId < 0) {
      const farms = readDemoFarms();
      const updated = farms.map((farm) => (farm.id === farmId ? { ...farm, ...input } : farm));
      writeDemoFarms(updated);
      return updated.find((farm) => farm.id === farmId)!;
    }
    try {
      const { data } = await api.put<Farm>(API_ENDPOINTS.farms.detail(farmId), input);
      return data;
    } catch {
      demoMode = true;
      return this.update(farmId, input);
    }
  },

  async remove(farmId: number): Promise<void> {
    if (demoMode || farmId < 0) {
      const farms = readDemoFarms().filter((farm) => farm.id !== farmId);
      writeDemoFarms(farms);
      return;
    }
    try {
      await api.delete(API_ENDPOINTS.farms.detail(farmId));
    } catch {
      demoMode = true;
      const farms = readDemoFarms().filter((farm) => farm.id !== farmId);
      writeDemoFarms(farms);
    }
  },
};
