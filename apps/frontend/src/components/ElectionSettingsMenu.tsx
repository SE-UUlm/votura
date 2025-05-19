import { Menu } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { DeleteElectionModal, type DeleteElectionModalProps } from './DeleteElectionModal.tsx';
import type { MockElection } from '../store/useStore.ts';
import type { ReactNode } from 'react';
import { MutateElectionModal, type MutateElectionModalProps } from './MutateElectionModal.tsx';

export interface ElectionsTableMenuProps {
  election: MockElection;
  targetElement: ReactNode;
  onDelete: DeleteElectionModalProps['onDelete'];
  onMutate: MutateElectionModalProps['onMutate'];
}

export const ElectionsSettingsMenu = ({
  election,
  targetElement,
  onDelete,
  onMutate,
}: ElectionsTableMenuProps) => {
  const [deleteModalOpened, deleteModalActions] = useDisclosure(false);
  const [mutateModalOpened, mutateModalActions] = useDisclosure(false);

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
      <Menu position="bottom-end" offset={0}>
        <Menu.Target>{targetElement}</Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<IconEdit size={14} />} onClick={mutateModalActions.open}>
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
