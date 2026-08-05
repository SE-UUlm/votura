import { Button, Menu } from '@mantine/core';
import { IconChevronDown, IconLanguage } from '@tabler/icons-react';
import i18next from 'i18next';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitchingButton = (): JSX.Element => {
  const supportedLanguages = (i18next.options.supportedLngs || []).filter(
    (language) => language !== 'cimode',
  ); //strip debugging locale mode from the official languages
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage ?? i18n.language ?? 'en';

  return (
    <Menu shadow="md" width={140} withinPortal>
      <Menu.Target>
        <Button
          variant="subtle"
          size="xs"
          leftSection={<IconLanguage size={14} />}
          rightSection={<IconChevronDown size={12} />}
        >
          {currentLanguage.toUpperCase()}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {supportedLanguages.map((language) => {
          const isActive = currentLanguage.startsWith(language);

          return (
            <Menu.Item
              key={language}
              onClick={async (): Promise<void> => {
                await i18n.changeLanguage(language);
              }}
              style={{ fontWeight: isActive ? 700 : undefined }}
            >
              {t(`languages.${language}`)}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
};
