import { Code, Group, Text } from '@mantine/core';
import type { JSX } from 'react';
import { HEADER_HEIGHT } from '../utils.ts';

export const NavbarHeader = (): JSX.Element => {
  return (
    <Group justify="space-between" h={HEADER_HEIGHT}>
      <Text fw={700}>Votura</Text>
      <Code fw={700}>v0.0.0</Code>
    </Group>
  );
};
