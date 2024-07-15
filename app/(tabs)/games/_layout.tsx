import { Stack } from 'expo-router';
import { Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type TrailScreenProps = NativeStackScreenProps<{}>;


export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: "Games",
          headerStyle: {backgroundColor: '#F8FAFC'},
          headerShadowVisible: false,
          headerTintColor: "#211071",
          headerBackVisible: false
        }}
      />
      <Stack.Screen
        name="tournaments/addTournament"
        options={{
          headerShown: true,
          headerTitle: "Add Tournament",
          headerBackTitle: "Back",
          headerStyle: {backgroundColor: '#F8FAFC'},
          headerShadowVisible: false,
          headerTintColor: "#211071",
          headerBackVisible: false
        }}
      />
      <Stack.Screen
        name="tournaments/[tournament]/index"
        options={{
          headerShown: true,
          headerTitle: "Tournament",
          headerBackVisible: false,
          headerStyle: {backgroundColor: '#F8FAFC'},
          headerShadowVisible: false,
          headerTintColor: "#211071",
        }}
      />
      <Stack.Screen
        name="tournaments/[tournament]/match/[match]"
        options={{
          headerShown: true,
          headerStyle: {backgroundColor: '#F8FAFC'},
          headerShadowVisible: false,
          headerTintColor: "#211071",
          headerTitle: "Match",
          headerBackVisible: false,
          headerBackTitle: "Back"
        }}
      />
      <Stack.Screen
        name="tournaments/[tournament]/edit"
          options={{
          headerShown: true,
          headerTitle: "Edit",
          headerBackTitle: "Back",
          headerStyle: {backgroundColor: '#F8FAFC'},
          headerShadowVisible: false,
          headerTintColor: "#211071",
          headerBackVisible: false
        }}
      />
      <Stack.Screen
        name="tournaments/[tournament]/leaderboard"
        options={{
          headerShown: true,
          headerTitle: "Leaderboard",
          headerBackTitle: "Back",
          headerStyle: {backgroundColor: '#F8FAFC'},
          headerShadowVisible: false,
          headerTintColor: "#211071",
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="tournaments/[tournament]/setBracket"
          options={{
          headerShown: true,
          headerTitle: "Set Bracket",
          headerBackTitle: "Back",
          headerStyle: {backgroundColor: '#F8FAFC'},
          headerShadowVisible: false,
          headerTintColor: "#211071",
          headerBackVisible: false
        }}
      />
    </Stack>
  );
}
