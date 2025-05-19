import { Menu } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { DeleteElectionModal, type DeleteElectionModalProps } from './DeleteElectionModal.tsx';
import type { MockElection } from '../store/useStore.ts';
import type { ReactNode } from 'react';

export interface ElectionsTableMenuProps {
  electionId: MockElection['id'];
  targetElement: ReactNode;
  onDelete: DeleteElectionModalProps['onDelete'];
}

export const ElectionsSettingsMenu = ({
  electionId,
  targetElement,
  onDelete,
}: ElectionsTableMenuProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <DeleteElectionModal
        electionId={electionId}
        opened={opened}
        onClose={close}
        onDelete={onDelete}
      />
      <Menu position="bottom-end" offset={0}>
        <Menu.Target>{targetElement}</Menu.Target>
        <Menu.Dropdown>
          <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={open}>
            Delete election
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
};
