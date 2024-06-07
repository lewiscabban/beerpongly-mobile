import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Tournament, initTournamentDB, createTournamentTable, insertTournament, getTournaments,
  Team, createTeamTable, insertTeam, getTeams,
} from '@/db/tournament';

interface InputTeam {
  id: number;
  name: string;
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
    teams: [{ id: 1, name: '' }],
    navigation: '',
    progress: ''
  });

  const handleAddTeam = () => {
    const newId = input.teams.length + 1;
    const newTeam: InputTeam = { id: newId, name: '' };
    setInput({ ...input, teams: [...input.teams, newTeam] });
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

  const handleSubmit = async () => {
    try {
      const db = await initTournamentDB()
      await createTournamentTable(db);
      const tournamentId = await insertTournament(db, input.name, input.progress);
      await createTeamTable(db)
      input.teams.map(async (team) => {
        await insertTeam(db, team.name, tournamentId)
      })
      console.log(await getTeams(db, tournamentId))
      console.log('Saved input:', JSON.stringify(input));
    } catch (error) {
      console.error('Failed to save input to AsyncStorage', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.box}>
        <View style={styles.boxContent}>
          <Text style={styles.title}>Set Bracket</Text>
        </View>
        <MaterialIcons name="arrow-forward" size={24} color="black" />
        <Link href="games/tournaments/1/setBracket">
          <View style={styles.linkBox}>
            <Text style={styles.linkText}>Go to Set Bracket</Text>
          </View>
        </Link>
      </View>
      <View style={styles.inputContainer}>
        <Text>Enter Tournament Name:</Text>
        <TextInput
          style={styles.input}
          value={input.name}
          onChangeText={handleNameChange}
        />
      </View>
      {input.teams.map(team => (
        <View key={team.id} style={styles.inputContainer}>
          <Text>Team {team.id}:</Text>
          <TextInput
            style={styles.input}
            value={team.name}
            onChangeText={text => handleTeamChange(team.id, text)}
          />
        </View>
      ))}
      <Button title="Add Team" onPress={handleAddTeam} />
      <Button title="Submit" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  inputContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginLeft: 8,
    marginTop: 5,
    width: 200,
  },
  linkText: {
    fontSize: 16,
    color: 'blue',
  },
  linkBox: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
    width: 100,
    height: 50,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
});
