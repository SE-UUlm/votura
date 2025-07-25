import { ActionIcon, Group, Table, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { SelectableElection } from '@repo/votura-validators';
import { IconArrowRight, IconDots } from '@tabler/icons-react';
import type { JSX, PropsWithChildren } from 'react';
import { useNavigate } from 'react-router';
import { useUpdateElection } from '../../../swr/elections/useUpdateElection.ts';
import {
  getDeleteSuccessElectionConfig,
  getMutateSuccessElectionConfig,
  getToggleFreezeSuccessElectionConfig,
} from '../../../utils/notifications.ts';
import { BooleanBadge } from '../../BooleanBadge.tsx';
import type { DeleteElectionModalProps } from '../../DeleteElectionModal.tsx';
import { ElectionsSettingsMenu } from '../../ElectionSettingsMenu.tsx';
import type { MutateElectionModalProps } from '../../MutateElectionDrawer.tsx';
import type { ToggleFreezeElectionModalProps } from '../../ToggleFreezeElectionModal.tsx';
import dayjs from 'dayjs';

export interface ElectionsTableProps {
  data: SelectableElection[];
}

const TableText = ({ children }: PropsWithChildren): JSX.Element => (
  <Text lineClamp={1} size={'sm'}>
    {children}
  </Text>
);

export const ElectionsTable = ({ data }: ElectionsTableProps): JSX.Element => {
  const navigate = useNavigate();

  const rows = data.map((election) => {
    const { trigger, isMutating } = useUpdateElection(election.id);

    const onMutate: MutateElectionModalProps['onMutate'] = async (mutatedElection) => {
      await trigger(mutatedElection);
      notifications.show(getMutateSuccessElectionConfig(mutatedElection?.name ?? election.name));
    };

    const onDelete: DeleteElectionModalProps['onDelete'] = () => {
      // deleteElection(election.id); TODO: implement delete election
      notifications.show(getDeleteSuccessElectionConfig(election.name));
    };

    const onToggleFreeze: ToggleFreezeElectionModalProps['onToggleFreeze'] = () => {
      notifications.show(
        getToggleFreezeSuccessElectionConfig(election.name, !election.configFrozen),
      );
    };

    return (
      <Table.Tr key={election.id}>
        <Table.Td>
          <TableText>{election.name}</TableText>
        </Table.Td>
        <Table.Td>
          <TableText>{election.description}</TableText>
        </Table.Td>
        <Table.Td>
          <TableText>{dayjs(election.modifiedAt).format('lll')}</TableText>
        </Table.Td>
        <Table.Td>
          <BooleanBadge isTrue={election.configFrozen} />
        </Table.Td>
        <Table.Td>
          <Group justify="flex-end" gap={'xs'} wrap={'nowrap'}>
            <ElectionsSettingsMenu
              election={election}
              targetElement={
                <ActionIcon variant="subtle" aria-label="Settings">
                  <IconDots size={14} />
                </ActionIcon>
              }
              onDelete={onDelete}
              onMutate={onMutate}
              onToggleFreeze={onToggleFreeze}
              isMutating={isMutating}
            />
            <ActionIcon
              variant="subtle"
              aria-label="Settings"
              onClick={() => {
                navigate(`/elections/${election.id}`);
              }}
            >
              <IconArrowRight size={14} />
            </ActionIcon>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Table highlightOnHover={true}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Description</Table.Th>
          <Table.Th>Last modified</Table.Th>
          <Table.Th>Frozen</Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};
