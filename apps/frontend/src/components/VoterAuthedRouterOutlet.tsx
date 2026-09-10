import { type JSX, type PropsWithChildren, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { getVoterLocalStorage } from '../swr/voterToken.ts';

const RequireVoterAuth = ({ children }: PropsWithChildren): JSX.Element => {
  const navigate = useNavigate();

  useEffect((): void => {
    const voterToken = getVoterLocalStorage();

    if (voterToken === null) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return <>{children}</>;
};

export const VoterAuthedRouterOutlet = (): JSX.Element => {
  return (
    <RequireVoterAuth>
      <Outlet />
    </RequireVoterAuth>
  );
};
