import {type JSX, useId} from 'react';

export interface AvatarProps {
  userId: string;
  email: string;
  className: string | null;
}

const colorPairs = [
    [ '#7f00ff', '#e100ff' ],
    [ '#fbb040', '#f9ed32' ],
    [ '#00a1ff', '#00ff8f' ],
    [ '#ff00d4', '#00ddff' ],
    [ '#ef4136', '#fbb040' ],
    [ '#2d388a', '#00aeef' ],
];

const determineInitials = (email: string): string => {
  let initials = '';
  if (email.includes('@')) {
    const username = email.split('@')[0];

    let separated = true;
    const separators = [ '.', '-', '_', '+' ];

    for (let i = 0; i < username.length; i++) {
      const char = username.charAt(i);

      if (separators.includes(char)) {
        separated = true;
        continue;
      }

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

export const Avatar = ({
  userId,
  email,
  className,
}: AvatarProps): JSX.Element => {
  const componentId = useId(); // Unique component ID

  // Select random color pair based on userId hash
  const colorPair = colorPairs[Math.abs(userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colorPairs.length];

  return (
    <svg xmlns={'http://www.w3.org/2000/svg'} viewBox={'0 0 128 128'} className={className ?? ''}>
      <defs>
        <linearGradient id={'avatar-gradient-' + componentId} x1={0} y1={1} x2={1} y2={0}>
          <stop offset={'0%'} style={{ stopColor: colorPair[0] }} />
          <stop offset={'100%'} style={{stopColor: colorPair[1] }} />
        </linearGradient>
      </defs>

      <rect width={'100%'} height={'100%'} fill={'url(#avatar-gradient-' + componentId + ')'} />
      <text x={'50%'} y={'50%'} fontSize={64} fill={'white'} textAnchor={'middle'} dominantBaseline={'middle'}>
        {determineInitials(email)}
      </text>
    </svg>
  );
};
