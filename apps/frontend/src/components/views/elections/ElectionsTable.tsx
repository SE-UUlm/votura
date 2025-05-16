import { Badge, Table } from '@mantine/core';
import type { MockElection } from './ElectionsView.tsx';

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
    </Table.Tr>
  ));

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Description</Table.Th>
          <Table.Th>Created at</Table.Th>
          <Table.Th>Frozen</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};
