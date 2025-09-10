import {
  ActionIcon,
  Box,
  Checkbox,
  Drawer,
  Group,
  Loader,
  type ModalProps,
  Stack,
  Text,
} from '@mantine/core';
import type { SelectableBallotPaperSection, SelectableElection } from '@repo/votura-validators';
import { IconSettings, IconTrash } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useGetCandidates } from '../../../../../../swr/candidates/useGetCandidates.ts';

export interface CandidatesDrawerProps {
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  electionId: SelectableElection['id'];
  ballotPaperSection: SelectableBallotPaperSection;
}

export const CandidatesDrawer = ({
  opened,
  onClose,
  electionId,
  ballotPaperSection,
}: CandidatesDrawerProps): JSX.Element => {
  const { data: electionCandidates, isLoading: isLoadingElectionCandidates } =
    useGetCandidates(electionId);

  const rows = electionCandidates?.map((candidate) => (
    <Group key={candidate.id} justify="space-between" wrap={'nowrap'}>
      <Checkbox checked={ballotPaperSection.candidateIds.includes(candidate.id)} />
      <Text truncate="end" flex={1}>
        {candidate.title}
      </Text>
      <Group>
        <ActionIcon variant={'transparent'}>
          <IconSettings style={{ width: '70%', height: '70%' }} stroke={1.5} />
        </ActionIcon>
        <ActionIcon variant={'transparent'} color="red">
          <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
        </ActionIcon>
      </Group>
    </Group>
  ));

  return (
    <Drawer.Root opened={opened} onClose={onClose} position={'right'} offset={16} radius={'md'}>
      <Drawer.Overlay />
      <Drawer.Content>
        <Box>
          <Drawer.Header>
            <Drawer.Title>All Candidates</Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body>
            {isLoadingElectionCandidates ? <Loader /> : <Stack>{rows}</Stack>}
          </Drawer.Body>
        </Box>
      </Drawer.Content>
    </Drawer.Root>
  );
};
