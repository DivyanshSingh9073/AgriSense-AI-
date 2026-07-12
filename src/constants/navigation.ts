import {
  MdSpaceDashboard,
  MdOutlineAgriculture,
  MdOutlineBugReport,
  MdOutlineEco,
  MdOutlineWbSunny,
  MdOutlineChatBubbleOutline,
  MdOutlineDescription,
  MdOutlinePerson,
  MdOutlineSettings,
} from 'react-icons/md';
import type { IconType } from 'react-icons';
import { ROUTES } from './routes';

export interface NavItem {
  label: string;
  path: string;
  icon: IconType;
  /** Short description shown in tooltips / command palettes. */
  description?: string;
}

/** Primary sidebar navigation inside the authenticated dashboard shell. */
export const DASHBOARD_NAV: NavItem[] = [
  {
    label: 'Overview',
    path: ROUTES.dashboard.root,
    icon: MdSpaceDashboard,
    description: 'Farm health at a glance',
  },
  {
    label: 'Farm Management',
    path: ROUTES.dashboard.farmManagement,
    icon: MdOutlineAgriculture,
    description: 'Manage your farms and fields',
  },
  {
    label: 'Disease Detection',
    path: ROUTES.dashboard.diseaseDetection,
    icon: MdOutlineBugReport,
    description: 'AI-powered crop disease scanning',
  },
  {
    label: 'Crop Recommendation',
    path: ROUTES.dashboard.cropRecommendation,
    icon: MdOutlineEco,
    description: 'Soil & climate based crop suggestions',
  },
  {
    label: 'Weather',
    path: ROUTES.dashboard.weather,
    icon: MdOutlineWbSunny,
    description: 'Hyperlocal forecasts & alerts',
  },
  {
    label: 'AI Chat',
    path: ROUTES.dashboard.aiChat,
    icon: MdOutlineChatBubbleOutline,
    description: 'Ask AgriSense anything',
  },
  {
    label: 'Reports',
    path: ROUTES.dashboard.reports,
    icon: MdOutlineDescription,
    description: 'Exportable field reports',
  },
];

/** Secondary/account-level navigation (kept separate from the main nav). */
export const ACCOUNT_NAV: NavItem[] = [
  { label: 'Profile', path: ROUTES.dashboard.profile, icon: MdOutlinePerson },
  { label: 'Settings', path: ROUTES.dashboard.settings, icon: MdOutlineSettings },
];

/** Public marketing nav shown in the MainLayout navbar. */
export const PUBLIC_NAV: { label: string; path: string }[] = [
  { label: 'Home', path: ROUTES.home },
  { label: 'Sign in', path: ROUTES.auth.login },
];
