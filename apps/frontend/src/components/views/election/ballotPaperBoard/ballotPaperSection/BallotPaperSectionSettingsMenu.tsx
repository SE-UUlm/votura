import { Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { SelectableBallotPaperSection, SelectableElection } from '@repo/votura-validators';
import { IconUserCog, IconUserPlus } from '@tabler/icons-react';
import type { JSX, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [mutateCandidateContextOpen, mutateCandidateActions] = useDisclosure(false);
  const [candidatesContextOpen, candidatesContextActions] = useDisclosure(false);

  return (
    <>
      <MutateCandidateDrawer
        opened={mutateCandidateContextOpen}
        onClose={mutateCandidateActions.close}
        mutateButtonText={t('createCandidate', 'Create Candidate')}
        onMutate={onCandidateMutate}
        title={t('createCandidate', 'Create Candidate')}
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
            aria-label={t('addCandidate', 'Add candidate')}
          >
            {t('addCandidate', 'Add candidate')}
          </Menu.Item>
          <Menu.Item
            leftSection={<IconUserCog size={14} />}
            onClick={candidatesContextActions.open}
            aria-label={t('editCandidates', 'Edit candidates')}
          >
            {t('editCandidates', 'Edit candidates')}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
};
