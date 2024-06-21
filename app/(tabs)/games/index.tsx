import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { 
  Tournament, initTournamentDB, createTournamentTable, insertTournament, getTournaments, getTournament, deleteTournament,
  Team, createTeamTable, insertTeam, getTeams, updateTeams, getTeam, deleteTeams,
  Match, createMatchTable, insertMatch, getMatches, updateMatches, getMatch,
  deleteMatch, deleteMatches,
  updateMatch,
  updateTournament
} from '@/db/tournament';


export default function TabTwoScreen() {
  const [inputs, setInputs] = useState<Tournament[]>([]);

  useEffect(() => {
    async function createTables() {
      const db = await initTournamentDB()
      await createTournamentTable(db);
      setInputs(await getTournaments(db));
    }

    createTables();
  }, []);

  useEffect(() => {
    console.log("inputs: " + inputs.length)
  }, [inputs])

  const delTournament = (item: Tournament) => {
    async function runAsync(item: Tournament) {
        const db = await initTournamentDB()
        await createTournamentTable(db);
        await createTeamTable(db);
        await createMatchTable(db);
        let tournament = await getTournament(db, item.id);
        let teams = await getTeams(db, item.id);
        let matches = await getMatches(db, item.id);
        deleteMatches(db, matches);
        deleteTeams(db, teams);
        if (tournament) {
          deleteTournament(db, tournament)
        }
        setInputs(await getTournaments(db));
      }

    runAsync(item);
  };

  const renderItem = ({ item }: { item: Tournament }) => (
    <View>
      <Link href={"games/tournaments/" + item.id}>
        <View style={styles.box}>
            <View style={styles.boxContent}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.body}>{item.progress}</Text>
              <Text style={styles.body}>{item.id}</Text>
            </View>
            <MaterialIcons name="arrow-forward" size={24} color="black" />
          
        
        </View>
      </Link>
      <View>
      <Button
        onPress={() => delTournament(item)}
        title="Delete"
        color="#841584"
        accessibilityLabel="Learn more about this purple button"
      />
      </View>
    </View>
        
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={inputs}
        renderItem={renderItem}
        keyExtractor={(item, index) => String(index)}
      />
      <Link href={"games/tournaments/addTournament"}>
        <View style={styles.box}>
          <View style={styles.boxContent}>
            <Text style={styles.title}>Add Tournament</Text>
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
    padding: 16,
    backgroundColor: '#fff',
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
