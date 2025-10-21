import { AppShell, Box, Button, Divider, Stack } from '@mantine/core';
import { IconNotes, IconUsersGroup } from '@tabler/icons-react';
import type { JSX } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { clearAuthLocalStorage } from '../swr/authTokens.ts';
import { NavbarHeader } from './navbar/NavbarHeader.tsx';
import { RoutingNavbarLink } from './navbar/RoutingNavbarLink.tsx';

export const AppShellLayout = (): JSX.Element => {
  const navigate = useNavigate();

  const onLogout = (): void => {
    clearAuthLocalStorage();
    navigate('/login', { replace: true });
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
              to={'/elections'}
              label={'Elections'}
              icon={<IconNotes size={16} />}
            />
            <RoutingNavbarLink
              to={'/voterGroups'}
              label={'Voter Groups & Tokens'}
              icon={<IconUsersGroup size={16} />}
            />
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
