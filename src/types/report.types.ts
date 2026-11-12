/** The report types offered in the "Generate report" form. */
export type ReportType = 'crop_health' | 'weather_summary' | 'soil_analysis' | 'yield_forecast';

export interface ReportTypeOption {
  value: ReportType;
  label: string;
  description: string;
}

export const REPORT_TYPE_OPTIONS: ReportTypeOption[] = [
  {
    value: 'crop_health',
    label: 'Crop Health',
    description: 'Disease risk and overall crop condition summary.',
  },
  {
    value: 'weather_summary',
    label: 'Weather Summary',
    description: 'Recent conditions and short-term forecast highlights.',
  },
  {
    value: 'soil_analysis',
    label: 'Soil Analysis',
    description: 'Soil type, moisture, and nutrient outlook.',
  },
  {
    value: 'yield_forecast',
    label: 'Yield Forecast',
    description: 'Projected yield based on current field conditions.',
  },
];

export interface GenerateReportPayload {
  farm_id: number | null;
  report_type: ReportType;
}

export interface ReportFarmProfile {
  id: number;
  name: string;
  location: string;
  farm_size: number | null;
  soil_type: string | null;
  water_source: string | null;
}

export interface ReportContent {
  farm_profiles: ReportFarmProfile[];
  unavailable_data: string[];
  limitations: string[];
}

/** Persisted report shape returned by the Reports API. */
export interface GeneratedReport {
  id: string;
  user_id: string;
  farm_id: number | null;
  farm_name: string | null;
  report_type: ReportType;
  title: string;
  summary: string;
  content: ReportContent;
  created_at: string;
  updated_at: string;
}

/** A report formatted for the Reports and dashboard views. */
export interface ReportListItem {
  id: string;
  farmId: number | null;
  farmName?: string;
  reportType: ReportType;
  summary: string;
  createdAt: string;
  title?: string;
  content?: ReportContent;
  /** Present only for legacy entries retained in this browser. */
  isLocal?: boolean;
}
