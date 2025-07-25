import {
  Box,
  Button,
  Drawer,
  Group,
  type ModalProps,
  NumberInput,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { type UpdateableBallotPaper, updateableBallotPaperObject } from '@repo/votura-validators';
import { type JSX, type ReactNode, useEffect } from 'react';
import { zodResolver } from '../../../utils/zodResolver.ts';

export interface MutateBallotPaperDrawerProps {
  ballotPaper?: UpdateableBallotPaper;
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  mutateButtonText: ReactNode;
  onMutate: (mutatedBallotPaper: UpdateableBallotPaper) => void | Promise<void>;
  title: ModalProps['title'];
  isMutating: boolean;
}

const maxVotesMinimum = updateableBallotPaperObject.shape.maxVotes.minValue ?? undefined;
const maxVotesMaximum = updateableBallotPaperObject.shape.maxVotes.maxValue ?? undefined;

const maxVotesPerCandidateMinimum =
  updateableBallotPaperObject.shape.maxVotesPerCandidate.minValue ?? undefined;
const maxVotesPerCandidateMaximum =
  updateableBallotPaperObject.shape.maxVotesPerCandidate.maxValue ?? undefined;

export const MutateBallotPaperDrawer = ({
  ballotPaper,
  opened,
  onMutate,
  onClose,
  mutateButtonText,
  title,
  isMutating,
}: MutateBallotPaperDrawerProps): JSX.Element => {
  const form = useForm<UpdateableBallotPaper>({
    mode: 'uncontrolled',
    validate: zodResolver(updateableBallotPaperObject),
  });

  useEffect(() => {
    if (!opened) {
      return;
    }

    if (ballotPaper !== undefined) {
      form.setValues(ballotPaper);
    } else {
      form.reset();
    }
  }, [ballotPaper, opened]);

  const onMutateTransform = () => {
    const validationResult = form.validate();

    if (validationResult.hasErrors) {
      return;
    }

    const formValues = form.getValues();
    onMutate(formValues);
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
                  placeholder={'e.g. Student Ballot Paper'}
                  key={form.key('name')}
                  {...form.getInputProps('name')}
                />
                <Textarea
                  label={'Description'}
                  placeholder={
                    'e.g. This years ballot paper for students on the student council ...'
                  }
                  autosize={true}
                  minRows={4}
                  maxRows={4}
                  key={form.key('description')}
                  {...form.getInputProps('description')}
                />
                <NumberInput
                  withAsterisk
                  label={'Maximum votes'}
                  key={form.key('maxVotes')}
                  {...form.getInputProps('maxVotes')}
                  {...(maxVotesMinimum ? { min: maxVotesMinimum } : undefined)}
                  {...(maxVotesMaximum ? { max: maxVotesMaximum } : undefined)}
                />
                <NumberInput
                  withAsterisk
                  label={'Maximum votes per candidate'}
                  key={form.key('maxVotesPerCandidate')}
                  {...form.getInputProps('maxVotesPerCandidate')}
                  {...(maxVotesPerCandidateMinimum
                    ? { min: maxVotesPerCandidateMinimum }
                    : undefined)}
                  {...(maxVotesPerCandidateMaximum
                    ? { max: maxVotesPerCandidateMaximum }
                    : undefined)}
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
