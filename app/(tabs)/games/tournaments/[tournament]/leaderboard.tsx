import { Image, StyleSheet, View, Text, FlatList } from 'react-native';
import { router, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { 
  Tournament, initTournamentDB, createTournamentTable, insertTournament, getTournament,
  Team, createTeamTable, insertTeam, getTeams, updateTeams, getTeam,
  Match, createMatchTable, insertMatch, getMatches, updateMatches, getMatch,
  deleteMatch, deleteMatches,
  updateMatch,
  updateTournament
} from '@/db/tournament';
import { useEffect, useState } from 'react';
import { useIsFocused } from "@react-navigation/native";

interface Leaderboard {
  id: number
  name: string
  cups: number
  wins: number
  losses: number
}


export default function SetBracket() {
  const isVisible = useIsFocused();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leaderboard, setLeaderboards] = useState<Leaderboard[]>([]);
  const path = usePathname();
  const tournamentId = Number(path.replace("/games/tournaments/", "").replace("/leaderboard", ""));

  useEffect(() => {
    async function createTables() {
      const db = await initTournamentDB();
      await createTournamentTable(db);
      await createMatchTable(db);
      await createTeamTable(db);
      setTournament(await getTournament(db, tournamentId));
      setMatches(await getMatches(db, tournamentId));
      setTeams(await getTeams(db, tournamentId));
    }

    createTables();
  }, [isVisible]);

  useEffect(() => {
    let newLeaderboard: Leaderboard[] = []
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      if (team.name != "") {
        let currentLeaderboard: Leaderboard = {id: i, name: team.name, cups: 0, wins: 0, losses: 0}
        for (let j = 0; j < matches.length; j++) {
          const match = matches[j];
          if (match.firstTeam == team.id) {
            currentLeaderboard.cups += match.firstTeamCups
          }
          if (match.secondTeam == team.id) {
            currentLeaderboard.cups += match.secondTeamCups
          }
          if (match.firstTeam == team.id || match.secondTeam == team.id) {
            if (match.winner == team.id) {
              currentLeaderboard.wins += 1
            } else {
              currentLeaderboard.losses += 1
            }
          }
        }
        newLeaderboard.push(currentLeaderboard)
      }
    }
    newLeaderboard = newLeaderboard.sort((n1,n2) => {
      if (n1.cups < n2.cups) {
          return 1;
      }
  
      if (n1.cups > n2.cups) {
          return -1;
      }
  
      return 0;
    })
    newLeaderboard = newLeaderboard.sort((n1,n2) => {
      if (n1.wins < n2.wins) {
          return 1;
      }
  
      if (n1.wins > n2.wins) {
          return -1;
      }
  
      return 0;
    })
    setLeaderboards(newLeaderboard)
  }, [teams || matches]);

  const renderItem = ({ item }: { item: Leaderboard }) => (
    <View style={styles.box}>
      <View style={styles.boxContent}>
        <Text style={styles.title}>Name: {item.name} Cups: {item.cups}</Text>
        <Text style={styles.title}>Wins: {item.wins} Losses: {item.losses}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={leaderboard}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
      />
      <Link href={"games/tournaments/" + tournamentId}>
        <View style={styles.box}>
          <View style={styles.boxContent}>
            <Text style={styles.title}>Play Tournament</Text>
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
