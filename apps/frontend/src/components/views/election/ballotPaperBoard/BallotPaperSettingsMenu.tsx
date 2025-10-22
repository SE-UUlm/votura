import { Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { SelectableBallotPaper } from '@repo/votura-validators';
import { IconEdit, IconSquarePlus, IconTrash } from '@tabler/icons-react';
import type { JSX, PropsWithChildren } from 'react';
import {
  MutateBallotPaperDrawer,
  type MutateBallotPaperDrawerProps,
} from '../MutateBallotPaperDrawer.tsx';
import { DeleteBallotPaperModal } from './DeleteBallotPaperModal.tsx';
import {
  MutateBallotPaperSectionDrawer,
  type MutateBallotPaperSectionSectionDrawerProps,
} from './ballotPaperSection/MutateBallotPaperSectionSectionDrawer.tsx';

export interface BallotPaperSettingsMenuProps extends PropsWithChildren {
  ballotPaper: SelectableBallotPaper;
  onMutate: MutateBallotPaperDrawerProps['onMutate'];
  isMutating: MutateBallotPaperDrawerProps['isMutating'];
  onSectionMutate: MutateBallotPaperSectionSectionDrawerProps['onMutate'];
  isSectionMutating: MutateBallotPaperSectionSectionDrawerProps['isMutating'];
  onDelete: () => void | Promise<void>;
}

export const BallotPaperSettingsMenu = ({
  children,
  ballotPaper,
  isMutating,
  onMutate,
  onDelete,
  onSectionMutate,
  isSectionMutating,
}: BallotPaperSettingsMenuProps): JSX.Element => {
  const [deleteContextOpened, deleteContextActions] = useDisclosure(false);
  const [mutateContextOpened, mutateContextActions] = useDisclosure(false);
  const [mutateSectionContextOpened, mutateSectionContextActions] = useDisclosure(false);

  return (
    <>
      <MutateBallotPaperSectionDrawer
        title={'Create ballot paper section'}
        opened={mutateSectionContextOpened}
        onClose={mutateSectionContextActions.close}
        mutateButtonText={'Create Section'}
        onMutate={onSectionMutate}
        isMutating={isSectionMutating}
      />
      <MutateBallotPaperDrawer
        ballotPaper={ballotPaper}
        opened={mutateContextOpened}
        onClose={mutateContextActions.close}
        mutateButtonText={'Save changes'}
        onMutate={onMutate}
        title={'Edit ballot paper'}
        isMutating={isMutating}
      />
      <DeleteBallotPaperModal
        ballotPaper={ballotPaper}
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
            leftSection={<IconSquarePlus size={14} />}
            onClick={mutateSectionContextActions.open}
            aria-label={'Add ballot paper section'}
          >
            Add section
          </Menu.Item>
          <Menu.Item leftSection={<IconEdit size={14} />} onClick={mutateContextActions.open}>
            Edit
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={deleteContextActions.open}
          >
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
};
