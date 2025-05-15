import { AppShell, Divider } from '@mantine/core';
import { Navigate, Route, Routes } from 'react-router';
import { IconBookmark } from '@tabler/icons-react';
import { NavbarHeader } from './components/navbar/NavbarHeader.tsx';
import { RoutingNavbarLink } from './components/navbar/RoutingNavbarLink.tsx';

function App() {
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
        <RoutingNavbarLink to={'/elections'} label={'Elections'} icon={<IconBookmark size={16} />} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path={'/'} element={<Navigate to={'/elections'} replace />} />
          <Route path={'/elections'} element={<div>hello world</div>} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
