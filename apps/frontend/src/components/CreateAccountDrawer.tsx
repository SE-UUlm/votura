import {
  Box,
  Button,
  Checkbox,
  Drawer,
  Group,
  type ModalProps,
  Stack,
  TextInput,
} from '@mantine/core';
import { isEmail, isNotEmpty, useForm } from '@mantine/form';
import type { CreateUserData, EditUserData } from '@repo/votura-validators';
import { type JSX, type ReactNode, useEffect } from 'react';

export interface CreateAccountDrawerProps {
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  mutateButtonText: ReactNode;
  onMutate: (mutationData: CreateUserData) => void | Promise<void>;
  title: ModalProps['title'];
  isMutating: boolean;
}

export interface CreateAccountFormValues extends Pick<CreateUserData, 'email'> {
  admin: boolean;
}

export interface EditAccountFormValues extends Pick<EditUserData, 'active'> {
  admin: boolean;
}

export const CreateAccountDrawer = ({
  opened,
  onMutate,
  onClose,
  mutateButtonText,
  title,
  isMutating,
}: CreateAccountDrawerProps): JSX.Element => {
  const form = useForm<CreateAccountFormValues>({
    mode: 'controlled',
    initialValues: {
      email: '',
      admin: false,
    },
    validate: {
      email: isNotEmpty('Email has to be a valid email address') && isEmail('Email has to be a valid email address'),
    },
    validateInputOnBlur: true,
  });

  useEffect(() => {
    if (!opened) return;

    form.reset();
  }, [opened]);

  const onMutateTransform = async (): Promise<void> => {
    const validationResult = form.validate();

    if (validationResult.hasErrors) {
      return;
    }

    const formValues = form.getValues() as CreateAccountFormValues;
    await onMutate({
      email: formValues.email,
      role: formValues.admin ? 'admin' : 'user',
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
                  label={'Email'}
                  // placeholder={''}
                  key={form.key('email')}
                  {...form.getInputProps('email')}
                />
                <Checkbox
                  label={'Administrator'}
                  key={form.key('admin')}
                  {...form.getInputProps('admin', { type: 'checkbox' })}
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
