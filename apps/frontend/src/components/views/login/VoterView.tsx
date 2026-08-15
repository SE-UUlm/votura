import { Box, Button, Center, Container, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useToggle } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  selectableVotingElectionObject,
  type SelectableVotingElection,
} from '@repo/votura-validators';
import axios from 'axios';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { mutate } from 'swr';
import { apiRoutes } from '../../../swr/apiRoutes.ts';
import { toArraySchema } from '../../../swr/toArraySchema.ts';
import { setVoterLocalStorage } from '../../../swr/voterToken.ts';

export const VoterView = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      votingToken: '',
    },
    validate: {
      votingToken: (value) => {
        return value ? null : 'Invalid voting Token .';
      },
    },
  });

  const [isLoginIn, toggleIsLoginIn] = useToggle();
  const onLogin: Parameters<typeof form.onSubmit>[0] = async (values) => {
    toggleIsLoginIn();
    try {
      const instance = axios.create({ baseURL: apiRoutes.base });
      const response = await instance.get('/voting/getElections', {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Accept: 'application/json',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: `Bearer ${values.votingToken}`,
        },
      });
      const parsedElections = (await toArraySchema(selectableVotingElectionObject).parseAsync(
        response.data,
      )) as SelectableVotingElection[];

      const tokenValue = values.votingToken.trim();
      if (tokenValue === '' || tokenValue === 'undefined') {
        notifications.show({
          title: 'Invalid Voting Token',
          message: 'The returned voting token is invalid. Please try again.',
          color: 'red',
          autoClose: 15000,
        });
        return;
      }

      setVoterLocalStorage(tokenValue);
      await mutate(['/voting/getElections', tokenValue], parsedElections, {
        revalidate: false,
      });
      navigate('/votingHome');
    } catch (e: unknown) {
      notifications.show({
        title: 'Invalid Voting Token',
        message: 'The inserted voting token is invalid. Please try again.',
        color: 'red',
        autoClose: 15000,
      });
    } finally {
      toggleIsLoginIn();
    }
  };

  return (
    <Container fluid h={'100vh'}>
      <Center h={'100vh'}>
        <Stack w={400}>
          <Title>Votura</Title>
          <Box component={'form'} onSubmit={form.onSubmit(onLogin)}>
            <Stack>
              <TextInput
                withAsterisk
                label={'Please enter your voting token'}
                placeholder={'voting Token'}
                key={form.key('votingToken')}
                {...form.getInputProps('votingToken')}
              />
              <Button fullWidth type={'submit'} loading={isLoginIn}>
                {t('startVoting', 'Start Voting')}
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
