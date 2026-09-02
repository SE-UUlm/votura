import { useEffect, useState } from 'react';

export const useVotingHasNotStarted = (
  votingStartAt?: string,
): boolean => {
  const [hasNotStarted, setHasNotStarted] = useState(
    votingStartAt !== undefined && votingStartAt !== ''
      ? Date.now() < new Date(votingStartAt).getTime()
      : true,
  );

  useEffect(() => {
    if (votingStartAt === undefined || votingStartAt === '') {
      return;
    }

    const votingStart = new Date(votingStartAt).getTime();
    const delay = votingStart - Date.now();

    if (delay <= 0) {
      setHasNotStarted(false);
      return;
    }

    setHasNotStarted(true);

    const timeout = window.setTimeout(() => {
      setHasNotStarted(false);
    }, delay);

    return (): void => { window.clearTimeout(timeout); };
  }, [votingStartAt]);

  return hasNotStarted;
};