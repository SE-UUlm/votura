import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { notifications, Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import { isAxiosError } from 'axios';
import { extend } from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { SWRConfig } from 'swr';
import { browserRouter } from './browserRouter.ts';

extend(localizedFormat);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SWRConfig
      value={{
        onError: (err): void => {
          if (isAxiosError(err) && err.status !== 401) {
            notifications.show({
              title: 'Error',
              message: err.message,
              autoClose: 10000,
              color: 'red',
            });
          }
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
