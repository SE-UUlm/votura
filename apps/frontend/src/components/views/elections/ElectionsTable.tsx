import { ActionIcon, Badge, Table } from '@mantine/core';
import { ElectionsSettingsMenu } from '../../ElectionSettingsMenu.tsx';
import { type MockElection, useStore } from '../../../store/useStore.ts';
import { useNavigate } from 'react-router';
import { IconArrowRight, IconDots } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import {
  getDeleteSuccessElectionConfig,
  getMutateSuccessElectionConfig,
  getToggleFreezeSuccessElectionConfig,
} from '../../../utils/notifications.ts';
import type { MutateElectionModalProps } from '../../MutateElectionModal.tsx';
import type { ToggleFreezeElectionModalProps } from '../../ToggleFreezeElectionModal.tsx';

export interface ElectionsTableProps {
  data: MockElection[];
}

export const ElectionsTable = ({ data }: ElectionsTableProps) => {
  const navigate = useNavigate();
  const deleteElection = useStore((state) => state.deleteElection);
  const updateElection = useStore((state) => state.updateElection);

  const onDelete = (election: MockElection) => () => {
    deleteElection(election.id);
    notifications.show(getDeleteSuccessElectionConfig(election.name));
  };

  const onMutate =
    (election: MockElection): MutateElectionModalProps['onMutate'] =>
    (mutatedElection) => {
      updateElection(election.id, mutatedElection);
      notifications.show(getMutateSuccessElectionConfig(election.name));
    };

  const onToggleFreeze =
    (election: MockElection): ToggleFreezeElectionModalProps['onToggleFreeze'] =>
    () => {
      updateElection(election.id, { immutableConfig: !election.immutableConfig });
      notifications.show(
        getToggleFreezeSuccessElectionConfig(election.name, !election.immutableConfig),
      );
    };

  const rows = data.map((election) => (
    <Table.Tr key={election.id}>
      <Table.Td>{election.name}</Table.Td>
      <Table.Td>{election.description}</Table.Td>
      <Table.Td>{election.createdAt.toLocaleString('en-US')}</Table.Td>
      <Table.Td>
        {election.immutableConfig ? (
          <Badge variant="dot" color="red">
            Yes
          </Badge>
        ) : (
          <Badge variant="dot" color="green">
            No
          </Badge>
        )}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <ElectionsSettingsMenu
          election={election}
          targetElement={
            <ActionIcon variant="subtle" aria-label="Settings">
              <IconDots size={14} />
            </ActionIcon>
          }
          onDelete={onDelete(election)}
          onMutate={onMutate(election)}
          onToggleFreeze={onToggleFreeze(election)}
        />
        <ActionIcon
          variant="subtle"
          aria-label="Settings"
          onClick={() => navigate(`/elections/${election.id}`)}
        >
          <IconArrowRight size={14} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table highlightOnHover={true}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Description</Table.Th>
          <Table.Th>Created at</Table.Th>
          <Table.Th>Frozen</Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};
