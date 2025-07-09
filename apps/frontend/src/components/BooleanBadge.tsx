import { Badge } from '@mantine/core';

export interface BooleanBadgeProps {
  isTrue: boolean;
}

export const BooleanBadge = ({ isTrue }: BooleanBadgeProps) => {
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
