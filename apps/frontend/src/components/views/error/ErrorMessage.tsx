import { Button, Center, Container, Stack, Text, Title } from '@mantine/core';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { HEADER_HEIGHT } from '../../utils.ts';
import { LoginHeader } from '../login/LoginHeader.tsx';

interface ErrorMessageProps {
  title: string;
  description: string;
}

export const ErrorMessage = ({ title, description }: ErrorMessageProps): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Container fluid h={'100vh'}>
      <LoginHeader />
      <Center h={`calc(100vh - ${HEADER_HEIGHT}px)`}>
        <Stack w={400}>
          <Title>{title}</Title>
          <Text c={'dimmed'}>{description}</Text>
          {/* A link instead of a redirect, so an error on the start page itself does not loop. */}
          <Button fullWidth onClick={(): void | Promise<void> => navigate('/')}>
            {t('backToHomePage', 'Back to home page')}
          </Button>
        </Stack>
      </Center>
    </Container>
  );
};
