import { Stack, Text } from '@mantine/core';
import type { JSX, ReactNode } from 'react';

export interface ElectionStatFieldProps {
  title: string;
  content: ReactNode;
}

export const ElectionStatField = ({ title, content }: ElectionStatFieldProps): JSX.Element => {
  return (
    <Stack gap="xs">
      <Text c="dimmed" size="sm">
        {title}
      </Text>
      {content}
    </Stack>
  );
};
