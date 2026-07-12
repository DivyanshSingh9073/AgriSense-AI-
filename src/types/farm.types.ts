/**
 * Shapes exchanged with the FastAPI `/farms` endpoints. Field names are
 * snake_case to match the backend's `FarmResponse` schema exactly (unlike
 * the `/auth` routes, farm routes return the resource directly — no
 * `ApiResponse<T>` envelope).
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
