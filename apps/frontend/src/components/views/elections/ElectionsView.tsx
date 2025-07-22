import { Button, Container, Divider, Group, Loader, Space, ThemeIcon, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconBug, IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { useCreateElection } from '../../../swr/elections/useCreateElection.ts';
import { useGetElections } from '../../../swr/elections/useGetElections.ts';
import { getAddSuccessElectionConfig } from '../../../utils/notifications.ts';
import { MutateElectionDrawer, type MutateElectionModalProps } from '../../MutateElectionDrawer.tsx';
import { HEADER_HEIGHT } from '../../utils.ts';
import { ElectionsTable } from './ElectionsTable.tsx';

export const ElectionsView = () => {
  const { trigger, isMutating } = useCreateElection();
  const { data, isLoading, error } = useGetElections();

  const [mutateModalOpened, mutateModalActions] = useDisclosure(false);
  const navigate = useNavigate();

  const onMutate: MutateElectionModalProps['onMutate'] = async (partial) => {
    const response = await trigger(partial);
    notifications.show(getAddSuccessElectionConfig(partial.name));
    navigate(`/elections/${response.id}`);
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
      <MutateElectionDrawer
        opened={mutateModalOpened}
        title={'New Election'}
        onMutate={onMutate}
        onClose={mutateModalActions.close}
        mutateButtonText={'Create new election'}
        isMutating={isMutating}
      />
      <Container fluid>
        <Group justify="space-between" h={HEADER_HEIGHT}>
          <Title order={1}>Elections</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            variant="light"
            onClick={mutateModalActions.open}
          >
            New Election
          </Button>
        </Group>
        <Divider />
        <Space h={'md'} />
        <ElectionsTable data={data} />
      </Container>
    </>
  );
};
