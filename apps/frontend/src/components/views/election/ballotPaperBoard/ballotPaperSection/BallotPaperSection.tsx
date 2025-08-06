import { ActionIcon, Center, Divider, Group, Paper, Stack, Text } from '@mantine/core';
import type { SelectableBallotPaperSection } from '@repo/votura-validators';
import { IconDots } from '@tabler/icons-react';
import type { JSX } from 'react';

export interface BallotPaperSectionProps {
  ballotPaperSection: SelectableBallotPaperSection;
}

export const BallotPaperSection = ({
  ballotPaperSection,
}: BallotPaperSectionProps): JSX.Element => {
  return (
    <Paper shadow="xs" p={'md'}>
      <Stack>
        <Group justify={'space-between'} align={'start'}>
          <Stack w={'80%'}>
            <Text truncate="end">{ballotPaperSection.name}</Text>
            {ballotPaperSection.description !== undefined && (
              <Text lineClamp={2} c="dimmed" size="sm">
                {ballotPaperSection.description}
              </Text>
            )}
          </Stack>
          <ActionIcon size="md" variant="light" aria-label="Settings">
            <IconDots size={16} />
          </ActionIcon>
        </Group>
        <Divider />
        <Center>
          <Text size="sm">Candidates: {ballotPaperSection.candidateIds.length}</Text>
        </Center>
      </Stack>
    </Paper>
  );
};
