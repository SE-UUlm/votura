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
import { insertableUserObject } from '@repo/votura-validators';
import type { JSX } from 'react';
import { useNavigate } from 'react-router';
import { setAuthLocalStorage } from '../../../swr/authTokens.ts';
import { useLoginUser } from '../../../swr/useLoginUser.ts';

export const LoginView = (): JSX.Element => {
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
        const parsed = insertableUserObject.shape.email.safeParse(value);
        return parsed.success ? null : 'Invalid email address.';
      },
    },
  });

  const [isLoginIn, toggleIsLoginIn] = useToggle();

  const onLogin: Parameters<typeof form.onSubmit>[0] = async (data) => {
    toggleIsLoginIn();
    try {
      const response = await trigger(data);
      setAuthLocalStorage(response);
      navigate('/elections');
    } catch (e: unknown) {
      notifications.show({
        title: 'Could not login',
        message: 'We do not know this combination of email and password. Please try again.',
        color: 'yellow',
        autoClose: 15000,
      });
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
                placeholder={'My secure password...'}
                key={form.key('password')}
                {...form.getInputProps('password')}
              />
              <Button fullWidth type={'submit'} loading={isLoginIn || isMutating}>
                Login
              </Button>
            </Stack>
          </Box>
          <Button variant="light" onClick={() => navigate('/register')}>Sign Up</Button>
          <Divider />
          <Group justify="space-between">
            <Text size={'sm'}>Can't login anymore?</Text>
            <Anchor component={'button'} variant="transparent" size={'sm'}>
              Reset password
            </Anchor>
          </Group>
        </Stack>
      </Center>
    </Container>
  );
};
