import { ActionIcon, AppShell, Avatar, Box, Divider, Flex, Space, Stack } from '@mantine/core';
import { IconLogout, IconNotes, IconUsersGroup } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate } from 'react-router';
import { clearAuthLocalStorage } from '../swr/authTokens.ts';
import { NavbarHeader } from './navbar/NavbarHeader.tsx';
import { RoutingNavbarLink } from './navbar/RoutingNavbarLink.tsx';

export const AppShellLayout = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const onLogout = (): void => {
    clearAuthLocalStorage();
    navigate('/login', { replace: true });
  };

  return (
    <AppShell
      navbar={{
        width: 350,
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
            <Space h={'xs'} />
            <RoutingNavbarLink
              to={'/voterGroups'}
              label={'Voter Groups & Tokens'}
              icon={<IconUsersGroup size={16} />}
            />
          </Box>
          <Box>
            <Divider pb={'md'} />
            <Flex justify={'space-between'} align={'center'} gap={'sm'}>
              <RoutingNavbarLink
                to={'/account'}
                label={'your.name@uni-ulm.de'}
                icon={<Avatar />}
              />

              <ActionIcon variant="subtle" aria-label={t('logout', 'Logout')} onClick={onLogout}>
                <IconLogout size={24} />
              </ActionIcon>
            </Flex>
          </Box>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
