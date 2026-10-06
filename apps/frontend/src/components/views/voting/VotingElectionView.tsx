import {
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  Group,
  Loader,
  Paper,
  Space,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { BallotPaperEncryption } from '@repo/votura-ballot-box';
import { parameter } from '@repo/votura-validators';
import { IconBug, IconSend } from '@tabler/icons-react';
import { PublicKey } from '@votura/votura-crypto/index';
import { type JSX, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router';
import { getVoterLocalStorage } from '../../../swr/voterToken.ts';
import { useGetVoterElections } from '../../../swr/voting/useGetVoterElections.ts';
import { useVotingHasNotStarted } from '../../../swr/voting/useVotingHasNotStarted.ts';
import {
  createPlainFilledBallotPaper,
  type Votes,
} from '../../../utils/createPlainFilledBallotPaper.ts';
import { HEADER_HEIGHT } from '../../utils.ts';
import { BallotPaperSection } from './BallotPaperSection.tsx';

interface VotingElectionViewRouteParams extends Record<string, string> {
  [parameter.electionId]: string;
}

export const VotingElectionView = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const voterToken = getVoterLocalStorage();
  const params = useParams<VotingElectionViewRouteParams>();
  const [votes, setVotes] = useState<Votes>({});
  const {
    data: voterElections,
    isLoading: isVoterElectionsLoading,
    error: voterElectionsError,
  } = useGetVoterElections({ token: voterToken });

  const selectedElection = voterElections?.find((election) => election.id === params.electionId);
  const votingHasNotStarted = useVotingHasNotStarted(selectedElection?.votingStartAt);

  if (!params.electionId) {
    return <Navigate to={'/votingHome'} />;
  }

  if (voterElectionsError) {
    return (
      <ThemeIcon size="xl" color="red">
        <IconBug style={{ width: '70%', height: '70%' }} />
      </ThemeIcon>
    );
  }

  if (isVoterElectionsLoading || voterElections === undefined) {
    return (
      <Container>
        <Loader color="blue" />
      </Container>
    );
  }

  if (!selectedElection) {
    return <Navigate to={'/votingHome'} replace />;
  }

  const totalVotes = Object.values(votes).reduce(
    (total, sectionVotes) =>
      total + Object.values(sectionVotes ?? {}).reduce((sum, value) => sum + (value ?? 0), 0),
    0,
  );

  const formatDateTime = (date: string): string =>
    new Date(date).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleVoteChange = (sectionId: string, candidateId: string, change: number): void => {
    setVotes((currentVotes) => ({
      ...currentVotes,
      [sectionId]: {
        ...currentVotes[sectionId],
        [candidateId]: (currentVotes[sectionId]?.[candidateId] ?? 0) + change,
      },
    }));
  };

  const handleSubmitVote = (): void => {
    const { primeP, primeQ, generator, pubKey } = selectedElection;

    if (
      primeP === undefined ||
      primeQ === undefined ||
      generator === undefined ||
      pubKey === undefined
    ) {
      throw new Error('Election encryption key is missing.');
    }

    const plainFilledBallotPaper = createPlainFilledBallotPaper(
      selectedElection.ballotPaper,
      votes,
    );

    const publicKey = new PublicKey(
      BigInt(primeP),
      BigInt(primeQ),
      BigInt(generator),
      BigInt(pubKey),
    );

    const ballotPaperEncryption = new BallotPaperEncryption(publicKey);

    const [encryptedFilledBallotPaper] =
      ballotPaperEncryption.encryptBallotPaper(plainFilledBallotPaper);

    navigate('/voting/submitVote', {
      state: {
        encryptedFilledBallotPaper,
        electionName: selectedElection.name,
      },
    });
  };

  return (
    <Flex direction="column" maw="100%" px="md" flex={1}>
      <Group justify="space-between" h={HEADER_HEIGHT}>
        <Title order={1}>{selectedElection.name}</Title>
        <Stack gap={4} align="flex-end">
          <Button
            variant="outline"
            onClick={handleSubmitVote}
            rightSection={<IconSend size={16} />}
            disabled={votingHasNotStarted}
          >
            {t('submitVote', 'Submit Vote')}
          </Button>
          {Boolean(votingHasNotStarted) && (
            <Text size="xs" c="dimmed">
              {t('votingStartsAt', 'Voting starts on {{date}}.', {
                date: formatDateTime(selectedElection.votingStartAt),
              })}
            </Text>
          )}
        </Stack>
      </Group>

      <Divider />

      <Space h="md" />

      {/* Election information */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="xs">
            <Title order={3}>{t('description', 'Description')}</Title>

            <Text>
              {selectedElection.description ||
                t(
                  'noDescriptionIsAvailableForThisElection',
                  'No description is available for this election.',
                )}
            </Text>

            <Title order={3} mt="xs">
              {t('votingPeriod', 'Voting Period')}
            </Title>

            <Text>
              {formatDateTime(selectedElection.votingStartAt)} -{' '}
              {formatDateTime(selectedElection.votingEndAt)}
            </Text>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="xs">
            <Title order={3}>{t('privateVotes', 'Private Votes')}</Title>

            <Text>{selectedElection.private ? t('Yes', 'Yes') : t('No', 'No')}</Text>

            <Title order={3} mt="xs">
              {t('invalidVotesAllowed', 'Invalid Votes Allowed')}
            </Title>

            <Text>{selectedElection.allowInvalidVotes ? t('Yes', 'Yes') : t('No', 'No')}</Text>
          </Stack>
        </Grid.Col>
      </Grid>
      <Space h="md" />

      {/* Ballot Paper */}
      <Paper
        p="md"
        radius="md"
        style={{
          backgroundColor: '#80b9e5',
        }}
      >
        <Grid>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap={0}>
              <Title order={3}>{selectedElection.ballotPaper.name}</Title>

              <Text>{selectedElection.ballotPaper.description}</Text>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 6, md: 2 }}>
            <Text fw={700}> {t('maxVotes', 'Max. Votes')}</Text>
            <Text>
              {totalVotes}/{selectedElection.ballotPaper.maxVotes}
            </Text>
          </Grid.Col>

          <Grid.Col span={{ base: 6, md: 3 }}>
            <Text fw={700}> {t('maxVotesPerCandidate', 'Max. Votes per Candidate')}</Text>
            <Text>{selectedElection.ballotPaper.maxVotesPerCandidate}</Text>
          </Grid.Col>
        </Grid>
        <Space h="md" />
        {/* Ballot Paper Sections */}
        <Stack gap="md">
          {selectedElection.ballotPaper.ballotPaperSections.map((section) => (
            <BallotPaperSection
              key={section.id}
              section={section}
              ballotPaper={selectedElection.ballotPaper}
              votes={votes}
              totalVotes={totalVotes}
              votingHasNotStarted={votingHasNotStarted}
              onVoteChange={handleVoteChange}
            />
          ))}
        </Stack>
      </Paper>
    </Flex>
  );
};
