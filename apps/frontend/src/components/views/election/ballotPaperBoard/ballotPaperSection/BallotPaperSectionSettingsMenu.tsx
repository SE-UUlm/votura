import { Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { SelectableBallotPaperSection, SelectableElection } from '@repo/votura-validators';
import { IconEdit, IconTrash, IconUserCog, IconUserPlus } from '@tabler/icons-react';
import type { JSX, PropsWithChildren } from 'react';
import { CandidatesDrawer } from './candidates/CandidatesDrawer.tsx';
import {
  MutateCandidateDrawer,
  type MutateCandidateDrawerProps,
} from './candidates/MutateCandidateDrawer.tsx';
import { DeleteBallotPaperSectionModal } from './DeleteBallotPaperSectionModal.tsx';
import {
  MutateBallotPaperSectionDrawer,
  type MutateBallotPaperSectionSectionDrawerProps,
} from './MutateBallotPaperSectionSectionDrawer.tsx';

export interface BallotPaperSectionSettingsMenuProps extends PropsWithChildren {
  onCandidateMutate: MutateCandidateDrawerProps['onMutate'];
  isCandidateMutating: MutateCandidateDrawerProps['isMutating'];
  electionId: SelectableElection['id'];
  ballotPaperSection: SelectableBallotPaperSection;
  isMutating: MutateBallotPaperSectionSectionDrawerProps['isMutating'];
  onMutate: MutateBallotPaperSectionSectionDrawerProps['onMutate'];
  onDelete: () => void | Promise<void>;
}

export const BallotPaperSectionSettingsMenu = ({
  children,
  isMutating,
  onMutate,
  onDelete,
  onCandidateMutate,
  isCandidateMutating,
  electionId,
  ballotPaperSection,
}: BallotPaperSectionSettingsMenuProps): JSX.Element => {
  const [mutateSectionContextOpened, mutateSectionContextActions] = useDisclosure(false);
  const [deleteContextOpened, deleteContextActions] = useDisclosure(false);
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
      <MutateBallotPaperSectionDrawer
        title={'Edit ballot paper section'}
        opened={mutateSectionContextOpened}
        onClose={mutateSectionContextActions.close}
        mutateButtonText={'Save changes'}
        onMutate={onMutate}
        isMutating={isMutating}
      />
      <DeleteBallotPaperSectionModal
        ballotPaperSection={ballotPaperSection}
        opened={deleteContextOpened}
        onClose={deleteContextActions.close}
        onDelete={(): void => {
          onDelete();
          deleteContextActions.close();
        }}
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
          <Menu.Item
            leftSection={<IconEdit size={14} />}
            onClick={mutateSectionContextActions.open}
            aria-label={'Edit section'}
          >
            Edit section
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={deleteContextActions.open}
            aria-label={'Delete section'}
          >
            Delete section
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
};
