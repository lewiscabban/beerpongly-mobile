import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, FlatList, View, Text } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { 
  Tournament, initTournamentDB, createTournamentTable, insertTournament, getTournament,
  Team, createTeamTable, insertTeam, getTeams, updateTeams, getTeam,
  Match, createMatchTable, insertMatch, getMatches, updateMatches,
  deleteMatch, deleteMatches,
} from '@/db/tournament';
import { useIsFocused } from "@react-navigation/native";

export default function Winner() {
  const isVisible = useIsFocused();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const path = usePathname();
  const [winningTeam, setfWinningTeam] = useState<String>("");
  const [secondTeam, setSecondTeam] = useState<Team|null>(null);
  const tournamentId = Number(path.replace("/games/tournaments/", "").replace("/setBracket", ""));

  useEffect(() => {
    async function createTables() {
      const db = await initTournamentDB();
      await createTournamentTable(db);
      setTournament(await getTournament(db, tournamentId));
      setTeams(await getTeams(db, tournamentId));
      setMatches(await getMatches(db, tournamentId));
    }

    createTables();
  }, [isVisible]);

  useEffect(() => {
    async function createTables() {
      const db = await initTournamentDB();
      let teams = await getTeams(db, tournamentId)
      let totalRounds = 0;
      if (tournament) {
        let currentTeams = teams.length;
        while (currentTeams > 1) {
          currentTeams /= 2;
          totalRounds++;
        }
        for (let i = 0; i < matches.length; i++) {
          
        }
        console.log("total rounds: " + totalRounds)
      }
    }

    createTables();
  }, [matches]);

  return (
    <View style={styles.container}>
      <Text>winner: {winningTeam}</Text>
      <Link href={"games/tournaments/1"}>
        <View style={styles.box}>
          <View style={styles.boxContent}>
            <Text style={styles.title}>Play Tournament</Text>
          </View>
          <MaterialIcons name="arrow-forward" size={24} color="black" />
        </View>
      </Link>

      <Link href={"games"}>
        <View style={styles.box}>
          <View style={styles.boxContent}>
            <Text style={styles.title}>Home</Text>
          </View>
          <MaterialIcons name="arrow-forward" size={24} color="black" />
        </View>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
