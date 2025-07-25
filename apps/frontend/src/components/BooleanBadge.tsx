import { Badge } from '@mantine/core';
import type { JSX } from 'react';

export interface BooleanBadgeProps {
  isTrue: boolean;
}

export const BooleanBadge = ({ isTrue }: BooleanBadgeProps): JSX.Element => {
  return isTrue ? (
    <Badge variant="dot" color="red">
      Yes
    </Badge>
  ) : (
    <Badge variant="dot" color="green">
      No
    </Badge>
  );
};
