import { ActionIcon, Badge, Button, Group, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { SelectableElection } from '@repo/votura-validators';
import { IconArrowLeft, IconDots, IconWorld } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { callPublishElectionResults } from '../../../rpc/election/callPublishElectionResults.ts';
import { callToggleElectionFreeze } from '../../../rpc/election/callToggleElectionFreeze.ts';
import { useDeleteElection } from '../../../swr/elections/useDeleteElection.ts';
import { useUpdateElection } from '../../../swr/elections/useUpdateElection.ts';
import {
  getDeleteSuccessElectionConfig,
  getMutateSuccessElectionConfig,
} from '../../../utils/notifications.ts';
import { ElectionsSettingsMenu } from '../../ElectionSettingsMenu.tsx';
import type { MutateElectionModalProps } from '../../MutateElectionDrawer.tsx';
import type { PublishElectionResultsModalProps } from '../../PublishElectionResultsModal.tsx';
import type { ToggleFreezeElectionModalProps } from '../../ToggleFreezeElectionModal.tsx';
import { HEADER_HEIGHT } from '../../utils.ts';

export interface ElectionViewHeaderProps {
  election: SelectableElection;
}

const ResultsPublishedInfo = ({ election }: ElectionViewHeaderProps): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <Badge color="green">{t('resultsPublished', 'Results published')}</Badge>
      <Button
        leftSection={<IconWorld size={16} />}
        variant="outline"
        onClick={(): void => {
          navigate(`/results/${election.id}`);
        }}
      >
        {t('publicResults', 'Public results')}
      </Button>
    </>
  );
};

export const ElectionViewHeader = ({ election }: ElectionViewHeaderProps): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { trigger: deleteTrigger } = useDeleteElection({
    electionId: election.id,
  });
  const { trigger: updateTrigger, isMutating } = useUpdateElection(election.id);

  const onDelete = async (): Promise<void> => {
    try {
      await deleteTrigger();
      notifications.show(getDeleteSuccessElectionConfig(election.name));
      navigate('/elections');
    } catch (e: unknown) {
      let message: string = t(
        'couldNotDeleteElectionPleaseTryAgain',
        'Could not delete election. Please try again.',
      );
      if (e instanceof Error) {
        message = e.message;
      }

      notifications.show({
        title: t('deletionFailed', 'Deletion failed'),
        message: message,
        color: 'red',
      });
    }
  };

  const onMutate: MutateElectionModalProps['onMutate'] = async (mutatedElection) => {
    await updateTrigger(mutatedElection);
    notifications.show(getMutateSuccessElectionConfig(mutatedElection.name));
  };

  const onToggleFreeze: ToggleFreezeElectionModalProps['onToggleFreeze'] = async () => {
    notifications.show(await callToggleElectionFreeze(election));
  };

  const onPublishResults: PublishElectionResultsModalProps['onPublishResults'] = async () => {
    notifications.show(await callPublishElectionResults(election.id));
  };

  return (
    <>
      <Group justify="space-between" h={HEADER_HEIGHT}>
        <Group>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            variant="subtle"
            onClick={(): void => {
              navigate('/elections');
            }}
          >
            {t('backToAllElections', 'Back to all elections')}
          </Button>
          <Title order={3}>{election.name}</Title>
        </Group>
        <Group>
          {election.resultsPublishedAt !== undefined && (
            <ResultsPublishedInfo election={election} />
          )}
          <ElectionsSettingsMenu
            election={election}
            targetElement={
              <ActionIcon size="lg" variant="light" aria-label="Settings">
                <IconDots size={16} />
              </ActionIcon>
            }
            onDelete={onDelete}
            onMutate={onMutate}
            onToggleFreeze={onToggleFreeze}
            onPublishResults={onPublishResults}
            isMutating={isMutating}
          />
        </Group>
      </Group>
    </>
  );
};
