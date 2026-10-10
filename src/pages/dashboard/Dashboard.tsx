import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  MdOutlineAgriculture,
  MdOutlineArrowForward,
  MdOutlineBugReport,
  MdOutlineChatBubbleOutline,
  MdOutlineEco,
  MdOutlineLocationOn,
  MdOutlineNotificationsNone,
  MdOutlineDescription,
  MdOutlineWbSunny,
} from 'react-icons/md';
import { Link } from 'react-router-dom';
import { Alert, Badge, Card, CardBody, CardHeader, SkeletonCard } from '@/components/ui';
import { farmService } from '@/services/farm.service';
import { reportsService } from '@/services/reports.service';
import { ROUTES } from '@/constants';
import type { Farm, ReportListItem } from '@/types';

const REPORT_TYPE_LABELS: Record<ReportListItem['reportType'], string> = {
  crop_health: 'Crop health report',
  weather_summary: 'Weather summary',
  soil_analysis: 'Soil analysis report',
  yield_forecast: 'Yield forecast',
};

const quickActions = [
  { label: 'Scan for disease', description: 'Upload a crop image', path: ROUTES.dashboard.diseaseDetection, icon: MdOutlineBugReport },
  { label: 'Recommend a crop', description: 'Use your field details', path: ROUTES.dashboard.cropRecommendation, icon: MdOutlineEco },
  { label: 'Check weather', description: 'View local conditions', path: ROUTES.dashboard.weather, icon: MdOutlineWbSunny },
  { label: 'Ask AI Assistant', description: 'Get growing guidance', path: ROUTES.dashboard.aiChat, icon: MdOutlineChatBubbleOutline },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Dashboard overview — farm health summary, rendered inside DashboardLayout. */
export function Dashboard() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [farmList, reportList] = await Promise.all([farmService.list(), reportsService.list()]);
      setFarms(farmList);
      setReports(
        [...reportList]
          .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
          .slice(0, 5),
      );
    } catch {
      setLoadError('Could not load your dashboard right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const farmSummary = useMemo(() => {
    const acreage = farms.reduce((total, farm) => total + (farm.farm_size ?? 0), 0);
    const locations = new Set(farms.map((farm) => farm.location.trim()).filter(Boolean)).size;
    return { acreage, locations };
  }, [farms]);

  return (
    <div className="container-app max-w-7xl py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary-600">Farm overview</p>
          <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">Good to see you</h1>
          <p className="mt-2 text-foreground-muted">A snapshot of your farms, reports, and next steps.</p>
        </div>
        <Link to={ROUTES.dashboard.farmManagement} className="text-sm font-semibold text-primary-600 hover:text-primary-700">
          Manage farms <span aria-hidden="true">-&gt;</span>
        </Link>
      </div>

      {loadError && (
        <Alert variant="error" className="mt-6" onClose={() => setLoadError(null)}>
          <div className="flex flex-wrap items-center gap-3">
            <span>{loadError}</span>
            <button type="button" onClick={() => void loadDashboard()} className="font-semibold underline underline-offset-2">
              Try again
            </button>
          </div>
        </Alert>
      )}

      {loadError && !isLoading ? (
        <Card className="mt-8">
          <CardBody className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-foreground-muted">Dashboard totals are unavailable until the server responds.</p>
            <button type="button" onClick={() => void loadDashboard()} className="text-sm font-semibold text-primary-600 underline underline-offset-2">
              Try again
            </button>
          </CardBody>
        </Card>
      ) : isLoading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Farms registered" value={String(farms.length)} icon={<MdOutlineAgriculture />} />
          <SummaryCard label="Total acreage" value={farmSummary.acreage ? `${farmSummary.acreage} ac` : 'Not set'} icon={<MdOutlineEco />} />
          <SummaryCard label="Locations" value={String(farmSummary.locations)} icon={<MdOutlineLocationOn />} />
          <SummaryCard label="Reports generated" value={String(reports.length)} icon={<MdOutlineDescription />} />
        </div>
      )}

      {!isLoading && farms.length === 0 && (
        <Card className="mt-6 border-dashed">
          <CardBody className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-base font-semibold">Add your first farm</h2>
              <p className="mt-1 text-sm text-foreground-muted">Farm details help AgriSense tailor recommendations and reports.</p>
            </div>
            <Link to={ROUTES.dashboard.farmManagement} className="inline-flex h-10 items-center gap-2 rounded-md bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700 focus-ring">
              Add farm <MdOutlineArrowForward aria-hidden="true" />
            </Link>
          </CardBody>
        </Card>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <h2 className="font-display text-base font-semibold">Crop and farm health</h2>
              <p className="mt-0.5 text-sm text-foreground-muted">Health insights from your latest scans.</p>
            </div>
            <Badge variant="secondary">Awaiting data</Badge>
          </CardHeader>
          <CardBody>
            <div className="rounded-lg border border-dashed border-border p-5 text-center">
              <MdOutlineEco className="mx-auto h-8 w-8 text-foreground-muted" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-foreground">No crop health data yet</p>
              <p className="mt-1 text-sm text-foreground-muted">Run a disease scan to start tracking crop health here.</p>
              <Link to={ROUTES.dashboard.diseaseDetection} className="mt-4 inline-flex text-sm font-semibold text-primary-600 hover:text-primary-700">
                Start a scan <span className="ml-1" aria-hidden="true">-&gt;</span>
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2 className="font-display text-base font-semibold">Weather summary</h2>
              <p className="mt-0.5 text-sm text-foreground-muted">Conditions for your selected farms.</p>
            </div>
            <MdOutlineWbSunny className="h-5 w-5 text-sky-600" aria-hidden="true" />
          </CardHeader>
          <CardBody>
            <div className="rounded-lg border border-dashed border-border p-5 text-center">
              <p className="text-sm font-medium text-foreground">Weather data is not connected</p>
              <p className="mt-1 text-sm text-foreground-muted">Open Weather to check conditions and forecasts when available.</p>
              <Link to={ROUTES.dashboard.weather} className="mt-4 inline-flex text-sm font-semibold text-primary-600 hover:text-primary-700">
                Open weather <span className="ml-1" aria-hidden="true">-&gt;</span>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <h2 className="font-display text-base font-semibold">Important alerts</h2>
              <p className="mt-0.5 text-sm text-foreground-muted">Issues that need your attention.</p>
            </div>
            <MdOutlineNotificationsNone className="h-5 w-5 text-foreground-muted" aria-hidden="true" />
          </CardHeader>
          <CardBody>
            <p className="py-4 text-sm text-foreground-muted">No alerts to show. Alerts will appear after weather and crop-health data is available.</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2 className="font-display text-base font-semibold">Recent activity</h2>
              <p className="mt-0.5 text-sm text-foreground-muted">Your latest generated reports.</p>
            </div>
            <Link to={ROUTES.dashboard.reports} className="text-sm font-semibold text-primary-600 hover:text-primary-700">View all</Link>
          </CardHeader>
          <CardBody>
            {reports.length === 0 ? (
              <p className="py-4 text-sm text-foreground-muted">No activity yet. Generated reports will appear here.</p>
            ) : (
              <div className="divide-y divide-border">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{REPORT_TYPE_LABELS[report.reportType]}</p>
                      <p className="mt-0.5 truncate text-xs text-foreground-muted">{report.farmName ?? 'All farms'}</p>
                      {report.isLocal && <p className="mt-0.5 text-xs text-foreground-muted">Saved on this device</p>}
                    </div>
                    <span className="shrink-0 text-xs text-foreground-muted">{formatDate(report.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <section className="mt-8" aria-labelledby="quick-actions-title">
        <h2 id="quick-actions-title" className="font-display text-lg font-semibold">Quick actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(({ label, description, path, icon: Icon }) => (
            <Link key={path} to={path} className="group flex items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50 focus-ring">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-100 text-primary-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">{label}</span>
                <span className="mt-0.5 block truncate text-xs text-foreground-muted">{description}</span>
              </span>
              <MdOutlineArrowForward className="ml-auto h-4 w-4 shrink-0 text-foreground-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground-muted">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-100 text-primary-700" aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className="mt-4 font-display text-2xl font-semibold text-foreground">{value}</p>
    </Card>
  );
}
