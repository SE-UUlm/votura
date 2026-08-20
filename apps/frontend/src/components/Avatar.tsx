import {Avatar as MantineAvatar} from '@mantine/core';
import type { JSX } from 'react';
import { renderToString } from 'react-dom/server';

export interface AvatarProps {
  userId: string;
  email: string;
}

const colorPairs = [
  ['#7f00ff', '#e100ff'],
  ['#fbb040', '#f9ed32'],
  ['#00a1ff', '#00ff8f'],
  ['#ff00d4', '#00ddff'],
  ['#ef4136', '#fbb040'],
  ['#2d388a', '#00aeef'],
];

const determineInitials = (email: string): string => {
  let initials = '';
  if (email.includes('@')) {
    const username = email.split('@')[0];

    let separated = true;
    const separators = ['.', '-', '_', '+'];

    for (let i = 0; i < username.length; i++) {
      const char = username.charAt(i);

      // Skip if the char is a separator
      if (separators.includes(char)) {
        separated = true;
        continue;
      }

      // If the char is separated from the previous one, add it to the avatar preview
      if (separated) {
        initials += char.toUpperCase();
      }

      separated = false;
      if (initials.length >= 2) {
        break;
      }
    }
  }

  return initials;
};

const PrivateAvatar = ({ userId, email }: AvatarProps): JSX.Element => {
  // Select random color pair based on userId hash
  const colorPair =
    colorPairs[
      Math.abs(userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) %
        colorPairs.length
    ];

  return (
    <svg xmlns={'http://www.w3.org/2000/svg'} viewBox={'0 0 128 128'}>
      <defs>
        <linearGradient id={'avatar-gradient'} x1={0} y1={1} x2={1} y2={0}>
          <stop offset={'0%'} style={{ stopColor: colorPair[0] }} />
          <stop offset={'100%'} style={{ stopColor: colorPair[1] }} />
        </linearGradient>
      </defs>

      <rect width={'100%'} height={'100%'} fill={'url(#avatar-gradient)'} />
      <text
        x={'50%'}
        y={'50%'}
        fontSize={64}
        fontFamily={'sans-serif'}
        fill={'white'}
        textAnchor={'middle'}
        dominantBaseline={'central'}
      >
        {determineInitials(email)}
      </text>
    </svg>
  );
};

export const Avatar = ({ userId, email }: AvatarProps): JSX.Element => {
  const privateAvatarSvg = renderToString(<PrivateAvatar userId={userId} email={email} />);
  const avatarSrc = 'data:image/svg+xml,' + encodeURIComponent(privateAvatarSvg);

  return (
    <MantineAvatar
      src={avatarSrc}
      alt={email}
      w={'100%'}
      h={'100%'}
    />
  );
};
