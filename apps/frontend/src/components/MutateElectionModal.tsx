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
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';

export interface MutateElectionModalProps {
  election?: MockElection;
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  mutateButtonText: ReactNode;
  onMutate: (mutatedElection: Partial<MockElection>) => void;
  title: ModalProps['title'];
}

export interface MutateElectionFormValues
  extends Pick<MockElection, 'name' | 'description' | 'allowInvalidVotes'> {
  dateRange: [Date, Date];
}

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
      form.setValues({
        name: election.name,
        description: election.description,
        allowInvalidVotes: election.allowInvalidVotes,
        dateRange:
          election.votingStart && election.votingEnd
            ? [election.votingStart, election.votingEnd]
            : [dayjs().toDate(), dayjs().add(1, 'day').toDate()],
      });
    } else {
      form.reset();
    }
    // to prevent infinite render loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [election, opened]);

  const onMutateTransform = () => {
    const formValues = form.getValues();
    onMutate({
      name: formValues.name,
      description: formValues.description,
      allowInvalidVotes: formValues.allowInvalidVotes,
      votingStart: formValues.dateRange[0],
      votingEnd: formValues.dateRange[1],
    });
    onClose();
  };

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
        <DatePickerInput
          type={'range'}
          label={'Voting period'}
          placeholder={'Pick a start and end date'}
          key={form.key('dateRange')}
          {...form.getInputProps('dateRange')}
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
          <Button variant="filled" onClick={onMutateTransform}>
            {mutateButtonText}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
