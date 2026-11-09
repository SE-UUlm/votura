import { Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { SelectableElection } from '@repo/votura-validators';
import {
  IconEdit,
  IconSnowflake,
  IconSnowflakeOff,
  IconTrash,
  IconWorld,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { JSX, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteElectionModal, type DeleteElectionModalProps } from './DeleteElectionModal.tsx';
import { MutateElectionDrawer, type MutateElectionModalProps } from './MutateElectionDrawer.tsx';
import {
  PublishElectionResultsModal,
  type PublishElectionResultsModalProps,
} from './PublishElectionResultsModal.tsx';
import {
  ToggleFreezeElectionModal,
  type ToggleFreezeElectionModalProps,
} from './ToggleFreezeElectionModal.tsx';

export interface ElectionsTableMenuProps {
  election: SelectableElection;
  targetElement: ReactNode;
  onDelete: DeleteElectionModalProps['onDelete'];
  onMutate: MutateElectionModalProps['onMutate'];
  isMutating: MutateElectionModalProps['isMutating'];
  onToggleFreeze: ToggleFreezeElectionModalProps['onToggleFreeze'];
  onPublishResults: PublishElectionResultsModalProps['onPublishResults'];
}

interface ElectionsSettingsMenuDropdownProps {
  election: SelectableElection;
  targetElement: ReactNode;
  onToggleFreezeClick: () => void;
  onMutateClick: () => void;
  onPublishResultsClick: () => void;
  onDeleteClick: () => void;
}

const ElectionsSettingsMenuDropdown = ({
  election,
  targetElement,
  onToggleFreezeClick,
  onMutateClick,
  onPublishResultsClick,
  onDeleteClick,
}: ElectionsSettingsMenuDropdownProps): JSX.Element => {
  const { t } = useTranslation();
  const resultsPublished = election.resultsPublishedAt !== undefined;
  const canPublishResults =
    election.configFrozen && !resultsPublished && dayjs(election.votingEndAt).isBefore(dayjs());

  let freezeIcon = null;
  let toggleFreezeText = null;
  if (election.configFrozen) {
    toggleFreezeText = t('unfreezeConfig', 'Unfreeze config');
    freezeIcon = <IconSnowflakeOff size={14} />;
  } else {
    toggleFreezeText = t('freezeConfig', 'Freeze config');
    freezeIcon = <IconSnowflake size={14} />;
  }

  return (
    <Menu position="bottom-end" offset={0}>
      <Menu.Target>{targetElement}</Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          disabled={resultsPublished}
          leftSection={freezeIcon}
          onClick={onToggleFreezeClick}
        >
          {toggleFreezeText}
        </Menu.Item>
        <Menu.Item
          disabled={election.configFrozen}
          leftSection={<IconEdit size={14} />}
          onClick={onMutateClick}
        >
          {t('editElection', 'Edit election')}
        </Menu.Item>
        <Menu.Item
          disabled={!canPublishResults}
          leftSection={<IconWorld size={14} />}
          onClick={onPublishResultsClick}
        >
          {t('publishResults', 'Publish results')}
        </Menu.Item>
        <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={onDeleteClick}>
          {t('deleteElection', 'Delete election')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export const ElectionsSettingsMenu = ({
  election,
  targetElement,
  onDelete,
  onMutate,
  onToggleFreeze,
  onPublishResults,
  isMutating,
}: ElectionsTableMenuProps): JSX.Element => {
  const { t } = useTranslation();
  const [deleteModalOpened, deleteModalActions] = useDisclosure(false);
  const [mutateModalOpened, mutateModalActions] = useDisclosure(false);
  const [toggleFreezeModalOpened, toggleFreezeModalActions] = useDisclosure(false);
  const [publishResultsModalOpened, publishResultsModalActions] = useDisclosure(false);

  return (
    <>
      <DeleteElectionModal
        election={election}
        opened={deleteModalOpened}
        onClose={deleteModalActions.close}
        onDelete={onDelete}
      />
      <MutateElectionDrawer
        election={election}
        opened={mutateModalOpened}
        title={t('editElection', 'Edit Election')}
        onMutate={onMutate}
        onClose={mutateModalActions.close}
        mutateButtonText={t('saveChanges', 'Save changes')}
        isMutating={isMutating}
      />
      <ToggleFreezeElectionModal
        election={election}
        opened={toggleFreezeModalOpened}
        onClose={toggleFreezeModalActions.close}
        onToggleFreeze={onToggleFreeze}
      />
      <PublishElectionResultsModal
        election={election}
        opened={publishResultsModalOpened}
        onClose={publishResultsModalActions.close}
        onPublishResults={onPublishResults}
      />
      <ElectionsSettingsMenuDropdown
        election={election}
        targetElement={targetElement}
        onToggleFreezeClick={toggleFreezeModalActions.open}
        onMutateClick={mutateModalActions.open}
        onPublishResultsClick={publishResultsModalActions.open}
        onDeleteClick={deleteModalActions.open}
      />
    </>
  );
};
