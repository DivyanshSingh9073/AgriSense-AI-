import { useState } from "react";
import {
  FiDroplet,
  FiSun,
  FiTrendingUp,
  FiCpu,
  FiMoon,
  FiSearch,
  FiMapPin,
  FiSettings,
  FiTrash2,
  FiDownload,
  FiChevronDown,
  FiInfo,
} from "react-icons/fi";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card, FeatureCard, DashboardCard, StatsCard, GlassCard } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Alert } from "../ui/Alert";
import { Avatar } from "../ui/Avatar";
import { Spinner } from "../ui/Spinner";
import { Modal } from "../ui/Modal";
import { Tooltip } from "../ui/Tooltip";
import { Dropdown } from "../ui/Dropdown";
import { Skeleton } from "../ui/Skeleton";

/**
 * ComponentShowcase
 * ---------------------------------------------------------------------------
 * Visual QA surface for the design system — NOT a product page. Renders
 * every component and every variant/state so the whole library can be
 * eyeballed and tested (including dark mode) in one place before it's wired
 * into real screens. Safe to delete once the team has its own Storybook, or
 * keep mounted behind a dev-only route.
 */

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="font-heading text-2xl font-bold text-text-primary">{title}</h2>
        {description && <p className="mt-1 font-body text-sm text-text-secondary">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-4">{children}</div>;
}

export default function ComponentShowcase() {
  const [isDark, setIsDark] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [passwordDemo, setPasswordDemo] = useState("");

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-background px-6 py-10 transition-colors duration-base sm:px-10 lg:px-16">
        {/* ---- Page header + dark mode toggle ---- */}
        <header className="mb-14 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 font-body text-sm font-semibold uppercase tracking-wide text-primary-600">
              AgriSense AI · Design System
            </p>
            <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
              Component Showcase
            </h1>
            <p className="mt-2 max-w-xl font-body text-text-secondary">
              Every reusable primitive in the library, rendered with its full range of variants
              and states, for visual QA in both light and dark mode.
            </p>
          </div>
          <Button
            variant="outline"
            leftIcon={isDark ? <FiSun /> : <FiMoon />}
            onClick={() => setIsDark((v) => !v)}
          >
            {isDark ? "Light mode" : "Dark mode"}
          </Button>
        </header>

        {/* ---- Buttons ---- */}
        <Section
          title="Buttons"
          description="Primary, secondary, outline, ghost, danger, and success — in three sizes, with loading and disabled states."
        >
          <div className="flex flex-col gap-6">
            <Row>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
            </Row>
            <Row>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </Row>
            <Row>
              <Button leftIcon={<FiDownload />}>Export report</Button>
              <Button variant="danger" leftIcon={<FiTrash2 />}>Delete zone</Button>
              <Button isLoading={loadingDemo} loadingText="Syncing…" onClick={() => {
                setLoadingDemo(true);
                setTimeout(() => setLoadingDemo(false), 1800);
              }}>
                Sync sensors
              </Button>
              <Button disabled>Disabled</Button>
            </Row>
          </div>
        </Section>

        {/* ---- Inputs ---- */}
        <Section title="Inputs" description="Labels, helper text, errors, prefix/suffix icons, and password toggle.">
          <div className="grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
            <Input label="Field name" placeholder="North paddy field" helperText="Visible to your whole team" />
            <Input label="Search fields" placeholder="Search…" prefixIcon={<FiSearch />} />
            <Input label="Soil moisture threshold" placeholder="35" suffixIcon={<span className="text-sm">%</span>} />
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              value={passwordDemo}
              onChange={(e) => setPasswordDemo(e.target.value)}
            />
            <Input label="API key" defaultValue="sk-live-••••1234" error="This key expired 3 days ago" />
            <Input label="Farm location" placeholder="District, state" prefixIcon={<FiMapPin />} disabled />
          </div>
        </Section>

        {/* ---- Cards ---- */}
        <Section title="Cards" description="Feature, dashboard, stats, and glass presets built on a shared Card shell.">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<FiCpu />}
              title="AI Crop Advisory"
              description="Get real-time, model-driven recommendations tailored to each field's soil and weather profile."
            />
            <StatsCard label="Avg. soil moisture" value="42%" delta={{ value: "3.1%", direction: "up" }} icon={<FiDroplet />} />
            <StatsCard
              label="Pest risk index"
              value="Low"
              delta={{ value: "2 pts", direction: "down", positiveIsGood: false }}
              icon={<FiTrendingUp />}
            />
            <DashboardCard title="Irrigation schedule" subtitle="Next 7 days" action={<Badge variant="info">Auto</Badge>}>
              <Skeleton.Text lines={3} />
            </DashboardCard>
            <Card>
              <p className="font-body text-sm text-text-secondary">
                Base <code className="font-mono text-xs">Card</code> — the shared shell every preset composes.
              </p>
            </Card>
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-600 to-sky-600 p-6">
              <GlassCard>
                <p className="font-heading text-lg font-semibold text-white">Glass Card</p>
                <p className="mt-1 font-body text-sm text-white/80">
                  For overlays on imagery — satellite views, map panels, hero sections.
                </p>
              </GlassCard>
            </div>
          </div>
        </Section>

        {/* ---- Badges ---- */}
        <Section title="Badges" description="Compact status pills for sensor, plan, or alert state.">
          <Row>
            <Badge variant="success" dot>Online</Badge>
            <Badge variant="warning" dot>Low battery</Badge>
            <Badge variant="error" dot>Offline</Badge>
            <Badge variant="info" dot>Syncing</Badge>
            <Badge variant="neutral">Draft</Badge>
          </Row>
        </Section>

        {/* ---- Alerts ---- */}
        <Section title="Alerts" description="Page-level system messages, dismissible on demand.">
          <div className="flex max-w-2xl flex-col gap-4">
            <Alert type="success" title="Sync complete">All 12 sensors are reporting normally.</Alert>
            <Alert type="info" title="Scheduled maintenance">Field cameras will be offline 2–3 AM IST.</Alert>
            <Alert type="warning" title="Battery low">Node 4 in the north field is below 15%.</Alert>
            {showAlert && (
              <Alert type="error" title="Sensor unreachable" onClose={() => setShowAlert(false)}>
                Node 7 hasn't reported in 6 hours. Check its connection.
              </Alert>
            )}
          </div>
        </Section>

        {/* ---- Avatars ---- */}
        <Section title="Avatars" description="Image with automatic initials fallback, plus online-status indicator.">
          <Row>
            <Avatar name="Divyansh Singh" size="sm" status="online" />
            <Avatar name="Fariza Sultana" size="md" status="away" />
            <Avatar name="Harshitha Chikkala" size="lg" status="offline" />
            <Avatar name="Ananya Rao" src="https://broken-url-demo.invalid/avatar.jpg" size="md" status="online" />
          </Row>
        </Section>

        {/* ---- Spinner ---- */}
        <Section title="Spinner" description="Generic loading indicator for non-button contexts.">
          <Row>
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </Row>
        </Section>

        {/* ---- Modal ---- */}
        <Section title="Modal" description="Header, body, footer, close button, Escape key, and click-outside to close.">
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add a new zone">
            <Modal.Body>
              <div className="flex flex-col gap-4">
                <Input label="Zone name" placeholder="e.g. East greenhouse" />
                <Input label="Area (hectares)" placeholder="2.5" />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={() => setModalOpen(false)}>Save zone</Button>
            </Modal.Footer>
          </Modal>
        </Section>

        {/* ---- Tooltip ---- */}
        <Section title="Tooltip" description="Hover or focus a trigger to reveal a short hint.">
          <Row>
            <Tooltip content="Normalized Difference Vegetation Index" position="top">
              <Button variant="outline" leftIcon={<FiInfo />}>Hover for NDVI info</Button>
            </Tooltip>
            <Tooltip content="Opens field settings" position="right">
              <Button variant="ghost" leftIcon={<FiSettings />}>Settings</Button>
            </Tooltip>
          </Row>
        </Section>

        {/* ---- Dropdown ---- */}
        <Section title="Dropdown" description="Keyboard-navigable menu attached to any trigger.">
          <Dropdown
            trigger={<Button variant="outline" rightIcon={<FiChevronDown />}>Sort by</Button>}
            items={[
              { label: "Newest first", onSelect: () => {} },
              { label: "Yield (high to low)", onSelect: () => {} },
              { label: "Moisture level", onSelect: () => {}, disabled: true },
              { label: "Remove field", onSelect: () => {}, destructive: true, icon: <FiTrash2 /> },
            ]}
          />
        </Section>

        {/* ---- Skeleton ---- */}
        <Section title="Skeleton Loader" description="Placeholder shapes shown while real data loads.">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Skeleton.Card />
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Skeleton.Circle size={40} />
                <Skeleton.Text lines={2} className="flex-1" />
              </div>
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton.Text lines={5} />
          </div>
        </Section>
      </div>
    </div>
  );
}
