import {
  Anchor,
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
import { useNavigate } from 'react-router';
import { setAuthLocalStorage } from '../../../swr/authTokens.ts';
import { useLoginUser } from '../../../swr/useLoginUser.ts';

export const LoginView = () => {
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
        return parsed.success ? null : parsed.error.issues.map((issue) => issue.message).join('. ');
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
    } catch (e) {
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
        <form onSubmit={form.onSubmit(onLogin)}>
          <Stack w={400}>
            <Title>Votura</Title>

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
            <Button type={'submit'} loading={isLoginIn || isMutating}>
              Login
            </Button>
            <Button variant="light">Sign Up</Button>
            <Divider />
            <Group justify="space-between">
              <Text size={'sm'}>Can't login anymore?</Text>
              <Anchor component={'button'} variant="transparent" size={'sm'}>
                Reset password
              </Anchor>
            </Group>
          </Stack>
        </form>
      </Center>
    </Container>
  );
};
