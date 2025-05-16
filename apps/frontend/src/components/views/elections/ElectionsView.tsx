import { Button, Container, Group, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export const ElectionsView = () => {
  return (
    <Container fluid pt={'xs'}>
      <Group justify="space-between">
        <Title order={1} lh={1}>Elections</Title>
        <Button leftSection={<IconPlus size={16} />} variant="light">
          New Election
        </Button>
      </Group>
    </Container>
  );
};
