import { AppShell, Divider } from '@mantine/core';
import { IconNotes } from '@tabler/icons-react';
import { Outlet } from 'react-router';
import { NavbarHeader } from './navbar/NavbarHeader.tsx';
import { RoutingNavbarLink } from './navbar/RoutingNavbarLink.tsx';

export const AppShellLayout = () => {
  return (
    <AppShell
      navbar={{
        width: 300,
        breakpoint: 'sm',
      }}
    >
      <AppShell.Navbar pr={'md'} pl={'md'}>
        <NavbarHeader />
        <Divider pb={'md'} />
        <RoutingNavbarLink to={'/elections'} label={'Elections'} icon={<IconNotes size={16} />} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
