import { Box, Loader, NavLink, ThemeIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { SelectableElection } from '@repo/votura-validators';
import { IconBug } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetUser } from '../../../swr/useGetUser.ts';
import { Avatar } from '../../Avatar.tsx';
import { ChangeElectionAuthorModal } from '../../ChangeElectionAuthorModal.tsx';
import { ElectionStatField } from './ElectionStatField.tsx';

export interface ElectionAuthorFieldProps {
  election: SelectableElection;
}

export const ElectionAuthorField = ({ election }: ElectionAuthorFieldProps): JSX.Element => {
  const { t } = useTranslation();
  const [authorModalOpened, authorModalActions] = useDisclosure(false);
  const { data: electionAuthor, isLoading, error } = useGetUser(election.electionCreatorId);

  let content: JSX.Element;
  if (error) {
    content = (
      <ThemeIcon size="xl" color="red">
        <IconBug style={{ width: '70%', height: '70%' }} />
      </ThemeIcon>
    );
  } else if (isLoading || electionAuthor === undefined) {
    content = <Loader />;
  } else {
    content = (
      <>
        <ChangeElectionAuthorModal
          election={election}
          opened={authorModalOpened}
          onClose={authorModalActions.close}
          currentAuthor={electionAuthor}
        />
        <NavLink
          variant="light"
          onClick={authorModalActions.open}
          label={electionAuthor.email}
          leftSection={
            <Box w={38} h={38} style={{ flexShrink: 0 }}>
              <Avatar userId={electionAuthor.id} email={electionAuthor.email} />
            </Box>
          }
          styles={{
            root: {
              borderRadius: 'var(--mantine-radius-sm)',
              padding: '4px 8px',
            },
          }}
        />
      </>
    );
  }

  return <ElectionStatField title={t('electionAuthor', 'Election author')} content={content} />;
};
