import { AppShell, Box, Button, Divider, Space, Stack } from '@mantine/core';
import { IconNotes } from '@tabler/icons-react';
import type { JSX } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { NavbarHeader } from './navbar/NavbarHeader.tsx';
import { RoutingNavbarLink } from './navbar/RoutingNavbarLink.tsx';
import { clearVoterLocalStorage } from '../swr/voterToken.ts';

export const AppShellLayoutVoter = (): JSX.Element => {
  const navigate = useNavigate();

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
              to={'/overview'}
              label={'Overview'}
              icon={<IconNotes size={16} />}
            />
            <Space h={'xs'} />
          </Box>
          <Box>
            <Divider pb={'md'} />
            <Button variant="subtle" fullWidth onClick={onLogout}>
              Logout
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