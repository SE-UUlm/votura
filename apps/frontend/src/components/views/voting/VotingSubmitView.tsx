import { Button, Center, Container, Flex, Stack, Text, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { EncryptedFilledBallotPaper } from '@repo/votura-validators';
import { IconArrowLeft, IconDownload, IconSend } from '@tabler/icons-react';
import axios from 'axios';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { apiRoutes } from '../../../swr/apiRoutes.ts';
import { getVoterLocalStorage } from '../../../swr/voterToken.ts';

interface VotingSubmitLocationState {
  encryptedFilledBallotPaper: EncryptedFilledBallotPaper;
  electionName: string;
}

export const VotingSubmitView = (): JSX.Element => {
  const { t } = useTranslation();
  const location = useLocation();
  const state = location.state as VotingSubmitLocationState | null;
  const navigate = useNavigate();

  if (!state) {
    return <Navigate to="/votingHome" replace />;
  }

  const { encryptedFilledBallotPaper, electionName } = state;

  //download ciphertext plus ZK-Proof, convert to readable ciphertext after it exists
  const ciphertext = JSON.stringify(encryptedFilledBallotPaper, null, 2);

  const handleDownloadCiphertext = (): void => {
    const blob = new Blob([ciphertext], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'encrypted-vote.json';
    anchor.click();

    URL.revokeObjectURL(url);
  };

  const handleCastVote = async (): Promise<void> => {
    try {
      await axios.post(`${apiRoutes.base}/voting/castVote`, encryptedFilledBallotPaper, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${getVoterLocalStorage()}`,
        },
      });
      navigate('/voting/success', {
        replace: true,
        state: { electionName },
      });
    } catch (error: unknown) {
      notifications.show({
        title: t('votingNotPossible', 'Voting is not possible'),
        message: t(
          'votingNotPossibleDescription',
          'Voting for {{electionName}} may not have started yet.',
          { electionName },
        ),
        color: 'red',
        autoClose: 15000,
      });
    }
  };

  return (
    <Flex direction="column" mih="90vh">
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={18} />}
        onClick={(): void => {
          navigate(-1);
        }}
        w="fit-content"
        m="md"
      >
        {t('backToElection', 'Back to election')}
      </Button>
      <Center flex={1}>
        <Container w={600}>
          <Stack gap="sm">
            <Text size="sm">{t('voteForElection', 'You are about to submit your vote for:')}</Text>

            <Text fw={700} size="lg">
              {electionName}
            </Text>

            <Text size="sm" mt="sm">
              {t('saveCiphertextDescription', 'Please save your ciphertext for later checking:')}
            </Text>

            <Textarea value={ciphertext} readOnly autosize minRows={10} maxRows={10} />

            <Button
              fullWidth
              onClick={handleDownloadCiphertext}
              leftSection={<IconDownload size={18} />}
            >
              {t('downloadCiphertext', 'Download ciphertext')}
            </Button>

            <Button
              fullWidth
              variant="outline"
              onClick={handleCastVote}
              rightSection={<IconSend size={18} />}
            >
              {t('castVote', 'Send Vote')}
            </Button>
          </Stack>
        </Container>
      </Center>
    </Flex>
  );
};
