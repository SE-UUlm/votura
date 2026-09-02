import { Divider, Flex, Group, Space, Title, Text, List, Anchor } from '@mantine/core';
import type { JSX } from 'react';
import { HEADER_HEIGHT } from '../../utils.ts';
import { getVoterLocalStorage } from '../../../swr/voterToken.ts';
import { useGetVoterElections } from '../../../swr/voting/useGetVoterElections.ts';
import { Link } from 'react-router';
import { getVotingElectionPath } from '../../AppShellLayoutVoter.tsx';
import { useTranslation } from 'react-i18next';

export const VotingHomeView = (): JSX.Element => {
  const { t } = useTranslation();
  const voterToken = getVoterLocalStorage();
  const voterElectionsHook = useGetVoterElections({ token: voterToken });
  const voterData = voterElectionsHook.data;

  return (
    <>
      <Flex direction="column" maw="100%" px="md" flex={1}>
        <Group justify="space-between" h={HEADER_HEIGHT}>
          <Title order={1}>{t('welcomeToVotura', 'Welcome to Votura')}</Title>
          <Group />
        </Group>
        <Divider />
        <Text mt="sm">
          {t(
            'voturaDescription',
            'Votura is a secure online voting platform that allows you to participate in elections easily and transparently.',
          )}
        </Text>
        <Space h="md" />
        <Title order={2}>{t('participateInAnElection', 'Participate in an Election')}</Title>
        <Text mt="sm">
          {t(
            'participateInAnElectionDescription',
            'On the left side, you will find an overview of all available elections. Alternatively, you can also click directly on one of the links in the following list.',
          )}
        </Text>
        <Text mt="sm">
          {t('availableElections', 'You can participate in the following elections:')}
        </Text>
        <List mt="sm">
          {voterData?.map((election) => (
            <List.Item key={election.id}>
              <Anchor component={Link} to={getVotingElectionPath(election.id)}>
                {election.name}
              </Anchor>
            </List.Item>
          ))}
        </List>
        <Text mt="sm">
          {t(
            'clickOnElectionName',
            'Click on the name of an election to open the corresponding election information and ballot.',
          )}
        </Text>
        <Space h="lg" />
        <Title order={2}>{t('fillOutYourBallot', 'Fill Out Your Ballot')}</Title>
        <Text mt="sm">
          {t(
            'fillOutYourBallotDescription',
            'On the ballot, you can cast your vote for the available options. Above the ballot, you will also find important information about the respective election.',
          )}
        </Text>
        <Text mt="sm">
          {t('submitYourBallot', 'Once you have made your selection, you can submit your ballot.')}
        </Text>
        <Space h="lg" />
        <Title order={2}>{t('changeYourVote', 'Change Your Vote')}</Title>
        <Text mt="sm">
          {t(
            'changeYourVoteDescription',
            'As long as the election is still running, you can change your vote at any time and vote again. To vote again, select the election for which you want to change your vote. By clicking on ',
          )}
          <strong>{t('voteAgain', 'Vote Again')}</strong>
          {t(
            'changeYourVoteDescription2',
            ', you will return to your ballot and can adjust your selection.',
          )}
        </Text>
        <Space h="lg" />
        <Title order={2}>{t('verifyYourVote', 'Verify Your Vote')}</Title>
        <Text mt="sm">
          {t('verifyYourVoteDescription', 'After submitting your vote, you will receive a')}
          <strong> {t('ciphertext', 'Ciphertext')}</strong>
          {t(
            'verifyYourVoteDescription2',
            ' - an encrypted representation of your submitted vote.',
          )}
        </Text>
        <Text mt="sm">
          {t('verifyYourVoteDescription3', 'Save or download your ciphertext. You can use it later to verify your vote and confirm that your vote was correctly recorded.',)}
          Speichere oder lade deinen Ciphertext herunter. Du kannst ihn später verwenden, um deine
          Stimme zu verifizieren und zu überprüfen, dass deine abgegebene Stimme korrekt
          berücksichtigt wurde.
        </Text>
      </Flex>
    </>
  );
};
