import { Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconUserPlus } from '@tabler/icons-react';
import type { JSX, PropsWithChildren } from 'react';
import {
  MutateCandidateDrawer,
  type MutateCandidateDrawerProps,
} from './candidates/MutateCandidateDrawer.tsx';

export interface BallotPaperSectionSettingsMenu extends PropsWithChildren {
  onCandidateMutate: MutateCandidateDrawerProps['onMutate'];
  isCandidateMutating: MutateCandidateDrawerProps['isMutating'];
}

export const BallotPaperSectionSettingsMenu = ({
  children,
  onCandidateMutate,
  isCandidateMutating,
}: BallotPaperSectionSettingsMenu): JSX.Element => {
  const [mutateCandidateContextOpen, mutateCandidateActions] = useDisclosure(false);

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
      <Menu position="bottom-end" offset={0}>
        <Menu.Target>{children}</Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            leftSection={<IconUserPlus size={14} />}
            onClick={mutateCandidateActions.open}
            aria-label={'Add ballot paper section'}
          >
            Add candidate
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
};
