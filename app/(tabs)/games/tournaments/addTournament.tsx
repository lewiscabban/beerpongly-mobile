import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Input {
  id: number;
  value: string;
}

export default function AddTournament() {
  const [inputs, setInputs] = useState<Input[]>([{ id: 1, value: '' }]);

  useEffect(() => {
    const loadInputs = async () => {
      try {
        const storedData = await AsyncStorage.getItem('inputs');
        if (storedData) {
          const parsedData: string[][] = JSON.parse(storedData);
          const loadedInputs = parsedData.map((list, index) => ({
            id: index + 1,
            value: list.join(', '),
          }));
          setInputs(loadedInputs);
        }
      } catch (error) {
        console.error('Failed to load inputs from AsyncStorage', error);
      }
    };

    loadInputs();
  }, []);

  const handleAddInput = () => {
    const newInput: Input = { id: inputs.length + 1, value: '' };
    setInputs([...inputs, newInput]);
  };

  const handleInputChange = (id: number, text: string) => {
    const newInputs = inputs.map(input => {
      if (input.id === id) {
        return { ...input, value: text };
      }
      return input;
    });
    setInputs(newInputs);
  };

  const handleSubmit = async () => {
    try {
      const formattedInputs = inputs.map(input => input.value.split(', '));
      await AsyncStorage.setItem('inputs', JSON.stringify(formattedInputs));
      console.log('Saved inputs:', formattedInputs);
    } catch (error) {
      console.error('Failed to save inputs to AsyncStorage', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.box}>
        <View style={styles.boxContent}>
          <Text style={styles.title}>Set Bracket</Text>
        </View>
        <MaterialIcons name="arrow-forward" size={24} color="black" />
        <Link href={"games/tournaments/1/setBracket"}>
          <View style={styles.linkBox}>
            <Text style={styles.linkText}>Go to Set Bracket</Text>
          </View>
        </Link>
      </View>
      {inputs.map(input => (
        <View key={input.id} style={styles.inputContainer}>
          <Text>Team {input.id}:</Text>
          <TextInput
            style={styles.input}
            value={input.value}
            onChangeText={text => handleInputChange(input.id, text)}
          />
        </View>
      ))}
      <Button title="Add Team" onPress={handleAddInput} />
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginLeft: 8,
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
