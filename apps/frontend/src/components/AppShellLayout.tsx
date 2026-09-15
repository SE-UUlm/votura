import {
  ActionIcon,
  AppShell,
  Box,
  Divider,
  Flex,
  Skeleton,
  Space,
  Stack,
  ThemeIcon,
} from '@mantine/core';
import { IconBug, IconLogout, IconNotes, IconUsersGroup } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate } from 'react-router';
import { clearAuthLocalStorage, getUserIdFromAuthLocalStorage } from '../swr/authTokens.ts';
import { useGetUser } from '../swr/useGetUser.ts';
import { Avatar } from './Avatar.tsx';
import { NavbarHeader } from './navbar/NavbarHeader.tsx';
import { RoutingNavbarLink } from './navbar/RoutingNavbarLink.tsx';

export const AppShellLayout = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const userId = getUserIdFromAuthLocalStorage();
  if (!userId) {
    return (
      <ThemeIcon size="xl" color="red">
        <IconBug style={{ width: '70%', height: '70%' }} />
      </ThemeIcon>
    );
  }

  const { data: accountDetails, isLoading, error } = useGetUser(userId);

  let accountSection = null;
  if (isLoading) {
    accountSection = <Skeleton animate={true} />;
  } else if (error) {
    accountSection = (
      <RoutingNavbarLink
        to={'/account'}
        label={t('errorWhilstLoadingInformation', 'Error whilst loading information')}
        icon={<IconBug size={16} />}
      />
    );
  } else {
    accountSection = (
      <RoutingNavbarLink
        to={'/account'}
        label={accountDetails?.email}
        icon={<Avatar userId={accountDetails?.id ?? ''} email={accountDetails?.email ?? ''} />}
      />
    );
  }

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
              {accountSection}

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
