import { parameter } from '@repo/votura-validators';
import { createBrowserRouter, redirect } from 'react-router';
import { AppShellLayout } from './components/AppShellLayout.tsx';
import { AuthedRouterOutlet } from './components/AuthedRouterOutlet.tsx';
import { ElectionView } from './components/views/election/ElectionView.tsx';
import { ElectionsView } from './components/views/elections/ElectionsView.tsx';
import { LoginView } from './components/views/login/LoginView.tsx';

export const browserRouter = createBrowserRouter([
  {
    path: '/',
    loader: (): Response => redirect('/elections'),
  },
  {
    path: '/login',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Component: LoginView,
  },
  {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Component: AuthedRouterOutlet,
    children: [
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Component: AppShellLayout,
        children: [
          {
            path: '/elections',
            children: [
              {
                index: true,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Component: ElectionsView,
              },
              {
                path: `:${parameter.electionId}`,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Component: ElectionView,
              },
            ],
          },
        ],
      },
    ],
  },
]);
