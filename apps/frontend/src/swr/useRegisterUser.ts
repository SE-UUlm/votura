import useSWRMutation from 'swr/mutation';
import { apiRoutes } from './apiRoutes.ts';
import { posterFactory } from './posterFactory.ts';

export const useRegisterUser = () => {
  return useSWRMutation(apiRoutes.users.base, posterFactory());
};
