import { api } from './api/axiosInstance';
import { API_ENDPOINTS } from './api/endpoints';
import type { GenerateReportPayload, GeneratedReport, ReportListItem } from '@/types';

const HISTORY_STORAGE_KEY = 'agrisense.reportHistory';

function formatReport(report: GeneratedReport): ReportListItem {
  return {
    id: report.id,
    farmId: report.farm_id,
    farmName: report.farm_name ?? undefined,
    reportType: report.report_type,
    summary: report.summary,
    createdAt: report.created_at,
    title: report.title,
    content: report.content,
  };
}

function readHistory(): ReportListItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const entries = JSON.parse(raw) as ReportListItem[];
    return entries
      .filter((entry) => !entry.summary.includes('locally generated placeholder summary'))
      .map((entry) => ({ ...entry, isLocal: true }));
  } catch {
    return [];
  }
}

export const reportsService = {
  listLocalHistory(): ReportListItem[] {
    return readHistory();
  },

  /**
   * Merge persisted reports with legacy reports retained in this browser.
   */
  async list(): Promise<ReportListItem[]> {
    const { data } = await api.get<{ reports: GeneratedReport[] }>(API_ENDPOINTS.reports.list);
    const remote = data.reports.map(formatReport);
    return [...remote, ...readHistory()];
  },

  async generate(payload: GenerateReportPayload): Promise<ReportListItem> {
    const { data } = await api.post<{ report: GeneratedReport }>(
      API_ENDPOINTS.reports.generate,
      payload,
    );
    return formatReport(data.report);
  },
};
