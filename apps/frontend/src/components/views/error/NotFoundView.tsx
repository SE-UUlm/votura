import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorMessage } from './ErrorMessage.tsx';

export const NotFoundView = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <ErrorMessage
      title={t('pageNotFound', 'Page not found')}
      description={t(
        'thePageYouAreLookingForDoesNotExist',
        'The page you are looking for does not exist.',
      )}
    />
  );
};
