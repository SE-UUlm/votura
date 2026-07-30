import {
  Badge,
  Divider,
  Flex,
  Group,
  Loader,
  Paper,
  Skeleton,
  Space,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconBug } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetUser } from '../../../swr/useGetUser.ts';
import { Avatar } from '../../Avatar.tsx';
import { HEADER_HEIGHT } from '../../utils.ts';

export const AccountView = (): JSX.Element => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useGetUser();

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

  return (
    <>
      <Flex direction={'column'} maw={'100%'} px={'md'} flex={1}>
        <Group justify="space-between" h={HEADER_HEIGHT}>
          <Title order={1}>{t('manageAccount', 'Manage account')}</Title>
        </Group>
        <Divider />
        <Space h={'md'} />
        <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 'md', md: 'xl' }}>
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
          <Skeleton height={'300px'} radius={'md'} animate={true} flex={1} />
        </Flex>
      </Flex>
    </>
  );
};
