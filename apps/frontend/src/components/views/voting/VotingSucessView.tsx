import {
  Alert,
  Button,
  Center,
  Container,
  Stack,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { type JSX } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

interface VotingSuccessLocationState {
  electionName: string;
}
export const VotingSuccessView = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as VotingSuccessLocationState ;

  return (
    <Center mih="100vh">
      <Container w={600}>
        <Stack gap="lg">
          <Alert
            icon={<IconCheck size={18} />}
            color="green"
            variant="filled"
          >
            {t(
              'voteSuccessfullyCast',
              'We have received your vote for {{electionName}}.',
              { electionName: state?.electionName ? state.electionName : t('standardElection', 'the Election') }
            )}
          </Alert>

          <Button
            fullWidth
            onClick={() => navigate('/votingHome')}
          >
            {t('backToHomePage', 'Back to home page')}
          </Button>
        </Stack>
      </Container>
    </Center>
  );
};