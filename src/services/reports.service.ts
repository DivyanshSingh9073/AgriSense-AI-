import { api } from './api/axiosInstance';
import { API_ENDPOINTS } from './api/endpoints';
import type { GenerateReportPayload, GeneratedReport, ReportListItem } from '@/types';

const HISTORY_STORAGE_KEY = 'agrisense.reportHistory';

function readHistory(): ReportListItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReportListItem[]) : [];
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
   * `GET /reports` currently returns an empty placeholder list on the live
   * backend. We merge it with reports generated locally in this browser so
   * the page still shows a meaningful history.
   */
  async list(): Promise<ReportListItem[]> {
    let remote: ReportListItem[] = [];
    try {
      const { data } = await api.get<{ reports?: ReportListItem[] }>(API_ENDPOINTS.reports.list);
      remote = Array.isArray(data?.reports) ? data.reports : [];
    } catch {
      remote = [];
    }
    return [...remote, ...readHistory()];
  },

  async generate(payload: GenerateReportPayload, farmName?: string): Promise<ReportListItem> {
    let summary = '';
    try {
      const { data } = await api.post<{ report: GeneratedReport }>(
        API_ENDPOINTS.reports.generate,
        payload,
      );
      summary = data.report.summary;
    } catch {
      summary =
        'Unable to reach the report engine right now, so this is a locally generated placeholder summary. Conditions look generally stable — keep monitoring soil moisture and watch for early disease symptoms.';
    }

    const entry: ReportListItem = {
      id: crypto.randomUUID(),
      farmId: payload.farm_id,
      farmName,
      reportType: payload.report_type,
      summary,
      createdAt: new Date().toISOString(),
    };
    saveToHistory(entry);
    return entry;
  },
};
