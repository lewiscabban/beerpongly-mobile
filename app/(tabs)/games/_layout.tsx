import { Stack } from 'expo-router';


export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Games Screen" }} />
      <Stack.Screen name="tournaments/addTournament" options={{ headerTitle: "Add Tournament", headerBackTitle: "Back" }} />
      <Stack.Screen name="tournaments/[tournament]/index" options={{ headerTitle: "Tournament", headerBackTitle: "Back" }} />
      <Stack.Screen name="tournaments/[tournament]/[match]" options={{ headerTitle: "Match", headerBackTitle: "Back" }} />
      <Stack.Screen name="tournaments/[tournament]/leaderboard" options={{ headerTitle: "Leaderboard", headerBackTitle: "Back" }} />
      <Stack.Screen name="tournaments/[tournament]/setBracket" options={{ headerTitle: "Set Bracket", headerBackTitle: "Back" }} />
      <Stack.Screen name="tournaments/[tournament]/winner" options={{ headerTitle: "Winner", headerBackTitle: "Back" }} />
    </Stack>
  );
}
