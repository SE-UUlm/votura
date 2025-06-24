import { Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { SelectableElection } from '@repo/votura-validators';
import { IconEdit, IconSnowflake, IconSnowflakeOff, IconTrash } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { DeleteElectionModal, type DeleteElectionModalProps } from './DeleteElectionModal.tsx';
import { MutateElectionModal, type MutateElectionModalProps } from './MutateElectionModal.tsx';
import {
  ToggleFreezeElectionModal,
  type ToggleFreezeElectionModalProps,
} from './ToggleFreezeElectionModal.tsx';

export interface ElectionsTableMenuProps {
  election: SelectableElection;
  targetElement: ReactNode;
  onDelete: DeleteElectionModalProps['onDelete'];
  onMutate: MutateElectionModalProps['onMutate'];
  onToggleFreeze: ToggleFreezeElectionModalProps['onToggleFreeze'];
}

export const ElectionsSettingsMenu = ({
  election,
  targetElement,
  onDelete,
  onMutate,
  onToggleFreeze,
}: ElectionsTableMenuProps) => {
  const [deleteModalOpened, deleteModalActions] = useDisclosure(false);
  const [mutateModalOpened, mutateModalActions] = useDisclosure(false);
  const [toggleFreezeModalOpened, toggleFreezeModalActions] = useDisclosure(false);

  const freezeIcon = election.configFrozen ? (
    <IconSnowflakeOff size={14} />
  ) : (
    <IconSnowflake size={14} />
  );

  const toggleFreezeText = election.configFrozen ? 'Unfreeze config' : 'Freeze config';

  return (
    <>
      <DeleteElectionModal
        election={election}
        opened={deleteModalOpened}
        onClose={deleteModalActions.close}
        onDelete={onDelete}
      />
      <MutateElectionModal
        election={election}
        opened={mutateModalOpened}
        title={'Edit Election'}
        onMutate={onMutate}
        onClose={mutateModalActions.close}
        mutateButtonText={'Save changes'}
      />
      <ToggleFreezeElectionModal
        election={election}
        opened={toggleFreezeModalOpened}
        onClose={toggleFreezeModalActions.close}
        onToggleFreeze={onToggleFreeze}
      />
      <Menu position="bottom-end" offset={0}>
        <Menu.Target>{targetElement}</Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={freezeIcon} onClick={toggleFreezeModalActions.open}>
            {toggleFreezeText}
          </Menu.Item>
          <Menu.Item
            disabled={election.configFrozen}
            leftSection={<IconEdit size={14} />}
            onClick={mutateModalActions.open}
          >
            Edit election
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={deleteModalActions.open}
          >
            Delete election
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
};
