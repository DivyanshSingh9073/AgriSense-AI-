import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MdArrowForward,
  MdBugReport,
  MdEco,
  MdWbSunny,
  MdOutlineChatBubbleOutline,
  MdOutlineDescription,
  MdSpaceDashboard,
  MdKeyboardArrowDown,
  MdFormatQuote,
  MdOutlineCloudUpload,
  MdOutlineAutoAwesome,
  MdOutlineInsights,
} from 'react-icons/md';
import { Avatar, FeatureCard, GlassCard } from '@/components/ui';
import { ROUTES } from '@/constants';
import { HeroIllustration } from './HeroIllustration';
import { AnimatedStat } from './AnimatedStat';

const FEATURES = [
  {
    icon: <MdBugReport />,
    title: 'Disease Detection',
    description: 'Upload a leaf photo and get an instant AI diagnosis, before an outbreak spreads across the field.',
  },
  {
    icon: <MdWbSunny />,
    title: 'Weather Analysis',
    description: 'Hyperlocal forecasts and alerts so irrigation and spraying decisions are never a guess.',
  },
  {
    icon: <MdEco />,
    title: 'Crop Recommendation',
    description: 'Get crop suggestions matched to your soil composition, season, and local climate data.',
  },
  {
    icon: <MdOutlineChatBubbleOutline />,
    title: 'AI Assistant',
    description: 'Ask AgriSense anything about your fields in plain language and get a grounded answer back.',
  },
  {
    icon: <MdOutlineDescription />,
    title: 'Farm Reports',
    description: 'Exportable, shareable reports that turn raw sensor and scan data into decisions.',
  },
  {
    icon: <MdSpaceDashboard />,
    title: 'Smart Dashboard',
    description: 'Every field, alert, and metric that matters — in one view, updated in real time.',
  },
];

const STEPS = [
  {
    icon: <MdOutlineCloudUpload />,
    title: 'Add your field data',
    description: 'Register a farm, upload a crop photo, or log soil readings — takes under two minutes.',
  },
  {
    icon: <MdOutlineAutoAwesome />,
    title: 'AI analyzes instantly',
    description: 'Our models cross-reference disease patterns, soil chemistry, and live weather in seconds.',
  },
  {
    icon: <MdOutlineInsights />,
    title: 'Act on clear insights',
    description: 'Get a specific recommendation — not just data — with confidence scores and next steps.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Meera Joshi',
    role: 'Smallholder farmer, Nashik',
    quote:
      'Caught a blight on my tomato crop three days before I would have noticed it myself. That early warning saved most of the field.',
  },
  {
    name: 'Thabo Nkosi',
    role: 'Farm manager, KwaZulu-Natal',
    quote:
      'The crop recommendation matched what my agronomist suggested — except I got the answer in a minute, not a week.',
  },
  {
    name: 'Carlos Medina',
    role: 'Cooperative lead, Jalisco',
    quote:
      'We manage 40 smallholder plots. The dashboard is the first tool that makes that actually manageable from one screen.',
  },
];

const FAQS = [
  {
    question: 'Do I need special equipment to use AgriSense AI?',
    answer:
      'No. A smartphone camera is enough for disease detection, and soil/weather data can be entered manually or synced from common sensors.',
  },
  {
    question: 'How accurate is the disease detection?',
    answer:
      'Our model reports a confidence score with every prediction, and we recommend treating results under 70% confidence as a prompt to inspect further rather than a final diagnosis.',
  },
  {
    question: 'Can I use AgriSense AI for multiple farms or fields?',
    answer:
      'Yes — Farm Management lets you register and track as many fields as you need, each with its own crop, location, and status.',
  },
  {
    question: 'Is my farm data private?',
    answer:
      'Your field data belongs to you. It is used only to power your own recommendations and is never sold to third parties.',
  },
  {
    question: 'Is there a free plan?',
    answer:
      'Yes — you can create an account and start monitoring your first field at no cost. Reach out if you need higher usage limits.',
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border py-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 text-left focus-ring rounded-lg"
      >
        <span className="font-medium text-foreground">{question}</span>
        <MdKeyboardArrowDown
          className={`h-5 w-5 shrink-0 text-foreground-muted transition-transform duration-base ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="overflow-hidden"
      >
        <p className="pt-3 text-sm leading-relaxed text-foreground-muted">{answer}</p>
      </motion.div>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

/** Public marketing landing page. */
export function Home() {
  return (
    <div>
      {/* ------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600">
        <div className="container-app grid gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
              AI-powered precision agriculture
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Grow smarter with data your fields already have
            </h1>
            <p className="mt-4 max-w-lg text-white/80">
              AgriSense AI turns crop photos, soil readings, and weather data into disease alerts, crop
              recommendations, and reports — so every decision is backed by evidence, not guesswork.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to={ROUTES.auth.register}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-primary-700 transition-transform duration-base hover:scale-[1.02] focus-ring"
              >
                Get started free
                <MdArrowForward className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-12 items-center rounded-xl border border-white/30 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-ring"
              >
                See how it works
              </a>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/15 pt-8 sm:max-w-md">
              <AnimatedStat value={12000} suffix="+" label="Fields monitored" />
              <AnimatedStat value={96} suffix="%" label="Detection accuracy" />
              <AnimatedStat value={40} suffix="+" label="Countries" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-3xl shadow-xl">
              <HeroIllustration />
            </div>
            <GlassCard className="absolute -bottom-6 -left-6 hidden w-56 p-4 sm:block">
              <p className="text-xs font-medium text-white/70">North paddock</p>
              <p className="mt-1 font-display text-lg font-semibold text-white">Healthy — 98%</p>
              <p className="mt-0.5 text-xs text-white/60">Scanned 2 hours ago</p>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* --------------------------------------------------------- Features */}
      <section id="features" className="container-app py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Everything your farm needs, in one platform</h2>
          <p className="mt-3 text-foreground-muted">
            From the first symptom on a leaf to the report you hand your cooperative — AgriSense AI covers the
            whole loop.
          </p>
        </div>

        <div className="mt-12 grid gap-2 rounded-3xl border border-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ How it works */}
      <section id="how-it-works" className="border-t border-border bg-surface-muted/50 py-20">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">How it works</h2>
            <p className="mt-3 text-foreground-muted">Three steps from a field photo to a decision.</p>
          </div>

          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 dark:bg-primary-800/40 dark:text-primary-200 [&>svg]:h-6 [&>svg]:w-6">
                  {step.icon}
                </div>
                <p className="mt-4 font-display text-lg font-semibold">
                  <span className="mr-2 text-accent-500">{`0${i + 1}`}</span>
                  {step.title}
                </p>
                <p className="mt-2 text-sm text-foreground-muted">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Testimonials */}
      <section className="container-app py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Trusted by growers worldwide</h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="card-surface p-6"
            >
              <MdFormatQuote className="h-6 w-6 text-accent-500" aria-hidden="true" />
              <p className="mt-3 text-sm leading-relaxed text-foreground">{t.quote}</p>
              <div className="mt-5 flex items-center gap-3">
                <Avatar name={t.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-foreground-muted">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------- FAQ */}
      <section className="border-t border-border bg-surface-muted/50 py-20">
        <div className="container-app grid gap-10 lg:grid-cols-3">
          <div>
            <h2 className="font-display text-3xl font-semibold">Frequently asked questions</h2>
            <p className="mt-3 text-foreground-muted">
              Can't find what you're looking for? Reach out to our support team.
            </p>
          </div>
          <div className="lg:col-span-2">
            {FAQS.map((faq) => (
              <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- CTA band */}
      <section className="container-app py-20">
        <div className="rounded-3xl bg-gradient-to-br from-primary-700 to-secondary-700 px-6 py-14 text-center sm:px-16">
          <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">Ready to see your fields differently?</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/80">
            Create a free account and run your first disease scan in under five minutes.
          </p>
          <Link
            to={ROUTES.auth.register}
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-primary-700 transition-transform duration-base hover:scale-[1.02] focus-ring"
          >
            Get started free
            <MdArrowForward className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
