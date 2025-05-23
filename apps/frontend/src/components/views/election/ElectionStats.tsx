import type { MockElection } from '../../../store/useStore.ts';
import { Grid, Text } from '@mantine/core';
import { ElectionStatField } from './ElectionStatField.tsx';
import { BooleanBadge } from '../BooleanBadge.tsx';

export interface ElectionStatsProps {
  election: MockElection;
}

export const ElectionStats = ({ election }: ElectionStatsProps) => {
  return (
    <Grid>
      <Grid.Col span={5}>
        <ElectionStatField
          title={'Description'}
          content={
            <Text size={'sm'} lineClamp={3}>
              {election.description}
            </Text>
          }
        />
      </Grid.Col>
      <Grid.Col span={1}>
        <ElectionStatField
          title={'Frozen'}
          content={<BooleanBadge isTrue={election.immutableConfig} />}
        />
      </Grid.Col>
      <Grid.Col span={3}>
        <ElectionStatField
          title={'Start of voting'}
          content={<Text size={'sm'}>{election.votingStart.toLocaleString('en-US')}</Text>}
        />
      </Grid.Col>
      <Grid.Col span={3}>
        <ElectionStatField
          title={'End of voting'}
          content={<Text size={'sm'}>{election.votingEnd.toLocaleString('en-US')}</Text>}
        />
      </Grid.Col>
    </Grid>
  );
};
