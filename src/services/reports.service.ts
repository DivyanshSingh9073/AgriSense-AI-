import { api } from './api/axiosInstance';
import { API_ENDPOINTS } from './api/endpoints';
import type { GenerateReportPayload, GeneratedReport, ReportListItem } from '@/types';

const HISTORY_STORAGE_KEY = 'agrisense.reportHistory';

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

function writeHistory(items: ReportListItem[]): void {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
}

function saveToHistory(entry: ReportListItem): void {
  const history = readHistory();
  writeHistory([entry, ...history].slice(0, 50));
}

export const reportsService = {
  /**
  * Merge server reports with successful reports cached in this browser.
   */
  async list(): Promise<ReportListItem[]> {
    const { data } = await api.get<{ reports?: ReportListItem[] }>(API_ENDPOINTS.reports.list);
    const remote = Array.isArray(data?.reports) ? data.reports : [];
    return [...remote, ...readHistory()];
  },

  async generate(payload: GenerateReportPayload, farmName?: string): Promise<ReportListItem> {
    const { data } = await api.post<{ report: GeneratedReport }>(
      API_ENDPOINTS.reports.generate,
      payload,
    );
    const summary = data.report.summary;

    const entry: ReportListItem = {
      id: crypto.randomUUID(),
      farmId: payload.farm_id,
      farmName,
      reportType: payload.report_type,
      summary,
      createdAt: new Date().toISOString(),
      isLocal: true,
    };
    saveToHistory(entry);
    return entry;
  },
};
