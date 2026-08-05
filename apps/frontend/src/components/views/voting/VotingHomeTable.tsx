import { Group, Table, Text } from '@mantine/core';
import dayjs from 'dayjs';
import type { JSX, PropsWithChildren } from 'react';

export interface ElectionRow {
  id: string;
  name: string;
  description?: string | null;
  votingStartAt: string;
  votingEndAt: string;
}

export interface VoterElectionsTableProps {
  data: ElectionRow[];
}

const status = 'Draft'; // TODO: implement status logic
const TableText = ({ children }: PropsWithChildren): JSX.Element => (
  <Text lineClamp={1} size={'sm'}>
    {children}
  </Text>
);

export const VotingHomeTable = ({ data }: VoterElectionsTableProps): JSX.Element => {
  //const navigate = useNavigate();

  const rows = data.map((election) => {
    //const { trigger, isMutating } = useUpdateElection(election.id);

    return (
      <Table.Tr key={election.id}>
        <Table.Td>
          <TableText>{election.name}</TableText>
        </Table.Td>
        <Table.Td>
          <TableText>{election.description}</TableText>
        </Table.Td>
        <Table.Td>
          <TableText>{status}</TableText>
        </Table.Td>
        <Table.Td>
          <TableText>{dayjs(election.votingStartAt).format('lll')}</TableText>
        </Table.Td>
        <Table.Td>
          <TableText>{dayjs(election.votingEndAt).format('lll')}</TableText>
        </Table.Td>
        <Table.Td>
          <Group justify="flex-end" gap={'xs'} wrap={'nowrap'}>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Table highlightOnHover={true}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Description</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Start</Table.Th>
          <Table.Th>End</Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};