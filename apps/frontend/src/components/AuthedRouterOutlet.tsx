import { type JSX, type PropsWithChildren, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { getAuthLocalStorage } from '../swr/authTokens.ts';

const RequireAuth = ({ children }: PropsWithChildren): JSX.Element => {
  const navigate = useNavigate();

  useEffect((): void => {
    const authTokens = getAuthLocalStorage();

    if (authTokens === null) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return <>{children}</>;
};

export const AuthedRouterOutlet = (): JSX.Element => {
  return (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  );
};
