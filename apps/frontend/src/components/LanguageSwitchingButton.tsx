import { Button, Menu } from '@mantine/core';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';

const supportedLanguages = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
] as const;

export const LanguageSwitchingButton = (): JSX.Element => {
  const { i18n } = useTranslation();
  const currentLanguage = (i18n.resolvedLanguage ?? i18n.language ?? 'en').toLowerCase();
  const currentLabel = currentLanguage.toUpperCase();

  return (
    <Menu shadow="md" width={140} withinPortal>
      <Menu.Target>
        <Button variant="subtle" size="xs">
          {currentLabel}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {supportedLanguages.map((language) => {
          const isActive = currentLanguage.startsWith(language.code);

          return (
            <Menu.Item
              key={language.code}
              onClick={(): void => {
                void i18n.changeLanguage(language.code);
              }}
              style={{ fontWeight: isActive ? 700 : undefined }}
            >
              {language.label}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
};
