import { type JSX } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import type { EncryptedFilledBallotPaper } from '@repo/votura-validators';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { apiRoutes } from '../../../swr/apiRoutes.ts';
import { getVoterLocalStorage } from '../../../swr/voterToken.ts';
import {
  Button,
  Center,
  Container,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';

interface VotingSubmitLocationState {
  encryptedFilledBallotPaper: EncryptedFilledBallotPaper;
  electionName: string;
}

export const VotingSubmitView = (): JSX.Element => {
  const { t } = useTranslation();
  const location = useLocation();
  const state = location.state as VotingSubmitLocationState;
  const navigate = useNavigate();

  if (!state) {
    return <Navigate to="/votingHome" replace />;
  }

  const { encryptedFilledBallotPaper, electionName } = state;

  const ciphertext = JSON.stringify(
    encryptedFilledBallotPaper,
    null,
    2,
  );

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
      await axios.post(
        `${apiRoutes.base}/voting/castVote`,
        encryptedFilledBallotPaper,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${getVoterLocalStorage()}`,
          },
        },
      );
      navigate('/voting/success', {
        replace: true,
      });

      console.log('Vote successfully cast');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Response:', error.response?.data);
        console.error('URL:', error.config?.url);
        return;
      }

      console.error(error);
    }
  };

  return (
    <Center mih="100vh">
      <Container w={350}>
        <Stack gap="sm">
          <Text size="sm">
            {t('voteForElection', 'You are about to submit your vote for:')}
          </Text>

          <Text fw={700} size="lg">
            {electionName}
          </Text>

          <Text size="sm" mt="sm">
            {t(
              'saveCiphertextDescription',
              'Please save your ciphertext for later checking:',
            )}
          </Text>

          <Textarea
            value={ciphertext}
            readOnly
            minRows={5}
            maxRows={5}
          />

          <Button fullWidth onClick={handleDownloadCiphertext}>
            {t('downloadCiphertext', 'Download ciphertext')}
          </Button>

          <Button
            fullWidth
            variant="outline"
            onClick={handleCastVote}
          >
            {t('castVote', 'Send Vote')}
          </Button>
        </Stack>
      </Container>
    </Center>
  );
};