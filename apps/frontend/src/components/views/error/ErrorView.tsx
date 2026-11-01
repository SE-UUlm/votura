import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorMessage } from './ErrorMessage.tsx';

export const ErrorView = (): JSX.Element => {
  const { t } = useTranslation();

  // The error itself is not shown, so no stack trace or internals reach the user.
  return (
    <ErrorMessage
      title={t('somethingWentWrong', 'Something went wrong')}
      description={t(
        'anUnexpectedErrorHasOccurredPleaseTryAgainLater',
        'An unexpected error has occurred. Please try again later.',
      )}
    />
  );
};
