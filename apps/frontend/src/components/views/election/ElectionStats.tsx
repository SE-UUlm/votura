import type { MockElection } from '../../../store/useStore.ts';
import { Badge, Grid, Text } from '@mantine/core';
import { ElectionStatField } from './ElectionStatField.tsx';

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
          content={
            election.immutableConfig ? (
              <Badge variant="dot" color="red">
                Yes
              </Badge>
            ) : (
              <Badge variant="dot" color="green">
                No
              </Badge>
            )
          }
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
