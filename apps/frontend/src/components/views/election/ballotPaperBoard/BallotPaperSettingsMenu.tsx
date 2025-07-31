import { Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { SelectableBallotPaper } from '@repo/votura-validators';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { JSX, PropsWithChildren } from 'react';
import {
  MutateBallotPaperDrawer,
  type MutateBallotPaperDrawerProps,
} from '../MutateBallotPaperDrawer.tsx';
import { DeleteBallotPaperModal } from './DeleteBallotPaperModal.tsx';

export interface BallotPaperSettingsMenuProps extends PropsWithChildren {
  ballotPaper: SelectableBallotPaper;
  onMutate: MutateBallotPaperDrawerProps['onMutate'];
  isMutating: MutateBallotPaperDrawerProps['isMutating'];
  onDelete: () => void | Promise<void>;
}

export const BallotPaperSettingsMenu = ({
  children,
  ballotPaper,
  isMutating,
  onMutate,
  onDelete,
}: BallotPaperSettingsMenuProps): JSX.Element => {
  const [deleteContextOpened, deleteContextActions] = useDisclosure(false);
  const [mutateContextOpened, mutateContextActions] = useDisclosure(false);

  return (
    <>
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
