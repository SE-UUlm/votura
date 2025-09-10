import {
  Box,
  Button,
  Drawer,
  Group,
  type ModalProps,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { type UpdateableCandidate, updateableCandidateObject } from '@repo/votura-validators';
import { type JSX, type ReactNode, useEffect } from 'react';
import { zodResolver } from '../../../../../../utils/zodResolver.ts';

export interface MutateCandidateDrawerProps {
  candidate?: UpdateableCandidate;
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  mutateButtonText: ReactNode;
  onMutate: (mutatedCandidate: UpdateableCandidate) => void | Promise<void>;
  title: ModalProps['title'];
  isMutating: boolean;
}

export const MutateCandidateDrawer = ({
  candidate,
  opened,
  onMutate,
  onClose,
  mutateButtonText,
  title,
  isMutating,
}: MutateCandidateDrawerProps): JSX.Element => {
  const form = useForm<UpdateableCandidate>({
    mode: 'uncontrolled',
    validate: zodResolver(updateableCandidateObject),
  });

  useEffect(() => {
    if (!opened) {
      return;
    }

    if (candidate !== undefined) {
      form.setValues(candidate);
    } else {
      form.reset();
    }
  }, [candidate, opened]);

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
                  placeholder={'e.g. John Doe'}
                  key={form.key('title')}
                  {...form.getInputProps('title')}
                />
                <Textarea
                  label={'Description'}
                  placeholder={
                    'e.g. John Doe is memeber of the ...'
                  }
                  autosize={true}
                  minRows={4}
                  maxRows={4}
                  key={form.key('description')}
                  {...form.getInputProps('description')}
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
