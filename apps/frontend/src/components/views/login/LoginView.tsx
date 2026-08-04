import {
  Anchor,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useToggle } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { authenticatableUserObject } from '@repo/votura-validators';
import axios from 'axios';
import { type JSX, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { setAuthLocalStorage } from '../../../swr/authTokens.ts';
import { useLoginUser } from '../../../swr/useLoginUser.ts';

export const LoginView = (): JSX.Element => {
  const { t } = useTranslation();
  const { trigger, isMutating } = useLoginUser();
  const navigate = useNavigate();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => {
        const parsed = authenticatableUserObject.shape.email.safeParse(value);
        return parsed.success ? null : t('invalidEmailAddress', 'Invalid email address.');
      },
    },
  });

  const [isLoginIn, toggleIsLoginIn] = useToggle();
  const [loginBlockedSeconds, setLoginBlockedSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (loginBlockedSeconds === null) return;
    if (loginBlockedSeconds <= 0) {
      setLoginBlockedSeconds(null);
      return;
    }
    const timer = setInterval(() => {
      setLoginBlockedSeconds((prev) => {
        if (prev === null || prev <= 1) {
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loginBlockedSeconds]);

  const onLogin: Parameters<typeof form.onSubmit>[0] = async (data) => {
    toggleIsLoginIn();
    try {
      const response = await trigger(data);
      setAuthLocalStorage(response);
      navigate('/elections');
    } catch (e: unknown) {
      if (!axios.isAxiosError(e)) {
        notifications.show({
          title: t('couldNotLogin', 'Could not login'),
          message: t(
            'weDoNotKnowThisCombinationOfEmailAndPasswordPleaseTryAgain',
            'We do not know this combination of email and password. Please try again.',
          ),
          color: 'yellow',
          autoClose: 15000,
        });
      } else {
        // Notification is sent automatically, no need to display another one

        // Extra handling when login is blocked
        if (e.response?.status === 429 && e.response?.data) {
          const retryIn = (
            e.response.data as { retryIn?: { hours: number; minutes: number; seconds: number } }
          ).retryIn;
          if (retryIn) {
            const totalSeconds = (retryIn.hours * 60 + retryIn.minutes) * 60 + retryIn.seconds;
            setLoginBlockedSeconds(totalSeconds);
          }
        }
      }
    }

    toggleIsLoginIn();
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
                label={'Email'}
                placeholder={'user@votura.org'}
                key={form.key('email')}
                {...form.getInputProps('email')}
              />
              <PasswordInput
                withAsterisk
                label={'Password'}
                placeholder={t('mySecurePassword', 'My secure password...')}
                key={form.key('password')}
                {...form.getInputProps('password')}
              />
              <Button
                fullWidth
                type={'submit'}
                loading={isLoginIn || isMutating}
                disabled={loginBlockedSeconds !== null}
              >
                {t('login', 'Login')}
                {loginBlockedSeconds !== null ? ' (' + loginBlockedSeconds + ')' : ''}
              </Button>
            </Stack>
          </Box>
          <Button variant="light" onClick={(): void | Promise<void> => navigate('/register')}>
            {t('signUp', 'Sign Up')}
          </Button>
          <Divider />
          <Group justify="space-between">
            <Text size={'sm'}>{t('cantLoginAnymore', "Can't login anymore?")}</Text>
            <Anchor component={'button'} variant="transparent" size={'sm'}>
              {t('resetPassword', 'Reset password')}
            </Anchor>
          </Group>
        </Stack>
      </Center>
    </Container>
  );
};
