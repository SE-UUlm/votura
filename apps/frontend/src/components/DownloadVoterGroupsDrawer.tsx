import { Box, Button, Checkbox, Drawer, Group, type ModalProps, Stack, Text } from '@mantine/core';
import type { SelectableVoterGroup } from '@repo/votura-validators';
import type { JSX } from 'react';
import {
  type DownloadedVoterGroupTokens,
  useDownloadVoterGroups,
} from '../swr/voterGroups/useDownloadVoterGroups.ts';
import { useGenerateVoterGroupTokens } from '../swr/voterGroups/useGenerateVoterTokens.ts';
import { DownloadVoterTokensWarningModal } from './DownloadVoterTokensWarningModal.tsx';

interface DownloadableVoterGroupCheckboxProps {
  voterGroup: SelectableVoterGroup;
  isSelected: boolean;
  isDownloading: boolean;
  downloadRequestId: number;
  onToggle: (groupId: SelectableVoterGroup['id']) => void;
  onTokensGenerated: (
    groupId: SelectableVoterGroup['id'],
    tokens: DownloadedVoterGroupTokens,
  ) => void;
  onDownloadError: (groupName: SelectableVoterGroup['name'], error: Error) => void;
}
const DownloadableVoterGroupCheckbox = ({
  voterGroup,
  isSelected,
  isDownloading,
  downloadRequestId,
  onToggle,
  onTokensGenerated,
  onDownloadError,
}: DownloadableVoterGroupCheckboxProps): JSX.Element => {
  useGenerateVoterGroupTokens(
    voterGroup.id,
    isSelected,
    isDownloading,
    downloadRequestId,
    (generatedKeys) => {
      onTokensGenerated(voterGroup.id, {
        name: voterGroup.name,
        numberOfVoters: voterGroup.numberOfVoters,
        generatedKeys,
      });
    },
    (error) => {
      onDownloadError(voterGroup.name, error);
    },
  );

  return (
    <Checkbox
      label={voterGroup.name}
      checked={isSelected}
      disabled={isDownloading}
      onChange={(): void => {
        onToggle(voterGroup.id);
      }}
    />
  );
};
export interface DownloadVoterGroupsDrawerProps {
  voterGroups: SelectableVoterGroup[];
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  title: ModalProps['title'];
}

export const DownloadVoterGroupsDrawer = ({
  voterGroups,
  opened,
  onClose,
  title,
}: DownloadVoterGroupsDrawerProps): JSX.Element => {
  const {
    selectedGroups,
    selectedGroupIds,
    downloadRequestId,
    isDownloading,
    confirmDownloadOpened,
    setConfirmDownloadOpened,
    setDownloadResults,
    setDownloadError,
    handleGroupToggle,
    resetDownloadState,
    startDownload,
  } = useDownloadVoterGroups(voterGroups, onClose);

  const handleDownload = (): void => {
    if (selectedGroups.length === 0 || isDownloading) {
      return;
    }

    startDownload();
  };

  const handleOpenConfirm = (): void => {
    if (selectedGroups.length === 0 || isDownloading) {
      return;
    }

    setConfirmDownloadOpened(true);
  };

  const handleConfirmClose = (): void => {
    if (isDownloading) {
      return;
    }

    setConfirmDownloadOpened(false);
  };

  const handleClose = (): void => {
    if (isDownloading) {
      return;
    }

    resetDownloadState();
    setDownloadError(null);
    onClose();
  };
  const handleTokensGenerated = (
    groupId: SelectableVoterGroup['id'],
    tokens: DownloadedVoterGroupTokens,
  ): void => {
    setDownloadResults((currentResults) => ({
      ...currentResults,
      [groupId]: tokens,
    }));
  };

  const handleDownloadError = (groupName: SelectableVoterGroup['name'], error: Error): void => {
    setDownloadError(`Failed to generate voter tokens for "${groupName}": ${error.message}`);
  };

  return (
    <>
      <Drawer.Root
        opened={opened}
        onClose={handleClose}
        position={'right'}
        offset={16}
        radius={'md'}
      >
        <Drawer.Overlay />
        <Drawer.Content data-testid="download-voter-groups-drawer">
          <Stack justify={'space-between'} h={'100%'}>
            <Box>
              <Drawer.Header>
                <Drawer.Title>{title}</Drawer.Title>
                <Drawer.CloseButton />
              </Drawer.Header>
              <Drawer.Body>
                <Stack>
                  {voterGroups.length > 0 ? (
                    voterGroups.map((group) => (
                      <DownloadableVoterGroupCheckbox
                        key={group.id}
                        voterGroup={group}
                        isSelected={selectedGroupIds.has(group.id)}
                        isDownloading={isDownloading}
                        downloadRequestId={downloadRequestId}
                        onToggle={handleGroupToggle}
                        onTokensGenerated={handleTokensGenerated}
                        onDownloadError={handleDownloadError}
                      />
                    ))
                  ) : (
                    <Text size={'sm'} c={'dimmed'}>
                      No voter groups available
                    </Text>
                  )}
                </Stack>
              </Drawer.Body>
            </Box>
            <Group justify="flex-end" m={'md'}>
              <Button variant="outline" onClick={handleClose} disabled={isDownloading}>
                Cancel
              </Button>
              <Button
                variant="filled"
                onClick={handleOpenConfirm}
                disabled={selectedGroups.length === 0 || isDownloading}
              >
                Download Tokens
              </Button>
            </Group>
          </Stack>
        </Drawer.Content>
      </Drawer.Root>
      <DownloadVoterTokensWarningModal
        opened={confirmDownloadOpened}
        onClose={handleConfirmClose}
        onConfirm={handleDownload}
        isLoading={isDownloading}
      ></DownloadVoterTokensWarningModal>
    </>
  );
};
