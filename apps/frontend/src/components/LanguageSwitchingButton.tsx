import { Button, Menu } from '@mantine/core';
import { IconChevronDown, IconLanguage } from '@tabler/icons-react';
import i18next from 'i18next';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitchingButton = (): JSX.Element => {
  const supportedLanguages = (i18next.options.supportedLngs || []).filter(
    (language) => language !== 'cimode',
  ); //strip debugging locale mode from the official languages
  // map the language codes readable languages in the corresponing language
  const languages = supportedLanguages.map((language) => ({
    code: language,
    name: new Intl.DisplayNames([language], { type: 'language' }).of(language) ?? language,
  }));
  const { i18n } = useTranslation();
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
        {languages.map(({ code, name }) => {
          const isActive = currentLanguage.startsWith(code);

          return (
            <Menu.Item
              key={code}
              onClick={async (): Promise<void> => {
                await i18n.changeLanguage(code);
              }}
              style={{ fontWeight: isActive ? 700 : undefined }}
            >
              {name}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
};
