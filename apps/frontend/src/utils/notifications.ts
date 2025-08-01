import type { NotificationData } from '@mantine/notifications';
import type { SelectableBallotPaper } from '@repo/votura-validators';
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

export const getToggleFreezeSuccessElectionConfig = (
  name: MockElection['name'],
  gotFrozen: boolean,
): NotificationData => {
  return {
    title: 'Success',
    message: `The election "${name}" has been ${gotFrozen ? 'frozen' : 'unfrozen'}.`,
  };
};

export const getAddSuccessElectionConfig = (name: MockElection['name']): NotificationData => {
  return {
    title: 'Success',
    message: `The election "${name}" has been created.`,
  };
};

export const getAddSuccessBallotPaperConfig = (
  name: SelectableBallotPaper['name'],
): NotificationData => {
  return {
    title: 'Success',
    message: `The ballot paper "${name}" has been created.`,
  };
};

export const getMutateSuccessBallotPaperConfig = (
  name: SelectableBallotPaper['name'],
): NotificationData => {
  return {
    title: 'Success',
    message: `The changes to the ballot paper "${name}" have been saved.`,
  };
};

export const getDeleteSuccessBallotPaperConfig = (
  name: SelectableBallotPaper['name'],
): NotificationData => {
  return {
    title: 'Success',
    message: `The ballot paper "${name}" has been deleted.`,
  };
};
