import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Box {
  id: string;
  title: string;
  body: string;
  navigation: string;
}

interface Input {
  id: number;
  value: string;
  navigation: string;
  progress: string;
}

const data: Box[] = [
  { id: '1', title: 'Tournament 1', body: 'In Progress', navigation: 'tournaments'},
  // { id: '2', title: 'Box 2', body: 'Consectetur adipiscing elit.', },
  // { id: '3', title: 'Box 3', body: 'Sed do eiusmod tempor incididunt.', },
  // { id: '4', title: 'Box 4', body: 'Ut labore et dolore magna aliqua.', },
  // { id: '5', title: 'Box 5', body: 'Ut enim ad minim veniam.', },
];

export default function TabTwoScreen() {
  const [inputs, setInputs] = useState<Input[]>([{ id: 1, value: '', navigation: '', progress: '' }]);

  useEffect(() => {
    const loadInputs = async () => {
      try {
        const storedData = await AsyncStorage.getItem('tournaments');
        if (storedData) {
          const parsedData: string[][] = JSON.parse(storedData);
          const loadedInputs = parsedData.map((list, index) => ({
            id: index + 1,
            value: list.join(', '),
            navigation: "tournaments",
            progress: "In Progress"
          }));
          setInputs(loadedInputs);
        }
      } catch (error) {
        console.error('Failed to load inputs from AsyncStorage', error);
      }
    };

    loadInputs();
  }, []);

  const renderItem = ({ item }: { item: Input }) => (
    <Link href={item.navigation + "/" + item.id}>
      <View style={styles.box}>
        <View style={styles.boxContent}>
          <Text style={styles.title}>{item.navigation}</Text>
          <Text style={styles.body}>{item.progress}</Text>
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
        keyExtractor={(item) => String(item.id)}
      />
      <Link href={"games/tournament/addTournament"}>
        <View style={styles.box}>
          <View style={styles.boxContent}>
            <Text style={styles.title}>Add Game</Text>
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
