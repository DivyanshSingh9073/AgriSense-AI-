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

/** Shape returned by `POST /reports/generate`. */
export interface GeneratedReport {
  user_id: number;
  farm_id: number | null;
  report_type: ReportType;
  summary: string;
}

/** A single historical report entry, as returned by `GET /reports`. */
export interface ReportListItem {
  id: string;
  farmId: number | null;
  farmName?: string;
  reportType: ReportType;
  summary: string;
  createdAt: string;
}
