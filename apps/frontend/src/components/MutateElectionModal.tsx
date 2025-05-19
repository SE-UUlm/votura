import { type MockElection } from '../store/useStore.ts';
import {
  Button,
  Group,
  Modal,
  type ModalProps,
  Stack,
  Switch,
  Textarea,
  TextInput,
} from '@mantine/core';
import { type ReactNode, useEffect } from 'react';
import { useForm } from '@mantine/form';
import { DateTimePicker } from '@mantine/dates';

export interface MutateElectionModalProps {
  election?: MockElection;
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  mutateButtonText: ReactNode;
  onMutate: (mutatedElection: MutateElectionFormValues) => void;
  title: ModalProps['title'];
}

export type MutateElectionFormValues = Pick<
  MockElection,
  'name' | 'description' | 'votingStart' | 'votingEnd' | 'allowInvalidVotes'
>;

export const MutateElectionModal = ({
  election,
  opened,
  onMutate,
  onClose,
  mutateButtonText,
  title,
}: MutateElectionModalProps) => {
  const form = useForm<MutateElectionFormValues>({
    mode: 'uncontrolled',
  });

  useEffect(() => {
    if (!opened) return;

    if (election) {
      form.setValues(election);
    } else {
      form.reset();
    }
    // to prevent infinite render loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [election, opened]);

  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <Stack>
        <TextInput
          label={'Name'}
          placeholder={'e.g. Student Council Election 2025'}
          key={form.key('name')}
          {...form.getInputProps('name')}
        />
        <Textarea
          label={'Description'}
          placeholder={'e.g. This years election on the student council ...'}
          autosize={true}
          minRows={4}
          maxRows={4}
          key={form.key('description')}
          {...form.getInputProps('description')}
        />
        <DateTimePicker
          label={'Start of voting'}
          placeholder={'Pick date and time'}
          key={form.key('votingStart')}
          {...form.getInputProps('votingStart')}
        />
        <DateTimePicker
          label={'End of voting'}
          placeholder={'Pick date and time'}
          key={form.key('votingEnd')}
          {...form.getInputProps('votingEnd')}
        />
        <Switch
          label={'Allow invalid votes'}
          key={form.key('allowInvalidVotes')}
          {...form.getInputProps('allowInvalidVotes', { type: 'checkbox' })}
        />
        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="filled"
            onClick={() => {
              onMutate(form.getValues());
              onClose();
            }}
          >
            {mutateButtonText}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
