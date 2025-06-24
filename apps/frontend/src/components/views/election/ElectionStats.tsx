import { Grid, Text } from '@mantine/core';
import type { SelectableElection } from '@repo/votura-validators';
import { BooleanBadge } from '../../BooleanBadge.tsx';
import { ElectionStatField } from './ElectionStatField.tsx';

export interface ElectionStatsProps {
  election: SelectableElection;
}

export const ElectionStats = ({ election }: ElectionStatsProps) => {
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
          title={'Invalid voted allowed'}
          content={<BooleanBadge isTrue={election.allowInvalidVotes} />}
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <ElectionStatField
          title={'Start of voting'}
          content={
            <Text size={'sm'}>{new Date(election.votingStartAt).toLocaleString('en-US')}</Text>
          }
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <ElectionStatField
          title={'End of voting'}
          content={
            <Text size={'sm'}>{new Date(election.votingEndAt).toLocaleString('en-US')}</Text>
          }
        />
      </Grid.Col>
    </Grid>
  );
};
