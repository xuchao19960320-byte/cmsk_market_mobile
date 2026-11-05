import { lazy, Suspense } from 'react';
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { AppLayout } from '../components/AppLayout';
const OverviewPage = lazy(() => import('../pages/OverviewPage'));
const AdvisorPage = lazy(() => import('../pages/AdvisorPage'));
const TasksPage = lazy(() => import('../pages/TasksPage'));
const DictionaryPage = lazy(() => import('../pages/DictionaryPage'));
const router = createHashRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Navigate to="/overview" replace /> },
      { path: '/overview', element: <OverviewPage /> },
      { path: '/advisor', element: <AdvisorPage /> },
      { path: '/actions', element: <TasksPage /> },
      { path: '/dictionary', element: <DictionaryPage /> },
      { path: '*', element: <Navigate to="/overview" replace /> },
    ],
  },
]);
export function AppRouter() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <Spin /> 正在加载页面
        </div>
      }>
      <RouterProvider router={router} />
    </Suspense>
  );
}
