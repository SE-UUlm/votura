import { Box, Button, Checkbox, Drawer, Group, type ModalProps, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { SelectableVoterGroup } from '@repo/votura-validators';
import { type JSX, useEffect, useMemo, useRef, useState } from 'react';
import { useCreateVoterTokens } from '../swr/voterGroups/useCreateVoterTokens.ts';
import { getRPCErrorConfig } from '../utils/notifications.ts';
import { DownloadVoterTokensWarningModal } from './DownloadVoterTokensWarningModal.tsx';

interface DownloadedVoterGroupTokens {
  name: SelectableVoterGroup['name'];
  numberOfVoters: SelectableVoterGroup['numberOfVoters'];
  generatedKeys: string[];
}

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
  const { trigger } = useCreateVoterTokens({ voterGroupId: voterGroup.id });
  const lastHandledRequestId = useRef<number>(0);
  const normalizeDownloadError = (error: unknown): Error => {
    if (error instanceof Error) {
      return error;
    }

    return new Error('Unknown download error');
  };
  const generateTokens = async (): Promise<void> => {
    try {
      const generatedKeys = await trigger(undefined);

      onTokensGenerated(voterGroup.id, {
        name: voterGroup.name,
        numberOfVoters: voterGroup.numberOfVoters,
        generatedKeys,
      });
    } catch (error: unknown) {
      onDownloadError(voterGroup.name, normalizeDownloadError(error));
    }
  };

  useEffect(() => {
    if (!isSelected || !isDownloading || downloadRequestId === 0) {
      return;
    }

    if (lastHandledRequestId.current === downloadRequestId) {
      return;
    }

    lastHandledRequestId.current = downloadRequestId;

    void generateTokens();
  }, [downloadRequestId, isDownloading, isSelected]);

  return (
    <Checkbox
      key={voterGroup.id}
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
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const [downloadRequestId, setDownloadRequestId] = useState(0);
  const [downloadResults, setDownloadResults] = useState<
    Record<string, DownloadedVoterGroupTokens>
  >({});
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [confirmDownloadOpened, setConfirmDownloadOpened] = useState(false);

  const selectedGroups = useMemo(
    () => voterGroups.filter((group) => selectedGroupIds.has(group.id)),
    [selectedGroupIds, voterGroups],
  );

  const handleGroupToggle = (groupId: string): void => {
    const newSelected = new Set(selectedGroupIds);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroupIds(newSelected);
  };

  const handleDownload = (): void => {
    if (selectedGroups.length === 0 || isDownloading) {
      return;
    }

    setDownloadResults({});
    setDownloadError(null);
    setIsDownloading(true);
    setDownloadRequestId((currentRequestId) => currentRequestId + 1);
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

  const downloadVoterTokensJson = (): void => {
    const downloadData = {
      exportDate: new Date().toISOString(),
      numberOfVoterGroups: selectedGroups.length,
      voterGroups: selectedGroups.map((group) => downloadResults[group.id]),
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
  };

  const resetDownloadState = (): void => {
    setConfirmDownloadOpened(false);
    setSelectedGroupIds(new Set());
    setDownloadResults({});
    setDownloadRequestId(0);
    setIsDownloading(false);
  };

  const handleDownloadCompleted = (): void => {
    downloadVoterTokensJson();
    resetDownloadState();
    onClose();
  };

  const handleDownloadFailed = (): void => {
    if (downloadError === null) {
      return;
    }

    notifications.show(getRPCErrorConfig(downloadError));
    setIsDownloading(false);
  };

  useEffect(() => {
    if (!isDownloading) {
      return;
    }

    if (downloadError !== null) {
      handleDownloadFailed();
      return;
    }

    if (selectedGroups.length === 0) {
      return;
    }

    if (Object.keys(downloadResults).length !== selectedGroups.length) {
      return;
    }

    handleDownloadCompleted();
  }, [downloadError, downloadResults, isDownloading, selectedGroups]);
  const handleClose = (): void => {
    if (isDownloading) {
      return;
    }

    setConfirmDownloadOpened(false);
    setSelectedGroupIds(new Set());
    setDownloadResults({});
    setDownloadError(null);
    setDownloadRequestId(0);
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
