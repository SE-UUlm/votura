import { Button, Group, Modal, type ModalProps, Stack, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import type { JSX, MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

export interface DownloadVoterTokensWarningModalProps {
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  onConfirm: MouseEventHandler<HTMLButtonElement>;
  isLoading?: boolean;
}

export const DownloadVoterTokensWarningModal = ({
  opened,
  onClose,
  onConfirm,
  isLoading = false,
}: DownloadVoterTokensWarningModalProps): JSX.Element => {
  const { t } = useTranslation();
  const handleClose = (): void => {
    if (isLoading) {
      return;
    }
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title={t('warning', 'Warning')} centered>
      <Group align="flex-start" gap={'md'}>
        <IconAlertTriangle size={24} color="red" />
        <Text fw={700}>
          {t('thisWillGenerateNewVoterTokens', 'This will generate new voter tokens.')}
        </Text>
        <Stack gap={4}>
          <Text size={'sm'} c={'dimmed'}>
            {t(
              'generatingNewVoterTokensWillInvalidateAllExistingTokensProceedOnlyIfYouWantToDownloadTheNewJsonFileNow',
              'Generating new voter tokens will invalidate all existing tokens. Proceed only if you want to download the new JSON file now.',
            )}
          </Text>
        </Stack>
      </Group>
      <Group justify="flex-end" mt={'lg'}>
        <Button variant="outline" onClick={handleClose} disabled={isLoading}>
          {t('no', 'No')}
        </Button>
        <Button variant="filled" color="red" onClick={onConfirm} loading={isLoading}>
          {t('yesDownload', 'Yes, download')}
        </Button>
      </Group>
    </Modal>
  );
};
