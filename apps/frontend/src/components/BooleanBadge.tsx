import { Badge } from '@mantine/core';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';

export interface BooleanBadgeProps {
  isTrue: boolean;
}

export const BooleanBadge = ({ isTrue }: BooleanBadgeProps): JSX.Element => {
  const { t } = useTranslation();
  return isTrue ? (
    <Badge variant="dot" color="red">
      {t('yes', 'Yes')}
    </Badge>
  ) : (
    <Badge variant="dot" color="green">
      {t('no', 'No')}
    </Badge>
  );
};
