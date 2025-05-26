import { Navigate, useParams } from 'react-router';
import { Container, Divider, Loader, Space } from '@mantine/core';
import { useStore } from '../../../store/useStore.ts';
import { ElectionViewHeader } from './ElectionViewHeader.tsx';
import { ElectionStats } from './ElectionStats.tsx';

export type ElectionViewRouteParams = Record<'id', string>;

export const ElectionView = () => {
  const params = useParams<ElectionViewRouteParams>();
  const election = useStore((state) => state.elections.find((e) => e.id === params.id));

  if (!params.id) {
    return <Navigate to={'/elections'} />;
  }

  if (!election) {
    return (
      <Container>
        <Loader color="blue" />
      </Container>
    );
  }

  return (
    <Container fluid>
      <ElectionViewHeader election={election} />
      <Divider />
      <Space h={'md'} />
      <ElectionStats election={election} />
      <Space h={'md'} />
      <Divider />
      <Space h={'md'} />
    </Container>
  );
};
