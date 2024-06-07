import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Tournament, initTournamentDB, createTournamentTable, getTournaments } from '@/db/tournament';


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

  const renderItem = ({ item }: { item: Tournament }) => (
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
