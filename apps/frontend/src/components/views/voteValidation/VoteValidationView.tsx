import { Box, Button, Center, Container, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useToggle } from '@mantine/hooks';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { HEADER_HEIGHT } from '../../utils.ts';
import { LoginHeader } from '../login/LoginHeader.tsx';

export const VoteValidationView = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      votingToken: '',
      cipherText: ''
    },
    validate: {
      votingToken: (value) => {
        return value ? null : t('invalidVotingToken', 'Invalid voting Token');
      },
      cipherText: (value) => {
        return value ? null : t('invalidCipherText', 'Invalid cipher text')
      }
    },
  });

  const [isValidating, toggleIsValidating] = useToggle();
  const onValidation: Parameters<typeof form.onSubmit>[0] = async (values) => {
    toggleIsValidating();
    navigate('validationResult', {
      state: {
        votingToken: values.votingToken,
        cipherText: values.cipherText
      }
    });

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
    </Container>
  );
};
