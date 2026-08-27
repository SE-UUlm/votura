import { Box, Button, Center, Container, PasswordInput, Stack, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { type JSX, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSetPassword } from '../../../swr/useSetPassword.ts';

export const SetPasswordView = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Get userId and otp from GET parameters
  const parameters = new URLSearchParams(window.location.search);
  const userId = parameters.get('userId');
  const otp = parameters.get('otp');

  useEffect(() => {
    if (userId === null || otp === null) {
      navigate('/login');
    }
  });

  const { trigger, isMutating } = useSetPassword();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      newPassword: '',
      newPasswordVerification: '',
    },
  });

  const onSetPassword: Parameters<typeof form.onSubmit>[0] = async (data) => {
    await trigger({
      ...data,
      currentPassword: otp as string,
      userId: userId as string,
    });
    notifications.show({
      title: t('success', 'Success'),
      message: t(
        'yourPasswordWasSavedYouCanLogInNow',
        'Your password was saved. You can log in now.',
      ),
      color: 'green',
    });
    navigate('/login');
  };

  return (
    <Container fluid h={'100vh'}>
      <Center h={'100vh'}>
        <Stack w={400}>
          <Title>Votura</Title>
          <Box component={'form'} onSubmit={form.onSubmit(onSetPassword)}>
            <Stack>
              <PasswordInput
                withAsterisk
                label={t('newPassword', 'New password')}
                placeholder={t('newPassword', 'New password')}
                key={form.key('newPassword')}
                {...form.getInputProps('newPassword')}
              />
              <PasswordInput
                withAsterisk
                label={t('repeatNewPassword', 'Repeat new password')}
                placeholder={t('repeatNewPassword', 'Repeat new password')}
                key={form.key('newPasswordVerification')}
                {...form.getInputProps('newPasswordVerification')}
              />
              <Button fullWidth type={'submit'} loading={isMutating}>
                {t('setPassword', 'Set password')}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Center>
    </Container>
  );
};
