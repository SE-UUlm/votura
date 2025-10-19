import { ActionIcon, Group, Table, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { SelectableVoterGroup } from '@repo/votura-validators';
import { IconArrowRight, IconDots } from '@tabler/icons-react';
import type { JSX, PropsWithChildren } from 'react';
import { useNavigate } from 'react-router';
import { useDeleteVoterGroup } from '../../../swr/voterGroups/useDeleteVoterGroup.ts';
import { useUpdateVoterGroup } from '../../../swr/voterGroups/useUpdateVoterGroup.ts';
import {
  getDeleteSuccessVoterGroupConfig,
  getMutateSuccessVoterGroupConfig,
} from '../../../utils/notifications.ts';
import type { DeleteVoterGroupModalProps } from '../../DeleteVoterGroupModal.tsx';
import type { MutateVoterGroupDrawerProps } from '../../MutateVoterGroupDrawer.tsx';
import { VoterGroupsSettingsMenu } from '../../VoterGroupSettingsMenu.tsx';

export interface VoterGroupsTableProps {
  data: SelectableVoterGroup[];
}

const TableText = ({ children }: PropsWithChildren): JSX.Element => (
  <Text lineClamp={1} size={'sm'}>
    {children}
  </Text>
);

export const VoterGroupsTable = ({ data }: VoterGroupsTableProps): JSX.Element => {
  const navigate = useNavigate();

  const rows = data.map((voterGroup) => {
    const { trigger: updateTrigger, isMutating } = useUpdateVoterGroup(voterGroup.id);
    const { trigger: deleteTrigger } = useDeleteVoterGroup({ voterGroupId: voterGroup.id });

    const onMutate: MutateVoterGroupDrawerProps['onMutate'] = async (mutatedVoterGroup) => {
      await updateTrigger(mutatedVoterGroup);
      notifications.show(
        getMutateSuccessVoterGroupConfig(mutatedVoterGroup?.name ?? voterGroup.name),
      );
    };

    const onDelete: DeleteVoterGroupModalProps['onDelete'] = async () => {
      await deleteTrigger();
      notifications.show(getDeleteSuccessVoterGroupConfig(voterGroup.name));
    };

    return (
      <Table.Tr key={voterGroup.id}>
        <Table.Td>
          <TableText>{voterGroup.name}</TableText>
        </Table.Td>
        <Table.Td>
          <TableText>{voterGroup.description}</TableText>
        </Table.Td>
        <Table.Td>
          <TableText>{voterGroup.ballotPapers.length}</TableText>
        </Table.Td>
        <Table.Td>
          <TableText>{voterGroup.numberOfVoters}</TableText>
        </Table.Td>
        <Table.Td>
          <Group justify="flex-end" gap={'xs'} wrap={'nowrap'}>
            <VoterGroupsSettingsMenu
              voterGroup={voterGroup}
              targetElement={
                <ActionIcon variant="subtle" aria-label="Settings">
                  <IconDots size={14} />
                </ActionIcon>
              }
              onDelete={onDelete}
              onMutate={onMutate}
              isMutating={isMutating}
            />
            <ActionIcon
              variant="subtle"
              aria-label="Details"
              onClick={(): void => {
                navigate(`/voterGroups/${voterGroup.id}`);
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
          <Table.Th>Ballot Papers</Table.Th>
          <Table.Th>Voters</Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};
