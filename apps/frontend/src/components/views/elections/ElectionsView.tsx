import { Button, Container, Divider, Group, Loader, Space, ThemeIcon, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBug, IconPlus } from '@tabler/icons-react';
import { useGetElections } from '../../../swr/elections/useGetElections.ts';
import { MutateElectionModal, type MutateElectionModalProps } from '../../MutateElectionModal.tsx';
import { HEADER_HEIGHT } from '../../utils.ts';
import { ElectionsTable } from './ElectionsTable.tsx';

export const ElectionsView = () => {
  // const elections = useStore((state) => state.elections);

  const { data, isLoading, error } = useGetElections();

  const [mutateModalOpened, mutateModalActions] = useDisclosure(false);
  // const navigate = useNavigate();

  const onMutate: MutateElectionModalProps['onMutate'] = (_partial) => {
    // ADD NEW ELECTION HERE TODO: Implement election creation
    // notifications.show(getAddSuccessElectionConfig(election.name));
    // navigate(`/elections/${election.id}`);
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
      <MutateElectionModal
        opened={mutateModalOpened}
        title={'New Election'}
        onMutate={onMutate}
        onClose={mutateModalActions.close}
        mutateButtonText={'Create new election'}
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
