import { Container, Divider, Loader, Space, ThemeIcon } from '@mantine/core';
import { parameter } from '@repo/votura-validators';
import { IconBug } from '@tabler/icons-react';
import { Navigate, useParams } from 'react-router';
import { useGetElection } from '../../../swr/elections/useGetElection.ts';
import { ElectionStats } from './ElectionStats.tsx';
import { ElectionViewHeader } from './ElectionViewHeader.tsx';

export type ElectionViewRouteParams = {
  [parameter.electionId]: string;
};

export const ElectionView = () => {
  const params = useParams<ElectionViewRouteParams>();
  const { data, isLoading, error } = useGetElection({ electionId: params.electionId });

  if (!params.electionId) {
    return <Navigate to={'/elections'} />;
  }

  if (error) {
    return (
      <ThemeIcon size="xl" color="red">
        <IconBug style={{ width: '70%', height: '70%' }} />
      </ThemeIcon>
    );
  }

  if (isLoading || data === undefined) {
    return (
      <Container>
        <Loader color="blue" />
      </Container>
    );
  }

  return (
    <Container fluid>
      <ElectionViewHeader election={data} />
      <Divider />
      <Space h={'md'} />
      <ElectionStats election={data} />
      <Space h={'md'} />
      <Divider />
      <Space h={'md'} />
    </Container>
  );
};
