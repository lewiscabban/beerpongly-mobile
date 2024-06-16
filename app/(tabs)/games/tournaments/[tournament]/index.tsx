import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, FlatList, View, Text } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { 
  Tournament, initTournamentDB, createTournamentTable, insertTournament, getTournament,
  Team, createTeamTable, insertTeam, getTeams, updateTeams,
  Match, createMatchTable, insertMatch, getMatches, updateMatches,
  deleteMatch, deleteMatches,
} from '@/db/tournament';


export default function SettingsScreen() {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const path = usePathname();
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
  }, []);

  const renderItem = ({ item }: { item: Match }) => (
    <Link href={"games/tournaments/" + tournamentId + "/" + item.id}>
      <View style={styles.box}>
        <View style={styles.boxContent}>
          <Text style={styles.title}>T1: {item.firstTeam} Cups: {item.firstTeamCups}</Text>
          <Text style={styles.title}>T2: {item.secondTeam} Cups: {item.secondTeamCups}</Text>
        </View>
        <MaterialIcons name="arrow-forward" size={24} color="black" />
      </View>
    </Link>
  );

  return (
    <View style={styles.container}>
    <FlatList
      data={matches}
      renderItem={renderItem}
      keyExtractor={(item) => String(item.id)}
    />
      {/* <Link href={"games/tournaments/" + tournamentId + "/1"}>
        <View style={styles.box}>
          <View style={styles.boxContent}>
            <Text style={styles.title}>Play Match</Text>
          </View>
          <MaterialIcons name="arrow-forward" size={24} color="black" />
        </View>
      </Link> */}

      <Link href={"games/tournaments/" + tournamentId + "/setBracket"}>
        <View style={styles.box}>
          <View style={styles.boxContent}>
            <Text style={styles.title}>Edit Tournament</Text>
          </View>
          <MaterialIcons name="arrow-forward" size={24} color="black" />
        </View>
      </Link>

      <Link href={"games/tournaments/" + tournamentId + "/winner"}>
        <View style={styles.box}>
          <View style={styles.boxContent}>
            <Text style={styles.title}>Winners</Text>
          </View>
          <MaterialIcons name="arrow-forward" size={24} color="black" />
        </View>
      </Link>

      <Link href={"games/tournaments/" + tournamentId + "/leaderboard"}>
        <View style={styles.box}>
          <View style={styles.boxContent}>
            <Text style={styles.title}>Leaderboard</Text>
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
