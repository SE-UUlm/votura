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
import { insertableUserObject } from '@repo/votura-validators';
import type { JSX } from 'react';
import { useNavigate } from 'react-router';
import { useRegisterUser } from '../../../swr/useRegisterUser.ts';
import { useTranslation, Trans } from 'react-i18next';


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
        const parsed = insertableUserObject.shape.email.safeParse(value);
        return parsed.success ? null : t('invalidEmailAddress', 'Invalid email address.');
      },
      password: (value) => {
        const parsed = insertableUserObject.shape.password.safeParse(value);
        return parsed.success ? null : t('passwordDoesNotMeetRequirements', 'Password does not meet requirements.');
      },
      confirmPassword: (value, values) => {
        return value === values.password ? null : t('passwordsDoNotMatch', 'Passwords do not match.');
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
          <><Trans i18nKey="strongweHaveSentYouAVerificationLinkstrongBrPleaseCheckYourEmailInbox"><strong>We have sent you a verification link.</strong>
            <br />
            Please check your email inbox.</Trans></>
        ),
        color: 'green',
        autoClose: 15000,
      });
      navigate('/login');
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : t('somethingWentWrongDuringRegistrationPleaseTryAgain', 'Something went wrong during registration. Please try again.');
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
      <Center h={'100vh'}>
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
