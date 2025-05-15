import { Code, Group, Text } from '@mantine/core';

export const NavbarHeader = () => {
  return (
    <Group justify="space-between" pt={'md'} pb={'md'}>
      <Text fw={700}>Votura</Text>
      <Code fw={700}>v0.0.1</Code>
    </Group>
  );
};
