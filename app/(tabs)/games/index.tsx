import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Pressable, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { 
  Tournament, initTournamentDB, createTournamentTable, insertTournament, getTournaments, getTournament, deleteTournament,
  Team, createTeamTable, insertTeam, getTeams, updateTeams, getTeam, deleteTeams,
  Match, createMatchTable, insertMatch, getMatches, updateMatches, getMatch,
  deleteMatch, deleteMatches,
  updateMatch,
  updateTournament
} from '@/db/tournament';
import { useIsFocused } from "@react-navigation/native";
import { styles } from '@/styles/defaultStyles';


export default function TabTwoScreen() {
  const [inputs, setInputs] = useState<Tournament[]>([]);
  const isVisible = useIsFocused();
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    async function createTables() {
      const db = await initTournamentDB()
      await createTournamentTable(db);
      setInputs(await getTournaments(db));
    }

    createTables();
  }, [isVisible]);

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

  const deleteGameAlert = (item: Tournament) => {
    async function runAsync(item: Tournament) {
        console.log("test!")
        Alert.alert('Deleting ' + item.name, 'Are you sure you want to delete this game?', [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {text: 'OK', onPress: () => delTournament(item)},
        ]);
      }

    runAsync(item);
  };

  const test = (item: Tournament) => {
    setModalVisible(true)
  };

  function onAddGame() {
    router.push("games/tournaments/addTournament")
  }

  function onGamesPress(item: Tournament) {
    router.push("games/tournaments/" + item.id)
  }
  
  function getProgress(item: Tournament): string {
    if (item.progress != "") {
      console.log(item)
      return "In Progress"
    } 
    return "New"
  }
  const renderProgress = ({ item }: { item: Tournament }) => (
    <View>
      {}
      <Text >{getProgress(item)}</Text>
    </View>
  )

  const renderItem = ({ item }: { item: Tournament }) => (
    <View style={styles.gamesView}>
      <Pressable style={styles.gamesButton} onPress={() => onGamesPress(item)}>
        <View style={{width: '60%'}}>
          <Text style={styles.gamesButtonText} >{item.name}</Text>
        </View>
        <View style={{width: '30%'}}>
          <View style={{}}>
            <Text >Tournament</Text>
            {/* {renderProgress({item})} */}
          </View>
        </View>
        <Pressable onPress={() => deleteGameAlert(item)}>
          <MaterialIcons name="delete-outline" size={24} color="#211071"  />
        </Pressable>
      </Pressable>
    </View>
        
  );

  return (
    <View style={styles.gamesContainer}>
      <FlatList
        style={{flexGrow: 0, marginBottom: 0, paddingBottom: 0}}
        data={inputs}
        renderItem={renderItem}
        keyExtractor={(item, index) => String(index)}
      />

      <View style={styles.addGamesView}>
        <Pressable style={styles.addGamesButton} onPress={onAddGame}>
          <MaterialIcons style={styles.gamesIcon} name="add" size={24} color="#211071" />
          <Text style={styles.gamesButtonText} >Add Tournament</Text>
        </Pressable>
      </View>
    </View>
  );
}

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

const gamesStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
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
