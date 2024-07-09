import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput,
  StyleSheet, Pressable, NativeSyntheticEvent,
  TextInputKeyPressEventData, FlatList
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { 
  initTournamentDB, createTournamentTable, insertTournament,
  createTeamTable, insertTeam,
} from '@/db/tournament';

interface InputTeam {
  id: number;
  name: string;
  errorText: string;
}

interface Input {
  name: string;
  teams: InputTeam[];
  navigation: string;
  progress: string;
}

export default function AddTournament() {
  const [input, setInput] = useState<Input>({
    name: '',
    teams: [{id: 1, name: '', errorText: ''}],
    navigation: '',
    progress: ''
  });
  const [errorTeamNameText, setErrorTeamNameText] = useState<string>("");
  const [errorTournamentSizeText, setErrorTournamentSizeText] = useState<string>("");

  const inputRefs = useRef<{ [key: number]: TextInput | null }>({});

  const handleAddTeam = () => {
    const newId = input.teams.length + 1;
    const newTeam: InputTeam = { id: newId, name: '', errorText: '' };
    setInput(prevInput => {
      const newTeams = [...prevInput.teams, newTeam];
      return { ...prevInput, teams: newTeams };
    });
    setTimeout(() => {
      inputRefs.current[newId]?.focus();
    }, 0);
  };

  const handleTeamChange = (teamId: number, text: string) => {
    const newTeams = input.teams.map(team => {
      if (team.id === teamId) {
        return { ...team, name: text };
      }
      return team;
    });
    setInput({ ...input, teams: newTeams });
  };

  const handleNameChange = (text: string) => {
    setInput({ ...input, name: text });
  };

  const handleDeleteTeam = (teamId: number) => {
    let newTeams = input.teams.filter(team => team.id !== teamId);
    newTeams = newTeams.map((team, index) => ({ ...team, id: index + 1 }));
    setInput({ ...input, teams: newTeams });
  };

  const handleTeamKeyPress = (teamId: number, event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (event.nativeEvent.key === 'Enter') {
      handleAddTeam();
    }
  };

  const handleSubmit = async () => {
    let newInput = {...input}
    let isComplete: boolean = true;
    const regex = /^[A-Za-z0-9_ .'-]*$/;
    if(newInput.name === "") {
      setErrorTeamNameText("Please enter a name.")
      isComplete = false
    }
    else if(!regex.test(newInput.name)) {
      setErrorTeamNameText("Name can only be digits or letters.")
      isComplete = false
    }
    else {
      setErrorTeamNameText("")
    }
    for (let i = 0; i < newInput.teams.length; i++) {
      const team = newInput.teams[i];
      if (team.name === "") {
        isComplete = false;
        team.errorText = "Team name cannot be empty."
      }
      else if(!regex.test(team.name)) {
        team.errorText = "Team name can only be digits or letters."
        isComplete = false
      }
      else {
        team.errorText = ""
      }
    }

    if (newInput.teams.length >= 4 && isComplete && newInput.name !== "") {
      try {
        const db = await initTournamentDB();
        await createTournamentTable(db);
        const tournamentId = await insertTournament(db, newInput.name, newInput.progress);
        await createTeamTable(db);
        let currentTeams = newInput.teams.length;
        let totalRounds = 0;
        while (currentTeams > 1) {
          currentTeams /= 2;
          totalRounds++;
        }

        for (let i = 0; i < Math.pow(2, totalRounds); i++) {
          if (newInput.teams[i]) {
            const team = newInput.teams[i];
            await insertTeam(db, team.name, i + 1, tournamentId);
          } else {
            await insertTeam(db, "", i + 1, tournamentId);
          }
        }
        setInput({
          name: '',
          teams: [{id: 1, name: '', errorText: ''}],
          navigation: '',
          progress: ''
        })
        router.replace("games/tournaments/" + tournamentId + "/setBracket");
      } catch (error) {
      }
    } else {
      if (newInput.teams.length < 4) {
        setErrorTournamentSizeText("minimum teams is 4, got: " + newInput.teams.length)
      }
      else {
        setErrorTournamentSizeText("")
      }
    }
    setInput(newInput)
  };

  const handelCancel = () => {
    router.back();
  }

  const renderItem = ({ item }: { item: InputTeam }) => (
    <View>
      <View key={item.id} style={styles.teamContainer}>
        <TextInput
          ref={ref => (inputRefs.current[item.id] = ref)}
          style={item.errorText === "" ? styles.input : styles.inputError}
          value={item.name}
          placeholder={'Team ' + item.id}
          onChangeText={text => handleTeamChange(item.id, text)}
          onKeyPress={(event: NativeSyntheticEvent<TextInputKeyPressEventData>) =>
            handleTeamKeyPress(item.id, event)
          }
        />
        <Pressable style={styles.deleteButton} onPress={() => handleDeleteTeam(item.id)}>
          <MaterialIcons name="delete-outline" size={24} color="#ff0000" />
        </Pressable>
      </View>
      <Text style={[styles.errorText, item.errorText === "" && {height: 0, paddingBottom: 0}]}>{item.errorText}</Text>
    </View>
        
  );

  return (
    <View style={styles.gamesContainer}>
      <View style={{ maxHeight: '80%' }}>
        <View style={styles.gamesView}>
          <Text style={styles.inputHeader}>Enter Tournament Name:</Text>
          <View style={styles.inputView}>
            <TextInput
              style={errorTeamNameText === "" ? styles.input : styles.inputError}
              value={input.name}
              placeholder='Tournament Name'
              onChangeText={handleNameChange}
            />
          </View>
        </View>
        <Text style={[styles.errorText, errorTeamNameText === "" && {height: 0, paddingBottom: 0}]}>{errorTeamNameText}</Text>
        <Text style={styles.inputHeader}>Add Teams:</Text>
        <FlatList
          style={{ maxHeight: '80%' }}
          data={input.teams}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
        />
      </View>
      <View style={styles.addGamesView}>
        <Pressable style={styles.addGamesButton} onPress={handleAddTeam}>
          <MaterialIcons style={styles.gamesIcon} name="add" size={24} color="#211071" />
          <Text style={styles.gamesButtonText}>Add Team</Text>
        </Pressable>
      </View>
      <Text style={[styles.errorText, errorTournamentSizeText === "" && {height: 0, paddingBottom: 0}]}>{errorTournamentSizeText}</Text>
      <View style={styles.buttonStyleContainer}>
        <Pressable style={styles.cancelButton} onPress={handelCancel}>
          <MaterialIcons name="arrow-back" size={24} color="#211071" />
        </Pressable>
        <Pressable style={styles.singleButton} onPress={handleSubmit}>
          <Text style={styles.primaryText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  input: {
    flex: 1,
    marginLeft: 15,
    marginRight: 15,
    paddingLeft: 9,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    height: 40,
  },
  inputError: {
    flex: 1,
    marginLeft: 15,
    marginRight: 15,
    paddingLeft: 9,
    borderRadius: 8,
    borderColor: 'red',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    height: 40,
  },
  inputHeader: {
    alignItems: "center",
    paddingLeft: 25,
    paddingBottom: 5,
    fontWeight: 'bold',
    color: '#211071',
  },
  errorText: {
    alignItems: "center",
    paddingLeft: 25,
    fontWeight: 'bold',
    color: 'red',
    paddingBottom: 10,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    padding: 10,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  singleButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginLeft: 15,
    marginRight: 15,
    borderRadius: 8,
    elevation: 3,
    backgroundColor: '#211071',
    height: 50,
  },
  primaryText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  buttonStyleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    // paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop: 15,
    backgroundColor: '#F8FAFC',
  },
  gamesContainer: {
    height: '100%'
  },
  inputView: {
    height: 40,
    width: '100%',
  },
  gamesView: {
    left: 0,
    right: 0,
    height: 80,
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
  addGamesView: {
    left: 0,
    right: 0,
    height: 80,
    width: '100%',
    paddingBottom: 15,
  },
  addGamesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    marginRight: 15,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    height: 50,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginLeft: 7.5,
    marginRight: 7.5,
    borderRadius: 8,
    elevation: 3,
    maxWidth: 50,
    backgroundColor: '#F8FAFC',
    height: 50,
  },
  gamesIcon: {
    marginLeft: 15,
  },
});
