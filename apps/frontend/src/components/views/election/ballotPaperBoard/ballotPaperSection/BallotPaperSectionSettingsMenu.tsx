import { Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { SelectableBallotPaperSection, SelectableElection } from '@repo/votura-validators';
import { IconUserCog, IconUserPlus } from '@tabler/icons-react';
import type { JSX, PropsWithChildren } from 'react';
import { CandidatesDrawer } from './candidates/CandidatesDrawer.tsx';
import {
  MutateCandidateDrawer,
  type MutateCandidateDrawerProps,
} from './candidates/MutateCandidateDrawer.tsx';

export interface BallotPaperSectionSettingsMenuProps extends PropsWithChildren {
  onCandidateMutate: MutateCandidateDrawerProps['onMutate'];
  isCandidateMutating: MutateCandidateDrawerProps['isMutating'];
  electionId: SelectableElection['id'];
  ballotPaperSection: SelectableBallotPaperSection;
}

export const BallotPaperSectionSettingsMenu = ({
  children,
  onCandidateMutate,
  isCandidateMutating,
  electionId,
  ballotPaperSection,
}: BallotPaperSectionSettingsMenuProps): JSX.Element => {
  const [mutateCandidateContextOpen, mutateCandidateActions] = useDisclosure(false);
  const [candidatesContextOpen, candidatesContextActions] = useDisclosure(false);

  return (
    <>
      <MutateCandidateDrawer
        opened={mutateCandidateContextOpen}
        onClose={mutateCandidateActions.close}
        mutateButtonText={'Create Candidate'}
        onMutate={onCandidateMutate}
        title={'Create Candidate'}
        isMutating={isCandidateMutating}
      />
      <CandidatesDrawer
        opened={candidatesContextOpen}
        onClose={candidatesContextActions.close}
        electionId={electionId}
        ballotPaperSection={ballotPaperSection}
      />
      <Menu position="bottom-end" offset={0}>
        <Menu.Target>{children}</Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            leftSection={<IconUserPlus size={14} />}
            onClick={mutateCandidateActions.open}
            aria-label={'Add candidate'}
          >
            Add candidate
          </Menu.Item>
          <Menu.Item
            leftSection={<IconUserCog size={14} />}
            onClick={candidatesContextActions.open}
            aria-label={'Edit candidates'}
          >
            Edit candidates
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
};
