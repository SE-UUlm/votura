import { Stack, Text } from '@mantine/core';
import type { ReactNode } from 'react';

export interface ElectionStatFieldProps {
  title: string;
  content: ReactNode;
}

export const ElectionStatField = ({ title, content }: ElectionStatFieldProps) => {
  return (
    <Stack gap="xs">
      <Text c="dimmed" size="sm">
        {title}
      </Text>
      {content}
    </Stack>
  );
};
