import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { notifications, Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import { isAxiosError } from 'axios';
import { extend } from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import i18next from 'i18next';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { SWRConfig } from 'swr';
import { browserRouter } from './browserRouter.ts';
import './i18n';

extend(localizedFormat);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SWRConfig
      value={{
        onError: (err): void => {
          if (isAxiosError(err) && err.status !== 401) {
            notifications.show({
              title: i18next.t('error', 'Error'),
              message: err.message,
              autoClose: 10000,
              color: 'red',
            });
          }
        },
        onErrorRetry: (error, _key, config, revalidate, { retryCount }): void => {
          const skippedErrors = [400, 401, 402, 403, 405, 406, 407, 411, 413, 415, 429];
          if (
            isAxiosError(error) &&
            typeof error.response?.status === 'number' &&
            skippedErrors.includes(error.response?.status)
          ) {
            return;
          }

          if (retryCount >= 3) {
            return;
          }

          window.setTimeout(() => {
            void revalidate({ retryCount: retryCount + 1 });
          }, config.errorRetryInterval);
        },
      }}
    >
      <MantineProvider>
        <Notifications />
        <RouterProvider router={browserRouter} />
      </MantineProvider>
    </SWRConfig>
  </StrictMode>,
);
