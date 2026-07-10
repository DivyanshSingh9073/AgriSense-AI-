import { Routes, Route } from 'react-router-dom';
import { MainLayout, AuthLayout, DashboardLayout } from '@/layouts';
import { Home } from '@/pages/home';
import { Login, Register } from '@/pages/auth';
import { Dashboard } from '@/pages/dashboard';
import { DiseaseDetection } from '@/pages/disease-detection';
import { CropRecommendation } from '@/pages/crop-recommendation';
import { Weather } from '@/pages/weather';
import { AIChat } from '@/pages/ai-chat';
import { Reports } from '@/pages/reports';
import { Profile } from '@/pages/profile';
import { Settings } from '@/pages/settings';
import { NotFound } from '@/pages/not-found';
import { ROUTES } from '@/constants';
import { ProtectedRoute } from './ProtectedRoute';

/**
 * Route tree. Grouped into three nested branches, one per layout, so a
 * layout only mounts once per branch instead of per-page.
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Public marketing pages */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.home} element={<Home />} />
      </Route>

      {/* Auth pages */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.auth.login} element={<Login />} />
        <Route path={ROUTES.auth.register} element={<Register />} />
      </Route>

      {/* Authenticated dashboard */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.dashboard.root} element={<Dashboard />} />
        <Route path={ROUTES.dashboard.diseaseDetection} element={<DiseaseDetection />} />
        <Route path={ROUTES.dashboard.cropRecommendation} element={<CropRecommendation />} />
        <Route path={ROUTES.dashboard.weather} element={<Weather />} />
        <Route path={ROUTES.dashboard.aiChat} element={<AIChat />} />
        <Route path={ROUTES.dashboard.reports} element={<Reports />} />
        <Route path={ROUTES.dashboard.profile} element={<Profile />} />
        <Route path={ROUTES.dashboard.settings} element={<Settings />} />
      </Route>

      {/* 404 */}
      <Route path={ROUTES.notFound} element={<NotFound />} />
    </Routes>
  );
}
