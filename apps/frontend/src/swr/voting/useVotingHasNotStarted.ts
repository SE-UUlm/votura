import { useEffect, useState } from 'react';

const hasVotingNotStarted = (votingStartAt?: string): boolean => {
  if (votingStartAt === undefined || votingStartAt === '') {
    return true;
  }

  return Date.now() < new Date(votingStartAt).getTime();
};

export const useVotingHasNotStarted = (votingStartAt?: string): boolean => {
  const [hasNotStarted, setHasNotStarted] = useState(hasVotingNotStarted(votingStartAt));

  useEffect((): (() => void) => {
    let timeout: number | undefined = undefined;
    if (votingStartAt !== undefined && votingStartAt !== '') {
      const votingStart = new Date(votingStartAt).getTime();
      const delay = votingStart - Date.now();

      if (delay <= 0) {
        setHasNotStarted(false);
      } else {
        setHasNotStarted(true);

        timeout = window.setTimeout((): void => {
          setHasNotStarted(false);
        }, delay);
      }
    }

    return (): void => {
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
      }
    };
  }, [votingStartAt]);

  return hasNotStarted;
};
