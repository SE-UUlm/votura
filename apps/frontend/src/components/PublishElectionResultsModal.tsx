import { Button, Group, Modal, type ModalProps, Space, Text } from '@mantine/core';
import type { SelectableElection } from '@repo/votura-validators';
import { IconAlertTriangle } from '@tabler/icons-react';
import type { JSX, MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

export interface PublishElectionResultsModalProps {
  election: SelectableElection;
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  onPublishResults: MouseEventHandler<HTMLButtonElement>;
}

export const PublishElectionResultsModal = ({
  election,
  opened,
  onClose,
  onPublishResults,
}: PublishElectionResultsModalProps): JSX.Element => {
  const { t } = useTranslation();
  const redColor = 'var(--mantine-color-red-7)';
  const title = (
    <Group gap="xs">
      <IconAlertTriangle size={20} stroke={2} style={{ color: redColor }} />
      <Text fw={700} c={redColor}>
        {t('publishElectionResults', 'Publish election results')}
      </Text>
    </Group>
  );

  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <Text c={redColor}>
        {t(
          'youAreAboutToPublishTheResultsOfTheElection',
          'You are about to publish the results of the election:',
        )}
      </Text>
      <Text fw={700} c={redColor}>
        {election.name}
      </Text>
      <Space h={'md'} />
      <Text fs="italic" c={redColor}>
        {`${t('important', 'Important')}:`}
      </Text>
      <Text fs="italic" c={redColor}>
        {t(
          'theResultsBecomePublicAndFinalTheElectionCanNotBeUnfrozenAnymore',
          'The results become public and final. The election can not be unfrozen anymore.',
        )}
      </Text>
      <Space h={'md'} />
      <Group justify="flex-end">
        <Button variant="outline" onClick={onClose}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          variant="filled"
          onClick={(e) => {
            onPublishResults(e);
            onClose();
          }}
        >
          {t('publish', 'Publish')}
        </Button>
      </Group>
    </Modal>
  );
};
