import { Box, Button, Checkbox, Drawer, Group, type ModalProps, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { EditUserData, SelectableUser } from '@repo/votura-validators';
import { type JSX, type ReactNode, useEffect } from 'react';

export interface EditAccountDrawerProps {
  user: SelectableUser;
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  mutateButtonText: ReactNode;
  onMutate: (mutationData: EditUserData) => void | Promise<void>;
  title: ModalProps['title'];
  isMutating: boolean;
}

export interface EditAccountFormValues extends Pick<EditUserData, 'active'> {
  admin: boolean;
}

export const EditAccountDrawer = ({
  user,
  opened,
  onMutate,
  onClose,
  mutateButtonText,
  title,
  isMutating,
}: EditAccountDrawerProps): JSX.Element => {
  const form = useForm<EditAccountFormValues>({
    mode: 'controlled',
    initialValues: {
      admin: user?.role === 'admin',
      active: user?.active ?? false,
    },
    validateInputOnBlur: true,
  });

  useEffect(() => {
    if (!opened) {
      return;
    }

    if (user) {
      form.setInitialValues({
        admin: user.role === 'admin',
        active: user.active,
      });
    } else {
      form.reset();
    }
  }, [opened]);

  const onMutateTransform = async (): Promise<void> => {
    const validationResult = form.validate();

    if (validationResult.hasErrors) {
      return;
    }

    const formValues = form.getValues();
    await onMutate({
      role: formValues.admin ? 'admin' : 'user',
      active: formValues.active,
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
                <Checkbox
                  label={'Administrator'}
                  key={form.key('admin')}
                  {...form.getInputProps('admin', { type: 'checkbox' })}
                />
                <Checkbox
                  label={'Active'}
                  key={form.key('active')}
                  {...form.getInputProps('active', { type: 'checkbox' })}
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
