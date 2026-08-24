import { AppShell, Box, Button, Divider, Space, Stack } from '@mantine/core';
import type { JSX } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useGetVoterElections } from '../swr/voting/useGetVoterElections.ts';
import { clearVoterLocalStorage, getVoterLocalStorage } from '../swr/voterToken.ts';
import { NavbarHeader } from './navbar/NavbarHeader.tsx';
import { RoutingNavbarLink } from './navbar/RoutingNavbarLink.tsx';
import { IconFileInfo, IconNotes } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const getVotingElectionPath = (electionId: string): string => {
  return `/voting/${electionId}`;
};

export const AppShellLayoutVoter = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const voterToken = getVoterLocalStorage();
  const voterElectionsHook = useGetVoterElections({ token: voterToken });
  const voterElections = voterElectionsHook.data ?? [];

  const onLogout = (): void => {
    clearVoterLocalStorage();
    navigate('/vote', { replace: true });
  };

  return (
    <AppShell
      navbar={{
        width: 300,
        breakpoint: 'sm',
      }}
    >
      <AppShell.Navbar pr={'md'} pl={'md'} pb={'md'}>
        <Stack justify={'space-between'} h={'100%'}>
          <Box>
            <NavbarHeader />
            <Divider pb={'md'} />
            <RoutingNavbarLink
              to={'/votingHome'}
              label={'Information'}
              icon={<IconFileInfo size={16} />}
            />
            <Space h={'xs'} />
            {voterElections.map((election) => (
              <Box key={election.id}>
                <RoutingNavbarLink to={getVotingElectionPath(election.id)} label={election.name} icon={<IconNotes size={16} />} />
                <Space h={'xs'} />
              </Box>
            ))}
          </Box>
          <Box>
            <Divider pb={'md'} />
            <Button variant="subtle" fullWidth onClick={onLogout}>
              {t('logout', 'Logout')}
            </Button>
          </Box>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
