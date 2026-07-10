import { useState, type ReactNode } from 'react';
import {
  MdBugReport,
  MdEco,
  MdWbSunny,
  MdEmail,
  MdLock,
  MdSearch,
  MdDelete,
  MdEdit,
  MdContentCopy,
  MdMoreVert,
  MdDownload,
} from 'react-icons/md';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  DashboardCard,
  Dropdown,
  FeatureCard,
  GlassCard,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  Skeleton,
  SkeletonCard,
  SkeletonCircle,
  SkeletonText,
  Spinner,
  StatCard,
  Tooltip,
} from '@/components/ui';
import type { BadgeVariant } from '@/components/ui';
import { COLORS } from '@/constants';

/** Section wrapper: consistent heading + spacing rhythm for every gallery section. */
function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border py-12 first:border-t-0 first:pt-0">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      {description && <p className="mt-1.5 max-w-2xl text-foreground-muted">{description}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

function ColorSwatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="h-14" style={{ backgroundColor: hex }} />
      <div className="px-3 py-2">
        <p className="text-xs font-medium text-foreground">{name}</p>
        <p className="font-mono text-[11px] text-foreground-muted">{hex}</p>
      </div>
    </div>
  );
}

function ColorScale({ label, scale }: { label: string; scale: Record<string, string> }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground-muted">{label}</p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {Object.entries(scale).map(([step, hex]) => (
          <ColorSwatch key={step} name={step} hex={hex} />
        ))}
      </div>
    </div>
  );
}

const SHOWCASE_NAV = [
  { id: 'colors', label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'inputs', label: 'Inputs' },
  { id: 'cards', label: 'Cards' },
  { id: 'badges', label: 'Badges' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'avatar', label: 'Avatar' },
  { id: 'spinner', label: 'Spinner' },
  { id: 'modal', label: 'Modal' },
  { id: 'tooltip', label: 'Tooltip' },
  { id: 'dropdown', label: 'Dropdown' },
  { id: 'skeleton', label: 'Skeleton' },
];

const BADGE_VARIANTS: BadgeVariant[] = [
  'primary',
  'secondary',
  'accent',
  'success',
  'warning',
  'error',
  'info',
  'neutral',
];

/**
 * Visual test bed for every design-system primitive and its variants.
 * Not part of the product IA — linked nowhere in the app nav. Use this page
 * whenever a token or component changes, to check every consumer at once
 * instead of hunting through real pages.
 */
export function ComponentShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="container-app flex h-16 items-center justify-between">
          <div>
            <p className="font-display text-lg font-semibold">AgriSense AI — Design System</p>
            <p className="text-xs text-foreground-muted">Component showcase · dev-only gallery</p>
          </div>
          <nav className="hidden gap-4 overflow-x-auto lg:flex" aria-label="Showcase sections">
            {SHOWCASE_NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="whitespace-nowrap text-sm text-foreground-muted hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="container-app pb-24">
        {/* ---------------------------------------------------------------- */}
        <Section
          id="colors"
          title="Colors"
          description="Primary (canopy), Secondary (sprout), Accent (harvest gold), Soil, Sky, Neutral, and semantic status colors."
        >
          <div className="space-y-6">
            <ColorScale label="Primary" scale={COLORS.primary} />
            <ColorScale label="Secondary" scale={COLORS.secondary} />
            <ColorScale label="Accent" scale={COLORS.accent} />
            <ColorScale label="Soil" scale={COLORS.soil} />
            <ColorScale label="Sky" scale={COLORS.sky} />
            <ColorScale label="Neutral" scale={COLORS.neutral} />
            <div>
              <p className="mb-2 text-sm font-medium text-foreground-muted">Semantic</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {Object.entries(COLORS.semantic).map(([name, hex]) => (
                  <ColorSwatch key={name} name={name} hex={hex} />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="typography"
          title="Typography"
          description="Space Grotesk for display/headings, Inter for body text, JetBrains Mono for data/code."
        >
          <div className="space-y-4">
            <p className="font-display text-6xl font-semibold">Display 6xl</p>
            <p className="font-display text-5xl font-semibold">Display 5xl</p>
            <p className="font-display text-4xl font-semibold">Heading 4xl</p>
            <p className="font-display text-3xl font-semibold">Heading 3xl</p>
            <p className="font-display text-2xl font-semibold">Heading 2xl</p>
            <p className="font-display text-xl font-semibold">Heading xl</p>
            <p className="text-base text-foreground">Body base — the quick brown fox jumps over the lazy dog.</p>
            <p className="text-sm text-foreground-muted">Body sm muted — used for descriptions and helper text.</p>
            <p className="text-xs text-foreground-muted">Caption xs — timestamps, labels, fine print.</p>
            <p className="font-mono text-sm text-foreground">font-mono — 42.7 kg/ha · GPS 12.9716° N, 77.5946° E</p>
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="buttons"
          title="Buttons"
          description="Six variants × three sizes, plus hover, loading, and disabled states."
        >
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button leftIcon={<MdEco />}>With left icon</Button>
              <Button rightIcon={<MdDownload />}>With right icon</Button>
              <Button isLoading={isLoading} onClick={() => setIsLoading((v) => !v)}>
                {isLoading ? 'Loading…' : 'Click to toggle loading'}
              </Button>
              <Button disabled>Disabled</Button>
              <Button variant="outline" fullWidth className="max-w-xs">
                Full width
              </Button>
            </div>
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="inputs"
          title="Inputs"
          description="Label, placeholder, error, helper text, prefix/suffix icons, and an automatic password toggle."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <Input label="Email" placeholder="you@farm.com" leftIcon={<MdEmail />} />
            <Input
              label="Field name"
              placeholder="North paddock"
              helperText="Used to label scans and reports."
            />
            <Input label="Search crops" placeholder="Search…" leftIcon={<MdSearch />} />
            <Input
              label="Yield target (kg/ha)"
              placeholder="0"
              error="Yield target must be greater than 0."
              defaultValue="-5"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<MdLock />}
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
            />
            <Input label="Disabled field" placeholder="Not editable" disabled />
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="cards"
          title="Cards"
          description="Base compound Card, plus four purpose-built recipes: Feature, Dashboard, Stat, and Glass."
        >
          <div className="space-y-8">
            <div>
              <p className="mb-3 text-sm font-medium text-foreground-muted">Base Card (compound)</p>
              <Card className="max-w-md">
                <CardHeader>
                  <h3 className="font-display font-semibold">Field Report</h3>
                  <Badge variant="success" dot>
                    Healthy
                  </Badge>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-foreground-muted">
                    North paddock scanned 2 hours ago — no disease signs detected across 240 sample points.
                  </p>
                </CardBody>
                <CardFooter>
                  <Button size="sm" variant="outline">
                    View details
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-foreground-muted">Feature Cards</p>
              <div className="grid gap-2 rounded-2xl border border-border sm:grid-cols-3">
                <FeatureCard
                  icon={<MdBugReport />}
                  title="Disease Detection"
                  description="Scan crop imagery and catch early signs of disease before they spread."
                />
                <FeatureCard
                  icon={<MdEco />}
                  title="Crop Recommendation"
                  description="Get AI suggestions tailored to your soil composition and local climate."
                />
                <FeatureCard
                  icon={<MdWbSunny />}
                  title="Weather Intelligence"
                  description="Hyperlocal forecasts so irrigation and spraying decisions are never a guess."
                />
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-foreground-muted">Stat Cards</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Fields monitored" value="18" icon={<MdEco />} trend={{ value: '+2 this month', direction: 'up' }} />
                <StatCard label="Active alerts" value="3" icon={<MdBugReport />} trend={{ value: '-1 vs last week', direction: 'down' }} />
                <StatCard label="Avg. soil moisture" value="42%" icon={<MdWbSunny />} />
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-foreground-muted">Dashboard Card</p>
              <DashboardCard
                title="Disease trend"
                description="Last 30 days"
                action={
                  <Button size="sm" variant="ghost">
                    View all
                  </Button>
                }
                className="max-w-md"
              >
                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border text-sm text-foreground-muted">
                  Chart goes here
                </div>
              </DashboardCard>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-foreground-muted">Glass Card</p>
              <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 p-8">
                <GlassCard className="max-w-sm p-5 text-white">
                  <p className="font-display text-lg font-semibold">Today's outlook</p>
                  <p className="mt-1 text-sm text-white/80">
                    Clear skies, 24°C. Good conditions for irrigation this afternoon.
                  </p>
                </GlassCard>
              </div>
            </div>
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section id="badges" title="Badges" description="Success, Warning, Error, Info — plus brand variants and an optional status dot.">
          <div className="flex flex-wrap gap-3">
            {BADGE_VARIANTS.map((variant) => (
              <Badge key={variant} variant={variant} dot>
                {variant}
              </Badge>
            ))}
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section id="alerts" title="Alerts" description="Success, Error, Warning, and Information — with optional title and dismiss.">
          <div className="space-y-3">
            <Alert variant="success" title="Scan complete">
              No disease detected in the North paddock.
            </Alert>
            <Alert variant="error" title="Upload failed" onClose={() => {}}>
              The image exceeded the 10MB limit. Try a smaller file.
            </Alert>
            <Alert variant="warning" title="Low soil moisture">
              Moisture in the East field has dropped below 20%.
            </Alert>
            <Alert variant="info">New weather data is available for your region.</Alert>
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section id="avatar" title="Avatar" description="Image with initials fallback, four sizes, and an online-status indicator.">
          <div className="flex flex-wrap items-end gap-4">
            <Avatar name="Divyansh Rawat" size="sm" status="online" />
            <Avatar name="Divyansh Rawat" size="md" status="away" />
            <Avatar name="Divyansh Rawat" size="lg" status="offline" />
            <Avatar name="Divyansh Rawat" size="xl" />
            <Avatar name="Sangeetha Manavarthi" src="https://broken-image-url.example/none.jpg" size="lg" status="online" />
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section id="spinner" title="Spinner" description="Three sizes; color defaults to 'current' so it adapts inside colored buttons.">
          <div className="flex flex-wrap items-center gap-6">
            <Spinner size="sm" color="primary" />
            <Spinner size="md" color="primary" />
            <Spinner size="lg" color="primary" />
            <Button isLoading>Saving…</Button>
            <Button variant="outline" isLoading>
              Loading…
            </Button>
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="modal"
          title="Modal"
          description="Header (title + close), Body, Footer — with Escape-to-close, click-outside, and enter/exit animation."
        >
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Delete field report?">
            <ModalBody>
              This will permanently remove the scan history for North paddock. This action can't be undone.
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => setModalOpen(false)}>
                Delete
              </Button>
            </ModalFooter>
          </Modal>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section id="tooltip" title="Tooltip" description="Attaches to a single child via hover/focus. Four placements shown.">
          <div className="flex flex-wrap items-center gap-6">
            <Tooltip content="Edit field" placement="top">
              <Button variant="outline" size="sm" leftIcon={<MdEdit />}>
                Top
              </Button>
            </Tooltip>
            <Tooltip content="Duplicate" placement="bottom">
              <Button variant="outline" size="sm" leftIcon={<MdContentCopy />}>
                Bottom
              </Button>
            </Tooltip>
            <Tooltip content="Delete permanently" placement="right">
              <Button variant="outline" size="sm" leftIcon={<MdDelete />}>
                Right
              </Button>
            </Tooltip>
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section
          id="dropdown"
          title="Dropdown"
          description="Keyboard navigable (arrows, enter, escape) with dividers and a destructive item."
        >
          <Dropdown
            trigger={
              <Button variant="outline" size="sm" rightIcon={<MdMoreVert />}>
                Field actions
              </Button>
            }
            items={[
              { id: 'edit', label: 'Edit field', icon: <MdEdit />, onSelect: () => {} },
              { id: 'copy', label: 'Duplicate', icon: <MdContentCopy />, onSelect: () => {} },
              { divider: true },
              { id: 'delete', label: 'Delete field', icon: <MdDelete />, destructive: true, onSelect: () => {} },
            ]}
          />
        </Section>

        {/* ---------------------------------------------------------------- */}
        <Section id="skeleton" title="Skeleton" description="Loading placeholders for text, avatars, blocks, and full card layouts.">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <SkeletonCircle size={40} />
                <Skeleton className="h-3.5 w-24" />
              </div>
              <SkeletonText lines={3} />
            </div>
            <Skeleton className="h-40 w-full rounded-2xl" />
            <SkeletonCard />
          </div>
        </Section>
      </main>
    </div>
  );
}
