import {
  Box,
  Button,
  Center,
  Container,
  Group,
  PasswordInput,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useToggle } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { passwordResetUserObject } from '@repo/votura-validators';
import { IconInfoCircle } from '@tabler/icons-react';
import { type JSX, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { clearAuthLocalStorage } from '../../../swr/authTokens.ts';
import { useResetPassword } from '../../../swr/useResetPassword.ts';
import { getPasswordResetSuccessConfig } from '../../../utils/notifications.ts';
import { HEADER_HEIGHT } from '../../utils.ts';
import { LoginHeader } from './LoginHeader.tsx';

export const ResetPasswordView = (): JSX.Element => {
  const { t } = useTranslation();
  const { trigger, isMutating } = useResetPassword();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // The link from the email carries the token, the user never sees it.
  const token = searchParams.get('token')?.trim() ?? '';

  const [isResetting, toggleIsResetting] = useToggle();
  const [hasFailed, setHasFailed] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      password: '',
      passwordVerification: '',
    },
    validate: {
      password: (value) => {
        const parsed = passwordResetUserObject.shape.password.safeParse(value);
        return parsed.success
          ? null
          : t('passwordDoesNotMeetRequirements', 'Password does not meet requirements.');
      },
      passwordVerification: (value, values) =>
        value === values.password ? null : t('passwordsDoNotMatch', 'Passwords do not match.'),
    },
  });

  const onResetPassword: Parameters<typeof form.onSubmit>[0] = async (data) => {
    toggleIsResetting();
    try {
      await trigger({ passwordResetToken: token, password: data.password });

      // Resetting the password clears the refresh token in the backend, so a
      // session that is still stored locally is dead by now.
      clearAuthLocalStorage();
      notifications.show(getPasswordResetSuccessConfig());
      navigate('/login');
    } catch {
      // Whatever went wrong, the only way on is a fresh link.
      setHasFailed(true);
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
          {token === '' || hasFailed ? (
            <Stack>
              <Box
                px={'sm'}
                py={'xs'}
                bg={'yellow.0'}
                style={{
                  borderLeft: '4px solid var(--mantine-color-yellow-6)',
                  borderRadius: '4px',
                }}
              >
                <Group align="flex-start" gap="xs" wrap="nowrap">
                  <IconInfoCircle
                    size={36}
                    stroke={2}
                    style={{ color: 'var(--mantine-color-yellow-8)' }}
                  />
                  <Text size={'sm'}>
                    {t(
                      'thisPasswordResetLinkIsInvalidOrHasExpired',
                      'This password reset link is invalid or has expired.',
                    )}
                  </Text>
                </Group>
              </Box>
              <Button fullWidth onClick={(): void | Promise<void> => navigate('/forgotPassword')}>
                {t('requestANewLink', 'Request a new link')}
              </Button>
            </Stack>
          ) : (
            <Box component={'form'} onSubmit={form.onSubmit(onResetPassword)}>
              <Stack>
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
          )}
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
