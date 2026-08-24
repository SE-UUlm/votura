import { Divider, Flex, Group, Space, Title, Text, List, Anchor } from '@mantine/core';
import type { JSX } from 'react';
import { HEADER_HEIGHT } from '../../utils.ts';
import { getVoterLocalStorage } from '../../../swr/voterToken.ts';
import { useGetVoterElections } from '../../../swr/voting/useGetVoterElections.ts';
import { Link } from 'react-router';
import { getVotingElectionPath } from '../../AppShellLayoutVoter.tsx';
import { useTranslation } from 'react-i18next';

export const VotingHomeView = (): JSX.Element => {
  const { t } = useTranslation();
  const voterToken = getVoterLocalStorage();
  const voterElectionsHook = useGetVoterElections({ token: voterToken });
  const voterData = voterElectionsHook.data;

  console.log('Voter Data:', voterData);

  return (
    <>
      <Flex direction="column" maw="100%" px="md" flex={1}>
        <Group justify="space-between" h={HEADER_HEIGHT}>
          <Title order={1}>
            {t('welcomeToVotura', 'Welcome to Votura')}
          </Title>
          <Group />
        </Group>
        <Divider />
        <Text mt="sm">
          Votura ist eine sichere Online-Wahlplattform, mit der du einfach und transparent an Wahlen teilnehmen kannst.
        </Text>
        <Space h="md" />
        <Title order={2}>An einer Wahl teilnehmen</Title>
        <Text mt="sm">
          Auf der linken Seite findest du eine Übersicht aller verfügbaren Wahlen. Alternativ kannst du auch direkt auf einen der Links in der Auflistung klicken.
        </Text>
        <Text mt="sm">
          Du kannst an folgenden Wahlen teilnehmen:
        </Text>
        <List mt="sm">
          {voterData?.map((election) => (
            <List.Item key={election.id}>
              <Anchor
                component={Link}
                to={getVotingElectionPath(election.id)}
              >
                {election.name}
              </Anchor>
            </List.Item>
          ))}
        </List>
        <Text mt="sm">
          Klicke auf den Namen einer Wahl, um die dazugehörigen Wahlinformationen und den Wahlzettel zu öffnen.
        </Text>
        <Space h="lg" />
        <Title order={2}>Deinen Wahlzettel ausfüllen</Title>
        <Text mt="sm">
          Auf dem Wahlzettel kannst du deine Stimme für die verfügbaren
          Optionen abgeben. Über dem Wahlzettel findest du außerdem wichtige
          Informationen zur jeweiligen Wahl.
          </Text>
        <Text mt="sm">
          Wenn du deine Auswahl getroffen hast, kannst du deinen Wahlzettel absenden.
        </Text>
        <Space h="lg" />
        <Title order={2}>Deine Stimme ändern</Title>
        <Text mt="sm">
          Solange die Wahl noch läuft, kannst du deine Stimme jederzeit ändern
          und erneut abstimmen. Wähle dazu die Wahl für die du deine Stimme ändern möchtest. Über <strong>Erneut Abstimmen</strong> gelangst du wieder
          zu deinem Wahlzettel und kannst deine Auswahl anpassen.
        </Text>
        <Space h="lg" />
        <Title order={2}>Deine Stimme verifizieren</Title>
        <Text mt="sm">
          Nach dem Absenden deiner Stimme erhältst du einen
          <strong> Ciphertext</strong> - eine verschlüsselte Darstellung deiner
          abgegebenen Stimme.
        </Text>
        <Text mt="sm">
          Speichere oder lade deinen Ciphertext herunter. Du kannst ihn später
          verwenden, um deine Stimme zu verifizieren und zu überprüfen, dass
          deine abgegebene Stimme korrekt berücksichtigt wurde.
        </Text>
      </Flex>
    </>
  );
};
