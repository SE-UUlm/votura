import { Button, Divider, Flex, Group, Space, Title } from '@mantine/core';
import type { JSX } from 'react';
import type { SelectableVotingElection } from '@repo/votura-validators';
import { HEADER_HEIGHT } from '../../utils.ts';
import { IconPlus } from '@tabler/icons-react';
import { VotingHomeTable, type ElectionRow } from './VotingHomeTable.tsx';
import { getVoterLocalStorage } from '../../../swr/voterToken.ts';
import { useGetVoterElections } from '../../../swr/voting/useGetVoterElections.ts';

export const VotingHomeView = (): JSX.Element => {

  const voterToken = getVoterLocalStorage();
  //const navigate = useNavigate();

  const voterElectionsHook = useGetVoterElections({ token: voterToken });

  const voterData = voterElectionsHook.data;

  const mappedVoter: ElectionRow[] = (voterData ?? []).map((e: SelectableVotingElection) => ({
    id: e.id,
    name: e.name,
    description: e.description ?? null,
    votingStartAt: e.votingStartAt,
    votingEndAt: e.votingEndAt,
  }));

  const data: ElectionRow[] = voterToken ? mappedVoter : [];

  //const [mutateModalOpened, mutateModalActions] = useDisclosure(false);
  //const navigate = useNavigate();

  return (
    <>
      <Flex direction={'column'} maw={'100%'} px={'md'} flex={1}>
        <Group justify="space-between" h={HEADER_HEIGHT}>
          <Title order={1}>Elections</Title>
          <Group>
            <Button leftSection={<IconPlus size={16} />} variant="light">
              Submit Vote
            </Button>
          </Group>
        </Group>
        <Divider />
        <Space h={'md'} />
        <VotingHomeTable data={data} />
      </Flex>
    </>
  );
};