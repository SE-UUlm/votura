import { Button, Container, Divider, Group, Space, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { ElectionsTable } from './ElectionsTable.tsx';
import { HEADER_HEIGHT } from '../../utils.ts';
import { useStore } from '../../../store/useStore.ts';

export const ElectionsView = () => {
  const elections = useStore((state) => state.elections);

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
      <ElectionsTable data={elections} />
    </Container>
  );
};
