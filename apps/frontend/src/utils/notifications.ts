import type { NotificationData } from '@mantine/notifications';

export const getDeleteSuccessElectionConfig = (name: string): NotificationData => {
  return {
    title: 'Success',
    message: `You successfully deleted the election: ${name}`,
  };
};
