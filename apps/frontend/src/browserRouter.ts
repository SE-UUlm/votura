import { parameter } from '@repo/votura-validators';
import { createBrowserRouter, redirect } from 'react-router';
import { AdminRouterOutlet } from './components/AdminRouterOutlet.tsx';
import { AppShellLayout } from './components/AppShellLayout.tsx';
import { AuthedRouterOutlet } from './components/AuthedRouterOutlet.tsx';
import { AccountView } from './components/views/account/AccountView.tsx';
import { AccountsView } from './components/views/accounts/AccountsView.tsx';
import { ElectionView } from './components/views/election/ElectionView.tsx';
import { ElectionsView } from './components/views/elections/ElectionsView.tsx';
import { LoginView } from './components/views/login/LoginView.tsx';
import { VoterGroupsView } from './components/views/voterGroups/VoterGroupsView.tsx';

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
          {
            path: '/voterGroups',
            children: [
              {
                index: true,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Component: VoterGroupsView,
              },
            ],
          },
          {
            path: '/account',
            children: [
              {
                index: true,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Component: AccountView,
              },
            ],
          },
          {
            path: '/accounts',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Component: AdminRouterOutlet,
            children: [
              {
                index: true,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Component: AccountsView,
              },
            ],
          },
        ],
      },
    ],
  },
]);
