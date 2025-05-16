import {Button, Container, Divider, Group, Space, Title} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { ElectionsTable } from './ElectionsTable.tsx';
import {HEADER_HEIGHT} from '../../utils.ts';

export interface MockElection {
  id: string;
  name: string;
  description: string;
  votingStart: Date;
  votingEnd: Date;
  immutableConfig: boolean;
  allowInvalidVotes: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const mockElections: MockElection[] = [
  {
    id: 'election-001',
    name: 'Student Council Election 2025',
    description: 'Election to choose representatives for the student council.',
    votingStart: new Date('2025-06-01T08:00:00Z'),
    votingEnd: new Date('2025-06-05T18:00:00Z'),
    immutableConfig: true,
    allowInvalidVotes: false,
    createdAt: new Date('2025-05-01T10:00:00Z'),
    updatedAt: new Date('2025-05-10T14:30:00Z'),
  },
  {
    id: 'election-002',
    name: 'Board of Directors Vote',
    description: 'Annual vote to elect members to the board of directors.',
    votingStart: new Date('2025-07-10T09:00:00Z'),
    votingEnd: new Date('2025-07-15T17:00:00Z'),
    immutableConfig: false,
    allowInvalidVotes: true,
    createdAt: new Date('2025-05-05T09:00:00Z'),
    updatedAt: new Date('2025-05-12T11:45:00Z'),
  },
  {
    id: 'election-003',
    name: 'City Council Referendum',
    description: 'Public referendum on proposed city infrastructure changes.',
    votingStart: new Date('2025-08-20T07:00:00Z'),
    votingEnd: new Date('2025-08-25T20:00:00Z'),
    immutableConfig: true,
    allowInvalidVotes: false,
    createdAt: new Date('2025-05-08T08:15:00Z'),
    updatedAt: new Date('2025-05-14T16:00:00Z'),
  },
];

export const ElectionsView = () => {
  return (
    <Container fluid>
      <Group justify="space-between" h={HEADER_HEIGHT}>
        <Title order={1}>Elections</Title>
        <Button leftSection={<IconPlus size={16} />} variant="light">
          New Election
        </Button>
      </Group>
      <Divider />
      <Space h={'md'} />
      <ElectionsTable data={mockElections} />
    </Container>
  );
};
