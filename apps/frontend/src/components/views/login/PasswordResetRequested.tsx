import { Box, Button, Group, Stack, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

/**
 * Shown after a password reset was requested.
 *
 * The wording must not reveal whether an account for the given email address
 * exists, because the endpoint answers with 204 either way.
 */
export const PasswordResetRequested = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Stack>
      <Box
        px={'sm'}
        py={'xs'}
        bg={'blue.0'}
        style={{
          borderLeft: '4px solid var(--mantine-color-blue-6)',
          borderRadius: '4px',
        }}
      >
        <Group align="flex-start" gap="xs" wrap="nowrap">
          <IconInfoCircle size={36} stroke={2} style={{ color: 'var(--mantine-color-blue-8)' }} />
          <Stack gap={2}>
            <Text size={'sm'} fw={700}>
              {t(
                'ifAnAccountExistsForThisEmailAddressWeHaveSentAPasswordResetLinkToIt',
                'If an account exists for this email address, we have sent a password reset link to it.',
              )}
            </Text>
            <Text size={'sm'}>
              {t(
                'theLinkAndTheTokenAreValidForOneHour',
                'The link and the token are valid for one hour.',
              )}
            </Text>
          </Stack>
        </Group>
      </Box>
      <Button fullWidth onClick={(): void | Promise<void> => navigate('/resetPassword')}>
        {t('iAlreadyHaveAToken', 'I already have a token')}
      </Button>
      <Button fullWidth variant="subtle" onClick={(): void | Promise<void> => navigate('/login')}>
        {t('goToLogin', 'Go to login')}
      </Button>
    </Stack>
  );
};
