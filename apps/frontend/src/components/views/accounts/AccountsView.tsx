import { Button, Divider, Flex, Group, Loader, Space, ThemeIcon, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconBug, IconPlus } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateUser } from '../../../swr/useCreateUser.ts';
import { useGetUsers } from '../../../swr/useGetUsers.ts';
import { CreateAccountDrawer, type CreateAccountDrawerProps } from '../../CreateAccountDrawer.tsx';
import { HEADER_HEIGHT } from '../../utils.ts';
import { AccountsTable } from './AccountsTable.tsx';

export const AccountsView = (): JSX.Element => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useGetUsers();

  const { trigger, isMutating } = useCreateUser();

  const [modalOpened, modalActions] = useDisclosure(false);

  const onCreate: CreateAccountDrawerProps['onMutate'] = async (partial) => {
    await trigger(partial);
    notifications.show({
      title: t('success', 'Success'),
      message: t(
        'aNewUserAccountWasCreatedTheUserReceivedAnEmailWithInstructionsAboutHowToCompleteTheAccountSetup',
        'A new user account was created. The user received an email with instructions about how to complete the account setup.',
      ),
      color: 'green',
    });
    return;
  };

  if (isLoading || data === undefined) {
    return <Loader />;
  }

  if (error !== undefined) {
    return (
      <ThemeIcon size="xl" color="red">
        <IconBug style={{ width: '70%', height: '70%' }} />
      </ThemeIcon>
    );
  }

  return (
    <>
      <CreateAccountDrawer
        opened={modalOpened}
        title={t('createAccount', 'Create account')}
        onMutate={onCreate}
        onClose={modalActions.close}
        mutateButtonText={t('createAccount', 'Create account')}
        isMutating={isMutating}
      />
      <Flex direction={'column'} maw={'100%'} px={'md'} flex={1}>
        <Group justify="space-between" h={HEADER_HEIGHT}>
          <Title order={1}>{t('accounts', 'Accounts')}</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            data-testid="new-account-btn"
            variant="light"
            onClick={modalActions.open}
          >
            {t('createAccount', 'Create account')}
          </Button>
        </Group>
        <Divider />
        <Space h={'md'} />
        <AccountsTable data={data} />
      </Flex>
    </>
  );
};
