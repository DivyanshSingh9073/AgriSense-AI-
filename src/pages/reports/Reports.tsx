import { useEffect, useMemo, useState } from 'react';
import {
  MdOutlineDescription,
  MdOutlineDownload,
  MdOutlineAutoAwesome,
  MdOutlineAgriculture,
} from 'react-icons/md';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  SkeletonCard,
} from '@/components/ui';
import { cn } from '@/utils';
import { farmService } from '@/services/farm.service';
import { reportsService } from '@/services/reports.service';
import { REPORT_TYPE_OPTIONS } from '@/types';
import type { Farm, ReportListItem, ReportType } from '@/types';

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  crop_health: 'Crop Health',
  weather_summary: 'Weather Summary',
  soil_analysis: 'Soil Analysis',
  yield_forecast: 'Yield Forecast',
};

function downloadReport(report: ReportListItem) {
  const lines = [
    `AgriSense AI — ${report.title ?? `${REPORT_TYPE_LABELS[report.reportType]} Report`}`,
    `Generated: ${new Date(report.createdAt).toLocaleString()}`,
    report.farmName ? `Farm: ${report.farmName}` : 'Farm: All farms',
    '',
    report.summary,
  ];
  if (report.content) {
    lines.push('', 'Recorded farm profiles:');
    for (const farm of report.content.farm_profiles) {
      const details = [
        `Location: ${farm.location}`,
        farm.farm_size !== null ? `Size: ${farm.farm_size} acres` : null,
        farm.soil_type ? `Recorded soil type: ${farm.soil_type}` : null,
        farm.water_source ? `Recorded water source: ${farm.water_source}` : null,
      ].filter((detail): detail is string => detail !== null);
      lines.push(`- ${farm.name} (${details.join('; ')})`);
    }
    if (report.content.unavailable_data.length > 0) {
      lines.push('', 'Data not available:', ...report.content.unavailable_data.map((item) => `- ${item}`));
    }
    if (report.content.limitations.length > 0) {
      lines.push('', 'Limitations:', ...report.content.limitations.map((item) => `- ${item}`));
    }
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `agrisense-${report.reportType}-${report.id.slice(0, 8)}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Exportable field and yield reports. */
export function Reports() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [history, setHistory] = useState<ReportListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedFarmId, setSelectedFarmId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<ReportType>('crop_health');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [farmList, reportList] = await Promise.all([farmService.list(), reportsService.list()]);
        setFarms(farmList);
        setHistory(
          [...reportList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        );
      } catch {
        setLoadError('Could not load your reports right now. Please try again.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const selectedFarm = useMemo(
    () => farms.find((farm) => String(farm.id) === selectedFarmId),
    [farms, selectedFarmId],
  );

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const entry = await reportsService.generate(
        {
          farm_id: selectedFarm ? selectedFarm.id : null,
          report_type: selectedType,
        },
      );
      setHistory((prev) => [entry, ...prev.filter((report) => report.id !== entry.id)]);
    } catch {
      setGenerationError('Could not generate a report. Check the backend connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container-app max-w-4xl py-8">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Reports</h1>
        <p className="mt-2 text-foreground-muted">Generate and export field reports.</p>
      </div>

      {loadError && (
        <Alert variant="error" className="mt-6" onClose={() => setLoadError(null)}>
          {loadError}
        </Alert>
      )}

      {generationError && (
        <Alert variant="error" className="mt-6" onClose={() => setGenerationError(null)}>
          {generationError}
        </Alert>
      )}

      {/* Generate a new report */}
      <Card className="mt-6">
        <CardHeader>
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">Generate a report</h2>
            <p className="mt-0.5 text-sm text-foreground-muted">
              Pick a farm and a report type, then generate an instant summary.
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
              Farm
              <div className="relative flex items-center">
                <MdOutlineAgriculture className="pointer-events-none absolute left-3 h-4 w-4 text-foreground-muted" />
                <select
                  value={selectedFarmId}
                  onChange={(e) => setSelectedFarmId(e.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-border bg-surface pl-9 pr-3.5 text-sm text-foreground transition-colors focus-ring"
                >
                  <option value="all">All farms</option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={String(farm.id)}>
                      {farm.farm_name}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-foreground">Report type</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {REPORT_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedType(option.value)}
                  aria-pressed={selectedType === option.value}
                  className={cn(
                    'rounded-xl border p-4 text-left transition-colors focus-ring',
                    selectedType === option.value
                      ? 'border-primary-600 bg-primary-100 dark:bg-primary-800/40'
                      : 'border-border hover:bg-surface-muted',
                  )}
                >
                  <p className="text-sm font-semibold text-foreground">{option.label}</p>
                  <p className="mt-0.5 text-xs text-foreground-muted">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <Button
            className="mt-5"
            leftIcon={<MdOutlineAutoAwesome />}
            isLoading={isGenerating}
            loadingText="Generating…"
            onClick={handleGenerate}
          >
            Generate report
          </Button>
        </CardBody>
      </Card>

      {/* History */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold">Report history</h2>

        <div className="mt-4 space-y-4">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : history.length === 0 ? (
            <Card>
              <CardBody className="flex flex-col items-center gap-2 py-10 text-center">
                <MdOutlineDescription className="h-8 w-8 text-foreground-muted" aria-hidden="true" />
                <p className="text-sm text-foreground-muted">
                  No reports yet — generate your first one above.
                </p>
              </CardBody>
            </Card>
          ) : (
            history.map((report) => (
              <Card key={report.id}>
                <CardBody>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="primary">{REPORT_TYPE_LABELS[report.reportType]}</Badge>
                        {report.isLocal && <Badge variant="neutral">Saved on this device</Badge>}
                        <span className="text-xs text-foreground-muted">
                          {new Date(report.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {report.title ?? report.farmName ?? 'All farms'}
                      </p>
                      {report.title && (
                        <p className="mt-0.5 text-xs text-foreground-muted">
                          {report.farmName ?? 'All farms'}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<MdOutlineDownload />}
                      onClick={() => downloadReport(report)}
                    >
                      Export
                    </Button>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-foreground-muted">{report.summary}</p>
                  {report.content && (
                    <div className="mt-4 space-y-3 border-t border-border pt-3 text-sm">
                      {report.content.farm_profiles.length > 0 && (
                        <div>
                          <h3 className="font-medium text-foreground">Recorded farm profiles</h3>
                          <ul className="mt-1 space-y-1 text-foreground-muted">
                            {report.content.farm_profiles.map((farm) => (
                              <li key={farm.id}>
                                <span className="font-medium text-foreground">{farm.name}</span>
                                {' — '}{farm.location}
                                {farm.farm_size !== null && `; ${farm.farm_size} acres recorded`}
                                {farm.soil_type && `; soil type: ${farm.soil_type}`}
                                {farm.water_source && `; water source: ${farm.water_source}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {report.content.unavailable_data.length > 0 && (
                        <div>
                          <h3 className="font-medium text-foreground">Data not available for assessment</h3>
                          <ul className="mt-1 list-inside list-disc text-foreground-muted">
                            {report.content.unavailable_data.map((item) => <li key={item}>{item}</li>)}
                          </ul>
                        </div>
                      )}
                      {report.content.limitations.length > 0 && (
                        <div>
                          <h3 className="font-medium text-foreground">Report limitations</h3>
                          <ul className="mt-1 list-inside list-disc text-foreground-muted">
                            {report.content.limitations.map((item) => <li key={item}>{item}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
