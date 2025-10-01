import { Box, Drawer, Loader, type ModalProps, Stack } from '@mantine/core';
import {
  type SelectableBallotPaperSection,
  type SelectableCandidate,
  type SelectableElection,
  updateableCandidateOperationOptions,
} from '@repo/votura-validators';
import type { JSX } from 'react';
import { useUpdateCandidateInBallotPaperSection } from '../../../../../../swr/ballotPaperSections/useUpdateCandidateInBallotPaperSection.ts';
import { useGetCandidates } from '../../../../../../swr/candidates/useGetCandidates.ts';
import { CandidateRow } from './CandidateRow.tsx';

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

  const { trigger: triggerUpdateCandidateInBPS, isMutating: isMutatingUpdateCandidateInBPS } =
    useUpdateCandidateInBallotPaperSection(
      electionId,
      ballotPaperSection.ballotPaperId,
      ballotPaperSection.id,
    );

  const onToggleCandidate = async (candidate: SelectableCandidate): Promise<void> => {
    if (ballotPaperSection.candidateIds.includes(candidate.id)) {
      await triggerUpdateCandidateInBPS({
        candidateId: candidate.id,
        operation: updateableCandidateOperationOptions.remove,
      });
    } else {
      await triggerUpdateCandidateInBPS({
        candidateId: candidate.id,
        operation: updateableCandidateOperationOptions.add,
      });
    }
  };

  const rows = electionCandidates
    ?.sort((a, b) => (a.createdAt >= b.createdAt ? 1 : -1))
    .map((candidate) => (
      <CandidateRow
        candidate={candidate}
        bpsCandidates={ballotPaperSection.candidateIds}
        onToggleCandidate={onToggleCandidate}
        isMutatingToggleCandidate={isMutatingUpdateCandidateInBPS}
      />
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
