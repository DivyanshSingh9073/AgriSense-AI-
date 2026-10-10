import { useState, type FormEvent } from 'react';
import { MdOutlineRefresh, MdOutlineWbSunny } from 'react-icons/md';
import { Alert, Button, Card, CardBody, CardHeader, Input } from '@/components/ui';
import { weatherService } from '@/services/weather.service';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrap(value: unknown, key: string): unknown {
  return isRecord(value) && key in value ? value[key] : value;
}

function readText(value: unknown, keys: string[]): string | null {
  if (!isRecord(value)) return null;
  const found = keys.map((key) => value[key]).find((item) => typeof item === 'string' || typeof item === 'number');
  return found == null ? null : String(found);
}

function formatKey(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^./, (letter) => letter.toUpperCase());
}

/** Hyperlocal weather forecast and alerts for the farm's location. */
export function Weather() {
  const [location, setLocation] = useState('');
  const [queriedLocation, setQueriedLocation] = useState('');
  const [current, setCurrent] = useState<unknown>(null);
  const [forecast, setForecast] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = location.trim();
    if (!query) {
      setError('Enter a town, city, or region to check the weather.');
      return;
    }
    setError(null);
    setCurrent(null);
    setForecast(null);
    setQueriedLocation(query);
    setIsLoading(true);
    try {
      const [currentConditions, forecastData] = await Promise.all([
        weatherService.current(query),
        weatherService.forecast(query),
      ]);
      setCurrent(unwrap(currentConditions, 'current'));
      setForecast(unwrap(forecastData, 'forecast'));
    } catch (requestError) {
      const message = isRecord(requestError) && typeof requestError.message === 'string' ? requestError.message : 'Could not load weather. Check the backend connection and try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const currentRecord = isRecord(current) ? current : null;
  const currentFields = currentRecord ? Object.entries(currentRecord).filter(([, value]) => value != null && typeof value !== 'object') : [];
  const forecastItems = Array.isArray(forecast)
    ? forecast
    : isRecord(forecast) && Array.isArray(forecast.forecast)
      ? forecast.forecast
      : [];
  const temperature = readText(current, ['temperature', 'temperature_c', 'temp_c', 'temp']);
  const condition = readText(current, ['condition', 'description', 'weather']);

  return (
    <div className="container-app max-w-5xl py-6 sm:py-8">
      <div>
        <p className="text-sm font-medium text-primary-600">Conditions</p>
        <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">Weather</h1>
        <p className="mt-2 text-foreground-muted">Check current conditions and forecast for a farm location.</p>
      </div>

      {error && <Alert variant="error" className="mt-5" onClose={() => setError(null)}>{error}</Alert>}

      <Card className="mt-6">
        <CardBody>
          <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                label="Location"
                placeholder="City, region, or postal code"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                autoComplete="address-level2"
                required
              />
            </div>
            <Button type="submit" leftIcon={<MdOutlineRefresh />} isLoading={isLoading} loadingText="Loading weather…">
              Check weather
            </Button>
          </form>
        </CardBody>
      </Card>

      {isLoading && <Card className="mt-6"><CardBody className="py-10 text-center text-sm text-foreground-muted" role="status">Loading conditions for {queriedLocation}…</CardBody></Card>}

      {!isLoading && current != null && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Card>
            <CardHeader>
              <div>
                <h2 className="font-display text-base font-semibold">Current conditions</h2>
                <p className="mt-0.5 text-sm text-foreground-muted">{readText(current, ['location', 'city', 'name']) ?? queriedLocation}</p>
              </div>
              <MdOutlineWbSunny className="h-5 w-5 text-amber-500" aria-hidden="true" />
            </CardHeader>
            <CardBody>
              {temperature || condition ? (
                <>
                  <p className="font-display text-3xl font-semibold text-foreground">{temperature ?? '—'}{temperature && !/[°]/.test(temperature) ? '°' : ''}</p>
                  {condition && <p className="mt-1 text-sm text-foreground-muted">{condition}</p>}
                </>
              ) : <p className="text-sm text-foreground-muted">The weather response did not include a recognized condition summary.</p>}
              {currentFields.length > 0 && (
                <dl className="mt-5 grid grid-cols-2 gap-3">
                  {currentFields.map(([key, value]) => (
                    <div key={key} className="rounded-lg bg-surface-muted p-3">
                      <dt className="text-xs text-foreground-muted">{formatKey(key)}</dt>
                      <dd className="mt-1 break-words text-sm font-medium text-foreground">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <h2 className="font-display text-base font-semibold">Forecast</h2>
                <p className="mt-0.5 text-sm text-foreground-muted">{queriedLocation}</p>
              </div>
            </CardHeader>
            <CardBody>
              {forecastItems.length === 0 ? (
                <p className="text-sm text-foreground-muted">No forecast entries were returned.</p>
              ) : (
                <div className="divide-y divide-border">
                  {forecastItems.map((item, index) => {
                    const label = readText(item, ['date', 'datetime', 'day', 'time']) ?? `Forecast ${index + 1}`;
                    const summary = readText(item, ['condition', 'description', 'weather']);
                    const high = readText(item, ['high', 'max_temp', 'temperature_max', 'temp_max']);
                    const low = readText(item, ['low', 'min_temp', 'temperature_min', 'temp_min']);
                    return (
                      <div key={`${label}-${index}`} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{label}</p>
                          {summary && <p className="mt-0.5 text-xs text-foreground-muted">{summary}</p>}
                        </div>
                        <p className="text-sm font-semibold text-foreground">{high ?? '—'}{low ? ` / ${low}` : ''}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {!isLoading && current == null && !error && (
        <Card className="mt-6"><CardBody className="py-10 text-center text-sm text-foreground-muted">Enter a location to request current weather and a forecast.</CardBody></Card>
      )}
    </div>
  );
}
