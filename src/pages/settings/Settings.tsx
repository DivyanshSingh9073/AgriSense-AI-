import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdOutlineLightMode,
  MdOutlineDarkMode,
  MdOutlineSettingsBrightness,
  MdOutlineStraighten,
  MdOutlineLogout,
  MdOutlineDeleteForever,
} from 'react-icons/md';
import { Alert, Badge, Button, Card, CardBody, CardFooter, CardHeader } from '@/components/ui';
import { cn } from '@/utils';
import { useAuth, useTheme } from '@/hooks';
import { ROUTES } from '@/constants';
import type { Theme } from '@/types';

const PREFS_STORAGE_KEY = 'agrisense.notificationPrefs';
const UNITS_STORAGE_KEY = 'agrisense.units';

interface NotificationPrefs {
  weatherAlerts: boolean;
  diseaseAlerts: boolean;
  weeklyDigest: boolean;
}

const defaultPrefs: NotificationPrefs = {
  weatherAlerts: true,
  diseaseAlerts: true,
  weeklyDigest: false,
};

function readPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    return raw ? { ...defaultPrefs, ...(JSON.parse(raw) as Partial<NotificationPrefs>) } : defaultPrefs;
  } catch {
    return defaultPrefs;
  }
}

type Units = 'metric' | 'imperial';

function readUnits(): Units {
  const stored = localStorage.getItem(UNITS_STORAGE_KEY);
  return stored === 'imperial' ? 'imperial' : 'metric';
}

/** A single labeled on/off switch, built from a plain accessible button. */
function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="mt-0.5 text-xs text-foreground-muted">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border transition-colors focus-ring',
          checked ? 'border-primary-600 bg-primary-600' : 'border-border bg-surface-muted',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
}

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof MdOutlineLightMode }[] = [
  { value: 'light', label: 'Light', icon: MdOutlineLightMode },
  { value: 'dark', label: 'Dark', icon: MdOutlineDarkMode },
  { value: 'system', label: 'System', icon: MdOutlineSettingsBrightness },
];

/** App preferences: theme, notifications, account settings. */
export function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState<NotificationPrefs>(readPrefs);
  const [units, setUnits] = useState<Units>(readUnits);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    localStorage.setItem(UNITS_STORAGE_KEY, units);
  }, [units]);

  useEffect(() => {
    if (!savedNotice) return;
    const timeout = setTimeout(() => setSavedNotice(false), 2000);
    return () => clearTimeout(timeout);
  }, [savedNotice]);

  const updatePref = (key: keyof NotificationPrefs) => (value: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setSavedNotice(true);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate(ROUTES.auth.login, { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="container-app max-w-3xl py-8">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Settings</h1>
        <p className="mt-2 text-foreground-muted">Manage app preferences and account settings.</p>
      </div>

      {savedNotice && (
        <Alert variant="success" className="mt-6">
          Preferences saved on this device.
        </Alert>
      )}

      {/* Appearance */}
      <Card className="mt-6">
        <CardHeader>
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">Appearance</h2>
            <p className="mt-0.5 text-sm text-foreground-muted">Choose how AgriSense looks on this device.</p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                aria-pressed={theme === value}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors focus-ring',
                  theme === value
                    ? 'border-primary-600 bg-primary-100 text-primary-700 dark:bg-primary-800/40 dark:text-primary-200'
                    : 'border-border text-foreground-muted hover:bg-surface-muted',
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Notifications */}
      <Card className="mt-6">
        <CardHeader>
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">Notifications</h2>
            <p className="mt-0.5 text-sm text-foreground-muted">
              Stored on this device — synced notification settings are coming soon.
            </p>
          </div>
        </CardHeader>
        <CardBody className="divide-y divide-border">
          <Switch
            label="Weather alerts"
            description="Get notified about severe weather for your farms."
            checked={prefs.weatherAlerts}
            onChange={updatePref('weatherAlerts')}
          />
          <Switch
            label="Disease detection alerts"
            description="Get notified when a scan flags a potential issue."
            checked={prefs.diseaseAlerts}
            onChange={updatePref('diseaseAlerts')}
          />
          <Switch
            label="Weekly digest"
            description="A weekly summary of your farms' conditions."
            checked={prefs.weeklyDigest}
            onChange={updatePref('weeklyDigest')}
          />
        </CardBody>
      </Card>

      {/* Units */}
      <Card className="mt-6">
        <CardHeader>
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">Units</h2>
            <p className="mt-0.5 text-sm text-foreground-muted">Used for weather and farm size displays.</p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex gap-3">
            {(['metric', 'imperial'] as Units[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setUnits(option)}
                aria-pressed={units === option}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors focus-ring',
                  units === option
                    ? 'border-primary-600 bg-primary-100 text-primary-700 dark:bg-primary-800/40 dark:text-primary-200'
                    : 'border-border text-foreground-muted hover:bg-surface-muted',
                )}
              >
                <MdOutlineStraighten className="h-4 w-4" aria-hidden="true" />
                {option === 'metric' ? 'Metric (°C, ha)' : 'Imperial (°F, acres)'}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Account */}
      <Card className="mt-6">
        <CardHeader>
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">Account</h2>
            <p className="mt-0.5 text-sm text-foreground-muted">{user?.email}</p>
          </div>
        </CardHeader>
        <CardFooter className="justify-between">
          <Badge variant="neutral">Signed in</Badge>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<MdOutlineLogout />}
            isLoading={isLoggingOut}
            onClick={handleLogout}
          >
            Log out
          </Button>
        </CardFooter>
      </Card>

      {/* Danger zone */}
      <Card className="mt-6 border-danger/30">
        <CardHeader>
          <div>
            <h2 className="font-display text-base font-semibold text-danger">Danger zone</h2>
            <p className="mt-0.5 text-sm text-foreground-muted">
              Account deletion isn't self-serve yet — contact support and we'll take care of it.
            </p>
          </div>
        </CardHeader>
        <CardFooter className="justify-end">
          <Button variant="danger" size="sm" leftIcon={<MdOutlineDeleteForever />} disabled>
            Delete account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
