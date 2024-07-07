import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Pressable, Keyboard, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { Link, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Tournament, initTournamentDB, createTournamentTable, insertTournament, getTournaments,
  Team, createTeamTable, insertTeam, getTeams,
  getTotalRounds,
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
  const [errorTeamName, setErrorTeamName] = useState<Boolean>(false);
  const [errorTeamNameText, setErrorTeamNameText] = useState<string>("");
  const [errorTournamentSizeText, setErrorTournamentSizeText] = useState<string>("");
  const [errorImputTeamsText, setErrorInputTeamsText] = useState<string[]>([""]);

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
    if(newInput.name === "") {
      setErrorTeamNameText("Please enter a name.")
      isComplete = false
    }
    else if(!/^[A-Za-z0-9]*$/.test(newInput.name)) {
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
        console.log("Team " + (i + 1) + " cannot be empty.");
        team.errorText = "Team name cannot be empty."
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
        console.log(await getTeams(db, tournamentId));
        console.log('Saved input:', JSON.stringify(newInput));
        router.push("games/tournaments/" + tournamentId + "/setBracket");
      } catch (error) {
        console.error('Failed to save input to AsyncStorage', error);
      }
    } else {
      if (newInput.teams.length < 4) {
        console.log("minimum teams is 4, got: " + newInput.teams.length);
        setErrorTournamentSizeText("minimum teams is 4, got: " + newInput.teams.length)
      }
      else {
        setErrorTournamentSizeText("")
      }
    }
    setInput(newInput)
  };

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
        <ScrollView style={{ maxHeight: '80%' }}>
          {input.teams.map(team => (
            <View>
              <View key={team.id} style={styles.teamContainer}>
                <TextInput
                  ref={ref => (inputRefs.current[team.id] = ref)}
                  style={team.errorText === "" ? styles.input : styles.inputError}
                  value={team.name}
                  placeholder={'Team ' + team.id}
                  onChangeText={text => handleTeamChange(team.id, text)}
                  onKeyPress={(event: NativeSyntheticEvent<TextInputKeyPressEventData>) =>
                    handleTeamKeyPress(team.id, event)
                  }
                />
                <Pressable style={styles.deleteButton} onPress={() => handleDeleteTeam(team.id)}>
                  <MaterialIcons name="delete" size={24} color="#ff0000" />
                </Pressable>
              </View>
              <Text style={[styles.errorText, team.errorText === "" && {height: 0, paddingBottom: 0}]}>{team.errorText}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
      <View style={styles.addGamesView}>
        <Pressable style={styles.addGamesButton} onPress={handleAddTeam}>
          <MaterialIcons style={styles.gamesIcon} name="add" size={24} color="#211071" />
          <Text style={styles.gamesButtonText}>Add Team</Text>
        </Pressable>
      </View>
      <Text style={[styles.errorText, errorTournamentSizeText === "" && {height: 0, paddingBottom: 0}]}>{errorTournamentSizeText}</Text>
      <View style={styles.buttonStyleContainer}>
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
  gamesIcon: {
    marginLeft: 15,
  },
});
