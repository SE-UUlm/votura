import {
  Box,
  Button,
  Center,
  Container,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useToggle } from '@mantine/hooks';
import { requestPasswordResetUserObject } from '@repo/votura-validators';
import { type JSX, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useRequestPasswordReset } from '../../../swr/useRequestPasswordReset.ts';
import { HEADER_HEIGHT } from '../../utils.ts';
import { LoginHeader } from './LoginHeader.tsx';
import { PasswordResetRequested } from './PasswordResetRequested.tsx';

export const ForgotPasswordView = (): JSX.Element => {
  const { t } = useTranslation();
  const { trigger, isMutating } = useRequestPasswordReset();
  const navigate = useNavigate();

  const [isRequesting, toggleIsRequesting] = useToggle();
  const [hasRequested, setHasRequested] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => {
        const parsed = requestPasswordResetUserObject.shape.email.safeParse(value);
        return parsed.success ? null : t('invalidEmailAddress', 'Invalid email address.');
      },
    },
  });

  const onRequestPasswordReset: Parameters<typeof form.onSubmit>[0] = async (data) => {
    toggleIsRequesting();
    try {
      await trigger(data);
      setHasRequested(true);
    } catch {
      // Notification is sent automatically, no need to display another one
    } finally {
      toggleIsRequesting();
    }
  };

  return (
    <Container fluid h={'100vh'}>
      <LoginHeader />
      <Center h={`calc(100vh - ${HEADER_HEIGHT}px)`}>
        <Stack w={400}>
          <Title>Votura</Title>
          {hasRequested ? (
            <PasswordResetRequested />
          ) : (
            <Stack>
              <Text size={'sm'} c={'dimmed'}>
                {t(
                  'enterYourEmailAddressAndWeWillSendYouAPasswordResetLink',
                  'Enter your email address and we will send you a password reset link.',
                )}
              </Text>
              <Box component={'form'} onSubmit={form.onSubmit(onRequestPasswordReset)}>
                <Stack>
                  <TextInput
                    withAsterisk
                    label={'Email'}
                    placeholder={'user@votura.org'}
                    key={form.key('email')}
                    {...form.getInputProps('email')}
                  />
                  <Button fullWidth type={'submit'} loading={isRequesting || isMutating}>
                    {t('sendPasswordResetLink', 'Send password reset link')}
                  </Button>
                </Stack>
              </Box>
              <Button
                fullWidth
                variant="subtle"
                onClick={(): void | Promise<void> => navigate('/login')}
              >
                {t('goToLogin', 'Go to login')}
              </Button>
            </Stack>
          )}
        </Stack>
      </Center>
    </Container>
  );
};
