import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Loader,
  Paper,
  PasswordInput,
  Space,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { insertableUserObject } from '@repo/votura-validators';
import { IconBug } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { getUserIdFromAuthLocalStorage } from '../../../swr/authTokens.ts';
import { useChangePassword } from '../../../swr/useChangePassword.ts';
import { useGetUser } from '../../../swr/useGetUser.ts';
import { Avatar } from '../../Avatar.tsx';
import { HEADER_HEIGHT } from '../../utils.ts';

export const AccountView = (): JSX.Element => {
  const { t } = useTranslation();

  const userId = getUserIdFromAuthLocalStorage();
  if (!userId) {
    return (
      <ThemeIcon size="xl" color="red">
        <IconBug style={{ width: '70%', height: '70%' }} />
      </ThemeIcon>
    );
  }

  const { data, isLoading, error } = useGetUser(userId);
  const { trigger: triggerChangePassword, isMutating } = useChangePassword();
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      currentPassword: '',
      newPassword: '',
      newPasswordVerification: '',
    },
    validate: {
      currentPassword: (value) => {
        if (value.length <= 0) {
          return t('currentPasswordIsRequired', 'Current password is required.');
        }

        return null;
      },
      newPassword: (value) => {
        const parsed = insertableUserObject.shape.password.safeParse(value);
        if (!parsed.success) {
          return t('passwordDoesNotMeetRequirements', 'Password does not meet requirements.');
        }

        return null;
      },
      newPasswordVerification: (value, values) => {
        if (value !== values.newPassword) {
          return t('passwordsDoNotMatch', 'Passwords do not match.');
        }

        return null;
      },
    },
  });

  if (isLoading || data === undefined) {
    return <Loader />;
  }

  if (error) {
    return (
      <ThemeIcon size="xl" color="red">
        <IconBug style={{ width: '70%', height: '70%' }} />
      </ThemeIcon>
    );
  }

  let memberSince = '';
  if (data && data.createdAt) {
    const memberSinceDate = new Date(data.createdAt);
    memberSince = t('memberSince', 'Member since');
    memberSince += ' ';
    memberSince += memberSinceDate.toLocaleDateString([], {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  const onChangePassword: Parameters<typeof form.onSubmit>[0] = async (values) => {
    await triggerChangePassword(values);
    notifications.show({
      title: t('success', 'Success'),
      message: t('passwordChangedSuccessfully', 'Password changed successfully.'),
      color: 'green',
    });
    form.reset();
  };

  return (
    <>
      <Flex direction={'column'} maw={'100%'} px={'md'} flex={1}>
        <Group justify="space-between" h={HEADER_HEIGHT}>
          <Title order={1}>{t('manageAccount', 'Manage account')}</Title>
        </Group>
        <Divider />
        <Space h={'md'} />
        <Flex direction={{ base: 'column', sm: 'row' }} gap={{ base: 'md', md: 'xl' }}>
          <Paper
            shadow={'sm'}
            p={'xl'}
            radius={'md'}
            withBorder
            w={{ base: '100%', md: 'fit-content' }}
          >
            <Stack align={'center'}>
              <Avatar userId={data.id} email={data.email} />
              {(data as { role?: string }).role === 'admin' ? (
                <Badge variant={'light'} color={'red'}>
                  {t('administrator', 'Administrator')}
                </Badge>
              ) : (
                <Badge variant={'light'} color={'blue'}>
                  {t('user', 'User')}
                </Badge>
              )}
              <Text>{data.email}</Text>
              {memberSince !== '' ? (
                <Text size={'sm'} c={'dimmed'}>
                  {memberSince}
                </Text>
              ) : null}
            </Stack>
          </Paper>

          <Box
            component={'form'}
            onSubmit={form.onSubmit(onChangePassword)}
            flex={{ base: '0 1 auto', md: '1 1 auto' }}
            maw={'28em'}
          >
            <Stack w={'100%'}>
              <Title order={4}>{t('changePassword', 'Change password')}</Title>
              <PasswordInput
                withAsterisk
                label={t('currentPassword', 'Current password')}
                placeholder={t('currentPassword', 'Current password')}
                key={form.key('currentPassword')}
                {...form.getInputProps('currentPassword')}
              />
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
              <Button type={'submit'} loading={isMutating}>
                {t('changePassword', 'Change password')}
              </Button>
            </Stack>
          </Box>
        </Flex>
      </Flex>
    </>
  );
};
