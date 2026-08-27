import { Code, Group } from '@mantine/core';
import type { JSX } from 'react';
import { LanguageSwitchingButton } from '../../LanguageSwitchingButton.tsx';
import { HEADER_HEIGHT } from '../../utils.ts';

export const LoginHeader = (): JSX.Element => {
  return (
    <Group justify="space-between" h={HEADER_HEIGHT}>
      <LanguageSwitchingButton />
      <Code fw={700}>v0.0.0</Code>
    </Group>
  );
};
