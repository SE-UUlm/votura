import { Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { SelectableVoterGroup } from '@repo/votura-validators';
import { IconEdit, IconKey, IconTrash } from '@tabler/icons-react';
import { type JSX, type ReactNode, useState } from 'react';
import {
  DeleteVoterGroupModal,
  type DeleteVoterGroupModalProps,
} from './DeleteVoterGroupModal.tsx';
import {
  MutateVoterGroupDrawer,
  type MutateVoterGroupDrawerProps,
} from './MutateVoterGroupDrawer.tsx';
import { DownloadVoterTokensWarningModal } from './DownloadVoterTokensWarningModal.tsx';
import {useCreateVoterTokens} from "../swr/voterGroups/useCreateVoterTokens.ts";
import {notifications} from "@mantine/notifications";
import {getRPCErrorConfig} from "../utils/notifications.ts";

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
  const { trigger } = useCreateVoterTokens({ voterGroupId: voterGroup.id });
  const [deleteModalOpened, deleteModalActions] = useDisclosure(false);
  const [mutateModalOpened, mutateModalActions] = useDisclosure(false);
  const [confirmDownloadOpened, setConfirmDownloadOpened] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleOpenConfirm = (): void => {
    setConfirmDownloadOpened(true);
  };

  const handleConfirmClose = (): void => {
    setConfirmDownloadOpened(false);
  };

  const handleDownload = async (): Promise<void> => {
      try {
          setIsDownloading(true)
          const generatedKeys = await trigger(undefined);

          const downloadData = {
              exportDate: new Date().toISOString(),
              voterGroups: [
                  {
                      name: voterGroup.name,
                      generatedKeys,
                  },
              ],
          };

          const jsonString = JSON.stringify(downloadData, null, 2);
          const blob = new Blob([jsonString], {
              type: 'application/json',
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `voter-tokens-export-${Date.now()}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          setConfirmDownloadOpened(false);

      } catch (error) {
          notifications.show(
              getRPCErrorConfig(
                  error instanceof Error ? error.message : 'Unknown download error',
              ),
          );
      } finally {
          setIsDownloading(false);
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
      <Menu position="bottom-end" offset={0}>
        <Menu.Target>{targetElement}</Menu.Target>
        <Menu.Dropdown>
          <Menu.Item color="red" leftSection={<IconKey size={14} />} onClick={handleOpenConfirm}>
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
      <DownloadVoterTokensWarningModal
        opened={confirmDownloadOpened}
        onClose={handleConfirmClose}
        onConfirm={handleDownload}
        isLoading={isDownloading}
      ></DownloadVoterTokensWarningModal>
    </>
  );
};
