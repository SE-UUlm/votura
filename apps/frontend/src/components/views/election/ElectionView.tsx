import { Navigate, useNavigate, useParams } from 'react-router';
import { ActionIcon, Button, Container, Divider, Group, Loader, Space, Title } from '@mantine/core';
import { HEADER_HEIGHT } from '../../utils.ts';
import { IconArrowLeft, IconDots } from '@tabler/icons-react';
import { useStore } from '../../../store/useStore.ts';
import { ElectionsSettingsMenu } from '../../ElectionSettingsMenu.tsx';
import { notifications } from '@mantine/notifications';
import {getDeleteSuccessElectionConfig} from '../../../utils/notifications.ts';

export type ElectionViewRouteParams = Record<'id', string>;

export const ElectionView = () => {
  const params = useParams<ElectionViewRouteParams>();
  const election = useStore((state) => state.elections.find((e) => e.id === params.id));
  const navigate = useNavigate();
  const deleteElection = useStore((state) => state.deleteElection);

  if (!params.id) {
    return <Navigate to={'/elections'} />;
  }

  if (!election) {
    return (
      <Container>
        <Loader color="blue" />
      </Container>
    );
  }

  const onDelete = () => {
    deleteElection(election.id);
    notifications.show(getDeleteSuccessElectionConfig(election.name));
    navigate('/elections');
  };

  return (
    <Container fluid>
      <Group justify="space-between" h={HEADER_HEIGHT}>
        <Group>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            variant="subtle"
            onClick={() => navigate('/elections')}
          >
            Back to all elections
          </Button>
          <Title order={3}>{election.name}</Title>
        </Group>
        <ElectionsSettingsMenu
          electionId={election.id}
          targetElement={
            <ActionIcon size="lg" variant="light" aria-label="Settings">
              <IconDots size={16} />
            </ActionIcon>
          }
          onDelete={onDelete}
        />
      </Group>
      <Divider />
      <Space h={'md'} />
    </Container>
  );
};
