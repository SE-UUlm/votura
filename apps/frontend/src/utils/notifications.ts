import type { NotificationData } from '@mantine/notifications';
import type { MockElection } from '../store/useStore.ts';

export const getDeleteSuccessElectionConfig = (name: string): NotificationData => {
  return {
    title: 'Success',
    message: `You successfully deleted the election: ${name}`,
  };
};

export const getMutateSuccessElectionConfig = (name: MockElection['name']): NotificationData => {
  return {
    title: 'Success',
    message: `The changes to the election "${name}" have been saved.`,
  };
};
