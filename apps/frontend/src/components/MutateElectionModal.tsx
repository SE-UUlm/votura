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
import { DatePickerInput } from '@mantine/dates';
import { isNotEmpty, useForm } from '@mantine/form';
import type { SelectableElection, UpdateableElection } from '@repo/votura-validators';
import { type ReactNode, useEffect } from 'react';

export interface MutateElectionModalProps {
  election?: SelectableElection;
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  mutateButtonText: ReactNode;
  onMutate: (mutatedElection: Partial<UpdateableElection>) => void;
  title: ModalProps['title'];
}

export interface MutateElectionFormValues
  extends Pick<SelectableElection, 'name' | 'description' | 'allowInvalidVotes'> {
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
    validate: {
      name: isNotEmpty('Name cannot be empty'),
      dateRange: isNotEmpty('Start and end date are required'),
    },
  });

  useEffect(() => {
    if (!opened) return;

    if (election) {
      form.setValues({
        name: election.name,
        ...(election.description ? { description: election.description } : undefined),
        allowInvalidVotes: election.allowInvalidVotes,
        dateRange: [new Date(election.votingStartAt), new Date(election.votingEndAt)],
      });
    } else {
      form.reset();
    }
    // to prevent infinite render loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [election, opened]);

  const onMutateTransform = () => {
    const validationResult = form.validate();

    if (validationResult.hasErrors) {
      return;
    }

    const formValues = form.getValues();
    onMutate({
      name: formValues.name,
      ...(formValues.description ? { description: formValues.description } : undefined),
      allowInvalidVotes: formValues.allowInvalidVotes,
      votingStartAt: formValues.dateRange[0].toISOString(),
      votingEndAt: formValues.dateRange[1].toISOString(),
    });
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <Stack>
        <TextInput
          withAsterisk
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
          withAsterisk
          allowSingleDateInRange
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
