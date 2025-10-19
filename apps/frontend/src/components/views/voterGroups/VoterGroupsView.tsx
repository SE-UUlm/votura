import { Button, Divider, Flex, Group, Loader, Space, ThemeIcon, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconBug, IconPlus } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useNavigate } from 'react-router';
import { useCreateVoterGroup } from '../../../swr/voterGroups/useCreateVoterGroup.ts';
import { useGetVoterGroups } from '../../../swr/voterGroups/useGetVoterGroups.ts';
import { getAddSuccessVoterGroupConfig } from '../../../utils/notifications.ts';
import {
  MutateVoterGroupDrawer,
  type MutateVoterGroupDrawerProps,
} from '../../MutateVoterGroupDrawer.tsx';
import { HEADER_HEIGHT } from '../../utils.ts';
import { VoterGroupsTable } from './VoterGroupsTable.tsx';

export const VoterGroupsView = (): JSX.Element => {
  const { trigger, isMutating } = useCreateVoterGroup();
  const { data, isLoading, error } = useGetVoterGroups();

  const [mutateModalOpened, mutateModalActions] = useDisclosure(false);
  const navigate = useNavigate();

  const onMutate: MutateVoterGroupDrawerProps['onMutate'] = async (partial) => {
    const response = await trigger(partial);
    notifications.show(getAddSuccessVoterGroupConfig(partial.name));
    navigate(`/voterGroups/${response.id}`);
    return;
  };

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
      <MutateVoterGroupDrawer
        opened={mutateModalOpened}
        title={'New Voter Group'}
        onMutate={onMutate}
        onClose={mutateModalActions.close}
        mutateButtonText={'Create new voter group'}
        isMutating={isMutating}
      />
      <Flex direction={'column'} maw={'100%'} px={'md'} flex={1}>
        <Group justify="space-between" h={HEADER_HEIGHT}>
          <Title order={1}>Voter Groups</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            variant="light"
            onClick={mutateModalActions.open}
          >
            New Voter Group
          </Button>
        </Group>
        <Divider />
        <Space h={'md'} />
        <VoterGroupsTable data={data} />
      </Flex>
    </>
  );
};
