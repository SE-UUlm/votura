import type { NotificationData } from '@mantine/notifications';
import type {
  SelectableBallotPaper,
  SelectableCandidate,
  SelectableElection,
} from '@repo/votura-validators';

export const getDeleteSuccessElectionConfig = (
  name: SelectableElection['name'],
): NotificationData => {
  return {
    title: 'Success',
    message: `You successfully deleted the election: ${name}`,
  };
};

export const getMutateSuccessElectionConfig = (
  name: SelectableElection['name'],
): NotificationData => {
  return {
    title: 'Success',
    message: `The changes to the election "${name}" have been saved.`,
  };
};

export const getToggleFreezeSuccessElectionConfig = (
  name: SelectableElection['name'],
  gotFrozen: boolean,
): NotificationData => {
  return {
    title: 'Success',
    message: `The election "${name}" has been ${gotFrozen ? 'frozen' : 'unfrozen'}.`,
  };
};

export const getAddSuccessElectionConfig = (name: SelectableElection['name']): NotificationData => {
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

export const getAddSuccessBallotPaperSectionConfig = (
  name: SelectableBallotPaper['name'],
): NotificationData => {
  return {
    title: 'Success',
    message: `The ballot paper section "${name}" has been created.`,
  };
};

export const getCreateSuccessCandidateConfig = (
  title: SelectableCandidate['title'],
): NotificationData => ({
  title: 'Success',
  message: `The candidate "${title}" has been created.`,
});

export const getMutateSuccessBallotPaperSectionConfig = (
  name: SelectableBallotPaper['name'],
): NotificationData => {
  return {
    title: 'Success',
    message: `The changes to the ballot paper section "${name}" have been saved.`,
  };
};

export const getDeleteSuccessBallotPaperSectionConfig = (
  name: SelectableBallotPaper['name'],
): NotificationData => {
  return {
    title: 'Success',
    message: `The ballot paper section "${name}" has been deleted.`,
  };
};
