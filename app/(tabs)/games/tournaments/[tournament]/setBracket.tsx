import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, FlatList, View, Text } from 'react-native';
import { Link, useGlobalSearchParams, useLocalSearchParams, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { 
  Tournament, initTournamentDB, createTournamentTable, insertTournament, getTournament,
  Team, createTeamTable, insertTeam, getTeams, updateTeams,
} from '@/db/tournament';


export default function SetBracket() {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const path = usePathname();
  const tournamentId = Number(path.replace("/games/tournaments/", "").replace("/setBracket", ""));

  useEffect(() => {
    async function createTables() {
      const db = await initTournamentDB();
      await createTournamentTable(db);
      setTournament(await getTournament(db, tournamentId));
      setTeams(await getTeams(db, tournamentId));
    }

    createTables();
  }, []);

  function shuffle(array: Team[]) {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    for (let i = 0; i < array.length; i++) {
      array[i].position = i+1;
    }
  }


  const renderItem = ({ item }: { item: Team }) => (
    <View style={styles.box}>
      <View style={styles.boxContent}>
        <Text style={styles.title}>position: {item.position} Name: {item.name}</Text>
      </View>
      <MaterialIcons name="arrow-forward" size={24} color="black" />
    </View>
  );

  const handleRandomise = () => {
    async function updateTeamPositions() {
      const db = await initTournamentDB();
      await updateTeams(db, teams);
    }
  
    let randomTeams = [...teams];
    shuffle(randomTeams)
    setTeams(randomTeams)
    updateTeamPositions()
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={teams}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
      />

      <View style={styles.box} onTouchEnd={handleRandomise}>
        <View style={styles.boxContent}>
          <Text style={styles.title}>Randomise</Text>
        </View>
      </View>
      <Link href={"games/tournaments/" + tournamentId}>
        <View style={styles.box}>
          <View style={styles.boxContent}>
            <Text style={styles.title}>Play Game</Text>
          </View>
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
