import { Stack } from 'expo-router';


export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Games Screen" }} />
      <Stack.Screen name="tournaments/addTournament" options={{ headerShown: false, headerTitle: "Add Tournament", headerBackTitle: "Back" }} />
      <Stack.Screen name="tournaments/[tournament]/index" options={{ headerShown: false, headerTitle: "Tournament", headerBackTitle: "Back" }} />
      <Stack.Screen name="tournaments/[tournament]/match/[match]" options={{ headerShown: false, headerStyle: {backgroundColor: '#F8FAFC'}, headerShadowVisible: false, headerTintColor: "#211071", headerTitle: "", headerBackTitle: "Tournament" }} />
      <Stack.Screen name="tournaments/[tournament]/leaderboard" options={{ headerShown: false, headerTitle: "Leaderboard", headerBackTitle: "Back" }} />
      <Stack.Screen name="tournaments/[tournament]/setBracket" options={{ headerShown: false, headerTitle: "Set Bracket", headerBackTitle: "Back" }} />
      <Stack.Screen name="tournaments/[tournament]/winner" options={{ headerShown: false, headerTitle: "Winner", headerBackTitle: "Back" }} />
    </Stack>
  );
}
