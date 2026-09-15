import { Anchor, Button, Center, Container, Group, Stack, Text, Title } from '@mantine/core';
import { useToggle } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import type { PasswordResetUser } from '@repo/votura-validators';
import axios from 'axios';
import { type JSX, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { clearAuthLocalStorage } from '../../../swr/authTokens.ts';
import { useResetPassword } from '../../../swr/useResetPassword.ts';
import {
  getInvalidPasswordResetTokenConfig,
  getPasswordResetSuccessConfig,
} from '../../../utils/notifications.ts';
import { HEADER_HEIGHT } from '../../utils.ts';
import { LoginHeader } from './LoginHeader.tsx';
import { ResetPasswordForm } from './ResetPasswordForm.tsx';

export const ResetPasswordView = (): JSX.Element => {
  const { t } = useTranslation();
  const { trigger, isMutating } = useResetPassword();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isResetting, toggleIsResetting] = useToggle();
  const [tokenError, setTokenError] = useState<string | null>(null);

  const onResetPassword = async (values: PasswordResetUser): Promise<void> => {
    toggleIsResetting();
    setTokenError(null);
    try {
      await trigger(values);

      // Resetting the password clears the refresh token in the backend, so any
      // session that is still stored locally is dead by now.
      clearAuthLocalStorage();
      notifications.show(getPasswordResetSuccessConfig());
      navigate('/login');
    } catch (e: unknown) {
      // The global error handler ignores 401 on purpose, so an invalid or
      // expired token would stay silent without this branch.
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        const config = getInvalidPasswordResetTokenConfig();
        setTokenError(String(config.message));
        notifications.show(config);
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
          <ResetPasswordForm
            initialToken={searchParams.get('token')?.trim() ?? ''}
            isSubmitting={isResetting || isMutating}
            tokenError={tokenError}
            onSubmit={onResetPassword}
          />
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
