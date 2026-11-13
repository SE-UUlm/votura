import {
  Alert,
  Box,
  Button,
  type ComboboxItem,
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
import {
  getChangeElectionAuthorErrorConfig,
  getChangeElectionAuthorSuccessConfig,
} from '../utils/notifications.ts';
import { Avatar } from './Avatar.tsx';

export interface ChangeElectionAuthorModalProps {
  election: SelectableElection;
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  currentAuthor?: SelectableUser;
}

const compareByCreatedAt = (a: SelectableUser, b: SelectableUser): number => {
  if (a.createdAt < b.createdAt) {
    return -1;
  }
  if (a.createdAt > b.createdAt) {
    return 1;
  }
  return 0;
};

const toUserOptions = (users: SelectableUser[] | undefined): ComboboxItem[] =>
  [...(users ?? [])].sort(compareByCreatedAt).map((user) => ({
    value: user.id,
    label: user.email,
  }));

const renderUserOption: SelectProps['renderOption'] = ({ option }) => (
  <Group gap="sm" wrap="nowrap">
    <Box w={38} h={38} style={{ flexShrink: 0 }}>
      <Avatar userId={option.value} email={option.label} />
    </Box>
    <Text size="sm" lineClamp={1}>
      {option.label}
    </Text>
  </Group>
);

const FrozenElectionAlert = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Alert color="red" icon={<IconAlertCircle size={16} />} title={t('important', 'Important')}>
      {t(
        'electionIsFrozenCannotChangeAuthor',
        'The election configuration is frozen. The author cannot be changed while the configuration is frozen.',
      )}
    </Alert>
  );
};

interface CurrentAuthorProps {
  election: SelectableElection;
  currentAuthor: SelectableUser | undefined;
}

const CurrentAuthor = ({ election, currentAuthor }: CurrentAuthorProps): JSX.Element => {
  const { t } = useTranslation();

  return (
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
  );
};

interface AuthorSelection {
  selectedUserId: string | null;
  setSelectedUserId: (userId: string | null) => void;
  handleSubmit: () => Promise<void>;
  isMutating: boolean;
}

const useAuthorSelection = (
  election: SelectableElection,
  opened: boolean,
  onClose: () => void,
): AuthorSelection => {
  const { trigger: updateElection, isMutating } = useUpdateElection(election.id);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    election.electionCreatorId ?? null,
  );

  useEffect(() => {
    if (opened) {
      setSelectedUserId(election.electionCreatorId ?? null);
    }
  }, [opened, election.electionCreatorId]);

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
      notifications.show(getChangeElectionAuthorSuccessConfig());
      onClose();
    } catch {
      notifications.show(getChangeElectionAuthorErrorConfig());
    }
  };

  return { selectedUserId, setSelectedUserId, handleSubmit, isMutating };
};

export const ChangeElectionAuthorModal = ({
  election,
  opened,
  onClose,
  currentAuthor,
}: ChangeElectionAuthorModalProps): JSX.Element => {
  const { t } = useTranslation();
  const { data: users, isLoading: isLoadingUsers } = useGetUsers({ skipFetch: !opened });
  const { selectedUserId, setSelectedUserId, handleSubmit, isMutating } = useAuthorSelection(
    election,
    opened,
    onClose,
  );

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
        {isFrozen ? <FrozenElectionAlert /> : null}
        <CurrentAuthor election={election} currentAuthor={currentAuthor} />
        {isLoadingUsers ? (
          <Group justify="center" py="md">
            <Loader size="sm" />
          </Group>
        ) : (
          <Select
            label={t('newAuthor', 'New author')}
            placeholder={t('selectUser', 'Select a user')}
            data={toUserOptions(users)}
            value={selectedUserId}
            onChange={setSelectedUserId}
            searchable
            clearable={false}
            renderOption={renderUserOption}
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
