import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {backgroundColor: 'rgb(248, 250, 252)'},
        tabBarStyle: {backgroundColor: 'rgb(248, 250, 252)', borderTopWidth: 0, paddingBottom: 0, height: 50},
        tabBarActiveTintColor: '#211071',
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: true,
          title: 'Home',
          headerStatusBarHeight: 0,
          headerShadowVisible: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: 'Games',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'game-controller-outline' : 'code-slash-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
