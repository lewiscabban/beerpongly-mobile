import { DarkTheme, DefaultTheme, ThemeProvider, Theme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const navTheme: Theme = {
    dark: false,
    colors: {
      primary: '#F8FAFC',
      background: "#F8FAFC",
      card: '#F8FAFC',
      text: '#F8FAFC',
      border: '#F8FAFC',
      notification: '#F8FAFC'
    }
  };
  const defaultTheme: Theme = {
    dark: false,
    colors: {
      primary: 'rgb(0, 122, 255)',
      background: 'rgb(248, 250, 252)',
      card: 'rgb(255, 255, 255)',
      text: 'rgb(28, 28, 30)',
      border: 'rgb(216, 216, 216)',
      notification: 'rgb(255, 59, 48)',
    },
  };

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "rgb(248, 250, 252)"}}>
        <ThemeProvider value={defaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            {/* <Stack.Screen name="tournament/addTournament" options={{ headerShown: false }} />
            <Stack.Screen name="tournament/[tournament]" options={{ headerShown: false }} /> */}
            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
