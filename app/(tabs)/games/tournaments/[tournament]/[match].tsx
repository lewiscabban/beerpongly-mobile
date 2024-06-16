import { Image, StyleSheet, View, Text, TextInput } from 'react-native';
import { router, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { 
  Tournament, initTournamentDB, createTournamentTable, insertTournament, getTournament,
  Team, createTeamTable, insertTeam, getTeams, updateTeams, getTeam,
  Match, createMatchTable, insertMatch, getMatches, updateMatches, getMatch,
  deleteMatch, deleteMatches,
  updateMatch
} from '@/db/tournament';
import { useEffect, useState } from 'react';


export default function SettingsScreen() {
  const path = usePathname();
  const tournamentId = Number(path.replace("/games/tournaments/", "").split("/")[0]);
  const matchId = Number(path.replace("/games/tournaments/", "").split("/")[1]);
  const [match, setMatch] = useState<Match|null>(null);
  const [firstTeam, setfFrstTeam] = useState<Team|null>(null);
  const [secondTeam, setSecondTeam] = useState<Team|null>(null);
  const [firstTeamCups, setfFrstTeamCups] = useState<string>("");
  const [secondTeamCups, setSecondTeamCups] = useState<string>("");


  useEffect(() => {
    async function initTeams() {
      const db = await initTournamentDB();
      await createTeamTable(db);
      if (match) {
        setfFrstTeam(await getTeam(db, match.firstTeam));
        setSecondTeam(await getTeam(db, match.secondTeam));
      }
    }

    initTeams();
  }, [match])

  useEffect(() => {
    async function createTables() {
      const db = await initTournamentDB();
      await createMatchTable(db);
      setMatch(await getMatch(db, matchId));
    }

    createTables();
  }, []);

  const firstTeamWins = () => {
    console.log("first team wins")
    async function updateFinishedMatch(updatedMatch: Match ) {
      const db = await initTournamentDB();
      await updateMatch(db, updatedMatch);
    }

    async function findNextMatch(updatedMatch: Match ) {
      const db = await initTournamentDB();
      let nextMatch = await getMatch(db, updatedMatch.nextMatch);
      if (nextMatch) {
        if (nextMatch.firstPreviousMatchId == updatedMatch.id) {
          nextMatch.firstTeam = updatedMatch.firstTeam;
        } else if (nextMatch.secondPreviousMatchId == updatedMatch.id) {
          nextMatch.secondTeam = updatedMatch.firstTeam;
        }
        await updateMatch(db, nextMatch);
      }
      
    }

    if (match) {
      let updatedMatch = match
      updatedMatch.winner = match.firstTeam
      updatedMatch.firstTeamCups = Number(firstTeamCups)
      updatedMatch.secondTeamCups = Number(secondTeamCups)

      updateFinishedMatch(updatedMatch)
      findNextMatch(updatedMatch)
    }
    router.push("games/tournaments/" + tournamentId);
  }

  const secondTeamWins = () => {
    console.log("second team wins")
    async function updateFinishedMatch(updatedMatch: Match ) {
      const db = await initTournamentDB();
      await updateMatch(db, updatedMatch);
    }

    async function findNextMatch(updatedMatch: Match ) {
      const db = await initTournamentDB();
      let nextMatch = await getMatch(db, updatedMatch.nextMatch);
      if (nextMatch) {
        if (nextMatch.firstPreviousMatchId == updatedMatch.id) {
          nextMatch.firstTeam = updatedMatch.secondTeam;
        } else if (nextMatch.secondPreviousMatchId == updatedMatch.id) {
          nextMatch.secondTeam = updatedMatch.secondTeam;
        }
        await updateMatch(db, nextMatch);
      }
      
    }

    if (match) {
      let updatedMatch = match
      updatedMatch.winner = match.secondTeam
      updatedMatch.firstTeamCups = Number(firstTeamCups)
      updatedMatch.secondTeamCups = Number(secondTeamCups)

      updateFinishedMatch(updatedMatch)
      findNextMatch(updatedMatch)
    }
    router.push("games/tournaments/" + tournamentId);
  }

  const handleFirstTeamCupsChange = (text: string) => {
    setfFrstTeamCups(text);
  };

  const handleSecondTeamCupsChange = (text: string) => {
    setSecondTeamCups(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text>First Team Cups:</Text>
        <TextInput
          style={styles.input}
          value={firstTeamCups}
          onChangeText={handleFirstTeamCupsChange}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text>Second Team Cups:</Text>
        <TextInput
          style={styles.input}
          value={secondTeamCups}
          onChangeText={handleSecondTeamCupsChange}
        />
      </View>
      <View style={styles.box} onTouchEnd={firstTeamWins}>
        <View style={styles.boxContent}>
          <Text style={styles.title}>Set Winner</Text>
          <Text style={styles.title}>First Team: {firstTeam?.name}</Text>
          <Text style={styles.title}>Match id: {secondTeam?.name}</Text>
        </View>
        <MaterialIcons name="arrow-forward" size={24} color="black" />
      </View>


      <View style={styles.box}>
        <View style={styles.boxContent} onTouchEnd={secondTeamWins}>
          <Text style={styles.title}>Set Winner</Text>
          <Text style={styles.title}>First Team: {firstTeam?.name}</Text>
          <Text style={styles.title}>Second Team: {secondTeam?.name}</Text>
        </View>
        <MaterialIcons name="arrow-forward" size={24} color="black" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginLeft: 8,
    marginTop: 5,
    width: 200,
  },
  box: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ccc',
    width: 300,
    height: 100,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  boxContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  body: {
    fontSize: 14,
  },
});
