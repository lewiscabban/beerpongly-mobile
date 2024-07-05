import { Image, Pressable, View, Text, FlatList, ScrollView } from 'react-native';
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
import { styles } from '@/styles/defaultStyles';

interface Leaderboard {
  id: number
  name: string
  cups: number
  wins: number
  losses: number
  header: boolean
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
        let currentLeaderboard: Leaderboard = {id: i+1, name: team.name, cups: 0, wins: 0, losses: 0, header: false}
        for (let j = 0; j < matches.length; j++) {
          const match = matches[j];
          if (match.firstTeam == team.id) {
            currentLeaderboard.cups += match.firstTeamCups
          }
          if (match.secondTeam == team.id) {
            currentLeaderboard.cups += match.secondTeamCups
          }
          if (match.firstTeam == team.id || match.secondTeam == team.id) {
            if (!match.winner) {
              //match has not been played yet
            }
            else if (match.winner == team.id) {
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
    newLeaderboard.unshift({id: 0, name: "this is the title team", cups: 0, wins: 0, losses: 0, header: true})
    for (let i = 0; i < newLeaderboard.length; i++) {
      newLeaderboard[i].id = i;
    }
    setLeaderboards(newLeaderboard)
  }, [teams || matches]);

  function onTournamentPress() {
    router.replace("games/tournaments/" + tournamentId);
  }

  function onSetBracketPress() {
    router.replace("games/tournaments/" + tournamentId + "/setBracket");
  }

  const renderItem = ({ item }: { item: Leaderboard }) => (
    <View>
      
      {item.id == 0 && 
        <View style={[styles.leaderboardBox, {borderTopWidth: 1, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: '#E5EDFF'}]}>
          <View style={styles.boxContent}>
            <Text style={styles.leaderboardTitle}>Team</Text>
            <Text style={styles.leaderboardTitle}>Wins</Text>
            <Text style={styles.leaderboardTitle}>Losses</Text>
            <Text style={styles.leaderboardTitle}>Cups</Text>
          </View>
        </View>
      }
      {item.id != 0 && item.id != leaderboard.length-1 &&
        <View style={styles.leaderboardBox}>
          <View style={styles.boxContent}>
            <Text style={styles.leaderboardTitle}>{item.name}</Text>
            <Text style={styles.leaderboardTitle}>{item.wins}</Text>
            <Text style={styles.leaderboardTitle}>{item.losses}</Text>
            <Text style={styles.leaderboardTitle}>{item.cups}</Text>
          </View>
        </View>
      }
      {item.id == leaderboard.length-1 && 
        <View style={[styles.leaderboardBox, {borderBottomLeftRadius: 8, borderBottomRightRadius: 8,}]}>
          <View style={styles.boxContent}>
            <Text style={styles.leaderboardTitle}>{item.name}</Text>
            <Text style={styles.leaderboardTitle}>{item.wins}</Text>
            <Text style={styles.leaderboardTitle}>{item.losses}</Text>
            <Text style={styles.leaderboardTitle}>{item.cups}</Text>
          </View>
        </View>
      }
    </View>
  );

  return (
    <View style={styles.leaderboardContainer}>
      <ScrollView
        style={{height: '87%'}}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.matchScroll}>
          <FlatList
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            data={leaderboard}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
          />
        </View>
      </ScrollView>

      <View style={styles.buttonStyleContainer}>
        <View style={styles.buttonInnerContainer}>
        <Pressable style={styles.secondaryButton} onPress={onSetBracketPress}>
          <Text style={styles.secondaryText}>Edit</Text>
        </Pressable>

        <Pressable style={styles.primaryButton} onPress={onTournamentPress}>
          <Text style={styles.primaryText}>Tournament</Text>
        </Pressable>
        </View>
      </View>
    </View>
  );
}
