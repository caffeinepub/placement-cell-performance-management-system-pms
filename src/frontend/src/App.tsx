import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { InternetIdentityProvider } from './hooks/useInternetIdentity';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AssistantDashboard from './pages/assistant/AssistantDashboard';
import RequireAuth from './routes/RequireAuth';
import RequireRole from './routes/RequireRole';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient();

// Root route with layout
const rootRoute = createRootRoute({
  component: () => <Outlet />
});

// Public routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage
});

// Protected admin routes
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <RequireAuth>
      <RequireRole requiredRole="admin">
        <AdminDashboard />
      </RequireRole>
    </RequireAuth>
  )
});

// Protected assistant routes
const assistantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/assistant',
  component: () => (
    <RequireAuth>
      <RequireRole requiredRole="user">
        <AssistantDashboard />
      </RequireRole>
    </RequireAuth>
  )
});

const routeTree = rootRoute.addChildren([loginRoute, adminRoute, assistantRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <InternetIdentityProvider>
          <RouterProvider router={router} />
          <Toaster />
        </InternetIdentityProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
