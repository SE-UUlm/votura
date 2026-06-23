import { AppShell, Box, Button, Divider, Stack } from '@mantine/core';
import { IconNotes } from '@tabler/icons-react';
import type { JSX } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { clearAuthLocalStorage } from '../swr/authTokens.ts';
import { NavbarHeader } from './navbar/NavbarHeader.tsx';
import { RoutingNavbarLink } from './navbar/RoutingNavbarLink.tsx';
import { useTranslation } from 'react-i18next'


export const AppShellLayout = (): JSX.Element => {
  const { t } = useTranslation()
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
