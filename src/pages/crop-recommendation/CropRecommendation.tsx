import { useState, type FormEvent } from 'react';
import { MdOutlineAutoAwesome, MdOutlineEco } from 'react-icons/md';
import { Alert, Button, Card, CardBody, CardHeader, Input } from '@/components/ui';
import { cropRecommendationService, type CropRecommendationInput } from '@/services/crop-recommendation.service';

const FIELDS: { name: keyof CropRecommendationInput; label: string; min?: number; max?: number; step?: string }[] = [
  { name: 'nitrogen', label: 'Nitrogen (N)', min: 0, step: 'any' },
  { name: 'phosphorus', label: 'Phosphorus (P)', min: 0, step: 'any' },
  { name: 'potassium', label: 'Potassium (K)', min: 0, step: 'any' },
  { name: 'temperature', label: 'Temperature (°C)', step: 'any' },
  { name: 'humidity', label: 'Humidity (%)', min: 0, max: 100, step: 'any' },
  { name: 'ph', label: 'Soil pH', min: 0, max: 14, step: 'any' },
  { name: 'rainfall', label: 'Rainfall (mm)', min: 0, step: 'any' },
];

type FormValues = Record<keyof CropRecommendationInput, string>;
const EMPTY_VALUES: FormValues = {
  nitrogen: '', phosphorus: '', potassium: '', temperature: '', humidity: '', ph: '', rainfall: '',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fieldLabel(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^./, (letter) => letter.toUpperCase());
}

function flattenResult(value: unknown, prefix = ''): [string, string][] {
  if (value == null) return [];
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return [[prefix || 'Result', String(value)]];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flattenResult(item, `${prefix || 'Recommendation'} ${index + 1}`));
  }
  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, nested]) =>
      flattenResult(nested, prefix ? `${prefix} · ${fieldLabel(key)}` : fieldLabel(key)),
    );
  }
  return [];
}

/** Recommends crops based on soil and climate inputs. */
export function CropRecommendation() {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [result, setResult] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);
    const numbers = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, Number(value)]),
    ) as unknown as CropRecommendationInput;
    if (Object.values(values).some((value) => value.trim() === '') || Object.values(numbers).some((value) => !Number.isFinite(value))) {
      setError('Enter a valid value for every field.');
      return;
    }
    if (numbers.humidity < 0 || numbers.humidity > 100 || numbers.ph < 0 || numbers.ph > 14 || numbers.nitrogen < 0 || numbers.phosphorus < 0 || numbers.potassium < 0 || numbers.rainfall < 0) {
      setError('Check the valid ranges: humidity 0–100%, soil pH 0–14, and nutrient/rainfall values cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    try {
      setResult(await cropRecommendationService.recommend(numbers));
    } catch (requestError) {
      const message = isRecord(requestError) && typeof requestError.message === 'string' ? requestError.message : 'Could not get a crop recommendation. Check the backend connection and try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resultFields = flattenResult(result);

  return (
    <div className="container-app max-w-5xl py-6 sm:py-8">
      <div>
        <p className="text-sm font-medium text-primary-600">Planning</p>
        <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">Crop Recommendation</h1>
        <p className="mt-2 max-w-2xl text-foreground-muted">Use soil nutrients and local climate measurements to request a crop recommendation.</p>
      </div>

      {error && <Alert variant="error" className="mt-5" onClose={() => setError(null)}>{error}</Alert>}

      <Card className="mt-6">
        <CardHeader>
          <div>
            <h2 className="font-display text-base font-semibold">Field conditions</h2>
            <p className="mt-0.5 text-sm text-foreground-muted">Enter current soil test and climate values.</p>
          </div>
          <MdOutlineEco className="h-5 w-5 text-primary-600" aria-hidden="true" />
        </CardHeader>
        <CardBody>
          <form onSubmit={(event) => void handleSubmit(event)} noValidate>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FIELDS.map((field) => (
                <Input
                  key={field.name}
                  label={field.label}
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={values[field.name]}
                  onChange={(event) => setValues((previous) => ({ ...previous, [field.name]: event.target.value }))}
                  required
                />
              ))}
            </div>
            <Button className="mt-5" type="submit" leftIcon={<MdOutlineAutoAwesome />} isLoading={isSubmitting} loadingText="Requesting recommendation…">
              Get recommendation
            </Button>
          </form>
        </CardBody>
      </Card>

      <section className="mt-7" aria-live="polite">
        <h2 className="font-display text-lg font-semibold">Recommendation</h2>
        {result == null && !isSubmitting ? (
          <Card className="mt-3"><CardBody className="py-8 text-center text-sm text-foreground-muted">Submit field conditions to see recommendations from the crop service.</CardBody></Card>
        ) : isSubmitting ? (
          <Card className="mt-3"><CardBody className="py-8 text-center text-sm text-foreground-muted">Waiting for the crop recommendation service…</CardBody></Card>
        ) : resultFields.length === 0 ? (
          <Alert variant="warning" className="mt-3">The service responded, but no displayable recommendation was returned.</Alert>
        ) : (
          <Card className="mt-3">
            <CardBody>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                {resultFields.map(([key, value], index) => (
                  <div key={`${key}-${index}`} className="rounded-lg bg-surface-muted p-3">
                    <dt className="text-xs font-medium text-foreground-muted">{fieldLabel(key)}</dt>
                    <dd className="mt-1 break-words text-sm font-semibold text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>
        )}
      </section>
    </div>
  );
}
