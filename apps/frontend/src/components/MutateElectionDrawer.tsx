import {
  Box,
  Button,
  Drawer,
  Group,
  type ModalProps,
  Stack,
  Switch,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { isNotEmpty, useForm } from '@mantine/form';
import type { SelectableElection, UpdateableElection } from '@repo/votura-validators';
import { type JSX, type ReactNode, useEffect } from 'react';

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
  dateRange: [string, string];
}

export const MutateElectionDrawer = ({
  election,
  opened,
  onMutate,
  onClose,
  mutateButtonText,
  title,
  isMutating,
}: MutateElectionModalProps): JSX.Element => {
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
        ...(election.description !== undefined ? { description: election.description } : undefined),
        allowInvalidVotes: election.allowInvalidVotes,
        dateRange: [election.votingStartAt, election.votingEndAt],
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
      votingStartAt: new Date(formValues.dateRange[0]).toISOString(),
      votingEndAt: new Date(formValues.dateRange[1]).toISOString(),
      private: true,
    });
    onClose();
  };

  return (
    <Drawer.Root opened={opened} onClose={onClose} position={'right'} offset={16} radius={'md'}>
      <Drawer.Overlay />
      <Drawer.Content>
        <Stack justify={'space-between'} h={'100%'}>
          <Box>
            <Drawer.Header>
              <Drawer.Title>{title}</Drawer.Title>
              <Drawer.CloseButton disabled={isMutating} />
            </Drawer.Header>
            <Drawer.Body>
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
              </Stack>
            </Drawer.Body>
          </Box>
          <Group justify="flex-end" m={'md'}>
            <Button variant="outline" onClick={onClose} disabled={isMutating}>
              Cancel
            </Button>
            <Button variant="filled" onClick={onMutateTransform} loading={isMutating}>
              {mutateButtonText}
            </Button>
          </Group>
        </Stack>
      </Drawer.Content>
    </Drawer.Root>
  );
};
