/**
 * Frontend farm request and response shapes. The current service expects
 * snake_case fields and direct resources; confirm these against the backend.
 */
export interface Farm {
  id: number;
  user_id: number;
  farm_name: string;
  location: string;
  soil_type?: string | null;
  farm_size?: number | null;
  water_source?: string | null;
}

export interface FarmInput {
  farm_name: string;
  location: string;
  soil_type?: string;
  farm_size?: number;
  water_source?: string;
}
