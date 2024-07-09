import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  Pressable, Modal, TouchableOpacity
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { 
  Tournament, initTournamentDB, createTournamentTable,
  getTournaments, getTournament, deleteTournament,
  createTeamTable, getTeams, deleteTeams,
  createMatchTable, getMatches, deleteMatches,
} from '@/db/tournament';
import { useIsFocused } from "@react-navigation/native";


export default function TabTwoScreen() {
  const [inputs, setInputs] = useState<Tournament[]>([]);
  const [modalTournament, setModalTournament] = useState<Tournament|null>(null);
  const isVisible = useIsFocused();

  useEffect(() => {
    async function createTables() {
      const db = await initTournamentDB()
      await createTournamentTable(db);
      setInputs(await getTournaments(db));
    }

    createTables();
  }, [isVisible]);

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

  const deleteGameModal = (item: Tournament | null) => {
    if (item) {
      delTournament(item);
    }
    setModalTournament(null);
  };

  const editGameModal = (item: Tournament | null) => {
    if (item) {
      router.push("games/tournaments/" + item.id + "/setBracket")
    }
    setModalTournament(null);
  };

  function onAddGame() {
    router.push("games/tournaments/addTournament")
  }

  function onGamesPress(item: Tournament) {
    router.push("games/tournaments/" + item.id)
  }

  const renderItem = ({ item }: { item: Tournament }) => (
    <View style={styles.gamesView}>
      <Pressable style={styles.gamesButton} onPress={() => onGamesPress(item)}>
        <View style={{width: '60%'}}>
          <Text style={styles.gamesButtonText} >{item.name}</Text>
        </View>
        <View style={{width: '30%'}}>
          <View style={{}}>
            <Text >Tournament</Text>
            {/* commented out until i can be bothered implementing the progress view */}
            {/* {renderProgress({item})} */}
          </View>
        </View>
        <Pressable
          onPress={() => setModalTournament(item)}>
          <MaterialIcons name="more-vert" size={24} color="#211071"  />
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
          <Text style={styles.gamesButtonText} >Add Game</Text>
        </Pressable>
      </View>
      <Modal
        transparent={true}
        visible={modalTournament != null}
        onRequestClose={() => {setModalTournament(null);}}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          onPress={() => setModalTournament(null)}
        >
          <TouchableOpacity style={styles.modal} activeOpacity={1} >      
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View style={styles.modalTitleView}> 
                  <Pressable
                    style={{}}
                    onPress={() => setModalTournament(null)}>
                    <MaterialIcons name="close" size={24} color="#211071"  />
                  </Pressable>
                </View>
                <View style={styles.modalContentView}>
                  <Text style={styles.modalTextHeader}>{modalTournament?.name}</Text>
                  
                  <Text style={styles.modalText}>Edit Tournament</Text>
                  <Pressable
                    style={[styles.button, styles.buttonCancel]}
                    onPress={() => editGameModal(modalTournament)}>
                    <Text style={styles.textStyle}>Edit</Text>
                  </Pressable>
                  <Text style={styles.modalText}>Deleting Tournament</Text>
                  <Pressable
                    style={[styles.button, styles.buttonClose]}
                    onPress={() => deleteGameModal(modalTournament)}>
                    <Text style={styles.textStyle}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    height: 200
  },
  modalTitleView: {
    width: '100%',
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
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
  modalContentView: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 15,
  },
  button: {
    borderRadius: 8,
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
    height: 40,
    width: 120,
    marginLeft: 10,
    marginRight: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonEdit: {
    backgroundColor: '#211071',
  },
  buttonCancel: {
    backgroundColor: '#2196F3',
  },
  buttonClose: {
    backgroundColor: 'red',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 5,
    marginTop: 5,
    textAlign: 'center',
  },
  modalTextHeader: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 150,
  },
  gamesContainer: {
    height: '100%'
  },
  addGamesView: {
    left: 0,
    right: 0,
    height: 80,
    width: '100%',
    paddingBottom: 15,
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
  gamesButtonText: {
    textAlignVertical: 'center',
    fontSize: 16,
    lineHeight: 21,
    marginLeft: 15,
    marginRight: 15,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: '#211071',
  },
  gamesIcon: {
    marginLeft: 15,
  },
  addGamesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    marginRight: 15,
    borderRadius: 8,
    height: 50,
  },
  gamesView: {
    left: 0,
    right: 0,
    height: 80,
    width: '100%',
    paddingBottom: 8,
    paddingTop: 8,
  },
});
