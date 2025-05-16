import { Button, Group, Modal, type ModalProps, Space, Text } from '@mantine/core';
import { type MockElection, useStore } from '../store/useStore.ts';
import { notifications } from '@mantine/notifications';

export interface DeleteElectionModalProps {
  electionId: MockElection['id'];
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
}

export const DeleteElectionModal = ({ electionId, opened, onClose }: DeleteElectionModalProps) => {
  const election = useStore((state) => state.elections.find((e) => e.id === electionId));
  const deleteElection = useStore((state) => state.deleteElection);

  if (!election) {
    return null;
  }

  const onDelete = () => {
    // add loading state for remote call
    deleteElection(electionId);
    notifications.show({
      title: 'Success',
      message: `You successfully deleted the election: ${election.name}`,
    });
  };

  return (
    <Modal opened={opened} onClose={onClose} title={'Deleting election'}>
      <Text>You are about to delete the election:</Text>
      <Text fw={700}>{election.name}</Text>
      <Space h={'md'} />
      <Group justify="flex-end">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="filled" color="red" onClick={onDelete}>
          Delete
        </Button>
      </Group>
    </Modal>
  );
};
