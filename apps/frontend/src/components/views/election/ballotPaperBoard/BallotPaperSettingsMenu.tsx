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
import { useTranslation } from 'react-i18next';


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
  const { t } = useTranslation();
  const [deleteContextOpened, deleteContextActions] = useDisclosure(false);
  const [mutateContextOpened, mutateContextActions] = useDisclosure(false);
  const [mutateSectionContextOpened, mutateSectionContextActions] = useDisclosure(false);

  return (
    <>
      <MutateBallotPaperSectionDrawer
        title={t('createBallotPaperSection', 'Create ballot paper section')}
        opened={mutateSectionContextOpened}
        onClose={mutateSectionContextActions.close}
        mutateButtonText={t('createSection', 'Create Section')}
        onMutate={onSectionMutate}
        isMutating={isSectionMutating}
      />
      <MutateBallotPaperDrawer
        ballotPaper={ballotPaper}
        opened={mutateContextOpened}
        onClose={mutateContextActions.close}
        mutateButtonText={t('saveChanges', 'Save changes')}
        onMutate={onMutate}
        title={t('editBallotPaper', 'Edit ballot paper')}
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
            aria-label={t('addBallotPaperSection', 'Add ballot paper section')}
          >
            {t('addSection', 'Add section')}
          </Menu.Item>
          <Menu.Item leftSection={<IconEdit size={14} />} onClick={mutateContextActions.open}>
            {t('edit', 'Edit')}
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={deleteContextActions.open}
          >
            {t('delete', 'Delete')}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
};
