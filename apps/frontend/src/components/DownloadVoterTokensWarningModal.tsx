import { Button, Group, Modal, type ModalProps, Stack, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import type { JSX, MouseEventHandler } from 'react';

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
  const handleClose = (): void => {
    if (isLoading) {
      return;
    }
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title={'Warning'} centered>
      <Group align="flex-start" gap={'md'}>
        <IconAlertTriangle size={24} color="red" />
        <Stack gap={4}>
          <Text fw={700}>This will generate new voter tokens.</Text>
          <Text size={'sm'} c={'dimmed'}>
            Generating voter tokens will update the voter group public key. Continue only if you
            want to download the newly generated JSON file now.
          </Text>
        </Stack>
      </Group>
      <Group justify="flex-end" mt={'lg'}>
        <Button variant="outline" onClick={handleClose} disabled={isLoading}>
          No
        </Button>
        <Button variant="filled" color="red" onClick={onConfirm} loading={isLoading}>
          Yes, download
        </Button>
      </Group>
    </Modal>
  );
};

