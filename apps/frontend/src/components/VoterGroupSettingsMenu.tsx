import { Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { SelectableVoterGroup } from '@repo/votura-validators';
import { IconEdit, IconKey, IconTrash } from '@tabler/icons-react';
import type { JSX, ReactNode } from 'react';
import { useCreateVoterTokens } from '../swr/voterGroups/useCreateVoterTokens.ts';
import {
  DeleteVoterGroupModal,
  type DeleteVoterGroupModalProps,
} from './DeleteVoterGroupModal.tsx';
import {
  MutateVoterGroupDrawer,
  type MutateVoterGroupDrawerProps,
} from './MutateVoterGroupDrawer.tsx';
import { VoterTokensModal } from './VoterTokensModal.tsx';

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
  const [tokensModalOpened, tokensModalActions] = useDisclosure(false);

  const {
    trigger: createTokensTrigger,
    isMutating: isCreatingTokens,
    data: tokens,
    error: tokensError,
  } = useCreateVoterTokens({
    voterGroupId: voterGroup.id,
  });

  const handleGenerateTokens = async (): Promise<void> => {
    try {
      await createTokensTrigger();
      tokensModalActions.open();
    } catch (error) {
      // Error is handled by the hook and displayed in the modal
      tokensModalActions.open();
    }
  };

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
      <VoterTokensModal
        voterGroup={voterGroup}
        tokens={tokens!}
        opened={tokensModalOpened}
        isLoading={isCreatingTokens}
        error={tokensError}
        onClose={tokensModalActions.close}
      />
      <Menu position="bottom-end" offset={0}>
        <Menu.Target>{targetElement}</Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            disabled={isCreatingTokens}
            color="red"
            leftSection={<IconKey size={14} />}
            onClick={handleGenerateTokens}
          >
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
