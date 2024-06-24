import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';

interface Box {
  id: string;
  title: string;
  body: string;
  navigation: string;
  page: string;
}

const data: Box[] = [
  { id: '1', title: 'Tournament', body: 'Play a tournament.', navigation: '/games', page: 'addTournament' },
  // { id: '2', title: 'King of the Table', body: 'Consectetur adipiscing elit.', },
  // { id: '3', title: 'Box 3', body: 'Sed do eiusmod tempor incididunt.', },
  // { id: '4', title: 'Box 4', body: 'Ut labore et dolore magna aliqua.', },
  // { id: '5', title: 'Box 5', body: 'Ut enim ad minim veniam.', },
];

export default function HomeScreen() {
  const renderItem = ({ item }: { item: Box }) => (
    <Link href={item.navigation + "/"}>
      <View style={styles.box}>
        <View style={styles.boxContent}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
        </View>
        <MaterialIcons name="arrow-forward" size={24} color="black" />
      </View>
    </Link>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(248, 250, 252)',
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
