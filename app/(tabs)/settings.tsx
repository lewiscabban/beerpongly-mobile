import { Image, StyleSheet, View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function SettingsScreen() {
  return (
    <View style={{ flex: 1 }}>
      {/* Other content */}
      <Text>Settings</Text>
      {/* Other content */}
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
