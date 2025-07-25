import { ActionIcon, Divider, Group, Paper, Stack, Text, useMantineTheme } from '@mantine/core';
import type { SelectableBallotPaper } from '@repo/votura-validators';
import { IconDots } from '@tabler/icons-react';
import type { JSX } from 'react';

export interface BallotPaperColumnProps {
  ballotPaper: SelectableBallotPaper;
}

export const BallotPaperColumn = ({ ballotPaper }: BallotPaperColumnProps): JSX.Element => {
  const theme = useMantineTheme();

  return (
    <Paper shadow={'xs'} p={'md'} miw={400} bg={theme.colors.gray[0]} style={{ overflow: 'auto' }}>
      <Stack>
        <Group justify={'space-between'} align={'start'}>
          <Stack w={'80%'}>
            <Text truncate="end">{ballotPaper.name}</Text>
            {ballotPaper.description !== undefined && (
              <Text lineClamp={2} c="dimmed" size="sm">
                {ballotPaper.description}
              </Text>
            )}
          </Stack>
          <ActionIcon size="lg" variant="light" aria-label="Settings">
            <IconDots size={16} />
          </ActionIcon>
        </Group>
        <Divider />
      </Stack>
    </Paper>
  );
};
