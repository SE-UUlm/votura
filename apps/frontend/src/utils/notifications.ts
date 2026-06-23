import type { NotificationData } from '@mantine/notifications';
import type {
  SelectableBallotPaper,
  SelectableCandidate,
  SelectableElection,
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
