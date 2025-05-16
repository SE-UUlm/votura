import { ActionIcon, Menu } from '@mantine/core';
import { IconDots, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { DeleteElectionModal } from '../../DeleteElectionModal.tsx';
import type { MockElection } from '../../../store/useStore.ts';

export interface ElectionsTableMenuProps {
  electionId: MockElection['id'];
}

export const ElectionsTableMenu = ({ electionId }: ElectionsTableMenuProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <DeleteElectionModal electionId={electionId} opened={opened} onClose={close} />
      <Menu position="bottom-end" offset={0}>
        <Menu.Target>
          <ActionIcon variant="subtle" aria-label="Settings">
            <IconDots size={14} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={open}>
            Delete election
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
};
