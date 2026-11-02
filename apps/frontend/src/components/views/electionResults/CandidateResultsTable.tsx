import { Divider, Group, Paper, Progress, Space, Table, Text, Title } from '@mantine/core';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';

export interface CandidateResult {
  id: string;
  title: string;
  count: number;
}

export interface CandidateResultsTableProps {
  title: string;
  candidates: CandidateResult[];
  noVoteCount?: number;
}

export const CandidateResultsTable = ({
  title,
  candidates,
  noVoteCount,
}: CandidateResultsTableProps): JSX.Element => {
  const { t } = useTranslation();
  const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.count, 0);
  const sortedCandidates = [...candidates].sort((a, b) => b.count - a.count);

  return (
    <Paper p="md" radius="md">
      <Title order={4}>{title}</Title>
      <Space h="sm" />
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('candidate', 'Candidate')}</Table.Th>
            <Table.Th>{t('votes', 'Votes')}</Table.Th>
            <Table.Th>{t('share', 'Share')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sortedCandidates.map((candidate) => {
            const share = totalVotes === 0 ? 0 : (candidate.count / totalVotes) * 100;
            return (
              <Table.Tr key={candidate.id}>
                <Table.Td>
                  <Text size="sm">{candidate.title}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={700}>
                    {candidate.count}
                  </Text>
                </Table.Td>
                <Table.Td w="40%">
                  <Group gap="xs" wrap="nowrap">
                    <Progress value={share} flex={1} />
                    <Text size="sm" w={56} ta="right">
                      {`${share.toFixed(1)} %`}
                    </Text>
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
      {noVoteCount !== undefined && (
        <>
          <Divider my="sm" />
          <Text size="sm" c="dimmed">
            {t('abstentionsNumber', 'Abstentions: {{number}}', { number: noVoteCount })}
          </Text>
        </>
      )}
    </Paper>
  );
};
