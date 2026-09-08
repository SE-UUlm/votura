import { useEffect, useRef } from 'react';
import { useCreateVoterTokens } from './useCreateVoterTokens';

export const useGenerateVoterGroupTokens = (
  voterGroupId: string,
  isSelected: boolean,
  isDownloading: boolean,
  downloadRequestId: number,
  onSuccess: (generatedKeys: string[]) => void,
  onError: (error: Error) => void,
): void => {
  const { trigger } = useCreateVoterTokens({
    voterGroupId,
  });

  const lastHandledRequestId = useRef<number>(0);

  useEffect(() => {
    if (!isSelected || !isDownloading || downloadRequestId === 0) {
      return;
    }

    if (lastHandledRequestId.current === downloadRequestId) {
      return;
    }

    lastHandledRequestId.current = downloadRequestId;

    const generate = async (): Promise<void> => {
      try {
        const generatedKeys = await trigger(undefined);
        onSuccess(generatedKeys);
      } catch (error: unknown) {
        onError(error instanceof Error ? error : new Error('Unknown download error'));
      }
    };

    void generate();
  }, [downloadRequestId, isDownloading, isSelected, onError, onSuccess, trigger]);
};
