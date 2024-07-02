import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, FlatList, View, Text, ScrollView } from 'react-native';
import { Link, usePathname, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { 
  Tournament, initTournamentDB, createTournamentTable, insertTournament, getTournament,
  Team, createTeamTable, insertTeam, getTeams, updateTeams, getTeam,
  Match, createMatchTable, insertMatch, getMatches, updateMatches,
  deleteMatch, deleteMatches, Round,
  Matchup
} from '@/db/tournament';
import { useIsFocused } from "@react-navigation/native";
import { styles } from '@/styles/defaultStyles';


export default function SettingsScreen() {
  const isVisible = useIsFocused();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const path = usePathname();
  const [firstTeam, setfFrstTeam] = useState<Team|null>(null);
  const [secondTeam, setSecondTeam] = useState<Team|null>(null);
  const tournamentId = Number(path.replace("/games/tournaments/", ""));

  console.log("tournamanent id: "+ path.replace("/games/tournaments/", ""))
  function getTeamName(id: number): string {
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      if (team.id == id) {
        return team.name
      }
    }
    return ""
  }

  useEffect(() => {
    async function createTables() {
      const db = await initTournamentDB();
      await createTournamentTable(db);
      setTournament(await getTournament(db, tournamentId));
      setTeams(await getTeams(db, tournamentId));
      setMatches(await getMatches(db, tournamentId));
    }

    createTables();
  }, [isVisible]);
  useEffect(() => {
    let totalRounds = 0
    for (let i = 0; i < matches.length; i++) {
      if (matches[i].round > totalRounds) {totalRounds = matches[i].round}
    }
    let newRounds: Round[] = []
    for (let i = 1; i <= totalRounds; i++) {
      let round: Match[] = []
      for (let j = 0; j < matches.length; j++) {
        const element = matches[j];
        if (element.round == i) {
          round.push(element)
        }
      }
      newRounds.push({"id": i, "matches": round})
      console.log(round)
    }
    setRounds(newRounds)
  }, [matches]);

  function onLeaderboardPress() {
    router.replace("games/tournaments/" + tournamentId + "/leaderboard");
  }

  function onSetBracketPress() {
    router.replace("games/tournaments/" + tournamentId + "/setBracket");
  }

  const renderItem = ({ item }: { item: Match }) => (
    <View style={[styles.box, item.round != 1 && {marginVertical: ((item.round-1)*(item.round)*60)-((item.round-2)*120)-50}]}>
      <View style={styles.matchBoxContent}>
        {/* {getTeamName(item.firstTeam) == "" && 
          <Text style={[styles.matchTitle, {fontWeight: 500, color: '#979797'}]}>BYE</Text>
        } */}
        <Text style={styles.matchTitle}>{getTeamName(item.firstTeam)}</Text>
      </View>
      <View style={styles.matchBr}></View>
      <View style={styles.matchBoxContent}>

        {/* {getTeamName(item.secondTeam) == "" && 
          <Text style={[styles.matchTitle, {fontWeight: 500, color: '#979797'}]}>BYE</Text>
        } */}
        <Text style={styles.matchTitle}>{getTeamName(item.secondTeam)}</Text>
      </View>
      {/* <MaterialIcons name="arrow-forward" size={24} color="black" /> */}
    </View>
  );

  const renderMatchupLinks = ({ item }: { item: Match }) => (
    <View style={[styles.matchLinkBox, item.round != 0 && {height: ((item.round-1)*(item.round)*60)-((item.round-2)*120), marginVertical: ((item.round-1)*(item.round)*30)-((item.round-2)*60)}]}>
      <View style={styles.matchLinkBoxContent1}>
      </View>
      <View style={styles.matchLinkBoxContent2}>
        <View style={[styles.matchBr, {paddingTop: ((item.round-1)*(item.round)*30)-((item.round-2)*60)}]}></View>
      </View>
    </View>
  );

  const renderRound = ({ item }: { item: Round }) => (
    <View style={{flex: 1, flexDirection: 'row'}}>
      {item.id != 1 &&
        <FlatList
          data={item.matches}
          style={{width: 80, }}
          renderItem={renderMatchupLinks}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
        />
      }
      <FlatList
        data={item.matches}
        style={{width: 200}}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={{height: '89%'}}>
        <FlatList
        data={rounds}
        horizontal
        renderItem={renderRound}
        keyExtractor={(item) => String(item.id)}
      />
      </ScrollView>
      
      <View style={styles.buttonStyleContainer}>
        <Pressable style={styles.secondaryButton} onPress={onSetBracketPress}>
          <Text style={styles.secondaryText}>Edit</Text>
        </Pressable>

        <Pressable style={styles.primaryButton} onPress={onLeaderboardPress}>
          <Text style={styles.primaryText}>Leaderboard</Text>
        </Pressable>
      </View>
    </View>
  );
}
