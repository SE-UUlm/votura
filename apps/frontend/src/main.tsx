import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { notifications, Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { SWRConfig } from 'swr';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SWRConfig
      value={{
        onError: (err) => {
          console.error(err);
          notifications.show({
            title: 'Error',
            message:
              'We encountered a networking issue. Please try again or get in contact with us',
            autoClose: 10000,
            color: 'red',
          });
        },
      }}
    >
      <MantineProvider>
        <Notifications />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MantineProvider>
    </SWRConfig>
  </StrictMode>,
);
