import {
  Box,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import axios from 'axios';
import { type JSX, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { apiRoutes } from '../../../swr/apiRoutes.ts';
import { HEADER_HEIGHT } from '../../utils.ts';
import { LoginHeader } from '../login/LoginHeader.tsx';

type ValidationStatus = 'loading' | 'valid' | 'invalid' | 'error';

interface VoteValidationResponse {
  isValid: boolean;
  message?: string;
}

export const VoteValidationView = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(false);
  const [validationModalOpened, setValidationModalOpened] = useState(false);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('loading');
  const [validationMessage, setValidationMessage] = useState('');

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      votingToken: '',
      cipherText: '',
    },
    validate: {
      votingToken: (value) => {
        return value ? null : t('invalidVotingToken', 'Invalid voting Token');
      },
      cipherText: (value) => {
        return value ? null : t('invalidCipherText', 'Invalid cipher text');
      },
    },
  });

  const onValidation: Parameters<typeof form.onSubmit>[0] = async (values) => {
    setValidationModalOpened(true);
    setValidationStatus('loading');
    setValidationMessage('');
    setIsValidating(true);
    try {
      const response = await axios.post<VoteValidationResponse>(
        `${apiRoutes.base}/voting/validateVote`,
        {
          votingToken: values.votingToken.trim(),
          cipherText: values.cipherText,
        },
        {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Accept: 'application/json',
          },
        },
      );

      if (typeof response.data?.isValid !== 'boolean') {
        throw new Error(
          t('invalidVoteValidationResponse', 'The validation service returned an invalid response.'),
        );
      }

      setValidationStatus(response.data.isValid ? 'valid' : 'invalid');
      setValidationMessage(
        response.data.message ??
          (response.data.isValid
            ? t('voteValidationSucceeded', 'Your vote was validated successfully.')
            : t('voteValidationFailed', 'Your vote could not be validated.')),
      );
    } catch (error: unknown) {
      setValidationStatus('error');
      if (axios.isAxiosError<{ message?: string }>(error)) {
        setValidationMessage(
          error.response?.data?.message ??
            t('voteValidationRequestFailed', 'Could not complete vote validation. Please try again.'),
        );
      } else if (error instanceof Error) {
        setValidationMessage(error.message);
      } else {
        setValidationMessage(
          t('voteValidationRequestFailed', 'Could not complete vote validation. Please try again.'),
        );
      }
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Container fluid h={'100vh'}>
      <LoginHeader />
      <Center h={`calc(100vh - ${HEADER_HEIGHT}px)`}>
        <Stack w={400}>
          <Title>Votura</Title>
          <Box component={'form'} onSubmit={form.onSubmit(onValidation)}>
            <Stack>
              <TextInput
                withAsterisk
                label={t('pleaseEnterYourVotingToken', 'Please enter your voting token')}
                placeholder={t('votingTokenSpace', 'Voting token')}
                key={form.key('votingToken')}
                {...form.getInputProps('votingToken')}
              />
              <TextInput
                withAsterisk
                label={t('pleaseEnterYourVoteCipherText', 'Please enter your vote cipher text')}
                placeholder={t('cipherText', 'Cipher text')}
                key={form.key('cipherText')}
                {...form.getInputProps('cipherText')}
              />
              <Button fullWidth type={'submit'} loading={isValidating}>
                {t('checkMyVote', 'Check my Vote')}
              </Button>
              <Button
                variant="subtle"
                fullWidth
                type={'button'}
                onClick={(): void | Promise<void> => navigate('/login')}
              >
                {t('goToLogin', 'Go To Login')}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Center>
      <Modal
        opened={validationModalOpened}
        onClose={(): void => {
          if (!isValidating) {
            setValidationModalOpened(false);
          }
        }}
        title={t('voteValidation', 'Vote validation')}
        centered
        closeOnClickOutside={!isValidating}
        closeOnEscape={!isValidating}
      >
        <Stack>
          {validationStatus === 'loading' ? (
            <Group>
              <Loader size="sm" />
              <Text>{t('validatingVote', 'Validating your vote...')}</Text>
            </Group>
          ) : (
            <Text c={validationStatus === 'valid' ? 'green' : 'red'}>{validationMessage}</Text>
          )}
          <Button
            variant="subtle"
            onClick={(): void => setValidationModalOpened(false)}
            disabled={isValidating}
          >
            {t('close', 'Close')}
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
};
