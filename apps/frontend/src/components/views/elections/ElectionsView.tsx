import { Button, Container, Divider, Group, Space, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { ElectionsTable } from './ElectionsTable.tsx';
import { HEADER_HEIGHT } from '../../utils.ts';
import { type MockElection, useStore } from '../../../store/useStore.ts';
import { MutateElectionModal, type MutateElectionModalProps } from '../../MutateElectionModal.tsx';
import { useDisclosure } from '@mantine/hooks';
import { getDefaultMockElection } from '../../../utils/defaults.ts';
import { notifications } from '@mantine/notifications';
import { getAddSuccessElectionConfig } from '../../../utils/notifications.ts';
import { useNavigate } from 'react-router';

export const ElectionsView = () => {
  const elections = useStore((state) => state.elections);
  const [mutateModalOpened, mutateModalActions] = useDisclosure(false);
  const addElection = useStore((state) => state.addElection);
  const navigate = useNavigate();

  const onMutate: MutateElectionModalProps['onMutate'] = (partial) => {
    const election: MockElection = getDefaultMockElection(partial);
    addElection(election);
    notifications.show(getAddSuccessElectionConfig(election.name));
    navigate(`/elections/${election.id}`);
    return;
  };

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
        <ElectionsTable data={elections} />
      </Container>
    </>
  );
};
