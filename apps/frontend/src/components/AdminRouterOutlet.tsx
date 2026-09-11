import { Loader } from '@mantine/core';
import { type JSX, type PropsWithChildren, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { getUserIdFromAuthLocalStorage } from '../swr/authTokens.ts';
import { useGetUser } from '../swr/useGetUser.ts';

const RequireAdmin = ({ children }: PropsWithChildren): JSX.Element => {
  const navigate = useNavigate();
  const userId = getUserIdFromAuthLocalStorage();
  const { data: user, isLoading, error } = useGetUser(userId ?? '');

  useEffect((): void => {
    if (!isLoading && (error !== undefined || user === undefined || user.role !== 'admin')) {
      void navigate('/elections', { replace: true });
    }
  }, [user, isLoading, error, navigate]);

  if (isLoading) {
    return <Loader />;
  }

  if (error !== undefined || user === undefined || user.role !== 'admin') {
    return <></>;
  }

  return <>{children}</>;
};

export const AdminRouterOutlet = (): JSX.Element => {
  return (
    <RequireAdmin>
      <Outlet />
    </RequireAdmin>
  );
};
