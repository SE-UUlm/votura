import {
  Button,
  CopyButton,
  Group,
  Modal,
  type ModalProps,
  Space,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconCheck, IconCopy, IconDownload } from '@tabler/icons-react';
import type { SelectableVoterGroup } from '@repo/votura-validators';
import type { JSX } from 'react';

export interface VoterTokensModalProps {
  voterGroup: SelectableVoterGroup;
  tokens: string[] | null;
  opened: ModalProps['opened'];
  isLoading: boolean;
  error: Error | undefined;
  onClose: ModalProps['onClose'];
}

export const VoterTokensModal = ({
  voterGroup,
  tokens,
  opened,
  isLoading,
  error,
  onClose,
}: VoterTokensModalProps): JSX.Element => {
  const handleDownload = (): void => {
    if (!tokens || tokens.length === 0) return;

    const csvContent = [
      `Voter Group: ${voterGroup.name}`,
      `Generated: ${new Date().toISOString()}`,
      `Total Tokens: ${tokens.length}`,
      '',
      ...tokens,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `voter-tokens-${voterGroup.name}-${Date.now()}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Generated Voter Tokens"
      size="lg"
      centered
    >
      {error && (
        <>
          <Text c="red" size="sm" fw={500}>
            Error: {error.message}
          </Text>
          <Space h="md" />
        </>
      )}

      {isLoading && <Text>Generating voter tokens...</Text>}

      {tokens && tokens.length > 0 && !isLoading && (
        <>
            <Group justify="space-between" mb="md">
                <Text size="sm">
                    Generated {tokens.length} voter tokens for:{' '}
                    <Text component="span" fw={700}>
                        {voterGroup.name}
                    </Text>
                </Text>
                <Button
                    leftSection={<IconDownload size={16} />}
                    onClick={handleDownload}
                    disabled={!tokens || tokens.length === 0 || isLoading}
                >
                    Download Tokens
                </Button>
            </Group>
          <Stack gap="xs" mb="md">
            {tokens.map((token, index) => (
              <Group
                key={index}
                justify="space-between"
                wrap="nowrap"
                bg="gray.1"
                p="sm"
                style={{ borderRadius: 'var(--mantine-radius-sm)' }}
              >
                <Text size="xs" style={{ wordBreak: 'break-all', flex: 1 }}>
                  {token}
                </Text>
                <CopyButton value={token} timeout={2000}>
                  {({ copied, copy }) => (
                    <Tooltip
                      label={copied ? 'Copied' : 'Copy'}
                      withArrow
                      position="left"
                    >
                      <Button
                        color={copied ? 'teal' : 'gray'}
                        variant="subtle"
                        size="xs"
                        onClick={copy}
                        leftSection={
                          copied ? <IconCheck size={14} /> : <IconCopy size={14} />
                        }
                      />
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
            ))}
          </Stack>
          <Text size="xs" c="dimmed">
            These tokens can be used to authenticate voters. Store them securely for later use.
          </Text>
        </>
      )}

      <Space h="md" />
      <Group justify="flex-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </Group>
    </Modal>
  );
};

