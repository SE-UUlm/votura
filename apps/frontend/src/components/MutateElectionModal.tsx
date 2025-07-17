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
import { DateTimePicker } from '@mantine/dates';
import { isNotEmpty, useForm } from '@mantine/form';
import type { SelectableElection, UpdateableElection } from '@repo/votura-validators';
import { type ReactNode, useEffect } from 'react';

export interface MutateElectionModalProps {
  election?: UpdateableElection;
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  mutateButtonText: ReactNode;
  onMutate: (mutatedElection: UpdateableElection) => void | Promise<void>;
  title: ModalProps['title'];
  isMutating: boolean;
}

export interface MutateElectionFormValues
  extends Pick<SelectableElection, 'name' | 'description' | 'allowInvalidVotes'> {
  startDateTime: string;
  endDateTime: string;
}

export const MutateElectionModal = ({
  election,
  opened,
  onMutate,
  onClose,
  mutateButtonText,
  title,
  isMutating,
}: MutateElectionModalProps) => {
  const form = useForm<MutateElectionFormValues>({
    mode: 'uncontrolled',
    validate: {
      name: isNotEmpty('Name cannot be empty'),
      startDateTime: isNotEmpty('Start date is required'),
      endDateTime: (value: string | null, values: { startDateTime: string }) =>
        value
          ? new Date(value) > new Date(values.startDateTime)
            ? null
            : 'End has to be after start'
          : 'End date is required',
    },
    validateInputOnBlur: true,
  });

  useEffect(() => {
    if (!opened) return;

    if (election) {
      form.setValues({
        name: election.name,
        ...(election.description !== undefined ? { description: election.description } : undefined),
        allowInvalidVotes: election.allowInvalidVotes,
        startDateTime: election.votingStartAt,
        endDateTime: election.votingEndAt,
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
      votingStartAt: new Date(formValues.startDateTime).toISOString(),
      votingEndAt: new Date(formValues.endDateTime).toISOString(),
      private: true,
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
        <Group grow>
          <DateTimePicker
            withAsterisk
            label={'Start of voting period'}
            placeholder={'Pick a start date and time'}
            key={form.key('startDateTime')}
            {...form.getInputProps('startDateTime')}
          />
          <DateTimePicker
            withAsterisk
            label={'End of voting period'}
            placeholder={'Pick an end date and time'}
            key={form.key('endDateTime')}
            {...form.getInputProps('endDateTime')}
          />
        </Group>
        <Switch
          label={'Allow invalid votes'}
          key={form.key('allowInvalidVotes')}
          {...form.getInputProps('allowInvalidVotes', { type: 'checkbox' })}
        />
        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose} disabled={isMutating}>
            Cancel
          </Button>
          <Button variant="filled" onClick={onMutateTransform} loading={isMutating}>
            {mutateButtonText}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
