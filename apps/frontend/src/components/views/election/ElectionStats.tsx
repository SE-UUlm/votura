import { Grid, Text } from '@mantine/core';
import type { SelectableElection } from '@repo/votura-validators';
import dayjs from 'dayjs';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { BooleanBadge } from '../../BooleanBadge.tsx';
import { ElectionStatField } from './ElectionStatField.tsx';

export interface ElectionStatsProps {
  election: SelectableElection;
}

export const ElectionStats = ({ election }: ElectionStatsProps): JSX.Element => {
  const { t } = useTranslation();
  return (
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
      <Grid.Col span={6}>
        <ElectionStatField
          title={t('startOfVoting', 'Start of voting')}
          content={<Text size={'sm'}>{dayjs(election.votingStartAt).format('lll')}</Text>}
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <ElectionStatField
          title={t('endOfVoting', 'End of voting')}
          content={<Text size={'sm'}>{dayjs(election.votingEndAt).format('lll')}</Text>}
        />
      </Grid.Col>
    </Grid>
  );
};
