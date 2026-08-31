import {
  Alert,
  Button,
  Center,
  Container,
  Image,
  Stack,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { type JSX } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

export const VotingSuccessView = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Center mih="100vh">
      <Container w={350}>
        <Stack gap="lg">
          <Image
            src="/votura-logo.svg"
            alt="Votura"
            fit="contain"
            h={120}
          />

          <Alert
            icon={<IconCheck size={18} />}
            color="green"
            variant="filled"
          >
            {t(
              'voteSuccessfullyCast',
              'We have received your vote.',
            )}
          </Alert>

          <Button
            fullWidth
            onClick={() => navigate('/votingHome')}
          >
            {t('back', 'Back')}
          </Button>
        </Stack>
      </Container>
    </Center>
  );
};