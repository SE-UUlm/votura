import { Center, Container, Loader, Space, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconBug } from '@tabler/icons-react';
import axios from 'axios';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useGetElectionResults } from '../../../swr/electionResults/useGetElectionResults.ts';
import { HEADER_HEIGHT } from '../../utils.ts';
import type { ElectionViewRouteParams } from '../election/ElectionView.tsx';
import { LoginHeader } from '../login/LoginHeader.tsx';
import { BallotPaperResultCard } from './BallotPaperResultCard.tsx';
import { ElectionResultsHeader } from './ElectionResultsHeader.tsx';

const NOT_FOUND_STATUS = 404;

const ElectionResultsContent = (): JSX.Element => {
  const { t } = useTranslation();
  const params = useParams<ElectionViewRouteParams>();
  const { data, isLoading, error } = useGetElectionResults({ electionId: params.electionId });

  if (axios.isAxiosError(error) && error.response?.status === NOT_FOUND_STATUS) {
    return (
      <Center h={`calc(100vh - ${HEADER_HEIGHT * 2}px)`}>
        <Stack align="center" gap="xs">
          <Title order={2}>{t('resultsNotPublished', 'Results not published')}</Title>
          <Text c="dimmed">
            {t(
              'theResultsOfThisElectionAreNotPublishedYet',
              'The results of this election are not published yet.',
            )}
          </Text>
        </Stack>
      </Center>
    );
  }

  if (error) {
    return (
      <ThemeIcon size="xl" color="red">
        <IconBug style={{ width: '70%', height: '70%' }} />
      </ThemeIcon>
    );
  }

  if (isLoading || data === undefined) {
    return <Loader color="blue" />;
  }

  return (
    <>
      <ElectionResultsHeader electionResult={data} />
      <Space h="md" />
      <Stack gap="md">
        {data.ballotPapers.map((ballotPaper) => (
          <BallotPaperResultCard key={ballotPaper.id} ballotPaper={ballotPaper} />
        ))}
      </Stack>
      <Space h="md" />
    </>
  );
};

export const ElectionResultsView = (): JSX.Element => (
  <Container size="lg">
    <LoginHeader />
    <ElectionResultsContent />
  </Container>
);
