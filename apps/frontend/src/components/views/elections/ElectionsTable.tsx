import { ActionIcon, Group, Table, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { SelectableElection } from '@repo/votura-validators';
import { IconArrowRight, IconDots } from '@tabler/icons-react';
import type { PropsWithChildren } from 'react';
import { useNavigate } from 'react-router';
import {
  getDeleteSuccessElectionConfig,
  getMutateSuccessElectionConfig,
  getToggleFreezeSuccessElectionConfig,
} from '../../../utils/notifications.ts';
import { BooleanBadge } from '../../BooleanBadge.tsx';
import { ElectionsSettingsMenu } from '../../ElectionSettingsMenu.tsx';
import type { MutateElectionModalProps } from '../../MutateElectionModal.tsx';
import type { ToggleFreezeElectionModalProps } from '../../ToggleFreezeElectionModal.tsx';

export interface ElectionsTableProps {
  data: SelectableElection[];
}

const TableText = ({ children }: PropsWithChildren) => (
  <Text lineClamp={1} size={'sm'}>
    {children}
  </Text>
);

export const ElectionsTable = ({ data }: ElectionsTableProps) => {
  const navigate = useNavigate();

  const onDelete = (election: SelectableElection) => () => {
    // deleteElection(election.id); TODO: implement delete election
    notifications.show(getDeleteSuccessElectionConfig(election.name));
  };

  const onMutate =
    (election: SelectableElection): MutateElectionModalProps['onMutate'] =>
    (mutatedElection) => {
      // updateElection(election.id, mutatedElection); TODO: Implement update election
      notifications.show(getMutateSuccessElectionConfig(mutatedElection?.name ?? election.name));
    };

  const onToggleFreeze =
    (election: SelectableElection): ToggleFreezeElectionModalProps['onToggleFreeze'] =>
    () => {
      notifications.show(
        getToggleFreezeSuccessElectionConfig(election.name, !election.configFrozen),
      );
    };

  const rows = data.map((election) => (
    <Table.Tr key={election.id}>
      <Table.Td>
        <TableText>{election.name}</TableText>
      </Table.Td>
      <Table.Td>
        <TableText>{election.description}</TableText>
      </Table.Td>
      <Table.Td>
        <TableText>{new Date(election.createdAt).toLocaleString('en-US')}</TableText>
      </Table.Td>
      <Table.Td>
        <BooleanBadge isTrue={election.configFrozen} />
      </Table.Td>
      <Table.Td>
        <Group justify="flex-end" gap={'xs'} wrap={'nowrap'}>
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
            isMutating={false} // TODO: Implement update election
          />
          <ActionIcon
            variant="subtle"
            aria-label="Settings"
            onClick={() => {
              navigate(`/elections/${election.id}`);
            }}
          >
            <IconArrowRight size={14} />
          </ActionIcon>
        </Group>
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
