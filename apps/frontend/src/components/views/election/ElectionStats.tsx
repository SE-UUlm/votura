import { Grid, Loader, NavLink, Text, ThemeIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { SelectableElection } from '@repo/votura-validators';
import { IconBug } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { getUserIdFromAuthLocalStorage } from '../../../swr/authTokens.ts';
import { useGetUser } from '../../../swr/useGetUser.ts';
import { Avatar } from '../../Avatar.tsx';
import { BooleanBadge } from '../../BooleanBadge.tsx';
import { ChangeElectionAuthorModal } from '../../ChangeElectionAuthorModal.tsx';
import { ElectionStatField } from './ElectionStatField.tsx';

export interface ElectionStatsProps {
  election: SelectableElection;
}

export const ElectionStats = ({ election }: ElectionStatsProps): JSX.Element => {
  const { t } = useTranslation();
  const [authorModalOpened, authorModalActions] = useDisclosure(false);

  const loggedInUserId = getUserIdFromAuthLocalStorage();
  const {
    data: loggedInUser,
    isLoading: isLoadingLoggedInUser,
    error: loggedInUserError,
  } = useGetUser(loggedInUserId ?? '');
  const {
    data: electionAuthor,
    isLoading: isLoadingAuthor,
    error: authorError,
  } = useGetUser(election.electionCreatorId);

  if (
    isLoadingLoggedInUser ||
    isLoadingAuthor ||
    loggedInUser === undefined ||
    electionAuthor === undefined
  ) {
    return <Loader />;
  }

  if (loggedInUserError || authorError) {
    return (
      <ThemeIcon size="xl" color="red">
        <IconBug style={{ width: '70%', height: '70%' }} />
      </ThemeIcon>
    );
  }

  const isAdmin = loggedInUser?.role === 'admin';

  return (
    <>
      <ChangeElectionAuthorModal
        election={election}
        opened={authorModalOpened}
        onClose={authorModalActions.close}
        currentAuthor={electionAuthor}
      />
      <Grid>
        <Grid.Col span={6}>
          <ElectionStatField
            title={'Description'}
            content={
              <Text size={'sm'} lineClamp={3}>
                {election.description}
              </Text>
            }
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <ElectionStatField
            title={'Frozen'}
            content={<BooleanBadge isTrue={election.configFrozen} />}
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <ElectionStatField
            title={t('invalidVotesAllowed', 'Invalid votes allowed')}
            content={<BooleanBadge isTrue={election.allowInvalidVotes} />}
          />
        </Grid.Col>
        <Grid.Col span={isAdmin ? 4 : 6}>
          <ElectionStatField
            title={t('startOfVoting', 'Start of voting')}
            content={<Text size={'sm'}>{dayjs(election.votingStartAt).format('lll')}</Text>}
          />
        </Grid.Col>
        <Grid.Col span={isAdmin ? 4 : 6}>
          <ElectionStatField
            title={t('endOfVoting', 'End of voting')}
            content={<Text size={'sm'}>{dayjs(election.votingEndAt).format('lll')}</Text>}
          />
        </Grid.Col>
        {isAdmin ? (
          <Grid.Col span={4}>
            <ElectionStatField
              title={t('electionAuthor', 'Election author')}
              content={
                <NavLink
                  variant="light"
                  onClick={authorModalActions.open}
                  label={electionAuthor?.email ?? election.electionCreatorId}
                  leftSection={
                    <Avatar
                      userId={electionAuthor?.id ?? election.electionCreatorId}
                      email={electionAuthor?.email ?? ''}
                    />
                  }
                  styles={{
                    root: {
                      borderRadius: 'var(--mantine-radius-sm)',
                      padding: '4px 8px',
                    },
                  }}
                />
              }
            />
          </Grid.Col>
        ) : null}
      </Grid>
    </>
  );
};
