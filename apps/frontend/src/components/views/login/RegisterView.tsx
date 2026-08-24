import {
  Box,
  Button,
  Center,
  Container,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { authenticatableUserObject } from '@repo/votura-validators';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useRegisterUser } from '../../../swr/useRegisterUser.ts';
import { HEADER_HEIGHT } from '../../utils.ts';
import { LoginHeader } from './LoginHeader.tsx';

export const RegisterView = (): JSX.Element => {
  const { t } = useTranslation();
  const { trigger, isMutating } = useRegisterUser();
  const navigate = useNavigate();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      email: (value) => {
        const parsed = authenticatableUserObject.shape.email.safeParse(value);
        const userErrorMessage: string = t('invalidEmailAddress', 'Invalid email address.');
        if (!parsed.success) {
          return userErrorMessage;
        }
        return null;
      },
      password: (value) => {
        const parsed = authenticatableUserObject.shape.password.safeParse(value);
        const userErrorMessage: string = t(
          'passwordDoesNotMeetRequirements',
          'Password does not meet requirements.',
        );
        if (!parsed.success) {
          return userErrorMessage;
        }
        return null;
      },
      confirmPassword: (value, values) => {
        const userErrorMessage: string = t('passwordsDoNotMatch', 'Passwords do not match.');
        if (value !== values.password) {
          return userErrorMessage;
        }
        return null;
      },
    },
  });

  const onRegister: Parameters<typeof form.onSubmit>[0] = async (data: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      await trigger({
        email: data.email,
        password: data.password,
      });

      notifications.show({
        title: t('almostDone', 'Almost done!'),
        message: (
          <>
            <strong>
              {t('weHaveSentYouAVerificationLink', 'We have sent you a verification link.')}
            </strong>
            <br />
            {t('pleaseCheckYourEmailInbox', 'Please check your email inbox.')}
          </>
        ),
        color: 'green',
        autoClose: 15000,
      });
      navigate('/login');
    } catch (e: unknown) {
      let message: string = t(
        'somethingWentWrongDuringRegistrationPleaseTryAgain',
        'Something went wrong during registration. Please try again.',
      );
      if (e instanceof Error) {
        message = e.message;
      }
      notifications.show({
        title: t('registrationFailed', 'Registration failed'),
        message: message,
        color: 'yellow',
        autoClose: 15000,
      });
    }
  };

  return (
    <Container fluid h={'100vh'}>
      <LoginHeader />
      <Center h={`calc(100vh - ${HEADER_HEIGHT}px)`}>
        <Stack w={400}>
          <Title>Votura</Title>
          <Box component={'form'} onSubmit={form.onSubmit(onRegister)}>
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
              <PasswordInput
                withAsterisk
                label={'Password confirmation'}
                placeholder={t('repeatMySecurePassword', 'Repeat my secure password...')}
                key={form.key('confirmPassword')}
                {...form.getInputProps('confirmPassword')}
              />
              <Button fullWidth type={'submit'} loading={isMutating}>
                {t('signUp', 'Sign Up')}
              </Button>
            </Stack>
          </Box>
          <Button variant="subtle" onClick={(): void | Promise<void> => navigate('/login')}>
            {t('backToLogin', 'Back To Login')}
          </Button>
        </Stack>
      </Center>
    </Container>
  );
};
