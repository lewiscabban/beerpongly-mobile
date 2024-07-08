import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Box {
  id: string;
  title: string;
  body: string;
  navigation: string;
  page: string;
  isReady: boolean;
}

const data: Box[] = [
  { id: '1', title: 'Tournament', body: 'Elemination bracket tournament.', navigation: 'games', page: 'tournaments/addTournament', isReady: true },
  { id: '2', title: 'King of the Table', body: 'Winner stays on!', navigation: 'games', page: 'kingOfTheHill/addKingOfTheHill', isReady: false },
  { id: '3', title: 'Season', body: 'Play a full season', navigation: 'games', page: 'season/addSeason', isReady: false },
];

export default function HomeScreen() {

  function onCreateGame(item: Box) {
    if (item.isReady) {
      router.push(item.navigation + "/" + item.page);
    }
  }

  const renderItem = ({ item }: { item: Box }) => (
    <View style={styles.gamesView}>
      <Pressable style={styles.gamesButton} onPress={() => onCreateGame(item)}>
        <View style={{width: '90%'}}>
          <Text style={styles.gamesTextHeader} >{item.title}</Text>
          <Text style={styles.gamesTextBody}>{item.body}</Text>
          { !item.isReady && <Text style={styles.gamesTextComingSoon}>Coming Soon</Text>}
        </View>
        {
          item.isReady ?
          <MaterialIcons name="arrow-forward" size={24} color="#211071"  />
          :
          <MaterialIcons name="lock" size={24} color="#211071"  />
        }
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderItem({item: { id: '1', title: 'Games', body: 'View existing games.', navigation: 'games', page: '', isReady: true}})}
      <Text style={styles.inputHeader}>Start New Game</Text>
      <FlatList
        style={{height: "100%"}}
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
    padding: 10,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    paddingLeft: 10,
    height: '80%',
    // flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  inputHeader: {
    alignItems: "center",
    paddingLeft: 25,
    paddingVertical: 5,
    fontWeight: 'bold',
    color: '#211071',
  },
  gamesView: {
    left: 0,
    right: 0,
    height: 100,
    width: '100%',
    paddingBottom: 8,
    paddingTop: 8,
  },
  gamesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    marginRight: 15,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    height: 50,
  },
  gamesTextHeader: {
    textAlignVertical: 'center',
    fontSize: 20,
    lineHeight: 21,
    marginLeft: 15,
    marginRight: 15,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: '#211071',
  },
  gamesTextBody: {
    textAlignVertical: 'center',
    fontSize: 16,
    lineHeight: 21,
    marginLeft: 15,
    marginRight: 15,
    fontWeight: 'normal',
    letterSpacing: 0.25,
    color: '#211071',
  },
  gamesTextComingSoon: {
    textAlignVertical: 'center',
    fontSize: 14,
    lineHeight: 21,
    marginLeft: 15,
    marginRight: 15,
    fontWeight: 'normal',
    letterSpacing: 0.25,
    color: '#211071',
  },
});
