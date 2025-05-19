import { ActionIcon, Button, Group, Title } from '@mantine/core';
import { HEADER_HEIGHT } from '../../utils.ts';
import { IconArrowLeft, IconDots } from '@tabler/icons-react';
import { ElectionsSettingsMenu } from '../../ElectionSettingsMenu.tsx';
import { useNavigate } from 'react-router';
import { notifications } from '@mantine/notifications';
import { getDeleteSuccessElectionConfig } from '../../../utils/notifications.ts';
import { type MockElection, useStore } from '../../../store/useStore.ts';

export interface ElectionViewHeaderProps {
  election: MockElection;
}

export const ElectionViewHeader = ({ election }: ElectionViewHeaderProps) => {
  const navigate = useNavigate();
  const deleteElection = useStore((state) => state.deleteElection);

  const onDelete = () => {
    deleteElection(election.id);
    notifications.show(getDeleteSuccessElectionConfig(election.name));
    navigate('/elections');
  };
  return (
    <>
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
    </>
  );
};
