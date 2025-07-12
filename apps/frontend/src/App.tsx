import { parameter } from '@repo/votura-validators';
import { Navigate, Route, Routes } from 'react-router';
import { AppShellLayout } from './components/AppShellLayout.tsx';
import { AuthedRouterOutlet } from './components/AuthedRouterOutlet.tsx';
import { ElectionView } from './components/views/election/ElectionView.tsx';
import { ElectionsView } from './components/views/elections/ElectionsView.tsx';
import { LoginView } from './components/views/login/LoginView.tsx';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route element={<AuthedRouterOutlet />}>
        <Route element={<AppShellLayout />}>
          <Route path={'/'} element={<Navigate to={'/elections'} replace />} />
          <Route path={'/elections'} element={<ElectionsView />} />
          <Route path={`/elections/:${parameter.electionId}`} element={<ElectionView />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
