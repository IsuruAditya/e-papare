import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './app/theme/ThemeContext';
import { I18nProvider } from './app/i18n/I18nProvider';
import { AuthProvider } from './app/auth/AuthContext';
import { createAppRouter } from './app/router/routes';

/**
 * Application root. Provider nesting (outer → inner):
 *   QueryClientProvider  — all server state (AD-18); no server state in context
 *   ThemeProvider        — light/dark UI state (AD-9)
 *   I18nProvider         — language UI state + react-i18next (AD-6/AD-7)
 *   AuthProvider         — auth token/role UI state (AD-18 stub; Epic 2 wires real auth)
 *   RouterProvider       — route tree; ProtectedRoute reads auth inside it
 *
 * The QueryClient is created once at module scope so it is not recreated on
 * re-render. The router is likewise created once.
 */

const queryClient = new QueryClient();
const router = createAppRouter();

function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
