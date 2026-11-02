import { Button, Divider, Grid, Group, Space, Stack, Text, Title, Tooltip } from '@mantine/core';
import type { SelectableElectionResult } from '@repo/votura-validators';
import { IconDownload } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { downloadJson } from '../../../utils/downloadJson.ts';
import { ElectionStatField } from '../election/ElectionStatField.tsx';

export interface ElectionResultsHeaderProps {
  electionResult: SelectableElectionResult;
}

const ElectionResultsStats = ({ electionResult }: ElectionResultsHeaderProps): JSX.Element => {
  const { t } = useTranslation();
  const ballotsCast = electionResult.ballotPapers.reduce(
    (sum, ballotPaper) => sum + ballotPaper.ballotsCast,
    0,
  );

  return (
    <Grid>
      <Grid.Col span={{ base: 6, md: 3 }}>
        <ElectionStatField
          title={t('startOfVoting', 'Start of voting')}
          content={<Text size={'sm'}>{dayjs(electionResult.votingStartAt).format('lll')}</Text>}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 6, md: 3 }}>
        <ElectionStatField
          title={t('endOfVoting', 'End of voting')}
          content={<Text size={'sm'}>{dayjs(electionResult.votingEndAt).format('lll')}</Text>}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 6, md: 3 }}>
        <ElectionStatField
          title={t('publishedAt', 'Published at')}
          content={<Text size={'sm'}>{dayjs(electionResult.publishedAt).format('lll')}</Text>}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 6, md: 3 }}>
        <ElectionStatField
          title={t('ballotsCast', 'Ballots cast')}
          content={<Text size={'sm'}>{ballotsCast}</Text>}
        />
      </Grid.Col>
    </Grid>
  );
};

export const ElectionResultsHeader = ({
  electionResult,
}: ElectionResultsHeaderProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <Group justify="space-between">
        <Stack gap={0}>
          <Text size="sm" c="dimmed">
            {t('electionResults', 'Election results')}
          </Text>
          <Title order={1}>{electionResult.name}</Title>
        </Stack>
        <Group>
          <Button
            variant="outline"
            leftSection={<IconDownload size={16} />}
            onClick={(): void => {
              downloadJson(electionResult, `election-results-${electionResult.electionId}.json`);
            }}
          >
            {t('downloadResults', 'Download results')}
          </Button>
          <Tooltip
            label={t(
              'availableOnceVoturaPublishesTheBallotBox',
              'Available once votura publishes the ballot box',
            )}
          >
            <Button
              variant="outline"
              leftSection={<IconDownload size={16} />}
              data-disabled
              onClick={(event) => event.preventDefault()}
            >
              {t('downloadBallotBox', 'Download ballot box')}
            </Button>
          </Tooltip>
        </Group>
      </Group>
      <Space h="md" />
      <Divider />
      <Space h="md" />
      <ElectionResultsStats electionResult={electionResult} />
    </>
  );
};
