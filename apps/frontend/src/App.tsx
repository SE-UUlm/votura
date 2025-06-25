import { AppShell, Divider } from '@mantine/core';
import { parameter } from '@repo/votura-validators';
import { IconNotes } from '@tabler/icons-react';
import { Navigate, Route, Routes } from 'react-router';
import { NavbarHeader } from './components/navbar/NavbarHeader.tsx';
import { RoutingNavbarLink } from './components/navbar/RoutingNavbarLink.tsx';
import { ElectionView } from './components/views/election/ElectionView.tsx';
import { ElectionsView } from './components/views/elections/ElectionsView.tsx';

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
        <RoutingNavbarLink to={'/elections'} label={'Elections'} icon={<IconNotes size={16} />} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path={'/'} element={<Navigate to={'/elections'} replace />} />
          <Route path={'/elections'} element={<ElectionsView />} />
          <Route path={`/elections/:${parameter.electionId}`} element={<ElectionView />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
