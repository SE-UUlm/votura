import {
  ActionIcon,
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
import { parameter } from '@repo/votura-validators';
import { IconBug, IconMinus, IconPlus, IconSend } from '@tabler/icons-react';
import { type JSX, useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { useGetVoterElections } from '../../../swr/voting/useGetVoterElections.ts';
import { getVoterLocalStorage } from '../../../swr/voterToken.ts';
import { HEADER_HEIGHT } from '../../utils.ts';
import { useTranslation } from 'react-i18next';

interface VotingElectionViewRouteParams extends Record<string, string> {
  [parameter.electionId]: string;
}

export const VotingElectionView = (): JSX.Element => {
  const { t } = useTranslation();
  const voterToken = getVoterLocalStorage();
  const params = useParams<VotingElectionViewRouteParams>();
  const [votes, setVotes] = useState<Record<string, Record<string, number>>>({});
  const {
    data: voterElections,
    isLoading: isVoterElectionsLoading,
    error: voterElectionsError,
  } = useGetVoterElections({ token: voterToken });

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

  const selectedElection = voterElections.find((election) => election.id === params.electionId);
  if (!selectedElection) {
    return <Navigate to={'/votingHome'} replace />;
  }

    const totalVotes = Object.values(votes).reduce(
        (total, sectionVotes) =>
            total +
            Object.values(sectionVotes).reduce(
                (sum, value) => sum + value,
                0,
            ),
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

  return (
    <Flex direction="column" maw="100%" px="md" flex={1}>
      <Group justify="space-between" h={HEADER_HEIGHT}>
        <Title order={1}>{selectedElection.name}</Title>

        <Button variant="outline" >
          <IconSend size={16}/>
          {t('submitVote', 'Submit Vote')}
        </Button>
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
                t('noDescriptionIsAvailableForThisElection', 'No description is available for this election.')}
            </Text>

            <Title order={3} mt="xs">
              {t('votingPeriod', 'Voting Period')}
            </Title>

            <Text>
              {formatDateTime(selectedElection.votingStartAt)} - {' '}
              {formatDateTime(selectedElection.votingEndAt)}
            </Text>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="xs">
            <Title order={3}>{t('privateVotes', 'Private Votes')}</Title>

            <Text>{selectedElection.private ? 'Yes' : 'No'}</Text>

            <Title order={3} mt="xs">
              {t('invalidVotesAllowed', 'Invalid Votes Allowed')}
            </Title>

            <Text>
              {selectedElection.allowInvalidVotes ? 'Yes' : 'No'}
            </Text>
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
              <Title order={3}>
                {selectedElection.ballotPaper.name}
              </Title>

              <Text>
                {selectedElection.ballotPaper.description}
              </Text>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 6, md: 2 }}>
            <Text fw={700}> {t('maxVotes', 'Max. Votes')}</Text>
            <Text>{totalVotes}/{selectedElection.ballotPaper.maxVotes}</Text>
          </Grid.Col>

          <Grid.Col span={{ base: 6, md: 3 }}>
            <Text fw={700}> {t('maxVotesPerCandidate', 'Max. Votes per Candidate')}</Text>
            <Text>
              {selectedElection.ballotPaper.maxVotesPerCandidate}
            </Text>
          </Grid.Col>
        </Grid>
        <Space h="md" />
        {/* Ballot Paper Sections */}
        <Stack gap="md">
          {selectedElection.ballotPaper.ballotPaperSections.map(
            (section) => {
                const sectionVotes = section.candidates.reduce(
                    (sum, candidate) =>
                        sum + (votes[section.id]?.[candidate.id] ?? 0),
                    0,
                );

              return (
                <Paper key={section.id} p="md" radius="md">
                  <Grid>
                   <Grid.Col span={{ base: 12, md: 7 }}>
                     <Stack gap={0}>
                       <Title order={3}>{section.name}</Title>
                       <Text>{section.description}</Text>
                     </Stack>
                  </Grid.Col>

                    <Grid.Col span={{ base: 6, md: 2 }}>
                     <Text fw={700}> {t('maxVotes', 'Max. Votes')}</Text>
                     <Text>{sectionVotes}/{section.maxVotes}</Text>
                    </Grid.Col>

                    <Grid.Col span={{ base: 6, md: 3 }}>
                      <Text fw={700}>
                       {t('maxVotesPerCandidate', 'Max. Votes per Candidate')}
                      </Text>
                      <Text>{section.maxVotesPerCandidate}</Text>
                   </Grid.Col>
                  </Grid>

                 <Space h="sm" />

                 <Stack gap="xs">
                    {section.candidates.map((candidate) => {
                        const candidateVotes = votes[section.id]?.[candidate.id] ?? 0;
                        const candidateTotalVotes =
                            selectedElection.ballotPaper.ballotPaperSections.reduce(
                                (total, currentSection) =>
                                    total +
                                    (votes[currentSection.id]?.[candidate.id] ?? 0),
                                0,
                            );

                        const canIncrease =
                            candidateVotes < section.maxVotesPerCandidate &&
                            candidateTotalVotes <
                            selectedElection.ballotPaper.maxVotesPerCandidate &&
                            sectionVotes < section.maxVotes &&
                            totalVotes < selectedElection.ballotPaper.maxVotes;

                        const canDecrease = candidateVotes > 0;

                        return (
                       <Group key={candidate.id} gap="md">
                          <Group gap={4}>
                           <ActionIcon
                              variant="outline"
                              size="sm"
                             onClick={() => {
                                 setVotes((currentVotes) => ({
                                     ...currentVotes,
                                     [section.id]: {
                                         ...currentVotes[section.id],
                                         [candidate.id]: candidateVotes - 1,
                                     },
                                 }));
                              }}
                              disabled={!canDecrease}
                            >
                              <IconMinus size={16} />
                           </ActionIcon>

                            <Text w={24} ta="center" fw={600}>
                              {candidateVotes}
                           </Text>

                            <ActionIcon
                             variant="outline"
                              size="sm"
                               onClick={() => {
                                   setVotes((currentVotes) => ({
                                   ...currentVotes,
                                   [section.id]: {
                                       ...currentVotes[section.id],
                                       [candidate.id]: candidateVotes + 1,
                                   },
                               }));
                              }}
                              disabled={!canIncrease}
                           >
                              <IconPlus size={16} />
                            </ActionIcon>
                         </Group>

                         <Text fw={700}>
                           {candidate.title}
                         </Text>
                         <Text>{candidate.description}</Text>
                        </Group>
                     );
                   })}
                 </Stack>
                </Paper>
              );
           },
          )}
        </Stack>
      </Paper>
    </Flex>
  );
};
