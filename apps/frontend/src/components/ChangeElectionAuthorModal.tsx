import {
  Alert,
  Box,
  Button,
  Group,
  Loader,
  Modal,
  type ModalProps,
  Select,
  type SelectProps,
  Stack,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { SelectableElection, SelectableUser } from '@repo/votura-validators';
import { IconAlertCircle } from '@tabler/icons-react';
import { type JSX, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateElection } from '../swr/elections/useUpdateElection.ts';
import { useGetUsers } from '../swr/useGetUsers.ts';
import { Avatar } from './Avatar.tsx';

export interface ChangeElectionAuthorModalProps {
  election: SelectableElection;
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  currentAuthor?: SelectableUser;
}

export const ChangeElectionAuthorModal = ({
  election,
  opened,
  onClose,
  currentAuthor,
}: ChangeElectionAuthorModalProps): JSX.Element => {
  const { t } = useTranslation();
  const { data: users, isLoading: isLoadingUsers } = useGetUsers({ skipFetch: !opened });
  const { trigger: updateElection, isMutating } = useUpdateElection(election.id);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    election.electionCreatorId ?? null,
  );

  useEffect(() => {
    if (opened) {
      setSelectedUserId(election.electionCreatorId ?? null);
    }
  }, [opened, election.electionCreatorId]);

  const selectData =
    users
      ?.sort((a, b) => {
        const aCreated = a.createdAt;
        const bCreated = b.createdAt;
        if (aCreated < bCreated) {
          return -1;
        } else if (aCreated > bCreated) {
          return 1;
        }

        return 0;
      })
      .map((user) => ({
        value: user.id,
        label: user.email,
      })) ?? [];

  const renderSelectOption: SelectProps['renderOption'] = ({ option }) => {
    const user = users?.find((u) => u.id === option.value);
    return (
      <Group gap="sm" wrap="nowrap">
        <Box w={38} h={38} style={{ flexShrink: 0 }}>
          <Avatar userId={option.value} email={user?.email ?? option.label} />
        </Box>
        <Text size="sm" lineClamp={1}>
          {option.label}
        </Text>
      </Group>
    );
  };

  const handleSubmit = async (): Promise<void> => {
    if (!selectedUserId || selectedUserId === election.electionCreatorId) {
      return;
    }

    try {
      await updateElection({
        name: election.name,
        ...(election.description ? { description: election.description } : {}),
        votingStartAt: election.votingStartAt,
        votingEndAt: election.votingEndAt,
        allowInvalidVotes: election.allowInvalidVotes,
        private: election.private,
        electionCreatorId: selectedUserId,
      });

      notifications.show({
        title: t('success', 'Success'),
        message: t(
          'electionAuthorChangedSuccessfully',
          'Election author was changed successfully.',
        ),
        color: 'green',
      });
      onClose();
    } catch {
      notifications.show({
        title: t('error', 'Error'),
        message: t('failedToChangeElectionAuthor', 'Failed to change election creator.'),
        color: 'red',
      });
    }
  };

  const isFrozen = election.configFrozen;
  const isSameAuthor = selectedUserId === election.electionCreatorId;
  const isSubmitDisabled = isMutating || !selectedUserId || isSameAuthor || isFrozen;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('changeElectionAuthor', 'Change election author')}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t(
            'changeElectionAuthorDescription',
            'Select a new author for this election. Only the author and the administrators are able to see and edit an election.',
          )}
        </Text>

        {isFrozen ? (
          <Alert
            color="red"
            icon={<IconAlertCircle size={16} />}
            title={t('important', 'Important')}
          >
            {t(
              'electionIsFrozenCannotCheangeAuthor',
              'The election configuration is frozen. The author cannot be changed while the configuration is frozen.',
            )}
          </Alert>
        ) : null}

        <Box>
          <Text size="xs" fw={500} c="dimmed" mb={4}>
            {t('currentAuthor', 'Current author')}
          </Text>
          <Group gap="xs" wrap="nowrap">
            <Box w={38} h={38} style={{ flexShrink: 0 }}>
              <Avatar
                userId={currentAuthor?.id ?? election.electionCreatorId}
                email={currentAuthor?.email ?? ''}
              />
            </Box>
            <Text size="sm">{currentAuthor?.email ?? election.electionCreatorId}</Text>
          </Group>
        </Box>

        {isLoadingUsers ? (
          <Group justify="center" py="md">
            <Loader size="sm" />
          </Group>
        ) : (
          <Select
            label={t('newAuthor', 'New author')}
            placeholder={t('selectUser', 'Select a user')}
            data={selectData}
            value={selectedUserId}
            onChange={setSelectedUserId}
            searchable
            clearable={false}
            renderOption={renderSelectOption}
            disabled={isFrozen || isMutating}
          />
        )}

        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose} disabled={isMutating}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button
            variant="filled"
            onClick={handleSubmit}
            loading={isMutating}
            disabled={isSubmitDisabled}
          >
            {t('saveChanges', 'Save changes')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
