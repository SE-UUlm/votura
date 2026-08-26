import {
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  Drawer,
  Group,
  type ModalProps,
  Stack,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import type { UseDisclosureHandlers } from '@mantine/hooks';
import type { EditUserData, SelectableUser } from '@repo/votura-validators';
import { t } from 'i18next';
import { type JSX, type ReactNode, useEffect } from 'react';
import { getUserIdFromAuthLocalStorage } from '../swr/authTokens.ts';
import { Avatar } from './Avatar.tsx';

export interface EditAccountDrawerProps {
  user: SelectableUser;
  deleteModalActions: UseDisclosureHandlers;
  opened: ModalProps['opened'];
  onClose: ModalProps['onClose'];
  mutateButtonText: ReactNode;
  onMutate: (mutationData: EditUserData) => void | Promise<void>;
  title: ModalProps['title'];
  isMutatingEdit: boolean;
  isMutatingDelete: boolean;
}

export interface EditAccountFormValues extends Pick<EditUserData, 'active'> {
  admin: boolean;
}

export const EditAccountDrawer = ({
  user,
  deleteModalActions,
  opened,
  onMutate,
  onClose,
  mutateButtonText,
  title,
  isMutatingEdit,
  isMutatingDelete,
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

  const memberSinceDate = new Date(user.createdAt);
  const memberSince =
    t('memberSince', 'Member since') +
    ' ' +
    memberSinceDate.toLocaleDateString([], {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <Drawer.Root opened={opened} onClose={onClose} position={'right'} offset={16} radius={'md'}>
      <Drawer.Overlay />
      <Drawer.Content data-testid="mutate-voter-group-drawer">
        <Stack justify={'space-between'} h={'100%'}>
          <Box>
            <Drawer.Header>
              <Drawer.Title>{title}</Drawer.Title>
              <Drawer.CloseButton disabled={isMutatingEdit || isMutatingDelete} />
            </Drawer.Header>
            <Drawer.Body>
              <Stack align={'center'} mb={'md'}>
                <Container w={'50%'}>
                  <Avatar userId={user.id} email={user.email} />
                </Container>
                {user.role === 'admin' ? (
                  <Badge variant={'light'} color={'red'}>
                    {t('administrator', 'Administrator')}
                  </Badge>
                ) : (
                  <Badge variant={'light'} color={'blue'}>
                    {t('user', 'User')}
                  </Badge>
                )}
                <Text>{user.email}</Text>
                {memberSince !== '' ? (
                  <Text size={'sm'} c={'dimmed'}>
                    {memberSince}
                  </Text>
                ) : null}
              </Stack>
              {getUserIdFromAuthLocalStorage() !== user.id ? (
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
              ) : (
                <></>
              )}
            </Drawer.Body>
          </Box>
          <Group justify="flex-end" m={'md'}>
            {getUserIdFromAuthLocalStorage() !== user.id ? (
              <>
                <Button
                  variant="filled"
                  onClick={onMutateTransform}
                  disabled={isMutatingEdit || isMutatingDelete}
                  loading={isMutatingEdit}
                  flex={1}
                >
                  {mutateButtonText}
                </Button>
                <Button
                  variant="filled"
                  color="red"
                  onClick={deleteModalActions.open}
                  disabled={isMutatingEdit || isMutatingDelete}
                  loading={isMutatingDelete}
                >
                  {t('deleteAccount', 'Delete account')}
                </Button>
              </>
            ) : (
              <></>
            )}
          </Group>
        </Stack>
      </Drawer.Content>
    </Drawer.Root>
  );
};
