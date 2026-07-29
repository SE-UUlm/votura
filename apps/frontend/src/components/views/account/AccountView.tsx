import { Divider, Flex, Group, Loader, Space, ThemeIcon, Title } from '@mantine/core';
import { IconBug } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetUser } from '../../../swr/useGetUser.ts';
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

  return (
    <>
      <Flex direction={'column'} maw={'100%'} px={'md'} flex={1}>
        <Group justify="space-between" h={HEADER_HEIGHT}>
          <Title order={1}>{t('manageAccount', 'Manage account')}</Title>
        </Group>
        <Divider />
        <Space h={'md'} />
        {/* TODO: User details */}
      </Flex>
    </>
  );
};
