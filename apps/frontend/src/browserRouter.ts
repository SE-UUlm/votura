import { parameter } from '@repo/votura-validators';
import { createBrowserRouter, redirect } from 'react-router';
import { AppShellLayout } from './components/AppShellLayout.tsx';
import { AppShellLayoutVoter } from './components/AppShellLayoutVoter.tsx';
import { AuthedRouterOutlet } from './components/AuthedRouterOutlet.tsx';
import { VoterAuthedRouterOutlet } from './components/VoterAuthedRouterOutlet.tsx';
import { ElectionView } from './components/views/election/ElectionView.tsx';
import { ElectionsView } from './components/views/elections/ElectionsView.tsx';
import { LoginView } from './components/views/login/LoginView.tsx';
import { RegisterView } from './components/views/login/RegisterView.tsx';
import { VoterView } from './components/views/login/VoterView.tsx';
import { VoterGroupsView } from './components/views/voterGroups/VoterGroupsView.tsx';
import { VotingElectionView } from './components/views/voting/VotingElectionView.tsx';
import { VotingHomeView } from './components/views/voting/VotingHomeView.tsx';

export const browserRouter = createBrowserRouter([
  {
    path: '/',
    loader: (): Response => redirect('/elections'),
  },
  {
    path: '/vote',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Component: VoterView,
  },
  {
    path: '/login',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Component: LoginView,
  },
  {
    path: '/register',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Component: RegisterView,
  },
  {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Component: VoterAuthedRouterOutlet,
    children: [
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Component: AppShellLayoutVoter,
        children: [
          {
            path: '/votingHome',
            children: [
              {
                index: true,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Component: VotingHomeView,
              },
            ],
          },
          {
            path: `/voting/:${parameter.electionId}`,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Component: VotingElectionView,
          },
        ],
      },
    ],
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
        ],
      },
    ],
  },
]);
