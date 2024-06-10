import { Image, StyleSheet, View, Text } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';


export default function SettingsScreen() {
  const path = usePathname();
  const tournamentId = Number(path.replace("/games/tournaments/", "").replace("/setBracket", ""));

  return (
    <View style={styles.container}>
      <Link href={"games/tournaments/" + tournamentId + "/1"}>
        <View style={styles.box}>
          <View style={styles.boxContent}>
            <Text style={styles.title}>Play Match</Text>
          </View>
          <MaterialIcons name="arrow-forward" size={24} color="black" />
        </View>
      </Link>

      <Link href={"games/tournaments/" + tournamentId + "/setBracket"}>
        <View style={styles.box}>
          <View style={styles.boxContent}>
            <Text style={styles.title}>Edit Tournament</Text>
          </View>
          <MaterialIcons name="arrow-forward" size={24} color="black" />
        </View>
      </Link>

      <Link href={"games/tournaments/" + tournamentId + "/winner"}>
        <View style={styles.box}>
          <View style={styles.boxContent}>
            <Text style={styles.title}>Winners</Text>
          </View>
          <MaterialIcons name="arrow-forward" size={24} color="black" />
        </View>
      </Link>

      <Link href={"games/tournaments/" + tournamentId + "/leaderboard"}>
        <View style={styles.box}>
          <View style={styles.boxContent}>
            <Text style={styles.title}>Leaderboard</Text>
          </View>
          <MaterialIcons name="arrow-forward" size={24} color="black" />
        </View>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  body: {
    fontSize: 14,
  },
});
