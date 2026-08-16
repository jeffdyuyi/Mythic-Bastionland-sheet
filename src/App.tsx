import { lazy, Suspense } from 'react';
import { RouterProvider, createHashRouter, Navigate } from 'react-router-dom';
import Onboarding from './pages/Onboarding';
import AppLayout from './layouts/AppLayout';
import PlayerDashboard from './pages/player/PlayerDashboard';
import MythicCardPage from './pages/player/MythicCardPage';
import GMDashboard from './pages/gm/GMDashboard';
import Sparks from './pages/gm/Sparks';

// Heavy routes split for lazy loading & initial bundle reduction
const KnightLibrary = lazy(() => import('./pages/player/KnightLibrary'));
const RulesReference = lazy(() => import('./pages/player/RulesReference'));
const PlayerMapPage = lazy(() => import('./pages/player/PlayerMapPage'));
const GMMapPage = lazy(() => import('./pages/gm/GMMapPage'));
const MythChronicles = lazy(() => import('./pages/gm/MythChronicles'));
const MapHubPage = lazy(() => import('./pages/map/MapHubPage'));
const MapWorkspacePage = lazy(() => import('./pages/map/MapWorkspacePage'));

const PageFallback = () => (
  <div className="p-8 text-center text-stone-500 text-sm font-mono animate-pulse">
    加载中...
  </div>
);

const router = createHashRouter([
  {
    path: '/',
    element: <Onboarding />,
  },
  {
    element: <AppLayout />,
    children: [
      // ---- Independent Map Hub & Workspace ----
      {
        path: '/map',
        element: (
          <Suspense fallback={<PageFallback />}>
            <MapHubPage />
          </Suspense>
        ),
      },
      {
        path: '/map/workspace',
        element: (
          <Suspense fallback={<PageFallback />}>
            <MapWorkspacePage />
          </Suspense>
        ),
      },
      // ---- Player routes ----
      {
        path: '/player',
        element: <PlayerDashboard />,
      },
      {
        path: '/player/card',
        element: <MythicCardPage />,
      },
      {
        path: '/player/library',
        element: (
          <Suspense fallback={<PageFallback />}>
            <KnightLibrary />
          </Suspense>
        ),
      },
      {
        path: '/player/rules',
        element: (
          <Suspense fallback={<PageFallback />}>
            <RulesReference />
          </Suspense>
        ),
      },
      {
        path: '/player/map',
        element: (
          <Suspense fallback={<PageFallback />}>
            <PlayerMapPage />
          </Suspense>
        ),
      },
      // ---- GM routes ----
      {
        path: '/gm',
        element: <GMDashboard />,
      },
      {
        path: '/gm/sparks',
        element: <Sparks />,
      },
      {
        path: '/gm/myths',
        element: (
          <Suspense fallback={<PageFallback />}>
            <MythChronicles />
          </Suspense>
        ),
      },
      {
        path: '/gm/map',
        element: (
          <Suspense fallback={<PageFallback />}>
            <GMMapPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
