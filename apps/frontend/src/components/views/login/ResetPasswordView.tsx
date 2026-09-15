import {
  Anchor,
  Box,
  Button,
  Center,
  Container,
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
import { passwordResetUserObject } from '@repo/votura-validators';
import axios from 'axios';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { clearAuthLocalStorage } from '../../../swr/authTokens.ts';
import { useResetPassword } from '../../../swr/useResetPassword.ts';
import { HEADER_HEIGHT } from '../../utils.ts';
import { LoginHeader } from './LoginHeader.tsx';

export const ResetPasswordView = (): JSX.Element => {
  const { t } = useTranslation();
  const { trigger, isMutating } = useResetPassword();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isResetting, toggleIsResetting] = useToggle();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      // The mail links to /resetPassword?token=..., but it also prints the raw
      // token, so the field stays editable for everyone who has to paste it.
      passwordResetToken: searchParams.get('token')?.trim() ?? '',
      password: '',
      passwordVerification: '',
    },
    validate: {
      passwordResetToken: (value) => {
        const parsed = passwordResetUserObject.shape.passwordResetToken.safeParse(value.trim());
        return parsed.success
          ? null
          : t('invalidPasswordResetToken', 'Invalid password reset token.');
      },
      password: (value) => {
        const parsed = passwordResetUserObject.shape.password.safeParse(value);
        if (!parsed.success) {
          return t('passwordDoesNotMeetRequirements', 'Password does not meet requirements.');
        }

        return null;
      },
      passwordVerification: (value, values) => {
        if (value !== values.password) {
          return t('passwordsDoNotMatch', 'Passwords do not match.');
        }

        return null;
      },
    },
  });

  const onResetPassword: Parameters<typeof form.onSubmit>[0] = async (data) => {
    toggleIsResetting();
    try {
      await trigger({
        passwordResetToken: data.passwordResetToken.trim(),
        password: data.password,
      });

      // Resetting the password clears the refresh token in the backend, so any
      // session that is still stored locally is dead by now.
      clearAuthLocalStorage();
      form.reset();
      notifications.show({
        title: t('success', 'Success'),
        message: t(
          'passwordResetSuccessfullyPleaseLoginWithYourNewPassword',
          'Password reset successfully. Please login with your new password.',
        ),
        color: 'green',
      });
      navigate('/login');
    } catch (e: unknown) {
      // The global error handler ignores 401 on purpose, so an invalid or
      // expired token would stay silent without this branch.
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        const message = t(
          'theTokenIsInvalidOrHasExpiredPleaseRequestANewOne',
          'The token is invalid or has expired. Please request a new one.',
        );
        form.setFieldError('passwordResetToken', message);
        notifications.show({
          title: t('couldNotResetPassword', 'Could not reset password'),
          message,
          color: 'yellow',
          autoClose: 15000,
        });
      }
      // Notification for every other error is sent automatically
    } finally {
      toggleIsResetting();
    }
  };

  return (
    <Container fluid h={'100vh'}>
      <LoginHeader />
      <Center h={`calc(100vh - ${HEADER_HEIGHT}px)`}>
        <Stack w={400}>
          <Title>Votura</Title>
          <Text size={'sm'} c={'dimmed'}>
            {t(
              'pasteTheTokenFromTheEmailOrUseTheLinkWeSentYou',
              'Paste the token from the email or use the link we sent you.',
            )}
          </Text>
          <Box component={'form'} onSubmit={form.onSubmit(onResetPassword)}>
            <Stack>
              <TextInput
                withAsterisk
                label={t('passwordResetToken', 'Password reset token')}
                placeholder={t(
                  'pasteTheTokenFromTheEmailHere',
                  'Paste the token from the email here.',
                )}
                key={form.key('passwordResetToken')}
                {...form.getInputProps('passwordResetToken')}
              />
              <PasswordInput
                withAsterisk
                label={t('newPassword', 'New password')}
                placeholder={t('mySecurePassword', 'My secure password...')}
                key={form.key('password')}
                {...form.getInputProps('password')}
              />
              <PasswordInput
                withAsterisk
                label={t('repeatNewPassword', 'Repeat new password')}
                placeholder={t('mySecurePassword', 'My secure password...')}
                key={form.key('passwordVerification')}
                {...form.getInputProps('passwordVerification')}
              />
              <Button fullWidth type={'submit'} loading={isResetting || isMutating}>
                {t('setNewPassword', 'Set new password')}
              </Button>
            </Stack>
          </Box>
          <Group justify="space-between">
            <Text size={'sm'}>{t('noTokenAnymore', 'No token anymore?')}</Text>
            <Anchor
              component={'button'}
              type={'button'}
              variant="transparent"
              size={'sm'}
              onClick={(): void | Promise<void> => navigate('/forgotPassword')}
            >
              {t('requestANewToken', 'Request a new token')}
            </Anchor>
          </Group>
          <Button
            fullWidth
            variant="subtle"
            onClick={(): void | Promise<void> => navigate('/login')}
          >
            {t('goToLogin', 'Go to login')}
          </Button>
        </Stack>
      </Center>
    </Container>
  );
};
