import { Divider, Flex, Group, Space, Title } from '@mantine/core';
import type { JSX } from 'react';
import { HEADER_HEIGHT } from '../../utils.ts';

export const VotingHomeView = (): JSX.Element => {

  return (
    <>
      <Flex direction={'column'} maw={'100%'} px={'md'} flex={1}>
        <Group justify="space-between" h={HEADER_HEIGHT}>
          <Title order={1}>Welcome to the Voting Portal</Title>
          <Group>
          </Group>
        </Group>
        <Divider />
        <Space h={'md'} />
        <Title order={2}>
          No elections available.
        </Title>
      </Flex>
    </>
  );
};
