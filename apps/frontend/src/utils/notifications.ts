import type { NotificationData } from '@mantine/notifications';
import type {
  SelectableBallotPaper,
  SelectableCandidate,
  SelectableElection,
  SelectableVoterGroup,
} from '@repo/votura-validators';
import i18next from 'i18next';


export const getDeleteSuccessElectionConfig = (
  name: SelectableElection['name'],
): NotificationData => {
  return {
    title: i18next.t('success', 'Success'),
    message: i18next.t('youSuccessfullyDeletedTheElectionName', 'You successfully deleted the election: {{name}}', { name }),
  };
};

export const getMutateSuccessElectionConfig = (
  name: SelectableElection['name'],
): NotificationData => {
  return {
    title: i18next.t('success', 'Success'),
    message: i18next.t('theChangesToTheElectionNameHaveBeenSaved', 'The changes to the election "{{name}}" have been saved.', { name }),
  };
};

export const getRPCErrorConfig = (message: string): NotificationData => {
  return {
    title: 'Error',
    message,
    color: 'red',
  };
};

export const getElectionNotFreezableConfig = (name: string): NotificationData => {
  return {
    title: 'Error',
    message: `The election "${name}" cannot be frozen. Have you made sure that everything is set up correctly? See the documentation for more information.`,
    color: 'red',
  };
};

export const getToggleFreezeSuccessElectionConfig = (
  name: SelectableElection['name'],
  gotFrozen: boolean,
): NotificationData => {
  return {
    title: i18next.t('success', 'Success'),
    message: i18next.t('theElectionNameHasBeenVal', 'The election "{{name}}" has been {{val}}.', { name, val: gotFrozen ? 'frozen' : 'unfrozen' }),
  };
};

export const getAddSuccessElectionConfig = (name: SelectableElection['name']): NotificationData => {
  return {
    title: i18next.t('success', 'Success'),
    message: i18next.t('theElectionNameHasBeenCreated', 'The election "{{name}}" has been created.', { name }),
  };
};

export const getAddSuccessBallotPaperConfig = (
  name: SelectableBallotPaper['name'],
): NotificationData => {
  return {
    title: i18next.t('success', 'Success'),
    message: i18next.t('theBallotPaperNameHasBeenCreated', 'The ballot paper "{{name}}" has been created.', { name }),
  };
};

export const getMutateSuccessBallotPaperConfig = (
  name: SelectableBallotPaper['name'],
): NotificationData => {
  return {
    title: i18next.t('success', 'Success'),
    message: i18next.t('theChangesToTheBallotPaperNameHaveBeenSaved', 'The changes to the ballot paper "{{name}}" have been saved.', { name }),
  };
};

export const getDeleteSuccessBallotPaperConfig = (
  name: SelectableBallotPaper['name'],
): NotificationData => {
  return {
    title: i18next.t('success', 'Success'),
    message: i18next.t('theBallotPaperNameHasBeenDeleted', 'The ballot paper "{{name}}" has been deleted.', { name }),
  };
};

export const getAddSuccessBallotPaperSectionConfig = (
  name: SelectableBallotPaper['name'],
): NotificationData => {
  return {
    title: i18next.t('success', 'Success'),
    message: i18next.t('theBallotPaperSectionNameHasBeenCreated', 'The ballot paper section "{{name}}" has been created.', { name }),
  };
};

export const getCreateSuccessCandidateConfig = (
  title: SelectableCandidate['title'],
): NotificationData => ({
  title: i18next.t('success', 'Success'),
  message: i18next.t('theCandidateTitleHasBeenCreated', 'The candidate "{{title}}" has been created.', { title }),
});

export const getAddSuccessVoterGroupConfig = (
  name: SelectableVoterGroup['name'],
): NotificationData => {
  return {
    title: 'Success',
    message: `The voter group "${name}" has been created.`,
  };
};

export const getMutateSuccessVoterGroupConfig = (
  name: SelectableVoterGroup['name'],
): NotificationData => {
  return {
    title: 'Success',
    message: `The changes to the voter group "${name}" have been saved.`,
  };
};

export const getDeleteSuccessVoterGroupConfig = (
  name: SelectableVoterGroup['name'],
): NotificationData => {
  return {
    title: 'Success',
    message: `You successfully deleted the voter group: ${name}`,
  };
};
