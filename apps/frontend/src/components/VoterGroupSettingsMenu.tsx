import { Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { SelectableVoterGroup } from '@repo/votura-validators';
import { IconEdit, IconKey, IconTrash } from '@tabler/icons-react';
import type { JSX, ReactNode } from 'react';
import {
  DeleteVoterGroupModal,
  type DeleteVoterGroupModalProps,
} from './DeleteVoterGroupModal.tsx';
import {
  MutateVoterGroupDrawer,
  type MutateVoterGroupDrawerProps,
} from './MutateVoterGroupDrawer.tsx';

export interface VoterGroupsTableMenuProps {
  voterGroup: SelectableVoterGroup;
  targetElement: ReactNode;
  onDelete: DeleteVoterGroupModalProps['onDelete'];
  onMutate: MutateVoterGroupDrawerProps['onMutate'];
  isMutating: MutateVoterGroupDrawerProps['isMutating'];
}

export const VoterGroupsSettingsMenu = ({
  voterGroup,
  targetElement,
  onDelete,
  onMutate,
  isMutating,
}: VoterGroupsTableMenuProps): JSX.Element => {
  const [deleteModalOpened, deleteModalActions] = useDisclosure(false);
  const [mutateModalOpened, mutateModalActions] = useDisclosure(false);

  return (
    <>
      <DeleteVoterGroupModal
        voterGroup={voterGroup}
        opened={deleteModalOpened}
        onClose={deleteModalActions.close}
        onDelete={onDelete}
      />
      <MutateVoterGroupDrawer
        voterGroup={voterGroup}
        opened={mutateModalOpened}
        title={'Edit Voter Group'}
        onMutate={onMutate}
        onClose={mutateModalActions.close}
        mutateButtonText={'Save changes'}
        isMutating={isMutating}
      />
      <Menu position="bottom-end" offset={0}>
        <Menu.Target>{targetElement}</Menu.Target>
        <Menu.Dropdown>
          <Menu.Item color="red" leftSection={<IconKey size={14} />}>
            Generate/Delete voter tokens
          </Menu.Item>
          <Menu.Item
            disabled={isMutating}
            leftSection={<IconEdit size={14} />}
            onClick={mutateModalActions.open}
          >
            Edit voter group
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={deleteModalActions.open}
          >
            Delete voter group
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
};
