import {
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  Group,
  type ModalProps,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';
import type { SelectableVoterGroup, UpdateableVoterGroup } from '@repo/votura-validators';
import { type JSX, type ReactNode, useEffect } from 'react';
import { useGetBallotPapersByElections } from '../swr/ballotPapers/useGetBallotPapersByElections';
import { useGetElections } from '../swr/elections/useGetElections';

export interface MutateVoterGroupDrawerProps {
  voterGroup?: UpdateableVoterGroup;
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  mutateButtonText: ReactNode;
  onMutate: (mutatedVoterGroup: UpdateableVoterGroup) => void | Promise<void>;
  title: ModalProps['title'];
  isMutating: boolean;
}

export interface MutateVoterGroupFormValues
  extends Pick<SelectableVoterGroup, 'name' | 'description' | 'numberOfVoters' | 'ballotPapers'> {}

export const MutateVoterGroupDrawer = ({
  voterGroup,
  opened,
  onMutate,
  onClose,
  mutateButtonText,
  title,
  isMutating,
}: MutateVoterGroupDrawerProps): JSX.Element => {
  const form = useForm<MutateVoterGroupFormValues>({
    mode: 'controlled',
    validate: {
      name: isNotEmpty('Name cannot be empty'),
      numberOfVoters: (value) =>
        typeof value === 'number' && value > 0
          ? null
          : 'Number of voters must be greater than zero',
    },
    validateInputOnBlur: true,
  });

  const { data: elections } = useGetElections();

  const ballotPapersByElection = useGetBallotPapersByElections(elections);

  useEffect(() => {
    if (!opened) return;

    if (voterGroup) {
      form.setValues({
        name: voterGroup.name,
        ...(voterGroup.description !== undefined
          ? { description: voterGroup.description }
          : undefined),
        numberOfVoters: voterGroup.numberOfVoters,
        ballotPapers: voterGroup.ballotPapers,
      });
    } else {
      form.reset();
    }
    // to prevent infinite render loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voterGroup, opened]);

  const handleBallotPaperToggle = (ballotPaperId: string): void => {
    const current = new Set(form.values.ballotPapers);
    if (current.has(ballotPaperId)) {
      current.delete(ballotPaperId);
    } else {
      current.add(ballotPaperId);
    }
    form.setFieldValue('ballotPapers', Array.from(current));
  };

  const onMutateTransform = async (): Promise<void> => {
    const validationResult = form.validate();

    if (validationResult.hasErrors) return;

    const formValues = form.getValues();
    await onMutate({
      name: formValues.name,
      ...(formValues.description ? { description: formValues.description } : undefined),
      numberOfVoters: formValues.numberOfVoters,
      ballotPapers: formValues.ballotPapers,
    });
    onClose();
  };

  return (
    <Drawer.Root opened={opened} onClose={onClose} position={'right'} offset={16} radius={'md'}>
      <Drawer.Overlay />
      <Drawer.Content data-testid="mutate-voter-group-drawer">
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
                  label={'Voter group name'}
                  placeholder={'e.g. Student voters'}
                  key={form.key('name')}
                  {...form.getInputProps('name')}
                />
                <Textarea
                  label={'Voter group description'}
                  placeholder={'e.g. All students from all departments'}
                  autosize={true}
                  minRows={3}
                  maxRows={3}
                  key={form.key('description')}
                  {...form.getInputProps('description')}
                />
                <TextInput
                  withAsterisk
                  label={'Number of voters'}
                  placeholder={'e.g. 123'}
                  key={form.key('numberOfVoters')}
                  {...form.getInputProps('numberOfVoters')}
                />
                <Divider label={'Ballot Papers'} mt={'md'} />
                {elections?.map((election) => (
                  <Box key={election.id} mt={'sm'}>
                    <Text fw={500}>{election.name}</Text>
                    <Stack ml={'md'} mt={'xs'}>
                      {ballotPapersByElection[election.id] &&
                      ballotPapersByElection[election.id].length > 0 ? (
                        ballotPapersByElection[election.id].map((ballotPaper) => (
                          <Checkbox
                            key={ballotPaper.id}
                            label={ballotPaper.name}
                            checked={form.values.ballotPapers.includes(ballotPaper.id)}
                            onChange={(): void => handleBallotPaperToggle(ballotPaper.id)}
                          />
                        ))
                      ) : (
                        <Text size={'sm'} c={'dimmed'}>
                          No ballot papers found
                        </Text>
                      )}
                    </Stack>
                  </Box>
                ))}
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
