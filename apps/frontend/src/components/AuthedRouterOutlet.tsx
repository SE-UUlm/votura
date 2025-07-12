import { type PropsWithChildren, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { getAuthLocalStorage } from '../swr/authTokens.ts';

const RequireAuth = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();

  useEffect(() => {
    const authTokens = getAuthLocalStorage();

    if (authTokens === null) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return <>{children}</>;
};

export const AuthedRouterOutlet = () => {
  return (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  );
};
