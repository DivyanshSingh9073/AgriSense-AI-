/* eslint-disable no-undef */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  MdOutlineBugReport,
  MdOutlineCloudUpload,
  MdOutlineDeleteOutline,
  MdOutlineRefresh,
  MdOutlineShield,
} from 'react-icons/md';
import { Alert, Button, Card, CardBody, CardHeader } from '@/components/ui';
import { diseaseDetectionService } from '@/services/disease-detection.service';
import type { DiseaseDetectionResult } from '@/types';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function valueFor(result: DiseaseDetectionResult, keys: string[]): unknown {
  return keys.map((key) => result[key]).find((value) => value !== undefined && value !== null && value !== '');
}

function textValue(value: unknown): string | null {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return null;
}

function listValue(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  const text = textValue(value);
  return text ? [text] : [];
}

function prettyKey(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^./, (letter) => letter.toUpperCase());
}

/** Upload crop imagery and view AI disease detection results. */
export function DiseaseDetection() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<DiseaseDetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const chooseImage = (file?: File) => {
    setError(null);
    setResult(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be smaller than 10 MB.');
      return;
    }
    setImage(file);
  };

  const handleAnalyze = async () => {
    if (!image) {
      setError('Choose a crop image before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      setResult(await diseaseDetectionService.analyze(image));
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Could not analyze this image right now.';
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const disease = result && textValue(valueFor(result, ['disease', 'disease_name', 'diagnosis', 'label', 'prediction']));
  const confidence = result && textValue(valueFor(result, ['confidence', 'confidence_score']));
  const recommendations = result ? listValue(valueFor(result, ['recommendations', 'recommendation', 'treatment'])) : [];
  const prevention = result ? listValue(valueFor(result, ['prevention', 'prevention_tips', 'preventive_measures'])) : [];
  const hasResultData = result && Object.keys(result).length > 0;

  return (
    <div className="container-app max-w-6xl py-8">
      <div>
        <p className="text-sm font-medium text-primary-600">Crop health</p>
        <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">Disease Detection</h1>
        <p className="mt-2 max-w-2xl text-foreground-muted">Upload a clear crop image to check for visible signs of disease.</p>
      </div>

      {error && <Alert variant="error" className="mt-6" onClose={() => setError(null)}>{error}</Alert>}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <div>
              <h2 className="font-display text-base font-semibold">Upload an image</h2>
              <p className="mt-0.5 text-sm text-foreground-muted">JPG, PNG, or WEBP up to 10 MB.</p>
            </div>
            <MdOutlineBugReport className="h-5 w-5 text-primary-600" aria-hidden="true" />
          </CardHeader>
          <CardBody>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => chooseImage(event.target.files?.[0])}
            />

            {previewUrl ? (
              <div className="overflow-hidden rounded-xl border border-border">
                <img src={previewUrl} alt="Selected crop" className="aspect-[4/3] w-full object-cover" />
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-3">
                  <p className="min-w-0 truncate text-sm text-foreground-muted">{image?.name}</p>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" leftIcon={<MdOutlineRefresh />} onClick={() => inputRef.current?.click()}>
                      Change
                    </Button>
                    <Button type="button" variant="ghost" size="sm" leftIcon={<MdOutlineDeleteOutline />} onClick={() => { setImage(null); setResult(null); }}>
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex min-h-64 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 text-center transition-colors hover:border-primary-400 hover:bg-primary-50 focus-ring"
              >
                <MdOutlineCloudUpload className="h-10 w-10 text-primary-600" aria-hidden="true" />
                <span className="mt-3 text-sm font-semibold text-foreground">Choose a crop image</span>
                <span className="mt-1 text-sm text-foreground-muted">A clear, well-lit leaf or plant photo works best.</span>
              </button>
            )}

            <Button
              type="button"
              fullWidth
              className="mt-5"
              disabled={!image}
              isLoading={isAnalyzing}
              loadingText="Analyzing image..."
              onClick={() => void handleAnalyze()}
              leftIcon={<MdOutlineBugReport />}
            >
              Analyze image
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2 className="font-display text-base font-semibold">Analysis result</h2>
              <p className="mt-0.5 text-sm text-foreground-muted">Your result and next steps will appear here.</p>
            </div>
          </CardHeader>
          <CardBody>
            {!result && !isAnalyzing && (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 text-center">
                <MdOutlineBugReport className="h-8 w-8 text-foreground-muted" aria-hidden="true" />
                <p className="mt-2 text-sm font-medium text-foreground">No analysis yet</p>
                <p className="mt-1 text-sm text-foreground-muted">Upload an image and select Analyze image to begin.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-xl bg-surface-muted px-6 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-foreground">Reviewing your crop image...</p>
              </div>
            )}

            {result && !hasResultData && (
              <Alert variant="info" title="No result data returned">
                The analysis service responded, but did not include a result that can be displayed yet.
              </Alert>
            )}

            {result && hasResultData && (
              <div className="space-y-5">
                <div className="rounded-xl bg-primary-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Detection</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">{disease ?? 'Result received'}</p>
                  {confidence && <p className="mt-1 text-sm text-foreground-muted">Confidence: {confidence}</p>}
                </div>

                {recommendations.length > 0 && <AdviceList title="Recommendations" items={recommendations} />}
                {prevention.length > 0 && <AdviceList title="Prevention" items={prevention} icon={<MdOutlineShield />} />}

                {!disease && recommendations.length === 0 && prevention.length === 0 && (
                  <div className="rounded-xl border border-border p-4">
                    <p className="text-sm font-medium text-foreground">Response from analysis service</p>
                    <dl className="mt-3 space-y-2 text-sm">
                      {Object.entries(result).map(([key, value]) => (
                        <div key={key} className="flex flex-col gap-0.5 border-b border-border pb-2 last:border-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-4">
                          <dt className="font-medium text-foreground-muted">{prettyKey(key)}</dt>
                          <dd className="break-words text-foreground">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <p className="mt-5 text-xs text-foreground-muted">AI analysis is a decision-support tool. Confirm treatment decisions with a qualified crop specialist.</p>
    </div>
  );
}

function AdviceList({ title, items, icon }: { title: string; items: string[]; icon?: ReactNode }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        {title}
      </h3>
      <ul className="mt-2 space-y-2 text-sm text-foreground-muted">
        {items.map((item, index) => <li key={`${item}-${index}`} className="rounded-lg bg-surface-muted px-3 py-2">{item}</li>)}
      </ul>
    </div>
  );
}
