import { Grid, Loader, Text, ThemeIcon } from '@mantine/core';
import type { SelectableElection } from '@repo/votura-validators';
import { IconBug } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { getUserIdFromAuthLocalStorage } from '../../../swr/authTokens.ts';
import { useGetUser } from '../../../swr/useGetUser.ts';
import { BooleanBadge } from '../../BooleanBadge.tsx';
import { ElectionAuthorField } from './ElectionAuthorField.tsx';
import { ElectionStatField } from './ElectionStatField.tsx';

export interface ElectionStatsProps {
  election: SelectableElection;
}

export const ElectionStats = ({ election }: ElectionStatsProps): JSX.Element => {
  const { t } = useTranslation();

  const loggedInUserId = getUserIdFromAuthLocalStorage();
  const { data: loggedInUser, isLoading, error } = useGetUser(loggedInUserId ?? '');

  if (error) {
    return (
      <ThemeIcon size="xl" color="red">
        <IconBug style={{ width: '70%', height: '70%' }} />
      </ThemeIcon>
    );
  }

  if (isLoading || loggedInUser === undefined) {
    return <Loader />;
  }

  const isAdmin = loggedInUser.role === 'admin';

  return (
    <Grid>
      <Grid.Col span={6}>
        <ElectionStatField
          title={t('description', 'Description')}
          content={
            <Text size={'sm'} lineClamp={3}>
              {election.description}
            </Text>
          }
        />
      </Grid.Col>
      <Grid.Col span={3}>
        <ElectionStatField
          title={t('frozen', 'Frozen')}
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
          <ElectionAuthorField election={election} />
        </Grid.Col>
      ) : null}
    </Grid>
  );
};
