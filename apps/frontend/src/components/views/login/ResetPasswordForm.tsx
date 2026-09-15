import { Box, Button, PasswordInput, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { passwordResetUserObject, type PasswordResetUser } from '@repo/votura-validators';
import i18next from 'i18next';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';

interface ResetPasswordFormProps {
  isSubmitting: boolean;
  onSubmit: (values: PasswordResetUser) => Promise<void>;

  /** Token from the link in the email, empty when it has to be pasted by hand. */
  initialToken: string;

  /** Set when the backend rejected the token, shown below the token field. */
  tokenError: string | null;
}

const validateToken = (value: string): string | null => {
  const parsed = passwordResetUserObject.shape.passwordResetToken.safeParse(value.trim());
  if (!parsed.success) {
    return i18next.t('invalidPasswordResetToken', 'Invalid password reset token.');
  }

  return null;
};

const validatePassword = (value: string): string | null => {
  const parsed = passwordResetUserObject.shape.password.safeParse(value);
  if (!parsed.success) {
    return i18next.t('passwordDoesNotMeetRequirements', 'Password does not meet requirements.');
  }

  return null;
};

const validatePasswordVerification = (
  value: string,
  values: { password: string },
): string | null => {
  if (value !== values.password) {
    return i18next.t('passwordsDoNotMatch', 'Passwords do not match.');
  }

  return null;
};

export const ResetPasswordForm = ({
  initialToken,
  isSubmitting,
  tokenError,
  onSubmit,
}: ResetPasswordFormProps): JSX.Element => {
  const { t } = useTranslation();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      passwordResetToken: initialToken,
      password: '',
      passwordVerification: '',
    },
    validate: {
      passwordResetToken: validateToken,
      password: validatePassword,
      passwordVerification: validatePasswordVerification,
    },
  });

  return (
    <Box
      component={'form'}
      onSubmit={form.onSubmit(async (data) => {
        await onSubmit({
          passwordResetToken: data.passwordResetToken.trim(),
          password: data.password,
        });
      })}
    >
      <Stack>
        <TextInput
          withAsterisk
          label={t('passwordResetToken', 'Password reset token')}
          placeholder={t('pasteTheTokenFromTheEmailHere', 'Paste the token from the email here.')}
          key={form.key('passwordResetToken')}
          {...form.getInputProps('passwordResetToken')}
          error={tokenError ?? form.getInputProps('passwordResetToken').error}
        />
        <PasswordInput
          withAsterisk
          label={t('newPassword', 'New password')}
          placeholder={t('mySecurePassword', 'My secure password...')}
          key={form.key('password')}
          {...form.getInputProps('password')}
        />
        <PasswordInput
          withAsterisk
          label={t('repeatNewPassword', 'Repeat new password')}
          placeholder={t('mySecurePassword', 'My secure password...')}
          key={form.key('passwordVerification')}
          {...form.getInputProps('passwordVerification')}
        />
        <Button fullWidth type={'submit'} loading={isSubmitting}>
          {t('setNewPassword', 'Set new password')}
        </Button>
      </Stack>
    </Box>
  );
};
