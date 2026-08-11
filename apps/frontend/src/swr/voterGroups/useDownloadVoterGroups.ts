import { notifications } from '@mantine/notifications';
import type { SelectableVoterGroup } from '@repo/votura-validators';
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react';
import { downloadJson } from '../../utils/downloadJson.ts';
import { getRPCErrorConfig } from '../../utils/notifications.ts';

export interface DownloadedVoterGroupTokens {
  name: SelectableVoterGroup['name'];
  numberOfVoters: SelectableVoterGroup['numberOfVoters'];
  generatedKeys: string[];
}

interface UseDownloadVoterGroupsReturn {
  selectedGroups: SelectableVoterGroup[];
  selectedGroupIds: Set<string>;
  downloadRequestId: number;
  downloadResults: Record<string, DownloadedVoterGroupTokens>;
  downloadError: string | null;
  isDownloading: boolean;
  confirmDownloadOpened: boolean;
  setConfirmDownloadOpened: Dispatch<SetStateAction<boolean>>;
  setDownloadResults: Dispatch<SetStateAction<Record<string, DownloadedVoterGroupTokens>>>;
  setDownloadError: Dispatch<SetStateAction<string | null>>;
  handleGroupToggle: (groupId: string) => void;
  resetDownloadState: () => void;
  startDownload: () => void;
  finishDownloadWithError: () => void;
}

export const useDownloadVoterGroups = (
  voterGroups: SelectableVoterGroup[],
  onClose: () => void,
): UseDownloadVoterGroupsReturn => {
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
    setSelectedGroupIds((current) => {
      const updated = new Set(current);

      if (updated.has(groupId)) {
        updated.delete(groupId);
      } else {
        updated.add(groupId);
      }

      return updated;
    });
  };
  const resetDownloadState = (): void => {
    setConfirmDownloadOpened(false);
    setSelectedGroupIds(new Set());
    setDownloadResults({});
    setDownloadRequestId(0);
    setIsDownloading(false);
  };

  const startDownload = (): void => {
    setDownloadResults({});
    setDownloadError(null);
    setIsDownloading(true);
    setDownloadRequestId((currentRequestId) => currentRequestId + 1);
  };

  const finishDownloadWithError = (): void => {
    setIsDownloading(false);
  };

  const downloadVoterTokensJson = (): void => {
    const downloadData = {
      exportDate: new Date().toISOString(),
      numberOfVoterGroups: selectedGroups.length,
      voterGroups: selectedGroups.map((group) => downloadResults[group.id]),
    };

    downloadJson(downloadData, `voter-tokens-export-${Date.now()}.json`);
  };

  const completeDownload = (): void => {
    downloadVoterTokensJson();
    resetDownloadState();
    onClose();
  };

  const handleDownloadFailed = (): void => {
    if (downloadError === null) {
      return;
    }

    notifications.show(getRPCErrorConfig(downloadError));
    finishDownloadWithError();
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

    completeDownload();
  }, [downloadError, downloadResults, isDownloading, selectedGroups]);

  return {
    selectedGroups,
    selectedGroupIds,
    downloadRequestId,
    downloadResults,
    downloadError,
    isDownloading,
    confirmDownloadOpened,
    setConfirmDownloadOpened,
    setDownloadResults,
    setDownloadError,
    handleGroupToggle,
    resetDownloadState,
    startDownload,
    finishDownloadWithError,
  };
};
