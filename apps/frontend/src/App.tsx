import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { Badge, Button, Divider, Loader, NumberInput, Stack, Text } from '@mantine/core';
import { useVoturaGithubRepo } from './swr/useVoturaGithubRepo.ts';
import { useStore } from './store/useStore.ts';
import { useInputState } from '@mantine/hooks';

function App() {
  const { data, error, isLoading } = useVoturaGithubRepo();
  const votes = useStore((state) => state.votes);
  const addVotes = useStore((state) => state.addVotes);
  const [count, setCount] = useState(0);

  const [numberInputValue, setNumberValue] = useInputState<string | number>(1);

  if (isLoading) return <Loader type={'dots'} />;
  if (error || !data) return <Badge color="red">error while fetching</Badge>;

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <Text>This is data fetched from an API:</Text>
        <Text>Votura Github stars: {data.stargazers_count}</Text>
        <Text>Votura Github subscriber: {data.subscribers_count}</Text>
        <Text>Votura Github forks: {data.forks_count}</Text>
        <Divider my="md" />
        <Stack>
          <Text>This is local component state:</Text>
          <Button onClick={() => setCount((count) => count + 1)}>count is {count}</Button>
        </Stack>
        <Divider my="md" />
        <Stack>
          <Text>This is global app state:</Text>
          <NumberInput value={numberInputValue} onChange={setNumberValue} label={'Increase votes by:'} />
          <Button onClick={() => addVotes(Number(numberInputValue))}>Add {numberInputValue} votes</Button>
          <Text>Current votes: {votes}</Text>
        </Stack>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  );
}

export default App;
