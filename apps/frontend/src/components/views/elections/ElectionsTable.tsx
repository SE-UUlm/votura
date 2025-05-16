import { Badge, Table } from '@mantine/core';
import { ElectionsTableMenu } from './ElectionTableMenu.tsx';
import type { MockElection } from '../../../store/useStore.ts';

export interface ElectionsTableProps {
  data: MockElection[];
}

export const ElectionsTable = ({ data }: ElectionsTableProps) => {
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
      <Table.Td>
        <ElectionsTableMenu electionId={election.id} />
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
